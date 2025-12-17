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

const keksikCallbackSchema = z.object({
	account: z.number(),
	type: z.enum(["confirmation", "new_donate"]),
	data: z.array(keksikDonationSchema).optional(),
	hash: z.string(),
});

export const paymentsKeksikRoute = new Hono().post(
	"/",
	zValidator("form", keksikCallbackSchema, (result, ctx) => {
		if (!result.success) {
			logger.error(
				`Keksik callback validation failed: ${JSON.stringify(result.error.issues)}`,
			);
			logger.error(`Body: ${JSON.stringify(ctx.req.json())}`);
			logger.error(`Params: ${JSON.stringify(ctx.req.param())}`);
			logger.error(`Query: ${JSON.stringify(ctx.req.queries())}`);
			logger.error(`Form Data: ${JSON.stringify(ctx.req.formData())}`);

			return ctx.status(400);
		}
	}),
	async (ctx) => {
		const { type, data } = ctx.req.valid("form");

		if (type === "confirmation") {
			return ctx.json({ status: "ok", code: env.KEKSIK_CONFIRMATION_CODE });
		}

		if (type === "new_donate") {
			logger.info(`Received new donation from Keksik: ${JSON.stringify(data)}`);

			return ctx.json({ status: "ok" });
		}

		return ctx.json({ status: "ok" });
	},
);
