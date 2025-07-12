'use client'

import { useState } from 'react'
import Link from 'next/link'
import MultiStepCreatorForm from '@/components/MultiStepCreatorForm'

const CreatorTestimonial = ({ name, handle, avatar, followers, earnings, quote }: {
  name: string
  handle: string
  avatar: string
  followers: string
  earnings: string
  quote: string
}) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex items-center mb-6">
      <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center mr-4">
        <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{name}</h4>
        <p className="text-gray-500 text-sm">{handle}</p>
        <div className="flex items-center space-x-4 mt-1">
          <span className="text-xs text-gray-600">{followers} followers</span>
          <span className="text-xs text-green-600 font-semibold">{earnings}/month</span>
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
    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 mb-4 leading-relaxed">{description}</p>
    <div className="text-2xl font-bold text-blue-600">{stat}</div>
  </div>
)

const ProcessStep = ({ step, title, description, icon }: {
  step: number
  title: string
  description: string
  icon: React.ReactNode
}) => (
  <div className="flex items-start space-x-4 mb-8">
    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
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

export default function CreatorsPage() {
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
              <Link href="/brands" className="text-gray-600 hover:text-black transition-colors">
                For Brands
              </Link>
              <Link href="/creator/login" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transition-all duration-300">
                Login
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full text-sm font-medium text-blue-800 mb-8">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              2500+ creators already earning
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Turn Your Influence Into
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Real Income
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join Europe's fastest-growing creator economy platform. Promote premium brands, 
              earn up to 25% commission, and build your dream lifestyle.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Start Earning Today
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">€45M+</div>
                <div className="text-gray-600">Total Revenue</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Up to 25%</div>
                <div className="text-gray-600">Commission</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">48h</div>
                <div className="text-gray-600">Approval Time</div>
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
              Why Creators Choose Goozy
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to monetize your influence and build a sustainable income stream.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>}
              title="High Commission Rates"
              description="Earn 10-25% commission on every sale. Premium brands pay premium rates for quality creators."
              stat="Up to 25%"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>}
              title="Fast Approval"
              description="Get approved in under 48 hours. No waiting weeks to start earning from your content."
              stat="48h Setup"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              title="Premium Brands"
              description="Work with verified, high-quality brands that your audience will love and trust."
              stat="46+ Brands"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>}
              title="Real-Time Analytics"
              description="Track your earnings, clicks, and conversions with detailed analytics and insights."
              stat="Live Data"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>}
              title="Monthly Payouts"
              description="Get paid reliably every month via bank transfer or PayPal. No minimum thresholds."
              stat="Monthly"
            />
            
            <FeatureCard
              icon={<svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
              title="Full Support"
              description="Dedicated creator success team to help you maximize your earnings and grow your audience."
              stat="24/7 Help"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start earning in just 3 simple steps. No complex setup, no hidden fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ProcessStep
              step={1}
              title="Apply & Get Approved"
              description="Fill out our simple application form with your social media details. We'll review and approve quality creators within 48 hours."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>}
            />
            
            <ProcessStep
              step={2}
              title="Choose Your Brands"
              description="Browse our catalog of premium brands and products. Pick the ones that match your audience and personal style."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>}
            />
            
            <ProcessStep
              step={3}
              title="Create Content & Earn"
              description="Create authentic content featuring your chosen products. Share your unique links and earn up to 25% commission on every sale."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>}
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Creator Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real creators, real results. See how our platform has transformed their income.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <CreatorTestimonial
              name="Sofia Martinez"
              handle="@sofiastyle"
              avatar="SM"
              followers="45K"
              earnings="€2,800"
              quote="Goozy changed my life. I went from struggling to pay rent to earning more than my old job. The brands are amazing and my audience loves them!"
            />
            
            <CreatorTestimonial
              name="Alex Johnson"
              handle="@alexfitness"
              avatar="AJ"
              followers="82K"
              earnings="€4,200"
              quote="Finally, a platform that actually cares about creators. High commissions, fast payments, and brands that align with my values. Couldn't be happier!"
            />
            
            <CreatorTestimonial
              name="Emma Chen"
              handle="@emmastyle"
              avatar="EC"
              followers="120K"
              earnings="€6,500"
              quote="The approval process was so smooth, and I was earning within a week. The analytics help me understand what works best for my audience."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 lg:px-8 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Start Earning?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
            Join thousands of creators who are already building their dream income with Goozy. 
            It's free to start, and you could be earning within 48 hours.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-blue-600 px-8 py-4 rounded-full font-bold text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Apply Now
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 lg:px-8 py-20 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about becoming a Goozy creator.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Items */}
            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">What are the requirements to join?</h3>
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
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    We welcome creators of all sizes! While we look at follower count, we prioritize engagement rate, 
                    content quality, and audience authenticity. Micro-influencers with engaged audiences often perform better 
                    than those with massive but inactive followings.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">How much can I earn?</h3>
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
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Earnings vary based on your audience size, engagement, and effort. Our top creators earn €5,000-€15,000 per month, 
                    while average creators make €800-€2,500. Commission rates range from 10-25% depending on the brand and product category.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">When do I get paid?</h3>
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
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    We pay monthly via bank transfer, PayPal, or Revolut. Payments are processed on the 15th of each month for the previous month's earnings.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 rounded-2xl overflow-hidden">
              <button
                onClick={() => toggleFAQ(4)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-100 transition-colors"
              >
                <h3 className="font-bold text-lg text-gray-900">Is it really free to join?</h3>
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
                <div className="px-6 pb-6">
                  <p className="text-gray-600 leading-relaxed">
                    Absolutely! There are no upfront costs, monthly fees, or hidden charges. We only earn when you earn - 
                    that's why we're motivated to help you succeed. You keep 100% of your commission earnings.
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
                  <Link href="#for-creators" className="text-gray-300 hover:text-white transition-colors text-sm">
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
                  <Link href="#creator-form" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Become a Creator
                  </Link>
                </li>
                <li>
                  <Link href="/creator/login" className="text-gray-300 hover:text-white transition-colors text-sm">
                    Creator Login
                  </Link>
                </li>
                <li>
                  <Link href="#brand-form" className="text-gray-300 hover:text-white transition-colors text-sm">
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

      {/* Registration Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Join Goozy Creators</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <MultiStepCreatorForm />
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 