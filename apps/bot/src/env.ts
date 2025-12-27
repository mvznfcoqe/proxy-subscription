import { z } from "zod";

const envSchema = z.object({
	BOT_TOKEN: z.string(),
	ADMIN_ID: z.string(),
	CHANNEL_ID: z.string(),
	CHANNEL_LINK: z.string(),
	BACKEND_URL: z.string(),
	DONATE_BOT_USERNAME: z.string(),
	ADMIN_USERNAME: z.string(),
	BOT_WEBHOOK_API_KEY: z.string(),
	BOT_PORT: z.coerce.number().optional().default(3001),
});

const env = envSchema.parse(Bun.env);

export { env };
