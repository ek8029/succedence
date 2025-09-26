import OpenAI from 'openai';
import { Listing } from '@/lib/types';
import { EnhancedBusinessAnalysis, ConfidenceScore, RiskFactor } from './enhanced-openai';

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

// Super Enhanced Types - Advanced AI Analysis
export interface SuperConfidenceScore extends ConfidenceScore {
  score: number; // 0-100
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
  listing: Listing,
  analysisOptions: {
    perspective?: 'strategic_buyer' | 'financial_buyer' | 'first_time_buyer' | 'general';
    focusAreas?: string[];
    userProfile?: {
      experienceLevel?: 'novice' | 'intermediate' | 'expert';
      riskTolerance?: 'low' | 'medium' | 'high';
      industries?: string[];
    };
    analysisDepth?: 'quick' | 'standard' | 'comprehensive';
  } = {}
): Promise<SuperEnhancedBusinessAnalysis> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const startTime = Date.now();
  const {
    perspective = 'general',
    focusAreas = [],
    userProfile = {},
    analysisDepth = 'comprehensive'
  } = analysisOptions;

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
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- EBITDA: $${listing.ebitda?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Employees: ${listing.employees || 'Not specified'}
- Description: ${listing.description}

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
   - Detailed risk factors with likelihood×impact scoring
   - Mitigation strategies and monitoring metrics
   - Risk tolerance matching for buyer profile

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
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
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
      temperature: 0.1,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const analysis = JSON.parse(response) as SuperEnhancedBusinessAnalysis;
    analysis.processingTime = Date.now() - startTime;
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
  }
): Promise<SuperEnhancedBuyerMatch> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As an expert buyer-seller matching AI, analyze the compatibility between this buyer profile and business opportunity.

BUYER PROFILE:
- Industries: ${buyerPreferences.industries.join(', ') || 'Open to all'}
- Deal Size: $${buyerPreferences.dealSizeMin.toLocaleString()} - $${buyerPreferences.dealSizeMax.toLocaleString()}
- Geography: ${buyerPreferences.geographicPreferences.join(', ') || 'No preference'}
- Risk Tolerance: ${buyerPreferences.riskTolerance}
- Experience: ${buyerPreferences.experienceLevel}
- Keywords: ${buyerPreferences.keywords.join(', ') || 'None'}

BUSINESS OPPORTUNITY:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}

Provide a comprehensive buyer-business compatibility analysis with confidence scoring and detailed recommendations.

Respond in JSON format with detailed compatibility scoring, risk assessment, and strategic recommendations.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert buyer-business matching AI with deep understanding of compatibility factors, risk assessment, and deal success probability."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as SuperEnhancedBuyerMatch;
  } catch (error) {
    console.error('Error in super enhanced buyer match:', error);
    throw new Error('Failed to analyze buyer match with super enhanced features');
  }
}

// Super Enhanced Due Diligence Generator
export async function generateSuperEnhancedDueDiligence(
  listing: Listing
): Promise<SuperEnhancedDueDiligence> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As a world-class due diligence expert, create a comprehensive, risk-prioritized due diligence checklist for this acquisition.

BUSINESS DETAILS:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}

Create a super enhanced due diligence plan with:
1. Risk-prioritized checklist items
2. Industry-specific requirements
3. Timeline and resource planning
4. Critical red flags to investigate
5. Expert recommendations

Respond in JSON format with comprehensive due diligence structure.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a elite due diligence expert with deep knowledge of industry-specific requirements, risk assessment, and comprehensive investigation methodologies."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as SuperEnhancedDueDiligence;
  } catch (error) {
    console.error('Error in super enhanced due diligence:', error);
    throw new Error('Failed to generate super enhanced due diligence');
  }
}

// Super Enhanced Market Intelligence
export async function generateSuperEnhancedMarketIntelligence(
  industry: string,
  geography?: string,
  dealSize?: number
): Promise<SuperEnhancedMarketIntelligence> {
  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As a top market intelligence analyst, provide comprehensive market analysis for potential acquisitions.

ANALYSIS PARAMETERS:
- Industry: ${industry}
- Geography: ${geography || 'National'}
- Deal Size: $${dealSize?.toLocaleString() || 'Variable'}

Provide super enhanced market intelligence including:
1. Market size, growth, and trends analysis
2. Competitive landscape assessment
3. Economic factors and timing considerations
4. Investment climate and opportunities
5. Strategic recommendations with confidence scoring

Respond in JSON format with comprehensive market intelligence structure.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an elite market intelligence analyst with deep expertise in industry analysis, competitive dynamics, and investment timing."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 3500,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response) as SuperEnhancedMarketIntelligence;
  } catch (error) {
    console.error('Error in super enhanced market intelligence:', error);
    throw new Error('Failed to generate super enhanced market intelligence');
  }
}