'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function Navbar() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <nav className="header-professional px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-50">
      <div className="container-professional">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Top row - Logo */}
          <div className="flex justify-center items-center mb-3">
            <Link href="/" className="flex items-center group hover-lift">
              <span className="text-xl text-white font-semibold tracking-tight" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Succedence
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col space-y-2">
            {/* First row - Public links */}
            <div className="flex justify-center space-x-6">
              <Link href="/browse" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Browse Opportunities
              </Link>
              <Link href="/success" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                Success Stories
              </Link>
            </div>

            {/* Second row - User-specific links and auth */}
            <div className="flex justify-center space-x-4">
              {user ? (
                <>
                  <Link href="/listings/new" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    List Business
                  </Link>
                  <Link href="/preferences" className="text-xs text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    My Preferences
                  </Link>
                  <Link href="/profile" className="text-xs text-neutral-400 hover:text-white transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                    Profile
                  </Link>
                  <button
                    onClick={() => signOut()}
                    disabled={isLoading}
                    className="text-xs text-neutral-400 hover:text-white transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  className="text-xs bg-gold/20 border border-gold/40 text-gold hover:bg-gold hover:text-midnight px-4 py-2 font-semibold rounded transition-all duration-200"
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

                <Link href="/preferences" className="text-sm text-neutral-400 hover:text-gold transition-colors duration-200 font-medium" style={{fontFamily: 'Source Serif Pro, Georgia, serif'}}>
                  My Preferences
                </Link>

                {user.role === 'admin' && (
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
      </div>
    </nav>
  );
}
