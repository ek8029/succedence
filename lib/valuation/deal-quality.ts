// Deal Quality Score Calculator
// Generates a 0-100 score with weighted breakdown

import { DealQualityBreakdown, ValuationInput } from './types';

export interface DealQualityResult {
  score: number;
  breakdown: DealQualityBreakdown;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  summary: string;
}

// Weights for each component (must sum to 1.0)
const WEIGHTS = {
  pricingFairness: 0.25,
  financialTrajectory: 0.20,
  concentrationRisk: 0.15,
  operationalRisk: 0.15,
  documentationQuality: 0.10,
  valuationAlignment: 0.15,
};

/**
 * Calculate the deal quality score (0-100)
 */
export function calculateDealQualityScore(
  input: ValuationInput,
  valuation: { low: number; mid: number; high: number },
): DealQualityResult {
  const breakdown: DealQualityBreakdown = {
    pricingFairness: 0,
    financialTrajectory: 0,
    concentrationRisk: 0,
    operationalRisk: 0,
    documentationQuality: 0,
    valuationAlignment: 0,
  };

  // 1. PRICING FAIRNESS (25%)
  // Compares asking price vs our mid valuation
  if (input.askingPrice && valuation.mid) {
    const priceRatio = input.askingPrice / valuation.mid;
    if (priceRatio <= 0.8) {
      // 20%+ underpriced - excellent deal
      breakdown.pricingFairness = 100;
    } else if (priceRatio <= 0.9) {
      // 10-20% underpriced - great deal
      breakdown.pricingFairness = 95;
    } else if (priceRatio <= 0.95) {
      // 5-10% underpriced - good deal
      breakdown.pricingFairness = 90;
    } else if (priceRatio <= 1.0) {
      // At or below fair value
      breakdown.pricingFairness = 85;
    } else if (priceRatio <= 1.05) {
      // Slightly above fair value
      breakdown.pricingFairness = 75;
    } else if (priceRatio <= 1.1) {
      // 5-10% overpriced
      breakdown.pricingFairness = 65;
    } else if (priceRatio <= 1.15) {
      // 10-15% overpriced
      breakdown.pricingFairness = 50;
    } else if (priceRatio <= 1.25) {
      // 15-25% overpriced
      breakdown.pricingFairness = 35;
    } else if (priceRatio <= 1.5) {
      // 25-50% overpriced
      breakdown.pricingFairness = 20;
    } else {
      // 50%+ overpriced
      breakdown.pricingFairness = Math.max(0, 100 - (priceRatio - 1) * 100);
    }
  } else {
    // No asking price to compare - neutral score
    breakdown.pricingFairness = 50;
  }

  // 2. FINANCIAL TRAJECTORY (20%)
  // Based on revenue growth trends
  if (input.revenueGrowthTrend === 'increasing') {
    const rate = input.revenueGrowthRate || 0;
    if (rate > 0.25) {
      breakdown.financialTrajectory = 100;
    } else if (rate > 0.15) {
      breakdown.financialTrajectory = 90;
    } else if (rate > 0.1) {
      breakdown.financialTrajectory = 85;
    } else if (rate > 0.05) {
      breakdown.financialTrajectory = 80;
    } else {
      breakdown.financialTrajectory = 75;
    }
  } else if (input.revenueGrowthTrend === 'stable') {
    breakdown.financialTrajectory = 65;
  } else if (input.revenueGrowthTrend === 'declining') {
    const rate = Math.abs(input.revenueGrowthRate || 0);
    if (rate > 0.2) {
      breakdown.financialTrajectory = 15;
    } else if (rate > 0.1) {
      breakdown.financialTrajectory = 30;
    } else if (rate > 0.05) {
      breakdown.financialTrajectory = 45;
    } else {
      breakdown.financialTrajectory = 55;
    }
  } else {
    // Unknown - default to neutral
    breakdown.financialTrajectory = 50;
  }

  // Boost for recurring revenue
  if (input.recurringRevenuePct !== undefined) {
    if (input.recurringRevenuePct > 0.7) {
      breakdown.financialTrajectory = Math.min(100, breakdown.financialTrajectory + 10);
    } else if (input.recurringRevenuePct > 0.5) {
      breakdown.financialTrajectory = Math.min(100, breakdown.financialTrajectory + 5);
    }
  }

  // 3. CONCENTRATION RISK (15%)
  // Lower concentration = higher score (inverted)
  if (input.customerConcentration !== undefined) {
    if (input.customerConcentration > 0.6) {
      // Very high concentration
      breakdown.concentrationRisk = 10;
    } else if (input.customerConcentration > 0.5) {
      breakdown.concentrationRisk = 25;
    } else if (input.customerConcentration > 0.4) {
      breakdown.concentrationRisk = 40;
    } else if (input.customerConcentration > 0.3) {
      breakdown.concentrationRisk = 55;
    } else if (input.customerConcentration > 0.2) {
      breakdown.concentrationRisk = 70;
    } else if (input.customerConcentration > 0.1) {
      breakdown.concentrationRisk = 85;
    } else {
      // Well diversified
      breakdown.concentrationRisk = 95;
    }
  } else {
    // Unknown - assume moderate concentration
    breakdown.concentrationRisk = 60;
  }

  // 4. OPERATIONAL RISK (15%)
  // Based on owner hours, employee count, systems
  let operationalScore = 60; // Start neutral

  // Owner hours factor
  if (input.ownerHoursPerWeek !== undefined) {
    if (input.ownerHoursPerWeek < 20) {
      operationalScore += 25; // Absentee-friendly
    } else if (input.ownerHoursPerWeek < 30) {
      operationalScore += 15;
    } else if (input.ownerHoursPerWeek < 40) {
      operationalScore += 5;
    } else if (input.ownerHoursPerWeek > 50) {
      operationalScore -= 15;
    } else if (input.ownerHoursPerWeek > 60) {
      operationalScore -= 30;
    }
  }

  // Employee count factor
  if (input.employees !== undefined) {
    if (input.employees >= 10) {
      operationalScore += 15;
    } else if (input.employees >= 5) {
      operationalScore += 10;
    } else if (input.employees >= 3) {
      operationalScore += 5;
    } else if (input.employees === 0) {
      operationalScore -= 10;
    }
  }

  // Business age factor
  if (input.yearEstablished) {
    const age = new Date().getFullYear() - input.yearEstablished;
    if (age >= 10) {
      operationalScore += 10;
    } else if (age >= 5) {
      operationalScore += 5;
    } else if (age < 3) {
      operationalScore -= 10;
    }
  }

  breakdown.operationalRisk = Math.min(100, Math.max(0, operationalScore));

  // 5. DOCUMENTATION QUALITY (10%)
  // Based on completeness of data provided
  let docScore = 0;
  const totalFields = 15;
  let providedFields = 0;

  // Core financials
  if (input.revenue) providedFields += 2;
  if (input.sde || input.ebitda) providedFields += 2;
  if (input.cashFlow) providedFields += 1;

  // Business details
  if (input.employees !== undefined) providedFields += 1;
  if (input.yearEstablished) providedFields += 1;
  if (input.ownerHoursPerWeek !== undefined) providedFields += 1;

  // Risk factors
  if (input.customerConcentration !== undefined) providedFields += 2;
  if (input.revenueGrowthTrend) providedFields += 2;
  if (input.recurringRevenuePct !== undefined) providedFields += 1;
  if (input.leaseYearsRemaining !== undefined) providedFields += 1;

  // Assets
  if (input.inventory !== undefined) providedFields += 0.5;
  if (input.ffe !== undefined) providedFields += 0.5;

  docScore = Math.round((providedFields / totalFields) * 100);
  breakdown.documentationQuality = Math.min(100, docScore);

  // 6. VALUATION ALIGNMENT (15%)
  // How well does asking price fit within valuation range
  if (input.askingPrice && valuation.low && valuation.high) {
    if (input.askingPrice < valuation.low) {
      // Below low estimate - potential steal
      breakdown.valuationAlignment = 100;
    } else if (input.askingPrice <= valuation.mid) {
      // Between low and mid - great alignment
      breakdown.valuationAlignment = 95;
    } else if (input.askingPrice <= valuation.high) {
      // Between mid and high - acceptable
      const positionInRange = (input.askingPrice - valuation.mid) / (valuation.high - valuation.mid);
      breakdown.valuationAlignment = Math.round(90 - positionInRange * 20);
    } else {
      // Above high estimate
      const overage = (input.askingPrice - valuation.high) / valuation.high;
      breakdown.valuationAlignment = Math.max(0, Math.round(70 - overage * 200));
    }
  } else {
    breakdown.valuationAlignment = 50;
  }

  // Calculate weighted total score
  const score = Math.round(
    breakdown.pricingFairness * WEIGHTS.pricingFairness +
    breakdown.financialTrajectory * WEIGHTS.financialTrajectory +
    breakdown.concentrationRisk * WEIGHTS.concentrationRisk +
    breakdown.operationalRisk * WEIGHTS.operationalRisk +
    breakdown.documentationQuality * WEIGHTS.documentationQuality +
    breakdown.valuationAlignment * WEIGHTS.valuationAlignment
  );

  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 85) grade = 'A';
  else if (score >= 70) grade = 'B';
  else if (score >= 55) grade = 'C';
  else if (score >= 40) grade = 'D';
  else grade = 'F';

  // Generate summary
  const summary = generateDealSummary(score, breakdown, grade);

  return {
    score,
    breakdown,
    grade,
    summary,
  };
}

