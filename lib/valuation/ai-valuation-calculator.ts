/**
 * AI Valuation Calculator
 * Deterministic valuation math with dynamic adjustments
 * Commentary generated separately via AI with fallback
 */

import { getIndustryMultiples } from './industry-multiples';

// ============= INPUT TYPES =============

export interface ValuationCalculatorInput {
  industryKey: string;
  financials: {
    sde?: number | null;
    ebitda?: number | null;
    revenue?: number | null;
  };
  method: 'sde' | 'ebitda' | 'revenue';
  multiples?: { low: number; mid: number; high: number };
  dealQuality?: number; // 0-100
  volatility?: 'low' | 'medium' | 'high';
  ownerHours?: number;
  adjustments?: {
    ownerDependency?: 'high' | 'medium' | 'low';
    customerConcentration?: 'high' | 'medium' | 'low';
    recurringRevenue?: boolean;
    documentation?: 'strong' | 'weak';
    brand?: 'strong' | 'weak';
    growthPotential?: 'high' | 'medium' | 'low';
  };
}

export interface ValuationCalculatorOutput {
  method: 'sde' | 'ebitda' | 'revenue';
  methodUsed: string; // Human readable
  multiple: number; // Base multiple from industry
  adjustedMultiple: number; // Multiple after adjustments
  multipleRange: { low: number; mid: number; high: number };
  baseValue: number; // The financial metric used
  valuation: number;
  valuationRange: { low: number; mid: number; high: number };
  fallbackApplied: boolean;
  fallbackReason?: string;
  industryName: string;
  appliedAdjustments: string[]; // e.g., ['+0.3 recurring revenue', '-0.2 weak documentation']
  confidenceScore: number; // 0-100
  // Context for AI commentary
  context: {
    dealQuality?: number;
    volatility?: string;
    ownerHours?: number;
    adjustments?: ValuationCalculatorInput['adjustments'];
  };
}

// ============= ADJUSTMENT TYPES =============

export interface AdjustmentResult {
  adjustedMultiple: number;
  totalAdjustment: number;
  appliedAdjustments: string[];
}

export interface AdjustmentContext {
  dealQuality?: number;
  ownerHours?: number;
  volatility?: 'low' | 'medium' | 'high';
  adjustments?: ValuationCalculatorInput['adjustments'];
}

// ============= DYNAMIC MULTIPLE ADJUSTMENTS =============

/**
 * Adjust the base multiple based on deal context
 * Rules:
 * - dealQuality > 80 → +0.3
 * - dealQuality < 50 → −0.3
 * - recurringRevenue → +0.3
 * - weak documentation → −0.2
 * - ownerHours > 55 → −0.2
 * - high volatility → −0.3
 * - low volatility → +0.1
 *
 * Total adjustment capped between −0.5 and +0.5
 */
export function adjustMultiple(baseMultiple: number, context: AdjustmentContext): AdjustmentResult {
  let totalAdjustment = 0;
  const appliedAdjustments: string[] = [];

  // Deal Quality adjustments
  if (context.dealQuality !== undefined) {
    if (context.dealQuality > 80) {
      totalAdjustment += 0.3;
      appliedAdjustments.push('+0.3 high deal quality');
    } else if (context.dealQuality < 50) {
      totalAdjustment -= 0.3;
      appliedAdjustments.push('-0.3 low deal quality');
    }
  }

  // Recurring Revenue adjustment
  if (context.adjustments?.recurringRevenue) {
    totalAdjustment += 0.3;
    appliedAdjustments.push('+0.3 recurring revenue');
  }

  // Documentation adjustment
  if (context.adjustments?.documentation === 'weak') {
    totalAdjustment -= 0.2;
    appliedAdjustments.push('-0.2 weak documentation');
  }

  // Owner Hours adjustment
  if (context.ownerHours !== undefined && context.ownerHours > 55) {
    totalAdjustment -= 0.2;
    appliedAdjustments.push('-0.2 high owner involvement');
  }

  // Volatility adjustments
  if (context.volatility === 'high') {
    totalAdjustment -= 0.3;
    appliedAdjustments.push('-0.3 high volatility');
  } else if (context.volatility === 'low') {
    totalAdjustment += 0.1;
    appliedAdjustments.push('+0.1 low volatility');
  }

  // Cap adjustment between -0.5 and +0.5
  const cappedAdjustment = Math.max(-0.5, Math.min(0.5, totalAdjustment));

  // If we capped the adjustment, note it
  if (cappedAdjustment !== totalAdjustment) {
    const direction = totalAdjustment > 0 ? 'positive' : 'negative';
    appliedAdjustments.push(`(capped ${direction} adjustment to ${cappedAdjustment > 0 ? '+' : ''}${cappedAdjustment.toFixed(1)})`);
  }

  return {
    adjustedMultiple: Math.round((baseMultiple + cappedAdjustment) * 100) / 100,
    totalAdjustment: cappedAdjustment,
    appliedAdjustments,
  };
}

