import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { subscription } from "./routes/subscription";
import { user } from "./routes/user";
import "./db";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());

const routes = app.route("/user", user).route("/subscription", subscription);

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
