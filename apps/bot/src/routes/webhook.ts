import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { env } from "@/env";
import { bot } from "@/index";
import { logger } from "@/logger";

const donationNotificationSchema = z.object({
	telegramId: z.number(),
});

export const webhookRoute = new Hono().post(
	"/donation",
	zValidator("json", donationNotificationSchema),
	async (ctx) => {
		const apiKey = ctx.req.header("X-Api-Key");

		if (!apiKey || apiKey !== env.BOT_WEBHOOK_API_KEY) {
			logger.warn(
				{
					event: "webhook_unauthorized",
					ip: ctx.req.header("x-forwarded-for"),
				},
				"Unauthorized webhook attempt",
			);

			return ctx.json({ status: "error", message: "Unauthorized" }, 401);
		}

		const { telegramId } = ctx.req.valid("json");

		logger.info(
			{
				event: "donation_notification_received",
				telegramId,
			},
			"Processing donation notification",
		);

		try {
			const message = `
Спасибо за поддержку

Обновите подписку в своем приложении
`.trim();

			await bot.api.sendMessage(telegramId, message);

			logger.info(
				{
					event: "donation_notification_sent",
					telegramId,
				},
				"Donation notification sent successfully",
			);

			return ctx.json({ status: "ok" });
		} catch (error) {
			logger.error(
				{
					event: "donation_notification_failed",
					telegramId,
					error: error instanceof Error ? error.message : String(error),
				},
				"Failed to send donation notification",
			);

			return ctx.json(
				{
					status: "error",
					message: "Failed to send message",
				},
				400,
			);
		}
	},
);
