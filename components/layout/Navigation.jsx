import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Plus, Info, Mail, User, User2, LogOut } from 'lucide-react';
import { auth } from '../../app/login/firebase'; // adjust path if needed
import { onAuthStateChanged, signOut } from 'firebase/auth';

const Navigation = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setIsLoggedIn(!!user));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login'); // redirect to login page after logout
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/create', label: 'Create Product', icon: Plus },
    { href: '/dashboard', label: 'Dashboard', icon: User2, requiresAuth: true },
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
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                Marketplace Assistant
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
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
                    className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeClass}`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900 p-2">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
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
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <Icon size={16} />
                          <span>{item.label}</span>
                        </Link>
                      )}
                      {isLoggedIn && (
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                        >
                          <LogOut size={16} />
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
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.href)
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
