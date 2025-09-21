CREATE TYPE "public"."listing_status" AS ENUM('draft', 'active', 'rejected', 'archived');--> statement-breakpoint
CREATE TYPE "public"."plan_type" AS ENUM('free', 'pro', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('buyer', 'seller', 'admin');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive', 'banned');--> statement-breakpoint
CREATE TABLE "ndas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"buyer_user_id" uuid NOT NULL,
	"buyer_name" text NOT NULL,
	"status" text DEFAULT 'REQUESTED' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listings" ALTER COLUMN "status" SET DATA TYPE "public"."listing_status" USING "status"::"public"."listing_status";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."user_role" USING "role"::"public"."user_role";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "plan" SET DATA TYPE "public"."plan_type" USING "plan"::"public"."plan_type";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "status" SET DATA TYPE "public"."user_status" USING "status"::"public"."user_status";--> statement-breakpoint
ALTER TABLE "ndas" ADD CONSTRAINT "ndas_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ndas" ADD CONSTRAINT "ndas_buyer_user_id_users_id_fk" FOREIGN KEY ("buyer_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;