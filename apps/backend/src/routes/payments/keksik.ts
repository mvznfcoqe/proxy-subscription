import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { env } from "~/env";
import { logger } from "~/logger";
import { setSubscriptionLevel } from "~/services/subscription";

const keksikDonationSchema = z.object({
	id: z.number(),
	bill_id: z.string(),
	prebill_id: z.string(),
	amount: z.number(),
	anonym: z.boolean(),
	hide_profile_link: z.string(),
	reward_sended: z.string(),
	date: z.number(),
	op: z.string(),
	user: z.number(),
	campaign: z.number(),
});

const keksikCallbackSchema = z.object({
	account: z.number().optional(),
	type: z.enum(["confirmation", "new_donate"]),
	data: keksikDonationSchema.optional(),
	hash: z.string().optional(),
});

export const paymentsKeksikRoute = new Hono().post(
	"/",
	zValidator("json", keksikCallbackSchema),
	async (ctx) => {
		const { type, data } = ctx.req.valid("json");

		if (type === "confirmation") {
			return ctx.json({ status: "ok", code: env.KEKSIK_CONFIRMATION_CODE });
		}

		if (type === "new_donate" && data) {
			logger.info(`Received new donation from Keksik: ${JSON.stringify(data)}`);

			await setSubscriptionLevel({ level: "paid", telegramId: data.user });

			return ctx.json({ status: "ok" });
		}

		return ctx.json({ status: "ok" });
	},
);
