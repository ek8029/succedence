import OpenAI from 'openai';
import { Listing } from '@/lib/types';
// Consolidated SuperEnhanced types only

// Lazy initialize OpenAI client
let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

// Check if AI features are enabled
export const isAIEnabled = () => {
  const aiEnabled = process.env.AI_FEATURES_ENABLED;
  const isEnabled = aiEnabled === 'true' || aiEnabled === 'TRUE' || aiEnabled === '1';
  return isEnabled && !!process.env.OPENAI_API_KEY;
};

// Helper function to create streaming response
export async function createStreamingResponse(
  stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
): Promise<ReadableStream> {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        let fullContent = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            fullContent += content;
            // Send the chunk to the client
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, done: false })}\n\n`));
          }
        }

        // Send completion signal
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: '', done: true, fullContent })}\n\n`));
        controller.close();
      } catch (error) {
        console.error('Streaming error:', error);
        controller.error(error);
      }
    },
  });
}

function parseAIResponse(response: string): any {
  console.log('AI RAW RESPONSE PREVIEW:', response.substring(0, 300) + '...');

  // Clean the response first
  let cleanResponse = response.trim();

  // Check if response starts with markdown code blocks - handle this first
  if (cleanResponse.startsWith('```')) {
    console.log('Response starts with markdown code blocks, extracting JSON...');

    // Try to extract JSON from markdown code blocks with various patterns
    const patterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,
      /```\s*(\{[\s\S]*?\})\s*```/,
      /`{3,}\s*json\s*(\{[\s\S]*?\})\s*`{3,}/,
      /`{3,}\s*(\{[\s\S]*?\})\s*`{3,}/
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        try {
          const parsedResult = JSON.parse(match[1].trim());
          console.log('✅ Successfully parsed markdown JSON');
          return parsedResult;
        } catch (parseError) {
          console.log('Pattern match failed, trying next pattern...');
          continue;
        }
      }
    }
  }

  // Try direct JSON parsing if not markdown
  try {
    const parsedResult = JSON.parse(cleanResponse);
    console.log('✅ Successfully parsed direct JSON');
    return parsedResult;
  } catch (error) {
    console.log('Direct JSON parsing failed, trying fallback extraction...');

    // Fallback: try to extract JSON from markdown code blocks even if not detected initially
    const patterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,
      /```\s*(\{[\s\S]*?\})\s*```/,
      /`{3,}\s*json\s*(\{[\s\S]*?\})\s*`{3,}/,
      /`{3,}\s*(\{[\s\S]*?\})\s*`{3,}/
    ];

    for (const pattern of patterns) {
      const match = response.match(pattern);
      if (match && match[1]) {
        try {
          const parsedResult = JSON.parse(match[1].trim());
          console.log('✅ Successfully parsed with fallback pattern matching');
          return parsedResult;
        } catch (parseError) {
          console.log('Fallback pattern match failed, trying next pattern...');
          continue;
        }
      }
    }

    // If markdown parsing fails, try to find JSON object boundaries with proper brace counting
    let startIndex = response.indexOf('{');
    let endIndex = -1;

    if (startIndex !== -1) {
      let braceCount = 0;
      for (let i = startIndex; i < response.length; i++) {
        if (response[i] === '{') braceCount++;
        if (response[i] === '}') braceCount--;
        if (braceCount === 0) {
          endIndex = i;
          break;
        }
      }

      if (endIndex !== -1) {
        try {
          const jsonContent = response.substring(startIndex, endIndex + 1);
          const parsedResult = JSON.parse(jsonContent);
          console.log('✅ Successfully parsed with boundary extraction');
          return parsedResult;
        } catch (parseError) {
          console.error('Boundary extraction failed:', parseError);
        }
      }
    }

    console.error('❌ ALL PARSING METHODS FAILED');
    console.error('Response sample:', response.substring(0, 500));
    throw new Error(`Failed to parse AI response as JSON. Response preview: ${response.substring(0, 200)}...`);
  }
}

// Business Categorization System
export interface BusinessType {
  sector: string;
  subsector: string;
  confidence: number; // 0-100
  matchingKeywords: string[];
}

export interface BusinessCategory {
  sector: string;
  subsectors: string[];
  keywords: string[];
  industryIdentifiers: string[];
}

// Comprehensive business categorization mapping
const BUSINESS_CATEGORIES: BusinessCategory[] = [
  {
    sector: "Home Services",
    subsectors: ["HVAC", "Plumbing", "Electrical", "Roofing", "Landscaping", "Cleaning", "Pest Control", "Security Systems"],
    keywords: ["hvac", "heating", "cooling", "air conditioning", "plumbing", "electrical", "electrician", "roofing", "landscaping", "lawn care", "cleaning", "janitorial", "pest control", "security", "alarm"],
    industryIdentifiers: ["professional services", "home services", "residential services", "commercial services"]
  },
  {
    sector: "Food & Beverage",
    subsectors: ["Restaurant", "Fast Food", "Catering", "Food Distribution", "Bakery", "Coffee Shop", "Bar/Nightclub", "Food Truck"],
    keywords: ["restaurant", "food", "dining", "catering", "bakery", "coffee", "cafe", "bar", "nightclub", "food truck", "kitchen", "cuisine", "beverage"],
    industryIdentifiers: ["food service", "hospitality", "restaurant", "food & beverage"]
  },
  {
    sector: "Healthcare",
    subsectors: ["Medical Practice", "Dental Practice", "Veterinary", "Medical Device Distribution", "Pharmacy", "Home Healthcare", "Mental Health", "Physical Therapy"],
    keywords: [
      "medical", "healthcare", "health", "dental", "dentist", "dentistry", "veterinary", "pharmacy", "clinic", "hospital", "therapy", "counseling", "mental health", "device", "equipment",
      // Medical specialties
      "dermatology", "dermatologist", "cardiology", "cardiologist", "orthopedic", "orthopedics", "pediatric", "pediatrics", "obgyn", "obstetrics", "gynecology",
      "ophthalmology", "optometry", "radiology", "oncology", "neurology", "psychiatry", "psychology", "chiropractic", "chiropractor",
      "surgery", "surgical", "primary care", "family practice", "internal medicine", "urgent care", "emergency medicine",
      "plastic surgery", "cosmetic surgery", "aesthetic", "med spa", "medical spa"
    ],
    industryIdentifiers: ["healthcare", "medical", "dental", "veterinary", "health services"]
  },
  {
    sector: "Technology",
    subsectors: ["Software Development", "IT Services", "Cybersecurity", "Data Analytics", "E-commerce", "Digital Marketing", "Cloud Services", "Hardware"],
    keywords: ["software", "technology", "IT", "cybersecurity", "data", "analytics", "e-commerce", "digital", "marketing", "cloud", "hardware", "programming", "development"],
    industryIdentifiers: ["technology", "software", "IT", "digital"]
  },
  {
    sector: "Manufacturing",
    subsectors: ["Industrial Manufacturing", "Automotive Parts", "Electronics", "Textiles", "Chemical", "Machinery", "Packaging", "Metal Fabrication"],
    keywords: ["manufacturing", "industrial", "automotive", "electronics", "textiles", "chemical", "machinery", "packaging", "metal", "fabrication", "production"],
    industryIdentifiers: ["manufacturing", "industrial", "production"]
  },
  {
    sector: "Retail",
    subsectors: ["Specialty Retail", "Fashion", "Electronics Retail", "Automotive Retail", "Home Goods", "Sporting Goods", "Books/Media", "Jewelry"],
    keywords: ["retail", "store", "shop", "fashion", "clothing", "electronics", "automotive", "home goods", "sporting goods", "books", "jewelry", "sales"],
    industryIdentifiers: ["retail", "consumer goods", "sales"]
  },
  {
    sector: "Professional Services",
    subsectors: ["Legal Services", "Accounting", "Consulting", "Real Estate", "Insurance", "Financial Services", "Marketing/Advertising", "Engineering"],
    keywords: ["legal", "law", "accounting", "consulting", "real estate", "insurance", "financial", "marketing", "advertising", "engineering", "architecture"],
    industryIdentifiers: ["professional services", "business services"]
  },
  {
    sector: "Transportation & Logistics",
    subsectors: ["Trucking", "Delivery Services", "Warehousing", "Freight", "Moving Services", "Auto Services", "Logistics", "Supply Chain"],
    keywords: ["trucking", "delivery", "shipping", "warehouse", "freight", "moving", "auto", "logistics", "supply chain", "transportation"],
    industryIdentifiers: ["transportation", "logistics", "shipping"]
  },
  {
    sector: "Education & Training",
    subsectors: ["Training Services", "Educational Software", "Tutoring", "Corporate Training", "Online Education", "Childcare", "Skills Training"],
    keywords: ["education", "training", "tutoring", "learning", "childcare", "school", "teaching", "skills", "certification"],
    industryIdentifiers: ["education", "training", "learning"]
  },
  {
    sector: "Construction",
    subsectors: ["General Contracting", "Specialty Trades", "Commercial Construction", "Residential Construction", "Infrastructure", "Renovation"],
    keywords: ["construction", "contracting", "building", "renovation", "remodeling", "infrastructure", "concrete", "roofing", "painting"],
    industryIdentifiers: ["construction", "building", "contracting"]
  },
  {
    sector: "Personal Services",
    subsectors: ["Beauty/Salon", "Fitness", "Wellness", "Pet Services", "Automotive Services", "Dry Cleaning", "Photography"],
    keywords: ["beauty", "salon", "fitness", "wellness", "spa", "pet", "automotive", "dry cleaning", "photography", "personal care"],
    industryIdentifiers: ["personal services", "beauty", "wellness"]
  },
  {
    sector: "Entertainment & Media",
    subsectors: ["Entertainment Production", "Media Services", "Gaming", "Events", "Sports", "Publishing", "Broadcasting"],
    keywords: ["entertainment", "media", "gaming", "events", "sports", "publishing", "broadcasting", "production", "film", "music"],
    industryIdentifiers: ["entertainment", "media", "events"]
  }
];

