'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { showNotification } from '@/components/Notification';
import ScrollAnimation from '@/components/ScrollAnimation';
import type { PreferencesFormData, AlertFrequency } from '@/lib/types';

function PreferencesPageContent() {
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('financial');
  const [initialLoad, setInitialLoad] = useState(true);

  const [formData, setFormData] = useState<PreferencesFormData>({
    industries: [],
    states: [],
    minRevenue: undefined,
    minMetric: undefined,
    metricType: undefined,
    ownerHoursMax: undefined,
    priceMax: undefined,
    alertFrequency: 'weekly',
    keywords: [],
  });

  useEffect(() => {
    const loadPreferences = async () => {
      if (!user || !initialLoad) return;

      try {
        const response = await fetch('/api/preferences');
        const data = await response.json();

        if (response.ok && data) {
          setFormData({
            industries: data.industries || [],
            states: data.states || [],
            minRevenue: data.min_revenue || undefined,
            minMetric: data.min_metric || undefined,
            metricType: data.metric_type || undefined,
            ownerHoursMax: data.owner_hours_max || undefined,
            priceMax: data.price_max || undefined,
            alertFrequency: data.alert_frequency || 'weekly',
            keywords: data.keywords || [],
          });
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setInitialLoad(false);
      }
    };

    loadPreferences();
  }, [user, initialLoad]);

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Manufacturing',
    'Retail', 'Food & Beverage', 'Automotive', 'Energy', 'Education',
    'Consulting', 'Marketing', 'Construction', 'Transportation', 'Agriculture',
    'Entertainment', 'Legal Services', 'Professional Services', 'Beauty & Wellness'
  ];

  const stateOptions = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
    'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
    'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
    'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
    'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
    'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
    'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
    'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
    'West Virginia', 'Wisconsin', 'Wyoming'
  ];

  const metricTypeOptions = [
    { value: 'revenue', label: 'Annual Revenue' },
    { value: 'ebitda', label: 'EBITDA' },
    { value: 'gross_profit', label: 'Gross Profit' },
    { value: 'net_income', label: 'Net Income' }
  ];

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value: number | undefined): string => {
    if (!value) return '';
    return value.toLocaleString('en-US');
  };

  // Helper function to parse comma-formatted numbers
  const parseNumberFromCommas = (value: string): number | undefined => {
    if (!value) return undefined;
    const cleanValue = value.replace(/,/g, '');
    const numValue = parseInt(cleanValue);
    return isNaN(numValue) ? undefined : numValue;
  };

  const handleFinancialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove all non-digit characters
    const numbersOnly = value.replace(/[^\d]/g, '');

    // Parse as number and store
    const numValue = numbersOnly ? parseInt(numbersOnly) : undefined;

    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (['minRevenue', 'priceMax', 'minMetric'].includes(name)) {
      // Handle financial inputs separately
      return;
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (name: 'industries' | 'states' | 'keywords', value: string) => {
    setFormData(prev => {
      const currentArray = prev[name] || [];
      return {
        ...prev,
        [name]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleKeywordAdd = (keyword: string) => {
    if (keyword.trim() && !formData.keywords?.includes(keyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...(prev.keywords || []), keyword.trim()]
      }));
    }
  };

  const handleKeywordRemove = (keyword: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords?.filter(k => k !== keyword) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          industries: formData.industries,
          states: formData.states,
          min_revenue: formData.minRevenue,
          min_metric: formData.minMetric,
          metric_type: formData.metricType,
          owner_hours_max: formData.ownerHoursMax,
          price_max: formData.priceMax,
          alert_frequency: formData.alertFrequency,
          keywords: formData.keywords
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.error || 'Failed to save preferences. Please try again.', 'error');
      } else {
        showNotification('Your preferences have been saved! We\'ll start sending you tailored opportunities.', 'success');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      showNotification('An error occurred while saving. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'financial', label: 'Financial' },
    { id: 'industry', label: 'Industry' },
    { id: 'location', label: 'Location' },
    { id: 'business', label: 'Business Details' },
    { id: 'notifications', label: 'Notifications' },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading preferences...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white font-medium mb-4">Authentication Required</h1>
          <Link href="/auth" className="btn-primary px-8 py-3 font-medium hover-lift">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container mx-auto px-8 pb-20 max-w-6xl page-content-large">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16 mt-24">
            <h1 className="text-heading text-white font-medium mb-6">
              Acquisition Preferences
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
              Tell us your investment criteria and we&apos;ll send you carefully curated business opportunities
              that match your acquisition preferences.
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={50}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="glass p-6 border border-gold/30 rounded-luxury sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">Preferences</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 font-primary ${
                      activeTab === tab.id
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="glass p-8 mb-8 border border-gold/30 rounded-luxury">
                {/* Financial Preferences */}
                {activeTab === 'financial' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Financial Criteria</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="form-label">Minimum Annual Revenue ($)</label>
                        <input
                          type="text"
                          name="minRevenue"
                          value={formatNumberWithCommas(formData.minRevenue)}
                          onChange={handleFinancialInputChange}
                          className="form-control no-spinners"
                          placeholder="e.g., 500,000"
                        />
                        <p className="text-neutral-400 text-sm">Minimum annual revenue for target businesses</p>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Maximum Purchase Price ($)</label>
                        <input
                          type="text"
                          name="priceMax"
                          value={formatNumberWithCommas(formData.priceMax)}
                          onChange={handleFinancialInputChange}
                          className="form-control no-spinners"
                          placeholder="e.g., 2,000,000"
                        />
                        <p className="text-neutral-400 text-sm">Maximum amount you&apos;re willing to pay</p>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Metric Type</label>
                        <select
                          name="metricType"
                          value={formData.metricType || ''}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">Select metric type</option>
                          {metricTypeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-neutral-400 text-sm">Primary financial metric for evaluation</p>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Minimum Metric Value ($)</label>
                        <input
                          type="text"
                          name="minMetric"
                          value={formatNumberWithCommas(formData.minMetric)}
                          onChange={handleFinancialInputChange}
                          className="form-control no-spinners"
                          placeholder="e.g., 100,000"
                        />
                        <p className="text-neutral-400 text-sm">Minimum value for selected metric</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Industry Preferences */}
                {activeTab === 'industry' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Industry Preferences</h2>
                    <p className="text-neutral-400 mb-6">Select the industries you&apos;re interested in:</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {industryOptions.map((industry) => (
                        <label
                          key={industry}
                          className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover-lift ${
                            formData.industries?.includes(industry)
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.industries?.includes(industry) || false}
                            onChange={() => handleArrayChange('industries', industry)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.industries?.includes(industry)
                              ? 'border-gold bg-gold'
                              : 'border-neutral-500'
                          }`}>
                            {formData.industries?.includes(industry) && (
                              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{industry}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location Preferences */}
                {activeTab === 'location' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Geographic Preferences</h2>
                    <p className="text-neutral-400 mb-6">Select the states where you&apos;d like to find opportunities:</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {stateOptions.map((state) => (
                        <label
                          key={state}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-all hover-lift text-sm ${
                            formData.states?.includes(state)
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.states?.includes(state) || false}
                            onChange={() => handleArrayChange('states', state)}
                            className="sr-only"
                          />
                          <div className={`w-3 h-3 rounded border flex items-center justify-center ${
                            formData.states?.includes(state)
                              ? 'border-gold bg-gold'
                              : 'border-neutral-500'
                          }`}>
                            {formData.states?.includes(state) && (
                              <svg className="w-2 h-2 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{state}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Details */}
                {activeTab === 'business' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Business Details</h2>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="form-label">Maximum Owner Hours per Week</label>
                        <input
                          type="number"
                          name="ownerHoursMax"
                          value={formData.ownerHoursMax || ''}
                          onChange={handleInputChange}
                          className="form-control-large w-full"
                          placeholder="e.g., 40 hours per week"
                          min="0"
                          max="168"
                        />
                        <p className="text-neutral-400 text-sm">Maximum weekly time commitment you want from the current owner</p>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Keywords</label>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {formData.keywords?.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gold/20 text-gold border border-gold/30"
                              >
                                {keyword}
                                <button
                                  type="button"
                                  onClick={() => handleKeywordRemove(keyword)}
                                  className="ml-2 text-gold/70 hover:text-gold"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                          <input
                            type="text"
                            className="form-control-large w-full"
                            placeholder="Add keywords to help match relevant businesses (press Enter to add)"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleKeywordAdd(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <p className="text-neutral-400 text-sm">Add keywords to help match relevant businesses (press Enter to add)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Preferences */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Email Preferences</h2>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="form-label">Email me top matches</label>
                        <select
                          name="alertFrequency"
                          value={formData.alertFrequency || 'weekly'}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="off">Never send emails</option>
                          <option value="instant">Instantly when new matches are found</option>
                          <option value="daily">Daily digest of matches</option>
                          <option value="weekly">Weekly summary of matches</option>
                        </select>
                        <p className="text-neutral-400 text-sm">
                          Choose how often you&apos;d like to receive emails about businesses that match your criteria.
                          {formData.alertFrequency === 'off' && (
                            <span className="block mt-2 text-yellow-400">
                              Note: You won&apos;t receive any email notifications with this setting.
                            </span>
                          )}
                          {formData.alertFrequency === 'daily' && (
                            <span className="block mt-2 text-green-400">
                              Daily emails sent at 5 AM with your top matches from the previous day.
                            </span>
                          )}
                          {formData.alertFrequency === 'weekly' && (
                            <span className="block mt-2 text-blue-400">
                              Weekly summary emails sent every Monday morning.
                            </span>
                          )}
                          {formData.alertFrequency === 'instant' && (
                            <span className="block mt-2 text-purple-400">
                              Immediate emails when high-scoring matches are found (may be frequent).
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
                        <h3 className="text-lg font-medium text-white mb-2">How Email Matching Works</h3>
                        <div className="space-y-2 text-sm text-neutral-300">
                          <p>• We automatically score new business listings against your preferences</p>
                          <p>• Only high-quality matches (40+ score) trigger email notifications</p>
                          <p>• Each email includes match reasons and key business details</p>
                          <p>• You can unsubscribe or change frequency anytime from any email</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <Link
                  href="/profile"
                  className="text-neutral-400 hover:text-white transition-colors duration-200 font-medium"
                >
                  ← Back to Profile
                </Link>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary px-12 py-4 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Preferences...</span>
                    </div>
                  ) : (
                    'Save Preferences'
                  )}
                </button>
              </div>
            </form>
          </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}

export default function PreferencesPage() {
  return (
    <ProtectedRoute>
      <PreferencesPageContent />
    </ProtectedRoute>
  );
}