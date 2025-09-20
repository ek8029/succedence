import { eq, and, desc, gte, lte, ilike, inArray } from 'drizzle-orm';
import type { ListingStatus } from '../lib/types';
import { db } from './connection';
import {
  users,
  profiles,
  preferences,
  listings,
  matches,
  alerts,
  listingMedia,
  billingEvents,
  messages,
  auditLogs,
  type User,
  type NewUser,
  type Profile,
  type NewProfile,
  type Preferences,
  type NewPreferences,
  type Listing,
  type NewListing,
  type Match,
  type NewMatch,
  type Alert,
  type NewAlert,
  type ListingMedia,
  type NewListingMedia,
  type BillingEvent,
  type NewBillingEvent,
  type Message,
  type NewMessage,
  type AuditLog,
  type NewAuditLog,
} from './schema';

// User operations
export async function createUser(userData: NewUser): Promise<User> {
  const [user] = await db.insert(users).values(userData).returning();
  return user;
}

export async function getUserById(id: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user || null;
}

export async function updateUser(id: string, updates: Partial<NewUser>): Promise<User> {
  const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
  return user;
}

// Profile operations
export async function upsertProfile(profileData: NewProfile): Promise<Profile> {
  const [profile] = await db
    .insert(profiles)
    .values(profileData)
    .onConflictDoUpdate({
      target: profiles.userId,
      set: {
        ...profileData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return profile;
}

export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId));
  return profile || null;
}

// Preferences operations
export async function upsertPreferences(preferencesData: NewPreferences): Promise<Preferences> {
  const [prefs] = await db
    .insert(preferences)
    .values(preferencesData)
    .onConflictDoUpdate({
      target: preferences.userId,
      set: {
        ...preferencesData,
        updatedAt: new Date(),
      },
    })
    .returning();
  return prefs;
}

export async function getPreferencesByUserId(userId: string): Promise<Preferences | null> {
  const [prefs] = await db.select().from(preferences).where(eq(preferences.userId, userId));
  return prefs || null;
}

// Listing operations
export async function createListing(listingData: NewListing): Promise<Listing> {
  const [listing] = await db.insert(listings).values(listingData).returning();
  return listing;
}

export async function getListingById(id: string): Promise<Listing | null> {
  const [listing] = await db.select().from(listings).where(eq(listings.id, id));
  return listing || null;
}

export async function getListings(filters?: {
  industry?: string;
  state?: string;
  minRevenue?: number;
  maxPrice?: number;
  status?: ListingStatus | ListingStatus[];
  limit?: number;
  offset?: number;
}): Promise<Listing[]> {
  let query: any = db.select().from(listings);

  const conditions: any[] = [];

  if (filters?.industry) {
    conditions.push(eq(listings.industry, filters.industry));
  }

  if (filters?.state) {
    conditions.push(eq(listings.state, filters.state));
  }

  if (filters?.minRevenue) {
    conditions.push(gte(listings.revenue, filters.minRevenue));
  }

  if (filters?.maxPrice) {
    conditions.push(lte(listings.price, filters.maxPrice));
  }

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      conditions.push(inArray(listings.status, filters.status));
    } else {
      conditions.push(eq(listings.status, filters.status));
    }
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  query = query.orderBy(desc(listings.updatedAt));

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.offset(filters.offset);
  }

  return await query;
}

export async function updateListing(id: string, updates: Partial<NewListing>): Promise<Listing> {
  const [listing] = await db
    .update(listings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(listings.id, id))
    .returning();
  return listing;
}

export async function searchListings(searchTerm: string, limit = 20): Promise<Listing[]> {
  return await db
    .select()
    .from(listings)
    .where(ilike(listings.title, `%${searchTerm}%`))
    .orderBy(desc(listings.updatedAt))
    .limit(limit);
}

// Match operations
export async function createMatch(matchData: NewMatch): Promise<Match> {
  const [match] = await db.insert(matches).values(matchData).returning();
  return match;
}

export async function getMatchesByUserId(userId: string, limit = 50): Promise<Match[]> {
  return await db
    .select()
    .from(matches)
    .where(eq(matches.userId, userId))
    .orderBy(desc(matches.createdAt))
    .limit(limit);
}

export async function getMatchesByListingId(listingId: string): Promise<Match[]> {
  return await db
    .select()
    .from(matches)
    .where(eq(matches.listingId, listingId))
    .orderBy(desc(matches.score));
}

