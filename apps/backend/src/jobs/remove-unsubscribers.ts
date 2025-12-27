import { DisabledReason, SubscriptionStatus } from "@sub/shared";
import { Queue, Worker } from "bullmq";
import { and, eq, inArray, isNotNull, lt } from "drizzle-orm";
import { Temporal } from "temporal-polyfill";
import { usersBulkActionsControllerBulkDeleteUsers } from "@/api/remnawave/generated";
import { connection } from "@/config/redis";
import { db } from "@/db";
import { users } from "@/db/schema";
import { logger } from "@/logger";

const key = "remove-unsubscribers";

const queue = new Queue(key, { connection });

await queue.upsertJobScheduler(
	"repeat-every-hour",
	{ every: 3_600_000 },
	{ name: key },
);

export const getUsersToRemoveSubscription = async () => {
	const thirtyDaysAgo = Temporal.Now.plainDateISO().subtract({ days: 30 });

	return await db.query.users.findMany({
		where: and(
			eq(users.subscriptionStatus, SubscriptionStatus.DISABLED),
			eq(users.disabledReason, DisabledReason.UNSUBSCRIBED),
			lt(users.disabledDate, new Date(thirtyDaysAgo.toString())),
			isNotNull(users.subscriptionId),
			isNotNull(users.subscriptionUUID),
		),
	});
};

const worker = new Worker(
	key,
	async () => {
		const usersToRemoveSubscription = await getUsersToRemoveSubscription();

		const UUIDs = usersToRemoveSubscription.reduce((acc, user) => {
			if (user.subscriptionUUID) {
				acc.push(user.subscriptionUUID);
			}

			return acc;
		}, [] as string[]);

		if (!UUIDs.length) return 0;

		await usersBulkActionsControllerBulkDeleteUsers({
			body: {
				uuids: UUIDs,
			},
		});

		const removedUsers = await db
			.update(users)
			.set({ subscriptionId: null, subscriptionUUID: null })
			.where(inArray(users.subscriptionUUID, UUIDs))
			.returning();

		return removedUsers.length;
	},
	{ connection },
);

worker.on("completed", (_, result) => {
	if (!result) return;

	logger.info(`[${key}] Job completed. ${result} users was removed`);
});
