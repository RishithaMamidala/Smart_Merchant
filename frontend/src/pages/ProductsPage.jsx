import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts, useCategories } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';

/**
 * Products listing page with filters
 */
export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'newest';
  const category = searchParams.get('category') || '';
  const inStock = searchParams.get('inStock') === 'true';

  const { data: productsData, isLoading } = useProducts({
    category: category || undefined,
    sort,
    page,
    limit: 12,
    inStock: inStock || undefined,
  });

  const { data: categories } = useCategories();

  const updateFilters = (updates) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!updates.page) {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Popular' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <h1 className="text-3xl font-bold font-display text-surface-900 mb-8">All Products</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="lg:w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-2xl shadow-soft border border-surface-100 sticky top-4">
            <h2 className="font-medium text-surface-900 mb-4">Filters</h2>

            {/* Category filter */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-surface-700 mb-2">Category</h3>
              <select
                value={category}
                onChange={(e) => updateFilters({ category: e.target.value })}
                className="w-full rounded-xl border-2 border-surface-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Categories</option>
                {categories?.map((cat) => (
                  <option key={cat._id || cat.slug} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* In stock filter */}
            <div className="mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => updateFilters({ inStock: e.target.checked ? 'true' : '' })}
                  className="w-4 h-4 text-primary-600 border-surface-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm text-surface-700">In stock only</span>
              </label>
            </div>

            {/* Clear filters */}
            {(category || inStock) && (
              <button
                onClick={() => setSearchParams({ sort })}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Clear filters
              </button>
            )}
          </div>
        </aside>

        {/* Products grid */}
        <main className="flex-1">
          {/* Sort and results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-surface-600">
              {productsData?.pagination?.total || 0} products
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-surface-600">
                Sort by:
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="rounded-xl border-2 border-surface-200 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ProductGrid
            products={productsData?.products}
            isLoading={isLoading}
            emptyMessage="No products found matching your criteria"
          />

          {/* Pagination */}
          {productsData?.pagination && productsData.pagination.totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={productsData.pagination.totalPages}
              onPageChange={(newPage) => updateFilters({ page: newPage.toString() })}
            />
          )}
        </main>
      </div>
    </div>
  );
}

/**
 * Pagination component
 */
function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = [];
  const showEllipsis = totalPages > 7;

  if (showEllipsis) {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);
  } else {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm text-surface-600 hover:text-surface-900 disabled:text-surface-300"
      >
        Previous
      </button>
      {pages.map((pageNum, idx) =>
        pageNum === '...' ? (
          <span key={`ellipsis-${idx}`} className="px-3 py-2 text-surface-400">...</span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 text-sm rounded-md ${
              currentPage === pageNum ? 'bg-surface-900 text-white' : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            {pageNum}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm text-surface-600 hover:text-surface-900 disabled:text-surface-300"
      >
        Next
      </button>
    </nav>
  );
}
