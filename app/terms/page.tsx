'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-primary-gradient relative">
      {/* Add extra spacing from navbar */}
      <div className="h-24"></div>

      <div className="container mx-auto px-8 py-16 max-w-4xl">
        {/* Header */}
        <ScrollAnimation direction="fade">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-warm-white mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-platinum/90 max-w-3xl mx-auto leading-relaxed">
              Important legal information regarding your use of Succedence and our AI-powered services.
            </p>
            <div className="mt-8">
              <Link href="/" className="btn-secondary inline-flex items-center px-8 py-4" style={{ fontFamily: "'Crimson Text', Georgia, serif", fontWeight: 400 }}>
                ← Return to Home
              </Link>
            </div>
          </div>
        </ScrollAnimation>

        {/* Content */}
        <ScrollAnimation direction="up" delay={50}>
          <div className="glass p-8 rounded-luxury space-y-8">

            {/* Last Updated */}
            <div className="text-center p-4 bg-gold/10 rounded-luxury border border-gold/20">
              <p className="text-gold font-medium">Last Updated: {new Date().toLocaleDateString()}</p>
            </div>

            {/* AI Disclaimer Section */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">AI-Powered Services Disclaimer</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  <strong className="text-gold">IMPORTANT:</strong> Succedence uses artificial intelligence (AI) and machine learning technologies to provide business analysis, market intelligence, due diligence assistance, and buyer compatibility scoring. These AI-powered tools are designed to assist and enhance your decision-making process but should never be your sole basis for investment decisions.
                </p>

                <h3 className="text-xl font-semibold text-warm-white mt-6 mb-3">AI Accuracy and Limitations</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>No Guarantee of Accuracy:</strong> AI-generated content, analysis, and recommendations may contain errors, inaccuracies, or incomplete information. The AI models are trained on historical data and may not reflect current market conditions or unique circumstances.</li>
                  <li><strong>Algorithmic Bias:</strong> AI systems may contain inherent biases based on training data and may not account for all relevant factors in business analysis.</li>
                  <li><strong>Rapidly Changing Information:</strong> AI analysis is based on available data at the time of generation and may not reflect real-time market changes or recent developments.</li>
                  <li><strong>Context Limitations:</strong> AI may not fully understand complex business relationships, regulatory changes, or industry-specific nuances that could significantly impact investment decisions.</li>
                </ul>

                <h3 className="text-xl font-semibold text-warm-white mt-6 mb-3">Not Financial, Legal, or Investment Advice</h3>
                <p>
                  <strong>Succedence and its AI-powered tools DO NOT provide financial, legal, or investment advice.</strong> All AI-generated insights, business analyses, market intelligence, and recommendations are for informational purposes only and should not be construed as:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Investment recommendations or advice</li>
                  <li>Financial planning or advisory services</li>
                  <li>Legal advice or counsel</li>
                  <li>Accounting or tax advice</li>
                  <li>Professional due diligence services</li>
                  <li>Guarantees of investment performance or business success</li>
                </ul>
              </div>
            </section>

            {/* User Responsibility */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Your Responsibilities</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p><strong>By using Succedence, you acknowledge and agree that:</strong></p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Independent Verification Required:</strong> You will independently verify all AI-generated information and conduct your own thorough due diligence before making any investment decisions.</li>
                  <li><strong>Professional Consultation:</strong> You will consult with qualified financial advisors, legal counsel, accountants, and other professionals as appropriate for your specific situation.</li>
                  <li><strong>Sole Decision-Making Authority:</strong> You are solely responsible for all investment, acquisition, and business decisions. Succedence does not participate in or influence your decision-making process.</li>
                  <li><strong>Risk Acknowledgment:</strong> You understand that all investments carry inherent risks, including the potential for significant financial loss.</li>
                  <li><strong>No Reliance on AI Alone:</strong> You will not rely solely on AI-generated content for making investment decisions and will conduct comprehensive analysis using multiple sources and methodologies.</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Limitation of Liability</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  <strong>TO THE MAXIMUM EXTENT PERMITTED BY LAW:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Succedence, its affiliates, officers, directors, employees, and agents shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages arising from your use of our AI-powered services.</li>
                  <li>We do not warrant the accuracy, completeness, or reliability of AI-generated content.</li>
                  <li>We are not responsible for investment losses, missed opportunities, or adverse business outcomes resulting from reliance on our AI tools.</li>
                  <li>Our total liability to you for all claims shall not exceed the amount you paid for our services in the 12 months preceding the claim.</li>
                </ul>
              </div>
            </section>

            {/* Data Usage and Privacy */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Data Usage and AI Training</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  By using our AI-powered services, you understand that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>AI analysis may be based on publicly available information, market data, and information you provide.</li>
                  <li>We do not guarantee the privacy or confidentiality of information processed by third-party AI services.</li>
                  <li>You should not input confidential, proprietary, or sensitive information into our AI tools.</li>
                  <li>We may use aggregated, anonymized data to improve our AI models and services.</li>
                </ul>
              </div>
            </section>

            {/* Professional Standards */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Professional Standards Disclaimer</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  Succedence is a technology platform providing AI-powered business intelligence tools. We are not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>A registered investment advisor (RIA) or broker-dealer</li>
                  <li>A law firm or provider of legal services</li>
                  <li>A certified public accounting firm</li>
                  <li>A professional due diligence or consulting firm</li>
                  <li>Subject to fiduciary duties regarding your investment decisions</li>
                </ul>
                <p className="mt-4">
                  We do not hold any professional licenses related to financial, legal, or accounting services, and our AI tools are not substitutes for professional services.
                </p>
              </div>
            </section>

            {/* Market Risks */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Investment and Market Risks</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  <strong>Investment in businesses and acquisitions involves significant risks, including:</strong>
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Total loss of capital invested</li>
                  <li>Market volatility and economic downturns</li>
                  <li>Industry-specific risks and regulatory changes</li>
                  <li>Management and operational risks</li>
                  <li>Liquidity risks and difficulty exiting investments</li>
                  <li>Competition and technological disruption</li>
                  <li>Legal and compliance risks</li>
                </ul>
                <p className="mt-4">
                  Past performance does not guarantee future results. AI analysis cannot predict or guarantee investment outcomes.
                </p>
              </div>
            </section>

            {/* Updates and Changes */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Updates to Terms</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  We may update these Terms of Service periodically to reflect changes in our AI capabilities, legal requirements, or business practices. Continued use of our services after updates constitutes acceptance of the revised terms. We encourage you to review these terms regularly.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-serif font-semibold text-warm-white mb-4">Questions and Contact</h2>
              <div className="space-y-4 text-silver/90 leading-relaxed">
                <p>
                  If you have questions about these Terms of Service or our AI-powered services, please contact us. However, please note that we cannot provide investment advice or professional consultation through our support channels.
                </p>
                <p className="text-gold font-medium">
                  Remember: Always consult with qualified professionals for investment, legal, and financial advice.
                </p>
              </div>
            </section>

            {/* Acceptance */}
            <div className="text-center p-6 bg-navy/20 rounded-luxury border border-gold/10">
              <p className="text-warm-white font-medium">
                By using Succedence and its AI-powered services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>

          </div>
        </ScrollAnimation>
      </div>

      {/* Add extra spacing before footer */}
      <div className="h-32"></div>

      <Footer />
    </div>
  );
}