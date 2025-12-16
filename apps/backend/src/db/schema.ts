import { DisabledReason, SubscriptionStatus } from "@sub/shared";
import { bigint, pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export { DisabledReason, SubscriptionStatus };

export const subscriptionStatusEnum = pgEnum("subscription_status", [
	SubscriptionStatus.INITIAL,
	SubscriptionStatus.WAITING,
	SubscriptionStatus.ACTIVE,
	SubscriptionStatus.DISABLED,
	SubscriptionStatus.REJECTED,
]);

export const disabledReasonEnum = pgEnum("disabled_reason", [
	DisabledReason.UNSUBSCRIBED,
	DisabledReason.FRAUD,
]);

export const users = pgTable("users", {
	id: serial("id").primaryKey().notNull(),
	subscriptionId: bigint("subscription_id", { mode: "number" }).unique(),
	username: text("username").notNull().unique(),
	telegramId: bigint("telegram_id", { mode: "number" }).notNull().unique(),
	subscriptionStatus: subscriptionStatusEnum("subscription_status")
		.notNull()
		.default(SubscriptionStatus.INITIAL),
	disabledReason: disabledReasonEnum("disabled_reason"),
});

export type User = typeof users.$inferSelect;

export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
