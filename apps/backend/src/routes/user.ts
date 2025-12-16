import { zValidator } from "@hono/zod-validator";
import { SubscriptionStatus } from "@sub/shared";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { usersControllerUpdateUser } from "~/api/generated/remnawave";
import { db } from "~/db";
import { insertUserSchema, selectUserSchema, users } from "~/db/schema";
import { getSubscriptionByTelegramId } from "~/services/subscription";
import { getUserById, getUserByTelegramId } from "~/services/user";

const createUserSchema = insertUserSchema.pick({
	telegramId: true,
});

const updateSubscriptionStatusSchema = selectUserSchema.pick({
	subscriptionStatus: true,
	disabledReason: true,
});

export const user = new Hono()
	.post("/", zValidator("json", createUserSchema), async (ctx) => {
		const { telegramId } = ctx.req.valid("json");

		const existingUser = await db.query.users.findFirst({
			where: eq(users.telegramId, telegramId),
		});

		if (existingUser) {
			return ctx.json({ message: "User already exists" }, 409);
		}

		const createdUsers = await db
			.insert(users)
			.values({
				telegramId: telegramId,
				username: telegramId.toString(),
			})
			.returning();

		const createdUser = createdUsers[0];

		return ctx.json(createdUser);
	})
	.get("/telegram/:telegramId", async (ctx) => {
		const telegramId = Number(ctx.req.param("telegramId"));

		const foundUser = await getUserByTelegramId(telegramId).catch(() => null);

		if (!foundUser) {
			return ctx.json({ message: "User not found" }, 404);
		}

		return ctx.json(foundUser);
	})
	.patch(
		"/:id/subscription-status",
		zValidator("json", updateSubscriptionStatusSchema),
		async (ctx) => {
			const id = Number(ctx.req.param("id"));
			const { subscriptionStatus, disabledReason } = ctx.req.valid("json");

			const foundUser = await getUserById(id);

			if (!foundUser) {
				return ctx.json({ message: "User not found" }, 404);
			}

			const userSubscription = await getSubscriptionByTelegramId(
				foundUser.telegramId,
			);

			if (userSubscription) {
				await usersControllerUpdateUser({
					body: {
						username: foundUser.username,
						status:
							subscriptionStatus === SubscriptionStatus.ACTIVE
								? "ACTIVE"
								: "DISABLED",
					},
				});
			}

			if (subscriptionStatus === SubscriptionStatus.DISABLED) {
				console.warn(
					JSON.stringify({
						event: "user_disabled",
						userId: foundUser.id,
						username: foundUser.username,
						reason: disabledReason,
					}),
				);
			}

			await db
				.update(users)
				.set({ subscriptionStatus, disabledReason })
				.where(eq(users.id, foundUser.id));

			return ctx.json({ success: true });
		},
	);
