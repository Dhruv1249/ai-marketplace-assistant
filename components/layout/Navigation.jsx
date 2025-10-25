import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Plus, Info, Mail, User, User2, LogOut, CreditCard } from 'lucide-react';
import { auth } from '../../app/login/firebase'; // adjust path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SiginLoader from '@/components/animated icon/SiginLoding.jsx';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevLoggedInRef = useRef(null);
  const authTimeoutRef = useRef(null);

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
    });
    return () => {
      unsub();
      if (authTimeoutRef.current) clearTimeout(authTimeoutRef.current);
    };
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

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/create', label: 'Create Product', icon: Plus, requiresAuth: true },
    { href: '/dashboard', label: 'Dashboard', icon: User2, requiresAuth: true },
    { href: '/checkout', label: 'Checkout', icon: CreditCard },
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
          <div className="mt-2 text-gray-900 text-base md:text-lg font-medium">
            {authAction === 'logout' ? 'Logging you out...' : 'Logging you in...'}
          </div>
        </div>
      )}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
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
              <span className="hidden xs:inline ml-1.5 text-base sm:text-xl font-semibold text-gray-900 truncate">MarketplaceAssistant</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className={`hidden md:flex items-center space-x-8 ${!isLoggedIn ? 'flex-1 justify-center' : ''}`}>
            {navItems
              .filter((item) => !item.requiresAuth || isLoggedIn) // 👈 Only show Dashboard if logged in
              .map((item) => {
                const Icon = item.icon;
                const activeClass = isActive(item.href)
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

                if (item.href === '/login') {
                  // Show Login only if NOT logged in
                  return (
                    <React.Fragment key="auth-buttons">
                      {!isLoggedIn && (
                        <Link
                          href={item.href}
                          className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeClass}`}
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      )}
                    </React.Fragment>
                  );
                }

                // Default: Next.js Link
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

          {/* Right spacer to balance logo when logged out */}
          {!isLoggedIn && (
            <div className="hidden md:flex items-center opacity-0 pointer-events-none" aria-hidden="true">
              <div className="w-8 h-8" />
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
            {navItems
              .filter((item) => !item.requiresAuth || isLoggedIn)
              .map((item) => {
                const Icon = item.icon;

                if (item.href === '/login') {
                  return (
                    <React.Fragment key="auth-buttons-mobile">
                      {!isLoggedIn && (
                        <Link
                          href={item.href}
                          onClick={closeMobile}
                          className="flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Icon size={18} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={() => { handleLogout(); closeMobile(); }}
                          className="w-full text-left flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <LogOut size={18} />
                          <span>Logout</span>
                        </button>
                      )}
                    </React.Fragment>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={`flex items-center space-x-2 px-3 py-3 rounded-md text-base font-medium transition-colors whitespace-nowrap ${
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
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navigation;
