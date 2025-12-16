import type { User } from "@sub/backend/types";
import { DisabledReason, SubscriptionStatus } from "@sub/shared";
import { Bot, type Context } from "grammy";
import {
	createSubscription,
	getSubscription,
} from "./api/backend/subscription.ts";
import {
	getUserByTelegramId,
	updateSubscriptionStatus,
} from "./api/backend/user.ts";
import { env } from "./env.ts";
import { logger } from "./logger.ts";
import { userApprovalMenu } from "./menu/approval-menu.ts";
import { getOrCreateUserByTelegramId } from "./services/user.ts";

const bot = new Bot(env.BOT_TOKEN);

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

bot.use(userApprovalMenu);

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

const getIsUserSubscribed = async (user: User) => {
	try {
		const chatMember = await bot.api.getChatMember(
			env.CHANNEL_ID,
			user.telegramId,
		);

		const subscribedStatuses = ["member", "administrator", "creator"];
		return subscribedStatuses.includes(chatMember.status);
	} catch {
		return false;
	}
};

const handleUserMessage = async (ctx: Context) => {
	const { user: botUser } = await ctx.getAuthor();

	const user = await getOrCreateUserByTelegramId(botUser.id);

	if (!user) {
		ctx.reply("Произошла ошибка при получении информации о пользователе.");

		return;
	}

	const isSubscribed = await getIsUserSubscribed(user);

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

	const message = await getMessageWithSubscription(botUser.id);

	ctx.reply(message, { parse_mode: "HTML" });
};

bot.on("chat_member", async (ctx) => {
	if (env.CHANNEL_ID !== ctx.chat.id.toString()) return;

	const chatMember = ctx.chatMember;
	const newStatus = chatMember.new_chat_member.status;
	const telegramId = chatMember.from.id;

	const isUnsubcribed =
		newStatus === "left" ||
		newStatus === "kicked" ||
		newStatus === "restricted";

	if (!isUnsubcribed) return;

	try {
		const user = await getUserByTelegramId(telegramId);
		await updateSubscriptionStatus(
			user.id,
			SubscriptionStatus.DISABLED,
			DisabledReason.UNSUBSCRIBED,
		);
	} catch {}

	ctx.api.sendMessage(
		telegramId,
		`Доступ к подписке был заблокирован, так как вы не являетесь участником [канала](${env.CHANNEL_LINK})`,
		{
			parse_mode: "Markdown",
		},
	);
});

bot.command("start", handleUserMessage);
bot.on("message", handleUserMessage);

bot.catch((err) => {
	logger.error(
		{
			event: "bot_error",
			error: {
				message: err.message,
				name: err.name,
				stack: err.stack,
			},
		},
		"Bot caught an error",
	);
});

bot.start({
	allowed_updates: ["message", "chat_member", "callback_query"],
});
