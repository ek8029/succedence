'use client';

import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 py-16 w-full bg-brand-darker border-t-2 border-gold/30">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-warm-white mb-8 tracking-refined">Connect with Succedence</h3>
          <p className="text-lg text-platinum/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Follow our journey and stay updated on the latest business acquisition opportunities and platform developments.
          </p>

          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-12">
            {/* LinkedIn */}
            <a
              href="https://linkedin.com/company/succedence"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
              LinkedIn Company Page
            </a>

            {/* Twitter/X */}
            <a
              href="https://x.com/SuccedenceSMB"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Follow @SuccedenceSMB
            </a>

            {/* Email */}
            <div className="relative group">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const dropdown = e.currentTarget.nextElementSibling;
                  dropdown.classList.toggle('hidden');

                  // Add click outside listener
                  if (!dropdown.classList.contains('hidden')) {
                    const closeDropdown = (event) => {
                      if (!e.currentTarget.contains(event.target) && !dropdown.contains(event.target)) {
                        dropdown.classList.add('hidden');
                        document.removeEventListener('click', closeDropdown);
                      }
                    };
                    setTimeout(() => document.addEventListener('click', closeDropdown), 10);
                  }
                }}
                className="flex items-center gap-3 px-6 py-3 bg-transparent border border-gold/30 text-gold hover:bg-gold/10 hover:border-gold rounded-luxury transition-all duration-300 hover:transform hover:scale-105"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                succedence@gmail.com
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="hidden absolute top-full left-0 mt-2 w-48 bg-slate border border-gold/30 rounded-luxury shadow-lg z-50">
                <button
                  onClick={(e) => {
                    const email = 'succedence@gmail.com';
                    window.location.href = `mailto:${email}`;
                    const button = e.target as HTMLElement;
                    const dropdown = button.closest('.relative')?.querySelector('div');
                    if (dropdown) dropdown.classList.add('hidden');
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gold hover:bg-gold/10 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email
                </button>
                <button
                  onClick={(e) => {
                    const email = 'succedence@gmail.com';
                    navigator.clipboard.writeText(email).then(() => {
                      // Show notification
                      const notification = document.createElement('div');
                      notification.className = 'notification fixed top-4 right-4 z-50 text-white px-6 py-4 slide-up';
                      notification.style.backgroundColor = 'var(--accent)';
                      notification.style.color = '#000';
                      notification.innerHTML = '📧 Email copied to clipboard!';
                      document.body.appendChild(notification);
                      setTimeout(() => notification.remove(), 3000);

                      // Close dropdown
                      const button = e.target as HTMLElement;
                      const dropdown = button.closest('.relative')?.querySelector('div');
                      if (dropdown) dropdown.classList.add('hidden');
                    });
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-gold hover:bg-gold/10 transition-all duration-300 border-t border-gold/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Email
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-neutral-400 border-t border-gold/10 pt-8">
            <p>&copy; 2025 Succedence. All rights reserved. Built for discerning business professionals.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}