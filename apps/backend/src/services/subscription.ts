import { usersControllerGetUserByTelegramId } from "~/api/generated/remnawave";

export const getSubscriptionByTelegramId = async (telegramId: number) => {
	const { data, error } = await usersControllerGetUserByTelegramId({
		path: { telegramId: telegramId.toString() },
	});

	if (!data || error) {
		return null;
	}

	const foundUser = data.response[0];

	return { subscriptionURL: foundUser.subscriptionUrl };
};