// ============= CONFIDENCE SCORE =============

/**
 * Calculate confidence score (0-100) based on data quality and risk factors
 *
 * Default: 75
 * - Subtract 10 if volatility is "high"
 * - Subtract 10 if dealQuality < 50
 * - Subtract 5 if ownerHours > 55
 * - Add 10 if recurring revenue
 *
 * Capped between 40 and 90
 */
export function calculateConfidenceScore(context: AdjustmentContext): number {
  let score = 75;

  // Volatility impact
  if (context.volatility === 'high') {
    score -= 10;
  }

  // Deal quality impact
  if (context.dealQuality !== undefined && context.dealQuality < 50) {
    score -= 10;
  }

  // Owner hours impact
  if (context.ownerHours !== undefined && context.ownerHours > 55) {
    score -= 5;
  }

  // Recurring revenue boost
  if (context.adjustments?.recurringRevenue) {
    score += 10;
  }

  // Cap between 40 and 90
  return Math.max(40, Math.min(90, score));
}

// ============= CALCULATOR =============

/**
 * Calculate valuation using deterministic logic with dynamic adjustments
 */
export function calculateValuationSimple(input: ValuationCalculatorInput): ValuationCalculatorOutput {
  const { industryKey, financials, method } = input;

  // Get industry data
  const industryData = getIndustryMultiples(industryKey);
  const industryName = industryData.industryName;

  // Determine which method to use with fallback
  const { chosenMethod, baseValue, fallbackApplied, fallbackReason } = resolveMethodWithFallback(
    method,
    financials
  );

  // Get multiples - use provided or lookup from industry
  const multiples = input.multiples || getMultiplesForMethod(industryData, chosenMethod);

  // Build adjustment context
  const adjustmentContext: AdjustmentContext = {
    dealQuality: input.dealQuality,
    ownerHours: input.ownerHours,
    volatility: input.volatility,
    adjustments: input.adjustments,
  };

  // Apply dynamic multiple adjustments
  const baseMultiple = multiples.mid;
  const { adjustedMultiple, appliedAdjustments } = adjustMultiple(baseMultiple, adjustmentContext);

  // Calculate valuation using adjusted multiple
  const rawValuation = baseValue * adjustedMultiple;

  // Round to nearest $10,000
  const valuation = Math.round(rawValuation / 10000) * 10000;

  // Calculate range (using base multiples for low/high, adjusted for mid)
  const valuationRange = {
    low: Math.round((baseValue * multiples.low) / 10000) * 10000,
    mid: valuation,
    high: Math.round((baseValue * multiples.high) / 10000) * 10000,
  };

  // Calculate confidence score
  const confidenceScore = calculateConfidenceScore(adjustmentContext);

  return {
    method: chosenMethod,
    methodUsed: getMethodDisplayName(chosenMethod),
    multiple: baseMultiple,
    adjustedMultiple,
    multipleRange: multiples,
    baseValue,
    valuation,
    valuationRange,
    fallbackApplied,
    fallbackReason,
    industryName,
    appliedAdjustments,
    confidenceScore,
    context: {
      dealQuality: input.dealQuality,
      volatility: input.volatility,
      ownerHours: input.ownerHours,
      adjustments: input.adjustments,
    },
  };
}

// ============= HELPERS =============

function resolveMethodWithFallback(
  preferredMethod: 'sde' | 'ebitda' | 'revenue',
  financials: ValuationCalculatorInput['financials']
): {
  chosenMethod: 'sde' | 'ebitda' | 'revenue';
  baseValue: number;
  fallbackApplied: boolean;
  fallbackReason?: string;
} {
  const fallbackOrder: Array<'sde' | 'ebitda' | 'revenue'> = ['sde', 'ebitda', 'revenue'];

  // Try preferred method first
  const preferredValue = financials[preferredMethod];
  if (preferredValue && preferredValue > 0) {
    return {
      chosenMethod: preferredMethod,
      baseValue: preferredValue,
      fallbackApplied: false,
    };
  }

  // Apply fallback logic
  for (const method of fallbackOrder) {
    const value = financials[method];
    if (value && value > 0) {
      return {
        chosenMethod: method,
        baseValue: value,
        fallbackApplied: true,
        fallbackReason: `Preferred method (${preferredMethod.toUpperCase()}) not available. Using ${method.toUpperCase()} instead.`,
      };
    }
  }

  // No valid financials - this shouldn't happen in practice
  throw new Error('No valid financial data provided. At least one of SDE, EBITDA, or Revenue is required.');
}

function getMultiplesForMethod(
  industryData: ReturnType<typeof getIndustryMultiples>,
  method: 'sde' | 'ebitda' | 'revenue'
): { low: number; mid: number; high: number } {
  return industryData[method];
}

function getMethodDisplayName(method: 'sde' | 'ebitda' | 'revenue'): string {
  const names: Record<string, string> = {
    sde: "Seller's Discretionary Earnings (SDE)",
    ebitda: 'EBITDA',
    revenue: 'Revenue',
  };
  return names[method] || method.toUpperCase();
}

