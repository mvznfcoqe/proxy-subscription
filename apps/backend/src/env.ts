import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	REDIS_URL: z.string(),
	REMNAWAVE_PANEL_URL: z.string(),
	REMNAWAVE_API_KEY: z.string(),
	FREE_SQUAD_UUID: z.string(),
	PAID_SQUAD_UUID: z.string(),
	KEKSIK_CALLBACK_API_KEY: z.string(),
	KEKSIK_CONFIRMATION_CODE: z.string(),
	SUM_FOR_MONTH: z.coerce.number(),
	BOT_API_URL: z.string(),
	BOT_WEBHOOK_API_KEY: z.string(),
});

const env = envSchema.parse(Bun.env);

export { env };
