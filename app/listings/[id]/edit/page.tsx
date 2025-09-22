'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import ScrollAnimation from '@/components/ScrollAnimation';
import { ListingUpdateInput } from '@/lib/validation/listings';
import { z } from 'zod';

interface Listing {
  id: string;
  title: string;
  description: string;
  industry: string;
  city: string;
  state: string;
  revenue: number;
  ebitda: number | null;
  metric_type: string;
  owner_hours: number | null;
  employees: number | null;
  price: number | null;
  status: string;
  media: Array<{
    id: string;
    url: string;
    signed_url?: string;
    kind: string;
  }>;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<Listing | null>(null);
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
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) {
        if (response.status === 403) {
          showNotification('You do not have permission to edit this listing', 'error');
          router.push('/listings');
          return;
        }
        throw new Error('Failed to fetch listing');
      }

      const data = await response.json();
      const listing = data.listing;

      setListing(listing);
      setFormData({
        title: listing.title || '',
        description: listing.description || '',
        industry: listing.industry || '',
        city: listing.city || '',
        state: listing.state || '',
        revenue: listing.revenue?.toString() || '',
        ebitda: listing.ebitda?.toString() || '',
        metric_type: listing.metric_type || 'annual',
        owner_hours: listing.owner_hours?.toString() || '',
        employees: listing.employees?.toString() || '',
        price: listing.price?.toString() || '',
      });

      // Check if listing can be edited
      if (!['draft', 'rejected'].includes(listing.status)) {
        showNotification('This listing cannot be edited in its current status', 'error');
        router.push('/listings');
        return;
      }
    } catch (error) {
      console.error('Error fetching listing:', error);
      showNotification('Failed to load listing', 'error');
      router.push('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const updateListing = async () => {
    setSubmitting(true);
    setErrors({});

    try {
      // Validate the data
      const validatedData = ListingUpdateInput.parse({
        ...formData,
        revenue: formData.revenue ? parseInt(formData.revenue, 10) : 0,
        ebitda: formData.ebitda ? parseInt(formData.ebitda, 10) || null : null,
        owner_hours: formData.owner_hours ? parseInt(formData.owner_hours, 10) || null : null,
        employees: formData.employees ? parseInt(formData.employees, 10) || null : null,
        price: formData.price ? parseInt(formData.price, 10) || null : null,
      });

      const response = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validatedData),
      });

      if (response.ok) {
        // Upload new media if any
        if (uploadedImages.length > 0) {
          await uploadMedia();
        }

        showNotification('✓ Listing updated successfully', 'success');

        // Refresh listing data
        await fetchListing();

        // Clear uploaded images after successful update
        setUploadedImages([]);
        setImagePreviews([]);
      } else {
        const error = await response.json();
        showNotification(`✗ ${error.error || 'Failed to update listing'}`, 'error');
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
        console.error('Error updating listing:', error);
        showNotification('Network error - please try again', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const requestPublish = async () => {
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

  const uploadMedia = async () => {
    for (const file of uploadedImages) {
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/listings/${listingId}/media`, {
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

  const deleteMedia = async (mediaId: string) => {
    try {
      const response = await fetch(`/api/listings/${listingId}/media`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mediaId }),
      });

      if (response.ok) {
        showNotification('✓ Image deleted', 'success');
        await fetchListing(); // Refresh to update media list
      } else {
        const error = await response.json();
        showNotification(`✗ ${error.error || 'Failed to delete image'}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      showNotification('Network error - please try again', 'error');
    }
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

  const removeNewImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
    await updateListing();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-white font-medium mb-4">Loading listing...</div>
          <div className="w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-brand-darker flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-white font-medium mb-4">Listing not found</div>
          <Link href="/listings" className="btn-primary px-6 py-3">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional pb-16 page-content-large">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-20 mt-24">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-heading text-white font-medium mb-8">Edit Listing</h1>
              <p className="text-2xl text-neutral-400 leading-relaxed mb-12">
                Update your business information and manage media files.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/listings" className="glass px-8 py-3 font-medium text-white hover-lift transition-all border border-neutral-600">
                  ← Back to Listings
                </Link>
                <div className={`px-4 py-2 rounded text-sm font-medium ${
                  listing.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' :
                  listing.status === 'rejected' ? 'bg-red-600/20 text-red-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  Status: {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                </div>
              </div>
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
                    placeholder="Provide a comprehensive description of your business..."
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

                {/* Existing Images */}
                {listing.media && listing.media.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg text-white font-medium">Current Images ({listing.media.length})</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {listing.media.map((media) => (
                        <div key={media.id} className="relative group">
                          <img
                            src={media.signed_url || media.url}
                            alt="Business image"
                            className="w-full h-32 object-cover rounded-lg border border-neutral-600"
                          />
                          <button
                            type="button"
                            onClick={() => deleteMedia(media.id)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm hover:bg-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  <p className="text-neutral-400">
                    Upload additional images of your business including logo, facility photos, products, or operations.
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
                          <div className="text-lg text-white font-medium">Upload More Images</div>
                          <div className="text-neutral-400 text-sm mt-2">
                            Click to browse or drag and drop<br/>
                            PNG, JPG, or GIF up to 10MB each
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* New Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg text-white font-medium">New Images to Upload ({imagePreviews.length})</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`New business image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-neutral-600"
                            />
                            <button
                              type="button"
                              onClick={() => removeNewImage(index)}
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
                      {submitting ? 'Updating...' : 'Update Listing'}
                    </button>

                    {listing.status === 'draft' && (
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
                    {listing.status === 'draft' ? (
                      'Save changes and submit for admin review when ready.'
                    ) : listing.status === 'rejected' ? (
                      'Update your listing based on feedback and resubmit for review.'
                    ) : (
                      'Update your listing information and media files.'
                    )}
                  </p>
                </div>
              </div>
              </form>
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}