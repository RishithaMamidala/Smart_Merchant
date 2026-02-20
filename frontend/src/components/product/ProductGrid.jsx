import ProductCard from './ProductCard';

/**
 * Grid layout for displaying products
 * @param {Object} props
 * @param {Object[]} props.products
 * @param {boolean} [props.isLoading]
 * @param {string} [props.emptyMessage]
 */
export default function ProductGrid({
  products,
  isLoading = false,
  emptyMessage = 'No products found',
}) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-100 mb-4">
          <svg className="w-7 h-7 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <p className="text-surface-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {products.map((product) => (
        <ProductCard key={product._id || product.slug} product={product} />
      ))}
    </div>
  );
}

/**
 * Skeleton loader for product card
 */
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-surface-100 overflow-hidden">
      <div className="aspect-[4/5] bg-surface-100 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-surface-100 rounded-lg w-3/4 animate-pulse" />
        <div className="h-4 bg-surface-100 rounded-lg w-1/2 animate-pulse" />
        <div className="h-5 bg-surface-100 rounded-lg w-1/3 animate-pulse mt-1" />
      </div>
    </div>
  );
}
