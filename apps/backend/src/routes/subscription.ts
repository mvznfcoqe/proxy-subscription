import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { nanoid } from "nanoid";
import { remnaClient } from "~/api/remna";
import { DataLimitBySqualLevel, InternalSquadLevels } from "~/config/remna";
import { selectUserSchema } from "~/db/schema";
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

		const foundSubscription = await remnaClient.users
			.getByTelegramId(String(user.telegramId))
			.then((users) => users[0])
			.catch(() => null);

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

		const createdSubscription = await remnaClient.users.create({
			expireAt,
			status: "ACTIVE",
			username: user.telegramId.toString().slice(0, 36),
			telegramId: user.telegramId,
			activeInternalSquads: [
				InternalSquadLevels[user.level as keyof typeof InternalSquadLevels],
			],
			trafficLimitBytes:
				DataLimitBySqualLevel[
					user.level as keyof typeof DataLimitBySqualLevel
				] *
				1024 ** 3,
			trafficLimitStrategy: "MONTH",
			shortUuid: nanoid(128),
		});

		ctx.status(201);

		return ctx.json(createdSubscription);
	});
