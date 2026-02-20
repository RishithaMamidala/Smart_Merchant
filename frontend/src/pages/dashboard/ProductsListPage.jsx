import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useMerchantProducts, useArchiveProduct, useRestoreProduct } from '../../hooks/useMerchantProducts.js';
import { useMerchantCategories } from '../../hooks/useMerchantCategories.js';
import Button from '../../components/ui/Button.jsx';
import { PageLoading } from '../../components/ui/Loading.jsx';

/**
 * Products list page for merchant dashboard
 */
export default function ProductsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const page = parseInt(searchParams.get('page') || '1', 10);
  const status = searchParams.get('status') || 'all';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  const { data, isLoading, isError } = useMerchantProducts({
    page,
    limit: 10,
    status,
    category: category || undefined,
    search: searchParams.get('search') || undefined,
    sort,
  });

  const { data: categoriesData } = useMerchantCategories({ includeInactive: true });
  const archiveProduct = useArchiveProduct();
  const restoreProduct = useRestoreProduct();

  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when filters change
    if (!newParams.page) {
      params.delete('page');
    }
    setSearchParams(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ search, page: null });
  };

  const handleArchive = async (productId) => {
    if (window.confirm('Are you sure you want to archive this product?')) {
      await archiveProduct.mutateAsync(productId);
    }
  };

  const handleRestore = async (productId) => {
    await restoreProduct.mutateAsync(productId);
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load products. Please try again.</p>
      </div>
    );
  }

  const products = data?.products || [];
  const pagination = data?.pagination;
  const categories = categoriesData?.categories || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold text-surface-900">Products</h1>
        <Link to="/dashboard/products/new">
          <Button>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-soft p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 border-2 border-surface-200 rounded-xl focus:ring-2 focus:ring-surface-900 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => updateParams({ status: e.target.value, page: null })}
            className="w-40 px-3 py-2 border-2 border-surface-200 rounded-xl text-sm focus:border-surface-900 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          {/* Category Filter */}
          <select
            value={category}
            onChange={(e) => updateParams({ category: e.target.value, page: null })}
            className="w-48 px-3 py-2 border-2 border-surface-200 rounded-xl text-sm focus:border-surface-900 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value, page: null })}
            className="w-40 px-3 py-2 border-2 border-surface-200 rounded-xl text-sm focus:border-surface-900 focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <table className="min-w-full divide-y divide-surface-200">
          <thead className="bg-surface-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Inventory
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-surface-200">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                  No products found.{' '}
                  <Link to="/dashboard/products/new" className="text-primary-600 hover:text-primary-700">
                    Add your first product
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-100 rounded-xl flex-shrink-0">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0].url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-surface-400">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-900">{product.name}</p>
                        <p className="text-sm text-surface-500">{product.variantCount} variant(s)</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-500">
                    {product.category?.name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-900">
                    ${(product.basePrice / 100).toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-900">{product.availableInventory}</span>
                      {product.lowStockCount > 0 && (
                        <span className="px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                          Low stock
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        product.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-surface-100 text-surface-800'
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/dashboard/products/${product.id}/edit`}
                        className="text-primary-600 hover:text-primary-700"
                      >
                        Edit
                      </Link>
                      {product.status === 'active' ? (
                        <button
                          onClick={() => handleArchive(product.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={archiveProduct.isPending}
                        >
                          Archive
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRestore(product.id)}
                          className="text-green-600 hover:text-green-900"
                          disabled={restoreProduct.isPending}
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-surface-200 flex items-center justify-between">
            <p className="text-sm text-surface-500">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={!pagination.hasPrevPage}
                onClick={() => updateParams({ page: pagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={!pagination.hasNextPage}
                onClick={() => updateParams({ page: pagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
