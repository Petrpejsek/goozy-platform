'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import MultiStepCreatorForm from "@/components/MultiStepCreatorForm";
import BrandForm from "@/components/BrandForm";
import AuthHeader from "@/components/AuthHeader";
import AuthDebug from "@/components/AuthDebug";

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

// Helper function for fetch with timeout
const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// Login Modal Component
const LoginModal = ({ isOpen, onClose, type }: { isOpen: boolean; onClose: () => void; type: 'creator' | 'brand' }) => {
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
      const endpoint = type === 'creator' ? '/api/auth/creator/login' : '/api/auth/brand/login';
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
    if (type === 'creator') {
          window.location.href = '/creator/dashboard';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
         onClick={(e) => e.target === e.currentTarget && onClose()}>
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
            {type === 'creator' ? 'Creator Login' : 'Brand Login'}
          </h2>
          <p className="text-gray-600">
            {type === 'creator' 
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
                if (type === 'creator') {
                  document.getElementById('creator-form')?.scrollIntoView({ behavior: 'smooth' });
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
  authType?: 'creator' | 'brand';
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

const BrandLoginButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-white text-black border-2 border-black px-6 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-all duration-300 text-center"
      >
        Brand Login
      </button>
      {showModal && (
        <LoginModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          type="brand"
        />
      )}
    </>
  );
};

const CreatorLoginButton = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors text-center"
      >
        Creator Login
      </button>
      {showModal && (
        <LoginModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
          type="creator"
        />
      )}
    </>
  );
};

