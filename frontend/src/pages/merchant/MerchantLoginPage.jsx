import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginMerchant } from '../../store/slices/authSlice.js';
import { InlineLoading } from '../../components/ui/Loading.jsx';

export default function MerchantLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await dispatch(loginMerchant({ email, password })).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err || 'Login failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-8 space-y-8">
          <div>
            <h2 className="text-center font-display text-3xl text-surface-900">
              Merchant Dashboard
            </h2>
            <p className="mt-2 text-center text-sm text-surface-600">
              Sign in to manage your store
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                disabled={isSubmitting}
                className="w-full py-3 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? <InlineLoading /> : 'Sign in'}
              </button>
            </div>
          </form>

          <div className="text-center space-y-3">
            <p className="text-sm text-surface-600">
              Don&apos;t have a merchant account?{' '}
              <Link
                to="/merchant/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Create one
              </Link>
            </p>
            <p className="text-sm text-surface-500">
              <Link
                to="/"
                className="font-medium text-surface-500 hover:text-surface-700"
              >
                Back to storefront
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
