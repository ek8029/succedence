import OpenAI from 'openai';
import { Listing } from '@/lib/types';

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
  return process.env.AI_FEATURES_ENABLED === 'true' && !!process.env.OPENAI_API_KEY;
};

// Types for AI responses
export interface BusinessAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  opportunities: string[];
  valuationInsights: string;
  marketPosition: string;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  summary: string;
}

export interface BuyerMatchScore {
  score: number;
  reasoning: string[];
  compatibilityFactors: string[];
  concerns: string[];
  recommendation: string;
}

export interface DueDiligenceChecklist {
  financial: string[];
  legal: string[];
  operational: string[];
  strategic: string[];
  risks: string[];
  timeline: string;
}

export interface MarketIntelligence {
  marketConditions: string;
  valuationTrends: string;
  competitiveAnalysis: string;
  timing: string;
  opportunities: string[];
  risks: string[];
}

// Business Analysis AI
export async function analyzeBusinessForAcquisition(listing: Listing): Promise<BusinessAnalysis> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As an expert M&A advisor, analyze this business acquisition opportunity:

Business Details:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}
- Years in Business: Not specified
- Employees: ${listing.employees || 'Not specified'}

Provide a comprehensive analysis including:
1. Overall attractiveness score (0-100)
2. Key strengths (3-5 points)
3. Potential weaknesses or concerns (3-5 points)
4. Risk factors to investigate (3-5 points)
5. Growth opportunities (3-5 points)
6. Valuation insights and market position
7. Final recommendation: strong_buy, buy, hold, or avoid
8. Executive summary (2-3 sentences)

Respond in JSON format with the structure:
{
  "overallScore": number,
  "strengths": ["point1", "point2", ...],
  "weaknesses": ["point1", "point2", ...],
  "risks": ["risk1", "risk2", ...],
  "opportunities": ["opp1", "opp2", ...],
  "valuationInsights": "detailed analysis",
  "marketPosition": "market position analysis",
  "recommendation": "strong_buy|buy|hold|avoid",
  "summary": "executive summary"
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior M&A advisor with 20+ years of experience in business acquisitions. Provide detailed, professional analysis based on the data provided."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    const analysis = JSON.parse(response) as BusinessAnalysis;
    return analysis;
  } catch (error) {
    console.error('Error analyzing business:', error);
    throw new Error('Failed to analyze business');
  }
}

// Buyer-Business Matching AI
export async function calculateBuyerBusinessMatch(
  listing: Listing,
  buyerPreferences: {
    industries?: string[];
    dealSizeMin?: number;
    dealSizeMax?: number;
    geographicPreferences?: string[];
    riskTolerance?: 'low' | 'medium' | 'high';
    experienceLevel?: 'first_time' | 'experienced' | 'expert';
  }
): Promise<BuyerMatchScore> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
Analyze the compatibility between this buyer profile and business listing:

Business:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}

Buyer Preferences:
- Target Industries: ${buyerPreferences.industries?.join(', ') || 'Any'}
- Deal Size Range: $${buyerPreferences.dealSizeMin?.toLocaleString() || '0'} - $${buyerPreferences.dealSizeMax?.toLocaleString() || 'No limit'}
- Geographic Preferences: ${buyerPreferences.geographicPreferences?.join(', ') || 'Any location'}
- Risk Tolerance: ${buyerPreferences.riskTolerance || 'medium'}
- Experience Level: ${buyerPreferences.experienceLevel || 'experienced'}

Calculate a compatibility score (0-100) and provide detailed analysis.

Respond in JSON format:
{
  "score": number,
  "reasoning": ["reason1", "reason2", ...],
  "compatibilityFactors": ["factor1", "factor2", ...],
  "concerns": ["concern1", "concern2", ...],
  "recommendation": "detailed recommendation"
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert business broker specializing in buyer-seller matching. Analyze compatibility based on financial fit, strategic alignment, and buyer capability."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as BuyerMatchScore;
  } catch (error) {
    console.error('Error calculating buyer match:', error);
    throw new Error('Failed to calculate buyer compatibility');
  }
}

