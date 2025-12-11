import { z } from "zod";

const envSchema = z.object({
	DATABASE_URL: z.string(),
	REMNAWAVE_PANEL_URL: z.string(),
	REMNAWAVE_API_KEY: z.string(),
});

const env = envSchema.parse(Bun.env);

export { env };
