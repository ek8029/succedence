# Succedence - AI-Assisted Business Marketplace

A modern, dark-themed AI-assisted business marketplace built with Next.js 14, TypeScript, and TailwindCSS. Features iOS-style dark mode, role-based authentication, advanced filtering, messaging system, and admin dashboard.

## ✨ Features

- **🌙 iOS Dark Mode**: Beautiful dark theme with iOS-style colors and design
- **🔐 Role-Based Authentication**: Login as BUYER, SELLER, or ADMIN with different permissions
- **🔍 Advanced Filtering**: Filter listings by industry, lane (MAIN/STARTER), and minimum revenue
- **📋 NDA Management**: Request, approve, and manage NDA access with role-based controls
- **💬 Messaging System**: Threaded messaging between buyers and sellers (after NDA approval)
- **📊 Admin Dashboard**: Comprehensive analytics and lane management for administrators
- **🤖 AI-Powered Insights**: Automatic business classification and valuation estimation
- **📱 Responsive Design**: Mobile-friendly interface with modern UI/UX

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + TailwindCSS
- **Backend**: Next.js API Routes with validation
- **Database**: PostgreSQL with Drizzle ORM
- **Persistence**: Relational database with migrations
- **AI**: Mock AI helpers for classification and valuation
- **Authentication**: LocalStorage-based session management

## 📁 Project Structure

```
succedence/
├── app/
│   ├── api/
│   │   ├── admin/route.ts           # Admin dashboard & lane management
│   │   ├── listings/route.ts        # GET/POST listings with filtering
│   │   ├── messages/route.ts        # GET/POST messages
│   │   ├── ndas/route.ts            # GET/POST NDAs
│   │   └── ndas/[id]/route.ts       # PATCH NDA status updates
│   ├── auth/page.tsx                # Authentication page
│   ├── admin/page.tsx               # Admin dashboard
│   ├── browse/page.tsx              # Browse listings with filters
│   ├── listings/
│   │   ├── [id]/page.tsx            # Individual listing detail
│   │   └── new/page.tsx             # Create new listing
│   ├── globals.css                  # Dark mode styles
│   ├── layout.tsx                   # Root layout with navbar
│   └── page.tsx                     # Landing page
├── components/
│   └── Navbar.tsx                   # Navigation with user info
├── db/
│   ├── connection.ts                # Database connection
│   ├── schema.ts                    # Drizzle schema definitions
│   ├── helpers.ts                   # Database helper functions
│   └── index.ts                     # Database exports
├── drizzle/
│   └── *.sql                        # Database migrations
├── lib/
│   ├── ai.ts                        # AI helpers (classification, valuation)
│   └── types.ts                     # TypeScript definitions
├── scripts/
│   └── seed.ts                      # Database seeding script
├── drizzle.config.ts                # Drizzle configuration
├── .env.example                     # Environment variables template
└── README.md
```

## 🗄️ Database Schema

### Core Tables

#### Users
```sql
users(
  id uuid pk,
  email text unique,
  name text,
  role text,
  plan text,
  created_at timestamptz default now(),
  status text
)
```

#### Profiles
```sql
profiles(
  user_id fk→users,
  phone text,
  company text,
  headline text,
  location text,
  avatar_url text,
  kyc_status text,
  updated_at timestamptz default now()
)
```

#### Preferences
```sql
preferences(
  user_id fk→users,
  industries text[],
  states text[],
  min_revenue int,
  min_metric int,
  metric_type text,
  owner_hours_max int,
  price_max int,
  alert_frequency text,
  keywords text[],
  updated_at timestamptz default now()
)
```

#### Listings
```sql
listings(
  id uuid pk,
  source text,
  title text,
  description text,
  industry text,
  city text,
  state text,
  revenue int,
  ebitda int,
  metric_type text,
  owner_hours int,
  employees int,
  price int,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  owner_user_id uuid null
)
```

### Supporting Tables

#### Listing Media
```sql
listing_media(
  id uuid pk,
  listing_id fk,
  url text,
  kind text,
  created_at timestamptz default now()
)
```

#### Matches
```sql
matches(
  id uuid pk,
  user_id fk,
  listing_id fk,
  score int,
  reasons_json jsonb,
  created_at timestamptz default now()
)
```

#### Alerts
```sql
alerts(
  id uuid pk,
  user_id fk,
  digest_date date,
  listing_ids uuid[],
  type text,
  opened_at timestamptz null,
  clicked_ids uuid[] null
)
```

#### Messages
```sql
messages(
  id uuid pk,
  from_user fk,
  to_user fk,
  listing_id fk,
  body text,
  created_at timestamptz default now()
)
```

#### Billing Events & Audit Logs
```sql
billing_events(
  id uuid pk,
  user_id fk,
  type text,
  raw_json jsonb,
  created_at timestamptz default now()
)

audit_logs(
  id uuid pk,
  actor_id fk,
  action text,
  subject_type text,
  subject_id uuid,
  created_at timestamptz default now()
)
```

### Database Indexes

- `listings(industry, state)` - For location-based filtering
- `listings(updated_at desc)` - For chronological sorting
- `matches(user_id, created_at desc)` - For user match history
- `alerts(user_id, digest_date desc)` - For user alert retrieval

## 🎨 Dark Mode Design

