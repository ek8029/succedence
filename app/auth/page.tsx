'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { showNotification } from '@/components/Notification';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoading, signIn } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    role: 'BUYER' as 'BUYER' | 'SELLER' | 'ADMIN'
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showNotification('Please enter your full name', 'error');
      return;
    }

    try {
      await signIn({
        name: formData.name.trim(),
        role: formData.role
      });
    } catch (error) {
      // Error handling is done in the auth context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-brand-darker flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <ScrollAnimation direction="fade">
          <div className="glass p-16">
          <div className="text-center mb-16">
            <div className="w-20 h-20 bg-neutral-800 border border-neutral-600 flex items-center justify-center mx-auto mb-10" style={{backgroundColor: 'var(--accent)', borderColor: 'var(--accent)'}}>
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-heading text-white font-medium mb-6">Welcome to DealSense</h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto">
              Enter your details to access our exclusive platform for sophisticated business transactions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 max-w-lg mx-auto">
            <div className="space-y-4">
              <label htmlFor="name" className="block text-lg text-neutral-300 font-medium">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control w-full py-4 px-6 text-lg"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="role" className="block text-lg text-neutral-300 font-medium">
                Your Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                className="form-control w-full py-4 px-6 text-lg"
                required
              >
                <option value="BUYER">Investor — Seeking acquisition opportunities</option>
                <option value="SELLER">Business Owner — Considering divestiture</option>
                <option value="ADMIN">Administrator — Platform management</option>
              </select>
            </div>

            <div className="pt-8">
              <button
                type="submit"
                disabled={isLoading || !formData.name.trim()}
                className="btn-primary w-full py-5 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </div>
                ) : (
                  'Enter Platform'
                )}
              </button>
            </div>
          </form>

          <div className="mt-16 text-center">
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors duration-200 font-medium text-lg">
              ← Return Home
            </Link>
          </div>
          </div>
        </ScrollAnimation>
      </div>
    </div>
  );
}
