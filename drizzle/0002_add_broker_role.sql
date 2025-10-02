-- Add broker role to user_role enum
ALTER TYPE "public"."user_role" ADD VALUE 'broker';--> statement-breakpoint

-- Create broker_profiles table
CREATE TABLE "broker_profiles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"display_name" text NOT NULL,
	"headshot_url" text,
	"bio" text,
	"phone" text,
	"email" text,
	"company" text,
	"license_number" text,
	"work_areas" text[],
	"specialties" text[],
	"years_experience" integer,
	"website_url" text,
	"linkedin_url" text,
	"is_public" text DEFAULT 'true' NOT NULL,
	"custom_sections" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "broker_profiles_user_id_unique" UNIQUE("user_id")
);--> statement-breakpoint

-- Add broker_profile_id to listings table
ALTER TABLE "listings" ADD COLUMN "broker_profile_id" uuid;--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "broker_profiles" ADD CONSTRAINT "broker_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_broker_profile_id_broker_profiles_id_fk" FOREIGN KEY ("broker_profile_id") REFERENCES "public"."broker_profiles"("id") ON DELETE no action ON UPDATE no action;
