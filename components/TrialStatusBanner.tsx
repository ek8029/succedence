'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function TrialStatusBanner() {
  const { user } = useAuth();
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  const [hoursLeft, setHoursLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!user?.trialEndsAt || user.plan !== 'free') {
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const trialEnd = new Date(user.trialEndsAt!);
      const diffMs = trialEnd.getTime() - now.getTime();

      if (diffMs <= 0) {
        setDaysLeft(0);
        setHoursLeft(0);
        return;
      }

      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      setDaysLeft(diffDays);
      setHoursLeft(diffHours);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [user]);

  // Don't show banner if user is not on trial
  if (!user || user.plan !== 'free' || !user.trialEndsAt) {
    return null;
  }

  // Don't show if trial has expired
  if (daysLeft === 0 && hoursLeft === 0) {
    return null;
  }

  const getUrgencyLevel = () => {
    if (daysLeft === null) return 'normal';
    if (daysLeft === 0) return 'critical';
    if (daysLeft === 1) return 'warning';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  const urgencyStyles = {
    normal: 'bg-blue-900/30 border-blue-400/40',
    warning: 'bg-yellow-900/30 border-yellow-400/40',
    critical: 'bg-red-900/30 border-red-400/40'
  };

  const urgencyTextColors = {
    normal: 'text-blue-200',
    warning: 'text-yellow-200',
    critical: 'text-red-200'
  };

  const urgencyIconColors = {
    normal: 'text-blue-400',
    warning: 'text-yellow-400',
    critical: 'text-red-400'
  };

  return (
    <div className={`glass rounded-luxury border-2 ${urgencyStyles[urgencyLevel]} p-4 mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-10 h-10 rounded-full bg-charcoal/50 flex items-center justify-center ${urgencyIconColors[urgencyLevel]}`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div>
            <h3 className={`font-semibold ${urgencyTextColors[urgencyLevel]}`}>
              Free Trial Active
            </h3>
            <p className="text-sm text-silver/80">
              {daysLeft !== null && hoursLeft !== null && (
                <>
                  {daysLeft > 0 ? (
                    <>
                      <span className="font-medium">{daysLeft}</span> day{daysLeft !== 1 ? 's' : ''} and{' '}
                      <span className="font-medium">{hoursLeft}</span> hour{hoursLeft !== 1 ? 's' : ''} remaining
                    </>
                  ) : (
                    <>
                      <span className="font-medium">{hoursLeft}</span> hour{hoursLeft !== 1 ? 's' : ''} remaining
                    </>
                  )}
                </>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/subscribe"
          className="btn-primary px-4 py-2 text-sm whitespace-nowrap"
        >
          Subscribe Now
        </Link>
      </div>

      <div className="mt-3 pt-3 border-t border-silver/10">
        <p className="text-xs text-silver/60">
          After your trial ends, you'll be automatically subscribed to the <span className="font-medium text-warm-white">Starter Plan</span> at $49.99/month to continue accessing the platform.
        </p>
      </div>
    </div>
  );
}
