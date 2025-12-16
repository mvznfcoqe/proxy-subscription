import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { usersControllerCreateUser } from "~/api/generated/remnawave";
import { DataLimitBySqualLevel, Levels } from "~/config/remna";
import { db } from "~/db";
import { selectUserSchema, users } from "~/db/schema";
import { getSubscriptionByTelegramId } from "~/services/subscription";
import { getUserById } from "~/services/user";

const createSubscriptionSchema = selectUserSchema.pick({
	id: true,
});

export const subscription = new Hono()
	.get("/:id", async (ctx) => {
		const id = Number(ctx.req.param("id"));

		if (Number.isNaN(id)) {
			return ctx.json({ message: "Invalid user ID" }, 400);
		}

		const user = await getUserById(id);

		if (!user) {
			return ctx.json({ message: "User not found" }, 404);
		}

		const foundSubscription = await getSubscriptionByTelegramId(
			user.telegramId,
		);

		if (!foundSubscription) {
			return ctx.json({ message: "Subscription not found" }, 404);
		}

		return ctx.json(foundSubscription);
	})
	.post("/", zValidator("json", createSubscriptionSchema), async (ctx) => {
		const expireAt = new Date("2099");

		const { id } = ctx.req.valid("json");

		const user = await getUserById(id);

		if (!user) {
			return ctx.json({ message: "User not found" }, 404);
		}

		const { data, error } = await usersControllerCreateUser({
			body: {
				expireAt: expireAt.toISOString(),
				status: "ACTIVE",
				username: user.telegramId.toString().slice(0, 36),
				telegramId: user.telegramId,
				activeInternalSquads: [Levels.free],
				trafficLimitBytes: DataLimitBySqualLevel.free * 1024 ** 3,
				trafficLimitStrategy: "MONTH",
				shortUuid: nanoid(128),
			},
		});

		if (!data || error) {
			return ctx.json({ message: "Failed to create subscription" }, 400);
		}

		const createdSubscription = data.response;

		await db
			.update(users)
			.set({ subscriptionId: createdSubscription.id })
			.where(eq(users.id, user.id));

		ctx.status(201);

		return ctx.json(createdSubscription);
	});
