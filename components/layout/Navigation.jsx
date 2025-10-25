import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Plus, Info, Mail, User, User2, LogOut, CreditCard, ChevronDown } from 'lucide-react';
import { auth } from '../../app/login/firebase'; // adjust path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SiginLoader from '@/components/animated icon/SiginLoding.jsx';
import Search from '@/components/animated icon/Search.jsx';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userInitials, setUserInitials] = useState('');
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const prevLoggedInRef = useRef(null);
  const authTimeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      const newLoggedIn = !!user;
      // On subsequent state flips (not initial mount), show loader
      if (prevLoggedInRef.current !== null && prevLoggedInRef.current !== newLoggedIn) {
        setAuthAction(newLoggedIn ? 'login' : 'logout');
        setIsProcessingAuth(true);
        if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
        authTimeoutRef.current = setTimeout(() => setIsProcessingAuth(false), 4000);
      }
      prevLoggedInRef.current = newLoggedIn;
      setIsLoggedIn(newLoggedIn);
      
      // Set user email and initials
      if (user) {
        setUserEmail(user.email || '');
        const name = user.displayName || user.email || 'User';
        const initials = name
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
        setUserInitials(initials);
      } else {
        setUserEmail('');
        setUserInitials('');
      }
    });
    return () => {
      unsub();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAvatarDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      setAuthAction('logout');
      setIsProcessingAuth(true);
      await signOut(auth);
      router.push('/'); // redirect to home page after logout
    } catch (e) {
      console.error('Logout failed:', e);
      setIsProcessingAuth(false);
    }
  };

  const closeMobile = () => setMobileOpen(false);

  // Navigation items for logged-in users (shown in avatar dropdown)
  const userMenuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: User2 },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/create', label: 'Create Product', icon: Plus },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
  ];

  // Navigation items for non-logged-in users
  const publicNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/about', label: 'About', icon: Info },
    { href: '/contact', label: 'Contact', icon: Mail },
    { href: '/login', label: 'Login', icon: User2 },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {isProcessingAuth && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
          <SiginLoader />
          <div className="mt-4 text-center">
            <div className="text-gray-900 text-xl md:text-2xl font-bold mb-2">
              UrbanSwap
            </div>
            <div className="text-gray-900 text-base md:text-lg font-medium">
              {authAction === 'logout' ? 'Logging you out...' : 'Logging you in...'}
            </div>
          </div>
        </div>
      )}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo/Brand */}
            <div className="flex items-center min-w-0">
              <Link href="/" className="flex items-center space-x-2" aria-label="Home" onClick={closeMobile}>
                <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center">
                  <Image
                    src="/images/Screenshot 2025-09-20 165808.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <span className="-ml-2 text-sm sm:text-base md:text-lg font-bold text-gray-900">UrbanSwap</span>
              </Link>
            </div>

            {/* Search Bar and Checkout - Only show for logged in users */}
            {isLoggedIn && (
              <div className="hidden md:flex flex-1 max-w-2xl mx-8 items-center space-x-4">
                <div className="flex-1">
                  <Search value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </div>
                <Link href="/checkout" className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50 whitespace-nowrap">
                  <CreditCard size={16} />
                  <span>Checkout</span>
                </Link>
              </div>
            )}

            {/* Navigation Links - Center for non-logged in users */}
            {!isLoggedIn && (
              <div className="hidden md:flex flex-1 items-center justify-center space-x-12">
                {publicNavItems.map((item) => {
                  const Icon = item.icon;
                  const activeClass = isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeClass}`}
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Avatar Dropdown - Right side for logged in users */}
            {isLoggedIn && (
              <div className="hidden md:flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors"
                    title={userEmail}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold">
                      {userInitials}
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${avatarDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {avatarDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{userEmail}</p>
                      </div>
                      {userMenuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setAvatarDropdownOpen(false)}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Icon size={16} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                      <div className="border-t border-gray-200 mt-2 pt-2">
                        <button
                          onClick={() => {
                            setAvatarDropdownOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                className="text-gray-700 hover:text-gray-900 p-2 rounded-md active:scale-95 transition"
                onClick={() => setMobileOpen((o) => !o)}
              >
                {mobileOpen ? (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className={`md:hidden overflow-hidden transition-[max-height] duration-300 ${mobileOpen ? 'max-h-[480px]' : 'max-h-0'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isLoggedIn ? (
                // Mobile user menu
                <>
                  {userMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMobile}
                        className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                          isActive(item.href)
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                  <button
                    onClick={() => {
                      closeMobile();
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors text-red-600 hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                // Mobile public menu
                publicNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobile}
                      className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-blue-600 bg-blue-50'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
