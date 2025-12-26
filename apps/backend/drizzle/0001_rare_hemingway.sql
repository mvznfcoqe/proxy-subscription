ALTER TABLE "users" ADD COLUMN "subscription_uuid" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_subscription_uuid_unique" UNIQUE("subscription_uuid");