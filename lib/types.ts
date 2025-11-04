import type { User as DrizzleUser, Profile, BrokerProfile, Preferences, Listing, ListingMedia, Match, Alert, BillingEvent, Message, AuditLog, aiAnalyses, SavedListing } from '../db/schema'
import { InferSelectModel, InferInsertModel } from 'drizzle-orm'

// Database types from Drizzle
export type {
  User as DrizzleUser,
  Profile,
  BrokerProfile,
  Preferences,
  Listing,
  ListingMedia,
  Match,
  Alert,
  BillingEvent,
  Message,
  AuditLog,
  SavedListing
} from '../db/schema'

// AI Analysis type from table
export type AIAnalysis = InferSelectModel<typeof aiAnalyses>

// Enum types
export type UserRole = 'buyer' | 'seller' | 'admin' | 'broker'
export type PlanType = 'free' | 'beta' | 'starter' | 'professional' | 'enterprise'
export type UserStatus = 'active' | 'inactive' | 'banned'
export type ListingStatus = 'draft' | 'active' | 'rejected' | 'archived'
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'not_started'
export type AlertFrequency = 'off' | 'instant' | 'daily' | 'weekly'
export type MediaKind = 'image' | 'document' | 'video'
export type AlertType = 'new_matches' | 'price_drop' | 'new_listing'
export type BillingEventType = 'subscription_created' | 'subscription_updated' | 'subscription_cancelled' | 'payment_succeeded' | 'payment_failed'

