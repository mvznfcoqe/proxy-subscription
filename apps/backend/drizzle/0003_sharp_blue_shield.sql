CREATE TYPE "public"."level" AS ENUM('free', 'paid');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "level" "level" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "level_expire_date" timestamp DEFAULT '2099-01-01 00:00:00.000';