import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMerchantProducts } from '../../hooks/useMerchantProducts.js';
import { useMerchantCategories } from '../../hooks/useMerchantCategories.js';
import { useInventoryStatus } from '../../hooks/useAnalytics.js';
import { PageLoading } from '../../components/ui/Loading.jsx';

const ROW_HEIGHT = 72;
const MAX_LIST_HEIGHT = 480;

/**
 * Dashboard home page with overview stats
 */
export default function DashboardHomePage() {
  const { data: productsData, isLoading: productsLoading } = useMerchantProducts({ limit: 1 });
  const { data: activeProductsData, isLoading: activeLoading } = useMerchantProducts({ status: 'active', limit: 1 });
  const { data: categoriesData, isLoading: categoriesLoading } = useMerchantCategories();
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryStatus();

  if (productsLoading || activeLoading || categoriesLoading || inventoryLoading) {
    return <PageLoading />;
  }

  const categories = categoriesData?.categories || [];
  const totalProducts = productsData?.pagination?.total || 0;
  const activeProducts = activeProductsData?.pagination?.total || 0;
  const inventory = inventoryData || {};
  const lowStockAlerts = inventory.alerts || [];

  return (
    <div>
      <h1 className="text-2xl font-bold font-display text-surface-900 mb-6">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
          color="indigo"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          color="green"
        />
        <StatCard
          title="Low Stock Items"
          value={(inventory.lowStockCount || 0) + (inventory.outOfStockCount || 0)}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          color="yellow"
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-soft p-6 mb-8">
        <h2 className="text-lg font-semibold font-display text-surface-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            to="/dashboard/products/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Product
          </Link>
          <Link
            to="/dashboard/categories"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-xl hover:bg-surface-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Manage Categories
          </Link>
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 rounded-xl hover:bg-surface-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View Orders
          </Link>
        </div>
      </div>

      {/* Low Stock Items */}
      <div className="bg-white rounded-xl shadow-soft">
        <div className="px-6 py-4 border-b border-surface-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold font-display text-surface-900">Low Stock Items</h2>
            {lowStockAlerts.length > 0 && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-surface-100 text-surface-600">
                {lowStockAlerts.length}
              </span>
            )}
          </div>
          <Link
            to="/dashboard/analytics"
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View inventory
          </Link>
        </div>
        {lowStockAlerts.length === 0 ? (
          <div className="px-6 py-8 text-center text-surface-500">
            All items are well-stocked.
          </div>
        ) : (
          <LowStockList alerts={lowStockAlerts} />
        )}
      </div>
    </div>
  );
}

/**
 * Virtualized low stock items list
 */
function LowStockList({ alerts }) {
  const parentRef = useRef(null);
  const listHeight = Math.min(alerts.length * ROW_HEIGHT, MAX_LIST_HEIGHT);

  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="overflow-auto"
      style={{ height: listHeight }}
    >
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const alert = alerts[virtualRow.index];
          return (
            <div
              key={alert.variantId}
              className="absolute top-0 left-0 w-full border-b border-surface-200 last:border-b-0"
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="px-6 h-full flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                  alert.status === 'out_of_stock'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-yellow-100 text-yellow-600'
                }`}>
                  {alert.status === 'out_of_stock' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">
                    {alert.productName}
                    {alert.optionValues?.length > 0 && (
                      <span className="text-surface-400 font-normal">
                        {' '}/ {alert.optionValues.map((v) => v.value || v).join(', ')}
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-surface-500">
                    SKU: {alert.sku}
                    {alert.category && (
                      <span> · {alert.category.name}</span>
                    )}
                    {' '}· {alert.inventory} left (threshold: {alert.threshold})
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
                    alert.status === 'out_of_stock'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {alert.status === 'out_of_stock' ? 'Out of Stock' : 'Low Stock'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    indigo: 'bg-primary-100 text-primary-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
