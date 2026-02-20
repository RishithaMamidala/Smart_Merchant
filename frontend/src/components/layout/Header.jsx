import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCartIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { selectIsAuthenticated, selectUserType, selectCurrentUser, logout } from '../../store/slices/authSlice.js';
import { selectCartItemCount, openCartDrawer } from '../../store/slices/cartSlice.js';

/**
 * Main header component for storefront
 */
export function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const userType = useSelector(selectUserType);
  const user = useSelector(selectCurrentUser);
  const cartItemCount = useSelector(selectCartItemCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  const handleCartClick = () => {
    dispatch(openCartDrawer());
  };

  const handleLogout = () => {
    setProfileMenuOpen(false);
    dispatch(logout());
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [profileMenuOpen]);

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-surface-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-surface-900 rounded-lg flex items-center justify-center group-hover:bg-primary-600 transition-colors">
              <span className="text-white font-display text-sm">S</span>
            </div>
            <span className="font-display text-xl text-surface-900">Smart Merchant</span>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
            >
              Shop
            </Link>
            <Link
              to="/products"
              className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
            >
              Products
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart button */}
            <button
              onClick={handleCartClick}
              className="relative p-2.5 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
              aria-label="Open cart"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-2xs font-bold rounded-full h-4.5 w-4.5 min-w-[18px] h-[18px] flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User menu */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {userType === 'merchant' ? (
                  <Link
                    to="/dashboard"
                    className="btn btn-primary text-sm !py-2 !px-4"
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                      className="flex items-center gap-2 p-2 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center">
                        <span className="text-xs font-semibold">
                          {user?.firstName?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="text-sm font-medium hidden sm:block">
                        {user?.firstName || 'Account'}
                      </span>
                      <svg className="w-4 h-4 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {profileMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-surface-100 py-1 z-50 animate-fade-in">
                        <Link
                          to="/account"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50"
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          onClick={() => setProfileMenuOpen(false)}
                          className="block px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50"
                        >
                          Order History
                        </Link>
                        <div className="border-t border-surface-100 my-1" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary text-sm !py-2"
                >
                  Get started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-5 w-5" />
              ) : (
                <Bars3Icon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-surface-100 bg-white animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
            >
              Shop
            </Link>
            <Link
              to="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
            >
              Products
            </Link>
            {isAuthenticated ? (
              <div className="pt-3 border-t border-surface-100 mt-3 space-y-1">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                >
                  My Account
                </Link>
                <Link
                  to="/account/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                >
                  Order History
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="block w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-3 border-t border-surface-100 mt-3 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-surface-600 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block btn btn-primary text-sm text-center"
                >
                  Get started
                </Link>
                <Link
                  to="/merchant/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-surface-900 hover:bg-surface-100 rounded-xl transition-all text-center"
                >
                  Merchant Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
