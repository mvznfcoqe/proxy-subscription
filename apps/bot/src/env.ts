import { z } from "zod";

const envSchema = z.object({
	BOT_TOKEN: z.string(),
	ADMIN_ID: z.string(),
	CHANNEL_ID: z.string(),
	CHANNEL_LINK: z.string(),
	BACKEND_URL: z.string(),
});

const env = envSchema.parse(Bun.env);

export { env };
