import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginCustomer } from '../../store/slices/authSlice.js';
import { useInvalidateCart } from '../../hooks/useCart.js';
import { getSessionId } from '../../utils/sessionId.js';
import { InlineLoading } from '../../components/ui/Loading.jsx';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading } = useSelector((state) => state.cart);
  const invalidateCart = useInvalidateCart();

  const from = location.state?.from?.pathname || '/';
  const isCheckoutRedirect = from === '/checkout';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await dispatch(loginCustomer({ email, password, sessionId: getSessionId() })).unwrap();
      invalidateCart();
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-8 space-y-8">
          <div>
            <h2 className="text-center font-display text-3xl text-surface-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-surface-600">
              Or{' '}
              <Link
                to="/register"
                state={location.state}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                create a new account
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isCheckoutRedirect && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-blue-700">Please sign in to continue to checkout.</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-surface-600 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:border-surface-900 focus:outline-none transition-colors"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-surface-600 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:border-surface-900 focus:outline-none transition-colors"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isLoading ? <InlineLoading /> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-surface-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-surface-500">
                  Continue as guest
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Continue shopping without an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
