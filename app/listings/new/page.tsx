'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    owner: '',
    industry: '',
    revenue: '',
    location: '',
    employees: '',
    yearEstablished: '',
    askingPrice: '',
    ebitda: '',
    assets: '',
    liabilities: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          revenue: parseInt(formData.revenue, 10),
          employees: parseInt(formData.employees, 10) || null,
          yearEstablished: parseInt(formData.yearEstablished, 10) || null,
          askingPrice: parseInt(formData.askingPrice, 10) || null,
          ebitda: parseInt(formData.ebitda, 10) || null,
          assets: parseInt(formData.assets, 10) || null,
          liabilities: parseInt(formData.liabilities, 10) || null,
        }),
      });

      if (response.ok) {
        const newListing = await response.json();
        // Show success notification instead of alert
        const notification = document.createElement('div');
        notification.className = 'notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up';
        notification.style.backgroundColor = 'var(--accent)';
        notification.style.color = '#000';
        notification.innerHTML = '✓ Listing submitted successfully for review';
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
        
        router.push(`/listings/${newListing.id}`);
      } else {
        const error = await response.json();
        // Show error notification instead of alert
        const notification = document.createElement('div');
        notification.className = 'notification fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 slide-up';
        notification.innerHTML = `✗ ${error.error || 'Submission failed'}`;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      // Show error notification instead of alert
      const notification = document.createElement('div');
      notification.className = 'notification fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 slide-up';
      notification.innerHTML = '✗ Network error - please try again';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 4000);
    } finally {
      setSubmitting(false);
    }
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

    // Simulate upload processing (since we don't have real backend)
    setUploadedImages(prev => [...prev, ...files]);

    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreviews(prev => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Show success notification
    const notification = document.createElement('div');
    notification.className = 'notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up';
    notification.style.backgroundColor = 'var(--accent)';
    notification.style.color = '#000';
    notification.innerHTML = `✓ ${files.length} image(s) uploaded successfully`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-brand-darker">
      <div className="container-professional py-16">
        {/* Header */}
        <div className="text-center mb-20">
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

        {/* Form */}
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
                      className="form-control w-full py-4 px-6 text-lg"
                      placeholder="Enter business name"
                      required
                    />
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
                      className="form-control w-full py-4 px-6 text-lg"
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
                    className="form-control w-full py-4 px-6 text-lg"
                    placeholder="Provide a comprehensive description of your business, including products/services, market position, competitive advantages, and growth opportunities..."
                    required
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="location" className="block text-lg text-neutral-300 font-medium">
                      Primary Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-control w-full py-4 px-6 text-lg"
                      placeholder="City, State"
                    />
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
                      className="form-control w-full py-4 px-6 text-lg"
                      placeholder="Number of employees"
                      min="0"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="yearEstablished" className="block text-lg text-neutral-300 font-medium">
                      Year Established
                    </label>
                    <input
                      type="number"
                      id="yearEstablished"
                      name="yearEstablished"
                      value={formData.yearEstablished}
                      onChange={handleInputChange}
                      className="form-control w-full py-4 px-6 text-lg"
                      placeholder="YYYY"
                      min="1900"
                      max="2024"
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
                      className="form-control w-full py-4 px-6 text-lg text-financial"
                      placeholder="0"
                      min="0"
                      required
                    />
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
                      className="form-control w-full py-4 px-6 text-lg text-financial"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label htmlFor="assets" className="block text-lg text-neutral-300 font-medium">
                      Total Assets (USD)
                    </label>
                    <input
                      type="number"
                      id="assets"
                      name="assets"
                      value={formData.assets}
                      onChange={handleInputChange}
                      className="form-control w-full py-4 px-6 text-lg text-financial"
                      placeholder="0"
                      min="0"
                    />
                  </div>

                  <div className="space-y-4">
                    <label htmlFor="liabilities" className="block text-lg text-neutral-300 font-medium">
                      Total Liabilities (USD)
                    </label>
                    <input
                      type="number"
                      id="liabilities"
                      name="liabilities"
                      value={formData.liabilities}
                      onChange={handleInputChange}
                      className="form-control w-full py-4 px-6 text-lg text-financial"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label htmlFor="askingPrice" className="block text-lg text-neutral-300 font-medium">
                    Asking Price (USD)
                  </label>
                  <input
                    type="number"
                    id="askingPrice"
                    name="askingPrice"
                    value={formData.askingPrice}
                    onChange={handleInputChange}
                    className="form-control w-full py-4 px-6 text-lg text-financial"
                    placeholder="Leave blank for AI valuation estimate"
                    min="0"
                  />
                  <p className="text-neutral-400 text-sm">
                    If left blank, our AI will provide a valuation estimate based on industry standards and financial metrics.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <h2 className="text-2xl text-white font-medium border-b border-neutral-600 pb-4">
                  Contact Information
                </h2>
                
                <div className="space-y-4">
                  <label htmlFor="owner" className="block text-lg text-neutral-300 font-medium">
                    Contact Name/Company *
                  </label>
                  <input
                    type="text"
                    id="owner"
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    className="form-control w-full py-4 px-6 text-lg"
                    placeholder="Contact name or company"
                    required
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-8 border-t border-neutral-600">
                <div className="text-center space-y-8">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-20 py-5 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting for Review...' : 'Submit Listing'}
                  </button>
                  
                  <p className="text-neutral-400 text-sm max-w-2xl mx-auto">
                    All listings are reviewed by our team to ensure quality and accuracy. 
                    You will be notified once your listing is approved and published.
                  </p>
                </div>
              </div>
            </form>
          </div>

          {/* AI Features Notice */}
          <div className="mt-16 glass p-12 border border-neutral-600">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-neutral-800 border border-neutral-600 flex items-center justify-center mx-auto mb-6" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'}}>
                <div className="text-black font-bold text-lg">AI</div>
              </div>
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
        </div>
      </div>
    </div>
  );
}