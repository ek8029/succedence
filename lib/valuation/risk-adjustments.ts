// Risk adjustment calculations for business valuations
// Adjusts valuation multiples based on various risk factors

import { RiskAdjustment, ValuationInput } from './types';

export interface RiskAdjustmentResult {
  adjustments: RiskAdjustment[];
  totalAdjustment: number;
  netMultipleChange: number;
}

/**
 * Calculate all risk adjustments based on input data
 * Returns adjustments that modify the base industry multiples
 */
export function calculateRiskAdjustments(input: ValuationInput): RiskAdjustmentResult {
  const adjustments: RiskAdjustment[] = [];

  // 1. Customer Concentration Risk
  if (input.customerConcentration !== undefined) {
    if (input.customerConcentration > 0.5) {
      adjustments.push({
        factor: 'customer_concentration',
        description: `High customer concentration - top customer represents ${Math.round(input.customerConcentration * 100)}% of revenue. Major risk if relationship ends.`,
        impact: -0.5,
        severity: 'critical',
      });
    } else if (input.customerConcentration > 0.3) {
      adjustments.push({
        factor: 'customer_concentration',
        description: `Moderate customer concentration (${Math.round(input.customerConcentration * 100)}%). Recommend diversifying customer base.`,
        impact: -0.25,
        severity: 'negative',
      });
    } else if (input.customerConcentration > 0.2) {
      adjustments.push({
        factor: 'customer_concentration',
        description: `Some customer concentration (${Math.round(input.customerConcentration * 100)}%). Monitor largest accounts.`,
        impact: -0.1,
        severity: 'neutral',
      });
    } else {
      adjustments.push({
        factor: 'diversified_customers',
        description: `Well-diversified customer base (largest customer < ${Math.round(input.customerConcentration * 100)}%). Reduces revenue risk.`,
        impact: 0.1,
        severity: 'positive',
      });
    }
  }

  // 2. Revenue Growth Trend
  if (input.revenueGrowthTrend) {
    if (input.revenueGrowthTrend === 'increasing') {
      const rate = input.revenueGrowthRate || 0;
      if (rate > 0.2) {
        adjustments.push({
          factor: 'revenue_growth',
          description: `Strong revenue growth of ${Math.round(rate * 100)}% - indicates healthy demand and market position.`,
          impact: 0.35,
          severity: 'positive',
        });
      } else if (rate > 0.1) {
        adjustments.push({
          factor: 'revenue_growth',
          description: `Solid revenue growth of ${Math.round(rate * 100)}% - business is expanding.`,
          impact: 0.2,
          severity: 'positive',
        });
      } else {
        adjustments.push({
          factor: 'revenue_growth',
          description: `Modest revenue growth - trending in right direction.`,
          impact: 0.1,
          severity: 'positive',
        });
      }
    } else if (input.revenueGrowthTrend === 'declining') {
      const rate = Math.abs(input.revenueGrowthRate || 0);
      if (rate > 0.15) {
        adjustments.push({
          factor: 'revenue_decline',
          description: `Significant revenue decline (${Math.round(rate * 100)}%) - investigate cause immediately.`,
          impact: -0.45,
          severity: 'critical',
        });
      } else if (rate > 0.05) {
        adjustments.push({
          factor: 'revenue_decline',
          description: `Revenue showing decline (${Math.round(rate * 100)}%) - trend needs reversal.`,
          impact: -0.3,
          severity: 'negative',
        });
      } else {
        adjustments.push({
          factor: 'revenue_decline',
          description: `Slight revenue softness - monitor closely.`,
          impact: -0.15,
          severity: 'negative',
        });
      }
    } else {
      adjustments.push({
        factor: 'stable_revenue',
        description: `Stable revenue - predictable but limited growth opportunity.`,
        impact: 0,
        severity: 'neutral',
      });
    }
  }

  // 3. Owner Dependency / Hours
  if (input.ownerHoursPerWeek !== undefined) {
    if (input.ownerHoursPerWeek > 60) {
      adjustments.push({
        factor: 'owner_dependency',
        description: `Very high owner involvement (${input.ownerHoursPerWeek} hrs/week). Business heavily dependent on owner - transition risk.`,
        impact: -0.4,
        severity: 'critical',
      });
    } else if (input.ownerHoursPerWeek > 50) {
      adjustments.push({
        factor: 'owner_dependency',
        description: `High owner involvement (${input.ownerHoursPerWeek} hrs/week). Will require significant management transition.`,
        impact: -0.25,
        severity: 'negative',
      });
    } else if (input.ownerHoursPerWeek > 40) {
      adjustments.push({
        factor: 'owner_involvement',
        description: `Standard owner involvement (${input.ownerHoursPerWeek} hrs/week). Typical for main-street business.`,
        impact: 0,
        severity: 'neutral',
      });
    } else if (input.ownerHoursPerWeek > 20) {
      adjustments.push({
        factor: 'semi_absentee',
        description: `Semi-absentee owner (${input.ownerHoursPerWeek} hrs/week). Good management systems in place.`,
        impact: 0.15,
        severity: 'positive',
      });
    } else {
      adjustments.push({
        factor: 'absentee_ownership',
        description: `Absentee ownership possible (${input.ownerHoursPerWeek} hrs/week). Strong systems and management team.`,
        impact: 0.3,
        severity: 'positive',
      });
    }
  }

  // 4. Recurring Revenue
  if (input.recurringRevenuePct !== undefined) {
    if (input.recurringRevenuePct > 0.8) {
      adjustments.push({
        factor: 'recurring_revenue',
        description: `Excellent recurring revenue (${Math.round(input.recurringRevenuePct * 100)}%). Highly predictable cash flows.`,
        impact: 0.4,
        severity: 'positive',
      });
    } else if (input.recurringRevenuePct > 0.6) {
      adjustments.push({
        factor: 'recurring_revenue',
        description: `Strong recurring revenue (${Math.round(input.recurringRevenuePct * 100)}%). Good revenue visibility.`,
        impact: 0.25,
        severity: 'positive',
      });
    } else if (input.recurringRevenuePct > 0.4) {
      adjustments.push({
        factor: 'recurring_revenue',
        description: `Moderate recurring revenue (${Math.round(input.recurringRevenuePct * 100)}%). Some predictability.`,
        impact: 0.1,
        severity: 'positive',
      });
    } else if (input.recurringRevenuePct < 0.1) {
      adjustments.push({
        factor: 'transactional_revenue',
        description: `Primarily transactional revenue (${Math.round(input.recurringRevenuePct * 100)}% recurring). Less predictable.`,
        impact: -0.1,
        severity: 'negative',
      });
    }
  }

  // 5. Lease Risk
  if (input.leaseYearsRemaining !== undefined) {
    if (input.leaseYearsRemaining < 1) {
      adjustments.push({
        factor: 'lease_risk',
        description: `Critical lease situation - less than 1 year remaining. Must negotiate renewal before sale.`,
        impact: -0.45,
        severity: 'critical',
      });
    } else if (input.leaseYearsRemaining < 2) {
      adjustments.push({
        factor: 'lease_risk',
        description: `Short lease remaining (${input.leaseYearsRemaining} years). Negotiate extension as condition of sale.`,
        impact: -0.3,
        severity: 'negative',
      });
    } else if (input.leaseYearsRemaining < 3) {
      adjustments.push({
        factor: 'lease_concern',
        description: `Lease expires in ${input.leaseYearsRemaining} years. Recommend securing longer term.`,
        impact: -0.15,
        severity: 'negative',
      });
    } else if (input.leaseYearsRemaining >= 5) {
      adjustments.push({
        factor: 'lease_security',
        description: `Long-term lease secured (${input.leaseYearsRemaining} years). Location stability assured.`,
        impact: 0.15,
        severity: 'positive',
      });
    } else if (input.leaseYearsRemaining >= 10) {
      adjustments.push({
        factor: 'lease_security',
        description: `Excellent lease terms (${input.leaseYearsRemaining} years). Very strong location security.`,
        impact: 0.2,
        severity: 'positive',
      });
    }
  }

  // 6. Business Age / Maturity
  if (input.yearEstablished) {
    const age = new Date().getFullYear() - input.yearEstablished;
    if (age >= 20) {
      adjustments.push({
        factor: 'business_maturity',
        description: `Well-established business (${age} years). Proven model with long track record.`,
        impact: 0.2,
        severity: 'positive',
      });
    } else if (age >= 10) {
      adjustments.push({
        factor: 'business_maturity',
        description: `Established business (${age} years). Solid operating history.`,
        impact: 0.1,
        severity: 'positive',
      });
    } else if (age >= 5) {
      adjustments.push({
        factor: 'business_age',
        description: `Maturing business (${age} years). Past initial startup phase.`,
        impact: 0,
        severity: 'neutral',
      });
    } else if (age >= 3) {
      adjustments.push({
        factor: 'business_age_risk',
        description: `Relatively young business (${age} years). Still proving model.`,
        impact: -0.15,
        severity: 'negative',
      });
    } else {
      adjustments.push({
        factor: 'business_age_risk',
        description: `Young business (${age} years). Higher risk due to limited track record.`,
        impact: -0.3,
        severity: 'negative',
      });
    }
  }

  // 7. Employee Count / Systems
  if (input.employees !== undefined) {
    if (input.employees >= 15) {
      adjustments.push({
        factor: 'team_depth',
        description: `Strong team in place (${input.employees} employees). Reduces key-person risk.`,
        impact: 0.15,
        severity: 'positive',
      });
    } else if (input.employees >= 5) {
      adjustments.push({
        factor: 'team_size',
        description: `Established team (${input.employees} employees). Basic organizational structure.`,
        impact: 0.05,
        severity: 'positive',
      });
    } else if (input.employees <= 1) {
      adjustments.push({
        factor: 'solo_operation',
        description: `Solo or minimal staff operation. High dependency on owner/few individuals.`,
        impact: -0.1,
        severity: 'negative',
      });
    }
  }

  // 8. Rent as % of Revenue (if we can calculate)
  if (input.leaseMonthlyRent && input.revenue) {
    const annualRent = input.leaseMonthlyRent * 12;
    const rentRatio = annualRent / input.revenue;
    if (rentRatio > 0.15) {
      adjustments.push({
        factor: 'high_rent',
        description: `High occupancy cost (${Math.round(rentRatio * 100)}% of revenue). Squeezes margins.`,
        impact: -0.2,
        severity: 'negative',
      });
    } else if (rentRatio < 0.05) {
      adjustments.push({
        factor: 'low_rent',
        description: `Low occupancy cost (${Math.round(rentRatio * 100)}% of revenue). Strong margin protection.`,
        impact: 0.1,
        severity: 'positive',
      });
    }
  }

  // Calculate totals
  const totalAdjustment = adjustments.reduce((sum, adj) => sum + adj.impact, 0);
  const netMultipleChange = Math.max(-1.0, Math.min(1.0, totalAdjustment)); // Cap at +/- 1.0x

  return {
    adjustments,
    totalAdjustment,
    netMultipleChange,
  };
}

/**
 * Generate key strengths from positive adjustments
 */
export function extractStrengths(adjustments: RiskAdjustment[]): string[] {
  return adjustments
    .filter(adj => adj.severity === 'positive')
    .map(adj => adj.description);
}

/**
 * Generate red flags from negative/critical adjustments
 */
export function extractRedFlags(adjustments: RiskAdjustment[]): string[] {
  return adjustments
    .filter(adj => adj.severity === 'negative' || adj.severity === 'critical')
    .sort((a, b) => a.impact - b.impact) // Most negative first
    .map(adj => adj.description);
}
