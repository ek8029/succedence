'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();
  const [showBrowseLink, setShowBrowseLink] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only apply scroll behavior on homepage
    if (pathname !== '/') {
      setShowBrowseLink(true);
      return;
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const heroHeight = window.innerHeight; // Assuming hero is full viewport height

      // Show browse link after scrolling past 70% of hero section
      setShowBrowseLink(scrollTop > heroHeight * 0.7);
    };

    // Initial check
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return (
    <nav className="header-professional px-6 py-4 sticky top-0 z-50">
      <div className="container-professional flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-4 group hover-lift">
          <div className="w-10 h-10 bg-white border border-neutral-300 flex items-center justify-center transition-all group-hover:border-neutral-100">
            <span className="text-black font-bold text-xl">D</span>
          </div>
          <span className="text-2xl text-white font-semibold tracking-tight" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
            DealSense
          </span>
        </Link>
        
        <div className="flex items-center space-x-6">
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              showBrowseLink
                ? 'max-w-2xl opacity-100 translate-x-0'
                : 'max-w-0 opacity-0 -translate-x-4'
            }`}
          >
            <div className="flex items-center space-x-6">
              <Link href="/browse" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse Opportunities
              </Link>
              <Link href="/success" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium whitespace-nowrap" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Success Stories
              </Link>
            </div>
          </div>
          
          {user && (
            <div className="flex items-center space-x-6">
              <Link href="/listings/new" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                List Business
              </Link>

              <Link href="/preferences" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                My Preferences
              </Link>

              {user.role === 'ADMIN' && (
                <Link href="/admin" className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  Admin Dashboard
                </Link>
              )}
            </div>
          )}
          
          <div className="flex items-center space-x-6">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/profile" className="text-right hover-lift transition-all">
                  <div className="text-sm text-white font-semibold hover:text-neutral-300" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>{user.name}</div>
                  <div className="text-xs text-neutral-400 capitalize font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif', letterSpacing: '0.05em'}}>{user.role.toLowerCase()}</div>
                </Link>
                <div className="w-px h-8 bg-neutral-600"></div>
                <button
                  onClick={() => signOut()}
                  disabled={isLoading}
                  className="text-sm text-neutral-400 hover:text-white transition-colors duration-200 font-medium px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            ) : (
              <Link 
                href="/auth"
                className="btn-primary px-8 py-3 font-semibold text-sm focus-ring hover-lift"
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