// ============= COMMENTARY =============

/**
 * Build the prompt context for AI commentary generation
 */
export function buildCommentaryPrompt(result: ValuationCalculatorOutput): string {
  const { adjustments } = result.context;

  let contextNotes: string[] = [];

  // Include applied adjustments
  if (result.appliedAdjustments.length > 0) {
    contextNotes.push(`Multiple adjustments applied: ${result.appliedAdjustments.join(', ')}`);
  }

  if (result.context.dealQuality !== undefined) {
    const quality = result.context.dealQuality >= 70 ? 'strong' :
                    result.context.dealQuality >= 50 ? 'moderate' : 'below average';
    contextNotes.push(`Deal quality score is ${result.context.dealQuality}/100 (${quality})`);
  }

  if (result.context.volatility) {
    contextNotes.push(`Industry volatility is ${result.context.volatility}`);
  }

  if (result.context.ownerHours) {
    const involvement = result.context.ownerHours > 50 ? 'high' :
                        result.context.ownerHours > 30 ? 'moderate' : 'low';
    contextNotes.push(`Owner works ${result.context.ownerHours} hrs/week (${involvement} involvement)`);
  }

  if (adjustments) {
    if (adjustments.recurringRevenue) contextNotes.push('Has recurring revenue');
    if (adjustments.documentation === 'strong') contextNotes.push('Strong documentation');
    if (adjustments.documentation === 'weak') contextNotes.push('Weak documentation');
    if (adjustments.customerConcentration === 'high') contextNotes.push('High customer concentration risk');
    if (adjustments.ownerDependency === 'high') contextNotes.push('High owner dependency');
    if (adjustments.brand === 'strong') contextNotes.push('Strong brand presence');
    if (adjustments.growthPotential === 'high') contextNotes.push('High growth potential');
  }

  const adjustmentNote = result.adjustedMultiple !== result.multiple
    ? `\n- Adjusted Multiple: ${result.adjustedMultiple}x (base ${result.multiple}x with ${result.appliedAdjustments.length} adjustment(s))`
    : '';

  return `
You are a valuation analyst providing a brief commentary on a business valuation.

VALUATION RESULT:
- Industry: ${result.industryName}
- Method Used: ${result.methodUsed}
- Base Value: $${result.baseValue.toLocaleString()}
- Base Multiple: ${result.multiple}x${adjustmentNote}
- Valuation: $${result.valuation.toLocaleString()}
- Valuation Range: $${result.valuationRange.low.toLocaleString()} - $${result.valuationRange.high.toLocaleString()}
- Confidence Score: ${result.confidenceScore}/100
${result.fallbackApplied ? `- Note: ${result.fallbackReason}` : ''}

CONTEXT:
${contextNotes.length > 0 ? contextNotes.map(n => `- ${n}`).join('\n') : '- Standard market conditions assumed'}

Write 2-3 sentences of professional commentary explaining:
1. The valuation methodology and multiple used (mention if adjustments were applied)
2. What the valuation range represents
3. Any relevant context that influenced the estimate

Keep it concise and factual. Do not make up specifics not provided.
`.trim();
}

/**
 * Generate fallback commentary when AI is unavailable
 * Uses top 1-2 adjustment reasons for natural language
 */
export function generateFallbackCommentary(result: ValuationCalculatorOutput): string {
  const parts: string[] = [];

  // Method and multiple explanation
  const multipleDesc = result.adjustedMultiple !== result.multiple
    ? `an adjusted ${result.adjustedMultiple}x`
    : `a ${result.multiple}x`;

  parts.push(
    `Using ${multipleDesc} ${result.method.toUpperCase()} multiple, this ${result.industryName.toLowerCase()} business is valued at approximately $${result.valuation.toLocaleString()}.`
  );

  // Range context
  parts.push(
    `The valuation range of $${result.valuationRange.low.toLocaleString()} to $${result.valuationRange.high.toLocaleString()} reflects current market norms.`
  );

  // Include top adjustments in natural language
  if (result.appliedAdjustments.length > 0) {
    const topAdjustments = result.appliedAdjustments
      .filter(a => !a.startsWith('(capped')) // Exclude capping notes
      .slice(0, 2)
      .map(a => {
        // Convert "+0.3 recurring revenue" to "recurring revenue"
        return a.replace(/^[+-]?\d+\.?\d*\s+/, '');
      });

    if (topAdjustments.length > 0) {
      const factorList = topAdjustments.length === 1
        ? topAdjustments[0]
        : `${topAdjustments[0]} and ${topAdjustments[1]}`;
      parts.push(`Factors like ${factorList} were considered in the adjusted estimate.`);
    }
  }

  // Fallback note if applicable
  if (result.fallbackApplied && result.fallbackReason) {
    parts.push(result.fallbackReason);
  }

  return parts.join(' ');
}

// Types are exported inline with their definitions above
