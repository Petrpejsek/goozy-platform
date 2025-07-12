'use client'

import { useState } from 'react'
import Link from 'next/link'
import BrandForm from '@/components/BrandForm'

const BrandTestimonial = ({ name, company, logo, revenue, creators, quote }: {
  name: string
  company: string
  logo: string
  revenue: string
  creators: string
  quote: string
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold text-lg">{company.charAt(0)}</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{name}</h4>
        <p className="text-gray-500 text-sm">{company}</p>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-600">{creators} creators</span>
          <span className="text-xs text-green-600 font-semibold">{revenue} revenue</span>
        </div>
      </div>
    </div>
    <p className="text-gray-700 italic">"{quote}"</p>
  </div>
)

const FeatureCard = ({ icon, title, description, stat }: {
  icon: React.ReactNode
  title: string
  description: string
  stat: string
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:scale-105">
    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    <div className="text-2xl font-bold text-purple-600">{stat}</div>
  </div>
)

const ProcessStep = ({ step, title, description, icon }: {
  step: number
  title: string
  description: string
  icon: React.ReactNode
}) => (
  <div className="flex items-start space-x-4 mb-8">
    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
      <span className="text-white font-bold text-lg">{step}</span>
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
    <div className="flex-shrink-0 w-8 h-8 text-gray-400">
      {icon}
    </div>
  </div>
)

export default function BrandsPage() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-black">
              GOOZY
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/creators" className="text-gray-600 hover:text-black transition-colors">
                For Creators
              </Link>
              <Link href="/brand/login" className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                Brand Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full text-sm font-medium text-purple-800 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              46+ brands already growing
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Scale Your Brand With
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                Authentic Creators
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Connect with 2,500+ verified micro & nano creators. Drive authentic engagement, 
              boost sales, and build lasting brand partnerships.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Partnership
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">€45M+</div>
                <div className="text-gray-600">Total Sales Generated</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">8.5%</div>
                <div className="text-gray-600">Average Engagement</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">48h</div>
                <div className="text-gray-600">Campaign Launch</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 lg:px-8 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why Brands Choose Goozy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to scale your brand with authentic creator partnerships.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>}
              title="Verified Creators"
              description="Access 2,500+ verified micro & nano creators with authentic, engaged audiences."
              stat="2,500+"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>}
              title="High ROI"
              description="Achieve 300% higher engagement rates compared to traditional advertising."
              stat="300% ROI"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              title="Quality Guarantee"
              description="All creators are manually vetted for authenticity and audience quality."
              stat="100% Vetted"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
              title="Advanced Analytics"
              description="Track campaign performance with real-time analytics and detailed insights."
              stat="Real-Time"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>}
              title="Cost Effective"
              description="Pay only for results. No upfront fees, transparent pricing structure."
              stat="Pay/Results"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>}
              title="Fast Launch"
              description="Launch campaigns in 48 hours with our streamlined approval process."
              stat="48h Setup"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Launch your creator campaign in just 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <ProcessStep
                step={1}
                title="Create Your Campaign"
                description="Sign up and tell us about your brand, products, and target audience. Our team will help you create the perfect campaign."
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>}
              />
              
              <ProcessStep
                step={2}
                title="Get Matched"
                description="Our AI matches you with creators who align with your brand values and target the right audience for maximum impact."
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>}
              />
            </div>
            
            <div>
              <ProcessStep
                step={3}
                title="Launch & Monitor"
                description="Campaigns go live within 48 hours. Track performance in real-time with our advanced analytics dashboard."
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>}
              />
              
              <ProcessStep
                step={4}
                title="Scale & Optimize"
                description="Use performance data to optimize campaigns. Scale successful partnerships and build long-term creator relationships."
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 lg:px-8 py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Trusted by Leading Brands
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what our brand partners say about their success with Goozy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <BrandTestimonial
              name="Sarah Johnson"
              company="StyleCo Fashion"
              logo=""
              revenue="€150K"
              creators="25"
              quote="Goozy transformed our influencer marketing. We've seen 300% better engagement and ROI compared to traditional ads."
            />
            
            <BrandTestimonial
              name="Michael Chen"
              company="TechGear Pro"
              logo=""
              revenue="€280K"
              creators="40"
              quote="The quality of creators on Goozy is incredible. They truly understand our brand and create authentic content."
            />
            
            <BrandTestimonial
              name="Emma Rodriguez"
              company="BeautyBloom"
              logo=""
              revenue="€95K"
              creators="18"
              quote="We launched our campaign in 48 hours and saw immediate results. The platform is incredibly user-friendly."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-20 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Scale Your Brand?
          </h2>
          <p className="text-xl text-purple-100 mb-12 max-w-2xl mx-auto">
            Join 46+ brands already growing with Goozy. Launch your first campaign 
            today and see the difference authentic creators can make.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Start Partnership
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about brand partnerships with Goozy.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">How does Goozy work for brands?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 1 ? (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              {openFAQ === 1 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Goozy connects your brand with verified creators who promote your products authentically. 
                    You create campaigns, we match you with relevant creators, and you track performance in real-time. 
                    Pay only for results - no upfront fees.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">What types of creators do you work with?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 2 ? (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              {openFAQ === 2 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    We specialize in micro and nano creators (1K-100K followers) who have highly engaged, authentic audiences. 
                    All creators are manually vetted for quality, authenticity, and audience engagement before joining our platform.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">How much does it cost?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 3 ? (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              {openFAQ === 3 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    There are no upfront fees or monthly subscriptions. You pay only for results - typically 10-25% commission on sales generated. 
                    We also offer flat-rate campaign options for specific promotional needs.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(4)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">How long does it take to launch a campaign?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 4 ? (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              {openFAQ === 4 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Your company should be approved within 48 hours. Once approved, creators immediately start building campaigns. 
                    Our streamlined process includes brand approval, creator matching, and campaign setup to get you started quickly.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(5)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">Can I track campaign performance?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 5 ? (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </div>
              </button>
              {openFAQ === 5 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Yes! Our advanced analytics dashboard provides real-time tracking of clicks, conversions, 
                    sales, and ROI. You'll see detailed reports on individual creator performance and overall campaign metrics.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-16 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            
            {/* Information */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Information</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-white transition-colors text-sm">
                    About GOOZY
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-gray-300 hover:text-white transition-colors text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/creators" className="text-gray-300 hover:text-white transition-colors text-sm">
                    For Creators
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="#faq" className="text-gray-300 hover:text-white transition-colors text-sm">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/shipping-returns" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Shipping & Returns
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" target="_blank" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-preferences" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Cookie Preferences
                  </Link>
                </li>
                <li>
                  <Link href="/terms-conditions" target="_blank" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Terms & Conditions
                  </Link>
                </li>
              </ul>
            </div>

            {/* Join Us */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Join Us</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/creators" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Become a Creator
                  </Link>
                </li>
                <li>
                  <Link href="/creator/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Creator Login
                  </Link>
                </li>
                <li>
                  <Link href="/brands" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Brand Partnerships
                  </Link>
                </li>
              </ul>
            </div>

            {/* Social Media & Newsletter */}
            <div>
              <h3 className="font-bold text-lg mb-6 text-white">Social Media</h3>
              <div className="flex space-x-4 mb-8">
                <Link href="#" className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </Link>
                <Link href="#" className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </Link>
                <Link href="#" className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </Link>
              </div>
              
              {/* Newsletter */}
              <div>
                <h4 className="font-bold text-base mb-3 text-white">Newsletter</h4>
                <p className="text-sm text-gray-300 mb-4">Get tips, offers & creator drops</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 border border-gray-600 bg-gray-800 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
                  />
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:shadow-lg transition-all duration-300 transform hover:scale-105">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4 pt-8 border-t border-gray-700">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white tracking-tight hover:opacity-80 transition-opacity">
                GOOZY
              </Link>
            </div>
            <div className="text-gray-400 text-sm">
              © 2025 Goozy. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Start Your Partnership</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <BrandForm />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 