'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import MultiStepInfluencerForm from "@/components/MultiStepInfluencerForm";
import BrandForm from "@/components/BrandForm";
import AuthHeader from "@/components/AuthHeader";
import AuthDebug from "@/components/AuthDebug";

// Login Modal Component
const LoginModal = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'influencer' | 'brand' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = type === 'influencer' ? '/api/auth/influencer/login' : '/api/auth/brand/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        onClose();
        // Redirect to appropriate dashboard
    if (type === 'influencer') {
          window.location.href = '/influencer/dashboard';
        } else {
          window.location.href = '/partner-company';
        }
    } else {
        const errorData = await response.json();
        setError(errorData.error || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-2">
            {type === 'influencer' ? 'Influencer Login' : 'Brand Login'}
          </h2>
          <p className="text-gray-600">
            {type === 'influencer' 
              ? 'Access your dashboard and manage your products' 
              : 'Manage your brand partnerships and campaigns'
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onClose();
                if (type === 'influencer') {
                  document.getElementById('influencer-form')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  document.getElementById('brand-form')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-black font-medium hover:underline"
            >
              Sign Up here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

// Dropdown component for navigation
const DropdownMenu = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="relative group">
      <button className="text-gray-700 hover:text-black transition-colors text-sm font-medium flex items-center gap-1">
        {title}
        <svg className="w-4 h-4 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          {children}
        </div>
      </div>
    </div>
  );
};

const DropdownItem = ({ href, children, requiresAuth, authType }: { 
  href: string; 
  children: React.ReactNode; 
  requiresAuth?: boolean;
  authType?: 'influencer' | 'brand';
}) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (requiresAuth) {
      e.preventDefault();
      setShowLoginModal(true);
    }
  };

  return (
    <>
      <Link 
        href={href} 
        onClick={handleClick}
        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors"
      >
        {children}
      </Link>
      {showLoginModal && authType && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          type={authType}
        />
      )}
    </>
  );
};

// Brand Login Button Component
const BrandLoginButton = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowLoginModal(true)}
        className="text-black px-6 py-2 rounded-full border border-gray-300 hover:border-black transition-colors font-medium"
      >
        Brand Login
      </button>
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          type="brand"
        />
      )}
    </>
  );
};