// Business type detection function
export function detectBusinessType(listing: Listing): BusinessType {
  const searchText = `${listing.title || ''} ${listing.industry || ''} ${listing.description || ''}`.toLowerCase();

  let bestMatch: BusinessType = {
    sector: "General Business",
    subsector: "Unspecified",
    confidence: 30,
    matchingKeywords: []
  };

  for (const category of BUSINESS_CATEGORIES) {
    let matchScore = 0;
    const matchingKeywords: string[] = [];

    // Check industry identifiers (highest weight)
    for (const identifier of category.industryIdentifiers) {
      if (searchText.includes(identifier.toLowerCase())) {
        matchScore += 40;
        matchingKeywords.push(identifier);
      }
    }

    // Check keywords (medium weight)
    for (const keyword of category.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        matchScore += 20;
        matchingKeywords.push(keyword);
      }
    }

    // Determine best subsector match
    let bestSubsector = category.subsectors[0];
    let subsectorScore = 0;

    for (const subsector of category.subsectors) {
      let subScore = 0;
      const subsectorKeywords = subsector.toLowerCase().split(/[\s/]+/);

      for (const keyword of subsectorKeywords) {
        if (searchText.includes(keyword)) {
          subScore += 30;
        }
      }

      if (subScore > subsectorScore) {
        subsectorScore = subScore;
        bestSubsector = subsector;
        matchScore += subScore;
      }
    }

    // Calculate final confidence score
    const confidence = Math.min(95, matchScore);

    if (confidence > bestMatch.confidence) {
      bestMatch = {
        sector: category.sector,
        subsector: bestSubsector,
        confidence,
        matchingKeywords
      };
    }
  }

  return bestMatch;
}

// Super Enhanced Types - Advanced AI Analysis
export interface SuperConfidenceScore {
  score: number; // 0-100
  level: 'high' | 'medium' | 'low';
  percentage: number;
  reasoning: string;
  factors: {
    dataQuality: number;
    sampleSize: number;
    marketStability: number;
    historicalAccuracy: number;
  };
  methodology: string;
  limitations: string[];
}

export interface SuperRiskFactor {
  category: 'financial' | 'operational' | 'market' | 'strategic' | 'regulatory';
  factor: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: number; // 1-10
  impact: number; // 1-10
  riskScore: number; // calculated likelihood * impact
  mitigationStrategies: string[];
  monitoringMetrics: string[];
  confidence: SuperConfidenceScore;
}

export interface SuperInsight {
  insight: string;
  actionable: string;
  confidence: SuperConfidenceScore;
  supportingData: string[];
  assumptions: string[];
  sourceQuality: 'high' | 'medium' | 'low';
  timeframe: string;
  probability: number; // 0-100
  // For backward compatibility with EnhancedInsight
  content?: string;
}

export interface SuperEnhancedBusinessAnalysis {
  // Enhanced core scoring
  overallScore: number;
  overallScoreConfidence: SuperConfidenceScore;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';

  // Advanced insights
  strengths: SuperInsight[];
  weaknesses: SuperInsight[];
  opportunities: SuperInsight[];

  // Comprehensive risk analysis
  riskMatrix: SuperRiskFactor[];
  riskScore: number;
  riskTolerance?: 'conservative' | 'moderate' | 'aggressive';

  // Advanced market analysis
  marketDynamics?: {
    industryTrends: SuperInsight[];
    competitiveLandscape: SuperInsight[];
    marketSize: SuperInsight;
    growthProjections: SuperInsight;
  };

  // Financial modeling
  financialProjections?: {
    revenueGrowth: SuperInsight;
    profitabilityTrends: SuperInsight;
    cashFlowAnalysis: SuperInsight;
    valuationMultiples: SuperInsight;
  };

  // Strategic assessment
  strategicFit?: {
    buyerAlignment: SuperInsight;
    synergies: SuperInsight[];
    integrationComplexity: SuperInsight;
    culturalFit: SuperInsight;
  };

  // Action plans
  summary: string;
  nextSteps: string[];
  redFlags: string[];
  dealBreakers?: string[];

  // Enhanced metadata
  analysisVersion?: '2.0';
  processingTime?: number;
  dataPoints?: number;
  confidenceFactors?: string[];

  // For backward compatibility
  analysisOptions?: any;
}

export interface SuperEnhancedBuyerMatch {
  score: number;
  confidence: SuperConfidenceScore;

  // Detailed compatibility analysis
  compatibility: {
    industryExperience: SuperInsight;
    financialCapacity: SuperInsight;
    operationalFit: SuperInsight;
    culturalAlignment: SuperInsight;
    strategicValue: SuperInsight;
  };

  // Risk assessment
  risks: SuperRiskFactor[];
  riskMitigation: string[];

  // Opportunity analysis
  synergies: SuperInsight[];
  growthOpportunities: SuperInsight[];

  // Recommendations
  recommendation: 'excellent_match' | 'good_match' | 'moderate_match' | 'poor_match';
  reasoning: string[];
  nextSteps: string[];

  // Match scoring breakdown
  scoreBreakdown: {
    industryFit: number;
    financialFit: number;
    operationalFit: number;
    culturalFit: number;
    strategicFit: number;
  };
}

export interface SuperEnhancedDueDiligence {
  // Comprehensive checklist with risk prioritization
  criticalItems: {
    category: string;
    items: Array<{
      task: string;
      priority: 'critical' | 'high' | 'medium' | 'low';
      riskLevel: 'high' | 'medium' | 'low';
      effort: string;
      expertise: string;
      timeline: string;
      redFlags: string[];
    }>;
  }[];

  // Risk-based prioritization
  riskMatrix: SuperRiskFactor[];
  priorityActions: string[];

  // Industry-specific requirements
  industrySpecific: {
    regulations: string[];
    compliance: string[];
    certifications: string[];
    specialConsiderations: string[];
  };

  // Timeline and resources
  timeline: {
    phase: string;
    duration: string;
    milestones: string[];
    dependencies: string[];
  }[];

  resourceRequirements: {
    legal: string[];
    financial: string[];
    technical: string[];
    operational: string[];
  };

  // Confidence and recommendations
  confidence: SuperConfidenceScore;
  recommendations: string[];
}

