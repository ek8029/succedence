// Main Valuation Engine
// Orchestrates all valuation calculations and generates final output

import {
  ValuationInput,
  ValuationOutput,
  MultiplesUsed,
  MispricingAnalysis,
  IndustryMultipleData,
} from './types';
import { getIndustryMultiples } from './industry-multiples';
import { calculateRiskAdjustments, extractStrengths, extractRedFlags } from './risk-adjustments';
import { calculateDealQualityScore } from './deal-quality';
import { normalizeFinancials, determinePrimaryMethod } from './financial-normalization';

/**
 * Main valuation calculation function
 * Takes input data and returns complete valuation analysis
 */
export function calculateValuation(input: ValuationInput): ValuationOutput {
  // 1. Get industry multiples
  const industryData = getIndustryMultiples(input.industry);

  // 2. Normalize financials (SDE/EBITDA)
  const normalization = normalizeFinancials(input);
  const { normalizedSde, normalizedEbitda } = normalization;

  // 3. Calculate risk adjustments
  const riskResult = calculateRiskAdjustments(input);
  const { adjustments: riskAdjustments, netMultipleChange } = riskResult;

  // 4. Determine primary valuation method
  const hasSde = !!(input.sde || input.ebitda || input.cashFlow);
  const hasEbitda = !!input.ebitda;
  const primaryMethod = determinePrimaryMethod(input.revenue || 0, hasSde, hasEbitda);

  // 5. Apply risk-adjusted multiples
  const adjustedMultiples = calculateAdjustedMultiples(industryData, netMultipleChange);

  // 6. Calculate valuation range
  const valuationRange = calculateValuationRange(
    normalizedSde,
    normalizedEbitda,
    input.revenue || 0,
    input.inventory || 0,
    input.ffe || 0,
    adjustedMultiples,
    primaryMethod
  );

  // 7. Calculate deal quality score
  const dealQuality = calculateDealQualityScore(input, valuationRange);

  // 8. Analyze mispricing
  const mispricing = input.askingPrice
    ? analyzeMispricing(input.askingPrice, valuationRange)
    : undefined;

  // 9. Generate analysis text
  const methodology = generateMethodology(
    input,
    industryData,
    adjustedMultiples,
    primaryMethod,
    normalization.explanation
  );

  // 10. Extract strengths and red flags
  const keyStrengths = extractStrengths(riskAdjustments);
  const redFlags = extractRedFlags(riskAdjustments);

  // 11. Generate negotiation recommendations
  const negotiationRecommendations = generateNegotiationTips(
    input,
    valuationRange,
    mispricing,
    riskAdjustments
  );

  return {
    valuationRange,
    multiplesUsed: adjustedMultiples,
    normalizedFinancials: {
      sde: normalizedSde,
      ebitda: normalizedEbitda,
    },
    normalizationDetails: normalization,
    riskAdjustments,
    totalRiskAdjustment: netMultipleChange,
    dealQualityScore: dealQuality.score,
    dealQualityBreakdown: dealQuality.breakdown,
    mispricing,
    methodology,
    keyStrengths,
    redFlags,
    negotiationRecommendations,
    industryData,
  };
}

/**
 * Apply risk adjustments to base industry multiples
 */
function calculateAdjustedMultiples(
  industryData: IndustryMultipleData,
  riskAdjustment: number
): MultiplesUsed {
  // Apply adjustment to all multiples
  const applyAdjustment = (baseMultiple: number): number => {
    const adjusted = baseMultiple + riskAdjustment;
    return Math.max(0.5, adjusted); // Floor at 0.5x
  };

  return {
    sde: {
      low: applyAdjustment(industryData.sde.low),
      mid: applyAdjustment(industryData.sde.mid),
      high: applyAdjustment(industryData.sde.high),
    },
    ebitda: {
      low: applyAdjustment(industryData.ebitda.low),
      mid: applyAdjustment(industryData.ebitda.mid),
      high: applyAdjustment(industryData.ebitda.high),
    },
    revenue: {
      low: Math.max(0.1, industryData.revenue.low + riskAdjustment * 0.2),
      mid: Math.max(0.2, industryData.revenue.mid + riskAdjustment * 0.2),
      high: Math.max(0.3, industryData.revenue.high + riskAdjustment * 0.2),
    },
    primaryMethod: 'sde', // Will be set by caller
  };
}

/**
 * Calculate the final valuation range
 */
