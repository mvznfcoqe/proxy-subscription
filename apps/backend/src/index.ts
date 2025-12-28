import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { migrateDatabase } from "./lib/migrate";
import { subscription } from "./routes/subscription";
import { user } from "./routes/user";
import "./api/remnawave";
import { trimTrailingSlash } from "hono/trailing-slash";
import { paymentsKeksik } from "./routes/payments/keksik";
import "./jobs/remove-unsubscribers";
import "./jobs/downgrade-expired-users";
import { system } from "./routes/system";

await migrateDatabase();

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use(trimTrailingSlash());

const routes = app
	.route("/user", user)
	.route("/subscription", subscription)
	.route("/payments/keksik", paymentsKeksik)
	.route("/system", system);

export type AppType = typeof routes;

const port = process.env.PORT || 3000;

app.onError((err, c) => {
	console.error(`${err}`);
	return c.text("Custom Error Message", 500);
});

export default {
	port,
	fetch: app.fetch,
};
