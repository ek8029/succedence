'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function BetaSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    role: 'buyer' as 'buyer' | 'seller' | 'broker',
    interests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/beta-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit beta signup');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password === 'Succedence123!') {
      // Redirect to /auth on success
      window.location.href = '/auth';
    } else {
      setPasswordError('Incorrect password');
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10">
        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 max-w-3xl">

          {/* Centered Branding */}
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-warm-white tracking-refined">
              Succedence
            </h1>
          </div>
          {submitted ? (
            <div className="glass p-12 rounded-luxury-lg border-2 border-gold/30 text-center">
              <div className="mb-6">
                <svg className="w-20 h-20 text-gold mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-serif font-semibold text-warm-white mb-4">
                You're on the List!
              </h2>
              <p className="text-silver/80 text-lg">
                Thank you for your interest in Succedence. We'll be in touch soon with early access details.
              </p>
            </div>
          ) : (
            <div className="glass p-8 md:p-12 rounded-luxury-lg border-2 border-gold/30">
              <div className="text-center mb-10">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-gold/10 border border-gold/30 text-gold rounded-full text-xs font-medium tracking-wide">
                    LIMITED BETA ACCESS
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-semibold text-warm-white mb-4 tracking-refined">
                  Join the Beta
                </h1>
                <p className="text-silver/80 text-lg leading-relaxed">
                  Be among the first to experience the future of business acquisitions with AI-powered insights
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-silver/80 text-sm font-medium mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-control w-full px-4 py-3"
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-silver/80 text-sm font-medium mb-2">
                      Email Address <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-control w-full px-4 py-3"
                      placeholder="john@company.com"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">
                    Company (Optional)
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="form-control w-full px-4 py-3"
                    placeholder="Your Company"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">
                    I'm interested as a...
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-control w-full px-4 py-3"
                    disabled={isSubmitting}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="broker">Broker</option>
                  </select>
                </div>

                <div>
                  <label className="block text-silver/80 text-sm font-medium mb-2">
                    What interests you most? (Optional)
                  </label>
                  <textarea
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    className="form-control w-full px-4 py-3"
                    placeholder="E.g., AI analysis tools, specific industries, deal size range..."
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-luxury">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-accent-gradient text-midnight font-semibold py-4 px-6 rounded-luxury hover:transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gold/30 hover:border-gold hover:shadow-gold-glow"
                >
                  {isSubmitting ? 'Submitting...' : 'Request Beta Access'}
                </button>

                <p className="text-silver/60 text-sm text-center">
                  By signing up, you agree to receive updates about Succedence beta access
                </p>
              </form>

              {/* Admin Access Link */}
              <div className="mt-8 pt-8 border-t border-silver/10 text-center">
                <p className="text-silver/60 text-sm mb-3">Already have access?</p>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gold/30 text-silver hover:text-warm-white hover:border-gold/60 hover:bg-gold/5 transition-all duration-300"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>Enter with Password</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass p-8 rounded-luxury-lg border-2 border-gold/30 max-w-md w-full relative">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setPasswordError('');
                }}
                className="absolute top-4 right-4 text-silver/60 hover:text-warm-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="text-center mb-6">
                <h3 className="text-2xl font-serif font-semibold text-warm-white mb-2">
                  Admin Access
                </h3>
                <p className="text-silver/80 text-sm">Enter password to access the platform</p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError('');
                    }}
                    className="form-control w-full px-4 py-3"
                    placeholder="Enter password"
                    autoFocus
                  />
                  {passwordError && (
                    <p className="text-red-400 text-sm mt-2">{passwordError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-accent-gradient text-midnight font-semibold py-3 px-6 rounded-luxury hover:transform hover:scale-105 transition-all duration-300 border-2 border-gold/30 hover:border-gold"
                >
                  Access Platform
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