// Due Diligence Assistant AI
export async function generateDueDiligenceChecklist(listing: Listing): Promise<DueDiligenceChecklist> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
Generate a comprehensive due diligence checklist for acquiring this ${listing.industry} business:

Business Details:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- Location: ${listing.city}, ${listing.state}
- Description: ${listing.description}

Create detailed checklists for:
1. Financial due diligence items
2. Legal and compliance checks
3. Operational assessments
4. Strategic considerations
5. Key risk areas to investigate
6. Recommended timeline for due diligence process

Respond in JSON format:
{
  "financial": ["item1", "item2", ...],
  "legal": ["item1", "item2", ...],
  "operational": ["item1", "item2", ...],
  "strategic": ["item1", "item2", ...],
  "risks": ["risk1", "risk2", ...],
  "timeline": "recommended timeline and milestones"
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a senior due diligence expert with extensive experience in business acquisitions across various industries."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as DueDiligenceChecklist;
  } catch (error) {
    console.error('Error generating due diligence checklist:', error);
    throw new Error('Failed to generate due diligence checklist');
  }
}

// Market Intelligence AI
export async function generateMarketIntelligence(
  industry: string,
  geography?: string,
  dealSize?: number
): Promise<MarketIntelligence> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
Provide current market intelligence for business acquisitions in:
- Industry: ${industry}
- Geography: ${geography || 'General market'}
- Deal Size Range: Around $${dealSize?.toLocaleString() || 'Various sizes'}

Include analysis of:
1. Current market conditions for M&A in this sector
2. Valuation trends and typical multiples
3. Competitive landscape and acquisition activity
4. Market timing considerations
5. Key opportunities in the market
6. Potential risks and challenges

Respond in JSON format:
{
  "marketConditions": "current market state analysis",
  "valuationTrends": "valuation trends and multiples",
  "competitiveAnalysis": "competitive landscape",
  "timing": "market timing insights",
  "opportunities": ["opportunity1", "opportunity2", ...],
  "risks": ["risk1", "risk2", ...]
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a market research expert specializing in M&A trends and industry analysis. Provide insights based on current market knowledge and trends."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as MarketIntelligence;
  } catch (error) {
    console.error('Error generating market intelligence:', error);
    throw new Error('Failed to generate market intelligence');
  }
}

// Smart Buy-Box Generator
export async function generateSmartBuyBox(
  userProfile: {
    industries?: string[];
    dealSizeRange?: { min: number; max: number };
    riskTolerance?: string;
    experienceLevel?: string;
    investmentGoals?: string[];
  }
): Promise<{
  criteria: string[];
  redFlags: string[];
  targetMetrics: Record<string, string>;
  recommendations: string[];
}> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
Based on this buyer profile, generate intelligent acquisition criteria:

Buyer Profile:
- Industries: ${userProfile.industries?.join(', ') || 'Open to various'}
- Deal Size: $${userProfile.dealSizeRange?.min?.toLocaleString() || '0'} - $${userProfile.dealSizeRange?.max?.toLocaleString() || 'No limit'}
- Risk Tolerance: ${userProfile.riskTolerance || 'medium'}
- Experience Level: ${userProfile.experienceLevel || 'experienced'}
- Investment Goals: ${userProfile.investmentGoals?.join(', ') || 'Growth and ROI'}

Generate:
1. Specific acquisition criteria (5-8 items)
2. Red flags to avoid (5-8 items)
3. Target financial metrics and ranges
4. Strategic recommendations for this buyer

Respond in JSON format:
{
  "criteria": ["criterion1", "criterion2", ...],
  "redFlags": ["flag1", "flag2", ...],
  "targetMetrics": {
    "revenueRange": "range",
    "ebitdaMargin": "target %",
    "growthRate": "target %",
    "multiple": "valuation multiple range"
  },
  "recommendations": ["rec1", "rec2", ...]
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an investment advisor specializing in business acquisitions. Create personalized acquisition criteria based on buyer profiles."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating smart buy-box:', error);
    throw new Error('Failed to generate smart buy-box');
  }
}