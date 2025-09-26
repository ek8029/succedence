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
  const aiEnabled = process.env.AI_FEATURES_ENABLED;
  const isEnabled = aiEnabled === 'true' || aiEnabled === 'TRUE' || aiEnabled === '1';
  return isEnabled && !!process.env.OPENAI_API_KEY;
};

// Enhanced types with confidence scoring and risk matrices
export interface ConfidenceScore {
  level: 'high' | 'medium' | 'low';
  percentage: number;
  reasoning: string;
}

export interface RiskFactor {
  category: 'financial' | 'operational' | 'market' | 'strategic' | 'regulatory';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  confidence: ConfidenceScore;
}

export interface EnhancedInsight {
  content: string;
  confidence: ConfidenceScore;
  supportingData: string[];
  assumptions: string[];
}

export interface EnhancedBusinessAnalysis {
  // Core analysis
  overallScore: number;
  overallScoreConfidence: ConfidenceScore;
  recommendation: 'strong_buy' | 'buy' | 'hold' | 'avoid';
  recommendationConfidence: ConfidenceScore;

  // Enhanced insights with confidence
  strengths: EnhancedInsight[];
  weaknesses: EnhancedInsight[];
  opportunities: EnhancedInsight[];

  // Risk matrix
  riskMatrix: RiskFactor[];
  riskScore: number; // Overall risk score 0-100

  // Enhanced analysis
  valuationInsights: EnhancedInsight;
  marketPosition: EnhancedInsight;
  competitiveAdvantage: EnhancedInsight;

  // Summary and actions
  executiveSummary: string;
  keyAssumptions: string[];
  recommendedActions: string[];
  redFlags: string[];

  // Meta information
  analysisDate: string;
  dataQuality: 'excellent' | 'good' | 'fair' | 'limited';
  analysisDepth: 'comprehensive' | 'standard' | 'preliminary';

  // Analysis perspective
  perspective: 'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general';
  perspectiveNotes: string;
}

export interface FollowUpQuery {
  query: string;
  context: string;
  analysisId?: string;
}

export interface FollowUpResponse {
  answer: string;
  confidence: ConfidenceScore;
  relatedInsights: string[];
  suggestedFollowUps: string[];
}

