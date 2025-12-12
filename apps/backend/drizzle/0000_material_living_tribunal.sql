DO $$ BEGIN
	CREATE TYPE "public"."disabled_reason" AS ENUM('unsubscribed', 'fraud');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
DO $$ BEGIN
	CREATE TYPE "public"."subscription_status" AS ENUM('initial', 'waiting', 'active', 'disabled', 'rejected');
EXCEPTION
	WHEN duplicate_object THEN null;
END $$;
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"telegram_id" bigint NOT NULL,
	"subscription_status" "subscription_status" DEFAULT 'initial' NOT NULL,
	"level" smallint DEFAULT 1 NOT NULL,
	"disabled_reason" "disabled_reason",
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_telegram_id_unique" UNIQUE("telegram_id")
);
