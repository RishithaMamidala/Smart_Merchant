import { useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useProducts, useCategory } from '../hooks/useProducts';
import ProductGrid from '../components/product/ProductGrid';

/**
 * Category page showing products in a category
 */
export default function CategoryPage() {
  const { slug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1', 10);
  const sort = searchParams.get('sort') || 'newest';

  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const { data: productsData, isLoading: productsLoading } = useProducts({
    category: slug,
    sort,
    page,
    limit: 12,
  });

  const handleSortChange = (newSort) => {
    setSearchParams({ sort: newSort, page: '1' });
  };

  const handlePageChange = (newPage) => {
    setSearchParams({ sort, page: newPage.toString() });
  };

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'popular', label: 'Popular' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-surface-500 mb-6">
        <Link to="/" className="hover:text-surface-700">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-surface-700">Products</Link>
        <span>/</span>
        <span className="text-surface-900">
          {categoryLoading ? '...' : category?.name || slug}
        </span>
      </nav>

      {/* Category header */}
      <div className="mb-8">
        {categoryLoading ? (
          <div className="h-8 bg-surface-200 rounded w-48 animate-pulse" />
        ) : (
          <>
            <h1 className="text-3xl font-bold font-display text-surface-900 mb-2">
              {category?.name || slug}
            </h1>
            {category?.description && (
              <p className="text-surface-600">{category.description}</p>
            )}
          </>
        )}
      </div>

      {/* Filters and sort */}
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
            onChange={(e) => handleSortChange(e.target.value)}
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

      {/* Products grid */}
      <ProductGrid
        products={productsData?.products}
        isLoading={productsLoading}
        emptyMessage="No products found in this category"
      />

      {/* Pagination */}
      {productsData?.pagination && productsData.pagination.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={productsData.pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
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
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // Show pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }
  } else {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm text-surface-600 hover:text-surface-900 disabled:text-surface-300 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {pages.map((pageNum, index) =>
        pageNum === '...' ? (
          <span key={`ellipsis-${index}`} className="px-3 py-2 text-surface-400">
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`px-3 py-2 text-sm rounded-md ${
              currentPage === pageNum
                ? 'bg-surface-900 text-white'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            {pageNum}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm text-surface-600 hover:text-surface-900 disabled:text-surface-300 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
}
