import { Bot } from "grammy";
import { Hono } from "hono";
import { donate } from "./commands/donate.ts";
import { getUserSubscription } from "./commands/get-subscription.ts";
import { env } from "./env.ts";
import { logger } from "./logger.ts";
import { userApprovalMenu } from "./menu/approval-menu.ts";
import { handleChatMembersChanged } from "./middleware/chat-member.ts";
import { userSubscribedAndAccepted } from "./middleware/subscribed-and-accepted.ts";
import { webhookRoute } from "./routes/webhook.ts";

export const bot = new Bot(env.BOT_TOKEN);

bot.on("chat_member", handleChatMembersChanged);
bot.use(userApprovalMenu);
bot.use(userSubscribedAndAccepted);

bot.command("start", getUserSubscription);
bot.command("getsub", getUserSubscription);
bot.command("donate", donate);
bot.on("message", getUserSubscription);

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

logger.info("Grammy bot started with polling");

const app = new Hono();

app.route("/webhook", webhookRoute);

Bun.serve({
	port: env.BOT_PORT,
	fetch: app.fetch,
});

logger.info({ port: env.BOT_PORT }, "Bot webhook server started");
