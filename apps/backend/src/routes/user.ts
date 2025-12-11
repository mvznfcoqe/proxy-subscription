import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { remnaClient } from "~/api/remna";
import { db } from "~/db";
import {
	insertUserSchema,
	SubscriptionStatus,
	selectUserSchema,
	users,
} from "~/db/schema";
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
			throw new HTTPException(409, { message: "User already exists" });
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

		const foundUser = await getUserByTelegramId(telegramId);

		if (!foundUser) {
			throw new HTTPException(404, {
				message: "User not found",
			});
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
				throw new HTTPException(404, { message: "User not found" });
			}

			await remnaClient.users.updateByUuidOrUsername({
				username: foundUser.username,
				status:
					subscriptionStatus === SubscriptionStatus.ACTIVE
						? "ACTIVE"
						: "DISABLED",
			});

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
