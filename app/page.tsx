import Link from 'next/link';
import ScrollAnimation from '../components/ScrollAnimation';
import ScrollCue from '../components/ScrollCue';

export default function Home() {
  return (
    <main className="min-h-screen" style={{background: 'var(--primary-gradient)'}}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <div className="container mx-auto px-8 max-w-6xl">
            <div className="text-center">
              <div className="hero-text-container">
                <h1 className="text-hero mb-8">
                  The Premier Platform for
                  <span className="hero-accent"> Business Acquisitions</span>
                </h1>

                <p className="text-body-large mb-12 max-w-2xl mx-auto opacity-90">
                  Connect with sophisticated investors and discover exceptional opportunities through our comprehensive acquisition platform.
                </p>

                <div className="hero-actions">
                  <Link href="/browse" className="btn-primary btn-lg">
                    Browse Opportunities
                  </Link>
                  <Link href="/listings/new" className="btn-secondary btn-lg">
                    List Your Business
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-divider"></div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container mx-auto px-8 max-w-7xl">
          <ScrollAnimation direction="fade" className="text-center mb-20">
            <h2 className="text-heading mb-6">
              Why Choose DealSense
            </h2>
            <p className="text-body-large max-w-2xl mx-auto opacity-80">
              Professional-grade tools and insights designed for sophisticated business transactions.
            </p>
          </ScrollAnimation>

          <div className="features-grid">
            <ScrollAnimation direction="up" delay={100} className="feature-card feature-card-1">
              <div className="feature-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-subheading mb-4">Analytical Insights</h3>
              <p className="text-body mb-6">
                AI-powered business valuations and comprehensive market analysis for informed decision-making.
              </p>
              <ul className="feature-list">
                <li>Advanced valuation models</li>
                <li>Market trend analysis</li>
                <li>Risk assessment tools</li>
              </ul>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={200} className="feature-card feature-card-2">
              <div className="feature-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-subheading mb-4">Secure Due Diligence</h3>
              <p className="text-body mb-6">
                Protected data rooms and comprehensive agreement management with bank-grade security.
              </p>
              <ul className="feature-list">
                <li>Encrypted data rooms</li>
                <li>NDA management</li>
                <li>Document tracking</li>
              </ul>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={300} className="feature-card feature-card-3">
              <div className="feature-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-subheading mb-4">Professional Network</h3>
              <p className="text-body mb-6">
                Connect with verified investors and industry professionals through our curated network.
              </p>
              <ul className="feature-list">
                <li>Verified investor profiles</li>
                <li>Strategic partnerships</li>
                <li>Industry connections</li>
              </ul>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Email Signup Section */}
      <section className="py-40 bg-brand-dark relative">
        <div className="container mx-auto px-8 max-w-4xl">
          <ScrollAnimation direction="fade" className="glass p-32 text-center">
            <h2 className="text-heading text-white font-medium mb-12">
              Join Our Exclusive Network
            </h2>
            <p className="text-2xl text-neutral-400 mb-20 leading-relaxed">
              Get early access to premium business opportunities and connect with sophisticated investors.
            </p>
            
            <form className="mb-20">
              <div className="flex gap-6 mb-8">
                <input
                  type="text"
                  placeholder="First Name"
                  className="form-control flex-1"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="form-control flex-1"
                  required
                />
              </div>
              <div className="flex gap-6 mb-8">
                <input
                  type="email"
                  placeholder="Professional Email Address"
                  className="form-control flex-1"
                  required
                />
                <select className="form-control flex-1" required>
                  <option value="">I am interested in...</option>
                  <option value="buying">Acquiring Businesses</option>
                  <option value="selling">Selling My Business</option>
                  <option value="investing">Investment Opportunities</option>
                  <option value="both">Both Buying & Selling</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn-success w-full py-6 text-xl font-medium focus-ring hover-lift mb-8"
              >
                Request Early Access
              </button>
            </form>
            
            <div className="flex gap-12 justify-center items-center">
              <Link href="/auth" className="btn-primary px-24 py-6 text-xl font-medium focus-ring hover-lift">
                Sign In
              </Link>
              <Link href="/browse" className="glass px-24 py-6 text-xl font-medium text-white focus-ring hover-lift border border-neutral-600">
                Browse Public Listings
              </Link>
            </div>
            
            <p className="text-neutral-500 mt-12 text-lg">
              By signing up, you agree to receive updates about exclusive opportunities. 
              We respect your privacy and will never share your information.
            </p>
          </ScrollAnimation>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-8 max-w-6xl">
          <ScrollAnimation direction="fade" className="text-center mb-32">
            <h2 className="text-heading text-white font-medium mb-12">
              How It Works
            </h2>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
              A streamlined process designed for sophisticated business transactions.
            </p>
          </ScrollAnimation>

          <div className="grid grid-cols-4 gap-16">
            <ScrollAnimation direction="up" delay={100} className="text-center group">
              <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 watch-accent" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
                <span className="text-black font-bold text-5xl">1</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Create Profile</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Set up your professional profile with verification and preferences.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={200} className="text-center group">
              <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 pocket-square" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
                <span className="text-black font-bold text-5xl">2</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Browse Opportunities</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Access curated business listings with AI-powered insights and analytics.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={300} className="text-center group">
              <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 executive-accent" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
                <span className="text-black font-bold text-5xl">3</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Secure Due Diligence</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Conduct confidential reviews through protected data rooms and NDA management.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={400} className="text-center group">
              <div className="w-32 h-32 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 tier-premium" style={{background: 'var(--luxury-gradient)', boxShadow: 'var(--premium-shadow)'}}>
                <span className="text-black font-bold text-5xl">4</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Complete Transaction</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Finalize deals with comprehensive legal and financial documentation support.</p>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Built for Professionals Section */}
      <section className="py-40 bg-brand-dark relative">
        <div className="container mx-auto px-8 max-w-6xl">
          <div className="grid grid-cols-2 gap-24 items-center">
            <ScrollAnimation direction="left" className="">
              <h2 className="text-heading text-white font-medium mb-12">
                Built for Professionals
              </h2>
              <p className="text-xl text-neutral-400 mb-16 leading-relaxed">
                DealSense caters to sophisticated investors, business owners, and industry professionals who demand excellence in their business acquisition process.
              </p>

              <div className="space-y-12">
                <div className="flex items-start space-x-6">
                  <div className="w-4 h-4 mt-3 flex-shrink-0" style={{background: 'var(--gold)'}}></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Verified Participants</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">All users undergo professional verification to ensure quality connections.</p>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex items-start space-x-6">
                  <div className="w-4 h-4 mt-3 flex-shrink-0" style={{background: 'var(--gold)'}}></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Confidential Environment</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">Bank-grade security and comprehensive NDAs protect sensitive business information.</p>
                  </div>
                </div>

                <div className="divider"></div>

                <div className="flex items-start space-x-6">
                  <div className="w-4 h-4 mt-3 flex-shrink-0" style={{background: 'var(--gold)'}}></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Expert Support</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">Dedicated support from M&A professionals throughout your transaction journey.</p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="right" delay={200} className="glass p-20 tier-premium">
              <div className="space-y-12">
                <div className="text-center border-b pb-8" style={{borderColor: 'rgba(212, 175, 55, 0.3)'}}>
                  <div className="text-5xl font-bold mb-3 text-financial" style={{color: 'var(--gold)'}}>90%</div>
                  <div className="text-neutral-400 text-lg">Time Wasted on Research</div>
                </div>
                <div className="text-center border-b pb-8" style={{borderColor: 'rgba(212, 175, 55, 0.3)'}}>
                  <div className="text-5xl font-bold mb-3 text-financial" style={{color: 'var(--gold)'}}>6-12</div>
                  <div className="text-neutral-400 text-lg">Months to Find Target</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold mb-3 text-financial" style={{color: 'var(--gold)'}}>$50K+</div>
                  <div className="text-neutral-400 text-lg">Average Search Cost</div>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-8 max-w-6xl">
          <ScrollAnimation direction="fade" className="text-center mb-32">
            <h2 className="text-heading text-white font-medium mb-12">
              Success Stories
            </h2>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
              Trusted by industry leaders and successful entrepreneurs worldwide.
            </p>
          </ScrollAnimation>

          <div className="w-full max-w-7xl mx-auto grid grid-cols-3 gap-8">
            <ScrollAnimation direction="up" delay={100} className="glass p-20 hover-lift">
              <div className="mb-16">
                <div className="text-8xl mb-8" style={{color: 'var(--gold)'}}>&ldquo;</div>
                <p className="text-2xl text-neutral-300 leading-relaxed italic">
                  DealSense streamlined our acquisition process beautifully. The AI insights were invaluable for our due diligence.
                </p>
              </div>
              <div className="border-t pt-10" style={{borderColor: 'rgba(212, 175, 55, 0.3)'}}>
                <div className="text-white font-medium text-xl">Sarah Chen</div>
                <div className="text-neutral-500 text-lg">Managing Partner, Venture Capital</div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={200} className="glass p-20 hover-lift">
              <div className="mb-16">
                <div className="text-8xl mb-8" style={{color: 'var(--gold)'}}>&ldquo;</div>
                <p className="text-2xl text-neutral-300 leading-relaxed italic">
                  The platform&apos;s security and professionalism gave us confidence throughout the entire transaction process.
                </p>
              </div>
              <div className="border-t pt-10" style={{borderColor: 'rgba(212, 175, 55, 0.3)'}}>
                <div className="text-white font-medium text-xl">Marcus Rodriguez</div>
                <div className="text-neutral-500 text-lg">CEO, Tech Acquisition Corp</div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={300} className="glass p-20 hover-lift">
              <div className="mb-16">
                <div className="text-8xl mb-8" style={{color: 'var(--gold)'}}>&ldquo;</div>
                <p className="text-2xl text-neutral-300 leading-relaxed italic">
                  Found the perfect strategic buyer for our company. The network quality is exceptional.
                </p>
              </div>
              <div className="border-t pt-10" style={{borderColor: 'rgba(212, 175, 55, 0.3)'}}>
                <div className="text-white font-medium text-xl">Jennifer Park</div>
                <div className="text-neutral-500 text-lg">Founder, SaaS Platform</div>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </section>

      {/* Dynamic Floating Scroller */}
      <ScrollCue />
    </main>
  );
}