// Influencer Login Button Component
const InfluencerLoginButton = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <>
      <button 
        onClick={() => setShowLoginModal(true)}
        className="text-black px-6 py-2 rounded-full border border-gray-300 hover:border-black transition-colors font-medium"
      >
        Influencer Login
      </button>
      {showLoginModal && (
        <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
          type="influencer"
        />
      )}
    </>
  );
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 lg:px-8 py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-3xl font-bold text-black tracking-tight hover:opacity-80 transition-opacity">
              GOOZY
            </Link>
          </div>
          <AuthHeader />

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button className="text-gray-700 hover:text-black">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 lg:px-8 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl lg:text-8xl font-bold text-black mb-8 tracking-tight leading-none">
            Your taste, made<br />
            <span className="text-gray-400">effortlessly</span><br />
            <span className="italic font-light">shoppable.</span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            The leading platform connecting micro & nano influencers with brands.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              href="#influencer-form"
              className="bg-black text-white px-10 py-4 rounded-full hover:bg-gray-800 transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              Start Earning
            </Link>
            <Link
              href="#brand-form"
              className="text-black px-10 py-4 rounded-full border-2 border-gray-200 hover:border-black transition-all duration-300 font-medium text-lg hover:scale-105"
            >
              I'm a Brand
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Trust indicators */}
      <section className="px-6 lg:px-8 py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">1000+</div>
              <div className="text-gray-600 font-medium">Active Influencers</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">50+</div>
              <div className="text-gray-600 font-medium">Partner Brands</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">€2M+</div>
              <div className="text-gray-600 font-medium">Total Revenue</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-bold text-black mb-2">95%</div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Influencers */}
      <section id="for-influencers" className="px-6 lg:px-8 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
              Some of our amazing brand<br />
              <span className="italic font-light text-gray-400">partners</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-16">
              Create your personal page with products and start earning on every sale.
            </p>
            
            {/* Fashion Product Gallery */}
            <div className="max-w-7xl mx-auto mb-20 overflow-hidden">
              <style jsx>{`
                .infinite-scroll {
                  display: flex;
                  animation: scrollContinuous 38s linear infinite;
                }
                .infinite-scroll-reverse {
                  display: flex;
                  animation: scrollContinuousReverse 38s linear infinite;
                }
                @keyframes scrollContinuous {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(calc(-8 * (8rem + 3rem))); }
                }
                @keyframes scrollContinuousReverse {
                  0% { transform: translateX(calc(-8 * (8rem + 3rem))); }
                  100% { transform: translateX(0); }
                }
                .scroll-item {
                  flex-shrink: 0;
                  width: 8rem;
                  height: 8rem;
                  margin-right: 3rem;
                }
              `}</style>
              
              {/* Top Row - Moving Right */}
              <div className="relative overflow-hidden mb-3">
                <div className="infinite-scroll">
                  {/* První sada obrázků */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&auto=format" alt="Pink sweatpants" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format" alt="Beauty cosmetics" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&auto=format" alt="Luxury handbag" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&auto=format" alt="Athletic shoes" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Duplikáty pro velmi dlouhou nekonečnou smyčku */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&auto=format" alt="Pink sweatpants" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format" alt="Beauty cosmetics" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&auto=format" alt="Luxury handbag" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&auto=format" alt="Athletic shoes" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Třetí duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&auto=format" alt="Pink sweatpants" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format" alt="Beauty cosmetics" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&auto=format" alt="Luxury handbag" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&auto=format" alt="Athletic shoes" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Čtvrtý duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&auto=format" alt="Pink sweatpants" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format" alt="Beauty cosmetics" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&auto=format" alt="Luxury handbag" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&auto=format" alt="Athletic shoes" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Pátý duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop&auto=format" alt="Pink sweatpants" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&h=400&fit=crop&auto=format" alt="Beauty cosmetics" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=400&fit=crop&auto=format" alt="Luxury handbag" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop&auto=format" alt="Athletic shoes" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>

              {/* Bottom Row - Moving Left */}
              <div className="relative overflow-hidden">
                <div className="infinite-scroll-reverse">
                  {/* První sada obrázků */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&auto=format" alt="Designer sunglasses" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format" alt="Fashion store" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400&h=400&fit=crop&auto=format" alt="Luxury perfume" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format" alt="Pearl jewelry" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Duplikáty pro velmi dlouhou nekonečnou smyčku */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&auto=format" alt="Designer sunglasses" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format" alt="Fashion store" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400&h=400&fit=crop&auto=format" alt="Luxury perfume" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format" alt="Pearl jewelry" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Třetí duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&auto=format" alt="Designer sunglasses" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format" alt="Fashion store" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400&h=400&fit=crop&auto=format" alt="Luxury perfume" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format" alt="Pearl jewelry" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Čtvrtý duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&auto=format" alt="Designer sunglasses" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format" alt="Fashion store" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400&h=400&fit=crop&auto=format" alt="Luxury perfume" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format" alt="Pearl jewelry" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Pátý duplikát */}
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=400&fit=crop&auto=format" alt="Designer sunglasses" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=400&fit=crop&auto=format" alt="Fashion store" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1588405748880-12d1d2a59d32?w=400&h=400&fit=crop&auto=format" alt="Luxury perfume" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?w=400&h=400&fit=crop&auto=format" alt="Pearl jewelry" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop&auto=format" alt="Leather jacket" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&h=400&fit=crop&auto=format" alt="Luxury watch" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format" alt="Nike sneakers" className="w-full h-full object-cover" />
                  </div>
                  <div className="scroll-item rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-sm">
                    <img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop&auto=format" alt="Fashion hoodie" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Personal Page</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Your own URL with your profile and selected products for your followers.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Sales Commissions</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Get a commission from every sale made with your personal discount code.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="w-20 h-20 bg-black rounded-2xl mx-auto mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Analytics</h3>
              <p className="text-gray-800 text-lg leading-relaxed">
                Track your earnings, sales counts, and coupon usage in real-time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Suite Section */}
      <section className="px-6 lg:px-8 py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
            A full product suite to monetize<br />
            <span className="italic font-light text-gray-400">wherever you are</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 font-light leading-relaxed">
            Our platform provides everything you need to successfully monetize your content.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Web</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                A complete web platform to manage products and track earnings.
              </p>
              <Link href="/products" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">App</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                A mobile app to manage content and communicate with your community.
              </p>
              <Link href="#" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-black rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Browser Extension</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                A browser extension to easily share products from social media.
              </p>
              <Link href="#" className="inline-block bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
                Explore
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <blockquote className="text-3xl lg:text-4xl font-light text-black mb-8 leading-relaxed italic">
            "Thanks to Goozy, I've created a stable income from my fashion content.
            The platform is intuitive and the support is great."
          </blockquote>
          <div className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            <div className="text-left">
              <div className="font-bold text-black">Anna Svobodová</div>
              <div className="text-gray-600">@anna_style, 250K followers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Influencer Form Section */}
      <section id="influencer-form" className="px-6 lg:px-8 py-24 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Join the ultimate platform to monetize<br />
            <span className="italic font-light text-gray-400">your influence</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Join thousands of influencers who are already earning with Goozy.
          </p>
          
          <div className="bg-white rounded-3xl">
            <MultiStepInfluencerForm />
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section id="for-brands" className="px-6 lg:px-8 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-stretch min-h-[700px]">
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4 tracking-tight leading-tight">
                Grow your brand with<br />
                <span className="italic font-light text-gray-400">authentic</span><br />
                partnerships
              </h2>
              <p className="text-base text-gray-600 mb-6 font-light leading-relaxed">
                Expand your reach through verified influencers with a quality community.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-0.5">Verified Influencers</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">With a quality community and authentic content.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-0.5">Automatic Integration</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Connection with your warehouse and systems.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-0.5">Detailed Analytics</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Complete reporting and performance tracking.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-base mb-0.5">Easy Setup</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">Quick onboarding and straightforward integration.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col">
              <div id="brand-form" className="bg-gray-50 p-8 lg:p-12 rounded-3xl h-full flex flex-col justify-center">
                <h3 className="text-2xl font-bold mb-6 text-center">Start Collaborating</h3>
                <BrandForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="px-6 lg:px-8 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-8 text-xl">Already have an account?</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <BrandLoginButton />
            <InfluencerLoginButton />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-8 py-12 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-black tracking-tight hover:opacity-80 transition-opacity">
                GOOZY
              </Link>
            </div>
            <div className="flex flex-wrap gap-8 text-sm">
              <Link href="/products" className="text-gray-600 hover:text-black transition-colors">
                Products
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                About Us
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Contact
              </Link>
              <Link href="#" className="text-gray-600 hover:text-black transition-colors">
                Terms
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-8 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Goozy. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      
      {/* Debug component for development */}
      <AuthDebug />
    </div>
  );
}
