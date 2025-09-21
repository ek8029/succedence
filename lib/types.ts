import type { User as DrizzleUser, Profile, Preferences, Listing, ListingMedia, Match, Alert, BillingEvent, Message, AuditLog } from '../db/schema'

// Database types from Drizzle
export type {
  User as DrizzleUser,
  Profile,
  Preferences,
  Listing,
  ListingMedia,
  Match,
  Alert,
  BillingEvent,
  Message,
  AuditLog
} from '../db/schema'

// Enum types
export type UserRole = 'buyer' | 'seller' | 'admin'
export type PlanType = 'free' | 'pro' | 'enterprise'
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
}

// Listing with related data
export interface ListingWithDetails extends Listing {
  owner?: DrizzleUser | null
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