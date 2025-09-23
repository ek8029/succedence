'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { ListingCreateInput } from '@/lib/validation/listings';
import { z } from 'zod';

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    city: '',
    state: '',
    revenue: '',
    ebitda: '',
    metric_type: 'annual' as const,
    owner_hours: '',
    employees: '',
    price: '',
    source: 'manual' as const
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [listingId, setListingId] = useState<string | null>(null);
  const [isDraft, setIsDraft] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const uploadMedia = useCallback(async (listingIdParam: string) => {
    for (const file of uploadedImages) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/listings/${listingIdParam}/media`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          console.error('Failed to upload media:', await response.text());
        }
      } catch (error) {
        console.error('Error uploading media:', error);
      }
    }
  }, [uploadedImages]);

  const saveDraft = useCallback(async (isAutoSave = false) => {
    if (isAutoSave) {
      setAutoSaving(true);
    } else {
      setSubmitting(true);
    }
    setErrors({});

    console.log('=== SAVING DRAFT ===');
    console.log('Form data before processing:', formData);
    console.log('Is auto save:', isAutoSave);

    try {
      // Process form data, converting empty strings to undefined for all fields
      const requestData = {
        title: formData.title || undefined,
        description: formData.description || undefined,
        industry: formData.industry || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        metric_type: formData.metric_type || undefined,
        source: formData.source || 'manual',
        revenue: formData.revenue ? parseInt(formData.revenue, 10) : undefined,
        ebitda: formData.ebitda ? parseInt(formData.ebitda, 10) : undefined,
        owner_hours: formData.owner_hours ? parseInt(formData.owner_hours, 10) : undefined,
        employees: formData.employees ? parseInt(formData.employees, 10) : undefined,
        price: formData.price ? parseInt(formData.price, 10) : undefined,
      };

      console.log('Request data after processing:', requestData);

      let response;

      if (listingId) {
        // Update existing draft
        response = await fetch(`/api/listings/${listingId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ action: 'update_draft', ...requestData }),
        });
      } else {
        // Create new draft
        response = await fetch('/api/listings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
      }

      console.log('API Response status:', response.status);
      console.log('API Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response data:', result);

        if (!listingId) {
          setListingId(result.listing.id);
          console.log('Set listing ID:', result.listing.id);
        }

        // Upload media if any
        if (uploadedImages.length > 0) {
          await uploadMedia(result.listing.id);
        }

        setLastSaved(new Date());
        if (!isAutoSave) {
          showNotification('✓ Draft saved successfully! You can continue editing anytime.', 'success');
        }
        console.log('Draft saved successfully!');
        return true;
      } else {
        const error = await response.json();
        console.error('API Error response:', error);
        if (!isAutoSave) {
          showNotification(`✗ ${error.error || 'Failed to save draft'}`, 'error');
        }
        return false;
      }
    } catch (error) {
      console.error('=== DRAFT SAVE ERROR ===');
      console.error('Error type:', error instanceof z.ZodError ? 'ZodError' : typeof error);
      console.error('Error details:', error);

      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        console.error('Validation errors:', fieldErrors);
        setErrors(fieldErrors);
        if (!isAutoSave) {
          showNotification('Please fix the errors below', 'error');
        }
        return false;
      } else {
        console.error('Network/other error saving draft:', error);
        if (!isAutoSave) {
          showNotification('Network error - please try again', 'error');
        }
        return false;
      }
    } finally {
      if (isAutoSave) {
        setAutoSaving(false);
      } else {
        setSubmitting(false);
      }
    }
  }, [formData, listingId, uploadedImages, uploadMedia]);

  const requestPublish = async () => {
    if (!listingId) {
      const saved = await saveDraft();
      if (!saved) return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'request_publish' }),
      });

      if (response.ok) {
        showNotification('✓ Listing submitted for review!', 'success');
        setIsDraft(false);
        setTimeout(() => {
          router.push(`/listings/confirmation?id=${listingId}&status=submitted`);
        }, 1500);
      } else {
        const error = await response.json();
        showNotification(`✗ ${error.error || 'Failed to submit for review'}`, 'error');
      }
    } catch (error) {
      console.error('Error requesting publish:', error);
      showNotification('Network error - please try again', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up ${
      type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    notification.innerHTML = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const saved = await saveDraft();
    if (saved && listingId) {
      router.push(`/listings/confirmation?id=${listingId}&status=draft`);
    }
  };

  // Auto-save functionality
  const debouncedSave = useCallback(() => {
    const debounced = debounce(() => {
      if (listingId && Object.values(formData).some(value => value && value.toString().trim() !== '')) {
        saveDraft(true);
      }
    }, 3000);
    debounced();
    return debounced;
  }, [formData, listingId, saveDraft]);

  useEffect(() => {
    const debounced = debouncedSave();
    return () => debounced.cancel();
  }, [debouncedSave]);

  // Debounce utility function
  function debounce(func: Function, wait: number) {
    let timeout: NodeJS.Timeout;
    const debounced = (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(null, args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
  }

  // Helper function to format numbers with commas
  const formatNumberWithCommas = (value: string | number): string => {
    if (!value) return '';
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    if (isNaN(numValue)) return '';
    return numValue.toLocaleString('en-US');
  };

  // Helper function to parse comma-formatted numbers
  const parseNumberFromCommas = (value: string): string => {
    if (!value) return '';
    return value.replace(/,/g, '');
  };

  const handleFinancialInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove all non-digit characters
    const numbersOnly = value.replace(/[^\d]/g, '');

    setFormData(prev => ({
      ...prev,
      [name]: numbersOnly
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Handle financial inputs separately
    if (['revenue', 'ebitda', 'price'].includes(name)) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    for (const file of files) {
      if (file.size > maxSize) {
        showNotification(`File ${file.name} is too large (max 10MB)`, 'error');
        continue;
      }
      if (!allowedTypes.includes(file.type)) {
        showNotification(`File ${file.name} has invalid type`, 'error');
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadedImages(prev => [...prev, ...validFiles]);

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    showNotification(`✓ ${validFiles.length} image(s) ready for upload`, 'success');
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional pb-16 page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-heading text-white font-medium mb-4">Submit Business Listing</h1>

              {/* Status Indicator */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {autoSaving && (
                  <div className="flex items-center space-x-2 bg-blue-600/20 border border-blue-500/30 rounded-lg px-4 py-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-300 text-sm font-medium">Auto-saving...</span>
                  </div>
                )}

                {lastSaved && !autoSaving && (
                  <div className="flex items-center space-x-2 bg-green-600/20 border border-green-500/30 rounded-lg px-4 py-2">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-green-300 text-sm font-medium">
                      Saved {lastSaved.toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-2xl text-neutral-400 leading-relaxed mb-12">
                Present your business opportunity to our network of qualified investors and acquirers.
              </p>
              <Link href="/" className="btn-secondary btn-sm hover-lift">
                ← Return Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Form */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-4xl mx-auto">
            <div className="glass p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
              {/* Business Overview */}
              <div className="space-y-8">
                <h2 className="text-2xl text-white font-medium border-b border-neutral-600 pb-4">
                  Business Overview
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="title" className="block text-lg text-neutral-300 font-medium">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`form-control w-full ${
                        errors.title ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter business name"
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="industry" className="block text-lg text-neutral-300 font-medium">
                      Industry
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className={`form-control w-full ${
                        errors.industry ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select Industry</option>
                      <option value="HVAC Services">HVAC Services</option>
                      <option value="Plumbing Services">Plumbing Services</option>
                      <option value="Electrical Services">Electrical Services</option>
                      <option value="Roofing & Siding">Roofing & Siding</option>
                      <option value="Landscaping & Lawn Care">Landscaping & Lawn Care</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Cleaning Services">Cleaning Services</option>
                      <option value="Auto Repair & Service">Auto Repair & Service</option>
                      <option value="Construction & Contracting">Construction & Contracting</option>
                      <option value="Property Management">Property Management</option>
                      <option value="Retail (Local/Traditional)">Retail (Local/Traditional)</option>
                      <option value="Food & Beverage">Food & Beverage (Restaurants/Bars)</option>
                      <option value="Manufacturing">Manufacturing (Small-Scale)</option>
                      <option value="Transportation & Logistics">Transportation & Logistics</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Medical & Dental Practices">Medical & Dental Practices</option>
                      <option value="Accounting & Tax Services">Accounting & Tax Services</option>
                      <option value="Insurance Services">Insurance Services</option>
                      <option value="Real Estate Services">Real Estate Services</option>
                      <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                      <option value="Dry Cleaning & Laundry">Dry Cleaning & Laundry</option>
                      <option value="Pet Services">Pet Services</option>
                      <option value="Home Security Services">Home Security Services</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="Carpet & Flooring">Carpet & Flooring</option>
                      <option value="Funeral Services">Funeral Services</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && (
                      <p className="text-red-400 text-sm">{errors.industry}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="description" className="block text-lg text-neutral-300 font-medium">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`form-control w-full ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Provide a comprehensive description of your business, including products/services, market position, competitive advantages, and growth opportunities..."
                                      />
                  {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="city" className="block text-lg text-neutral-300 font-medium">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`form-control w-full ${
                        errors.city ? 'border-red-500' : ''
                      }`}
                      placeholder="City"
                                          />
                    {errors.city && (
                      <p className="text-red-400 text-sm">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="state" className="block text-lg text-neutral-300 font-medium">
                      State
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`form-control w-full ${
                        errors.state ? 'border-red-500' : ''
                      }`}
                      placeholder="State"
                                          />
                    {errors.state && (
                      <p className="text-red-400 text-sm">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="employees" className="block text-lg text-neutral-300 font-medium">
                      Employee Count
                    </label>
                    <input
                      type="number"
                      id="employees"
                      name="employees"
                      value={formData.employees}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      placeholder="Number of employees"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Business Images */}
              <div className="space-y-8">
                <h2 className="text-2xl text-white font-medium border-b border-neutral-600 pb-4">
                  Business Images
                </h2>

                <div className="space-y-6">
                  <p className="text-neutral-400">
                    Upload images of your business including logo, facility photos, products, or operations.
                    These help potential buyers better understand your business.
                  </p>

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-neutral-600 rounded-lg p-8 text-center hover:border-neutral-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label htmlFor="imageUpload" className="cursor-pointer block">
                      <div className="space-y-4">
                        <div className="w-16 h-16 bg-neutral-800 border border-neutral-600 flex items-center justify-center mx-auto rounded-lg">
                          <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-lg text-white font-medium">Upload Business Images</div>
                          <div className="text-neutral-400 text-sm mt-2">
                            Click to browse or drag and drop<br/>
                            PNG, JPG, or GIF up to 10MB each
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg text-white font-medium">Uploaded Images ({imagePreviews.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <div className="relative w-full h-32">
                              <Image
                                src={preview}
                                alt={`Business image ${index + 1}`}
                                fill
                                className="object-cover rounded-lg border border-neutral-600"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-red-700"
                            >
                              ×
                            </button>
                            <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                              {uploadedImages[index]?.name || `Image ${index + 1}`}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-neutral-400 text-sm">
                        💡 Tip: Include your logo, storefront, products, team photos, or facility images to make your listing more attractive to buyers.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="space-y-8">
                <h2 className="text-2xl text-white font-medium border-b border-neutral-600 pb-4">
                  Financial Information
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="revenue" className="block text-lg text-neutral-300 font-medium">
                      Annual Revenue (USD)
                    </label>
                    <input
                      type="text"
                      id="revenue"
                      name="revenue"
                      value={formatNumberWithCommas(formData.revenue)}
                      onChange={handleFinancialInputChange}
                      className={`form-control w-full text-financial no-spinners ${
                        errors.revenue ? 'border-red-500' : ''
                      }`}
                      placeholder="e.g., 500,000"
                                          />
                    {errors.revenue && (
                      <p className="text-red-400 text-sm">{errors.revenue}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="ebitda" className="block text-lg text-neutral-300 font-medium">
                      EBITDA (USD)
                    </label>
                    <input
                      type="text"
                      id="ebitda"
                      name="ebitda"
                      value={formatNumberWithCommas(formData.ebitda)}
                      onChange={handleFinancialInputChange}
                      className="form-control w-full text-financial no-spinners"
                      placeholder="e.g., 100,000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="owner_hours" className="block text-lg text-neutral-300 font-medium">
                      Owner Hours per Week
                    </label>
                    <input
                      type="number"
                      id="owner_hours"
                      name="owner_hours"
                      value={formData.owner_hours}
                      onChange={handleInputChange}
                      className="form-control w-full"
                      placeholder="Hours per week"
                      min="0"
                      max="168"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="metric_type" className="block text-lg text-neutral-300 font-medium">
                      Financial Metric Type
                    </label>
                    <select
                      id="metric_type"
                      name="metric_type"
                      value={formData.metric_type}
                      onChange={handleInputChange}
                      className="form-control w-full"
                                          >
                      <option value="annual">Annual</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="price" className="block text-lg text-neutral-300 font-medium">
                    Asking Price (USD)
                  </label>
                  <input
                    type="text"
                    id="price"
                    name="price"
                    value={formatNumberWithCommas(formData.price)}
                    onChange={handleFinancialInputChange}
                    className="form-control w-full text-financial no-spinners"
                    placeholder="e.g., 2,000,000 (leave blank for AI valuation)"
                  />
                  <p className="text-neutral-400 text-sm">
                    If left blank, our AI will provide a valuation estimate based on industry standards and financial metrics.
                  </p>
                </div>
              </div>


              {/* Submit */}
              <div className="form-actions">
                <div className="btn-group">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-secondary btn-sm hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : 'Save Draft'}
                  </button>

                  {listingId && isDraft && (
                    <button
                      type="button"
                      onClick={requestPublish}
                      disabled={submitting}
                      className="btn-primary btn-sm hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  )}
                </div>

                <div className="text-center mt-6">
                  <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
                    {isDraft ? (
                      'Save as draft to add media and make changes, then submit for admin review when ready.'
                    ) : (
                      'All listings are reviewed by our team to ensure quality and accuracy. You will be notified once your listing is approved and published.'
                    )}
                  </p>
                </div>
              </div>
              </form>
            </div>
          </div>

          {/* AI Features Notice */}
          <div className="mt-12 mb-12 glass p-8 border border-neutral-600">
            <div className="text-center mb-6">
              <h3 className="text-2xl text-white font-medium mb-4">Intelligent Processing</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8 text-neutral-400">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Automatic classification into investment tiers (Main Street vs. Starter opportunities)</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Intelligent valuation estimates based on industry benchmarks and financial metrics</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Enhanced business descriptions and market positioning analysis</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full mt-3 flex-shrink-0"></div>
                  <p>Quality assessment and recommendation optimization</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollAnimation>
      </div>
      <Footer />
    </div>
  );
}