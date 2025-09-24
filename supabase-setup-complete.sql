-- Complete Supabase setup to enable AI features
-- Run this entire script in your Supabase SQL Editor

-- 1. Create the users table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text NOT NULL,
	"plan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"status" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- 2. Create other essential tables
CREATE TABLE IF NOT EXISTS "profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"phone" text,
	"company" text,
	"headline" text,
	"location" text,
	"avatar_url" text,
	"kyc_status" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "preferences" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"industries" text[],
	"states" text[],
	"min_revenue" integer,
	"min_metric" integer,
	"metric_type" text,
	"owner_hours_max" integer,
	"price_max" integer,
	"alert_frequency" text,
	"keywords" text[],
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Insert/update your admin user record with enterprise plan
INSERT INTO users (id, email, name, role, plan, status, created_at)
VALUES (
    'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
    'evank8029@gmail.com',
    'Evan Kim',
    'admin',
    'enterprise',
    'active',
    now()
)
ON CONFLICT (email)
DO UPDATE SET
    role = 'admin',
    plan = 'enterprise',
    status = 'active',
    name = 'Evan Kim';

-- 4. Create basic profile for admin user
INSERT INTO profiles (user_id, company, headline, kyc_status, updated_at)
VALUES (
    'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
    'Succedence',
    'Platform Administrator',
    'verified',
    now()
)
ON CONFLICT (user_id)
DO UPDATE SET
    company = 'Succedence',
    headline = 'Platform Administrator',
    kyc_status = 'verified';

-- 5. Create default preferences for admin user
INSERT INTO preferences (user_id, alert_frequency, updated_at)
VALUES (
    'a041dff2-d833-49e3-bdf3-1a5c02523ce1',
    'weekly',
    now()
)
ON CONFLICT (user_id)
DO UPDATE SET
    alert_frequency = 'weekly';

-- 6. Add foreign key constraints (if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'profiles_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'preferences_user_id_users_id_fk'
    ) THEN
        ALTER TABLE "preferences" ADD CONSTRAINT "preferences_user_id_users_id_fk"
        FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
    END IF;
END $$;

-- 7. Verify the setup
SELECT 'Setup verification:' as status;
SELECT 'User created/updated:' as step, id, email, name, role, plan, status
FROM users WHERE email = 'evank8029@gmail.com';

SELECT 'Profile created:' as step, user_id, company, headline, kyc_status
FROM profiles WHERE user_id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';

SELECT 'Preferences created:' as step, user_id, alert_frequency
FROM preferences WHERE user_id = 'a041dff2-d833-49e3-bdf3-1a5c02523ce1';