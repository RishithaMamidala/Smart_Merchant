import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMerchantOrders } from '../../hooks/useMerchantOrders.js';
import { PageLoading, InlineLoading } from '../../components/ui/Loading.jsx';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const PAYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All Payment Status' },
  { value: 'pending', label: 'Payment Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-surface-100 text-surface-800',
};

function StatusBadge({ status, type = 'order' }) {
  const colors = type === 'payment' ? PAYMENT_STATUS_COLORS : STATUS_COLORS;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${colors[status] || 'bg-surface-100 text-surface-800'}`}>
      {status}
    </span>
  );
}

function OrdersTable({ orders, isLoading }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <InlineLoading />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-surface-900">No orders found</h3>
        <p className="mt-1 text-sm text-surface-500">Orders will appear here once customers place them.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-surface-200">
        <thead className="bg-surface-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Order
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Payment
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-surface-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-surface-200">
          {orders.map((order) => (
            <tr key={order.orderNumber} className="hover:bg-surface-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/dashboard/orders/${order.orderNumber}`} className="text-primary-600 hover:text-primary-700 font-medium">
                  #{order.orderNumber}
                </Link>
                <div className="text-sm text-surface-500">{order.itemCount || 0} items</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-surface-900">
                  {order.customerName}
                </div>
                <div className="text-sm text-surface-500">{order.customerEmail}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={order.paymentStatus} type="payment" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900">
                ${(order.total / 100).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/dashboard/orders/${order.orderNumber}`}
                  className="text-primary-600 hover:text-primary-700"
                >
                  View Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, total } = pagination;

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-surface-200 sm:px-6">
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-surface-700">
            Showing page <span className="font-medium">{page}</span> of{' '}
            <span className="font-medium">{totalPages}</span> ({total} orders)
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-soft -space-x-px">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-xl border-2 border-surface-200 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-xl border-2 border-surface-200 bg-white text-sm font-medium text-surface-500 hover:bg-surface-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default function OrdersListPage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    paymentStatus: '',
    search: '',
  });

  const { data, isLoading, error } = useMerchantOrders(filters);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading orders: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-surface-900">Orders</h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage and fulfill customer orders
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {data?.summary && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="bg-white overflow-hidden shadow-soft rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 text-sm font-medium">{data.summary.pending || 0}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-surface-500">Pending</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-soft rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-sm font-medium">{data.summary.processing || 0}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-surface-500">Processing</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-soft rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-medium">{data.summary.shipped || 0}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-surface-500">Shipped</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-soft rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm font-medium">{data.summary.delivered || 0}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-surface-500">Delivered</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow-soft rounded-xl">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 text-sm font-medium">{data.summary.cancelled || 0}</span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-surface-500">Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow-soft rounded-xl p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-surface-700">
              Search
            </label>
            <input
              type="text"
              id="search"
              placeholder="Order # or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-surface-700">
              Order Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="paymentStatus" className="block text-sm font-medium text-surface-700">
              Payment Status
            </label>
            <select
              id="paymentStatus"
              value={filters.paymentStatus}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
            >
              {PAYMENT_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilters({ page: 1, limit: 20, status: '', paymentStatus: '', search: '' })}
              className="w-full inline-flex justify-center items-center px-4 py-2 border-2 border-surface-200 shadow-soft text-sm font-medium rounded-xl text-surface-700 bg-white hover:bg-surface-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white shadow-soft rounded-xl overflow-hidden">
        {isLoading && !data ? (
          <PageLoading />
        ) : (
          <>
            <OrdersTable orders={data?.orders} isLoading={isLoading} />
            <Pagination pagination={data?.pagination} onPageChange={handlePageChange} />
          </>
        )}
      </div>
    </div>
  );
}
