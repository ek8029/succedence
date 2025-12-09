// Valuation Engine Types

export interface ValuationInput {
  // Financial data
  revenue?: number;
  sde?: number; // Seller's Discretionary Earnings
  ebitda?: number;
  cashFlow?: number;
  askingPrice?: number;
  inventory?: number;
  ffe?: number; // Furniture, Fixtures, Equipment

  // Business details
  businessName?: string;
  industry: string;
  naicsCode?: string;
  city?: string;
  state?: string;
  yearEstablished?: number;
  employees?: number;

  // Risk factors
  customerConcentration?: number; // Top customer % of revenue (0-1)
  revenueGrowthTrend?: 'increasing' | 'stable' | 'declining';
  revenueGrowthRate?: number; // Percentage as decimal
  ownerHoursPerWeek?: number;
  ownerSalary?: number;
  recurringRevenuePct?: number; // 0-1
  leaseYearsRemaining?: number;
  leaseMonthlyRent?: number;

  // Normalization inputs
  addbacks?: { description: string; amount: number }[];
  discretionaryExpenses?: number;
}

export interface IndustryMultipleData {
  industryKey: string;
  industryName: string;
  naicsCode?: string;
  sde: { low: number; mid: number; high: number };
  ebitda: { low: number; mid: number; high: number };
  revenue: { low: number; mid: number; high: number };
  typicalOwnerHours?: number;
  volatility?: 'low' | 'medium' | 'high';
}

export interface RiskAdjustment {
  factor: string;
  description: string;
  impact: number; // -0.5 to +0.5 multiple adjustment
  severity: 'positive' | 'neutral' | 'negative' | 'critical';
}

export interface NormalizationResult {
  normalizedSde: number;
  normalizedEbitda: number;
  adjustments: {
    ownerSalaryAddback: number;
    discretionaryAddback: number;
    addbacksTotal: number;
    total: number;
  };
  explanation: string;
}

export interface DealQualityBreakdown {
  pricingFairness: number; // 0-100
  financialTrajectory: number; // 0-100
  concentrationRisk: number; // 0-100
  operationalRisk: number; // 0-100
  documentationQuality: number; // 0-100
  valuationAlignment: number; // 0-100
}

export interface MultiplesUsed {
  sde: { low: number; mid: number; high: number };
  ebitda: { low: number; mid: number; high: number };
  revenue: { low: number; mid: number; high: number };
  primaryMethod: 'sde' | 'ebitda' | 'revenue';
}

export interface MispricingAnalysis {
  percent: number; // Negative = underpriced, positive = overpriced
  label: string; // e.g., "15% underpriced", "20% overpriced"
  analysis: string;
  recommendation: 'strong_buy' | 'buy' | 'fair' | 'overpriced' | 'avoid';
}

export interface ValuationOutput {
  // Core valuation
  valuationRange: {
    low: number;
    mid: number;
    high: number;
  };

  // Multiples used
  multiplesUsed: MultiplesUsed;

  // Normalized financials
  normalizedFinancials: {
    sde: number;
    ebitda: number;
  };
  normalizationDetails: NormalizationResult;

  // Risk analysis
  riskAdjustments: RiskAdjustment[];
  totalRiskAdjustment: number;

  // Deal quality
  dealQualityScore: number;
  dealQualityBreakdown: DealQualityBreakdown;

  // Mispricing
  mispricing?: MispricingAnalysis;

  // Analysis
  methodology: string;
  keyStrengths: string[];
  redFlags: string[];
  negotiationRecommendations: string[];

  // Industry context
  industryData: IndustryMultipleData;
}

export type SourceType = 'url_parse' | 'manual_entry' | 'existing_listing';

export interface ParsedListingData extends ValuationInput {
  title?: string;
  description?: string;
  confidence: number; // 0-100
  parsedFields: string[];
  missingFields: string[];
}
