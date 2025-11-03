'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { showNotification } from '@/components/Notification';
import ScrollAnimation from '@/components/ScrollAnimation';
import Footer from '@/components/Footer';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Check if we have the required tokens/session for password reset
    const hashParams = new URLSearchParams(window.location.hash?.substring(1) || '');
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      setError('Invalid or expired reset link. Please request a new password reset.');
    }
  }, []);

  const calculatePasswordStrength = (password: string) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 8) return 'fair';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) return 'strong';
    return 'good';
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordStrength(calculatePasswordStrength(newPassword));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSubmitting) return;

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(password);

      if (error) {
        setError(error);
        return;
      }

      setSuccess(true);
      showNotification('Password updated successfully! Redirecting to sign in...', 'success');

      // Redirect to auth page after success
      setTimeout(() => {
        router.push('/login');
      }, 3000);

    } catch (error: any) {
      setError(error.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>

        <div className="relative z-10 text-center max-w-lg px-4">
          <ScrollAnimation direction="fade">
            <div className="glass p-8 rounded-luxury border border-green-400/30">
              <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h1 className="text-2xl font-serif font-semibold text-warm-white mb-4">
                Password Updated Successfully!
              </h1>

              <p className="text-silver/80 text-sm leading-relaxed mb-6">
                Your password has been updated. You will be redirected to the sign in page shortly.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center px-6 py-3 bg-accent-gradient text-midnight rounded-luxury font-medium hover:transform hover:scale-105 transition-all duration-300"
              >
                Go to Sign In
              </Link>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 flex flex-col items-center justify-start px-4 pt-24 pb-20">
        <div className="w-full max-w-2xl">
          <ScrollAnimation direction="fade">
            <div className="bg-charcoal/80 backdrop-blur-sm p-8 border border-gold/50 rounded-luxury">
              <div className="text-center mb-8">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
                  <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 12H9v4a6 6 0 01-6-6V9a2 2 0 012-2h2.343M11 1l2 2-2 2m0-4v4" />
                  </svg>
                </div>
                <h1 className="text-heading text-white font-medium mb-4">
                  Reset Your Password
                </h1>
                <p className="text-xl text-neutral-400 leading-relaxed max-w-xl mx-auto">
                  Enter your new password below. Make sure it&apos;s secure and something you&apos;ll remember.
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="max-w-lg mx-auto mb-6 p-4 rounded-lg bg-red-600/20 border border-red-500/30">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium text-red-400">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
                <div className="space-y-4">
                  <label htmlFor="password" className="form-label">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className="form-control w-full py-4 px-6 pr-12 text-lg"
                      placeholder="Enter your new password (min 6 characters)"
                      required
                      disabled={isSubmitting}
                      aria-describedby="password-help password-strength"
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
                    Minimum 6 characters. Use uppercase, numbers for stronger security.
                  </p>
                  {passwordStrength && (
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

                <div className="space-y-4">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="form-control w-full py-4 px-6 pr-12 text-lg"
                      placeholder="Confirm your new password"
                      required
                      disabled={isSubmitting}
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
                    Re-enter your new password to confirm
                  </p>
                </div>

                <div className="pt-8 space-y-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3 text-base font-medium focus-ring hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating Password...</span>
                      </div>
                    ) : (
                      'Update Password'
                    )}
                  </button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-neutral-400 hover:text-white transition-colors duration-200 font-medium text-lg"
                    >
                      Back to Sign In
                    </Link>
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
      <Footer />
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
        <div className="absolute inset-0 bg-noise opacity-10"></div>
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-xl text-white font-medium">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}