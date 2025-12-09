import { NextRequest, NextResponse } from 'next/server';
import { ParsedListingData } from '@/lib/valuation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface ParseUrlRequest {
  url: string;
}

// Platform detection patterns
const PLATFORM_PATTERNS: Record<string, RegExp[]> = {
  bizbuysell: [
    /bizbuysell\.com/i,
  ],
  businessesforsale: [
    /businessesforsale\.com/i,
    /businessesforsale\.us/i,
  ],
  loopnet: [
    /loopnet\.com/i,
  ],
  bizquest: [
    /bizquest\.com/i,
  ],
  sunbeltnetwork: [
    /sunbeltnetwork\.com/i,
  ],
};

export async function POST(request: NextRequest) {
  try {
    const body: ParseUrlRequest = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Detect platform
    let platform = 'unknown';
    for (const [name, patterns] of Object.entries(PLATFORM_PATTERNS)) {
      if (patterns.some(pattern => pattern.test(url))) {
        platform = name;
        break;
      }
    }

    // For now, we'll return a placeholder that indicates parsing is needed
    // Full HTML parsing would require additional libraries (cheerio, puppeteer, etc.)
    // and handling of platform-specific selectors

    // In production, this would:
    // 1. Fetch the HTML content
    // 2. Parse based on platform-specific selectors
    // 3. Extract financial data, business details, etc.
    // 4. Use AI to fill in gaps if needed

    const result: ParsedListingData = {
      industry: '',
      confidence: 0,
      parsedFields: [],
      missingFields: [
        'revenue',
        'sde',
        'ebitda',
        'askingPrice',
        'industry',
        'employees',
        'yearEstablished',
      ],
    };

    // If it's a known platform, we'd normally parse the HTML
    // For now, return guidance for manual entry
    if (platform === 'unknown') {
      return NextResponse.json({
        success: false,
        error: 'Unsupported listing platform',
        message: 'This URL is not from a supported platform. Please enter the business details manually.',
        platform: null,
        parsedData: null,
      });
    }

    // Return partial result - full implementation would parse the actual page
    return NextResponse.json({
      success: true,
      platform,
      parsedData: result,
      message: `Detected ${platform} listing. URL parsing is available - please enter key details manually for now.`,
      supportedPlatforms: Object.keys(PLATFORM_PATTERNS),
    });

  } catch (error) {
    console.error('URL parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse URL' },
      { status: 500 }
    );
  }
}

/**
 * Helper to extract numbers from text
 */
function extractNumber(text: string): number | null {
  // Remove currency symbols, commas, and extra spaces
  const cleaned = text.replace(/[$,\s]/g, '');

  // Handle K, M, B suffixes
  const match = cleaned.match(/^([\d.]+)([KMB])?$/i);
  if (!match) return null;

  let value = parseFloat(match[1]);
  if (isNaN(value)) return null;

  const suffix = match[2]?.toUpperCase();
  if (suffix === 'K') value *= 1000;
  if (suffix === 'M') value *= 1000000;
  if (suffix === 'B') value *= 1000000000;

  return Math.round(value);
}

/**
 * Infer industry from keywords in title/description
 */
function inferIndustry(text: string): string | null {
  const industryKeywords: Record<string, string[]> = {
    restaurant_full_service: ['restaurant', 'dining', 'eatery', 'bistro'],
    restaurant_fast_food: ['fast food', 'quick service', 'qsr', 'fast-casual'],
    coffee_shop: ['coffee', 'cafe', 'espresso', 'coffee shop'],
    bar_nightclub: ['bar', 'nightclub', 'tavern', 'pub', 'lounge'],
    hvac: ['hvac', 'heating', 'air conditioning', 'ac service'],
    plumbing: ['plumbing', 'plumber'],
    electrical: ['electrical', 'electrician'],
    landscaping: ['landscaping', 'lawn care', 'lawn service'],
    cleaning_janitorial: ['cleaning', 'janitorial', 'maid service'],
    auto_repair: ['auto repair', 'mechanic', 'automotive', 'car repair'],
    saas: ['saas', 'software', 'app', 'platform'],
    ecommerce: ['ecommerce', 'e-commerce', 'online store', 'amazon'],
    retail_general: ['retail', 'store', 'shop'],
    medical_practice: ['medical', 'clinic', 'healthcare', 'doctor'],
    dental_practice: ['dental', 'dentist'],
    construction_general: ['construction', 'contractor', 'builder'],
    manufacturing_general: ['manufacturing', 'factory', 'production'],
  };

  const lowerText = text.toLowerCase();

  for (const [industry, keywords] of Object.entries(industryKeywords)) {
    if (keywords.some(kw => lowerText.includes(kw))) {
      return industry;
    }
  }

  return null;
}
