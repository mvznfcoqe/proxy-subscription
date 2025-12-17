import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import z from "zod";
import { env } from "~/env";
import { logger } from "~/logger";

const keksikDonationSchema = z.object({
	id: z.number(),
	campaign: z.number(),
	user: z.number(),
	date: z.number(),
	amount: z.number(),
	total: z.number(),
	msg: z.string().optional(),
	anonym: z.boolean(),
});

const keksikNewDonateSchema = z.array(keksikDonationSchema);

export const paymentsKeksikRoute = new Hono()
	.get("/", async (ctx) => {
		return ctx.json({ status: "ok", code: env.KEKSIK_CONFIRMATION_CODE });
	})
	.post(
		"/new_donate",
		zValidator("json", keksikNewDonateSchema),
		async (ctx) => {
			const donations = ctx.req.valid("json");

			logger.info(
				`Received new donation from Keksik: ${JSON.stringify(donations)}`,
			);

			return ctx.json({ status: "ok" });
		},
	);
