import { Link } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';

/**
 * Home page with featured products and categories
 */
export default function HomePage() {
  const { data: productsData, isLoading: productsLoading } = useProducts({ limit: 8 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <section className="relative overflow-hidden bg-surface-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-950/40 via-transparent to-surface-950/60" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(206,114,48,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-2xl">
            <span className="badge bg-primary-600/20 text-primary-300 mb-6">New Collection</span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-white leading-[1.1] mb-6">
              Discover curated excellence
            </h1>
            <p className="text-lg text-surface-300 mb-8 max-w-lg leading-relaxed">
              Handpicked products that blend quality with design. Explore our latest arrivals and find your next favorite.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/products" className="btn btn-accent !py-3 !px-8 text-base">
                Shop Collection
              </Link>
              <Link to="/products" className="btn btn-outline !border-surface-600 !text-white hover:!bg-surface-800 !py-3 !px-8 text-base">
                Browse All
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b border-surface-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              <span className="text-sm font-medium text-surface-600">Free Shipping $100+</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span className="text-sm font-medium text-surface-600">Secure Checkout</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              <span className="text-sm font-medium text-surface-600">30-Day Returns</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-primary-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className="text-sm font-medium text-surface-600">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories section */}
        <section className="py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">Shop by Category</h2>
              <p className="section-subheading">Explore our curated collections</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors">
              View All &rarr;
            </Link>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="aspect-[4/3] bg-surface-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.slice(0, 4).map((category) => (
                <Link
                  key={category._id || category.slug}
                  to={`/category/${category.slug}`}
                  className="group relative aspect-[4/3] bg-surface-200 rounded-2xl overflow-hidden"
                >
                  {category.image && (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-950/70 via-surface-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <span className="text-white font-semibold text-base group-hover:underline underline-offset-4">
                      {category.name}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Featured products section */}
        <section className="pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="section-subheading">Our hand-picked favorites for you</p>
            </div>
            <Link to="/products" className="hidden sm:inline-flex text-sm font-semibold text-surface-900 hover:text-primary-600 transition-colors">
              View All &rarr;
            </Link>
          </div>

          <ProductGrid
            products={productsData?.products}
            isLoading={productsLoading}
            emptyMessage="No products available yet"
          />
        </section>
      </div>
    </div>
  );
}
