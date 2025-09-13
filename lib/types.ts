export interface Listing {
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

export interface NDARequest {
  id: string;
  listingId: string;
  buyerName: string;
  status: "REQUESTED" | "APPROVED" | "REJECTED";
}

export interface Message {
  id: string;
  listingId: string;
  from: string;
  body: string;
  timestamp: string;
}

export interface CreateListingRequest {
  title: string;
  description: string;
  owner: string;
  industry: string;
  revenue: number;
}

export interface CreateNDARequest {
  listingId: string;
  buyerName: string;
}

export interface CreateMessageRequest {
  listingId: string;
  from: string;
  body: string;
}

export interface ListingFilters {
  industry?: string;
  lane?: "MAIN" | "STARTER";
  minRevenue?: number;
}

export interface User {
  name: string;
  role: "BUYER" | "SELLER" | "ADMIN";
}
