import type { AppType } from "@sub/backend/types";
import { hc } from "hono/client";
import { env } from "@/env";

export const backend = hc<AppType>(env.BACKEND_URL);

export { isBackendError } from "./lib";
export { createSubscription, getSubscription } from "./subscription";
export {
	createUser,
	getUserByTelegramId,
	updateSubscriptionStatus,
} from "./user";
