import { formatPrice } from '../../utils/format';

/**
 * Cart summary showing totals
 * @param {Object} props
 * @param {Object} props.cart - Cart data
 * @param {boolean} [props.showShipping] - Whether to show shipping estimate
 */
export default function CartSummary({ cart, showShipping = false }) {
  const subtotal = cart?.subtotal || 0;
  const itemCount = cart?.itemCount || 0;

  // Estimate shipping (free over $100)
  const shippingEstimate = subtotal >= 10000 ? 0 : 500;
  const estimatedTotal = subtotal + (showShipping ? shippingEstimate : 0);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-surface-600">
          Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})
        </span>
        <span className="font-medium text-surface-900">{formatPrice(subtotal)}</span>
      </div>

      {showShipping && (
        <div className="flex justify-between text-sm">
          <span className="text-surface-600">Shipping estimate</span>
          <span className="font-medium text-surface-900">
            {shippingEstimate === 0 ? 'Free' : formatPrice(shippingEstimate)}
          </span>
        </div>
      )}

      {showShipping && subtotal > 0 && subtotal < 10000 && (
        <p className="text-xs text-green-600">
          Add {formatPrice(10000 - subtotal)} more for free shipping!
        </p>
      )}

      <div className="border-t border-surface-100 pt-3">
        <div className="flex justify-between">
          <span className="font-medium text-surface-900 tracking-tight">
            {showShipping ? 'Estimated total' : 'Subtotal'}
          </span>
          <span className="font-semibold text-surface-900 tracking-tight">
            {formatPrice(showShipping ? estimatedTotal : subtotal)}
          </span>
        </div>
      </div>

      {!showShipping && (
        <p className="text-xs text-surface-500">
          Shipping and taxes calculated at checkout
        </p>
      )}
    </div>
  );
}
