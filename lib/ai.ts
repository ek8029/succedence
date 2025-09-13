import { Listing } from './types';

export function classifyLane(revenue: number): "MAIN" | "STARTER" {
  // Mock AI logic: MAIN if revenue > 100k, otherwise STARTER
  return revenue > 100000 ? "MAIN" : "STARTER";
}

export function estimateValuation(revenue: number): { low: number; high: number } {
  // Mock AI logic: valuation range of 2-3x revenue
  const low = Math.round(revenue * 2);
  const high = Math.round(revenue * 3);
  return { low, high };
}

export function classifyIndustry(description: string, title: string): string {
  // Mock AI logic: classify industry based on keywords
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('saas') || text.includes('software') || text.includes('platform')) {
    return 'SaaS';
  }
  if (text.includes('ecommerce') || text.includes('dropshipping') || text.includes('store')) {
    return 'E-commerce';
  }
  if (text.includes('hvac') || text.includes('heating') || text.includes('cooling')) {
    return 'HVAC';
  }
  if (text.includes('marketing') || text.includes('seo') || text.includes('ppc')) {
    return 'Marketing';
  }
  if (text.includes('app') || text.includes('mobile') || text.includes('development')) {
    return 'Technology';
  }
  if (text.includes('restaurant') || text.includes('food') || text.includes('dining')) {
    return 'Food & Beverage';
  }
  if (text.includes('fitness') || text.includes('health') || text.includes('coaching')) {
    return 'Health & Fitness';
  }
  
  return 'Other';
}

export function processListing(listing: Omit<Listing, 'id' | 'lane' | 'valuationLow' | 'valuationHigh' | 'industry'>): Omit<Listing, 'id'> {
  const lane = classifyLane(listing.revenue);
  const { low, high } = estimateValuation(listing.revenue);
  const industry = classifyIndustry(listing.description, listing.title);
  
  return {
    ...listing,
    industry,
    lane,
    valuationLow: low,
    valuationHigh: high
  };
}
