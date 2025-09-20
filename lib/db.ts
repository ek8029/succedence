import fs from 'fs';
import path from 'path';
import { Listing, ListingFilters, Message } from './types';
import { processListing } from './ai';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function getListings(filters?: ListingFilters): Listing[] {
  try {
    const filePath = path.join(DATA_DIR, 'listings.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    let listings: Listing[] = JSON.parse(data);
    
    // Apply filters - commented out for new schema compatibility
    if (filters) {
      // Note: This file-based system is deprecated, use Supabase helpers instead
      /*
      if (filters.industries) {
        listings = listings.filter(listing =>
          filters.industries!.includes(listing.industry)
        );
      }
      if (filters.minRevenue) {
        listings = listings.filter(listing => listing.revenue >= filters.minRevenue!);
      }
      */
    }
    
    return listings;
  } catch (error) {
    console.error('Error reading listings:', error);
    return [];
  }
}

export function saveListing(listingData: any): Listing {
  const listings = getListings();
  const processedListing = processListing(listingData);
  
  const newListing: Listing = {
    id: (listings.length + 1).toString(),
    ...processedListing
  };
  
  listings.push(newListing);
  
  try {
    const filePath = path.join(DATA_DIR, 'listings.json');
    fs.writeFileSync(filePath, JSON.stringify(listings, null, 2));
  } catch (error) {
    console.error('Error saving listing:', error);
  }
  
  return newListing;
}

export function updateListingLane(listingId: string, newLane: "MAIN" | "STARTER"): Listing | null {
  const listings = getListings();
  const listingIndex = listings.findIndex(l => l.id === listingId);
  
  if (listingIndex === -1) return null;
  
  // listings[listingIndex].lane = newLane; // Commented out - lane field doesn't exist in new schema
  
  try {
    const filePath = path.join(DATA_DIR, 'listings.json');
    fs.writeFileSync(filePath, JSON.stringify(listings, null, 2));
    return listings[listingIndex];
  } catch (error) {
    console.error('Error updating listing:', error);
    return null;
  }
}

export function getNDAs(): any[] {
  try {
    const filePath = path.join(DATA_DIR, 'ndas.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading NDAs:', error);
    return [];
  }
}

export function saveNDA(ndaData: any): any {
  const ndas = getNDAs();
  
  const newNDA: any = {
    id: (ndas.length + 1).toString(),
    ...ndaData,
    status: 'REQUESTED'
  };
  
  ndas.push(newNDA);
  
  try {
    const filePath = path.join(DATA_DIR, 'ndas.json');
    fs.writeFileSync(filePath, JSON.stringify(ndas, null, 2));
  } catch (error) {
    console.error('Error saving NDA:', error);
  }
  
  return newNDA;
}

export function updateNDAStatus(ndaId: string, status: "APPROVED" | "REJECTED"): any | null {
  const ndas = getNDAs();
  const ndaIndex = ndas.findIndex(n => n.id === ndaId);
  
  if (ndaIndex === -1) return null;
  
  ndas[ndaIndex].status = status;
  
  try {
    const filePath = path.join(DATA_DIR, 'ndas.json');
    fs.writeFileSync(filePath, JSON.stringify(ndas, null, 2));
    return ndas[ndaIndex];
  } catch (error) {
    console.error('Error updating NDA:', error);
    return null;
  }
}

export function getMessages(listingId?: string): Message[] {
  try {
    const filePath = path.join(DATA_DIR, 'messages.json');
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    const messages: Message[] = JSON.parse(data);
    
    if (listingId) {
      return messages.filter(msg => msg.listingId === listingId);
    }
    
    return messages;
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

export function saveMessage(messageData: any): Message {
  const messages = getMessages();
  
  const newMessage: Message = {
    id: (messages.length + 1).toString(),
    ...messageData,
    timestamp: new Date().toISOString()
  };
  
  messages.push(newMessage);
  
  try {
    const filePath = path.join(DATA_DIR, 'messages.json');
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error saving message:', error);
  }
  
  return newMessage;
}

export function getListingById(id: string): Listing | null {
  const listings = getListings();
  return listings.find(listing => listing.id === id) || null;
}

export function getNDAsByListingId(listingId: string): any[] {
  const ndas = getNDAs();
  return ndas.filter(nda => nda.listingId === listingId);
}

export function getDashboardStats() {
  const listings = getListings();
  const ndas = getNDAs();
  const messages = getMessages();
  
  return {
    totalListings: listings.length,
    mainLaneListings: 0, // listings.filter(l => l.lane === 'MAIN').length, // lane field removed
    starterLaneListings: 0, // listings.filter(l => l.lane === 'STARTER').length, // lane field removed
    totalNDARequests: ndas.length,
    pendingNDARequests: ndas.filter(n => n.status === 'REQUESTED').length,
    totalMessages: messages.length,
    industries: Array.from(new Set(listings.map(l => l.industry)))
  };
}
