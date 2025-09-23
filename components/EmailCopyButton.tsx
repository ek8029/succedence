'use client';

import React, { useState } from 'react';

interface EmailCopyButtonProps {
  email?: string;
  className?: string;
  buttonText?: string;
  showEmail?: boolean;
}

export default function EmailCopyButton({
  email = 'founder@succedence.com',
  className = '',
  buttonText,
  showEmail = true
}: EmailCopyButtonProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleEmailCopy = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      await navigator.clipboard.writeText(email);
      setCopySuccess(true);
      setShowNotification(true);

      // Hide notification after 2 seconds
      setTimeout(() => {
        setShowNotification(false);
        setCopySuccess(false);
      }, 2000);
    } catch (error) {
      // Fallback for browsers that don't support clipboard API
      console.error('Clipboard copy failed:', error);

      // Create a temporary input element to copy the text
      const tempInput = document.createElement('input');
      tempInput.value = email;
      document.body.appendChild(tempInput);
      tempInput.select();

      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setShowNotification(true);

        setTimeout(() => {
          setShowNotification(false);
          setCopySuccess(false);
        }, 2000);
      } catch (fallbackError) {
        // Ultimate fallback - show alert
        alert(`Email address: ${email}\n\nPlease copy this manually.`);
      } finally {
        document.body.removeChild(tempInput);
      }
    }
  };

  const displayText = buttonText || (showEmail ? email : 'Contact Us');

  return (
    <div className="relative">
      <button
        onClick={handleEmailCopy}
        className={`flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105 ${className}`}
        aria-label={`Copy ${email} to clipboard`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        {displayText}
      </button>

      {/* Success notification with proper z-index and positioning */}
      {showNotification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium shadow-lg z-[9999] pointer-events-none">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            ✓ Email copied to clipboard!
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for programmatic email copying
export function useEmailCopy(email: string = 'founder@succedence.com') {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const copyEmail = async () => {
    setIsLoading(true);

    try {
      await navigator.clipboard.writeText(email);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (error) {
      console.error('Email copy failed:', error);
      alert(`Email address: ${email}\n\nPlease copy this manually.`);
    } finally {
      setIsLoading(false);
    }
  };

  return { copyEmail, isLoading, success };
}