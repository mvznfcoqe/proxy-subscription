import IORedis from "ioredis";
import { env } from "~/env";

const { hostname } = new URL(env.REDIS_URL);

export const connection = new IORedis({
	maxRetriesPerRequest: null,
	host: hostname,
});