export interface SuperEnhancedMarketIntelligence {
  // Market overview
  marketOverview: {
    size: SuperInsight;
    growth: SuperInsight;
    trends: SuperInsight[];
    drivers: SuperInsight[];
  };

  // Competitive landscape
  competitive: {
    intensity: SuperInsight;
    keyPlayers: SuperInsight[];
    barriers: SuperInsight[];
    opportunities: SuperInsight[];
  };

  // Economic factors
  economic: {
    outlook: SuperInsight;
    risks: SuperRiskFactor[];
    opportunities: SuperInsight[];
    timing: SuperInsight;
  };

  // Investment climate
  investment: {
    activity: SuperInsight;
    valuations: SuperInsight;
    trends: SuperInsight[];
    outlook: SuperInsight;
  };

  // Strategic recommendations
  recommendations: string[];
  timing: 'excellent' | 'good' | 'moderate' | 'poor';
  confidence: SuperConfidenceScore;
}

// Super Enhanced Business Analysis AI
export async function analyzeBusinessSuperEnhanced(
  listing: Listing & { followUpPrompt?: string; isFollowUp?: boolean },
  analysisOptions: {
    perspective?: 'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general';
    focusAreas?: string[];
    userProfile?: {
      experienceLevel?: 'novice' | 'intermediate' | 'expert';
      riskTolerance?: 'low' | 'medium' | 'high';
      industries?: string[];
    };
    analysisDepth?: 'quick' | 'standard' | 'comprehensive';
    comparableListings?: any[];
    industryBenchmarks?: any;
    stream?: boolean;
  } = {}
): Promise<SuperEnhancedBusinessAnalysis | ReadableStream> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  // Handle follow-up questions
  if (listing.isFollowUp && listing.followUpPrompt) {
    try {
      const completion = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert business analyst providing follow-up insights on a business acquisition analysis. Provide detailed, actionable responses that directly address the user's question."
          },
          {
            role: "user",
            content: listing.followUpPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }, {
        timeout: 30000, // 30 second timeout for quick follow-ups
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI for follow-up');
      }

      return {
        followUpResponse: response,
        overallScore: 0,
        overallScoreConfidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Follow-up response', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Follow-up', limitations: [] },
        recommendation: 'hold' as const,
        strengths: [],
        weaknesses: [],
        opportunities: [],
        riskMatrix: [],
        riskScore: 0,
        summary: 'Follow-up response',
        nextSteps: [],
        redFlags: [],
        analysisVersion: '2.0',
        processingTime: Date.now() - Date.now(),
        dataPoints: 0,
        confidenceFactors: []
      } as any;
    } catch (error) {
      console.error('Error in follow-up analysis:', error);
      throw new Error('Failed to generate follow-up response');
    }
  }

  const startTime = Date.now();
  const {
    perspective = 'general',
    focusAreas = [],
    userProfile = {},
    analysisDepth = 'comprehensive',
    comparableListings = [],
    industryBenchmarks = null
  } = analysisOptions;

  // Detect business type for enhanced analysis
  const businessType = detectBusinessType(listing);
  console.log('🔍 DETECTED BUSINESS TYPE:', businessType.sector, '->', businessType.subsector, `(${businessType.confidence}% confidence)`);
  console.log('🔍 MATCHING KEYWORDS:', businessType.matchingKeywords);

  // Calculate this listing's specific metrics for comparison
  const listingAny = listing as any;
  const listingMetrics = {
    ebitdaMargin: listing.revenue && listing.ebitda ? ((listing.ebitda / listing.revenue) * 100).toFixed(1) : null,
    revenuePerEmployee: listing.revenue && listing.employees ? Math.round(listing.revenue / listing.employees) : null,
    priceToRevenue: listing.price && listing.revenue ? (listing.price / listing.revenue).toFixed(2) : null,
    priceToEBITDA: listing.price && listing.ebitda ? (listing.price / listing.ebitda).toFixed(2) : null,
    cashFlowMargin: listing.revenue && listingAny.cashFlow ? ((listingAny.cashFlow / listing.revenue) * 100).toFixed(1) : null
  };

  const perspectiveContext = {
    strategic_buyer: "You are analyzing for a strategic buyer seeking synergistic acquisitions with operational expertise and industry knowledge.",
    financial_buyer: "You are analyzing for a financial buyer focused on ROI, cash flow generation, and value creation through operational improvements.",
    first_time_buyer: "You are analyzing for a first-time buyer who needs clear guidance, lower risk opportunities, and comprehensive support.",
    general: "You are providing a balanced analysis suitable for sophisticated investors with varying backgrounds."
  };

  const depthContext = {
    quick: "Provide a focused analysis hitting the key points with high confidence insights.",
    standard: "Provide a thorough analysis covering all major aspects with detailed reasoning.",
    comprehensive: "Provide an exhaustive analysis with deep insights, multiple scenarios, and extensive risk modeling."
  };

  const prompt = `
As a world-class M&A advisor with 30+ years of experience and expertise in AI-driven analysis, conduct a SUPER ENHANCED analysis of this business acquisition opportunity.

ANALYSIS PARAMETERS:
- Perspective: ${perspectiveContext[perspective]}
- Depth: ${depthContext[analysisDepth]}
- User Experience: ${userProfile.experienceLevel || 'intermediate'}
- Risk Tolerance: ${userProfile.riskTolerance || 'medium'}
- Focus Areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'Comprehensive analysis'}

BUSINESS INTELLIGENCE:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Business Type: ${businessType.sector} → ${businessType.subsector} (${businessType.confidence}% confidence)
- Matching Keywords: ${businessType.matchingKeywords.join(', ')}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Cash Flow: $${listingAny.cashFlow?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Employees: ${listing.employees || 'Not specified'}
- Description: ${listing.description}

CALCULATED FINANCIAL METRICS (use these for specific comparisons):
- EBITDA Margin: ${listingMetrics.ebitdaMargin ? `${listingMetrics.ebitdaMargin}%` : 'Not calculable'}
- Revenue Per Employee: ${listingMetrics.revenuePerEmployee ? `$${listingMetrics.revenuePerEmployee.toLocaleString()}` : 'Not calculable'}
- Price-to-Revenue Multiple: ${listingMetrics.priceToRevenue ? `${listingMetrics.priceToRevenue}x` : 'Not calculable'}
- Price-to-EBITDA Multiple: ${listingMetrics.priceToEBITDA ? `${listingMetrics.priceToEBITDA}x` : 'Not calculable'}
- Cash Flow Margin: ${listingMetrics.cashFlowMargin ? `${listingMetrics.cashFlowMargin}%` : 'Not calculable'}

${industryBenchmarks ? `INDUSTRY BENCHMARKS FOR ${listing.industry} (based on ${industryBenchmarks.sampleSize} comparable businesses):
- Average Revenue: $${industryBenchmarks.averageRevenue?.toLocaleString() || 'N/A'} (This business: ${listing.revenue ? (listing.revenue > industryBenchmarks.averageRevenue ? `${Math.round(((listing.revenue - industryBenchmarks.averageRevenue) / industryBenchmarks.averageRevenue) * 100)}% ABOVE` : `${Math.round(((industryBenchmarks.averageRevenue - listing.revenue) / industryBenchmarks.averageRevenue) * 100)}% BELOW`) : 'N/A'} average)
- Average EBITDA: $${industryBenchmarks.averageEBITDA?.toLocaleString() || 'N/A'} (This business: ${listing.ebitda && industryBenchmarks.averageEBITDA ? (listing.ebitda > industryBenchmarks.averageEBITDA ? `${Math.round(((listing.ebitda - industryBenchmarks.averageEBITDA) / industryBenchmarks.averageEBITDA) * 100)}% ABOVE` : `${Math.round(((industryBenchmarks.averageEBITDA - listing.ebitda) / industryBenchmarks.averageEBITDA) * 100)}% BELOW`) : 'N/A'} average)
- Average EBITDA Margin: ${industryBenchmarks.averageEBITDAMargin ? `${industryBenchmarks.averageEBITDAMargin}%` : 'N/A'} (This business: ${listingMetrics.ebitdaMargin && industryBenchmarks.averageEBITDAMargin ? `${listingMetrics.ebitdaMargin}% - ${parseFloat(listingMetrics.ebitdaMargin) > industryBenchmarks.averageEBITDAMargin ? `${(parseFloat(listingMetrics.ebitdaMargin) - industryBenchmarks.averageEBITDAMargin).toFixed(1)}% HIGHER` : `${(industryBenchmarks.averageEBITDAMargin - parseFloat(listingMetrics.ebitdaMargin)).toFixed(1)}% LOWER`}` : 'N/A'})
- Average Price: $${industryBenchmarks.averagePrice?.toLocaleString() || 'N/A'}
- Average Employees: ${industryBenchmarks.averageEmployees || 'N/A'}
- Average Revenue Per Employee: $${industryBenchmarks.averageRevenuePerEmployee?.toLocaleString() || 'N/A'} (This business: ${listingMetrics.revenuePerEmployee && industryBenchmarks.averageRevenuePerEmployee ? `$${listingMetrics.revenuePerEmployee.toLocaleString()} - ${listingMetrics.revenuePerEmployee > industryBenchmarks.averageRevenuePerEmployee ? `${Math.round(((listingMetrics.revenuePerEmployee - industryBenchmarks.averageRevenuePerEmployee) / industryBenchmarks.averageRevenuePerEmployee) * 100)}% HIGHER` : `${Math.round(((industryBenchmarks.averageRevenuePerEmployee - listingMetrics.revenuePerEmployee) / industryBenchmarks.averageRevenuePerEmployee) * 100)}% LOWER`}` : 'N/A'})