The app features a beautiful iOS-style dark theme with:
- **Background**: Pure black (#000000)
- **Cards**: Dark gray (#1c1c1e)
- **Primary**: iOS Blue (#0a84ff)
- **Success**: iOS Green (#30d158)
- **Warning**: iOS Orange (#ff9f0a)
- **Error**: iOS Red (#ff453a)

## 🤖 AI Features

- **Lane Classification**: Automatically classifies businesses as MAIN (revenue > $100k) or STARTER
- **Valuation Estimation**: Estimates valuation range at 2-3x annual revenue
- **Industry Classification**: AI-powered industry detection based on business description
- **Instant Processing**: Real-time classification and valuation on listing creation

## 🔐 Authentication & Roles

### BUYER
- Browse all listings
- Request NDA access
- Send messages (after NDA approval)
- View data room (after NDA approval)

### SELLER
- Browse all listings
- Create new listings
- Approve/deny NDA requests for their listings
- Send messages to approved buyers

### ADMIN
- All BUYER and SELLER permissions
- Access admin dashboard
- View platform statistics
- Manually reclassify listing lanes
- Monitor NDA requests and messages

## 🚀 Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env with your PostgreSQL database URL
   # DATABASE_URL="postgresql://username:password@localhost:5432/dealsense"

   # Generate and run migrations
   npm run db:generate
   npm run db:push

   # Seed the database with sample data
   npm run seed
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Scripts

- `npm run db:generate` - Generate new migrations from schema changes
- `npm run db:migrate` - Run pending migrations
- `npm run db:push` - Push schema changes directly to database
- `npm run db:studio` - Open Drizzle Studio for database exploration
- `npm run seed` - Populate database with sample data

## 📖 Usage Guide

### Getting Started
1. **Login**: Click "Login" and enter your name and select your role
2. **Browse**: Use filters to find businesses by industry, lane, or revenue
3. **Interact**: Request NDAs, send messages, and manage listings based on your role

### For Buyers
1. Browse listings and use filters to find opportunities
2. Request NDA access to listings you're interested in
3. Once NDA is approved, access the data room and start messaging

### For Sellers
1. Create listings for your business
2. Review and approve/deny NDA requests
3. Communicate with approved buyers through messaging

### For Admins
1. Access the admin dashboard via the navbar
2. View platform statistics and manage listing lanes
3. Monitor all NDA requests and messages

## 📊 Database Helper Functions

The `/db/helpers.ts` file provides typed helper functions for common database operations:

### User Operations
- `createUser(userData)` - Create a new user
- `getUserById(id)` - Get user by ID
- `getUserByEmail(email)` - Get user by email
- `updateUser(id, updates)` - Update user data

### Profile & Preferences
- `upsertProfile(profileData)` - Create or update user profile
- `getProfileByUserId(userId)` - Get user profile
- `upsertPreferences(preferencesData)` - Create or update user preferences
- `getPreferencesByUserId(userId)` - Get user preferences

### Listing Operations
- `createListing(listingData)` - Create a new listing
- `getListingById(id)` - Get listing by ID
- `getListings(filters?)` - Get filtered listings
- `updateListing(id, updates)` - Update listing
- `searchListings(searchTerm)` - Search listings by title

### Complex Queries
- `getUserWithProfileAndPreferences(userId)` - Get complete user data
- `getListingWithMedia(listingId)` - Get listing with media files
- `getRecommendedListings(userId)` - Get personalized recommendations

## 📊 Seed Data

The database seeding script creates realistic sample data:
- **3 Users**: Buyer, Seller, and Broker with complete profiles
- **20 Business Listings** across various industries:
  - Italian Restaurant (Austin, TX) - $650K
  - Tech Consulting Firm (San Francisco, CA) - $1.8M
  - Auto Repair Shop (Dallas, TX) - $495K
  - Marketing Agency (Miami, FL) - $1.4M
  - Coffee Shop Chain (Phoenix, AZ) - $850K
  - E-commerce Business (Denver, CO) - $2.8M
  - HVAC Service Company (Atlanta, GA) - $1.6M
  - Manufacturing (Houston, TX) - $2.2M
  - Dental Practice (Plano, TX) - $900K
  - Pet Grooming Chain (Scottsdale, AZ) - $385K
  - And 10 more diverse businesses...

## 🔌 API Endpoints

### Listings
- `GET /api/listings` - Fetch all listings (supports filtering)
- `POST /api/listings` - Create new listing

### NDAs
- `GET /api/ndas` - Fetch all NDA requests
- `POST /api/ndas` - Create new NDA request
- `PATCH /api/ndas/[id]` - Update NDA status (approve/deny)

### Messages
- `GET /api/messages?listingId=X` - Fetch messages for a listing
- `POST /api/messages` - Create new message

### Admin
- `GET /api/admin` - Fetch dashboard statistics
- `PATCH /api/admin` - Update listing lane

## 🧪 Testing & Validation

- All API endpoints include payload validation
- Input sanitization and error handling
- Role-based access control
- Data integrity checks

## 🔧 Development Notes

- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Migrations**: Automatically generated SQL migrations with versioning
- **Type Safety**: Full TypeScript types inferred from database schema
- **Authentication**: Uses localStorage for simplicity (production should use proper auth)
- **AI Features**: Mocked but demonstrate intended functionality
- **Security**: Basic validation implemented (production needs enhanced security)

## 🚀 Next Steps

For a production version, consider:
- **Real Authentication**: NextAuth.js, Auth0, or custom solution
- **Database Scaling**: Connection pooling, read replicas, caching
- **Real AI/ML**: OpenAI API, custom models, or third-party services
- **Enhanced Security**: JWT tokens, rate limiting, input validation
- **Real-time Features**: WebSockets for live messaging
- **File Upload**: Document sharing for due diligence
- **Email Notifications**: Automated alerts for NDA requests
- **Advanced Analytics**: Business intelligence and reporting
- **Mobile App**: React Native or native mobile apps
- **Payment Integration**: Stripe, PayPal for transaction fees

## 📝 License

This is a proof-of-concept project for demonstration purposes.
