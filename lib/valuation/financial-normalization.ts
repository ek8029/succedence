// Financial Normalization for SDE/EBITDA calculations
// Handles add-backs, owner salary adjustments, and conversion between metrics

import { NormalizationResult, ValuationInput } from './types';

// Default owner salary estimates by industry revenue size
const DEFAULT_OWNER_SALARIES: Record<string, number> = {
  under_250k: 50000,
  under_500k: 75000,
  under_1m: 100000,
  under_2m: 125000,
  under_5m: 150000,
  over_5m: 200000,
};

/**
 * Estimate owner salary based on revenue if not provided
 */
function estimateOwnerSalary(revenue: number): number {
  if (revenue < 250000) return DEFAULT_OWNER_SALARIES.under_250k;
  if (revenue < 500000) return DEFAULT_OWNER_SALARIES.under_500k;
  if (revenue < 1000000) return DEFAULT_OWNER_SALARIES.under_1m;
  if (revenue < 2000000) return DEFAULT_OWNER_SALARIES.under_2m;
  if (revenue < 5000000) return DEFAULT_OWNER_SALARIES.under_5m;
  return DEFAULT_OWNER_SALARIES.over_5m;
}

/**
 * Calculate normalized SDE and EBITDA from raw financials
 *
 * SDE = EBITDA + Owner Salary + Owner Benefits + Discretionary Expenses
 * EBITDA = Revenue - COGS - Operating Expenses (before interest, taxes, depreciation, amortization)
 *
 * For main-street businesses, SDE is typically the primary metric.
 * For larger businesses (>$2M revenue), EBITDA becomes more relevant.
 */
