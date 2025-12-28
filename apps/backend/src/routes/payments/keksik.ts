import { zValidator } from "@hono/zod-validator";
import { Level } from "@sub/shared";
import { Hono } from "hono";
import z from "zod";
import { env } from "@/env";
import { logger } from "@/logger";
import { sendDonationNotification } from "@/services/notification";
import { setUserSubscriptionLevel } from "@/services/user";

const keksikDonationSchema = z.object({
	id: z.number(),
	amount: z.number(),
	user: z.number(),
});

const keksikCallbackSchema = z.object({
	account: z.number().optional(),
	type: z.enum(["confirmation", "new_donate"]),
	data: keksikDonationSchema.optional(),
	hash: z.string().optional(),
});

export const paymentsKeksik = new Hono().post(
	"/",
	zValidator("json", keksikCallbackSchema),
	async (ctx) => {
		const { type, data } = ctx.req.valid("json");

		if (type === "confirmation") {
			return ctx.json({ status: "ok", code: env.KEKSIK_CONFIRMATION_CODE });
		}

		if (type === "new_donate" && data) {
			logger.info(`Received new donation from Keksik: ${JSON.stringify(data)}`);

			const monthsCount = Math.floor(data.amount / env.SUM_FOR_MONTH);

			if (!monthsCount) return;

			const paidExpireDate = new Date();
			paidExpireDate.setDate(paidExpireDate.getDate() + 30 * monthsCount);

			await setUserSubscriptionLevel({
				level: Level.PAID,
				telegramId: data.user,
				levelExpireDate: paidExpireDate,
			});

			sendDonationNotification({
				telegramId: data.user,
			});

			return ctx.json({ status: "ok" });
		}

		return ctx.json({ status: "ok" });
	},
);
