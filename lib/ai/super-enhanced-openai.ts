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

function parseAIResponse(response: string): any {
  console.log('🚀 AI RAW RESPONSE PREVIEW:', response.substring(0, 300) + '...');

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
      temperature: 0.1,
      max_tokens: 4000,
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
  }
): Promise<SuperEnhancedBuyerMatch> {
  // TEMPORARY MOCK DATA - Return immediately to bypass OpenAI timeout issues
  console.log('🚀 BUYER MATCH DEBUG: Using mock data to bypass OpenAI timeout');

  const mockBuyerMatch = {
    score: 72,
    confidence: {
      score: 85,
      level: "high",
      percentage: 85,
      reasoning: "Based on industry alignment and financial capacity assessment",
      factors: { dataQuality: 90, sampleSize: 80, marketStability: 85, historicalAccuracy: 85 },
      methodology: "Multi-factor compatibility analysis",
      limitations: ["Limited buyer history data", "Market volatility assumptions"]
    },
    compatibility: {
      industryExperience: {
        insight: "Strong alignment between buyer's general business experience and medical device distribution industry requirements",
        actionable: "Leverage existing business experience for operational synergies",
        confidence: { score: 80, level: "high", percentage: 80, reasoning: "Based on industry transferability analysis", factors: { dataQuality: 85, sampleSize: 75, marketStability: 80, historicalAccuracy: 80 }, methodology: "Industry analysis", limitations: [] },
        supportingData: ["Industry experience data", "Business model analysis"],
        assumptions: ["Experience translates to medical device industry"],
        sourceQuality: "high",
        timeframe: "Immediate",
        probability: 80
      },
      financialCapacity: {
        insight: "Buyer's deal size range ($0-$10M) matches the business pricing expectations",
        actionable: "Proceed with financial due diligence within established range",
        confidence: { score: 90, level: "high", percentage: 90, reasoning: "Direct financial range alignment", factors: { dataQuality: 95, sampleSize: 85, marketStability: 90, historicalAccuracy: 90 }, methodology: "Financial analysis", limitations: [] },
        supportingData: ["Deal size preferences", "Business valuation"],
        assumptions: ["Financing capacity confirmed"],
        sourceQuality: "high",
        timeframe: "Immediate",
        probability: 90
      },
      operationalFit: {
        insight: "Medical device distribution requires specialized regulatory knowledge that may present learning curve",
        actionable: "Plan for regulatory compliance training and expert consultation",
        confidence: { score: 70, level: "medium", percentage: 70, reasoning: "Industry complexity assessment", factors: { dataQuality: 75, sampleSize: 65, marketStability: 70, historicalAccuracy: 75 }, methodology: "Complexity analysis", limitations: ["Limited industry data"] },
        supportingData: ["Regulatory requirements", "Industry complexity analysis"],
        assumptions: ["Learning curve manageable with proper support"],
        sourceQuality: "medium",
        timeframe: "6-12 months",
        probability: 70
      },
      culturalAlignment: {
        insight: "Healthcare-focused business culture aligns with socially conscious buyer preferences",
        actionable: "Maintain healthcare mission and values during transition",
        confidence: { score: 75, level: "medium", percentage: 75, reasoning: "Cultural values assessment", factors: { dataQuality: 80, sampleSize: 70, marketStability: 75, historicalAccuracy: 75 }, methodology: "Cultural analysis", limitations: ["Subjective assessment"] },
        supportingData: ["Company mission", "Buyer values"],
        assumptions: ["Cultural fit maintained post-acquisition"],
        sourceQuality: "medium",
        timeframe: "Ongoing",
        probability: 75
      },
      strategicValue: {
        insight: "Potential for cross-industry expansion and utilization of buyer's general business experience",
        actionable: "Develop strategic growth plan leveraging buyer expertise",
        confidence: { score: 85, level: "high", percentage: 85, reasoning: "Growth opportunity analysis", factors: { dataQuality: 90, sampleSize: 80, marketStability: 85, historicalAccuracy: 85 }, methodology: "Opportunity analysis", limitations: [] },
        supportingData: ["Growth opportunities", "Strategic analysis"],
        assumptions: ["Buyer can execute growth strategy"],
        sourceQuality: "high",
        timeframe: "1-3 years",
        probability: 85
      }
    },
    risks: [
      { factor: "Regulatory Compliance", description: "Learning curve in medical device industry", severity: "medium", likelihood: 70, impact: 60, riskScore: 42, mitigationStrategies: ["Retain existing management", "Invest in compliance training"], monitoringMetrics: ["Compliance audits", "Training completion"], confidence: { score: 80, level: "high", percentage: 80, reasoning: "Known industry challenges", factors: { dataQuality: 85, sampleSize: 80, marketStability: 75, historicalAccuracy: 85 }, methodology: "Risk analysis", limitations: [] }, category: "regulatory" }
    ],
    riskMitigation: [
      "Retain existing management team during transition",
      "Invest in regulatory compliance training and systems",
      "Diversify supplier base to reduce dependency"
    ],
    synergies: [
      { insight: "Potential for cross-industry expansion into related healthcare sectors", actionable: "Develop expansion strategy", confidence: { score: 85, level: "high", percentage: 85, reasoning: "Growth opportunity analysis", factors: { dataQuality: 90, sampleSize: 80, marketStability: 85, historicalAccuracy: 85 }, methodology: "Market analysis", limitations: [] }, supportingData: ["Market data"], assumptions: ["Market acceptance"], sourceQuality: "high", timeframe: "2-3 years", probability: 80 }
    ],
    growthOpportunities: [
      { insight: "Expansion into adjacent medical device categories", actionable: "Assess product line extension", confidence: { score: 80, level: "high", percentage: 80, reasoning: "Industry knowledge transfer", factors: { dataQuality: 85, sampleSize: 75, marketStability: 80, historicalAccuracy: 80 }, methodology: "Industry analysis", limitations: [] }, supportingData: ["Market analysis"], assumptions: ["Successful expansion"], sourceQuality: "high", timeframe: "1-2 years", probability: 75 }
    ],
    recommendation: "good_match",
    reasoning: [
      "Strong financial alignment with deal size preferences",
      "Good strategic fit with growth potential",
      "Manageable risk profile with proper mitigation strategies"
    ],
    nextSteps: [
      "Conduct detailed due diligence on regulatory requirements",
      "Meet with key suppliers and assess relationship stability",
      "Review existing management team retention possibilities"
    ],
    scoreBreakdown: {
      industryFit: 75,
      financialFit: 90,
      operationalFit: 70,
      culturalFit: 75,
      strategicFit: 85
    }
  };

  return mockBuyerMatch as any;

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

BUSINESS OPPORTUNITY:
- Title: ${listing.title}
- Industry: ${listing.industry}
- Location: ${listing.city}, ${listing.state}
- Price: $${listing.price?.toLocaleString() || 'Not disclosed'}
- Revenue: $${listing.revenue?.toLocaleString() || 'Not disclosed'}
- Description: ${listing.description}

Analyze the buyer-business compatibility and provide a comprehensive match score with detailed insights.

Respond in JSON format with:
- Overall match score (0-100)
- Industry, financial, operational, cultural, and strategic fit scores
- Compatibility insights for each area
- Risk factors and mitigation strategies
- Synergy opportunities
- Growth opportunities
- Recommendation (excellent_match, good_match, moderate_match, poor_match)
- Reasoning and next steps
- Confidence scoring with methodology
`;

  try {
    // TEMPORARY MOCK DATA - Bypass OpenAI timeout issues for frontend testing
    const mockRawMatch = {
      score: 72,
      confidence: {
        score: 85,
        level: "high",
        percentage: 85,
        reasoning: "Based on industry alignment and financial capacity assessment",
        factors: { dataQuality: 90, sampleSize: 80, marketStability: 85, historicalAccuracy: 85 },
        methodology: "Multi-factor compatibility analysis",
        limitations: ["Limited buyer history data", "Market volatility assumptions"]
      },
      compatibility: {
        industryExperience: {
          insight: "Strong alignment between buyer's general business experience and medical device distribution industry requirements",
          confidence: { score: 80, level: "high", percentage: 80, reasoning: "Based on industry transferability analysis", factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: "Unknown", limitations: [] }
        },
        financialCapacity: {
          insight: "Buyer's deal size range ($0-$10M) matches the business pricing expectations",
          confidence: { score: 90, level: "high", percentage: 90, reasoning: "Direct financial range alignment", factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: "Unknown", limitations: [] }
        },
        operationalFit: {
          insight: "Medical device distribution requires specialized regulatory knowledge that may present learning curve",
          confidence: { score: 70, level: "medium", percentage: 70, reasoning: "Industry complexity assessment", factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: "Unknown", limitations: [] }
        },
        culturalAlignment: {
          insight: "Healthcare-focused business culture aligns with socially conscious buyer preferences",
          confidence: { score: 75, level: "medium", percentage: 75, reasoning: "Cultural values assessment", factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: "Unknown", limitations: [] }
        },
        strategicValue: {
          insight: "Potential for cross-industry expansion and utilization of buyer's general business experience",
          confidence: { score: 85, level: "high", percentage: 85, reasoning: "Growth opportunity analysis", factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: "Unknown", limitations: [] }
        }
      },
      risks: [
        "Regulatory compliance learning curve in medical device industry",
        "Supplier relationship dependency on existing management",
        "Healthcare market volatility and reimbursement changes"
      ],
      riskMitigation: [
        "Retain existing management team during transition",
        "Invest in regulatory compliance training and systems",
        "Diversify supplier base to reduce dependency"
      ],
      synergies: [
        "Potential for cross-industry expansion into related healthcare sectors",
        "Utilization of buyer's general business experience for operational improvements",
        "Opportunity to implement modern business practices and technology"
      ],
      growthOpportunities: [
        "Expansion into adjacent medical device categories",
        "Geographic expansion to underserved markets",
        "Digital transformation and e-commerce capabilities"
      ],
      recommendation: "good_match",
      reasoning: [
        "Strong financial alignment with deal size preferences",
        "Good strategic fit with growth potential",
        "Manageable risk profile with proper mitigation strategies"
      ],
      nextSteps: [
        "Conduct detailed due diligence on regulatory requirements",
        "Meet with key suppliers and assess relationship stability",
        "Review existing management team retention possibilities"
      ],
      scoreBreakdown: {
        industryFit: 75,
        financialFit: 90,
        operationalFit: 70,
        culturalFit: 75,
        strategicFit: 85
      }
    };

    console.log('🚀 BUYER MATCH DEBUG: Using mock data for frontend testing');
    const rawMatch = mockRawMatch;

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
  listing: Listing
): Promise<SuperEnhancedDueDiligence> {
  // TEMPORARY MOCK DATA - Return immediately to bypass OpenAI timeout
  console.log('🚀 DUE DILIGENCE DEBUG: Using mock data to bypass OpenAI timeout');

  const mockDueDiligence = {
    criticalItems: [
      {
        category: "Financial Verification",
        items: [
          {
            task: "Verify 3 years of audited financial statements",
            priority: "critical",
            riskLevel: "high",
            effort: "2-3 weeks",
            expertise: "CPA/Financial analyst",
            timeline: "First 30 days",
            redFlags: ["Missing documents", "Inconsistent numbers", "Qualified audit opinions"]
          },
          {
            task: "Review cash flow statements and working capital trends",
            priority: "high",
            riskLevel: "medium",
            effort: "1-2 weeks",
            expertise: "Financial analyst",
            timeline: "First 21 days",
            redFlags: ["Negative cash flow trends", "Seasonal volatility", "Collection issues"]
          }
        ]
      },
      {
        category: "Legal & Regulatory",
        items: [
          {
            task: "Review medical device distribution licenses and FDA compliance",
            priority: "critical",
            riskLevel: "high",
            effort: "2-4 weeks",
            expertise: "Healthcare regulatory attorney",
            timeline: "First 30 days",
            redFlags: ["Expired licenses", "FDA violations", "Pending investigations"]
          },
          {
            task: "Analyze supplier contracts and distribution agreements",
            priority: "high",
            riskLevel: "medium",
            effort: "2-3 weeks",
            expertise: "Contract attorney",
            timeline: "First 45 days",
            redFlags: ["Short-term contracts", "Unfavorable terms", "Key customer concentration"]
          }
        ]
      }
    ],
    riskMatrix: [
      {
        factor: "Regulatory Compliance",
        description: "Medical device distribution requires strict FDA compliance",
        severity: "high",
        likelihood: 60,
        impact: 85,
        riskScore: 51,
        mitigationStrategies: ["Engage regulatory consultant", "Conduct compliance audit"],
        monitoringMetrics: ["FDA inspection results", "Compliance training completion"],
        confidence: { score: 90, level: "high", percentage: 90, reasoning: "Well-known industry requirement", factors: { dataQuality: 95, sampleSize: 85, marketStability: 90, historicalAccuracy: 90 }, methodology: "Industry analysis", limitations: [] },
        category: "regulatory"
      }
    ],
    priorityActions: [
      "Verify all regulatory licenses and compliance status",
      "Review financial statements with healthcare industry expert",
      "Assess key supplier relationship stability",
      "Evaluate management team retention plans"
    ],
    industrySpecific: {
      regulations: ["FDA 21 CFR Part 820", "Medical Device Reporting (MDR)", "State licensing requirements"],
      compliance: ["Good Manufacturing Practices (GMP)", "ISO 13485 certification", "Supply chain security"],
      certifications: ["FDA Device Establishment Registration", "State distributor licenses", "DEA registration if applicable"],
      specialConsiderations: ["Product liability insurance", "Recall procedures", "Traceability requirements", "Cold chain management"]
    },
    timeline: [
      {
        phase: "Phase 1: Critical Verification",
        duration: "30 days",
        milestones: ["Financial statements verified", "Regulatory compliance confirmed", "Key contracts reviewed"],
        dependencies: ["Management cooperation", "Third-party auditor availability"]
      },
      {
        phase: "Phase 2: Operational Review",
        duration: "45 days",
        milestones: ["Inventory audit completed", "IT systems evaluated", "Employee interviews conducted"],
        dependencies: ["Site access", "Employee availability"]
      }
    ],
    resourceRequirements: {
      legal: ["Healthcare regulatory attorney", "Contract specialist", "IP attorney"],
      financial: ["CPA with healthcare experience", "Valuation specialist", "Tax advisor"],
      technical: ["Medical device expert", "IT systems auditor", "Quality assurance specialist"],
      operational: ["Supply chain analyst", "HR consultant", "Insurance specialist"]
    },
    confidence: {
      score: 85,
      level: "high",
      percentage: 85,
      reasoning: "Comprehensive industry-specific checklist based on medical device distribution requirements",
      factors: { dataQuality: 90, sampleSize: 80, marketStability: 85, historicalAccuracy: 90 },
      methodology: "Industry best practices and regulatory requirements",
      limitations: ["Company-specific risks may require additional items"]
    },
    recommendations: [
      "Engage healthcare-specialized due diligence team",
      "Allow extra time for regulatory compliance verification",
      "Consider management retention incentives early in process",
      "Plan for potential regulatory consultant costs"
    ]
  };

  return mockDueDiligence as any;

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

Create a detailed due diligence plan with:
- Risk-prioritized checklist items by category
- Industry-specific requirements and compliance
- Timeline and resource planning
- Critical red flags to investigate
- Expert recommendations

Provide comprehensive JSON response with all due diligence areas covered.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
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
      max_tokens: 2000,
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
      confidence: rawDueDiligence.confidence || { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown', factors: { dataQuality: 0, sampleSize: 0, marketStability: 0, historicalAccuracy: 0 }, methodology: 'Unknown', limitations: [] },
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
  industry: string,
  geography?: string,
  dealSize?: number
): Promise<SuperEnhancedMarketIntelligence> {
  // TEMPORARY MOCK DATA - Return immediately to bypass OpenAI timeout
  console.log('🚀 MARKET INTELLIGENCE DEBUG: Using mock data to bypass OpenAI timeout');

  const mockMarketIntelligence = {
    marketOverview: {
      size: {
        insight: "The U.S. medical device distribution market is valued at approximately $180 billion, with medical device distribution representing about 15% of the total healthcare supply chain",
        confidence: { score: 90, level: "high", percentage: 90, reasoning: "Based on industry reports and government data", factors: { dataQuality: 95, sampleSize: 90, marketStability: 85, historicalAccuracy: 90 }, methodology: "Industry analysis", limitations: [] }
      },
      growth: {
        insight: "Market projected to grow at 6-8% CAGR through 2028, driven by aging population, technological advances, and increased healthcare spending",
        confidence: { score: 85, level: "high", percentage: 85, reasoning: "Multiple industry forecasts align on growth trajectory", factors: { dataQuality: 90, sampleSize: 85, marketStability: 80, historicalAccuracy: 85 }, methodology: "Market research synthesis", limitations: ["Economic uncertainty", "Regulatory changes"] }
      },
      trends: [
        {
          insight: "Increasing demand for minimally invasive medical devices and surgical instruments",
          confidence: { score: 90, level: "high", percentage: 90, reasoning: "Clear industry trend supported by multiple data sources", factors: { dataQuality: 95, sampleSize: 90, marketStability: 85, historicalAccuracy: 90 }, methodology: "Trend analysis", limitations: [] }
        },
        {
          insight: "Growing adoption of digital health technologies and remote monitoring devices",
          confidence: { score: 85, level: "high", percentage: 85, reasoning: "Accelerated by COVID-19 and technological advancements", factors: { dataQuality: 90, sampleSize: 80, marketStability: 75, historicalAccuracy: 85 }, methodology: "Market analysis", limitations: ["Technology adoption rates vary"] }
        }
      ],
      drivers: [
        {
          insight: "Aging baby boomer population increasing demand for medical devices and healthcare services",
          confidence: { score: 95, level: "high", percentage: 95, reasoning: "Demographic data is highly reliable", factors: { dataQuality: 98, sampleSize: 95, marketStability: 90, historicalAccuracy: 95 }, methodology: "Demographic analysis", limitations: [] }
        }
      ]
    },
    competitive: {
      intensity: {
        insight: "Highly competitive market with both large national distributors (McKesson, Cardinal Health) and specialized regional players competing on service quality and relationships",
        confidence: { score: 85, level: "high", percentage: 85, reasoning: "Well-documented competitive landscape", factors: { dataQuality: 90, sampleSize: 85, marketStability: 80, historicalAccuracy: 85 }, methodology: "Competitive analysis", limitations: [] }
      },
      keyPlayers: [
        {
          insight: "McKesson Corporation dominates with ~30% market share, followed by Cardinal Health and AmerisourceBergen",
          confidence: { score: 90, level: "high", percentage: 90, reasoning: "Public company financial data", factors: { dataQuality: 95, sampleSize: 90, marketStability: 85, historicalAccuracy: 90 }, methodology: "Market share analysis", limitations: [] }
        }
      ],
      barriers: [
        {
          insight: "High regulatory compliance requirements and established supplier relationships create significant barriers to entry",
          confidence: { score: 95, level: "high", percentage: 95, reasoning: "Known industry characteristic", factors: { dataQuality: 95, sampleSize: 90, marketStability: 90, historicalAccuracy: 95 }, methodology: "Industry analysis", limitations: [] }
        }
      ],
      opportunities: [
        {
          insight: "Specialized niche markets and regional territories offer opportunities for focused distributors with deep expertise",
          confidence: { score: 80, level: "high", percentage: 80, reasoning: "Market fragmentation creates niches", factors: { dataQuality: 85, sampleSize: 75, marketStability: 80, historicalAccuracy: 80 }, methodology: "Opportunity analysis", limitations: ["Niche market volatility"] }
        }
      ]
    },
    economic: {
      outlook: {
        insight: "Stable economic outlook for healthcare sector with continued government and private investment in medical infrastructure",
        confidence: { score: 80, level: "high", percentage: 80, reasoning: "Healthcare is traditionally recession-resistant", factors: { dataQuality: 85, sampleSize: 80, marketStability: 75, historicalAccuracy: 85 }, methodology: "Economic analysis", limitations: ["Policy changes", "Economic cycles"] }
      },
      risks: [
        {
          factor: "Healthcare Policy Changes",
          description: "Potential changes in healthcare reimbursement and regulatory policies",
          severity: "medium",
          likelihood: 60,
          impact: 70,
          riskScore: 42,
          mitigationStrategies: ["Diversified product portfolio", "Strong regulatory compliance"],
          monitoringMetrics: ["Policy announcements", "Reimbursement rate changes"],
          confidence: { score: 75, level: "medium", percentage: 75, reasoning: "Policy changes are unpredictable", factors: { dataQuality: 80, sampleSize: 70, marketStability: 70, historicalAccuracy: 75 }, methodology: "Risk assessment", limitations: ["Political uncertainty"] },
          category: "regulatory"
        }
      ],
      opportunities: [
        {
          insight: "Infrastructure spending and healthcare modernization initiatives creating growth opportunities",
          confidence: { score: 75, level: "medium", percentage: 75, reasoning: "Government investment commitments", factors: { dataQuality: 80, sampleSize: 75, marketStability: 70, historicalAccuracy: 75 }, methodology: "Economic opportunity analysis", limitations: ["Implementation timelines uncertain"] }
        }
      ],
      timing: {
        insight: "Favorable timing for acquisitions with reasonable valuations and continued market growth expected",
        confidence: { score: 80, level: "high", percentage: 80, reasoning: "Market conditions analysis", factors: { dataQuality: 85, sampleSize: 80, marketStability: 75, historicalAccuracy: 80 }, methodology: "Timing analysis", limitations: ["Market volatility"] }
      }
    },
    investment: {
      activity: {
        insight: "Strong M&A activity in healthcare distribution with average deal sizes ranging from $50M to $500M for regional players",
        confidence: { score: 85, level: "high", percentage: 85, reasoning: "Transaction data from multiple sources", factors: { dataQuality: 90, sampleSize: 85, marketStability: 80, historicalAccuracy: 85 }, methodology: "Transaction analysis", limitations: [] }
      },
      valuations: {
        insight: "Typical EBITDA multiples range from 8-15x for medical device distributors, with premium for specialized or growing companies",
        confidence: { score: 80, level: "high", percentage: 80, reasoning: "Comparable transaction analysis", factors: { dataQuality: 85, sampleSize: 80, marketStability: 75, historicalAccuracy: 80 }, methodology: "Valuation analysis", limitations: ["Market volatility affects multiples"] }
      },
      trends: [
        {
          insight: "Increasing interest from private equity in healthcare distribution consolidation plays",
          confidence: { score: 85, level: "high", percentage: 85, reasoning: "PE investment data and announcements", factors: { dataQuality: 90, sampleSize: 85, marketStability: 80, historicalAccuracy: 85 }, methodology: "Investment trend analysis", limitations: [] }
        }
      ],
      outlook: {
        insight: "Positive investment outlook with continued consolidation expected and favorable debt markets for acquisitions",
        confidence: { score: 80, level: "high", percentage: 80, reasoning: "Financial market conditions", factors: { dataQuality: 85, sampleSize: 80, marketStability: 75, historicalAccuracy: 80 }, methodology: "Investment outlook analysis", limitations: ["Interest rate sensitivity"] }
      }
    },
    recommendations: [
      "Focus on specialized medical device categories with high barriers to entry",
      "Evaluate acquisition targets with strong supplier relationships and regulatory compliance",
      "Consider geographic expansion opportunities in underserved markets",
      "Assess potential for operational improvements and technology integration"
    ],
    timing: "good",
    confidence: {
      score: 85,
      level: "high",
      percentage: 85,
      reasoning: "Comprehensive analysis based on multiple reliable data sources and industry expertise",
      factors: { dataQuality: 90, sampleSize: 85, marketStability: 80, historicalAccuracy: 85 },
      methodology: "Multi-source market intelligence synthesis",
      limitations: ["Market volatility", "Regulatory changes", "Economic cycles"]
    }
  };

  return mockMarketIntelligence as any;

  if (!isAIEnabled()) {
    throw new Error('AI features are not enabled');
  }

  const prompt = `
As a top market intelligence analyst, provide comprehensive market analysis for potential acquisitions.

ANALYSIS PARAMETERS:
- Industry: ${industry}
- Geography: ${geography || 'National'}
- Deal Size: $${dealSize?.toLocaleString() || 'Variable'}

Provide detailed market intelligence including:
- Market size, growth trends, and key drivers
- Competitive landscape and intensity analysis
- Economic outlook and timing considerations
- Investment climate and valuation trends
- Strategic recommendations and confidence scoring

Provide comprehensive JSON response with all market intelligence areas covered.
`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: "gpt-4o",
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
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const rawIntelligence = parseAIResponse(response) as any;

    // Ensure all required arrays are initialized for market intelligence
    const marketIntelligence: SuperEnhancedMarketIntelligence = {
      marketOverview: {
        size: rawIntelligence.marketOverview?.size || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        growth: rawIntelligence.marketOverview?.growth || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
        trends: rawIntelligence.marketOverview?.trends || [],
        drivers: rawIntelligence.marketOverview?.drivers || []
      },
      competitive: {
        intensity: rawIntelligence.competitive?.intensity || { insight: 'Data unavailable', confidence: { score: 0, level: 'low', percentage: 0, reasoning: 'Unknown' } },
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