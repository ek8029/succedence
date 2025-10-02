import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  jsonb,
  date,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['buyer', 'seller', 'admin', 'broker']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'starter', 'professional', 'enterprise']);
export const userStatusEnum = pgEnum('user_status', ['active', 'inactive', 'banned']);
export const listingStatusEnum = pgEnum('listing_status', ['draft', 'active', 'rejected', 'archived']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  role: userRoleEnum('role').notNull(),
  plan: planTypeEnum('plan').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  status: userStatusEnum('status').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  phone: text('phone'),
  company: text('company'),
  headline: text('headline'),
  location: text('location'),
  avatarUrl: text('avatar_url'),
  kycStatus: text('kyc_status'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Broker profiles table
export const brokerProfiles = pgTable('broker_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  displayName: text('display_name').notNull(),
  headshotUrl: text('headshot_url'),
  bio: text('bio'),
  phone: text('phone'),
  email: text('email'),
  company: text('company'),
  licenseNumber: text('license_number'),
  workAreas: text('work_areas').array(),
  specialties: text('specialties').array(),
  yearsExperience: integer('years_experience'),
  websiteUrl: text('website_url'),
  linkedinUrl: text('linkedin_url'),
  isPublic: text('is_public').notNull().default('true'),
  customSections: jsonb('custom_sections'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Preferences table
export const preferences = pgTable('preferences', {
  userId: uuid('user_id').references(() => users.id).primaryKey(),
  industries: text('industries').array(),
  states: text('states').array(),
  minRevenue: integer('min_revenue'),
  minMetric: integer('min_metric'),
  metricType: text('metric_type'),
  ownerHoursMax: integer('owner_hours_max'),
  priceMax: integer('price_max'),
  alertFrequency: text('alert_frequency'),
  keywords: text('keywords').array(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Listings table
export const listings = pgTable('listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  source: text('source').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  industry: text('industry').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  revenue: integer('revenue'),
  ebitda: integer('ebitda'),
  metricType: text('metric_type'),
  ownerHours: integer('owner_hours'),
  employees: integer('employees'),
  price: integer('price'),
  contactPhone: text('contact_phone'),
  contactEmail: text('contact_email'),
  contactOther: text('contact_other'),
  status: listingStatusEnum('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  ownerUserId: uuid('owner_user_id').references(() => users.id),
  brokerProfileId: uuid('broker_profile_id').references(() => brokerProfiles.id),
}, (table) => ({
  industryStateIdx: index('listings_industry_state_idx').on(table.industry, table.state),
  updatedAtIdx: index('listings_updated_at_idx').on(table.updatedAt),
}));

// Listing media table
export const listingMedia = pgTable('listing_media', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  url: text('url').notNull(),
  kind: text('kind').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Matches table
export const matches = pgTable('matches', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  score: integer('score').notNull(),
  reasonsJson: jsonb('reasons_json'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userCreatedAtIdx: index('matches_user_created_at_idx').on(table.userId, table.createdAt),
}));

// Alerts table
export const alerts = pgTable('alerts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  digestDate: date('digest_date').notNull(),
  listingIds: uuid('listing_ids').array().notNull(),
  type: text('type').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }),
  clickedIds: uuid('clicked_ids').array(),
}, (table) => ({
  userDigestDateIdx: index('alerts_user_digest_date_idx').on(table.userId, table.digestDate),
}));

// Billing events table
export const billingEvents = pgTable('billing_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  rawJson: jsonb('raw_json').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUser: uuid('from_user').references(() => users.id).notNull(),
  toUser: uuid('to_user').references(() => users.id).notNull(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  body: text('body').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// NDAs table
export const ndas = pgTable('ndas', {
  id: uuid('id').primaryKey().defaultRandom(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  buyerUserId: uuid('buyer_user_id').references(() => users.id).notNull(),
  buyerName: text('buyer_name').notNull(),
  status: text('status').notNull().default('REQUESTED'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Audit logs table
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  actorId: uuid('actor_id').references(() => users.id).notNull(),
  action: text('action').notNull(),
  subjectType: text('subject_type').notNull(),
  subjectId: uuid('subject_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// AI analyses table
export const aiAnalyses = pgTable('ai_analyses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  listingId: uuid('listing_id').references(() => listings.id),
  analysisType: text('analysis_type').notNull(), // 'business_analysis', 'buyer_match', 'due_diligence', 'market_intelligence', 'smart_buybox'
  analysisData: jsonb('analysis_data').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userListingTypeIdx: index('ai_analyses_user_listing_type_idx').on(table.userId, table.listingId, table.analysisType),
  createdAtIdx: index('ai_analyses_created_at_idx').on(table.createdAt),
}));

// Saved listings table
export const savedListings = pgTable('saved_listings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  listingId: uuid('listing_id').references(() => listings.id).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('saved_listings_user_id_idx').on(table.userId),
  createdAtIdx: index('saved_listings_created_at_idx').on(table.createdAt),
  uniqueUserListing: index('saved_listings_user_listing_unique').on(table.userId, table.listingId),
}));

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  preferences: one(preferences),
  brokerProfile: one(brokerProfiles),
  ownedListings: many(listings),
  matches: many(matches),
  alerts: many(alerts),
  billingEvents: many(billingEvents),
  sentMessages: many(messages, { relationName: 'sentMessages' }),
  receivedMessages: many(messages, { relationName: 'receivedMessages' }),
  ndas: many(ndas),
  auditLogs: many(auditLogs),
  aiAnalyses: many(aiAnalyses),
  savedListings: many(savedListings),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.userId],
    references: [users.id],
  }),
}));

export const preferencesRelations = relations(preferences, ({ one }) => ({
  user: one(users, {
    fields: [preferences.userId],
    references: [users.id],
  }),
}));

export const brokerProfilesRelations = relations(brokerProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [brokerProfiles.userId],
    references: [users.id],
  }),
  listings: many(listings),
}));

