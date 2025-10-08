# Database Schema Update Required

## ⚠️ Important: Manual Database Update Needed

The broker profile feature now supports standalone brokers (brokers without user accounts). To enable this functionality, you need to update your Supabase database schema.

### Required Change:

Make the `user_id` column in `broker_profiles` table **nullable**.

### How to Apply (Supabase Dashboard):

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL command:

```sql
-- Make user_id nullable in broker_profiles table
ALTER TABLE broker_profiles
ALTER COLUMN user_id DROP NOT NULL;

-- Remove unique constraint if it exists
ALTER TABLE broker_profiles
DROP CONSTRAINT IF EXISTS broker_profiles_user_id_key;
```

### Why This Change is Needed:

**Before:** Every broker profile required linking to a user account
- Problem: Can't onboard brokers who don't use the platform

**After:** Broker profiles can exist with or without user accounts
- ✅ Standalone brokers: Just contact info (email, phone)
- ✅ Platform brokers: Linked to user account with login access
- Required fields are now: `display_name`, `email`, `phone`

### Schema Changes:

**Old:**
```typescript
userId: uuid('user_id').references(() => users.id).notNull().unique()
```

**New:**
```typescript
userId: uuid('user_id').references(() => users.id).unique() // nullable
```

### Use Cases:

1. **Standalone Broker** (no user_id):
   - Broker from external brokerage
   - Contact info displayed on listings
   - No platform login

2. **Platform Broker** (with user_id):
   - Internal broker with account
   - Can manage their own listings
   - Full platform access

### After Applying:

Once you've run the SQL command in Supabase, the feature will work correctly:
- Creating brokers without selecting a user will work
- Broker profiles will show contact info on listings
- No more database constraint errors

---

**Status:** ✅ Code deployed, awaiting database schema update
**Deployed:** Commit 5238e70
