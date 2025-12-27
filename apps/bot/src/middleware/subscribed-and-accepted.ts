import {
	DisabledReason,
	SubscriptionStatus,
	type User,
} from "@sub/backend/types";
import type { Context, NextFunction } from "grammy";
import { updateSubscriptionStatus } from "@/api/backend";
import { env } from "@/env";
import { logger } from "@/logger";
import { userApprovalMenu } from "@/menu/approval-menu";
import { getOrCreateUserByTelegramId } from "@/services/user";

const getIsUserSubscribed = async ({
	ctx,
	user,
}: {
	ctx: Context;
	user: User;
}) => {
	try {
		const chatMember = await ctx.api.getChatMember(
			env.CHANNEL_ID,
			user.telegramId,
		);

		const subscribedStatuses = ["member", "administrator", "creator"];
		return subscribedStatuses.includes(chatMember.status);
	} catch {
		return false;
	}
};

const requestUserApproval = async ({
	botUser,
	ctx,
}: {
	botUser: NonNullable<Context["from"]>;
	ctx: Context;
}) => {
	const user = await getOrCreateUserByTelegramId(botUser.id);

	if (!user) {
		ctx.reply("Произошла ошибка при получении информации о пользователе.");

		return;
	}

	if (user.subscriptionStatus === SubscriptionStatus.WAITING) {
		ctx.reply(
			"Запрос доступа к подписке был отправлен, одобрение должно произойти в течении дня.",
		);

		return;
	}

	await updateSubscriptionStatus(user.id, SubscriptionStatus.WAITING);

	logger.info(
		{
			event: "user_approval_request",
			userId: user.telegramId,
			username: user.username,
		},
		"User sent approval request",
	);

	await ctx.api.sendMessage(
		env.ADMIN_ID,
		`
User: <a href="tg://user?id=${user.telegramId}">${user.username}</a>
Telegram ID: ${user.telegramId}
`,
		{ reply_markup: userApprovalMenu, parse_mode: "HTML" },
	);

	ctx.reply(
		"Запрос доступа к подписке был отправлен, одобрение должно произойти в течении дня.",
	);
};

export const userSubscribedAndAccepted = async (
	ctx: Context,
	next: NextFunction,
) => {
	const { user: botUser } = await ctx.getAuthor();

	const user = await getOrCreateUserByTelegramId(botUser.id);

	if (!user) {
		ctx.reply("Произошла ошибка при получении информации о пользователе.");

		return;
	}

	const isSubscribed = await getIsUserSubscribed({ ctx, user });

	if (!isSubscribed) {
		if (user.subscriptionStatus === SubscriptionStatus.ACTIVE) {
			await updateSubscriptionStatus(
				user.id,
				SubscriptionStatus.DISABLED,
				DisabledReason.UNSUBSCRIBED,
			);
		}

		ctx.reply(
			`Для использования подписки необходимо быть подписанным на [канал](${env.CHANNEL_LINK}).`,
			{ parse_mode: "Markdown" },
		);

		return;
	}

	if (user.subscriptionStatus !== SubscriptionStatus.ACTIVE) {
		await requestUserApproval({ botUser, ctx });

		return;
	}

	await next();
};
