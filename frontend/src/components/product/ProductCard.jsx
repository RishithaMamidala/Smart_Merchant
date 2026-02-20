import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

/**
 * Product card component for grid displays
 * @param {Object} props
 * @param {Object} props.product
 */
export default function ProductCard({ product }) {
  const { slug, name, images, basePrice, priceRange, inStock } = product;

  // Use priceRange from API if available
  const minPrice = priceRange?.min || basePrice;
  const maxPrice = priceRange?.max || basePrice;
  const hasRange = minPrice !== maxPrice;

  // Get primary image URL (images are objects with url property)
  const primaryImage = images?.[0]?.url || images?.[0] || '/placeholder-product.png';

  return (
    <Link
      to={`/products/${slug}`}
      className="group block bg-white rounded-2xl border border-surface-100 hover:border-surface-200 hover:shadow-soft-lg transition-all duration-300 overflow-hidden"
    >
      <div className="aspect-[4/5] relative overflow-hidden bg-surface-100">
        <img
          src={primaryImage}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
          loading="lazy"
        />
        {!inStock && (
          <div className="absolute inset-0 bg-surface-950/50 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge bg-white text-surface-700">
              Sold Out
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-surface-900 font-medium text-sm leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-primary-700 transition-colors">
          {name}
        </h3>

        <div className="mt-2">
          {hasRange ? (
            <p className="text-surface-900 font-semibold text-base">
              {formatPrice(minPrice)}<span className="text-surface-400 font-normal text-sm"> &ndash; </span>{formatPrice(maxPrice)}
            </p>
          ) : (
            <p className="text-surface-900 font-semibold text-base">
              {formatPrice(minPrice || basePrice)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