// Supabase Database type for type-safe client
export interface Database {
  public: {
    Tables: {
      users: {
        Row: DrizzleUser
        Insert: Omit<DrizzleUser, 'id' | 'createdAt'>
        Update: Partial<Omit<DrizzleUser, 'id' | 'createdAt'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'updatedAt'>
        Update: Partial<Omit<Profile, 'userId' | 'updatedAt'>>
      }
      broker_profiles: {
        Row: BrokerProfile
        Insert: Omit<BrokerProfile, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<BrokerProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
      }
      preferences: {
        Row: Preferences
        Insert: Omit<Preferences, 'updatedAt'>
        Update: Partial<Omit<Preferences, 'userId' | 'updatedAt'>>
      }
      listings: {
        Row: Listing
        Insert: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>>
      }
      listing_media: {
        Row: ListingMedia
        Insert: Omit<ListingMedia, 'id' | 'createdAt'>
        Update: Partial<Omit<ListingMedia, 'id' | 'createdAt'>>
      }
      matches: {
        Row: Match
        Insert: Omit<Match, 'id' | 'createdAt'>
        Update: Partial<Omit<Match, 'id' | 'createdAt'>>
      }
      alerts: {
        Row: Alert
        Insert: Omit<Alert, 'id'>
        Update: Partial<Omit<Alert, 'id'>>
      }
      billing_events: {
        Row: BillingEvent
        Insert: Omit<BillingEvent, 'id' | 'createdAt'>
        Update: Partial<Omit<BillingEvent, 'id' | 'createdAt'>>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, 'id' | 'createdAt'>
        Update: Partial<Omit<Message, 'id' | 'createdAt'>>
      }
      audit_logs: {
        Row: AuditLog
        Insert: Omit<AuditLog, 'id' | 'createdAt'>
        Update: Partial<Omit<AuditLog, 'id' | 'createdAt'>>
      }
      ai_analyses: {
        Row: {
          id: string
          user_id: string
          listing_id: string | null
          analysis_type: string
          analysis_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          listing_id?: string | null
          analysis_type: string
          analysis_data: any
        }
        Update: Partial<{
          user_id: string
          listing_id: string | null
          analysis_type: string
          analysis_data: any
        }>
      }
      saved_listings: {
        Row: SavedListing
        Insert: Omit<SavedListing, 'id' | 'createdAt' | 'updatedAt'>
        Update: Partial<Omit<SavedListing, 'id' | 'createdAt' | 'updatedAt'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      plan_type: PlanType
      user_status: UserStatus
      listing_status: ListingStatus
    }
  }
}

// Extended user type with profile and preferences
export interface UserWithProfile extends DrizzleUser {
  profile?: Profile | null
  preferences?: Preferences | null
  brokerProfile?: BrokerProfile | null
}

// Listing with related data
export interface ListingWithDetails extends Listing {
  owner?: DrizzleUser | null
  broker?: BrokerProfile | null
  media?: ListingMedia[]
  matchCount?: number
}

// Form types for frontend
export interface SignUpFormData {
  email: string
  password: string
  name: string
  role: UserRole
}

export interface ProfileFormData {
  phone?: string
  company?: string
  headline?: string
  location?: string
  avatarUrl?: string
}

export interface BrokerProfileFormData {
  displayName: string
  headshotUrl?: string
  bio?: string
  phone?: string
  email?: string
  company?: string
  licenseNumber?: string
  workAreas?: string[]
  specialties?: string[]
  yearsExperience?: number
  websiteUrl?: string
  linkedinUrl?: string
  isPublic?: string
  customSections?: Record<string, any>
}

export interface PreferencesFormData {
  industries?: string[]
  states?: string[]
  minRevenue?: number
  minMetric?: number
  metricType?: string
  ownerHoursMax?: number
  priceMax?: number
  alertFrequency?: AlertFrequency
  keywords?: string[]
}

export interface ListingFormData {
  title: string
  description: string
  industry: string
  city: string
  state: string
  revenue?: number
  ebitda?: number
  metricType?: string
  ownerHours?: number
  employees?: number
  price?: number
  status: ListingStatus
}

export interface ListingFilters {
  search?: string
  industries?: string[]
  states?: string[]
  minRevenue?: number
  maxRevenue?: number
  minPrice?: number
  maxPrice?: number
  minEmployees?: number
  maxEmployees?: number
  status?: ListingStatus[]
  sortBy?: 'revenue' | 'price' | 'employees' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// API response types
export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
  plan: PlanType
  status: UserStatus
  trialEndsAt?: Date | null
}

// Billing types for Stripe integration
export interface SubscriptionData {
  userId: string
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  plan: PlanType
  status: 'active' | 'canceled' | 'past_due' | 'trialing'
  currentPeriodStart?: Date
  currentPeriodEnd?: Date
  cancelAtPeriodEnd?: boolean
}

export interface BillingEventData {
  type: BillingEventType
  userId: string
  stripeEventId?: string
  amount?: number
  currency?: string
  status?: string
  metadata?: Record<string, any>
}

// Notification types
export interface NotificationData {
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  userId: string
  read?: boolean
  actionUrl?: string
}

// Match scoring types
export interface MatchReasons {
  industryMatch?: boolean
  locationMatch?: boolean
  revenueMatch?: boolean
  priceMatch?: boolean
  employeeMatch?: boolean
  keywordMatch?: string[]
  score: number
  explanation: string
}

export interface MatchWithDetails extends Match {
  listing: ListingWithDetails
  reasons: MatchReasons
}

// Subscription plan configuration
export interface PlanFeatures {
  name: string
  price: number
  description: string
  features: string[]
  aiFeatures: {
    businessAnalysis: boolean
    buyerMatching: boolean
    dueDiligence: boolean
    marketIntelligence: boolean
    maxAnalysesPerMonth: number
  }
  limitations?: string[]
}

export const SUBSCRIPTION_PLANS: Record<PlanType, PlanFeatures> = {
  free: {
    name: 'No Access',
    price: 0,
    description: 'Subscription required for platform access',
    features: [
      'Account created'
    ],
    aiFeatures: {
      businessAnalysis: false,
      buyerMatching: false,
      dueDiligence: false,
      marketIntelligence: false,
      maxAnalysesPerMonth: 0
    },
    limitations: [
      'No access to platform features',
      'No browsing capabilities',
      'Subscription required to continue'
    ]
  },
  beta: {
    name: 'Beta Access',
    price: 0,
    description: 'Complimentary access for beta participants',
    features: [
      'Full platform access',
      'All Professional features',
      'Beta feedback priority',
      'Early feature access'
    ],
    aiFeatures: {
      businessAnalysis: true,
      buyerMatching: true,
      dueDiligence: true,
      marketIntelligence: true,
      maxAnalysesPerMonth: 50
    },
    limitations: [
      'Beta access expires after 30 days',
      'Admin can revoke access'
    ]
  },
  starter: {
    name: 'Starter',
    price: 19.99,
    description: 'Essential tools for serious buyers',
    features: [
      'All Free features',
      'Advanced search filters',
      'Basic AI insights',
      'Priority support'
    ],
    aiFeatures: {
      businessAnalysis: true,
      buyerMatching: false,
      dueDiligence: false,
      marketIntelligence: false,
      maxAnalysesPerMonth: 5
    },
    limitations: [
      'Limited to 5 AI analyses per month',
      'Basic AI features only'
    ]
  },
  professional: {
    name: 'Professional',
    price: 49.99,
    description: 'Full acquisition intelligence suite',
    features: [
      'All Starter features',
      'Complete AI analysis suite',
      'Due diligence assistant',
      'Market intelligence',
      'Export capabilities'
    ],
    aiFeatures: {
      businessAnalysis: true,
      buyerMatching: true,
      dueDiligence: true,
      marketIntelligence: true,
      maxAnalysesPerMonth: 50
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 99.99,
    description: 'Unlimited access for power users',
    features: [
      'All Professional features',
      'Unlimited AI analyses',
      'Priority processing',
      'Custom integrations',
      'Dedicated support'
    ],
    aiFeatures: {
      businessAnalysis: true,
      buyerMatching: true,
      dueDiligence: true,
      marketIntelligence: true,
      maxAnalysesPerMonth: -1 // -1 means unlimited
    }
  }
}