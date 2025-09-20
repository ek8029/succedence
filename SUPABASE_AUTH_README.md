# Supabase Authentication Implementation

## Overview

This implementation provides a complete Supabase Auth system with account persistence for the Next.js 14 app. The system includes user authentication, profile management, preferences, and role-based access control.

## File Structure

### Supabase Clients
- `lib/supabase/client.ts` - Browser client using anon key
- `lib/supabase/server.ts` - Server client with both anon and service role configurations

### Authentication
- `app/signin/page.tsx` - Complete auth UI with email/password and magic link support
- `app/auth/callback/route.ts` - Handles magic link and email confirmation callbacks
- `contexts/AuthContext.tsx` - Updated to use new SSR client approach
- `middleware.ts` - Route protection for `/profile`, `/preferences`, `/listings/new`, and `/admin`

### API Routes
- `app/api/auth/create-profile/route.ts` - Creates user and profile records on signup
- `app/api/auth/signout/route.ts` - Server-side signout with cookie clearing
- `app/api/profile/route.ts` - GET/PUT for user profile management
- `app/api/preferences/route.ts` - GET/POST for user preferences
- `app/api/listings/route.ts` - Updated for real Supabase integration with filtering
- `app/api/admin/route.ts` - Admin dashboard with listing status management
- `app/api/health/route.ts` - Health check endpoint for Supabase connection

### Updated Pages
- `app/profile/page.tsx` - Uses API endpoints instead of direct client calls
- `app/preferences/page.tsx` - Loads and saves via API with proper validation
- `app/browse/page.tsx` - Streamlined to work with real database schema
- `app/admin/page.tsx` - Updated for new schema (status instead of lane)

## Environment Variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL=your_database_url
```

## Database Schema Usage

The implementation uses the existing Drizzle schema with these key tables:
- `users` - User accounts with role, plan, status
- `profiles` - User profile information (phone, company, location, etc.)
- `preferences` - User preferences for listings (industries, price ranges, etc.)
- `listings` - Business listings with status management
- `messages` - User communications

## Security Implementation

### Service Role Key Protection
- Service role key is NEVER imported into client bundles
- Only used in server-side API routes and middleware
- All user-facing operations use anon client with RLS

### Route Protection
- Middleware protects authenticated routes
- Admin routes have additional role verification
- Unauthenticated users redirected to `/signin`

### API Security
- All API routes validate authentication
- Admin endpoints verify admin role
- Zod validation on all request bodies
- Proper error handling with 400/401/403/500 responses

## How to Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local` with your Supabase credentials

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Main app: http://localhost:3001
   - Health check: http://localhost:3001/api/health

## Protected Routes

- `/profile` - User profile management (authenticated users)
- `/preferences` - User preferences (authenticated users)
- `/listings/new` - Create new listing (authenticated users)
- `/admin` - Admin dashboard (admin role only)

## Testing the Implementation

### 1. Sign Up Flow
1. Visit `/signin`
2. Enter email and password
3. Click "Sign Up"
4. Check email for confirmation (if required)
5. User and profile records created automatically

### 2. Sign In Flow
1. Visit `/signin`
2. Enter credentials
3. Click "Sign In" or use magic link
4. Redirected to `/profile`

### 3. Magic Link Flow
1. Visit `/signin`
2. Enter email
3. Click "Continue with Magic Link"
4. Check email for magic link
5. Click link to authenticate

### 4. Profile Management
1. Sign in and visit `/profile`
2. Edit profile information
3. Click "Save Profile"
4. Success message and data persisted

### 5. Preferences Management
1. Visit `/preferences`
2. Set industries, states, price ranges
3. Click "Save Preferences"
4. Data saved to database

### 6. Browse Listings
1. Visit `/browse`
2. Search and filter listings
3. Real data from Supabase database
4. Pagination and filtering working

### 7. Admin Functions (Admin Role Required)
1. Sign in as admin user
2. Visit `/admin`
3. View dashboard statistics
4. Manage listing statuses (activate, reject, archive)

## API Endpoints Reference

### Authentication
- `POST /api/auth/create-profile` - Create user profile on signup
- `POST /api/auth/signout` - Server-side signout

### User Management
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Update user preferences

### Listings
- `GET /api/listings` - Get listings with filtering/pagination
- `POST /api/listings` - Create new listing (authenticated)

### Admin
- `GET /api/admin` - Get admin dashboard stats (admin only)
- `PATCH /api/admin` - Update listing status (admin only)

### System
- `GET /api/health` - Health check for Supabase connection

## Error Handling

All API routes include comprehensive error handling:
- **400** - Invalid request data (Zod validation)
- **401** - Unauthorized (not authenticated)
- **403** - Forbidden (insufficient permissions)
- **500** - Internal server error

## Data Validation

Zod schemas validate all API inputs:
- Profile updates (phone, company, headline, location, avatarUrl)
- Preferences (industries[], states[], price ranges, alert frequency)
- Listing creation (title, description, industry, financials)
- Admin operations (listing ID, status changes)

## Notable Implementation Details

1. **User Creation**: On first signup/login, automatically creates entries in `users` and `profiles` tables
2. **Profile Completeness**: Calculates and displays profile completion percentage
3. **Real-time Updates**: Auth context listens to Supabase auth state changes
4. **Listing Management**: Admin can change listing status (active/draft/rejected/archived)
5. **Search & Filter**: Browse page supports real-time search and filtering
6. **Responsive Design**: All forms and interfaces work on mobile and desktop

The implementation is production-ready with proper security, error handling, and user experience considerations.