function calculateValuationRange(
  sde: number,
  ebitda: number,
  revenue: number,
  inventory: number,
  ffe: number,
  multiples: MultiplesUsed,
  primaryMethod: 'sde' | 'ebitda' | 'revenue'
): { low: number; mid: number; high: number } {
  let baseValuationLow: number;
  let baseValuationMid: number;
  let baseValuationHigh: number;

  // Calculate based on primary method
  switch (primaryMethod) {
    case 'sde':
      baseValuationLow = sde * multiples.sde.low;
      baseValuationMid = sde * multiples.sde.mid;
      baseValuationHigh = sde * multiples.sde.high;
      break;
    case 'ebitda':
      baseValuationLow = ebitda * multiples.ebitda.low;
      baseValuationMid = ebitda * multiples.ebitda.mid;
      baseValuationHigh = ebitda * multiples.ebitda.high;
      break;
    case 'revenue':
      baseValuationLow = revenue * multiples.revenue.low;
      baseValuationMid = revenue * multiples.revenue.mid;
      baseValuationHigh = revenue * multiples.revenue.high;
      break;
    default:
      baseValuationLow = 0;
      baseValuationMid = 0;
      baseValuationHigh = 0;
  }

  // Add tangible assets (inventory + FF&E)
  // These are typically included in the asking price but not in multiple-based valuations
  const tangibleAssets = inventory + ffe;

  return {
    low: Math.round(baseValuationLow + tangibleAssets),
    mid: Math.round(baseValuationMid + tangibleAssets),
    high: Math.round(baseValuationHigh + tangibleAssets),
  };
}

/**
 * Analyze asking price vs valuation (mispricing)
 */
function analyzeMispricing(
  askingPrice: number,
  valuation: { low: number; mid: number; high: number }
): MispricingAnalysis {
  const midValuation = valuation.mid;
  const difference = askingPrice - midValuation;
  const percentDiff = (difference / midValuation) * 100;

  let label: string;
  let recommendation: MispricingAnalysis['recommendation'];
  let analysis: string;

  if (percentDiff <= -20) {
    label = `${Math.abs(Math.round(percentDiff))}% underpriced`;
    recommendation = 'strong_buy';
    analysis = `The asking price is significantly below our mid-range valuation. This represents an exceptional opportunity if the business fundamentals check out. Move quickly as this pricing won't last.`;
  } else if (percentDiff <= -10) {
    label = `${Math.abs(Math.round(percentDiff))}% underpriced`;
    recommendation = 'buy';
    analysis = `The asking price is below our mid-range valuation, indicating a favorable deal for the buyer. This provides room for negotiation or a buffer for unforeseen issues.`;
  } else if (percentDiff <= -5) {
    label = `${Math.abs(Math.round(percentDiff))}% underpriced`;
    recommendation = 'buy';
    analysis = `The asking price is slightly below fair market value. A solid opportunity at the listed price.`;
  } else if (percentDiff <= 5) {
    label = 'Fairly priced';
    recommendation = 'fair';
    analysis = `The asking price aligns closely with our valuation. This is a fair market price. Success depends on your negotiation and the specific fit with your goals.`;
  } else if (percentDiff <= 10) {
    label = `${Math.round(percentDiff)}% overpriced`;
    recommendation = 'fair';
    analysis = `The asking price is slightly above our mid-range valuation. There's room to negotiate. Target a price closer to ${formatCurrency(midValuation)}.`;
  } else if (percentDiff <= 20) {
    label = `${Math.round(percentDiff)}% overpriced`;
    recommendation = 'overpriced';
    analysis = `The asking price exceeds our valuation. Negotiate firmly or wait for price reduction. Fair offer would be around ${formatCurrency(midValuation)}.`;
  } else {
    label = `${Math.round(percentDiff)}% overpriced`;
    recommendation = 'avoid';
    analysis = `The asking price significantly exceeds our valuation. Unless there are exceptional circumstances not captured in the data, this deal should be avoided or negotiated down substantially.`;
  }

  return {
    percent: percentDiff,
    label,
    recommendation,
    analysis,
  };
}

/**
 * Generate methodology explanation
 */
