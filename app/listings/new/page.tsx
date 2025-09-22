'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
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

  const saveDraft = async () => {
    setSubmitting(true);
    setErrors({});

    try {
      // Validate the data
      const validatedData = ListingCreateInput.parse({
        ...formData,
        revenue: formData.revenue ? parseInt(formData.revenue, 10) : 0,
        ebitda: formData.ebitda ? parseInt(formData.ebitda, 10) || null : null,
        owner_hours: formData.owner_hours ? parseInt(formData.owner_hours, 10) || null : null,
        employees: formData.employees ? parseInt(formData.employees, 10) || null : null,
        price: formData.price ? parseInt(formData.price, 10) || null : null,
      });

      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        const result = await response.json();
        setListingId(result.listing.id);

        // Upload media if any
        if (uploadedImages.length > 0) {
          await uploadMedia(result.listing.id);
        }

        showNotification('✓ Draft saved successfully', 'success');
      } else {
        const error = await response.json();
        showNotification(`✗ ${error.error || 'Failed to save draft'}`, 'error');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        (error as any).errors.forEach((err: any) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        showNotification('Please fix the errors below', 'error');
      } else {
        console.error('Error saving draft:', error);
        showNotification('Network error - please try again', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestPublish = async () => {
    if (!listingId) {
      await saveDraft();
      return;
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
        setTimeout(() => router.push('/listings'), 2000);
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

  const uploadMedia = async (listingIdParam: string) => {
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
    await saveDraft();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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
              <h1 className="text-heading text-white font-medium mb-8">Submit Business Listing</h1>
              <p className="text-2xl text-neutral-400 leading-relaxed mb-12">
                Present your business opportunity to our network of qualified investors and acquirers.
              </p>
              <Link href="/" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600">
                ← Return Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Form */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="max-w-4xl mx-auto">
            <div className="glass p-16">
              <form onSubmit={handleSubmit} className="space-y-12">
              {/* Business Overview */}
              <div className="space-y-8">
                <h2 className="text-2xl text-white font-medium border-b border-neutral-600 pb-4">
                  Business Overview
                </h2>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="title" className="block text-lg text-neutral-300 font-medium">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={`form-control-large w-full ${
                        errors.title ? 'border-red-500' : ''
                      }`}
                      placeholder="Enter business name"
                      required
                    />
                    {errors.title && (
                      <p className="text-red-400 text-sm">{errors.title}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="industry" className="block text-lg text-neutral-300 font-medium">
                      Industry *
                    </label>
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className={`form-control-large w-full ${
                        errors.industry ? 'border-red-500' : ''
                      }`}
                      required
                    >
                      <option value="">Select Industry</option>
                      <option value="SaaS">Software as a Service</option>
                      <option value="E-commerce">E-commerce & Retail</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Healthcare">Healthcare & Medical</option>
                      <option value="Technology">Technology & IT</option>
                      <option value="Financial Services">Financial Services</option>
                      <option value="Real Estate">Real Estate</option>
                      <option value="Food & Beverage">Food & Beverage</option>
                      <option value="Professional Services">Professional Services</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.industry && (
                      <p className="text-red-400 text-sm">{errors.industry}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="description" className="block text-lg text-neutral-300 font-medium">
                    Business Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className={`form-control-large w-full ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    placeholder="Provide a comprehensive description of your business, including products/services, market position, competitive advantages, and growth opportunities..."
                    required
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="city" className="block text-lg text-neutral-300 font-medium">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`form-control-large w-full ${
                        errors.city ? 'border-red-500' : ''
                      }`}
                      placeholder="City"
                      required
                    />
                    {errors.city && (
                      <p className="text-red-400 text-sm">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="state" className="block text-lg text-neutral-300 font-medium">
                      State *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`form-control-large w-full ${
                        errors.state ? 'border-red-500' : ''
                      }`}
                      placeholder="State"
                      required
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
                      className="form-control-large w-full"
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
                            <img
                              src={preview}
                              alt={`Business image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-600"
                            />
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
                      Annual Revenue (USD) *
                    </label>
                    <input
                      type="number"
                      id="revenue"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleInputChange}
                      className={`form-control-large w-full text-financial ${
                        errors.revenue ? 'border-red-500' : ''
                      }`}
                      placeholder="0"
                      min="0"
                      required
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
                      type="number"
                      id="ebitda"
                      name="ebitda"
                      value={formData.ebitda}
                      onChange={handleInputChange}
                      className="form-control-large w-full text-financial"
                      placeholder="0"
                      min="0"
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
                      className="form-control-large w-full"
                      placeholder="Hours per week"
                      min="0"
                      max="168"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="metric_type" className="block text-lg text-neutral-300 font-medium">
                      Financial Metric Type *
                    </label>
                    <select
                      id="metric_type"
                      name="metric_type"
                      value={formData.metric_type}
                      onChange={handleInputChange}
                      className="form-control-large w-full"
                      required
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
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-control-large w-full text-financial"
                    placeholder="Leave blank for AI valuation estimate"
                    min="0"
                  />
                  <p className="text-neutral-400 text-sm">
                    If left blank, our AI will provide a valuation estimate based on industry standards and financial metrics.
                  </p>
                </div>
              </div>


              {/* Submit */}
              <div className="pt-8 border-t border-neutral-600">
                <div className="text-center space-y-8">
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-secondary px-12 py-4 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Saving...' : 'Save Draft'}
                    </button>

                    {listingId && isDraft && (
                      <button
                        type="button"
                        onClick={requestPublish}
                        disabled={submitting}
                        className="btn-primary px-12 py-4 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Submitting...' : 'Submit for Review'}
                      </button>
                    )}
                  </div>

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
          <div className="mt-16 mb-16 glass p-12 border border-neutral-600">
            <div className="text-center mb-8">
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
    </div>
  );
}