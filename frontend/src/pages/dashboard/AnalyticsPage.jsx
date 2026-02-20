import { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  useDashboardMetrics,
  useSalesData,
  useTopProducts,
  useCategoryBreakdown,
  useInventoryStatus,
} from '../../hooks/useAnalytics.js';
import { PageLoading } from '../../components/ui/Loading.jsx';

const periods = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'month', label: 'Last 30 Days' },
  { value: 'quarter', label: 'Last 3 Months' },
  { value: 'year', label: 'Last 12 Months' },
];

/**
 * Analytics dashboard page
 */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState('month');

  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(period);
  const { data: salesData, isLoading: salesLoading } = useSalesData({ period });
  const { data: topProducts, isLoading: productsLoading } = useTopProducts({ period, limit: 5 });
  const { data: categoryData, isLoading: categoryLoading } = useCategoryBreakdown(period);
  const { data: inventoryData, isLoading: inventoryLoading } = useInventoryStatus();

  const isLoading = metricsLoading || salesLoading || productsLoading || categoryLoading || inventoryLoading;

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-display text-surface-900">Analytics</h1>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-48 px-3 py-2 border-2 border-surface-200 rounded-xl text-sm focus:border-surface-900 focus:outline-none"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Revenue"
          value={`$${((metrics?.revenue?.current || 0) / 100).toFixed(2)}`}
          change={metrics?.revenue?.change}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <MetricCard
          title="Orders"
          value={metrics?.orders?.current || 0}
          change={metrics?.orders?.change}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
        />
        <MetricCard
          title="Avg. Order Value"
          value={`$${((metrics?.averageOrderValue?.current || 0) / 100).toFixed(2)}`}
          change={metrics?.averageOrderValue?.change}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />
        <MetricCard
          title="Customers"
          value={metrics?.customers?.current || 0}
          change={metrics?.customers?.change}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sales Chart */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold font-display text-surface-900 mb-4">Sales Over Time</h2>
          <SalesChart data={salesData?.data || []} />
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold font-display text-surface-900 mb-4">Sales by Category</h2>
          <CategoryBreakdown data={categoryData?.categories || []} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold font-display text-surface-900 mb-4">Top Products</h2>
          <TopProductsList products={topProducts?.products || []} />
        </div>

        {/* Inventory Status */}
        <div className="bg-white rounded-xl shadow-soft p-6">
          <h2 className="text-lg font-semibold font-display text-surface-900 mb-4">Inventory Status</h2>
          <InventoryStatus data={inventoryData} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, change, icon }) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <div className="bg-white rounded-xl shadow-soft p-6">
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        {change !== undefined && (
          <span
            className={`text-sm font-medium ${
              isNeutral ? 'text-surface-500' : isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-bold text-surface-900">{value}</p>
      <p className="text-sm text-surface-500">{title}</p>
    </div>
  );
}

function SalesChart({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-surface-500 text-center py-8">No sales data available</p>;
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="space-y-3">
      {data.slice(-10).map((item, index) => (
        <div key={index} className="flex items-center gap-4">
          <span className="w-24 text-sm text-surface-500 truncate">{item.date}</span>
          <div className="flex-1 h-6 bg-surface-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-surface-900 rounded-full transition-all"
              style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
            />
          </div>
          <span className="w-20 text-sm text-surface-900 text-right">
            ${(item.revenue / 100).toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return <p className="text-surface-500 text-center py-8">No category data available</p>;
  }

  const colors = ['bg-surface-900', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];

  return (
    <div className="space-y-4">
      {data.slice(0, 6).map((category, index) => (
        <div key={category.categoryId || index}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-surface-900">{category.name}</span>
            <span className="text-sm text-surface-500">{category.percentage}%</span>
          </div>
          <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
              style={{ width: `${category.percentage}%` }}
            />
          </div>
          <p className="text-xs text-surface-500 mt-1">
            ${(category.revenue / 100).toFixed(2)} ({category.quantity} items)
          </p>
        </div>
      ))}
    </div>
  );
}

function TopProductsList({ products }) {
  if (!products || products.length === 0) {
    return <p className="text-surface-500 text-center py-8">No product data available</p>;
  }

  return (
    <div className="divide-y divide-surface-100">
      {products.map((product, index) => (
        <div key={product.productId || index} className="py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-6 h-6 bg-surface-100 rounded-full flex items-center justify-center text-xs font-medium text-surface-600">
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium text-surface-900">{product.name}</p>
              <p className="text-xs text-surface-500">{product.quantity} sold</p>
            </div>
          </div>
          <span className="text-sm font-medium text-surface-900">
            ${(product.revenue / 100).toFixed(2)}
          </span>
        </div>
      ))}
    </div>
  );
}

const ALERT_ROW_HEIGHT = 52;
const MAX_ALERTS_HEIGHT = 320;

function InventoryStatus({ data }) {
  if (!data) {
    return <p className="text-surface-500 text-center py-8">No inventory data available</p>;
  }

  const healthy = data.healthyCount || 0;
  const lowStock = data.lowStockCount || 0;
  const outOfStock = data.outOfStockCount || 0;
  const alerts = data.alerts || [];

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-xl">
          <p className="text-2xl font-bold text-green-600">{healthy}</p>
          <p className="text-xs text-green-700">Healthy</p>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-xl">
          <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
          <p className="text-xs text-yellow-700">Low Stock</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-xl">
          <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
          <p className="text-xs text-red-700">Out of Stock</p>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-sm font-medium text-surface-900">Alerts</h3>
            <span className="px-1.5 py-0.5 text-xs font-medium rounded-full bg-surface-100 text-surface-600">
              {alerts.length}
            </span>
          </div>
          <InventoryAlertsList alerts={alerts} />
        </div>
      )}
    </div>
  );
}

function InventoryAlertsList({ alerts }) {
  const parentRef = useRef(null);
  const listHeight = Math.min(alerts.length * ALERT_ROW_HEIGHT, MAX_ALERTS_HEIGHT);

  const virtualizer = useVirtualizer({
    count: alerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ALERT_ROW_HEIGHT,
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
              key={alert.variantId || virtualRow.index}
              className="absolute top-0 left-0 w-full pr-1"
              style={{
                height: virtualRow.size,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div
                className={`mx-0 mb-1 p-2.5 rounded-lg text-sm flex items-center gap-3 ${
                  alert.status === 'out_of_stock' ? 'bg-red-50' : 'bg-yellow-50'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                  alert.status === 'out_of_stock' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div className="flex-1 min-w-0">
                  <span className={`font-medium truncate block ${
                    alert.status === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'
                  }`}>
                    {alert.productName}
                    {alert.optionValues?.length > 0 && (
                      <span className="font-normal opacity-70">
                        {' '}/ {alert.optionValues.map((v) => v.value || v).join(', ')}
                      </span>
                    )}
                  </span>
                  <span className={`text-xs block ${
                    alert.status === 'out_of_stock' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.sku}
                    {alert.category && <span> · {alert.category.name}</span>}
                  </span>
                </div>
                <span className={`text-xs font-semibold whitespace-nowrap ${
                  alert.status === 'out_of_stock' ? 'text-red-700' : 'text-yellow-700'
                }`}>
                  {alert.inventory} left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
