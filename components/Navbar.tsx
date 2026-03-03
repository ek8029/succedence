'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [activeDropdown, setActiveDropdown] = useState<'user' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine which nav items are active based on current page
  const isActivePage = (path: string) => pathname === path;

  // Helper function to get link classes based on active state
  const getLinkClasses = (path: string, baseClasses: string = '') => {
    const isActive = isActivePage(path);
    return `${baseClasses} text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
      isActive ? 'text-accent-color' : 'text-text-secondary hover:text-text-primary'
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
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setActiveDropdown('user');
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  // Hide navbar on /beta route
  if (pathname === '/beta') {
    return null;
  }

  return (
    <nav
      className={`px-3 sm:px-6 py-3 sticky top-0 z-50 transition-all duration-200 ${
        isScrolled ? 'bg-surface-color/95 backdrop-blur-sm border-b border-text-secondary/20' : 'bg-surface-color'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="text-lg text-text-primary font-serif font-bold tracking-tight">
                Succedence
              </span>
            </Link>

            {/* Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-text-primary p-2 hover:text-accent-color transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="absolute left-0 right-0 top-full bg-surface-color border-t border-text-secondary/20 shadow-lg py-4 px-4 space-y-3">
              {/* Primary CTA */}
              <Link
                href="/valuation"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-accent-color text-white hover:bg-[#E6A238] px-4 py-3 font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                Get Your Defensible Valuation →
              </Link>

              <div className="border-t border-text-secondary/20 my-2"></div>

              {/* Main Navigation */}
              <Link
                href="/how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/how-it-works', 'block py-2')}
              >
                How It Works
              </Link>
              <Link
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/pricing', 'block py-2')}
              >
                Pricing
              </Link>
              <Link
                href="/how-it-works#methodology"
                onClick={() => setMobileMenuOpen(false)}
                className={getLinkClasses('/how-it-works#methodology', 'block py-2')}
              >
                Methodology
              </Link>

              {user && (
                <>
                  <div className="border-t border-text-secondary/20 my-2"></div>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/dashboard', 'block py-2')}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/browse"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/browse', 'block py-2')}
                  >
                    Browse Businesses
                  </Link>
                  <Link
                    href="/matches"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/matches', 'block py-2')}
                  >
                    My Matches
                  </Link>
                  <Link
                    href="/saved-listings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/saved-listings', 'block py-2')}
                  >
                    Saved Listings
                  </Link>
                  <div className="border-t border-text-secondary/20 my-2"></div>
                  <Link
                    href="/listings/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className={getLinkClasses('/listings/new', 'block py-2')}
                  >
                    List a Business
                  </Link>
                  <div className="border-t border-text-secondary/20 my-2"></div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium py-2"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/preferences"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium py-2"
                  >
                    Preferences
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block text-sm text-text-secondary hover:text-text-primary transition-colors duration-200 font-medium py-2"
                    >
                      Admin
                    </Link>
                  )}
                  <div className="border-t border-text-secondary/20 my-2"></div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut();
                    }}
                    disabled={isLoading}
                    className="block w-full text-left text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed py-2"
                  >
                    Sign Out
                  </button>
                </>
              )}
              {!user && (
                <>
                  <div className="border-t border-text-secondary/20 my-2"></div>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center text-text-secondary hover:text-text-primary px-4 py-2 font-medium transition-colors duration-200"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <span className="text-2xl text-text-primary font-serif font-bold tracking-tight">
              Succedence
            </span>
          </Link>

          {/* Center Navigation */}
          <div className="flex items-center space-x-8">
            <Link
              href="/how-it-works"
              className={getLinkClasses('/how-it-works')}
            >
              How It Works
            </Link>
            <Link
              href="/pricing"
              className={getLinkClasses('/pricing')}
            >
              Pricing
            </Link>
            <Link
              href="/how-it-works#methodology"
              className={getLinkClasses('/how-it-works#methodology')}
            >
              Methodology
            </Link>
          </div>

          {/* Right Side - CTA + Auth */}
          <div className="flex items-center space-x-4">
            {/* Primary CTA - Matches homepage styling */}
            <Link
              href="/valuation"
              className="group inline-flex items-center justify-center px-6 h-12 bg-accent-color text-white font-semibold rounded-lg transition-all duration-200 hover:bg-[#E6A238] hover:-translate-y-0.5 active:scale-[0.97] shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color text-sm"
              aria-label="Get your free defensible valuation"
            >
              Get Your Defensible Valuation
              <svg
                className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>

            {/* User Menu or Login */}
            {user ? (
              <div
                className="relative"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button className="flex items-center space-x-2 text-right transition-all focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color rounded-lg px-2 py-1">
                  <div>
                    <div className="text-sm text-text-primary font-semibold hover:text-accent-color transition-colors">{user.name}</div>
                    <div className="text-xs text-text-secondary capitalize font-medium">{user.role.toLowerCase()}</div>
                  </div>
                  <svg className="w-4 h-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeDropdown === 'user' && (
                  <div className="absolute top-full right-0 mt-2 bg-surface-color border border-text-secondary/20 rounded-lg shadow-lg py-2 min-w-[180px] z-50">
                    <Link href="/dashboard" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      Dashboard
                    </Link>
                    <Link href="/browse" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      Browse Businesses
                    </Link>
                    <Link href="/matches" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      My Matches
                    </Link>
                    <Link href="/saved-listings" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      Saved Listings
                    </Link>
                    <div className="border-t border-text-secondary/20 my-1"></div>
                    <Link href="/listings/new" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      List a Business
                    </Link>
                    <div className="border-t border-text-secondary/20 my-1"></div>
                    <Link href="/profile" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      Profile
                    </Link>
                    <Link href="/preferences" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                      Preferences
                    </Link>
                    {user.role === 'admin' && (
                      <>
                        <div className="border-t border-text-secondary/20 my-1"></div>
                        <Link href="/admin" className="block px-4 py-2 text-sm text-text-secondary hover:text-accent-color hover:bg-accent-color/10 transition-colors">
                          Admin Panel
                        </Link>
                      </>
                    )}
                    <div className="border-t border-text-secondary/20 my-1"></div>
                    <button
                      onClick={() => {
                        setActiveDropdown(null);
                        signOut();
                      }}
                      disabled={isLoading}
                      className="block w-full text-left px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-red-900/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Signing Out...' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-accent-color focus:ring-offset-2 focus:ring-offset-surface-color rounded px-2 py-1"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
