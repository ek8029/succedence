-- Valuations table - stores AI-powered business valuations
CREATE TABLE "valuations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"listing_id" uuid,
	"source_type" text NOT NULL,
	"source_url" text,
	"source_platform" text,
	"raw_revenue" integer,
	"raw_sde" integer,
	"raw_ebitda" integer,
	"raw_cash_flow" integer,
	"raw_asking_price" integer,
	"raw_inventory" integer,
	"raw_ffe" integer,
	"normalized_sde" integer,
	"normalized_ebitda" integer,
	"normalization_adjustments" jsonb,
	"business_name" text,
	"industry" text NOT NULL,
	"naics_code" text,
	"city" text,
	"state" text,
	"year_established" integer,
	"employees" integer,
	"owner_hours" integer,
	"risk_factors" jsonb,
	"valuation_low" integer NOT NULL,
	"valuation_mid" integer NOT NULL,
	"valuation_high" integer NOT NULL,
	"sde_multiple_low" text,
	"sde_multiple_mid" text,
	"sde_multiple_high" text,
	"ebitda_multiple_low" text,
	"ebitda_multiple_mid" text,
	"ebitda_multiple_high" text,
	"deal_quality_score" integer,
	"deal_quality_breakdown" jsonb,
	"ai_analysis" jsonb,
	"key_strengths" text[],
	"red_flags" text[],
	"negotiation_recommendations" text[],
	"methodology_explanation" text,
	"mispricing_percent" text,
	"mispricing_analysis" text,
	"anonymous_id" text,
	"captured_email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Industry multiples reference table
CREATE TABLE "industry_multiples" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"industry_key" text NOT NULL UNIQUE,
	"industry_name" text NOT NULL,
	"naics_code" text,
	"sde_multiple_low" text NOT NULL,
	"sde_multiple_mid" text NOT NULL,
	"sde_multiple_high" text NOT NULL,
	"ebitda_multiple_low" text NOT NULL,
	"ebitda_multiple_mid" text NOT NULL,
	"ebitda_multiple_high" text NOT NULL,
	"revenue_multiple_low" text NOT NULL,
	"revenue_multiple_mid" text NOT NULL,
	"revenue_multiple_high" text NOT NULL,
	"typical_owner_hours" integer,
	"industry_volatility" text,
	"notes" text,
	"source" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Free valuation tracking for anonymous users
CREATE TABLE "free_valuation_tracking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"anonymous_id" text NOT NULL UNIQUE,
	"ip_address" text,
	"user_agent" text,
	"valuations_used" integer DEFAULT 0 NOT NULL,
	"first_valuation_at" timestamp with time zone,
	"last_valuation_at" timestamp with time zone,
	"converted_to_user_id" uuid,
	"converted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
-- Add indexes for valuations table
CREATE INDEX "valuations_user_id_idx" ON "valuations" ("user_id");
--> statement-breakpoint
CREATE INDEX "valuations_listing_id_idx" ON "valuations" ("listing_id");
--> statement-breakpoint
CREATE INDEX "valuations_anonymous_id_idx" ON "valuations" ("anonymous_id");
--> statement-breakpoint
CREATE INDEX "valuations_industry_idx" ON "valuations" ("industry");
--> statement-breakpoint
CREATE INDEX "valuations_created_at_idx" ON "valuations" ("created_at");
--> statement-breakpoint
-- Add index for free valuation tracking
CREATE INDEX "free_valuation_tracking_ip_idx" ON "free_valuation_tracking" ("ip_address");
--> statement-breakpoint
-- Add foreign key constraints
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "valuations" ADD CONSTRAINT "valuations_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "free_valuation_tracking" ADD CONSTRAINT "free_valuation_tracking_converted_to_user_id_users_id_fk" FOREIGN KEY ("converted_to_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;