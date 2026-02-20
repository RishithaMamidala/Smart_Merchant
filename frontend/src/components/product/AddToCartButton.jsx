import { useState } from 'react';
import { useCart } from '../../hooks/useCart';

/**
 * Add to cart button with quantity selector
 * @param {Object} props
 * @param {Object} props.variant - Selected variant
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 */
export default function AddToCartButton({ variant, disabled = false, className = '' }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem, isAdding, addError } = useCart();

  const maxQuantity = variant?.inventory || 10;
  const inStock = variant?.inStock ?? (maxQuantity > 0);

  const handleAddToCart = () => {
    if (!variant || !inStock) return;

    addItem({ variantId: variant.id || variant._id, quantity });
    setQuantity(1); // Reset quantity after adding
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    setQuantity((prev) => Math.min(maxQuantity, prev + 1));
  };

  if (!inStock) {
    return (
      <button
        disabled
        className={`w-full py-3.5 px-6 bg-surface-200 text-surface-400 font-semibold rounded-xl cursor-not-allowed ${className}`}
      >
        Out of Stock
      </button>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {addError && (
        <p className="text-sm text-red-600">
          {addError.response?.data?.message || 'Failed to add item. Please try again.'}
        </p>
      )}
      <div className="flex gap-3">
      {/* Quantity selector */}
      <div className="flex items-center border-2 border-surface-200 rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={quantity <= 1}
          className="px-3.5 py-3 text-surface-600 hover:text-surface-900 hover:bg-surface-50 disabled:text-surface-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="px-3 py-3 text-surface-900 font-semibold min-w-[3rem] text-center tabular-nums">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increaseQuantity}
          disabled={quantity >= maxQuantity}
          className="px-3.5 py-3 text-surface-600 hover:text-surface-900 hover:bg-surface-50 disabled:text-surface-300 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Add to cart button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={disabled || isAdding}
        className="flex-1 py-3.5 px-6 bg-surface-900 hover:bg-surface-800 text-white font-semibold rounded-xl transition-all shadow-soft hover:shadow-soft-lg disabled:bg-surface-400 disabled:cursor-not-allowed active:scale-[0.98]"
      >
        {isAdding ? (
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
            Adding...
          </span>
        ) : (
          'Add to Cart'
        )}
      </button>
      </div>
    </div>
  );
}
