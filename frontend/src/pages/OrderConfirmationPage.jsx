import { useEffect, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { getOrder } from '../services/checkoutService';
import { formatPrice, formatDate } from '../utils/format';

/**
 * Order confirmation page shown after successful payment
 */
export default function OrderConfirmationPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Get order details from state or URL params
  const stateData = location.state;
  const orderNumber = searchParams.get('order');
  const email = stateData?.email || searchParams.get('email');

  useEffect(() => {
    const fetchOrder = async () => {
      // If we have the order number, fetch it
      if (orderNumber) {
        try {
          const orderData = await getOrder(orderNumber, email);
          setOrder(orderData);
        } catch (err) {
          setError('Unable to load order details');
        }
      }
      setIsLoading(false);
    };

    // Add a small delay to allow webhook to process
    const timer = setTimeout(fetchOrder, 2000);
    return () => clearTimeout(timer);
  }, [orderNumber, email]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary-600 rounded-full border-t-transparent mx-auto mb-4" />
        <p className="text-surface-600">Processing your order...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Success message */}
      <div className="text-center mb-8 animate-fade-in-up">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="font-display text-3xl font-bold text-surface-900 mb-2">
          Thank you for your order!
        </h1>

        <p className="text-surface-600">
          Your payment was successful. We've sent a confirmation email to{' '}
          <span className="font-medium">{email || 'your email address'}</span>.
        </p>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
          <p className="text-sm text-yellow-800">
            {error}. Don't worry - your payment was processed successfully.
            You'll receive an email confirmation shortly.
          </p>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden mb-8">
          {/* Order header */}
          <div className="bg-surface-50 px-6 py-4 border-b border-surface-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-surface-500">Order number</p>
                <p className="text-lg font-semibold text-surface-900">
                  {order.orderNumber}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-surface-500">Order date</p>
                <p className="text-surface-900">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Order items */}
          <div className="px-6 py-4">
            <h3 className="text-sm font-medium text-surface-900 mb-3">Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <div>
                    <p className="text-surface-900">
                      {item.productName}
                      {item.variantName && (
                        <span className="text-surface-500"> - {item.variantName}</span>
                      )}
                    </p>
                    <p className="text-surface-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-surface-900 font-medium">
                    {formatPrice(item.totalPrice)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Order totals */}
          <div className="bg-surface-50 px-6 py-4 border-t border-surface-100">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-surface-600">Subtotal</span>
                <span className="text-surface-900">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Shipping</span>
                <span className="text-surface-900">
                  {order.shippingCost === 0 ? 'Free' : formatPrice(order.shippingCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-surface-600">Tax</span>
                <span className="text-surface-900">{formatPrice(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-surface-200 font-medium">
                <span className="text-surface-900">Total</span>
                <span className="text-surface-900">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address */}
          {order.shippingAddress && (
            <div className="px-6 py-4 border-t border-surface-100">
              <h3 className="text-sm font-medium text-surface-900 mb-2">
                Shipping Address
              </h3>
              <address className="text-sm text-surface-600 not-italic">
                {order.shippingAddress.fullName}<br />
                {order.shippingAddress.addressLine1}<br />
                {order.shippingAddress.addressLine2 && (
                  <>{order.shippingAddress.addressLine2}<br /></>
                )}
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
              </address>
            </div>
          )}
        </div>
      )}

      {/* If no order loaded, show basic confirmation */}
      {!order && !error && (
        <div className="bg-white rounded-2xl shadow-soft border border-surface-100 p-6 mb-8">
          <p className="text-surface-600 text-center">
            Your order is being processed. You'll receive an email with your order
            details and tracking information once your items ship.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          to="/products"
          className="btn btn-primary px-6 py-3 bg-surface-900 text-white font-semibold rounded-xl hover:bg-surface-800 transition-colors text-center"
        >
          Continue Shopping
        </Link>

        {order && (
          <Link
            to={`/orders/${order.orderNumber}?email=${encodeURIComponent(email || '')}`}
            className="btn btn-outline px-6 py-3 border-2 border-surface-200 text-surface-700 font-semibold rounded-xl hover:bg-surface-50 transition-colors text-center"
          >
            View Order Details
          </Link>
        )}
      </div>
    </div>
  );
}
