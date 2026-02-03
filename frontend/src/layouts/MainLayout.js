import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  ShoppingCartIcon,
  ClipboardDocumentListIcon,
  WalletIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';

const MainLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = user ? [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Buy Data', href: '/buy-data', icon: ShoppingCartIcon },
    { name: 'Transactions', href: '/transactions', icon: ClipboardDocumentListIcon },
    { name: 'Wallet', href: '/wallet', icon: WalletIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ] : [];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OE</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  OPTIMISTIC EMPIRE
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 transition-colors"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Admin</span>
                    </Link>
                  )}
                  <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{user.firstName}</p>
                      <p className="text-xs text-gray-500">GHS {user.walletBalance?.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn btn-primary"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              {user ? (
                <div className="space-y-2">
                  <div className="px-4 py-2 bg-gray-50 rounded-lg mb-4">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500">Balance: GHS {user.walletBalance?.toFixed(2)}</p>
                  </div>
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                        isActive(link.href)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.name}</span>
                    </Link>
                  ))}
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-purple-600 hover:bg-purple-50"
                    >
                      <Cog6ToothIcon className="h-5 w-5" />
                      <span>Admin Panel</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-2 bg-primary-600 text-white rounded-lg text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {user && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
          <div className="flex justify-around items-center h-16">
            {navLinks.slice(0, 4).map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 ${
                  isActive(link.href)
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <link.icon className={`h-6 w-6 ${isActive(link.href) ? 'text-primary-600' : 'text-gray-400'}`} />
                <span className="text-xs mt-1 truncate">{link.name.split(' ')[0]}</span>
              </Link>
            ))}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1 text-gray-500"
            >
              <Bars3Icon className="h-6 w-6 text-gray-400" />
              <span className="text-xs mt-1">More</span>
            </button>
          </div>
        </nav>
      )}

      {/* Footer - Hidden on mobile when logged in */}
      <footer className="bg-gray-900 text-gray-300 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">OE</span>
                </div>
                <span className="text-xl font-bold text-white">OPTIMISTIC EMPIRE</span>
              </div>
              <p className="text-sm text-gray-400 max-w-md">
                Your trusted platform for affordable data bundles in Ghana.
                Buy MTN, Telecel, and AirtelTigo data with instant delivery and secure payments.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/buy-data" className="hover:text-white transition-colors">Buy Data</Link></li>
                <li><Link to="/wallet" className="hover:text-white transition-colors">Wallet</Link></li>
                <li><Link to="/transactions" className="hover:text-white transition-colors">Transactions</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Networks</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-mtn rounded-full"></span>
                  <span>MTN Ghana</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-telecel rounded-full"></span>
                  <span>Telecel</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-3 h-3 bg-airteltigo rounded-full"></span>
                  <span>AirtelTigo</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} OPTIMISTIC EMPIRE. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
