'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'user' | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const handleMouseEnter = () => {
    // Clear any existing timeout
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown('user');
  };

  const handleMouseLeave = () => {
    // Add a small delay before closing to prevent accidental closes
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  return (
    <nav className="header-professional px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-50">
      <div className="container-professional">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Top row - Logo */}
          <div className="flex justify-center items-center mb-2">
            <Link href="/" className="flex items-center group hover-lift">
              <span className="text-lg text-white font-semibold tracking-tight" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Succedence
              </span>
            </Link>
          </div>

          {/* Navigation Links - Simplified for mobile */}
          <div className="flex flex-col space-y-1.5">
            {/* Simplified Mobile Navigation */}
            <div className="flex justify-center items-center space-x-4">
              {user && (
                <Link href="/app" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  Dashboard
                </Link>
              )}
              <Link href="/browse" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse
              </Link>
              <Link href="/saved-listings" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Saved
              </Link>
              {user && (
                <Link href="/listings/new" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  List
                </Link>
              )}

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === 'user' ? null : 'user')}
                    className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap flex items-center"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    {user.name || 'Menu'} ▼
                  </button>
                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-1 bg-midnight border border-gold/20 rounded shadow-lg py-2 min-w-[140px] z-50">
                      <Link href="/profile" onClick={() => setActiveDropdown(null)} className="block px-3 py-2 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        Profile
                      </Link>
                      <Link href="/preferences" onClick={() => setActiveDropdown(null)} className="block px-3 py-2 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        Preferences
                      </Link>
                      {user.role === 'admin' && (
                        <Link href="/admin" onClick={() => setActiveDropdown(null)} className="block px-3 py-2 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                          Admin
                        </Link>
                      )}
                      <div className="border-t border-gold/20 my-1"></div>
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          signOut();
                        }}
                        disabled={isLoading}
                        className="block w-full text-left px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-xs bg-gold/20 border border-gold/40 text-gold hover:bg-gold hover:text-midnight px-3 py-1.5 font-semibold rounded transition-all duration-200 flex items-center"
                  style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          <Link href="/" className="flex items-center group hover-lift">
            <span className="text-2xl text-white font-semibold tracking-tight" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
              Succedence
            </span>
          </Link>

          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-6">
              {user && (
                <Link href="/app" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  Dashboard
                </Link>
              )}
              <Link href="/browse" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse Opportunities
              </Link>
              <Link href="/saved-listings" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Saved Listings
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-6">
                <Link href="/listings/new" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  List Business
                </Link>
                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    Admin
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center space-x-6">
              {user ? (
                <div
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className="flex items-center space-x-2 text-right hover-lift transition-all">
                    <div>
                      <div className="text-sm text-white font-semibold hover:text-neutral-300" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>{user.name}</div>
                      <div className="text-xs text-neutral-400 capitalize font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif', letterSpacing: '0.05em'}}>{user.role.toLowerCase()}</div>
                    </div>
                    <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {activeDropdown === 'user' && (
                    <div className="absolute top-full right-0 mt-2 bg-midnight border border-gold/20 rounded shadow-lg py-2 min-w-[160px] z-50">
                      <Link href="/profile" className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        Profile
                      </Link>
                      <Link href="/preferences" className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        Preferences
                      </Link>
                      <div className="border-t border-gold/20 my-1"></div>
                      <button
                        onClick={() => {
                          setActiveDropdown(null);
                          signOut();
                        }}
                        disabled={isLoading}
                        className="block w-full text-left px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                      >
                        {isLoading ? 'Signing Out...' : 'Sign Out'}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth"
                  className="text-sm bg-gold/20 border border-gold/40 text-gold hover:bg-gold hover:text-midnight px-4 py-2 font-semibold rounded transition-all duration-200 flex items-center"
                  style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
