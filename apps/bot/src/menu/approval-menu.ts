import { Menu } from "@grammyjs/menu";
import { SubscriptionStatus } from "@sub/backend/types";
import { getUserByTelegramId, updateSubscriptionStatus } from "@/api/backend";
import { env } from "@/env";
import { logger } from "@/logger";

const getTelegramIdFromApprovalRequest = (message: string): number | null => {
	const match = message.match(/(\d{6,})/g)?.pop();
	return match ? parseInt(match, 10) : null;
};

export const userApprovalMenu = new Menu("user-approval-menu")
	.text("Accept", async (ctx) => {
		if (ctx.from?.id.toString() !== env.ADMIN_ID) {
			return;
		}

		const textMessage = ctx.msg?.text;

		if (!textMessage) {
			ctx.reply("Failed to get user Telegram ID");

			return;
		}

		const telegramId = getTelegramIdFromApprovalRequest(textMessage);

		if (!telegramId) {
			ctx.reply("Failed to get user Telegram ID");

			return;
		}

		const user = await getUserByTelegramId(telegramId);
		await updateSubscriptionStatus(user.id, SubscriptionStatus.ACTIVE);

		logger.info(
			{
				event: "user_approval_accepted",
				telegramId,
			},
			"User approval was accepted",
		);

		await ctx.api.sendMessage(
			telegramId,
			"Ваш аккаунт был активирован! Используйте /getsub для получения подписки.",
		);
		await ctx.editMessageText(`${textMessage}\nActive`, {
			reply_markup: undefined,
		});
	})
	.text("Reject", async (ctx) => {
		if (ctx.from?.id.toString() !== env.ADMIN_ID) {
			return;
		}

		const textMessage = ctx.msg?.text;

		if (!textMessage) {
			ctx.reply("Failed to get user Telegram ID");

			return;
		}

		const telegramId = getTelegramIdFromApprovalRequest(textMessage);

		if (!telegramId) {
			ctx.reply("Failed to get user Telegram ID");

			return;
		}

		const user = await getUserByTelegramId(telegramId);
		await updateSubscriptionStatus(user.id, SubscriptionStatus.REJECTED);

		logger.warn(
			{
				event: "user_approval_rejected",
				telegramId,
			},
			"User approval was rejected",
		);

		await ctx.api.sendMessage(
			telegramId,
			`Возможно, ваш аккаунт похож на Китайского секс-бота. Попробуйте еще раз...\n\nSomeday...`,
		);
		await ctx.editMessageText(`${textMessage}\nRejected`, {
			reply_markup: undefined,
		});
	});
