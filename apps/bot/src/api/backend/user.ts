import type { SubscriptionStatus } from "@sub/backend/types";
import { parseResponse } from "hono/client";
import { backend } from "./index";

export const getUserByTelegramId = async (telegramId: number) => {
	return await parseResponse(
		backend.user.telegram[":telegramId"].$get({
			param: { telegramId: telegramId.toString() },
		}),
	);
};

export const createUser = async (telegramId: number) => {
	return await parseResponse(
		backend.user.$post({
			json: { telegramId },
		}),
	);
};

export const updateSubscriptionStatus = async (
	userId: number,
	subscriptionStatus: SubscriptionStatus,
	disabledReason: "unsubscribed" | "fraud" | null = null,
) => {
	return await parseResponse(
		backend.user[":id"]["subscription-status"].$patch({
			param: { id: userId.toString() },
			json: { subscriptionStatus, disabledReason },
		}),
	);
};
