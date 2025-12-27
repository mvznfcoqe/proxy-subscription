import type { Context } from "grammy";
import {
	createSubscription,
	getSubscription,
	getUserByTelegramId,
} from "@/api/backend";

const getMessageWithSubscription = async (telegramId: number) => {
	try {
		const user = await getUserByTelegramId(telegramId);

		let subscriptionURL: string;

		try {
			const subscription = await getSubscription(user.id);
			subscriptionURL = subscription.subscriptionUrl;
		} catch {
			const newSubscription = await createSubscription(user.id);
			subscriptionURL = newSubscription.subscriptionUrl;
		}

		return `
Привет
Твоя подписка:
${subscriptionURL}
  `;
	} catch {
		return `Подписка не найдена. Вероятно, ваш аккаунт еще не был одобрен.`;
	}
};

export const getUserSubscription = async (ctx: Context) => {
	const { user: botUser } = await ctx.getAuthor();

	const message = await getMessageWithSubscription(botUser.id);

	ctx.reply(message, { parse_mode: "HTML" });
};
