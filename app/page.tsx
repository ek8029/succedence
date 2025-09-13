import Link from 'next/link';
import ScrollAnimation from '../components/ScrollAnimation';
import ScrollCue from '../components/ScrollCue';

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-darker">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="container mx-auto px-8 max-w-6xl">
          <div className="text-center">
            <div className="fade-in">
              <h1 className="text-hero text-white mb-16 leading-tight">
                The Premier Platform for
                <span className="block text-white mt-6 italic" style={{color: 'var(--accent)'}}>
                  Business Acquisitions
                </span>
              </h1>
              
              <p className="text-2xl text-neutral-400 mb-20 max-w-4xl mx-auto leading-relaxed">
                Connect with sophisticated investors and discover exceptional business opportunities. 
                Sophisticated analysis, secure due diligence, and seamless transaction management.
              </p>
              
              <div className="flex gap-8 justify-center items-center mb-24">
                <Link href="/browse" className="btn-primary px-16 py-5 text-lg font-medium focus-ring hover-lift">
                  Browse Opportunities
                </Link>
                
                <Link href="/listings/new" className="btn-success px-16 py-5 text-lg font-medium focus-ring hover-lift">
                  List Your Business
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose DealSense Section */}
      <section className="py-10 relative">
        <div className="container mx-auto px-8 max-w-7xl">
          <ScrollAnimation direction="fade" className="text-center mb-32">
            <h2 className="text-heading text-white font-medium mb-12">
              Why Choose DealSense?
            </h2>
            <p className="text-xl text-neutral-400 leading-relaxed max-w-3xl mx-auto">
              Professional-grade tools and insights designed for discerning investors and business owners.
            </p>
          </ScrollAnimation>

          <div className="w-full max-w-7xl mx-auto grid grid-cols-3 gap-8">
            <ScrollAnimation direction="up" delay={200} className="glass p-20 hover-lift text-center">
              <h3 className="text-3xl text-white font-medium mb-12">Analytical Insights</h3>
              <p className="text-neutral-400 leading-relaxed text-xl mb-12">
                AI-powered business valuations and market analysis.
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">AI-powered business valuations</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Market trend analysis</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Risk assessment tools</span>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={400} className="glass p-20 hover-lift text-center">
              <h3 className="text-3xl text-white font-medium mb-12">Secure Due Diligence</h3>
              <p className="text-neutral-400 leading-relaxed text-xl mb-12">
                Protected data rooms and comprehensive agreement management.
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Encrypted data rooms</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">NDA management</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Document tracking</span>
                </div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={600} className="glass p-20 hover-lift text-center">
              <h3 className="text-3xl text-white font-medium mb-12">Professional Network</h3>
              <p className="text-neutral-400 leading-relaxed text-xl mb-12">
                Connect with verified investors and industry professionals.
              </p>
              <div className="space-y-6">
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Verified investor profiles</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Broker partnerships</span>
                </div>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-3 h-3 bg-accent flex-shrink-0"></div>
                  <span className="text-neutral-300 text-lg">Industry connections</span>
                </div>
              </div>
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
              <div className="w-24 h-24 bg-accent flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-black font-bold text-2xl">1</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Create Profile</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Set up your professional profile with verification and preferences.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={200} className="text-center group">
              <div className="w-24 h-24 bg-accent flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-black font-bold text-2xl">2</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Browse Opportunities</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Access curated business listings with AI-powered insights and analytics.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={300} className="text-center group">
              <div className="w-24 h-24 bg-accent flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-black font-bold text-2xl">3</span>
              </div>
              <h3 className="text-2xl text-white font-medium mb-6">Secure Due Diligence</h3>
              <p className="text-neutral-400 text-lg leading-relaxed">Conduct confidential reviews through protected data rooms and NDA management.</p>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={400} className="text-center group">
              <div className="w-24 h-24 bg-accent flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-300">
                <span className="text-black font-bold text-2xl">4</span>
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
                  <div className="w-4 h-4 bg-accent mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Verified Participants</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">All users undergo professional verification to ensure quality connections.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-4 h-4 bg-accent mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Confidential Environment</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">Bank-grade security and comprehensive NDAs protect sensitive business information.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-6">
                  <div className="w-4 h-4 bg-accent mt-3 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-xl text-white font-medium mb-3">Expert Support</h4>
                    <p className="text-neutral-400 text-lg leading-relaxed">Dedicated support from M&A professionals throughout your transaction journey.</p>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation direction="right" delay={200} className="glass p-20">
              <div className="space-y-12">
                <div className="text-center border-b border-neutral-700 pb-8">
                  <div className="text-5xl font-bold text-accent mb-3">90%</div>
                  <div className="text-neutral-400 text-lg">Time Wasted on Research</div>
                </div>
                <div className="text-center border-b border-neutral-700 pb-8">
                  <div className="text-5xl font-bold text-accent mb-3">6-12</div>
                  <div className="text-neutral-400 text-lg">Months to Find Target</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-accent mb-3">$50K+</div>
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
            <ScrollAnimation direction="up" delay={100} className="glass p-16 hover-lift">
              <div className="mb-12">
                <div className="text-6xl text-accent mb-6">&ldquo;</div>
                <p className="text-xl text-neutral-300 leading-relaxed italic">
                  DealSense streamlined our acquisition process beautifully. The AI insights were invaluable for our due diligence.
                </p>
              </div>
              <div className="border-t border-neutral-700 pt-8">
                <div className="text-white font-medium text-lg">Sarah Chen</div>
                <div className="text-neutral-500">Managing Partner, Venture Capital</div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={200} className="glass p-16 hover-lift">
              <div className="mb-12">
                <div className="text-6xl text-accent mb-6">&ldquo;</div>
                <p className="text-xl text-neutral-300 leading-relaxed italic">
                  The platform&apos;s security and professionalism gave us confidence throughout the entire transaction process.
                </p>
              </div>
              <div className="border-t border-neutral-700 pt-8">
                <div className="text-white font-medium text-lg">Marcus Rodriguez</div>
                <div className="text-neutral-500">CEO, Tech Acquisition Corp</div>
              </div>
            </ScrollAnimation>

            <ScrollAnimation direction="up" delay={300} className="glass p-16 hover-lift">
              <div className="mb-12">
                <div className="text-6xl text-accent mb-6">&ldquo;</div>
                <p className="text-xl text-neutral-300 leading-relaxed italic">
                  Found the perfect strategic buyer for our company. The network quality is exceptional.
                </p>
              </div>
              <div className="border-t border-neutral-700 pt-8">
                <div className="text-white font-medium text-lg">Jennifer Park</div>
                <div className="text-neutral-500">Founder, SaaS Platform</div>
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