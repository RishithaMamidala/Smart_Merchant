import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerMerchant } from '../../store/slices/authSlice.js';
import { InlineLoading } from '../../components/ui/Loading.jsx';

export default function MerchantRegisterPage() {
  const [formData, setFormData] = useState({
    storeName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      await dispatch(
        registerMerchant({
          storeName: formData.storeName,
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err || 'Registration failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-8 space-y-8">
          <div>
            <h2 className="text-center font-display text-3xl text-surface-900">
              Create merchant account
            </h2>
            <p className="mt-2 text-center text-sm text-surface-600">
              Already have an account?{' '}
              <Link
                to="/merchant/login"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Sign in
              </Link>
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
                <label htmlFor="storeName" className="block text-sm font-semibold text-surface-600 mb-1">
                  Store name
                </label>
                <input
                  id="storeName"
                  name="storeName"
                  type="text"
                  required
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:border-surface-900 focus:outline-none transition-colors"
                  placeholder="Your store name"
                />
              </div>

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
                  value={formData.email}
                  onChange={handleChange}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:border-surface-900 focus:outline-none transition-colors"
                  placeholder="Password"
                />
                <p className="mt-1 text-xs text-surface-500">Must be at least 8 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-surface-600 mb-1">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-surface-200 rounded-xl text-surface-900 placeholder-surface-400 focus:border-surface-900 focus:outline-none transition-colors"
                  placeholder="Confirm password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-all disabled:opacity-50"
              >
                {isSubmitting ? <InlineLoading /> : 'Create merchant account'}
              </button>
            </div>

            <p className="text-xs text-center text-surface-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>

          <div className="text-center">
            <Link
              to="/"
              className="text-sm font-medium text-surface-500 hover:text-surface-700"
            >
              Back to storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
