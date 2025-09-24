'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [savedDropdownOpen, setSavedDropdownOpen] = useState(false);
  const [matchesDropdownOpen, setMatchesDropdownOpen] = useState(false);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as Element)?.closest('.relative')) {
        setSavedDropdownOpen(false);
        setMatchesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            {/* First row - Public links */}
            <div className="flex justify-center space-x-4">
              <Link href="/browse" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse
              </Link>
              <Link href="/success" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Success
              </Link>
              {user && (
                <Link href="/listings/new" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  List
                </Link>
              )}
            </div>

            {/* Second row - User-specific links and auth */}
            <div className="flex justify-center space-x-3">
              {user ? (
                <>
                  <div className="relative">
                    <button
                      onClick={() => setSavedDropdownOpen(!savedDropdownOpen)}
                      className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap flex items-center"
                      style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                    >
                      My Data ▼
                    </button>
                    {savedDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-midnight border border-gold/20 rounded shadow-lg py-1 min-w-[120px] z-50">
                        <Link href="/saved-listings" onClick={() => setSavedDropdownOpen(false)} className="block px-3 py-1 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                          Saved Listings
                        </Link>
                        <Link href="/ai-analysis-history" onClick={() => setSavedDropdownOpen(false)} className="block px-3 py-1 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                          AI History
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setMatchesDropdownOpen(!matchesDropdownOpen)}
                      className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap flex items-center"
                      style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                    >
                      My Match ▼
                    </button>
                    {matchesDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 bg-midnight border border-gold/20 rounded shadow-lg py-1 min-w-[120px] z-50">
                        <Link href="/preferences" onClick={() => setMatchesDropdownOpen(false)} className="block px-3 py-1 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                          Preferences
                        </Link>
                        <Link href="/matches" onClick={() => setMatchesDropdownOpen(false)} className="block px-3 py-1 text-xs text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                          Matches
                        </Link>
                      </div>
                    )}
                  </div>
                  <Link href="/profile" className="text-xs text-neutral-400 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    disabled={isLoading}
                    className="text-xs text-neutral-400 hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    Sign Out
                  </button>
                </>
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
              <Link href="/browse" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse Opportunities
              </Link>
              <Link href="/success" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Success Stories
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-6">
                <Link href="/listings/new" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  List Business
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setSavedDropdownOpen(!savedDropdownOpen)}
                    className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium flex items-center"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    My Data ▼
                  </button>
                  {savedDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-midnight border border-gold/20 rounded shadow-lg py-2 min-w-[160px] z-50">
                      <Link href="/saved-listings" onClick={() => setSavedDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        Saved Listings
                      </Link>
                      <Link href="/ai-analysis-history" onClick={() => setSavedDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        AI History
                      </Link>
                    </div>
                  )}
                </div>

                <div className="relative">
                  <button
                    onClick={() => setMatchesDropdownOpen(!matchesDropdownOpen)}
                    className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium flex items-center"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    My Matches ▼
                  </button>
                  {matchesDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 bg-midnight border border-gold/20 rounded shadow-lg py-2 min-w-[160px] z-50">
                      <Link href="/preferences" onClick={() => setMatchesDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        My Preferences
                      </Link>
                      <Link href="/matches" onClick={() => setMatchesDropdownOpen(false)} className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                        My Matches
                      </Link>
                    </div>
                  )}
                </div>

                {user.role === 'admin' && (
                  <Link href="/admin" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    Admin Dashboard
                  </Link>
                )}
              </div>
            )}

            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <Link href="/profile" className="text-right hover-lift transition-all">
                    <div className="text-sm text-white font-semibold hover:text-neutral-300" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>{user.name}</div>
                    <div className="text-xs text-neutral-400 capitalize font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif', letterSpacing: '0.05em'}}>{user.role.toLowerCase()}</div>
                  </Link>
                  <button
                    onClick={() => signOut()}
                    disabled={isLoading}
                    className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    {isLoading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing Out...</span>
                      </div>
                    ) : (
                      'Sign Out'
                    )}
                  </button>
                </>
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
