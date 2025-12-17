import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { subscription } from "./routes/subscription";
import { user } from "./routes/user";
import "./db";
import { migrateDatabase } from "./lib/migrate";
import "./api/remnawave";
import { trimTrailingSlash } from "hono/trailing-slash";
import { paymentsKeksikRoute } from "./routes/payments/keksik";

await migrateDatabase();

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use(trimTrailingSlash());

const routes = app
	.route("/user", user)
	.route("/subscription", subscription)
	.route("/payments/keksik", paymentsKeksikRoute);

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
