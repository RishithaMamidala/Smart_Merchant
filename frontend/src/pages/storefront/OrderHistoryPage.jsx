import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useOrderHistory, useCustomerOrder } from '../../hooks/useCustomer.js';
import { PageLoading, InlineLoading } from '../../components/ui/Loading.jsx';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_FILTERS = [
  { value: '', label: 'All Orders' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-surface-100 text-surface-800'}`}>
      {status}
    </span>
  );
}

function OrderCard({ order, onViewDetails }) {
  return (
    <div className="bg-white rounded-2xl shadow-soft border border-surface-100 overflow-hidden">
      <div className="p-4 border-b border-surface-100 bg-surface-50 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-surface-900">Order #{order.orderNumber}</p>
          <p className="text-xs text-surface-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-surface-600">{order.itemCount} item(s)</span>
          <span className="text-lg font-bold text-surface-900">
            ${(order.total / 100).toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => onViewDetails(order.orderNumber)}
          className="w-full mt-2 text-center text-sm text-primary-600 hover:text-primary-500"
        >
          View details
        </button>
      </div>
    </div>
  );
}

function OrderDetailModal({ orderNumber, onClose }) {
  const { data: order, isLoading, error } = useCustomerOrder(orderNumber);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-soft-lg p-6">
            <InlineLoading />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen">
          <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm" onClick={onClose} />
          <div className="relative bg-white rounded-2xl shadow-soft-lg p-6">
            <p className="text-red-600">Error loading order</p>
            <button onClick={onClose} className="mt-4 text-primary-600">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-surface-950/50 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-2xl shadow-soft-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-surface-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-surface-900">Order #{order.orderNumber}</h2>
              <p className="text-sm text-surface-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
            <button onClick={onClose} className="text-surface-400 hover:text-surface-500">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4">
            {/* Status */}
            <div className="flex items-center justify-between mb-6">
              <StatusBadge status={order.status} />
              {order.trackingNumber && (
                <div className="text-sm text-surface-600">
                  <span className="font-medium">Tracking:</span> {order.trackingNumber}
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mb-6 space-y-2">
              {order.paidAt && (
                <div className="flex items-center gap-2 text-sm text-surface-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Paid on {new Date(order.paidAt).toLocaleString()}
                </div>
              )}
              {order.shippedAt && (
                <div className="flex items-center gap-2 text-sm text-surface-600">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  Shipped on {new Date(order.shippedAt).toLocaleString()}
                </div>
              )}
              {order.deliveredAt && (
                <div className="flex items-center gap-2 text-sm text-surface-600">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Delivered on {new Date(order.deliveredAt).toLocaleString()}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="border-t border-surface-200 pt-4">
              <h3 className="font-medium text-surface-900 mb-3">Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-surface-900">{item.productName}</p>
                      {item.variantName && (
                        <p className="text-xs text-surface-500">{item.variantName}</p>
                      )}
                      <p className="text-xs text-surface-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-surface-900">
                      ${((item.unitPrice * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-surface-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Subtotal</span>
                <span>${(order.subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Shipping</span>
                <span>{order.shippingCost > 0 ? `$${(order.shippingCost / 100).toFixed(2)}` : 'Free'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-surface-500">Tax</span>
                <span>${(order.taxAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span>${(order.total / 100).toFixed(2)}</span>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="border-t border-surface-200 mt-4 pt-4">
                <h3 className="font-medium text-surface-900 mb-2">Shipping Address</h3>
                <address className="text-sm text-surface-600 not-italic">
                  <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
                  <p>{order.shippingAddress.address1}</p>
                  {order.shippingAddress.address2 && <p>{order.shippingAddress.address2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </address>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-surface-700">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} orders)
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page <= 1}
          className="px-3 py-1 border-2 border-surface-200 rounded-xl text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages}
          className="px-3 py-1 border-2 border-surface-200 rounded-xl text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const [filters, setFilters] = useState({ page: 1, status: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { user } = useSelector((state) => state.auth);

  const { data, isLoading, error } = useOrderHistory(filters);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h2 className="text-2xl font-bold text-surface-900 mb-4">Please log in</h2>
        <Link to="/login" className="text-primary-600 hover:text-primary-500">
          Go to login
        </Link>
      </div>
    );
  }

  if (isLoading) return <PageLoading />;

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Error loading orders: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-surface-900">Order History</h1>
        <Link
          to="/account"
          className="text-sm text-primary-600 hover:text-primary-500"
        >
          Back to account
        </Link>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value, page: 1 }))}
          className="block w-full sm:w-auto rounded-xl border-2 border-surface-200 focus:border-surface-900 focus:ring-0 sm:text-sm"
        >
          {STATUS_FILTERS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Orders */}
      {data?.orders?.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-surface-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-surface-900">No orders yet</h3>
          <p className="mt-1 text-sm text-surface-500">Start shopping to see your orders here.</p>
          <Link
            to="/products"
            className="mt-4 inline-flex items-center px-4 py-2 shadow-sm text-sm font-semibold rounded-xl text-white bg-surface-900 hover:bg-surface-800"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {data?.orders?.map((order) => (
              <OrderCard
                key={order.orderNumber}
                order={order}
                onViewDetails={setSelectedOrder}
              />
            ))}
          </div>
          <Pagination
            pagination={data?.pagination}
            onPageChange={(page) => setFilters((p) => ({ ...p, page }))}
          />
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          orderNumber={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
