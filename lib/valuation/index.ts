// Valuation Engine - Main exports

export * from './types';
export * from './industry-multiples';
export * from './risk-adjustments';
export * from './deal-quality';
export * from './financial-normalization';
export { calculateValuation, quickEstimate } from './valuation-engine';

// AI-powered simple calculator (deterministic math + AI commentary)
export {
  calculateValuationSimple,
  adjustMultiple,
  calculateConfidenceScore,
  buildCommentaryPrompt,
  generateFallbackCommentary,
  type ValuationCalculatorInput,
  type ValuationCalculatorOutput,
  type AdjustmentResult,
  type AdjustmentContext,
} from './ai-valuation-calculator';
