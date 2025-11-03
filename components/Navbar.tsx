'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'user' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Determine which nav items are active based on current page
  const isActivePage = (path: string) => pathname === path;

  // Helper function to get link classes based on active state
  const getLinkClasses = (path: string, baseClasses: string = '') => {
    const isActive = isActivePage(path);
    return `${baseClasses} text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
      isActive ? 'text-gold' : 'text-neutral-400 hover:text-gold'
    }`;
  };

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

  // Hide navbar on /gate route
  if (pathname === '/gate') {
    return null;
  }

  return (
    <nav className="header-professional px-3 sm:px-6 py-2 sm:py-3 sticky top-0 z-50">
      <div className="container-professional">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center group hover-lift">
              <span className="text-lg text-white font-semibold tracking-tight" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Succedence
              </span>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:text-gold transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full bg-midnight border-t border-gold/20 shadow-lg py-4 px-4 space-y-3">
              {user && (
                <Link
                  href="/app"
                  onClick={() => setMobileMenuOpen(false)}
                  className={getLinkClasses('/app', 'block py-2')}
                  style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/browse"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/browse', 'block py-2')}
                style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
              >
                Browse Opportunities
              </Link>
              <Link
                href="/brokers"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/brokers', 'block py-2')}
                style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
              >
                Find Brokers
              </Link>
              <Link
                href="/saved-listings"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/saved-listings', 'block py-2')}
                style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
              >
                Saved Listings
              </Link>
              {user && (
                <>
                  <Link
                    href="/listings/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/listings/new', 'block py-2')}
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    List Business
                  </Link>
                  <Link
                    href="/matches"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/matches', 'block py-2')}
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    My Matches
                  </Link>
                  <div className="border-t border-gold/20 my-2"></div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium py-2"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/preferences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium py-2"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    Preferences
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium py-2"
                      style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-gold/20 my-2"></div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    disabled={isLoading}
                    className="block w-full text-left text-sm text-neutral-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <Link
                  href="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-gold/20 border border-gold/40 text-gold hover:bg-gold hover:text-midnight px-4 py-3 font-semibold rounded transition-all duration-200 mt-4"
                  style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                >
                  Sign In
                </Link>
              )}
            </div>
          )}
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
                <Link href="/app" className={getLinkClasses('/app')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  Dashboard
                </Link>
              )}
              <Link href="/browse" className={getLinkClasses('/browse')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse Opportunities
              </Link>
              <Link href="/brokers" className={getLinkClasses('/brokers')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Find Brokers
              </Link>
              {user && (
                <Link href="/matches" className={getLinkClasses('/matches')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  My Matches
                </Link>
              )}
              <Link href="/saved-listings" className={getLinkClasses('/saved-listings')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Saved Listings
              </Link>
            </div>

            {user && (
              <div className="flex items-center space-x-6">
                <Link href="/listings/new" className={getLinkClasses('/listings/new')} style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  List Business
                </Link>
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
                      {user.role === 'admin' && (
                        <>
                          <div className="border-t border-gold/20 my-1"></div>
                          <Link href="/admin" className="block px-4 py-2 text-sm text-neutral-400 hover:text-gold hover:bg-gold/10 transition-colors" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                            Admin Panel
                          </Link>
                        </>
                      )}
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
