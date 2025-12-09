'use client';

import { ValuationOutput } from '@/lib/valuation';
import { getDealQualityColor } from '@/lib/valuation/deal-quality';

interface ValuationResultsProps {
  valuation: ValuationOutput;
}

export function ValuationResults({ valuation }: ValuationResultsProps) {
  const {
    valuationRange,
    dealQualityScore,
    dealQualityBreakdown,
    mispricing,
    multiplesUsed,
    normalizedFinancials,
    riskAdjustments,
    keyStrengths,
    redFlags,
    negotiationRecommendations,
    methodology,
    industryData,
  } = valuation;

  const qualityColor = getDealQualityColor(dealQualityScore);

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  return (
    <div className="space-y-8">
      {/* Main Valuation Card */}
      <div className="glass rounded-luxury-lg border border-gold/30 p-8">
        <div className="text-center mb-8">
          <h2 className="text-silver/80 text-sm font-medium uppercase tracking-wider mb-2">
            Estimated Business Value
          </h2>
          <div className="text-5xl md:text-6xl font-bold text-gold font-mono mb-2">
            {formatCurrency(valuationRange.mid)}
          </div>
          <div className="text-silver/70">
            Range: {formatCurrency(valuationRange.low)} - {formatCurrency(valuationRange.high)}
          </div>
        </div>

        {/* Mispricing Analysis */}
        {mispricing && (
          <div className={`p-4 rounded-luxury text-center mb-6 ${
            mispricing.recommendation === 'strong_buy' || mispricing.recommendation === 'buy'
              ? 'bg-green-500/20 border border-green-500/30'
              : mispricing.recommendation === 'fair'
              ? 'bg-yellow-500/20 border border-yellow-500/30'
              : 'bg-red-500/20 border border-red-500/30'
          }`}>
            <div className={`text-xl font-bold mb-1 ${
              mispricing.recommendation === 'strong_buy' || mispricing.recommendation === 'buy'
                ? 'text-green-400'
                : mispricing.recommendation === 'fair'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {mispricing.label}
            </div>
            <p className="text-silver/80 text-sm">{mispricing.analysis}</p>
          </div>
        )}

        {/* Deal Quality Score */}
        <div className="flex items-center justify-center gap-6">
          <div className={`w-24 h-24 rounded-full ${qualityColor.bg} ${qualityColor.border} border-2 flex flex-col items-center justify-center`}>
            <span className={`text-3xl font-bold ${qualityColor.text}`}>{dealQualityScore}</span>
            <span className="text-silver/60 text-xs">/ 100</span>
          </div>
          <div>
            <div className={`text-lg font-semibold ${qualityColor.text}`}>
              {qualityColor.label} Deal
            </div>
            <div className="text-silver/70 text-sm">Deal Quality Score</div>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass rounded-luxury border border-white/10 p-6">
          <h3 className="text-warm-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Key Strengths
          </h3>
          {keyStrengths.length > 0 ? (
            <ul className="space-y-2">
              {keyStrengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-silver/80 text-sm">
                  <span className="text-green-400 mt-1">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-silver/60 text-sm">No significant strengths identified based on provided data.</p>
          )}
        </div>

        {/* Red Flags */}
        <div className="glass rounded-luxury border border-white/10 p-6">
          <h3 className="text-warm-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Risk Factors
          </h3>
          {redFlags.length > 0 ? (
            <ul className="space-y-2">
              {redFlags.map((flag, i) => (
                <li key={i} className="flex items-start gap-2 text-silver/80 text-sm">
                  <span className="text-red-400 mt-1">!</span>
                  {flag}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-silver/60 text-sm">No significant risk factors identified.</p>
          )}
        </div>
      </div>

      {/* Deal Quality Breakdown */}
      <div className="glass rounded-luxury border border-white/10 p-6">
        <h3 className="text-warm-white font-semibold mb-4">Deal Quality Breakdown</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {Object.entries(dealQualityBreakdown).map(([key, value]) => (
            <div key={key} className="bg-charcoal/30 p-4 rounded-luxury">
              <div className="flex justify-between items-center mb-2">
                <span className="text-silver/70 text-sm capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className={`font-mono font-bold ${
                  value >= 70 ? 'text-green-400' : value >= 50 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {value}
                </span>
              </div>
              <div className="w-full bg-charcoal/50 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    value >= 70 ? 'bg-green-500' : value >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Valuation Details */}
      <div className="glass rounded-luxury border border-white/10 p-6">
        <h3 className="text-warm-white font-semibold mb-4">Valuation Details</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-silver/60 text-sm mb-2">Industry</h4>
            <p className="text-warm-white">{industryData.industryName}</p>
            {industryData.naicsCode && industryData.naicsCode !== 'default' && (
              <p className="text-silver/50 text-xs">NAICS: {industryData.naicsCode}</p>
            )}
          </div>

          <div>
            <h4 className="text-silver/60 text-sm mb-2">Normalized Financials</h4>
            <p className="text-warm-white">
              SDE: {formatCurrency(normalizedFinancials.sde)}
            </p>
            <p className="text-silver/70 text-sm">
              EBITDA: {formatCurrency(normalizedFinancials.ebitda)}
            </p>
          </div>

          <div>
            <h4 className="text-silver/60 text-sm mb-2">SDE Multiples Applied</h4>
            <p className="text-warm-white font-mono">
              {multiplesUsed.sde.low.toFixed(2)}x - {multiplesUsed.sde.high.toFixed(2)}x
            </p>
            <p className="text-silver/50 text-xs">
              Base: {industryData.sde.low}x-{industryData.sde.high}x (adjusted for risk)
            </p>
          </div>

          <div>
            <h4 className="text-silver/60 text-sm mb-2">Risk Adjustment</h4>
            <p className={`font-mono font-bold ${
              valuation.totalRiskAdjustment > 0 ? 'text-green-400' :
              valuation.totalRiskAdjustment < 0 ? 'text-red-400' : 'text-silver'
            }`}>
              {valuation.totalRiskAdjustment > 0 ? '+' : ''}{valuation.totalRiskAdjustment.toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      {/* Negotiation Tips */}
      {negotiationRecommendations.length > 0 && (
        <div className="glass rounded-luxury border border-white/10 p-6">
          <h3 className="text-warm-white font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Negotiation Recommendations
          </h3>
          <ul className="space-y-3">
            {negotiationRecommendations.map((tip, i) => (
              <li key={i} className="flex items-start gap-3 text-silver/80">
                <span className="text-gold font-bold">{i + 1}.</span>
                <span className="text-sm">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Methodology */}
      <div className="glass rounded-luxury border border-white/10 p-6">
        <h3 className="text-warm-white font-semibold mb-4">Methodology</h3>
        <div className="prose prose-invert prose-sm max-w-none">
          {methodology.split('\n\n').map((section, i) => (
            <div key={i} className="mb-4">
              {section.split('\n').map((line, j) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h4 key={j} className="text-gold font-semibold mt-4 mb-2">
                      {line.replace(/\*\*/g, '')}
                    </h4>
                  );
                }
                return (
                  <p key={j} className="text-silver/80 text-sm leading-relaxed">
                    {line.replace(/\*\*/g, '')}
                  </p>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Risk Adjustments Detail */}
      {riskAdjustments.length > 0 && (
        <div className="glass rounded-luxury border border-white/10 p-6">
          <h3 className="text-warm-white font-semibold mb-4">All Risk Factors Analyzed</h3>
          <div className="space-y-3">
            {riskAdjustments.map((adj, i) => (
              <div
                key={i}
                className={`p-3 rounded-luxury border ${
                  adj.severity === 'positive'
                    ? 'bg-green-500/10 border-green-500/30'
                    : adj.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : adj.severity === 'negative'
                    ? 'bg-orange-500/10 border-orange-500/30'
                    : 'bg-charcoal/30 border-white/10'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <span className={`text-xs uppercase font-medium ${
                      adj.severity === 'positive' ? 'text-green-400' :
                      adj.severity === 'critical' ? 'text-red-400' :
                      adj.severity === 'negative' ? 'text-orange-400' : 'text-silver/50'
                    }`}>
                      {adj.severity}
                    </span>
                    <p className="text-silver/80 text-sm mt-1">{adj.description}</p>
                  </div>
                  <span className={`font-mono text-sm ${
                    adj.impact > 0 ? 'text-green-400' : adj.impact < 0 ? 'text-red-400' : 'text-silver/50'
                  }`}>
                    {adj.impact > 0 ? '+' : ''}{adj.impact.toFixed(2)}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