export const listingsRelations = relations(listings, ({ one, many }) => ({
  owner: one(users, {
    fields: [listings.ownerUserId],
    references: [users.id],
  }),
  broker: one(brokerProfiles, {
    fields: [listings.brokerProfileId],
    references: [brokerProfiles.id],
  }),
  media: many(listingMedia),
  matches: many(matches),
  messages: many(messages),
  ndas: many(ndas),
  aiAnalyses: many(aiAnalyses),
  savedByUsers: many(savedListings),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(listings, {
    fields: [listingMedia.listingId],
    references: [listings.id],
  }),
}));

export const matchesRelations = relations(matches, ({ one }) => ({
  user: one(users, {
    fields: [matches.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [matches.listingId],
    references: [listings.id],
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.id],
  }),
}));

export const billingEventsRelations = relations(billingEvents, ({ one }) => ({
  user: one(users, {
    fields: [billingEvents.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUser],
    references: [users.id],
    relationName: 'sentMessages',
  }),
  toUser: one(users, {
    fields: [messages.toUser],
    references: [users.id],
    relationName: 'receivedMessages',
  }),
  listing: one(listings, {
    fields: [messages.listingId],
    references: [listings.id],
  }),
}));

export const ndasRelations = relations(ndas, ({ one }) => ({
  listing: one(listings, {
    fields: [ndas.listingId],
    references: [listings.id],
  }),
  buyer: one(users, {
    fields: [ndas.buyerUserId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

export const aiAnalysesRelations = relations(aiAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [aiAnalyses.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [aiAnalyses.listingId],
    references: [listings.id],
  }),
}));

export const savedListingsRelations = relations(savedListings, ({ one }) => ({
  user: one(users, {
    fields: [savedListings.userId],
    references: [users.id],
  }),
  listing: one(listings, {
    fields: [savedListings.listingId],
    references: [listings.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type BrokerProfile = typeof brokerProfiles.$inferSelect;
export type NewBrokerProfile = typeof brokerProfiles.$inferInsert;
export type Preferences = typeof preferences.$inferSelect;
export type NewPreferences = typeof preferences.$inferInsert;
export type Listing = typeof listings.$inferSelect;
export type NewListing = typeof listings.$inferInsert;
export type ListingMedia = typeof listingMedia.$inferSelect;
export type NewListingMedia = typeof listingMedia.$inferInsert;
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;
export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type NDA = typeof ndas.$inferSelect;
export type NewNDA = typeof ndas.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
export type AIAnalysis = typeof aiAnalyses.$inferSelect;
export type NewAIAnalysis = typeof aiAnalyses.$inferInsert;
export type SavedListing = typeof savedListings.$inferSelect;
export type NewSavedListing = typeof savedListings.$inferInsert;