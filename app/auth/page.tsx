'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { showNotification } from '@/components/Notification';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function AuthPage() {
  const router = useRouter();
  const { user, isLoading, signUp, signInWithEmail } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer' as 'buyer' | 'seller' | 'admin',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

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
      if (isSignUp) {
        // Use Supabase sign up
        const { error } = await signUp(
          formData.email.trim(),
          formData.password,
          {
            name: formData.name.trim(),
            role: formData.role
          }
        );

        if (error) {
          showNotification(error, 'error');
          return;
        }
      } else {
        // Use Supabase sign in
        const { error } = await signInWithEmail(
          formData.email.trim(),
          formData.password
        );

        if (error) {
          showNotification(error, 'error');
          return;
        }
      }
    } catch (error) {
      showNotification('Authentication failed. Please try again.', 'error');
    }
  };

  const calculatePasswordStrength = (password: string) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'good';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (name === 'password' && isSignUp) {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  return (
    <div className="min-h-screen bg-brand-darker flex flex-col items-center justify-start px-4 pt-20 pb-20">
      <div className="w-full max-w-2xl">
        <ScrollAnimation direction="fade">
          <div className="glass p-8 tier-premium">
          <div className="text-center mb-8">
            <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
              <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-heading text-white font-medium mb-4">
              {isSignUp ? 'Join Succedence' : 'Welcome Back'}
            </h1>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto">
              {isSignUp ?
                'Create your account to access our exclusive platform for sophisticated business transactions.' :
                'Sign in to access your Succedence dashboard and opportunities.'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto" noValidate>
            <fieldset className="space-y-4">
              <legend className="sr-only">
                {isSignUp ? 'Create Account Information' : 'Sign In Credentials'}
              </legend>

              {isSignUp && (
                <div className="space-y-4">
                  <label htmlFor="name" className="form-label">
                    Full Name *
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
                    aria-describedby={isSignUp ? "name-help" : undefined}
                  />
                  {isSignUp && (
                    <p id="name-help" className="text-sm text-neutral-400">
                      This will be your display name on the platform
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-4">
                <label htmlFor="email" className="form-label">
                  Email Address *
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
                  aria-describedby="email-help"
                />
                <p id="email-help" className="text-sm text-neutral-400">
                  We&apos;ll use this to send you important account notifications
                </p>
              </div>

              <div className="space-y-4">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-control w-full py-4 px-6 pr-12 text-lg"
                    placeholder={isSignUp ? "Create a password (min 6 characters)" : "Enter your password"}
                    required
                    aria-describedby={isSignUp ? "password-help password-strength" : "password-help"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white focus:text-white focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p id="password-help" className="text-sm text-neutral-400">
                  {isSignUp ? "Minimum 6 characters. Use uppercase, numbers for stronger security." : "Enter your account password"}
                </p>
                {isSignUp && passwordStrength && (
                  <div id="password-strength" className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-neutral-400">Strength:</span>
                      <span className={`text-sm font-medium ${
                        passwordStrength === 'weak' ? 'text-red-400' :
                        passwordStrength === 'fair' ? 'text-yellow-400' :
                        passwordStrength === 'good' ? 'text-blue-400' : 'text-green-400'
                      }`}>
                        {passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-700 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full transition-all ${
                          passwordStrength === 'weak' ? 'w-1/4 bg-red-400' :
                          passwordStrength === 'fair' ? 'w-2/4 bg-yellow-400' :
                          passwordStrength === 'good' ? 'w-3/4 bg-blue-400' : 'w-full bg-green-400'
                        }`}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {isSignUp && (
                <div className="space-y-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-control w-full py-4 px-6 pr-12 text-lg"
                      placeholder="Confirm your password"
                      required={isSignUp}
                      aria-describedby="confirm-password-help"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-white focus:text-white focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  <p id="confirm-password-help" className="text-sm text-neutral-400">
                    Re-enter your password to confirm
                  </p>
                </div>
              )}
            </fieldset>

            {isSignUp && (
              <fieldset className="space-y-6">
                <legend className="form-label mb-4">Account Type</legend>
                <div className="space-y-4">
                  <label htmlFor="role" className="form-label">
                    Your Role *
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="form-control w-full py-4 px-6 text-lg"
                    required
                    aria-describedby="role-help"
                  >
                    <option value="buyer">Investor — Seeking acquisition opportunities</option>
                    <option value="seller">Business Owner — Considering divestiture</option>
                    <option value="admin">Administrator — Platform management</option>
                  </select>
                  <p id="role-help" className="text-sm text-neutral-400">
                    Choose the option that best describes your intended use of the platform
                  </p>
                </div>
              </fieldset>
            )}

            {!isSignUp && (
              <fieldset className="space-y-4">
                <legend className="sr-only">Sign In Options</legend>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-gold bg-neutral-800 border-neutral-600 rounded focus:ring-gold focus:ring-2"
                  />
                  <label htmlFor="rememberMe" className="ml-3 text-sm text-neutral-300">
                    Remember me for 30 days
                  </label>
                </div>
              </fieldset>
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
