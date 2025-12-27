import { Queue, Worker } from "bullmq";
import { and, eq, inArray, lt } from "drizzle-orm";
import {
	usersBulkActionsControllerBulkResetUserTraffic,
	usersBulkActionsControllerBulkUpdateUsers,
	usersBulkActionsControllerBulkUpdateUsersInternalSquads,
} from "@/api/remnawave/generated";
import { connection } from "@/config/redis";
import { DataLimitBySqualLevel, SquadByLevel } from "@/config/remna";
import { db } from "@/db";
import { Level, users } from "@/db/schema";
import { logger } from "@/logger";

const key = "downgrade-expired-users";

const queue = new Queue(key, { connection });

await queue.upsertJobScheduler(
	"repeat-every-hour",
	{ every: 3_600_000 },
	{ name: key },
);

export const getUsersToDowngrade = async () => {
	return await db.query.users.findMany({
		where: and(
			eq(users.level, Level.PAID),
			lt(users.levelExpireDate, new Date()),
		),
	});
};

const worker = new Worker(
	key,
	async () => {
		const usersToDowngrade = await getUsersToDowngrade();

		const UUIDs = usersToDowngrade.reduce((acc, user) => {
			if (user.subscriptionUUID) {
				acc.push(user.subscriptionUUID);
			}

			return acc;
		}, [] as string[]);

		if (!UUIDs.length) return 0;

		await usersBulkActionsControllerBulkResetUserTraffic({
			body: { uuids: UUIDs },
		});

		const dataLimit = DataLimitBySqualLevel[Level.FREE];
		const squadUUID = SquadByLevel[Level.FREE];

		await usersBulkActionsControllerBulkUpdateUsersInternalSquads({
			body: {
				uuids: UUIDs,
				activeInternalSquads: [squadUUID],
			},
		});

		await usersBulkActionsControllerBulkUpdateUsers({
			body: {
				uuids: UUIDs,
				fields: {
					trafficLimitBytes: dataLimit * 1024 ** 3,
					expireAt: new Date("2099").toISOString(),
				},
			},
		});

		const downgradedUsers = await db
			.update(users)
			.set({ level: Level.FREE, levelExpireDate: new Date("2099") })
			.where(inArray(users.subscriptionUUID, UUIDs))
			.returning();

		return downgradedUsers.length;
	},
	{ connection },
);

worker.on("completed", (_, result) => {
	if (!result) return;

	logger.info(`[${key}] Job completed. ${result} users was downgraded`);
});