CRITICAL: Use these specific comparisons in your analysis. DO NOT say generic things like "risk of economic downturn". Instead say "This ${businessType.subsector} business has an EBITDA margin of ${listingMetrics.ebitdaMargin}%, which is ${parseFloat(listingMetrics.ebitdaMargin || '0') > (industryBenchmarks.averageEBITDAMargin || 0) ? 'above' : 'below'} the industry average of ${industryBenchmarks.averageEBITDAMargin}%, indicating ${parseFloat(listingMetrics.ebitdaMargin || '0') > (industryBenchmarks.averageEBITDAMargin || 0) ? 'strong operational efficiency' : 'potential optimization opportunities'}."
` : ''}

${comparableListings.length > 0 ? `COMPARABLE BUSINESSES IN ${listing.industry} (for context):
${comparableListings.slice(0, 5).map((comp: any, i: number) => `${i + 1}. ${comp.title} - ${comp.city}, ${comp.state} | Revenue: $${comp.revenue?.toLocaleString() || 'N/A'} | EBITDA: $${comp.ebitda?.toLocaleString() || 'N/A'} | Price: $${(comp.price || comp.askingPrice)?.toLocaleString() || 'N/A'}`).join('\n')}

CRITICAL: Reference these comparable businesses when discussing market positioning, pricing, and competitive dynamics. Be specific about how THIS business compares to these actual listings.
` : ''}

REQUIRED SUPER ENHANCED ANALYSIS:

1. ADVANCED SCORING & CONFIDENCE:
   - Overall score (0-100) with multi-factor confidence analysis
   - Confidence scoring methodology and limitations
   - Data quality assessment and reliability factors

2. SUPER INSIGHTS (each with enhanced confidence metrics):
   - 5-8 key strengths with probability scoring and timeframes
   - 5-8 areas of concern with risk quantification
   - 5-8 growth opportunities with feasibility analysis

3. COMPREHENSIVE RISK MATRIX:
   - Detailed risk factors with likelihood×impact scoring (IMPORTANT: Use 1-10 scale only)
   - Mitigation strategies and monitoring metrics
   - Risk tolerance matching for buyer profile
   - CRITICAL: Likelihood and Impact must be integers from 1-10, where 1=very low and 10=very high

4. MARKET DYNAMICS ANALYSIS:
   - Industry trends with impact probability
   - Competitive landscape assessment
   - Market size and growth projections
   - Economic timing considerations

5. FINANCIAL MODELING INSIGHTS:
   - Revenue growth projections with confidence intervals
   - Profitability trend analysis
   - Cash flow forecasting
   - Valuation multiple benchmarking

6. STRATEGIC FIT ASSESSMENT:
   - Buyer alignment scoring
   - Synergy identification and quantification
   - Integration complexity evaluation
   - Cultural fit assessment

7. ACTIONABLE INTELLIGENCE:
   - Executive summary with key decision factors
   - Prioritized next steps with timelines
   - Critical red flags and deal breakers
   - Success probability and value creation potential

Respond in JSON format with this EXACT structure:
{
  "overallScore": number,
  "overallScoreConfidence": {
    "score": number,
    "factors": {
      "dataQuality": number,
      "sampleSize": number,
      "marketStability": number,
      "historicalAccuracy": number
    },
    "methodology": "string",
    "limitations": ["limitation1", "limitation2"],
    "level": "high|medium|low",
    "percentage": number,
    "reasoning": "string"
  },
  "recommendation": "strong_buy|buy|hold|avoid",
  "strengths": [
    {
      "insight": "string",
      "actionable": "string",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    }
  ],
  "weaknesses": [same_structure_as_strengths],
  "opportunities": [same_structure_as_strengths],
  "riskMatrix": [
    {
      "factor": "string",
      "description": "string",
      "severity": "low|medium|high|critical",
      "likelihood": number,
      "impact": number,
      "riskScore": number,
      "mitigationStrategies": ["strategy1", "strategy2"],
      "monitoringMetrics": ["metric1", "metric2"],
      "confidence": {confidence_structure},
      "category": "financial|operational|market|strategic|regulatory"
    }
  ],
  "riskScore": number,
  "marketDynamics": {
    "industryTrends": [insight_structure],
    "competitiveLandscape": [insight_structure],
    "marketSize": insight_structure,
    "growthProjections": insight_structure
  },
  "financialProjections": {
    "revenueGrowth": insight_structure,
    "profitabilityTrends": insight_structure,
    "cashFlowAnalysis": insight_structure,
    "valuationMultiples": insight_structure
  },
  "strategicFit": {
    "buyerAlignment": insight_structure,
    "synergies": [insight_structure],
    "integrationComplexity": insight_structure,
    "culturalFit": insight_structure
  },
  "summary": "string",
  "nextSteps": ["step1", "step2"],
  "redFlags": ["flag1", "flag2"],
  "dealBreakers": ["breaker1", "breaker2"],
  "analysisVersion": "2.0",
  "processingTime": ${Date.now() - startTime},
  "dataPoints": number,
  "confidenceFactors": ["factor1", "factor2"]
}
`;

  try {
    // Enable streaming if requested
    if (analysisOptions.stream) {
      const stream = await getOpenAIClient().chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an elite M&A advisor and AI analysis expert. Provide the most sophisticated, data-driven analysis possible with quantified confidence metrics and actionable insights. Every insight must include confidence scoring and supporting methodology."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000,
        stream: true,
      }, {
        timeout: 45000, // 45 second timeout
      });

      return createStreamingResponse(stream);
    }

    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite M&A advisor and AI analysis expert. Provide the most sophisticated, data-driven analysis possible with quantified confidence metrics and actionable insights. Every insight must include confidence scoring and supporting methodology."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }, {
      timeout: 45000, // 45 second timeout
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const rawAnalysis = parseAIResponse(response) as any;

    // Ensure all required arrays are initialized
    const analysis: SuperEnhancedBusinessAnalysis = {
      overallScore: rawAnalysis.overallScore || 0,
      overallScoreConfidence: rawAnalysis.overallScoreConfidence || { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' },
      recommendation: rawAnalysis.recommendation || 'hold',
      strengths: rawAnalysis.strengths || [],
      weaknesses: rawAnalysis.weaknesses || [],
      opportunities: rawAnalysis.opportunities || [],
      riskMatrix: rawAnalysis.riskMatrix || [],
      riskScore: rawAnalysis.riskScore || 0,
      summary: rawAnalysis.summary || 'Analysis summary unavailable',
      nextSteps: rawAnalysis.nextSteps || [],
      redFlags: rawAnalysis.redFlags || [],
      dealBreakers: rawAnalysis.dealBreakers || [],
      analysisVersion: rawAnalysis.analysisVersion || '2.0',
      processingTime: Date.now() - startTime,
      dataPoints: rawAnalysis.dataPoints || 0,
      confidenceFactors: rawAnalysis.confidenceFactors || [],
      marketDynamics: rawAnalysis.marketDynamics || {
        industryTrends: [],
        competitiveLandscape: [],
        marketSize: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        growthProjections: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } }
      },
      financialProjections: rawAnalysis.financialProjections || {
        revenueGrowth: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        profitabilityTrends: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        cashFlowAnalysis: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        valuationMultiples: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } }
      },
      strategicFit: rawAnalysis.strategicFit || {
        buyerAlignment: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        synergies: [],
        integrationComplexity: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        culturalFit: { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } }
      }
    };

    return analysis;
  } catch (error) {
    console.error('Error in super enhanced business analysis:', error);
    throw new Error('Failed to analyze business with super enhanced features');
  }
}