// Enhanced Business Analysis AI with multiple perspectives
export async function analyzeBusinessEnhanced(
  listing: Listing,
  analysisOptions: {
    perspective?: 'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general';
    focusAreas?: string[];
    userProfile?: {
      experienceLevel?: 'novice' | 'intermediate' | 'expert';
      riskTolerance?: 'low' | 'medium' | 'high';
      industries?: string[];
    };
  } = {}
): Promise<EnhancedBusinessAnalysis> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const { perspective = 'general', focusAreas = [], userProfile = {} } = analysisOptions;

  const perspectiveContext = {
    strategic_buyer: "You are analyzing this for a strategic buyer who owns businesses in related industries and seeks synergistic acquisitions for growth and market expansion.",
    financial_buyer: "You are analyzing this for a financial buyer (private equity, investment fund) focused on financial returns, cash flow, and exit opportunities.",
    first_time_buyer: "You are analyzing this for a first-time business buyer who needs clear explanations, significant support, and lower-risk opportunities.",
    general: "You are providing a balanced analysis suitable for various buyer types."
  };

  const prompt = `
As an expert M&A advisor with 25+ years of experience, conduct a comprehensive enhanced analysis of this business acquisition opportunity.

ANALYSIS CONTEXT:
- Perspective: ${perspectiveContext[perspective]}
- User Experience: ${userProfile.experienceLevel || 'intermediate'}
- Risk Tolerance: ${userProfile.riskTolerance || 'medium'}
- Focus Areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'All aspects'}

BUSINESS DETAILS:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}
- Employees: ${listing.employees || 'Not specified'}

REQUIRED ANALYSIS:

1. OVERALL ASSESSMENT:
   - Overall score (0-100) with confidence level and reasoning
   - Recommendation (strong_buy/buy/hold/avoid) with confidence
   - Data quality assessment and analysis depth

2. ENHANCED INSIGHTS (each with confidence scoring):
   - 4-6 key strengths with supporting data and assumptions
   - 4-6 areas of concern with supporting data and assumptions
   - 4-6 growth opportunities with supporting data and assumptions

3. COMPREHENSIVE RISK MATRIX:
   - Financial risks (liquidity, profitability, debt, etc.)
   - Operational risks (management, processes, competition, etc.)
   - Market risks (industry trends, economic factors, etc.)
   - Strategic risks (fit, synergies, integration, etc.)
   - Regulatory risks (compliance, legal, licensing, etc.)
   For each risk: severity, likelihood, impact, and confidence level

4. DEEP MARKET ANALYSIS:
   - Valuation insights with confidence and assumptions
   - Market position analysis with confidence and assumptions
   - Competitive advantage assessment with confidence and assumptions

5. ACTIONABLE INTELLIGENCE:
   - Executive summary (3-4 sentences)
   - Key assumptions made in analysis
   - Specific recommended next steps
   - Red flags requiring immediate investigation

6. PERSPECTIVE-SPECIFIC NOTES:
   - Analysis tailored to the ${perspective} viewpoint
   - Specific considerations for this buyer type

Respond in JSON format with this exact structure:
{
  "overallScore": number,
  "overallScoreConfidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"},
  "recommendation": "strong_buy|buy|hold|avoid",
  "recommendationConfidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"},
  "strengths": [
    {
      "content": "strength description",
      "confidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"},
      "supportingData": ["data1", "data2"],
      "assumptions": ["assumption1", "assumption2"]
    }
  ],
  "weaknesses": [similar structure to strengths],
  "opportunities": [similar structure to strengths],
  "riskMatrix": [
    {
      "category": "financial|operational|market|strategic|regulatory",
      "description": "risk description",
      "severity": "low|medium|high|critical",
      "likelihood": "low|medium|high",
      "impact": "low|medium|high",
      "confidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"}
    }
  ],
  "riskScore": number,
  "valuationInsights": {
    "content": "valuation analysis",
    "confidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"},
    "supportingData": ["data1", "data2"],
    "assumptions": ["assumption1", "assumption2"]
  },
  "marketPosition": {similar structure to valuationInsights},
  "competitiveAdvantage": {similar structure to valuationInsights},
  "executiveSummary": "string",
  "keyAssumptions": ["assumption1", "assumption2"],
  "recommendedActions": ["action1", "action2"],
  "redFlags": ["flag1", "flag2"],
  "analysisDate": "${new Date().toISOString()}",
  "dataQuality": "excellent|good|fair|limited",
  "analysisDepth": "comprehensive|standard|preliminary",
  "perspective": "${perspective}",
  "perspectiveNotes": "perspective-specific insights"
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a world-class M&A advisor with expertise across all industries. Provide detailed, professional analysis with high accuracy and actionable insights. Always include confidence levels and supporting reasoning for your assessments."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(response) as EnhancedBusinessAnalysis;
    return analysis;
  } catch (error) {
    console.error('Error in enhanced business analysis:', error);
    throw new Error('Failed to analyze business with enhanced features');
  }
}

// Follow-up Analysis AI for deeper insights
export async function generateFollowUpAnalysis(
  originalAnalysis: EnhancedBusinessAnalysis,
  query: FollowUpQuery,
  listing: Listing
): Promise<FollowUpResponse> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As an M&A expert, provide a detailed follow-up analysis based on this user query:

ORIGINAL ANALYSIS CONTEXT:
- Business: ${listing.title} (${listing.industry})
- Overall Score: ${originalAnalysis.overallScore}/100
- Recommendation: ${originalAnalysis.recommendation}
- Perspective: ${originalAnalysis.perspective}

USER QUERY: "${query.query}"

CONTEXT: ${query.context}

Provide a comprehensive answer that:
1. Directly addresses the user's question
2. References relevant parts of the original analysis
3. Provides new insights or deeper analysis
4. Includes confidence level for your response
5. Suggests related follow-up questions

Respond in JSON format:
{
  "answer": "detailed response to the query",
  "confidence": {"level": "high|medium|low", "percentage": number, "reasoning": "string"},
  "relatedInsights": ["insight1", "insight2", "insight3"],
  "suggestedFollowUps": ["question1", "question2", "question3"]
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert M&A advisor providing follow-up analysis. Give detailed, actionable responses with high confidence levels when supported by data."
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

    return JSON.parse(response) as FollowUpResponse;
  } catch (error) {
    console.error('Error generating follow-up analysis:', error);
    throw new Error('Failed to generate follow-up analysis');
  }
}

// User behavior tracking for personalization
export interface UserAnalysisPreferences {
  preferredPerspective: 'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general';
  focusAreas: string[];
  riskTolerance: 'low' | 'medium' | 'high';
  experienceLevel: 'novice' | 'intermediate' | 'expert';
  industryExpertise: string[];
  analysisDepthPreference: 'quick' | 'standard' | 'comprehensive';
  lastUpdated: string;
}

// Generate personalized analysis recommendations
export async function generatePersonalizedRecommendations(
  userPreferences: UserAnalysisPreferences,
  analysisHistory: EnhancedBusinessAnalysis[]
): Promise<{
  recommendedSettings: Partial<UserAnalysisPreferences>;
  insights: string[];
  improvements: string[];
}> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
Based on this user's analysis preferences and history, provide personalized recommendations:

USER PREFERENCES:
- Preferred Perspective: ${userPreferences.preferredPerspective}
- Focus Areas: ${userPreferences.focusAreas.join(', ')}
- Risk Tolerance: ${userPreferences.riskTolerance}
- Experience Level: ${userPreferences.experienceLevel}
- Industry Expertise: ${userPreferences.industryExpertise.join(', ')}
- Analysis Depth: ${userPreferences.analysisDepthPreference}

ANALYSIS HISTORY (last ${analysisHistory.length} analyses):
${analysisHistory.map((analysis, i) => `
Analysis ${i+1}:
- Score: ${analysis.overallScore}
- Recommendation: ${analysis.recommendation}
- Perspective: ${analysis.perspective}
- Risk Score: ${analysis.riskScore}
`).join('')}

Provide recommendations to optimize the user's analysis experience and settings.

Respond in JSON format:
{
  "recommendedSettings": {
    "preferredPerspective": "string",
    "focusAreas": ["area1", "area2"],
    "analysisDepthPreference": "string"
  },
  "insights": ["insight1", "insight2", "insight3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI optimization expert who helps users get better analysis results based on their behavior patterns and preferences."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating personalized recommendations:', error);
    throw new Error('Failed to generate personalized recommendations');
  }
}