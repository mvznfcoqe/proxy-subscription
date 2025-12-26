import { eq } from "drizzle-orm";
import {
	usersControllerResetUserTraffic,
	usersControllerUpdateUser,
} from "~/api/generated/remnawave";
import { DataLimitBySqualLevel, SquadByLevel } from "~/config/remna";
import { db } from "~/db";
import { type Level, users } from "~/db/schema";
import { getSubscriptionByTelegramId } from "./subscription";

export const getUserById = async (id: number) => {
	const user = await db.query.users
		.findFirst({
			where: eq(users.id, id),
		})
		.catch(() => null);

	return user;
};

export const getUserByTelegramId = async (telegramId: number) => {
	const user = await db.query.users
		.findFirst({
			where: eq(users.telegramId, telegramId),
		})
		.catch(() => null);

	return user;
};

export const setUserSubscriptionLevel = async ({
	level,
	levelExpireDate = new Date("2099"),
	telegramId,
}: {
	level: Level;
	levelExpireDate?: Date;
	telegramId: number;
}) => {
	const subscription = await getSubscriptionByTelegramId(telegramId);

	if (!subscription) return;

	const dataLimit = DataLimitBySqualLevel[level];
	const squadUUID = SquadByLevel[level];

	await usersControllerResetUserTraffic({
		path: { uuid: subscription.uuid },
	});

	await usersControllerUpdateUser({
		body: {
			uuid: subscription.uuid,
			trafficLimitBytes: dataLimit * 1024 ** 3,
			activeInternalSquads: [squadUUID],
			expireAt: levelExpireDate.toISOString(),
		},
	});

	await db
		.update(users)
		.set({ level, levelExpireDate })
		.where(eq(users.telegramId, telegramId));
};
