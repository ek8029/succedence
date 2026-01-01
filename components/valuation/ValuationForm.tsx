'use client';

import { useState, useEffect } from 'react';
import { ValuationInput } from '@/lib/valuation';
import { CurrencyInput } from '@/components/CurrencyInput';
import Tooltip, { InfoIcon } from '@/components/Tooltip';

interface ValuationFormProps {
  activeTab: 'url' | 'manual' | 'listing';
  industryOptions: { key: string; name: string }[];
  onCalculate: (input: ValuationInput, sourceType: 'url_parse' | 'manual_entry' | 'existing_listing', sourceUrl?: string) => void;
  isCalculating: boolean;
  initialValues?: Partial<ValuationInput>;
}

export function ValuationForm({
  activeTab,
  industryOptions,
  onCalculate,
  isCalculating,
  initialValues,
}: ValuationFormProps) {
  // URL tab state
  const [url, setUrl] = useState('');

  // Manual entry state
  const [formData, setFormData] = useState<ValuationInput>({
    industry: initialValues?.industry || '',
    revenue: initialValues?.revenue,
    sde: initialValues?.sde,
    ebitda: initialValues?.ebitda,
    cashFlow: initialValues?.cashFlow,
    askingPrice: initialValues?.askingPrice,
    employees: initialValues?.employees,
    yearEstablished: initialValues?.yearEstablished,
    ownerHoursPerWeek: initialValues?.ownerHoursPerWeek,
    customerConcentration: initialValues?.customerConcentration,
    revenueGrowthTrend: initialValues?.revenueGrowthTrend,
    recurringRevenuePct: initialValues?.recurringRevenuePct,
    leaseYearsRemaining: initialValues?.leaseYearsRemaining,
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    businessName: initialValues?.businessName || '',
  });

  // Update form when initialValues change (e.g., from URL params)
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).some(key => initialValues[key as keyof ValuationInput] !== undefined)) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [initialValues]);

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleInputChange = (field: keyof ValuationInput, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (activeTab === 'url') {
      // For URL tab, use the parsed data or prompt for manual entry
      if (!url) return;
      onCalculate({ ...formData, industry: formData.industry || 'general_business' }, 'url_parse', url);
    } else if (activeTab === 'manual') {
      if (!formData.industry || (!formData.revenue && !formData.sde && !formData.ebitda)) return;
      onCalculate(formData, 'manual_entry');
    }
  };

  const formatCurrency = (value: number | undefined): string => {
    if (!value) return '';
    return value.toLocaleString();
  };

  const parseCurrency = (value: string): number | undefined => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const num = parseInt(cleaned);
    return isNaN(num) ? undefined : num;
  };

  return (
    <div className="glass rounded-luxury-lg border border-white/10 p-8 md:p-12">
      {activeTab === 'url' && (
        <div className="space-y-6">
          <div>
            <label className="block text-warm-white font-medium mb-2">
              Listing URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a BizBuySell, BusinessesForSale, or LoopNet URL..."
              className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
            />
            <p className="text-silver/60 text-sm mt-2">
              We&apos;ll extract the business details automatically. You can adjust any fields after parsing.
            </p>
          </div>

          {/* Quick industry select for URL mode */}
          <div>
            <label className="block text-warm-white font-medium mb-2">
              Industry (if known)
            </label>
            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white focus:border-gold/50 focus:outline-none"
            >
              <option value="">Select Industry...</option>
              {industryOptions.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isCalculating || !url}
            className="w-full py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCalculating ? 'Analyzing...' : 'Parse & Valuate'}
          </button>
        </div>
      )}

      {activeTab === 'manual' && (
        <div className="space-y-6">
          {/* Essential Fields */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-warm-white font-medium mb-2">
                Industry <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white focus:border-gold/50 focus:outline-none"
                required
              >
                <option value="">Select Industry...</option>
                {industryOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-warm-white font-medium mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={formData.businessName || ''}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                placeholder="e.g., Joe's HVAC Services"
                className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Financial Metrics */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-warm-white font-semibold mb-4">Financial Metrics</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-warm-white font-medium mb-2">
                  Annual Revenue <span className="text-red-400">*</span>
                </label>
                <CurrencyInput
                  value={formData.revenue}
                  onChange={(value) => handleInputChange('revenue', value)}
                  placeholder="500,000"
                  required
                  aria-label="Annual Revenue"
                />
              </div>

              <div>
                <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                  SDE (Seller&apos;s Discretionary Earnings)
                  <Tooltip content="SDE = Net profit + owner compensation + discretionary expenses. Primary metric for small business valuations. Enter either SDE or EBITDA, SDE is preferred for businesses under $5M." position="top">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <CurrencyInput
                  value={formData.sde}
                  onChange={(value) => handleInputChange('sde', value)}
                  placeholder="100,000"
                  aria-label="Seller's Discretionary Earnings (SDE)"
                />
                <p className="text-silver/50 text-xs mt-1">Primary valuation metric for small businesses</p>
              </div>

              <div>
                <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                  EBITDA
                  <Tooltip content="EBITDA = Net profit + interest + taxes + depreciation + amortization. Used for larger businesses. If you have SDE, enter that instead." position="top">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <CurrencyInput
                  value={formData.ebitda}
                  onChange={(value) => handleInputChange('ebitda', value)}
                  placeholder="75,000"
                  aria-label="EBITDA"
                />
              </div>

              <div>
                <label className="block text-warm-white font-medium mb-2">
                  Asking Price
                </label>
                <CurrencyInput
                  value={formData.askingPrice}
                  onChange={(value) => handleInputChange('askingPrice', value)}
                  placeholder="250,000"
                  aria-label="Asking Price"
                />
                <p className="text-silver/50 text-xs mt-1">We&apos;ll compare this to our valuation</p>
              </div>
            </div>
          </div>

          {/* Business Details */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-warm-white font-semibold mb-4">Business Details</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-warm-white font-medium mb-2">
                  Employees
                </label>
                <input
                  type="number"
                  value={formData.employees || ''}
                  onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || undefined)}
                  placeholder="5"
                  className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-warm-white font-medium mb-2">
                  Year Established
                </label>
                <input
                  type="number"
                  value={formData.yearEstablished || ''}
                  onChange={(e) => handleInputChange('yearEstablished', parseInt(e.target.value) || undefined)}
                  placeholder="2015"
                  className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                  Owner Hours/Week
                  <Tooltip content="Hours the owner works per week. 60+ hours indicates high owner dependency (increases risk). 20- hours suggests good systems and management in place." position="top">
                    <InfoIcon />
                  </Tooltip>
                </label>
                <input
                  type="number"
                  value={formData.ownerHoursPerWeek || ''}
                  onChange={(e) => handleInputChange('ownerHoursPerWeek', parseInt(e.target.value) || undefined)}
                  placeholder="40"
                  min="0"
                  max="168"
                  className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                  aria-label="Owner Hours Per Week"
                />
              </div>
            </div>
          </div>

          {/* Advanced Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-gold hover:text-gold/80 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="border-t border-white/10 pt-6 space-y-6">
              <h3 className="text-warm-white font-semibold">Risk Factors</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-warm-white font-medium mb-2">
                    Revenue Trend
                  </label>
                  <select
                    value={formData.revenueGrowthTrend || ''}
                    onChange={(e) => handleInputChange('revenueGrowthTrend', e.target.value as 'increasing' | 'stable' | 'declining' | undefined)}
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white focus:border-gold/50 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="increasing">Increasing</option>
                    <option value="stable">Stable</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>

                <div>
                  <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                    Customer Concentration (%)
                    <Tooltip content="Percentage of revenue from the largest customer. Under 10% is ideal, 10-25% is moderate risk, over 25% is high risk. High concentration makes the business vulnerable." position="top">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={formData.customerConcentration ? Math.round(formData.customerConcentration * 100) : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleInputChange('customerConcentration', isNaN(val) ? undefined : val / 100);
                    }}
                    placeholder="20"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    aria-label="Customer Concentration Percentage"
                  />
                  <p className="text-silver/50 text-xs mt-1">Revenue from single largest customer</p>
                </div>

                <div>
                  <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                    Recurring Revenue (%)
                    <Tooltip content="Percentage of revenue that repeats (subscriptions, contracts, retainers). Higher is better. 50%+ is excellent, 20-50% is good, under 20% increases risk. Recurring revenue increases predictability and value." position="top">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={formData.recurringRevenuePct ? Math.round(formData.recurringRevenuePct * 100) : ''}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      handleInputChange('recurringRevenuePct', isNaN(val) ? undefined : val / 100);
                    }}
                    placeholder="30"
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    aria-label="Recurring Revenue Percentage"
                  />
                </div>

                <div>
                  <label className="block text-warm-white font-medium mb-2 flex items-center gap-2">
                    Lease Years Remaining
                    <Tooltip content="Years remaining on the facility lease. 3+ years is ideal, 1-3 years is acceptable, under 1 year is a red flag. Short leases create uncertainty and can block financing." position="top">
                      <InfoIcon />
                    </Tooltip>
                  </label>
                  <input
                    type="number"
                    value={formData.leaseYearsRemaining || ''}
                    onChange={(e) => handleInputChange('leaseYearsRemaining', parseInt(e.target.value) || undefined)}
                    placeholder="5"
                    min="0"
                    max="99"
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none focus:ring-2 focus:ring-gold/20"
                    aria-label="Lease Years Remaining"
                  />
                </div>
              </div>

              <h3 className="text-warm-white font-semibold pt-4">Location</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-warm-white font-medium mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Austin"
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-warm-white font-medium mb-2">State</label>
                  <input
                    type="text"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="TX"
                    className="w-full px-4 py-3 bg-charcoal/50 border border-white/10 rounded-luxury text-warm-white placeholder-silver/50 focus:border-gold/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isCalculating || !formData.industry || (!formData.revenue && !formData.sde && !formData.ebitda)}
            className="w-full py-4 bg-accent-gradient text-midnight font-semibold rounded-luxury hover:shadow-gold-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Calculating Valuation...
              </>
            ) : (
              <>
                Calculate Valuation
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === 'listing' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-warm-white font-semibold text-lg mb-2">
            Valuate from Listings
          </h3>
          <p className="text-silver/70 mb-6">
            Browse our marketplace and click &quot;Get Valuation&quot; on any listing to run an instant analysis.
          </p>
          <a
            href="/browse"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gold/20 text-gold border border-gold/30 rounded-luxury hover:bg-gold/30 transition-colors"
          >
            Browse Listings
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
}
