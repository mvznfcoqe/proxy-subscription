import {
	usersControllerGetUserByTelegramId,
	usersControllerResetUserTraffic,
	usersControllerUpdateUser,
} from "~/api/generated/remnawave";
import { DataLimitBySqualLevel, Levels } from "~/config/remna";

export const getSubscriptionByTelegramId = async (telegramId: number) => {
	const { data, error } = await usersControllerGetUserByTelegramId({
		path: { telegramId: telegramId.toString() },
	});

	if (!data || error) {
		return null;
	}

	const foundUser = data.response[0];

	if (!foundUser) {
		return null;
	}

	return foundUser;
};

export const setSubscriptionLevel = async ({
	level,
	telegramId,
}: {
	level: keyof typeof Levels;
	telegramId: number;
}) => {
	const subscription = await getSubscriptionByTelegramId(telegramId);

	if (!subscription) return;

	const dataLimit = DataLimitBySqualLevel[level];
	const squadUUID = Levels[level];

	const paidExpireDate = new Date();
	paidExpireDate.setDate(paidExpireDate.getDate() + 30);

	const expireDate =
		level === Levels.free
			? new Date("2099").toISOString()
			: paidExpireDate.toISOString();

	await usersControllerResetUserTraffic({
		path: { uuid: subscription.uuid },
	});

	await usersControllerUpdateUser({
		body: {
			uuid: subscription.uuid,
			trafficLimitBytes: dataLimit * 1024 ** 3,
			activeInternalSquads: [squadUUID],
			expireAt: expireDate,
		},
	});
};