export default function Home() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'creator' | 'brand' | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Identická auth logika jako v AuthHeader
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (typeof window === 'undefined') {
        setIsAuthLoading(false);
        return;
      }

      // Zkusíme creator token
      const creatorToken = localStorage.getItem('creator_token') || sessionStorage.getItem('creator_token');
      
      if (creatorToken) {
        try {
          const response = await fetchWithTimeout('/api/creator/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${creatorToken}`,
              'Content-Type': 'application/json'
            }
          }, 5000);

          if (response.ok) {
            const data = await response.json();
            const creator = data.creator || data;
            const newUser = {
              id: creator.id || 'unknown-id',
              name: creator.name || 'Unknown User',
              email: creator.email || 'No email',
              avatar: creator.avatar
            };
            setUser(newUser);
            setUserType('creator');
            setIsAuthLoading(false);
            return;
          } else {
            localStorage.removeItem('creator_token');
            localStorage.removeItem('creator_user');
            sessionStorage.removeItem('creator_token');
            sessionStorage.removeItem('creator_user');
          }
        } catch (creatorError) {
          console.warn('⚠️ Creator auth check failed:', creatorError);
        }
      }

      try {
        // Zkusíme brand auth
        const brandResponse = await fetchWithTimeout('/api/auth/brand/verify', {
          method: 'GET',
          credentials: 'include'
        }, 5000);

        if (brandResponse.ok) {
          const data = await brandResponse.json();
          setUser({
            id: data.user.brandId || 'unknown-brand-id',
            name: data.user.brandName || 'Unknown Brand',
            email: data.user.email || 'No email'
          });
          setUserType('brand');
          setIsAuthLoading(false);
          return;
        }
      } catch (brandError) {
        console.warn('⚠️ Brand auth check failed:', brandError);
      }

      setUser(null);
      setUserType(null);
      setIsAuthLoading(false);

    } catch (error) {
      console.error('❌ Error checking auth status:', error);
      setUser(null);
      setUserType(null);
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (userType === 'creator') {
        localStorage.removeItem('creator_token');
        localStorage.removeItem('creator_user');
        sessionStorage.removeItem('creator_token');
        sessionStorage.removeItem('creator_user');
      } else if (userType === 'brand') {
        await fetchWithTimeout('/api/auth/brand/logout', {
          method: 'POST',
          credentials: 'include'
        }, 5000);
      }
      
      setUser(null);
      setUserType(null);
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      console.error('❌ Logout error:', error);
      setUser(null);
      setUserType(null);
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
      router.push('/');
    }
  };

  const getDashboardLink = () => {
    if (userType === 'creator') return '/creator/dashboard';
    if (userType === 'brand') return '/partner-company';
    return '/';
  };

  const getProfileLink = () => {
    if (userType === 'creator') return '/creator/profile';
    if (userType === 'brand') return '/partner-company/settings';
    return '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 scroll-smooth">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - IDENTICKÁ LOGIKA JAKO AuthHeader */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Mobile menu header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-black tracking-tight">
              GOOZY
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 touch-target"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu content - na základě auth stavu */}
        <nav className="p-4">
          {isAuthLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : !user ? (
            // NEPŘIHLÁŠENÝ STAV - identická struktura jako AuthHeader
            <>
              <div className="space-y-2">
                <div className="py-2">
                  <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">For Creators</h3>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/creators"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      How It Works
                    </Link>
                    <a
                      href="#creator-form"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                    >
                      Apply Now
                    </a>
                    <Link
                      href="/creator/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                    >
                      Log In
                    </Link>
                  </div>
                </div>

                <div className="py-2">
                  <h3 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">For Brands</h3>
                  <div className="mt-2 space-y-1">
                    <Link
                      href="/brands"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      How It Works
                    </Link>
                    <a
                      href="#brand-form"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                    >
                      Start Partnership
                    </a>
                    <Link
                      href="/brand/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                    >
                      Brand Login
                    </Link>
                  </div>
                </div>
              </div>
            </>
          ) : (
            // PŘIHLÁŠENÝ STAV - identická struktura jako AuthHeader
            <>
              <div className="px-4 py-2 border-b border-gray-100 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || 'Unknown User'}</p>
                    <p className="text-xs text-gray-500">{user.email || 'No email'}</p>
                    <p className="text-xs text-blue-600 font-medium">
                      {userType === 'creator' ? '✨ Creator' : '🏢 Brand Partner'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <Link
                  href={getDashboardLink()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                
                {userType === 'creator' && (
                  <>
                    <Link
                      href="/creator/dashboard/products"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Product Catalog
                    </Link>
                    <Link
                      href="/creator/dashboard/campaigns"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Campaigns
                    </Link>
                  </>
                )}
                
                {userType === 'brand' && (
                  <>
                    <Link
                      href="/partner-company/campaigns"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Campaigns
                    </Link>
                    <Link
                      href="/partner-company/promotions"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Promotions
                    </Link>
                    <Link
                      href="/partner-company/analytics"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Analytics
                    </Link>
                  </>
                )}
                
                <Link
                  href={getProfileLink()}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors rounded-lg"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors rounded-lg"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </>
          )}
        </nav>
      </div>

      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-2xl sm:text-3xl font-bold text-black tracking-tight hover:opacity-80 transition-opacity">
              GOOZY
            </Link>
          </div>
          <AuthHeader />

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-gray-700 hover:text-black p-2 -m-2 touch-target"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-8 sm:pb-12 lg:pt-20 lg:pb-20">
        <div className="max-w-4xl mx-auto text-center">
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 tracking-tight leading-tight">
            Your taste, made<br />
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">effortlessly</span><br />
            <span className="italic font-light text-gray-400">shoppable.</span>
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            The leading platform connecting micro & nano creators with brands.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16">
            <Link
              href="#creator-form"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold text-base sm:text-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-center"
            >
              Start Earning Today
            </Link>
            <Link
              href="#brand-form"
              className="w-full sm:w-auto text-gray-700 hover:text-black px-6 sm:px-8 py-3 sm:py-4 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-all duration-300 font-medium text-base sm:text-lg hover:scale-105 bg-white/50 backdrop-blur-sm text-center"
            >
              I'm a Brand
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Trust indicators */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">2500+</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Active Creators</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">46+</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Partner Brands</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">€45M+</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Total Revenue</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-black mb-2">96%</div>
              <div className="text-gray-600 font-medium text-sm sm:text-base">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features for Creators */}
      <section id="for-creators" className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 lg:py-32">
        <div id="how-it-works" className="absolute -top-32"></div>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 sm:mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black mb-4 sm:mb-6 tracking-tight">
              Some of our amazing brand<br />
              <span className="italic font-light text-gray-400">partners</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-12 sm:mb-16">
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
                  100% { transform: translateX(calc(-8 * (6rem + 2rem))); }
                }
                @keyframes scrollContinuousReverse {
                  0% { transform: translateX(calc(-8 * (6rem + 2rem))); }
                  100% { transform: translateX(0); }
                }
                .scroll-item {
                  flex-shrink: 0;
                  width: 6rem;
                  height: 6rem;
                  margin-right: 2rem;
                }
                @media (min-width: 640px) {
                  .scroll-item {
                    width: 8rem;
                    height: 8rem;
                    margin-right: 3rem;
                  }
                  @keyframes scrollContinuous {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(calc(-8 * (8rem + 3rem))); }
                  }
                  @keyframes scrollContinuousReverse {
                    0% { transform: translateX(calc(-8 * (8rem + 3rem))); }
                    100% { transform: translateX(0); }
                  }
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
          

        </div>
      </section>

      {/* Product Suite Section */}
      <section className="px-6 lg:px-8 py-32 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl lg:text-6xl font-bold text-black mb-6 tracking-tight">
            Everything you need to turn<br />
            <span className="italic font-light text-gray-400">influence into income</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16 font-light leading-relaxed">
            Connect with top brands, showcase products authentically, and earn from every sale.
          </p>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Personal Store</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                Your personalized storefront with curated products and your unique voice.
              </p>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Brand Partnerships</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                Connect with premium brands and access exclusive partnership opportunities.
              </p>
            </div>
            
            <div className="bg-white p-8 lg:p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-black">Real-time Analytics</h3>
              <p className="text-gray-800 leading-relaxed mb-6">
                Track your earnings, engagement, and sales performance in real-time.
              </p>
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

      {/* Creator Form Section */}
      <section id="creator-form" className="px-6 lg:px-8 py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Join the ultimate platform to monetize<br />
            <span className="italic font-light text-blue-200">your influence</span>
          </h2>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-8 font-light leading-relaxed">
            Join thousands of creators who are already earning with Goozy.
          </p>
          
          <div className="bg-white rounded-3xl shadow-xl">
            <MultiStepCreatorForm />
          </div>
        </div>
      </section>

      {/* Brand Section */}
      <section id="for-brands" className="px-6 lg:px-8 py-32 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col justify-center">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 tracking-tight leading-tight">
                Grow your brand with<br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">authentic</span><br />
                partnerships
              </h2>
              <p className="text-lg text-gray-600 mb-8 font-light leading-relaxed">
                Expand your reach through verified creators with a quality community. 
                Connect with micro and nano creators who truly engage with their audience.
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Verified Creators</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Access to a curated network of authentic content creators with engaged communities.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Automatic Integration</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Seamless connection with your existing warehouse and fulfillment systems.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Performance Analytics</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Real-time insights into sales, engagement, and campaign performance.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-sm">✓</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">Commission-Based</h4>
                    <p className="text-gray-600 text-base leading-relaxed">
                      Pay only for performance. No upfront costs or hidden fees.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <span className="block font-bold text-2xl text-gray-900">2,500+</span>
                    <span className="text-sm text-gray-600">Active Creators</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-2xl text-gray-900">8.5%</span>
                    <span className="text-sm text-gray-600">Avg Engagement</span>
                  </div>
                  <div className="text-center">
                    <span className="block font-bold text-2xl text-gray-900">48h</span>
                    <span className="text-sm text-gray-600">Setup Time</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div id="brand-form" className="bg-white/80 backdrop-blur-md p-8 lg:p-10 rounded-3xl border border-gray-200 shadow-lg">
                <h3 className="text-2xl font-bold mb-6 text-center">Start Collaborating</h3>
                <BrandForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Login Section */}
      <section className="px-6 lg:px-8 py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-8 text-xl">Already have an account?</p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <BrandLoginButton />
            <CreatorLoginButton />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6 tracking-tight">
              Frequently Asked<br />
              <span className="italic font-light text-gray-400">Questions</span>
            </h2>
            <p className="text-lg text-gray-600 font-light leading-relaxed">
              Everything you need to know about Goozy platform.
            </p>
          </div>

          <div className="space-y-4">
            {/* FAQ Item 1 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(1)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">How does Goozy work for creators?</h3>
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
                    Creators join our platform, get approved, and gain access to products from verified brands. 
                    You promote products through your content and earn commission on every sale made through your unique links.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 2 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(2)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">What commission rates can I expect?</h3>
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
                    Commission rates vary by brand and product category, typically ranging from 10-25%. 
                    Premium brands and exclusive partnerships may offer higher rates for top-performing creators.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 3 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(3)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">How do I get paid?</h3>
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
                    Payments are processed monthly via bank transfer or PayPal. You can track your earnings 
                    in real-time through your dashboard and receive detailed reports of all your sales.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 4 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(4)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">What are the requirements to join as a creator?</h3>
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
                  We welcome micro and nano creators with engaged audiences. While follower count matters, 
                  we prioritize engagement rate, content quality, and audience authenticity over pure numbers.
                </p>
                </div>
              )}
            </div>

            {/* FAQ Item 5 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(5)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">How can brands get started?</h3>
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
                    Brands can apply through our partnership form. After approval, you'll get access to our creator network, 
                    campaign management tools, and detailed analytics. Setup typically takes 48-72 hours.
                  </p>
                </div>
              )}
            </div>

            {/* FAQ Item 6 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => toggleFAQ(6)}
                className="w-full p-8 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-bold text-lg text-black">Is there any cost to join?</h3>
                <div className="flex-shrink-0 ml-4">
                  {openFAQ === 6 ? (
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
              {openFAQ === 6 && (
                <div className="px-8 pb-8">
                  <p className="text-gray-600 leading-relaxed">
                    Joining Goozy is completely free for creators. Brands operate on a commission-based model - 
                    you only pay when sales are made. No upfront costs or hidden fees.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Still have questions?</p>
            <Link 
              href="/contact" 
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 font-medium"
            >
              Contact Support
            </Link>
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
      
      {/* Debug component for development */}
      <AuthDebug />
    </div>
  );
}