function generateMethodology(
  input: ValuationInput,
  industryData: IndustryMultipleData,
  multiples: MultiplesUsed,
  primaryMethod: 'sde' | 'ebitda' | 'revenue',
  normalizationExplanation: string
): string {
  let methodology = '';

  // Industry context
  methodology += `**Industry Analysis**: This business is classified as "${industryData.industryName}" `;
  if (industryData.naicsCode && industryData.naicsCode !== 'default') {
    methodology += `(NAICS ${industryData.naicsCode}). `;
  } else {
    methodology += `. `;
  }

  // Base multiples
  methodology += `Typical ${industryData.industryName} businesses trade at ${industryData.sde.low.toFixed(1)}x-${industryData.sde.high.toFixed(1)}x SDE. `;

  // Risk adjustments
  methodology += `\n\n**Risk Adjustments**: Based on the business-specific risk factors analyzed, we applied a net adjustment to the base multiples. `;
  methodology += `Adjusted SDE multiples: ${multiples.sde.low.toFixed(2)}x-${multiples.sde.high.toFixed(2)}x. `;

  // Normalization
  methodology += `\n\n**Financial Normalization**: ${normalizationExplanation} `;

  // Valuation method
  methodology += `\n\n**Valuation Method**: `;
  switch (primaryMethod) {
    case 'sde':
      methodology += `Primary valuation based on Seller's Discretionary Earnings (SDE), the standard metric for main-street businesses. SDE represents the total financial benefit to a working owner.`;
      break;
    case 'ebitda':
      methodology += `Primary valuation based on EBITDA, appropriate for larger businesses with professional management. EBITDA measures operational profitability before financing and accounting decisions.`;
      break;
    case 'revenue':
      methodology += `Valuation based on revenue multiple due to limited earnings data. Revenue multiples are less precise - provide SDE or EBITDA for more accurate valuation.`;
      break;
  }

  // Assets
  if (input.inventory || input.ffe) {
    methodology += `\n\n**Tangible Assets**: `;
    if (input.inventory) methodology += `Inventory of ${formatCurrency(input.inventory)} `;
    if (input.inventory && input.ffe) methodology += `and `;
    if (input.ffe) methodology += `FF&E of ${formatCurrency(input.ffe)} `;
    methodology += `added to base multiple valuation.`;
  }

  return methodology;
}

/**
 * Generate negotiation recommendations
 */
function generateNegotiationTips(
  input: ValuationInput,
  valuation: { low: number; mid: number; high: number },
  mispricing: MispricingAnalysis | undefined,
  _riskAdjustments: { factor: string; description: string; impact: number; severity: string }[]
): string[] {
  const tips: string[] = [];

  // Price-based recommendations
  if (mispricing) {
    if (mispricing.recommendation === 'strong_buy' || mispricing.recommendation === 'buy') {
      tips.push(`Listing is priced favorably. Consider opening at 90-95% of asking price to secure the deal while leaving room for minor adjustments.`);
    } else if (mispricing.recommendation === 'overpriced') {
      tips.push(`Open negotiations at ${formatCurrency(valuation.low)} to ${formatCurrency(valuation.mid)}. Justify with comparable market data.`);
      tips.push(`Ask for detailed financials and add-back documentation before making a formal offer.`);
    } else if (mispricing.recommendation === 'avoid') {
      tips.push(`Consider waiting for a price reduction or walking away. If pursuing, start negotiations at ${formatCurrency(valuation.low)}.`);
    }
  }

  // Risk-based recommendations
  if (input.customerConcentration && input.customerConcentration > 0.3) {
    tips.push(`Negotiate an earnout clause tied to customer retention of top accounts for 12-24 months post-close.`);
  }

  if (input.ownerHoursPerWeek && input.ownerHoursPerWeek > 50) {
    tips.push(`Request extended seller transition period (6-12 months) with training to ensure successful handoff.`);
  }

  if (input.leaseYearsRemaining && input.leaseYearsRemaining < 3) {
    tips.push(`Make lease extension/renewal a condition of the sale. Negotiate with landlord before closing.`);
  }

  // General best practices
  tips.push(`Request seller financing for 10-20% of purchase price over 2-3 years - this keeps seller invested in your success.`);

  if (input.revenue && input.revenue > 500000) {
    tips.push(`Verify financials with Quality of Earnings (QoE) analysis for deals of this size.`);
  }

  // Due diligence reminder
  tips.push(`Always conduct thorough due diligence: verify tax returns (3 years), bank statements, customer contracts, and employee agreements.`);

  return tips;
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Quick valuation estimate (for previews)
 */
export function quickEstimate(revenue: number, industry: string): {
  low: number;
  mid: number;
  high: number;
} {
  const industryData = getIndustryMultiples(industry);
  const estimatedSde = revenue * 0.15; // Rough 15% SDE margin

  return {
    low: Math.round(estimatedSde * industryData.sde.low),
    mid: Math.round(estimatedSde * industryData.sde.mid),
    high: Math.round(estimatedSde * industryData.sde.high),
  };
}
