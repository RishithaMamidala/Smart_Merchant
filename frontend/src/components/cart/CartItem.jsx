import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { useCart } from '../../hooks/useCart';

/**
 * Single cart item component
 * @param {Object} props
 * @param {Object} props.item - Cart item data
 */
export default function CartItem({ item }) {
  const { updateItem, removeItem, isUpdating, isRemoving, updateError } = useCart();
  const isLoading = isUpdating || isRemoving;

  const { variantId, quantity, variant, product } = item;
  const image = product?.image || product?.images?.[0] || '/placeholder-product.png';
  const name = product?.name || 'Product';
  const variantName = variant?.optionValues
    ?.map((ov) => ov.value)
    .join(' / ');
  const price = variant?.price || 0;
  const maxQuantity = variant?.inventory || 10;

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) {
      removeItem(variantId);
    } else if (newQuantity <= maxQuantity) {
      updateItem({ variantId, quantity: newQuantity });
    }
  };

  return (
    <div className={`flex gap-4 py-4 ${isLoading ? 'opacity-50' : ''}`}>
      {/* Product image */}
      <Link
        to={`/products/${product?.slug}`}
        className="w-20 h-20 flex-shrink-0 bg-surface-100 rounded-xl overflow-hidden"
      >
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </Link>

      {/* Product details */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/products/${product?.slug}`}
          className="text-sm font-medium text-surface-900 hover:text-primary-600 line-clamp-1"
        >
          {name}
        </Link>

        {variantName && (
          <p className="text-sm text-surface-500 mt-0.5">{variantName}</p>
        )}

        <p className="text-sm font-medium text-surface-900 mt-1">
          {formatPrice(price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={isLoading}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:border-surface-400 disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          <span className="text-sm font-medium text-surface-900 min-w-[1.5rem] text-center">
            {quantity}
          </span>

          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={isLoading || quantity >= maxQuantity}
            className="w-6 h-6 flex items-center justify-center rounded-lg border border-surface-200 text-surface-600 hover:border-surface-400 disabled:opacity-50"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>

          <button
            type="button"
            onClick={() => removeItem(variantId)}
            disabled={isLoading}
            className="ml-auto text-sm text-red-600 hover:text-red-500 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
        {updateError && (
          <p className="text-xs text-red-600 mt-1">
            {updateError.response?.data?.message || 'Update failed'}
          </p>
        )}
      </div>
    </div>
  );
}
