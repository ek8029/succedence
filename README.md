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
- **Persistence**: Static JSON files in `/data/`
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
├── data/
│   ├── listings.json                # Business listings data
│   ├── ndas.json                    # NDA requests data
│   └── messages.json                # Messages data
├── lib/
│   ├── ai.ts                        # AI helpers (classification, valuation)
│   ├── db.ts                        # JSON persistence helpers
│   └── types.ts                     # TypeScript definitions
├── scripts/
│   └── seed.ts                      # Data reset script
└── README.md
```

## 📊 Data Models

### Listing
```typescript
{
  id: string;
  title: string;
  description: string;
  owner: string;
  industry: string;
  lane: "MAIN" | "STARTER";
  valuationLow: number;
  valuationHigh: number;
  revenue: number;
}
```

### NDARequest
```typescript
{
  id: string;
  listingId: string;
  buyerName: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
}
```

### Message
```typescript
{
  id: string;
  listingId: string;
  from: string;
  body: string;
  timestamp: string;
}
```

### User
```typescript
{
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}
```

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

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Reset Data (Optional)**
   ```bash
   npm run seed
   ```

4. **Open Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

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

## 📊 Seed Data

The app comes with 7 sample listings across different industries:
- **SaaS Analytics Platform** (MAIN lane)
- **Local HVAC Service Business** (MAIN lane)
- **E-commerce Dropshipping Store** (STARTER lane)
- **Digital Marketing Agency** (MAIN lane)
- **Mobile App Development Studio** (STARTER lane)
- **Restaurant Chain** (MAIN lane)
- **Online Fitness Coaching** (STARTER lane)

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

- **Authentication**: Uses localStorage for simplicity (production should use proper auth)
- **Persistence**: JSON files for demo purposes (production should use database)
- **AI Features**: Mocked but demonstrate intended functionality
- **Security**: Basic validation implemented (production needs enhanced security)

## 🚀 Next Steps

For a production version, consider:
- **Database Integration**: PostgreSQL, MongoDB, or similar
- **Real Authentication**: NextAuth.js, Auth0, or custom solution
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
