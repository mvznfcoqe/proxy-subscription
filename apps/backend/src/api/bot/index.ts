import type { AppType } from "@sub/bot/types";
import { hc } from "hono/client";
import { env } from "@/env";

export const bot = hc<AppType>(env.BOT_API_URL, {
	headers: { "X-Api-Key": env.BOT_WEBHOOK_API_KEY },
});
