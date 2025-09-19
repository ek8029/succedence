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
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (!formData.email.trim() || !formData.password.trim()) {
      showNotification('Please enter your email and password', 'error');
      return;
    }

    if (isSignUp) {
      if (!formData.name.trim()) {
        showNotification('Please enter your full name', 'error');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        showNotification('Passwords do not match', 'error');
        return;
      }
      if (formData.password.length < 6) {
        showNotification('Password must be at least 6 characters', 'error');
        return;
      }
    }

    try {
      // Simulate authentication (no actual backend yet)
      await signIn({
        name: formData.name.trim() || formData.email.split('@')[0],
        email: formData.email.trim(),
        role: formData.role
      });

      showNotification(
        isSignUp ? 'Account created successfully!' : 'Login successful!',
        'success'
      );
    } catch (error) {
      showNotification('Authentication failed. Please try again.', 'error');
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
          <div className="glass p-16 tier-premium">
          <div className="text-center mb-16">
            <div className="w-20 h-20 flex items-center justify-center mx-auto mb-10" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-heading text-white font-medium mb-6">
              {isSignUp ? 'Join Succedence' : 'Welcome Back'}
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto">
              {isSignUp ?
                'Create your account to access our exclusive platform for sophisticated business transactions.' :
                'Sign in to access your Succedence dashboard and opportunities.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
            {isSignUp && (
              <div className="space-y-4">
                <label htmlFor="name" className="form-label">
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
                  required={isSignUp}
                />
              </div>
            )}

            <div className="space-y-4">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control w-full py-4 px-6 text-lg"
                placeholder="Enter your email address"
                required
              />
            </div>

            <div className="space-y-4">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="form-control w-full py-4 px-6 text-lg"
                placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                required
              />
            </div>

            {isSignUp && (
              <>
                <div className="space-y-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="form-control w-full py-4 px-6 text-lg"
                    placeholder="Confirm your password"
                    required={isSignUp}
                  />
                </div>

                <div className="space-y-4">
                  <label htmlFor="role" className="form-label">
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
              </>
            )}

            <div className="pt-8 space-y-6">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-5 text-lg font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', cursor: 'pointer' }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                  </div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-neutral-400 hover:text-white transition-colors duration-200 font-medium text-lg"
                >
                  {isSignUp ?
                    'Already have an account? Sign in' :
                    "Don't have an account? Create one"
                  }
                </button>
              </div>
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
