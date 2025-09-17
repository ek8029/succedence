'use client';

import { useState } from 'react';
import Link from 'next/link';
import { showNotification } from '@/components/Notification';
import ScrollAnimation from '@/components/ScrollAnimation';
import ImageUpload from '@/components/ImageUpload';

export default function PreferencesPage() {
  const [formData, setFormData] = useState({
    // Personal preferences
    interests: [] as string[],
    industries: [] as string[],

    // Financial preferences
    minRevenue: '',
    maxRevenue: '',
    minPrice: '',
    maxPrice: '',

    // Geographic preferences
    locations: [] as string[],

    // Business preferences
    businessTypes: [] as string[],
    growthStage: '',

    // Notification preferences
    emailFrequency: 'weekly',
    instantAlerts: true,

    // Optional business info (for sellers)
    businessLogo: null as File | null,
    businessName: '',
    businessDescription: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('financial');

  const industryOptions = [
    'Technology', 'Healthcare', 'Finance', 'Real Estate', 'Manufacturing',
    'Retail', 'Food & Beverage', 'Automotive', 'Energy', 'Education',
    'Consulting', 'Marketing', 'Construction', 'Transportation', 'Agriculture'
  ];

  const locationOptions = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France',
    'Australia', 'Japan', 'Singapore', 'Netherlands', 'Switzerland'
  ];

  const businessTypeOptions = [
    'SaaS', 'E-commerce', 'Manufacturing', 'Service-based', 'Brick & Mortar',
    'Franchise', 'Digital Agency', 'Healthcare Practice', 'Restaurant',
    'Tech Startup', 'Traditional Business'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleArrayChange = (name: string, value: string) => {
    setFormData(prev => {
      const currentArray = prev[name as keyof typeof prev] as string[] || [];
      return {
        ...prev,
        [name]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      showNotification('Your preferences have been saved! We\'ll start sending you tailored opportunities.', 'success');
    } catch (error) {
      showNotification('Failed to save preferences. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'financial', label: 'Financial', icon: '💰' },
    { id: 'industry', label: 'Industry', icon: '🏢' },
    { id: 'location', label: 'Location', icon: '🌍' },
    { id: 'business', label: 'Business Type', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'profile', label: 'Business Profile', icon: '🎯' }
  ];

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container mx-auto px-8 py-20 max-w-6xl">
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16">
            <h1 className="text-heading text-white font-medium mb-6">
              Tailored Business Matching
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
              Tell us your preferences and we&apos;ll send you carefully curated business opportunities
              that match your investment criteria and interests.
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation direction="up" delay={50}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tab Navigation */}
          <div className="lg:col-span-1">
            <div className="glass p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-white mb-6">Preferences</h3>
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gold/20 text-gold border border-gold/30'
                        : 'text-neutral-300 hover:bg-neutral-800/50 hover:text-white'
                    }`}
                  >
                    <span className="mr-3">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit}>
              <div className="glass p-8 mb-8">
                {/* Financial Preferences */}
                {activeTab === 'financial' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Financial Criteria</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="form-label">Minimum Annual Revenue</label>
                        <select
                          name="minRevenue"
                          value={formData.minRevenue}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">No minimum</option>
                          <option value="50000">$50K+</option>
                          <option value="100000">$100K+</option>
                          <option value="250000">$250K+</option>
                          <option value="500000">$500K+</option>
                          <option value="1000000">$1M+</option>
                          <option value="5000000">$5M+</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Maximum Annual Revenue</label>
                        <select
                          name="maxRevenue"
                          value={formData.maxRevenue}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">No maximum</option>
                          <option value="100000">$100K</option>
                          <option value="500000">$500K</option>
                          <option value="1000000">$1M</option>
                          <option value="5000000">$5M</option>
                          <option value="10000000">$10M</option>
                          <option value="50000000">$50M+</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Minimum Purchase Price</label>
                        <select
                          name="minPrice"
                          value={formData.minPrice}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">No minimum</option>
                          <option value="25000">$25K+</option>
                          <option value="50000">$50K+</option>
                          <option value="100000">$100K+</option>
                          <option value="500000">$500K+</option>
                          <option value="1000000">$1M+</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Maximum Purchase Price</label>
                        <select
                          name="maxPrice"
                          value={formData.maxPrice}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">No maximum</option>
                          <option value="100000">$100K</option>
                          <option value="500000">$500K</option>
                          <option value="1000000">$1M</option>
                          <option value="5000000">$5M</option>
                          <option value="10000000">$10M+</option>
                        </select>
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
                            formData.industries.includes(industry)
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.industries.includes(industry)}
                            onChange={() => handleArrayChange('industries', industry)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.industries.includes(industry)
                              ? 'border-gold bg-gold'
                              : 'border-neutral-500'
                          }`}>
                            {formData.industries.includes(industry) && (
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
                    <p className="text-neutral-400 mb-6">Select the locations where you&apos;d like to find opportunities:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {locationOptions.map((location) => (
                        <label
                          key={location}
                          className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover-lift ${
                            formData.locations.includes(location)
                              ? 'border-gold bg-gold/10 text-gold'
                              : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.locations.includes(location)}
                            onChange={() => handleArrayChange('locations', location)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            formData.locations.includes(location)
                              ? 'border-gold bg-gold'
                              : 'border-neutral-500'
                          }`}>
                            {formData.locations.includes(location) && (
                              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="font-medium">{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Business Type Preferences */}
                {activeTab === 'business' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Business Type Preferences</h2>

                    <div className="space-y-6">
                      <div>
                        <p className="text-neutral-400 mb-4">Select the types of businesses you&apos;re interested in:</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {businessTypeOptions.map((type) => (
                            <label
                              key={type}
                              className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all hover-lift ${
                                formData.businessTypes.includes(type)
                                  ? 'border-gold bg-gold/10 text-gold'
                                  : 'border-neutral-600 text-neutral-300 hover:border-gold/50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.businessTypes.includes(type)}
                                onChange={() => handleArrayChange('businessTypes', type)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                formData.businessTypes.includes(type)
                                  ? 'border-gold bg-gold'
                                  : 'border-neutral-500'
                              }`}>
                                {formData.businessTypes.includes(type) && (
                                  <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium">{type}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Business Growth Stage</label>
                        <select
                          name="growthStage"
                          value={formData.growthStage}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">Any stage</option>
                          <option value="startup">Startup (0-2 years)</option>
                          <option value="growth">Growth Stage (3-7 years)</option>
                          <option value="mature">Mature Business (8+ years)</option>
                          <option value="established">Established Enterprise (15+ years)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notification Preferences */}
                {activeTab === 'notifications' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Notification Preferences</h2>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <label className="form-label">Email Frequency</label>
                        <select
                          name="emailFrequency"
                          value={formData.emailFrequency}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="daily">Daily digest</option>
                          <option value="weekly">Weekly summary</option>
                          <option value="monthly">Monthly report</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            name="instantAlerts"
                            checked={formData.instantAlerts}
                            onChange={handleInputChange}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            formData.instantAlerts
                              ? 'border-gold bg-gold'
                              : 'border-neutral-500'
                          }`}>
                            {formData.instantAlerts && (
                              <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="text-neutral-300 font-medium">
                            Receive instant alerts for high-priority matches
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Profile */}
                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">Your Business Profile</h2>
                    <p className="text-neutral-400 mb-6">
                      Optional: Add details about your business if you&apos;re also considering selling.
                    </p>

                    <div className="space-y-6">
                      <ImageUpload
                        onImageSelect={(file) => setFormData(prev => ({ ...prev, businessLogo: file }))}
                        label="Business Logo"
                        accept="image/*"
                      />

                      <div className="space-y-4">
                        <label className="form-label">Business Name</label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="form-control"
                          placeholder="Enter your business name"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="form-label">Business Description</label>
                        <textarea
                          name="businessDescription"
                          value={formData.businessDescription}
                          onChange={handleInputChange}
                          rows={4}
                          className="form-control"
                          placeholder="Briefly describe your business, its services, and unique value proposition..."
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center">
                <Link
                  href="/"
                  className="text-neutral-400 hover:text-white transition-colors duration-200 font-medium"
                >
                  ← Back to Home
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