export function normalizeFinancials(input: ValuationInput): NormalizationResult {
  const adjustments = {
    ownerSalaryAddback: 0,
    discretionaryAddback: 0,
    addbacksTotal: 0,
    total: 0,
  };

  let explanation = '';
  let normalizedSde = 0;
  let normalizedEbitda = 0;

  // Get base financial metrics
  const rawSde = input.sde || 0;
  const rawEbitda = input.ebitda || 0;
  const rawCashFlow = input.cashFlow || 0;
  const revenue = input.revenue || 0;

  // Determine owner salary (provided or estimated)
  const ownerSalary = input.ownerSalary || estimateOwnerSalary(revenue);

  // If SDE is provided directly, use it
  if (rawSde > 0) {
    normalizedSde = rawSde;
    normalizedEbitda = rawSde - ownerSalary; // Convert SDE to EBITDA
    explanation = `Using provided SDE of ${formatCurrency(rawSde)}. `;

    // Apply additional add-backs if provided
    if (input.addbacks && input.addbacks.length > 0) {
      const addbacksTotal = input.addbacks.reduce((sum, ab) => sum + ab.amount, 0);
      normalizedSde += addbacksTotal;
      normalizedEbitda += addbacksTotal;
      adjustments.addbacksTotal = addbacksTotal;
      explanation += `Applied ${input.addbacks.length} add-backs totaling ${formatCurrency(addbacksTotal)}. `;
    }

    // Apply discretionary expense add-back
    if (input.discretionaryExpenses && input.discretionaryExpenses > 0) {
      normalizedSde += input.discretionaryExpenses;
      normalizedEbitda += input.discretionaryExpenses;
      adjustments.discretionaryAddback = input.discretionaryExpenses;
      explanation += `Added back ${formatCurrency(input.discretionaryExpenses)} in discretionary expenses. `;
    }
  }
  // If EBITDA is provided, convert to SDE
  else if (rawEbitda > 0) {
    normalizedEbitda = rawEbitda;
    normalizedSde = rawEbitda + ownerSalary; // Add back owner salary for SDE
    adjustments.ownerSalaryAddback = ownerSalary;
    explanation = `Starting from EBITDA of ${formatCurrency(rawEbitda)}. Added back owner salary of ${formatCurrency(ownerSalary)} to calculate SDE. `;

    // Apply additional add-backs
    if (input.addbacks && input.addbacks.length > 0) {
      const addbacksTotal = input.addbacks.reduce((sum, ab) => sum + ab.amount, 0);
      normalizedSde += addbacksTotal;
      normalizedEbitda += addbacksTotal;
      adjustments.addbacksTotal = addbacksTotal;
      explanation += `Applied additional add-backs of ${formatCurrency(addbacksTotal)}. `;
    }

    if (input.discretionaryExpenses && input.discretionaryExpenses > 0) {
      normalizedSde += input.discretionaryExpenses;
      normalizedEbitda += input.discretionaryExpenses;
      adjustments.discretionaryAddback = input.discretionaryExpenses;
      explanation += `Added back ${formatCurrency(input.discretionaryExpenses)} in discretionary expenses. `;
    }
  }
  // Fall back to cash flow
  else if (rawCashFlow > 0) {
    // Cash flow is often similar to SDE for small businesses
    normalizedSde = rawCashFlow;
    normalizedEbitda = rawCashFlow - ownerSalary;
    explanation = `Using cash flow of ${formatCurrency(rawCashFlow)} as proxy for SDE. `;

    if (input.addbacks && input.addbacks.length > 0) {
      const addbacksTotal = input.addbacks.reduce((sum, ab) => sum + ab.amount, 0);
      normalizedSde += addbacksTotal;
      normalizedEbitda += addbacksTotal;
      adjustments.addbacksTotal = addbacksTotal;
      explanation += `Applied add-backs of ${formatCurrency(addbacksTotal)}. `;
    }
  }
  // Estimate from revenue if no earnings data
  else if (revenue > 0) {
    // Estimate SDE as ~15% of revenue for typical main-street business
    // This is a rough estimate - encourage user to provide actual earnings
    const estimatedMargin = 0.15;
    normalizedSde = Math.round(revenue * estimatedMargin);
    normalizedEbitda = normalizedSde - ownerSalary;
    explanation = `No earnings data provided. Estimated SDE at 15% of revenue (${formatCurrency(normalizedSde)}). ` +
      `This is a rough estimate - actual financials will improve accuracy. `;
  }

  adjustments.total = adjustments.ownerSalaryAddback + adjustments.discretionaryAddback + adjustments.addbacksTotal;

  // Add final normalized values to explanation
  explanation += `Final normalized SDE: ${formatCurrency(normalizedSde)}. Normalized EBITDA: ${formatCurrency(normalizedEbitda)}.`;

  return {
    normalizedSde,
    normalizedEbitda,
    adjustments,
    explanation,
  };
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
 * Determine primary valuation method based on business size
 */
export function determinePrimaryMethod(
  revenue: number,
  hasSde: boolean,
  hasEbitda: boolean
): 'sde' | 'ebitda' | 'revenue' {
  // For larger businesses ($2M+ revenue), EBITDA is preferred
  if (revenue >= 2000000 && hasEbitda) {
    return 'ebitda';
  }

  // For main-street businesses, SDE is the standard
  if (hasSde || hasEbitda) {
    return 'sde';
  }

  // Fall back to revenue multiple if no earnings data
  return 'revenue';
}

/**
 * Get typical SDE margin by industry for estimation
 */
export function getTypicalSdeMargin(industry: string): number {
  const margins: Record<string, number> = {
    saas: 0.25,
    it_services: 0.20,
    professional_services: 0.18,
    medical_practice: 0.20,
    dental_practice: 0.22,
    accounting: 0.30,
    restaurant_full_service: 0.08,
    restaurant_fast_food: 0.10,
    retail_general: 0.08,
    manufacturing_general: 0.12,
    construction_general: 0.10,
    hvac: 0.15,
    plumbing: 0.15,
    ecommerce: 0.15,
  };

  return margins[industry.toLowerCase()] || 0.15;
}
