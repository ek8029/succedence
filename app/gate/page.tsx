'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function GatePage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);

        // Check if user is authenticated
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        // Wait a moment to show success message
        setTimeout(() => {
          if (session) {
            router.push('/app');
          } else {
            router.push('/auth');
          }
        }, 1500);
      } else {
        setError('Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setPassword('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-gradient relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-midnight via-charcoal to-navy opacity-90"></div>
      <div className="absolute inset-0 bg-noise opacity-10"></div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass p-8 rounded-luxury-lg border-2 border-gold/30">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-semibold text-warm-white mb-4">
              Succedence
            </h1>
            <p className="text-silver/80">Enter password to access</p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-warm-white text-lg font-semibold mb-2">Access Granted!</p>
              <p className="text-silver/80 text-sm">Redirecting you...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-silver/80 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  className="form-control w-full px-4 py-3"
                  placeholder="Enter password"
                  autoFocus
                  disabled={isLoading}
                />
                {error && (
                  <p className="text-red-400 text-sm mt-2">{error}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-gradient text-midnight font-semibold py-3 px-6 rounded-lg hover:transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Enter'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
