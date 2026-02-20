import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { formatPrice } from '../../utils/format';

/**
 * Stripe payment form component
 * @param {Object} props
 * @param {number} props.amount - Total amount in cents
 * @param {Function} props.onSuccess - Callback on successful payment
 * @param {Function} props.onError - Callback on payment error
 */
export default function PaymentForm({ amount, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/order/confirmation`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'An error occurred during payment.');
        onError?.(error);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess?.(paymentIntent);
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred.');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-xl text-surface-900 mb-4">
          Payment Details
        </h3>

        <div className="border-2 border-surface-200 rounded-xl p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{errorMessage}</p>
        </div>
      )}

      <div className="border-t border-surface-200 pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-medium text-surface-900">Total</span>
          <span className="text-xl font-bold text-surface-900">
            {formatPrice(amount)}
          </span>
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full py-3 px-4 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-colors disabled:bg-surface-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            `Pay ${formatPrice(amount)}`
          )}
        </button>
      </div>

      <p className="text-xs text-surface-500 text-center">
        Your payment is secured by Stripe. We never store your card details.
      </p>
    </form>
  );
}