// Super Enhanced Buyer Match Analysis
export async function analyzeBusinessSuperEnhancedBuyerMatch(
  listing: Listing,
  buyerPreferences: {
    industries: string[];
    dealSizeMin: number;
    dealSizeMax: number;
    geographicPreferences: string[];
    riskTolerance: 'low' | 'medium' | 'high';
    experienceLevel: 'novice' | 'intermediate' | 'expert';
    keywords: string[];
  },
  comparableListings: any[] = [],
  industryBenchmarks: any = null,
  useEconomyModel: boolean = true // Use GPT-4o-mini by default for speed/cost
): Promise<SuperEnhancedBuyerMatch> {
  // Generate dynamic analysis based on actual listing data
  console.log('BUYER MATCH DEBUG: Generating analysis for', listing.title, 'in', listing.industry);

  const businessType = detectBusinessType(listing);
  console.log('DETECTED BUSINESS TYPE:', businessType.sector, '->', businessType.subsector, `(${businessType.confidence}% confidence)`);
  console.log('MATCHING KEYWORDS:', businessType.matchingKeywords);

  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As an expert buyer-seller matching AI with deep expertise in ${businessType.sector} industry and ${businessType.subsector} businesses, analyze the compatibility between this buyer profile and business opportunity.

BUYER PROFILE:
- Industries: ${buyerPreferences.industries.join(', ') || 'Open to all'}
- Deal Size: $${buyerPreferences.dealSizeMin.toLocaleString()} - $${buyerPreferences.dealSizeMax.toLocaleString()}
- Geography: ${buyerPreferences.geographicPreferences.join(', ') || 'No preference'}
- Risk Tolerance: ${buyerPreferences.riskTolerance}
- Experience: ${buyerPreferences.experienceLevel}
- Keywords: ${buyerPreferences.keywords.join(', ') || 'None specified'}

BUSINESS OPPORTUNITY:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Business Type: ${businessType.sector} → ${businessType.subsector} (${businessType.confidence}% confidence)
- Matching Keywords: ${businessType.matchingKeywords.join(', ')}
- Location: ${listing.city}, ${listing.state}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Employees: ${listing.employees || 'Not specified'}
- Description: ${listing.description}

${industryBenchmarks ? `INDUSTRY CONTEXT (${industryBenchmarks.sampleSize} comparable ${listing.industry} businesses):
- Average Revenue: $${industryBenchmarks.averageRevenue?.toLocaleString()} (This business: ${listing.revenue && industryBenchmarks.averageRevenue ? (listing.revenue > industryBenchmarks.averageRevenue ? `${Math.round(((listing.revenue - industryBenchmarks.averageRevenue) / industryBenchmarks.averageRevenue) * 100)}% ABOVE` : `${Math.round(((industryBenchmarks.averageRevenue - listing.revenue) / industryBenchmarks.averageRevenue) * 100)}% BELOW`) : 'N/A'})
- Average EBITDA: $${industryBenchmarks.averageEBITDA?.toLocaleString()} (This business: ${listing.ebitda && industryBenchmarks.averageEBITDA ? (listing.ebitda > industryBenchmarks.averageEBITDA ? `${Math.round(((listing.ebitda - industryBenchmarks.averageEBITDA) / industryBenchmarks.averageEBITDA) * 100)}% ABOVE` : `${Math.round(((industryBenchmarks.averageEBITDA - listing.ebitda) / industryBenchmarks.averageEBITDA) * 100)}% BELOW`) : 'N/A'})
- Average Price: $${industryBenchmarks.averagePrice?.toLocaleString()} (This business: ${listing.price && industryBenchmarks.averagePrice ? (listing.price > industryBenchmarks.averagePrice ? `${Math.round(((listing.price - industryBenchmarks.averagePrice) / industryBenchmarks.averagePrice) * 100)}% ABOVE` : `${Math.round(((industryBenchmarks.averagePrice - listing.price) / industryBenchmarks.averagePrice) * 100)}% BELOW`) : 'N/A'})

CRITICAL: Use these comparisons to assess if this business is fairly priced and a good fit relative to market standards.
` : ''}

${comparableListings.length > 0 ? `COMPARABLE ${listing.industry.toUpperCase()} BUSINESSES:
${comparableListings.slice(0, 5).map((comp: any, i: number) => `${i + 1}. ${comp.title} | ${comp.city}, ${comp.state} | Rev: $${comp.revenue?.toLocaleString() || 'N/A'} | EBITDA: $${comp.ebitda?.toLocaleString() || 'N/A'} | Price: $${(comp.price || comp.askingPrice)?.toLocaleString() || 'N/A'}`).join('\n')}

CRITICAL: Reference how this business compares to these actual comparable opportunities when assessing buyer fit and strategic value.
` : ''}

REQUIRED COMPREHENSIVE BUYER MATCH ANALYSIS:

Analyze the buyer-business compatibility and provide a comprehensive match score with detailed insights specific to ${businessType.subsector} businesses.

Provide detailed analysis covering:

1. OVERALL MATCH SCORE (0-100) with confidence metrics
2. DETAILED COMPATIBILITY ANALYSIS:
   - Industry Experience fit for ${businessType.subsector}
   - Financial Capacity alignment
   - Operational Fit for ${businessType.subsector} operations
   - Cultural Alignment considerations
   - Strategic Value potential

3. COMPREHENSIVE RISK ASSESSMENT:
   - ${businessType.subsector}-specific risks
   - Risk mitigation strategies
   - Monitoring metrics

4. OPPORTUNITY ANALYSIS:
   - Synergy opportunities specific to ${businessType.subsector}
   - Growth opportunities in ${businessType.sector}
   - Strategic expansion potential

5. STRATEGIC RECOMMENDATIONS:
   - Match recommendation (excellent_match, good_match, moderate_match, poor_match)
   - Detailed reasoning
   - Next steps for ${businessType.subsector} acquisition

Respond in JSON format with this EXACT structure:
{
  "score": number_0_to_100,
  "confidence": {
    "score": number,
    "level": "high|medium|low",
    "percentage": number,
    "reasoning": "string explaining confidence in ${businessType.subsector} match analysis",
    "factors": {
      "dataQuality": number,
      "sampleSize": number,
      "marketStability": number,
      "historicalAccuracy": number
    },
    "methodology": "string describing analysis approach for ${businessType.sector}",
    "limitations": ["limitation1", "limitation2"]
  },
  "compatibility": {
    "industryExperience": {
      "insight": "string - industry experience analysis for ${businessType.subsector}",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    },
    "financialCapacity": {
      "insight": "string - financial capacity analysis",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    },
    "operationalFit": {
      "insight": "string - operational fit for ${businessType.subsector}",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    },
    "culturalAlignment": {
      "insight": "string - cultural alignment analysis",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    },
    "strategicValue": {
      "insight": "string - strategic value for ${businessType.subsector}",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    }
  },
  "risks": [
    {
      "factor": "string - ${businessType.subsector} specific risk",
      "description": "string - detailed risk description",
      "severity": "low|medium|high|critical",
      "likelihood": number,
      "impact": number,
      "riskScore": number,
      "mitigationStrategies": ["strategy1", "strategy2"],
      "monitoringMetrics": ["metric1", "metric2"],
      "confidence": {confidence_structure},
      "category": "financial|operational|market|strategic|regulatory"
    }
  ],
  "riskMitigation": ["mitigation1", "mitigation2"],
  "synergies": [
    {
      "insight": "string - synergy opportunity for ${businessType.subsector}",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1"],
      "assumptions": ["assumption1"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    }
  ],
  "growthOpportunities": [
    {
      "insight": "string - growth opportunity in ${businessType.sector}",
      "actionable": "string - actionable recommendation",
      "confidence": {confidence_structure},
      "supportingData": ["data1"],
      "assumptions": ["assumption1"],
      "sourceQuality": "high|medium|low",
      "timeframe": "string",
      "probability": number
    }
  ],
  "recommendation": "excellent_match|good_match|moderate_match|poor_match",
  "reasoning": ["reason1", "reason2"],
  "nextSteps": ["step1", "step2"],
  "scoreBreakdown": {
    "industryFit": number,
    "financialFit": number,
    "operationalFit": number,
    "culturalFit": number,
    "strategicFit": number
  }
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: useEconomyModel ? "gpt-4o-mini" : "gpt-4o", // Use mini for 10x cost savings, 2x speed
      messages: [
        {
          role: "system",
          content: `You are an elite buyer-seller matching expert with deep knowledge of ${businessType.sector} industry, specifically ${businessType.subsector} businesses. You have 25+ years of experience in M&A matchmaking, buyer profiling, and strategic fit analysis. You understand the unique operational requirements, financial characteristics, and strategic considerations of ${businessType.subsector} businesses.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }, {
      timeout: 45000, // 45 second timeout
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const rawMatch = parseAIResponse(response) as any;

    // Ensure all required arrays and objects are initialized with fallbacks
    const buyerMatch: SuperEnhancedBuyerMatch = {
      score: rawMatch.score || 0,
      confidence: rawMatch.confidence as SuperConfidenceScore || {
        score: 0,
        level: 'low' as const,
        percentage: 0,
        reasoning: 'Unknown',
        factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 },
        methodology: 'Unknown',
        limitations: []
      },
      compatibility: rawMatch.compatibility as any || {
        industryExperience: { insight: 'Analysis unavailable', actionable: 'Complete analysis required', confidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }, supportingData: [], assumptions: [], sourceQuality: 'low' as const, timeframe: 'Unknown', probability: 0 },
        financialCapacity: { insight: 'Analysis unavailable', actionable: 'Complete analysis required', confidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }, supportingData: [], assumptions: [], sourceQuality: 'low' as const, timeframe: 'Unknown', probability: 0 },
        operationalFit: { insight: 'Analysis unavailable', actionable: 'Complete analysis required', confidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }, supportingData: [], assumptions: [], sourceQuality: 'low' as const, timeframe: 'Unknown', probability: 0 },
        culturalAlignment: { insight: 'Analysis unavailable', actionable: 'Complete analysis required', confidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }, supportingData: [], assumptions: [], sourceQuality: 'low' as const, timeframe: 'Unknown', probability: 0 },
        strategicValue: { insight: 'Analysis unavailable', actionable: 'Complete analysis required', confidence: { score: 0, level: 'low' as const, percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }, supportingData: [], assumptions: [], sourceQuality: 'low' as const, timeframe: 'Unknown', probability: 0 }
      },
      risks: rawMatch.risks as any || [],
      riskMitigation: rawMatch.riskMitigation || [],
      synergies: rawMatch.synergies as any || [],
      growthOpportunities: rawMatch.growthOpportunities as any || [],
      recommendation: rawMatch.recommendation as any || 'poor_match',
      reasoning: rawMatch.reasoning || [],
      nextSteps: rawMatch.nextSteps || [],
      scoreBreakdown: rawMatch.scoreBreakdown || {
        industryFit: 0,
        financialFit: 0,
        operationalFit: 0,
        culturalFit: 0,
        strategicFit: 0
      }
    };

    return buyerMatch;
  } catch (error) {
    console.error('Error in super enhanced buyer match:', error);
    throw new Error('Failed to analyze buyer match with super enhanced features');
  }
}

// Super Enhanced Due Diligence Generator
export async function generateSuperEnhancedDueDiligence(
  title: string,
  description: string,
  listing: Listing,
  comparableListings: any[] = []
): Promise<SuperEnhancedDueDiligence> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  // Use provided title/description or fall back to listing properties
  const businessTitle = title || listing.title;
  const businessDescription = description || listing.description;

  // Generate industry-specific due diligence based on actual listing
  console.log('DUE DILIGENCE DEBUG: Generating checklist for', businessTitle, 'in', listing.industry);

  const businessType = detectBusinessType(listing);
  console.log('🔍 DETECTED BUSINESS TYPE:', businessType.sector, '->', businessType.subsector, `(${businessType.confidence}% confidence)`);

  const prompt = `
As a world-class due diligence expert with deep expertise in ${businessType.sector} sector and ${businessType.subsector} businesses, create a comprehensive, risk-prioritized due diligence checklist for this specific acquisition opportunity.

BUSINESS INTELLIGENCE:
- Title: ${businessTitle}
- Description: ${businessDescription}
- Industry: ${listing.industry}
- Business Type: ${businessType.sector} → ${businessType.subsector} (${businessType.confidence}% confidence)
- Matching Keywords: ${businessType.matchingKeywords.join(', ')}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Employees: ${listing.employees || 'Not specified'}

${comparableListings.length > 0 ? `COMPARABLE ${listing.industry.toUpperCase()} BUSINESSES FOR CONTEXT:
${comparableListings.map((comp: any, i: number) => `${i + 1}. ${comp.title} | ${comp.city}, ${comp.state} | Rev: $${comp.revenue?.toLocaleString() || 'N/A'} | EBITDA: $${comp.ebitda?.toLocaleString() || 'N/A'} | Price: $${(comp.price || comp.askingPrice)?.toLocaleString() || 'N/A'}`).join('\n')}

CRITICAL: Use these comparable businesses to identify industry-standard practices, typical risks for ${businessType.subsector} businesses, and red flags that may indicate this business deviates from industry norms.
` : ''}

REQUIRED COMPREHENSIVE DUE DILIGENCE ANALYSIS:

Create a detailed, industry-specific due diligence plan covering:

1. CRITICAL ITEMS BY CATEGORY:
   - Financial Verification (3-5 critical tasks)
   - Legal & Regulatory (industry-specific requirements)
   - Technical & Operational (sector-specific assessments)
   - Market & Competitive (positioning analysis)
   - Human Resources (talent assessment)
   - Technology & Systems (infrastructure review)

Each task must include:
- Specific task description tailored to ${businessType.subsector}
- Priority level (critical/high/medium/low)
- Risk level assessment
- Time/effort estimation
- Required expertise type
- Timeline for completion
- Industry-specific red flags to watch for

2. COMPREHENSIVE RISK MATRIX:
   - Industry-specific risk factors with quantified likelihood and impact (IMPORTANT: Use 1-10 scale only)
   - Risk mitigation strategies tailored to ${businessType.sector}
   - Monitoring metrics specific to ${businessType.subsector}
   - Confidence scoring with methodology
   - CRITICAL: Likelihood and Impact must be integers from 1-10, where 1=very low and 10=very high

3. INDUSTRY-SPECIFIC REQUIREMENTS:
   - Regulations specific to ${businessType.subsector}
   - Compliance requirements for ${listing.city}, ${listing.state}
   - Required certifications and licenses
   - Special considerations unique to this business type

4. DETAILED TIMELINE AND RESOURCES:
   - Phase-by-phase execution plan
   - Resource requirements by specialty
   - Dependencies and critical path items
   - Milestone tracking

5. STRATEGIC RECOMMENDATIONS:
   - Priority actions based on business type and risk profile
   - Expert recommendations for ${businessType.sector} acquisitions
   - Industry-specific due diligence best practices

Respond in JSON format with this EXACT structure:
{
  "criticalItems": [
    {
      "category": "string",
      "items": [
        {
          "task": "string - specific to ${businessType.subsector}",
          "priority": "critical|high|medium|low",
          "riskLevel": "high|medium|low",
          "effort": "string - time estimation",
          "expertise": "string - required specialist type",
          "timeline": "string - completion timeframe",
          "redFlags": ["flag1 specific to ${businessType.subsector}", "flag2"]
        }
      ]
    }
  ],
  "riskMatrix": [
    {
      "factor": "string - ${businessType.subsector} specific risk",
      "description": "string - detailed risk description",
      "severity": "low|medium|high|critical",
      "likelihood": number_1_to_10,
      "impact": number_1_to_10,
      "riskScore": number,
      "mitigationStrategies": ["strategy1", "strategy2"],
      "monitoringMetrics": ["metric1", "metric2"],
      "confidence": {
        "score": number,
        "level": "high|medium|low",
        "percentage": number,
        "reasoning": "string",
        "factors": {
          "dataQuality": number,
          "sampleSize": number,
          "marketStability": number,
          "historicalAccuracy": number
        },
        "methodology": "string",
        "limitations": ["limitation1"]
      },
      "category": "financial|operational|market|strategic|regulatory"
    }
  ],
  "priorityActions": ["action1 for ${businessType.subsector}", "action2"],
  "industrySpecific": {
    "regulations": ["regulation1 for ${businessType.subsector}", "regulation2"],
    "compliance": ["compliance1 for ${listing.state}", "compliance2"],
    "certifications": ["cert1 for ${businessType.subsector}", "cert2"],
    "specialConsiderations": ["consideration1", "consideration2"]
  },
  "timeline": [
    {
      "phase": "string - phase name",
      "duration": "string - time needed",
      "milestones": ["milestone1", "milestone2"],
      "dependencies": ["dependency1", "dependency2"]
    }
  ],
  "resourceRequirements": {
    "legal": ["legal expert type 1", "legal expert type 2"],
    "financial": ["financial expert type 1", "financial expert type 2"],
    "technical": ["technical expert type 1", "technical expert type 2"],
    "operational": ["operational expert type 1", "operational expert type 2"]
  },
  "confidence": {
    "score": number,
    "level": "high|medium|low",
    "percentage": number,
    "reasoning": "string explaining confidence in ${businessType.subsector} analysis",
    "factors": {
      "dataQuality": number,
      "sampleSize": number,
      "marketStability": number,
      "historicalAccuracy": number
    },
    "methodology": "string describing analysis approach for ${businessType.sector}",
    "limitations": ["limitation1", "limitation2"]
  },
  "recommendations": ["recommendation1 for ${businessType.subsector}", "recommendation2"]
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an elite due diligence expert with deep knowledge of ${businessType.sector} industry, specifically ${businessType.subsector} businesses. You have 25+ years of experience in M&A transactions, risk assessment, and comprehensive investigation methodologies. You understand the unique challenges, regulations, and operational complexities of ${businessType.subsector} businesses in ${listing.city}, ${listing.state}.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }, {
      timeout: 45000, // 45 second timeout
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const rawDueDiligence = parseAIResponse(response) as any;

    // Ensure all required arrays and objects are initialized for due diligence
    const dueDiligence: SuperEnhancedDueDiligence = {
      criticalItems: rawDueDiligence.criticalItems || [],
      riskMatrix: rawDueDiligence.riskMatrix || [],
      priorityActions: rawDueDiligence.priorityActions || [],
      industrySpecific: rawDueDiligence.industrySpecific || {
        regulations: [],
        compliance: [],
        certifications: [],
        specialConsiderations: []
      },
      timeline: rawDueDiligence.timeline || [],
      resourceRequirements: rawDueDiligence.resourceRequirements || {
        legal: [],
        financial: [],
        technical: [],
        operational: []
      },
      confidence: rawDueDiligence.confidence || {
        score: 0,
        level: 'low',
        percentage: 0,
        reasoning: 'Unknown',
        factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 },
        methodology: 'Unknown',
        limitations: []
      },
      recommendations: rawDueDiligence.recommendations || []
    };

    return dueDiligence;
  } catch (error) {
    console.error('Error in super enhanced due diligence:', error);
    throw new Error('Failed to generate super enhanced due diligence');
  }
}

// Super Enhanced Market Intelligence
export async function generateSuperEnhancedMarketIntelligence(
  title: string,
  description: string,
  industry: string,
  geography?: string,
  dealSize?: number,
  marketData?: any,
  useEconomyModel: boolean = true // Use GPT-4o-mini by default for speed/cost
): Promise<SuperEnhancedMarketIntelligence> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  // Generate market intelligence based on actual listing details
  console.log('MARKET INTELLIGENCE DEBUG: Analyzing', title, '(', industry, ') in', geography || 'general market');

  // Create listing object with actual details to detect business type
  const listingForDetection = { title, industry, description, city: '', state: '' } as Listing;
  const businessType = detectBusinessType(listingForDetection);
  console.log('🔍 DETECTED BUSINESS TYPE:', businessType.sector, '->', businessType.subsector, `(${businessType.confidence}% confidence)`);

  const prompt = `
As a top-tier market intelligence analyst with deep expertise in ${businessType.sector} industry and ${businessType.subsector} businesses, provide comprehensive market analysis for this specific business acquisition opportunity.

BUSINESS BEING ANALYZED:
- Title: ${title}
- Description: ${description}
- Industry: ${industry}
- Business Type: ${businessType.sector} → ${businessType.subsector} (${businessType.confidence}% confidence)
- Matching Keywords: ${businessType.matchingKeywords.join(', ')}
- Geography: ${geography || 'National'}
- Deal Size: $${dealSize?.toLocaleString() || 'Variable'}

${marketData ? `REAL MARKET DATA FROM OUR DATABASE (${marketData.totalListings} active ${industry} listings):

MARKET STATISTICS:
- Total Listings Available: ${marketData.totalListings} businesses currently for sale
${geography ? `- Listings in ${geography}: ${marketData.geoListings} businesses` : ''}
${dealSize ? `- Listings near $${dealSize.toLocaleString()}: ${marketData.dealSizeListings} businesses within 50%` : ''}

PRICING DATA:
- Average Asking Price: $${marketData.averagePrice?.toLocaleString() || 'N/A'}
- Median Asking Price: $${marketData.medianPrice?.toLocaleString() || 'N/A'}
- Price Distribution:
  * Under $500K: ${marketData.priceRanges.under500k} listings (${Math.round((marketData.priceRanges.under500k / marketData.totalListings) * 100)}%)
  * $500K-$1M: ${marketData.priceRanges.range500kTo1m} listings (${Math.round((marketData.priceRanges.range500kTo1m / marketData.totalListings) * 100)}%)
  * $1M-$2M: ${marketData.priceRanges.range1mTo2m} listings (${Math.round((marketData.priceRanges.range1mTo2m / marketData.totalListings) * 100)}%)
  * $2M-$5M: ${marketData.priceRanges.range2mTo5m} listings (${Math.round((marketData.priceRanges.range2mTo5m / marketData.totalListings) * 100)}%)
  * Over $5M: ${marketData.priceRanges.over5m} listings (${Math.round((marketData.priceRanges.over5m / marketData.totalListings) * 100)}%)

FINANCIAL BENCHMARKS:
- Average Revenue: $${marketData.averageRevenue?.toLocaleString() || 'N/A'}
- Median Revenue: $${marketData.medianRevenue?.toLocaleString() || 'N/A'}
- Average EBITDA: $${marketData.averageEBITDA?.toLocaleString() || 'N/A'}
- Median EBITDA: $${marketData.medianEBITDA?.toLocaleString() || 'N/A'}
- Average Employees: ${marketData.averageEmployees || 'N/A'}

${marketData.topStates ? `GEOGRAPHIC CONCENTRATION:
${marketData.topStates.map(([state, count]: [string, number]) => `- ${state}: ${count} listings (${Math.round((count / marketData.totalListings) * 100)}% of market)`).join('\n')}
` : ''}

SAMPLE ACTIVE LISTINGS:
${marketData.sampleListings.slice(0, 5).map((l: any, i: number) => `${i + 1}. ${l.title} - ${l.city}, ${l.state} | Revenue: $${l.revenue?.toLocaleString() || 'N/A'} | EBITDA: $${l.ebitda?.toLocaleString() || 'N/A'} | Price: $${l.price?.toLocaleString() || 'N/A'}`).join('\n')}

CRITICAL INSTRUCTION: This is REAL market data from our platform, not generic industry knowledge. Base your analysis on these ACTUAL numbers and trends. Reference specific data points (e.g., "With ${marketData.totalListings} active listings and an average price of $${marketData.averagePrice?.toLocaleString()}, the ${businessType.subsector} market shows..."). DO NOT provide generic analysis - be specific and data-driven.
` : ''}

REQUIRED COMPREHENSIVE MARKET INTELLIGENCE:

Provide detailed market intelligence covering:

1. MARKET OVERVIEW:
   - Market size analysis specific to ${businessType.subsector} in ${geography || 'the target region'}
   - Growth projections with confidence intervals and supporting data
   - Key market trends affecting ${businessType.subsector} businesses
   - Primary market drivers and their impact on ${businessType.subsector}

2. COMPETITIVE LANDSCAPE:
   - Competition intensity analysis for ${businessType.subsector} in ${geography || 'the market'}
   - Key players and market positioning in ${businessType.subsector}
   - Entry barriers specific to ${businessType.subsector}
   - Market opportunities and underserved segments

3. ECONOMIC ANALYSIS:
   - Economic outlook for ${businessType.sector} sector
   - Industry-specific economic risks and opportunities
   - DETAILED MARKET TIMING ANALYSIS: Provide comprehensive timing insights including:
     * Current market cycle phase for ${businessType.subsector}
     * Optimal acquisition timing factors
     * Economic indicators supporting timing decisions
     * Risk factors that could affect timing
     * Comparative analysis vs. historical cycles
     * Forward-looking timing considerations (6-18 months)

4. INVESTMENT CLIMATE:
   - M&A activity levels in ${businessType.subsector}
   - Valuation trends and multiples for ${businessType.subsector} businesses
   - Investment trends and capital availability
   - Market outlook for ${businessType.subsector} investments

5. STRATEGIC RECOMMENDATIONS:
   - Industry-specific acquisition recommendations
   - Market timing guidance with detailed reasoning
   - Strategic considerations for ${businessType.subsector} investments

Respond in JSON format with this EXACT structure:
{
  "marketOverview": {
    "size": {
      "insight": "string - detailed ${businessType.subsector} market size analysis",
      "confidence": {confidence_structure}
    },
    "growth": {
      "insight": "string - growth projections for ${businessType.subsector}",
      "confidence": {confidence_structure}
    },
    "trends": [
      {
        "insight": "string - trend affecting ${businessType.subsector}",
        "confidence": {confidence_structure}
      }
    ],
    "drivers": [
      {
        "insight": "string - market driver for ${businessType.subsector}",
        "confidence": {confidence_structure}
      }
    ]
  },
  "competitive": {
    "intensity": {
      "insight": "string - competition analysis for ${businessType.subsector}",
      "confidence": {confidence_structure}
    },
    "keyPlayers": [
      {
        "insight": "string - key players in ${businessType.subsector}",
        "confidence": {confidence_structure}
      }
    ],
    "barriers": [
      {
        "insight": "string - barriers in ${businessType.subsector}",
        "confidence": {confidence_structure}
      }
    ],
    "opportunities": [
      {
        "insight": "string - opportunities in ${businessType.subsector}",
        "confidence": {confidence_structure}
      }
    ]
  },
  "economic": {
    "outlook": {
      "insight": "string - economic outlook for ${businessType.sector}",
      "confidence": {confidence_structure}
    },
    "risks": [
      {
        "factor": "string - risk factor",
        "description": "string - detailed risk description",
        "severity": "low|medium|high|critical",
        "likelihood": number,
        "impact": number,
        "riskScore": number,
        "mitigationStrategies": ["strategy1", "strategy2"],
        "monitoringMetrics": ["metric1", "metric2"],
        "confidence": {confidence_structure},
        "category": "financial|operational|market|strategic|regulatory"
      }
    ],
    "opportunities": [
      {
        "insight": "string - economic opportunity",
        "confidence": {confidence_structure}
      }
    ],
    "timing": {
      "insight": "string - COMPREHENSIVE market timing analysis including cycle phase, acquisition timing factors, economic indicators, risk factors, historical comparison, and 6-18 month outlook for ${businessType.subsector}",
      "confidence": {confidence_structure}
    }
  },
  "investment": {
    "activity": {
      "insight": "string - M&A activity in ${businessType.subsector}",
      "confidence": {confidence_structure}
    },
    "valuations": {
      "insight": "string - valuation trends for ${businessType.subsector}",
      "confidence": {confidence_structure}
    },
    "trends": [
      {
        "insight": "string - investment trend",
        "confidence": {confidence_structure}
      }
    ],
    "outlook": {
      "insight": "string - investment outlook for ${businessType.subsector}",
      "confidence": {confidence_structure}
    }
  },
  "recommendations": ["recommendation1 for ${businessType.subsector}", "recommendation2"],
  "timing": "excellent|good|moderate|poor",
  "confidence": {
    "score": number,
    "level": "high|medium|low",
    "percentage": number,
    "reasoning": "string explaining confidence in ${businessType.subsector} analysis",
    "factors": {
      "dataQuality": number,
      "sampleSize": number,
      "marketStability": number,
      "historicalAccuracy": number
    },
    "methodology": "string describing analysis approach for ${businessType.sector}",
    "limitations": ["limitation1", "limitation2"]
  }
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: useEconomyModel ? "gpt-4o-mini" : "gpt-4o", // Use mini for 10x cost savings, 2x speed
      messages: [
        {
          role: "system",
          content: `You are an elite market intelligence analyst with deep expertise in ${businessType.sector} industry, specifically ${businessType.subsector} businesses. You have 20+ years of experience in market analysis, competitive intelligence, and investment timing. You understand the unique market dynamics, economic cycles, and strategic considerations affecting ${businessType.subsector} businesses in ${geography || 'various markets'}.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000,
    }, {
      timeout: 45000, // 45 second timeout
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const rawIntelligence = parseAIResponse(response) as any;

    // Ensure all required arrays are initialized for market intelligence
    const marketIntelligence: SuperEnhancedMarketIntelligence = {
      marketOverview: {
        size: rawIntelligence.marketOverview?.size || {
          insight: 'Data unavailable',
          confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }
        },
        growth: rawIntelligence.marketOverview?.growth || {
          insight: 'Data unavailable',
          confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }
        },
        trends: rawIntelligence.marketOverview?.trends || [],
        drivers: rawIntelligence.marketOverview?.drivers || []
      },
      competitive: {
        intensity: rawIntelligence.competitive?.intensity || {
          insight: 'Data unavailable',
          confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] }
        },
        keyPlayers: rawIntelligence.competitive?.keyPlayers || [],
        barriers: rawIntelligence.competitive?.barriers || [],
        opportunities: rawIntelligence.competitive?.opportunities || []
      },
      economic: {
        outlook: rawIntelligence.economic?.outlook || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        risks: rawIntelligence.economic?.risks || [],
        opportunities: rawIntelligence.economic?.opportunities || [],
        timing: rawIntelligence.economic?.timing || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } }
      },
      investment: {
        activity: rawIntelligence.investment?.activity || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        valuations: rawIntelligence.investment?.valuations || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        trends: rawIntelligence.investment?.trends || [],
        outlook: rawIntelligence.investment?.outlook || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } }
      },
      recommendations: rawIntelligence.recommendations || [],
      timing: rawIntelligence.timing || 'moderate',
      confidence: rawIntelligence.confidence || { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' }
    };

    return marketIntelligence;
  } catch (error) {
    console.error('Error in super enhanced market intelligence:', error);
    throw new Error('Failed to generate super enhanced market intelligence');
  }
}