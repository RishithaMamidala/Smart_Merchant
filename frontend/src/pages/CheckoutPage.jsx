import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useLocation, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { useCart, useInvalidateCart } from '../hooks/useCart';
import { startCheckout, cancelCheckout } from '../services/checkoutService';
import { formatPrice } from '../utils/format';
import ShippingAddressForm from '../components/checkout/ShippingAddressForm';
import PaymentForm from '../components/checkout/PaymentForm';

// Initialize Stripe (use environment variable)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

/**
 * Checkout page with multi-step flow (requires login)
 */
export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { cart, isLoading: cartLoading, clearCart } = useCart();
  const invalidateCart = useInvalidateCart();

  const [step, setStep] = useState('shipping'); // 'shipping' | 'payment'
  const [checkoutSession, setCheckoutSession] = useState(null);
  const [shippingData, setShippingData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const paymentSucceededRef = useRef(false);

  // Redirect if cart is empty (must be before conditional returns but after all hooks)
  useEffect(() => {
    if (!cartLoading && isAuthenticated && (!cart?.items || cart.items.length === 0)) {
      navigate('/', { replace: true });
    }
  }, [cart, cartLoading, isAuthenticated, navigate]);

  // Cleanup checkout session on unmount (only if payment didn't succeed)
  useEffect(() => {
    return () => {
      if (checkoutSession?.checkoutSession?.id && !paymentSucceededRef.current) {
        cancelCheckout(checkoutSession.checkoutSession.id).catch(() => {
          // Ignore errors on cleanup
        });
      }
    };
  }, [checkoutSession]);

  // Redirect to login if not authenticated (after all hooks)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const handleShippingSubmit = async (data) => {
    setIsProcessing(true);
    setError('');

    try {
      const session = await startCheckout({
        shippingAddress: data.shippingAddress,
        customerEmail: data.customerEmail,
        customerName: data.customerName,
      });

      setCheckoutSession(session);
      setShippingData(data);
      setStep('payment');
    } catch (err) {
      console.error('Checkout error:', err.response?.data);
      const data = err.response?.data;
      if (data?.details?.length) {
        setError(data.details.map((d) => d.message).join(', '));
      } else {
        setError(data?.message || 'Failed to start checkout');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // Mark payment as succeeded so cleanup doesn't cancel the checkout session
    paymentSucceededRef.current = true;

    // Clear cart immediately so badge updates
    clearCart();
    invalidateCart();

    // Navigate to confirmation page with order details
    navigate('/order/confirmation', {
      state: {
        paymentIntentId: paymentIntent.id,
        email: shippingData?.customerEmail,
      },
      replace: true,
    });
  };

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed');
  };

  const handleBackToShipping = () => {
    // Cancel current checkout session
    if (checkoutSession?.checkoutSession?.id) {
      cancelCheckout(checkoutSession.checkoutSession.id).catch(() => {});
    }
    setCheckoutSession(null);
    setStep('shipping');
  };

  if (cartLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface-200 rounded w-1/3" />
          <div className="h-64 bg-surface-200 rounded" />
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-surface-700">Home</Link>
        <span>/</span>
        <Link to="/cart" className="hover:text-surface-700">Cart</Link>
        <span>/</span>
        <span className="text-surface-900">Checkout</span>
      </nav>

      <h1 className="text-2xl font-bold text-surface-900 mb-8">Checkout</h1>

      {/* Progress steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'shipping'
                ? 'bg-surface-900 text-white'
                : 'bg-accent-500 text-white'
            }`}
          >
            {step === 'shipping' ? '1' : '✓'}
          </div>
          <span className="ml-2 text-sm font-medium text-surface-900">Shipping</span>
        </div>

        <div className="w-16 h-0.5 bg-surface-200 mx-4" />

        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step === 'payment'
                ? 'bg-surface-900 text-white'
                : 'bg-surface-200 text-surface-500'
            }`}
          >
            2
          </div>
          <span
            className={`ml-2 text-sm font-medium ${
              step === 'payment' ? 'text-surface-900' : 'text-surface-500'
            }`}
          >
            Payment
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form area */}
        <div className="lg:col-span-2">
          {step === 'shipping' && (
            <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
              <ShippingAddressForm
                initialValues={shippingData || {}}
                onSubmit={handleShippingSubmit}
                isSubmitting={isProcessing}
              />
            </div>
          )}

          {step === 'payment' && checkoutSession && (
            <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6">
              <button
                onClick={handleBackToShipping}
                className="flex items-center text-sm text-surface-600 hover:text-surface-900 mb-4"
              >
                <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Shipping
              </button>

              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret: checkoutSession.checkoutSession.clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#292524',
                    },
                  },
                }}
              >
                <PaymentForm
                  amount={checkoutSession.checkoutSession.total}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </Elements>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6 sticky top-4">
            <h2 className="text-lg font-medium text-surface-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-3">
                  <img
                    src={item.product?.images?.[0] || '/placeholder-product.png'}
                    alt={item.product?.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-surface-900 truncate">
                      {item.product?.name}
                    </p>
                    <p className="text-xs text-surface-500">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-surface-900">
                    {formatPrice(item.variant?.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-surface-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-600">Subtotal</span>
                <span className="text-surface-900">
                  {formatPrice(checkoutSession?.checkoutSession?.subtotal || cart?.subtotal || 0)}
                </span>
              </div>

              {checkoutSession && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Shipping</span>
                    <span className="text-surface-900">
                      {checkoutSession.checkoutSession.shippingCost === 0
                        ? 'Free'
                        : formatPrice(checkoutSession.checkoutSession.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Tax</span>
                    <span className="text-surface-900">
                      {formatPrice(checkoutSession.checkoutSession.taxAmount)}
                    </span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-base font-medium pt-2 border-t border-surface-200">
                <span className="text-surface-900">Total</span>
                <span className="text-surface-900">
                  {formatPrice(checkoutSession?.checkoutSession?.total || cart?.subtotal || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