// Alert operations
export async function createAlert(alertData: NewAlert): Promise<Alert> {
  const [alert] = await db.insert(alerts).values(alertData).returning();
  return alert;
}

export async function getAlertsByUserId(userId: string, limit = 20): Promise<Alert[]> {
  return await db
    .select()
    .from(alerts)
    .where(eq(alerts.userId, userId))
    .orderBy(desc(alerts.digestDate))
    .limit(limit);
}

export async function markAlertAsOpened(alertId: string): Promise<Alert> {
  const [alert] = await db
    .update(alerts)
    .set({ openedAt: new Date() })
    .where(eq(alerts.id, alertId))
    .returning();
  return alert;
}

export async function updateAlertClickedIds(alertId: string, clickedIds: string[]): Promise<Alert> {
  const [alert] = await db
    .update(alerts)
    .set({ clickedIds })
    .where(eq(alerts.id, alertId))
    .returning();
  return alert;
}

// Listing media operations
export async function addListingMedia(mediaData: NewListingMedia): Promise<ListingMedia> {
  const [media] = await db.insert(listingMedia).values(mediaData).returning();
  return media;
}

export async function getListingMedia(listingId: string): Promise<ListingMedia[]> {
  return await db
    .select()
    .from(listingMedia)
    .where(eq(listingMedia.listingId, listingId))
    .orderBy(desc(listingMedia.createdAt));
}

// Billing event operations
export async function createBillingEvent(eventData: NewBillingEvent): Promise<BillingEvent> {
  const [event] = await db.insert(billingEvents).values(eventData).returning();
  return event;
}

export async function getBillingEventsByUserId(userId: string): Promise<BillingEvent[]> {
  return await db
    .select()
    .from(billingEvents)
    .where(eq(billingEvents.userId, userId))
    .orderBy(desc(billingEvents.createdAt));
}

// Message operations
export async function createMessage(messageData: NewMessage): Promise<Message> {
  const [message] = await db.insert(messages).values(messageData).returning();
  return message;
}

export async function getMessagesByUserId(userId: string, limit = 50): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .where(
      and(
        eq(messages.fromUser, userId),
        eq(messages.toUser, userId)
      )
    )
    .orderBy(desc(messages.createdAt))
    .limit(limit);
}

export async function getMessagesByListingId(listingId: string): Promise<Message[]> {
  return await db
    .select()
    .from(messages)
    .where(eq(messages.listingId, listingId))
    .orderBy(desc(messages.createdAt));
}

// Audit log operations
export async function createAuditLog(logData: NewAuditLog): Promise<AuditLog> {
  const [log] = await db.insert(auditLogs).values(logData).returning();
  return log;
}

export async function getAuditLogsByActor(actorId: string, limit = 100): Promise<AuditLog[]> {
  return await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.actorId, actorId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

export async function getAuditLogsBySubject(
  subjectType: string,
  subjectId: string,
  limit = 100
): Promise<AuditLog[]> {
  return await db
    .select()
    .from(auditLogs)
    .where(
      and(
        eq(auditLogs.subjectType, subjectType),
        eq(auditLogs.subjectId, subjectId)
      )
    )
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// Complex queries
export async function getUserWithProfileAndPreferences(userId: string) {
  const user = await getUserById(userId);
  if (!user) return null;

  const [profile, prefs] = await Promise.all([
    getProfileByUserId(userId),
    getPreferencesByUserId(userId),
  ]);

  return {
    ...user,
    profile,
    preferences: prefs,
  };
}

export async function getListingWithMedia(listingId: string) {
  const listing = await getListingById(listingId);
  if (!listing) return null;

  const media = await getListingMedia(listingId);

  return {
    ...listing,
    media,
  };
}

export async function getRecommendedListings(userId: string, limit = 20): Promise<Listing[]> {
  const userPrefs = await getPreferencesByUserId(userId);

  if (!userPrefs) {
    return await getListings({ limit, status: 'active' });
  }

  const filters: Parameters<typeof getListings>[0] = {
    limit,
    status: 'active',
  };

  if (userPrefs.minRevenue) {
    filters.minRevenue = userPrefs.minRevenue;
  }

  if (userPrefs.priceMax) {
    filters.maxPrice = userPrefs.priceMax;
  }

  return await getListings(filters);
}