function generateDealSummary(
  score: number,
  breakdown: DealQualityBreakdown,
  grade: string
): string {
  const strengths: string[] = [];
  const concerns: string[] = [];

  // Identify top strengths
  if (breakdown.pricingFairness >= 80) {
    strengths.push('favorable pricing');
  }
  if (breakdown.financialTrajectory >= 80) {
    strengths.push('strong financial trajectory');
  }
  if (breakdown.concentrationRisk >= 80) {
    strengths.push('diversified customer base');
  }
  if (breakdown.operationalRisk >= 80) {
    strengths.push('solid operations');
  }

  // Identify concerns
  if (breakdown.pricingFairness < 50) {
    concerns.push('overpriced relative to valuation');
  }
  if (breakdown.financialTrajectory < 50) {
    concerns.push('concerning financial trends');
  }
  if (breakdown.concentrationRisk < 50) {
    concerns.push('customer concentration risk');
  }
  if (breakdown.operationalRisk < 50) {
    concerns.push('high owner dependency');
  }
  if (breakdown.documentationQuality < 50) {
    concerns.push('incomplete financial documentation');
  }

  // Build summary
  let summary = '';
  if (grade === 'A') {
    summary = `Excellent opportunity (Grade ${grade}). `;
    summary += strengths.length > 0
      ? `Key strengths include ${strengths.join(', ')}.`
      : 'Strong across all evaluation criteria.';
  } else if (grade === 'B') {
    summary = `Good opportunity with some considerations (Grade ${grade}). `;
    if (strengths.length > 0) summary += `Strengths: ${strengths.join(', ')}. `;
    if (concerns.length > 0) summary += `Watch: ${concerns.join(', ')}.`;
  } else if (grade === 'C') {
    summary = `Average opportunity requiring due diligence (Grade ${grade}). `;
    if (concerns.length > 0) summary += `Key concerns: ${concerns.join(', ')}.`;
  } else if (grade === 'D') {
    summary = `Below-average opportunity with significant concerns (Grade ${grade}). `;
    summary += `Issues include: ${concerns.join(', ')}.`;
  } else {
    summary = `High-risk opportunity (Grade ${grade}). `;
    summary += `Major concerns: ${concerns.join(', ')}. Proceed with extreme caution.`;
  }

  return summary;
}

/**
 * Get color/style for deal quality score display
 */
export function getDealQualityColor(score: number): {
  bg: string;
  text: string;
  border: string;
  label: string;
} {
  if (score >= 85) {
    return {
      bg: 'bg-green-500/20',
      text: 'text-green-400',
      border: 'border-green-500/50',
      label: 'Excellent',
    };
  } else if (score >= 70) {
    return {
      bg: 'bg-emerald-500/20',
      text: 'text-emerald-400',
      border: 'border-emerald-500/50',
      label: 'Good',
    };
  } else if (score >= 55) {
    return {
      bg: 'bg-yellow-500/20',
      text: 'text-yellow-400',
      border: 'border-yellow-500/50',
      label: 'Average',
    };
  } else if (score >= 40) {
    return {
      bg: 'bg-orange-500/20',
      text: 'text-orange-400',
      border: 'border-orange-500/50',
      label: 'Below Average',
    };
  } else {
    return {
      bg: 'bg-red-500/20',
      text: 'text-red-400',
      border: 'border-red-500/50',
      label: 'Poor',
    };
  }
}
