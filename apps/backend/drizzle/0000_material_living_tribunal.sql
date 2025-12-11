CREATE TYPE "public"."disabled_reason" AS ENUM('unsubscribed', 'fraud');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('initial', 'waiting', 'active', 'disabled', 'rejected');--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"telegram_id" bigint NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'initial' NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"disabled_reason" "disabled_reason",
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
