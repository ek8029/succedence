# Broker Feature Testing Guide

## Overview
This document outlines the steps to test the new broker role functionality.

## Prerequisites

### 1. Run Database Migration
**IMPORTANT:** You must run the database migration first before testing!

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire contents of `scripts/add-broker-role.sql`
6. Paste it into the SQL editor
7. Click "Run" or press Cmd/Ctrl + Enter
8. You should see success messages confirming:
   - Broker role added to user_role enum
   - broker_profiles table created
   - broker_profile_id column added to listings table

### 2. Verify Migration Success
In the SQL Editor, run:
```sql
SELECT enumlabel as user_roles
FROM pg_enum
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumlabel;
```
You should see: admin, broker, buyer, seller

## Testing Steps

### Phase 1: Admin Creates Broker Profile

1. **Login as Admin**
   - Go to http://localhost:3000
   - Login with an admin account

2. **Navigate to Broker Management**
   - Go to http://localhost:3000/admin
   - Click "Manage Brokers" (you may need to add this link to the admin dashboard)
   - Or directly visit: http://localhost:3000/admin/brokers

3. **Create a New Broker**
   - Click "Create New Broker" button
   - Fill in the form:
     - **Select User**: Choose an existing user to convert to broker
     - **Display Name**: e.g., "John Smith"
     - **Email**: broker@example.com
     - **Phone**: (555) 123-4567
     - **Bio**: A professional bio about the broker
     - **Company**: e.g., "Elite Business Brokers"
     - **License Number**: e.g., "BRE-12345"
     - **Years of Experience**: e.g., 10
     - **Work Areas**: e.g., California, Nevada, Arizona
     - **Specialties**: e.g., Restaurants, Retail, Healthcare
     - **Website URL**: https://example.com
     - **LinkedIn URL**: https://linkedin.com/in/example
     - **Headshot URL**: (Optional) URL to a profile image
     - **Public Profile**: Check to make profile publicly viewable
   - Click "Create Broker"
   - Verify success message appears

4. **Verify Broker Creation**
   - You should see the new broker in the list
   - The selected user's role should now be "broker"
   - All broker details should be displayed

### Phase 2: View Broker Profile

1. **Access Public Broker Profile**
   - Copy the broker ID from the admin panel
   - Visit: http://localhost:3000/brokers/[broker-id]
   - Verify all broker information displays correctly:
     - Headshot (if provided)
     - Display name and company
     - Contact information (email, phone)
     - Bio section
     - Work areas and specialties as badges
     - Years of experience
     - Links to website and LinkedIn

2. **Test Private Profile**
   - In admin panel, edit the broker
   - Uncheck "Public Profile"
   - Save changes
   - Try accessing the broker profile URL again
   - Should see "Profile Not Available" message

### Phase 3: API Testing

1. **Test GET All Brokers (Public)**
   ```bash
   curl http://localhost:3000/api/brokers
   ```
   - Should return array of public broker profiles

2. **Test GET Single Broker (Public)**
   ```bash
   curl http://localhost:3000/api/brokers/[broker-id]
   ```
   - Should return broker details if public

3. **Test Admin Endpoints** (requires authentication)
   ```bash
   # Get all brokers (admin only)
   curl http://localhost:3000/api/admin/brokers

   # Create broker (admin only)
   curl -X POST http://localhost:3000/api/admin/brokers \
     -H "Content-Type: application/json" \
     -d '{"userId":"user-id","displayName":"Test Broker",...}'

   # Update broker (admin only)
   curl -X PUT http://localhost:3000/api/admin/brokers/[broker-id] \
     -H "Content-Type: application/json" \
     -d '{"displayName":"Updated Name"}'

   # Delete broker (admin only)
   curl -X DELETE http://localhost:3000/api/admin/brokers/[broker-id]
   ```

### Phase 4: Edit Broker Profile

1. **Edit Existing Broker**
   - In admin broker management page
   - Click "Edit" on a broker
   - Modify any fields
   - Click "Update Broker"
   - Verify changes are reflected

2. **Test Field Validations**
   - Try submitting with empty display name (should fail)
   - Try invalid email format (should fail)
   - Try invalid URL formats (should fail)

### Phase 5: Delete Broker Profile

1. **Delete Broker**
   - Click "Delete" on a broker
   - Confirm deletion
   - Verify broker is removed from list
   - Check that user still exists but role may need manual adjustment

### Phase 6: Integration with Listings (Future Enhancement)

**Note:** The database is ready but UI integration needs to be added:

1. When creating/editing a listing, admins should be able to:
   - Select a broker from dropdown
   - Attach broker to listing
   - View attached broker info on listing detail page

2. Listing detail pages should show:
   - Broker contact card if broker is attached
   - Link to broker profile

## Troubleshooting

### Migration Fails
- Check if you have the correct Supabase credentials
- Verify you have admin access in Supabase
- Check PostgreSQL logs in Supabase dashboard

### "Forbidden" Errors
- Ensure you're logged in as an admin user
- Check that your user role is 'admin' in the database
- Verify authentication tokens are valid

### Broker Profile Not Showing
- Verify is_public is set to 'true'
- Check browser console for errors
- Verify API is returning data correctly

### Type Errors
- Run `npm run build` to check for TypeScript errors
- All type errors should be resolved

## Database Schema Reference

### broker_profiles Table
```sql
- id: uuid (primary key)
- user_id: uuid (unique, foreign key to users)
- display_name: text (required)
- headshot_url: text (optional)
- bio: text (optional)
- phone: text (optional)
- email: text (optional)
- company: text (optional)
- license_number: text (optional)
- work_areas: text[] (array, optional)
- specialties: text[] (array, optional)
- years_experience: integer (optional)
- website_url: text (optional)
- linkedin_url: text (optional)
- is_public: text (default 'true')
- custom_sections: jsonb (optional)
- created_at: timestamp
- updated_at: timestamp
```

### listings Table Addition
```sql
- broker_profile_id: uuid (foreign key to broker_profiles, optional)
```

## Success Criteria

✅ Database migration runs successfully
✅ Admin can create broker profiles
✅ Admin can edit broker profiles
✅ Admin can delete broker profiles
✅ Public broker profiles are viewable
✅ Private broker profiles are hidden
✅ All API endpoints work correctly
✅ No TypeScript errors
✅ No runtime errors in browser console

## Next Steps

After successful testing:
1. Add broker selector to listing forms
2. Display broker info on listing detail pages
3. Add broker directory page (list all public brokers)
4. Implement broker dashboard (for broker users to manage their profile)
5. Add analytics for broker performance
