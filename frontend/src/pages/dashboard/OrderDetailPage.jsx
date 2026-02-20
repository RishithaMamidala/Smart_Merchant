import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  useMerchantOrder,
  useUpdateOrderStatus,
  useShipOrder,
  useDeliverOrder,
  useCancelOrder,
  useUpdateOrderNotes,
} from '../../hooks/useMerchantOrders.js';
import { PageLoading } from '../../components/ui/Loading.jsx';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${colors[status] || 'bg-surface-100 text-surface-800'}`}>
      {status}
    </span>
  );
}

function ShipOrderModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingCarrier, setTrackingCarrier] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ trackingNumber, trackingCarrier });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-surface-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div>
              <h3 className="text-lg font-medium text-surface-900">Ship Order</h3>
              <p className="mt-1 text-sm text-surface-500">Enter tracking information (optional)</p>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="trackingCarrier" className="block text-sm font-medium text-surface-700">
                  Carrier
                </label>
                <select
                  id="trackingCarrier"
                  value={trackingCarrier}
                  onChange={(e) => setTrackingCarrier(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
                >
                  <option value="">Select carrier...</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="usps">USPS</option>
                  <option value="dhl">DHL</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="trackingNumber" className="block text-sm font-medium text-surface-700">
                  Tracking Number
                </label>
                <input
                  type="text"
                  id="trackingNumber"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
                  placeholder="Enter tracking number"
                />
              </div>
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-soft px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Shipping...' : 'Mark as Shipped'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-xl border-2 border-surface-200 shadow-soft px-4 py-2 bg-white text-base font-medium text-surface-700 hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CancelOrderModal({ isOpen, onClose, onSubmit, isLoading }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(reason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div className="fixed inset-0 bg-surface-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        <div className="relative inline-block align-bottom bg-white rounded-xl px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="mt-3 text-center text-lg font-medium text-surface-900">Cancel Order</h3>
              <p className="mt-1 text-center text-sm text-surface-500">
                Are you sure you want to cancel this order? This action cannot be undone.
              </p>
            </div>
            <div className="mt-4">
              <label htmlFor="reason" className="block text-sm font-medium text-surface-700">
                Cancellation Reason
              </label>
              <textarea
                id="reason"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
                placeholder="Enter reason for cancellation..."
              />
            </div>
            <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-soft px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Cancelling...' : 'Cancel Order'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-xl border-2 border-surface-200 shadow-soft px-4 py-2 bg-white text-base font-medium text-surface-700 hover:bg-surface-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-surface-900 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Go Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function OrderTimeline({ order }) {
  const events = [];
  const pastProcessing = ['processing', 'shipped', 'delivered'].includes(order.status);

  if (order.createdAt) {
    events.push({ label: 'Order Placed', date: order.createdAt, status: 'completed' });
  }
  if (order.paidAt) {
    events.push({ label: 'Payment Confirmed', date: order.paidAt, status: 'completed' });
  }
  if (order.processedAt || pastProcessing) {
    events.push({ label: 'Processing Started', date: order.processedAt || order.updatedAt || order.createdAt, status: 'completed' });
  }
  if (order.shippedAt) {
    events.push({ label: 'Order Shipped', date: order.shippedAt, status: 'completed' });
  }
  if (order.deliveredAt) {
    events.push({ label: 'Order Delivered', date: order.deliveredAt, status: 'completed' });
  }
  if (order.cancelledAt) {
    events.push({ label: 'Order Cancelled', date: order.cancelledAt, status: 'cancelled' });
  }

  if (events.length === 0) return null;

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {events.map((event, idx) => (
          <li key={event.label}>
            <div className="relative pb-8">
              {idx !== events.length - 1 && (
                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-surface-200" />
              )}
              <div className="relative flex space-x-3">
                <div>
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                    event.status === 'cancelled' ? 'bg-red-500' : 'bg-green-500'
                  }`}>
                    {event.status === 'cancelled' ? (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <p className="text-sm text-surface-900">{event.label}</p>
                  </div>
                  <div className="text-right text-sm whitespace-nowrap text-surface-500">
                    {new Date(event.date).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function OrderDetailPage() {
  const { orderNumber } = useParams();
  const { data: order, isLoading, error } = useMerchantOrder(orderNumber);
  const updateStatus = useUpdateOrderStatus();
  const shipOrder = useShipOrder();
  const deliverOrder = useDeliverOrder();
  const cancelOrder = useCancelOrder();
  const updateNotes = useUpdateOrderNotes();

  const [showShipModal, setShowShipModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading order: {error.message}</p>
        <Link to="/dashboard/orders" className="mt-2 inline-block text-primary-600 hover:text-primary-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h2 className="font-display text-xl font-medium text-surface-900">Order not found</h2>
        <Link to="/dashboard/orders" className="mt-2 inline-block text-primary-600 hover:text-primary-700">
          Back to Orders
        </Link>
      </div>
    );
  }

  const canProcess = order.status === 'pending' && order.paymentStatus === 'paid';
  const canShip = order.status === 'processing';
  const canDeliver = order.status === 'shipped';
  const canCancel = ['pending', 'processing', 'shipped'].includes(order.status);

  const handleStartProcessing = async () => {
    try {
      await updateStatus.mutateAsync({ orderNumber, status: 'processing' });
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleShip = async (trackingInfo) => {
    try {
      await shipOrder.mutateAsync({ orderNumber, trackingInfo });
      setShowShipModal(false);
    } catch (err) {
      console.error('Failed to ship order:', err);
    }
  };

  const handleDeliver = async () => {
    try {
      await deliverOrder.mutateAsync(orderNumber);
    } catch (err) {
      console.error('Failed to deliver order:', err);
    }
  };

  const handleCancel = async (reason) => {
    try {
      await cancelOrder.mutateAsync({ orderNumber, reason });
      setShowCancelModal(false);
    } catch (err) {
      console.error('Failed to cancel order:', err);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await updateNotes.mutateAsync({ orderNumber, notes });
      setIsEditingNotes(false);
    } catch (err) {
      console.error('Failed to update notes:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/dashboard/orders"
            className="inline-flex items-center text-sm text-surface-500 hover:text-surface-700"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>
        </div>
      </div>

      {/* Order Header Card */}
      <div className="bg-white shadow-soft rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-surface-900">Order #{order.orderNumber}</h1>
            <p className="mt-1 text-sm text-surface-500">
              Placed on {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <StatusBadge status={order.paymentStatus} type="payment" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          {canProcess && (
            <button
              onClick={handleStartProcessing}
              disabled={updateStatus.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-soft text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {updateStatus.isPending ? 'Processing...' : 'Start Processing'}
            </button>
          )}
          {canShip && (
            <button
              onClick={() => setShowShipModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-soft text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
            >
              Ship Order
            </button>
          )}
          {canDeliver && (
            <button
              onClick={handleDeliver}
              disabled={deliverOrder.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-soft text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
            >
              {deliverOrder.isPending ? 'Marking...' : 'Mark Delivered'}
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="inline-flex items-center px-4 py-2 border border-red-300 rounded-xl shadow-soft text-sm font-medium text-red-700 bg-white hover:bg-red-50"
            >
              Cancel Order
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white shadow-soft rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-surface-200">
              <h2 className="font-display text-lg font-medium text-surface-900">Order Items</h2>
            </div>
            <ul className="divide-y divide-surface-200">
              {order.items?.map((item, idx) => (
                <li key={idx} className="p-6 flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-xl bg-surface-200 flex items-center justify-center">
                    <svg className="w-8 h-8 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-surface-900">{item.productName}</h3>
                    {item.variantName && (
                      <p className="text-sm text-surface-500">{item.variantName}</p>
                    )}
                    <p className="text-sm text-surface-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-surface-900">
                      ${(item.totalPrice / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-surface-500">${(item.unitPrice / 100).toFixed(2)} each</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-6 py-4 bg-surface-50 border-t border-surface-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Subtotal</span>
                  <span className="text-surface-900">${(order.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Shipping</span>
                  <span className="text-surface-900">
                    {order.shippingCost > 0 ? `$${(order.shippingCost / 100).toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-surface-500">Tax</span>
                  <span className="text-surface-900">${(order.taxAmount / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-surface-200">
                  <span className="text-surface-900">Total</span>
                  <span className="text-surface-900">${(order.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow-soft rounded-xl p-6">
            <h2 className="font-display text-lg font-medium text-surface-900 mb-4">Order Timeline</h2>
            <OrderTimeline order={order} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-white shadow-soft rounded-xl p-6">
            <h2 className="font-display text-lg font-medium text-surface-900 mb-4">Customer</h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-surface-900">
                  {order.customerName}
                </p>
                <p className="text-sm text-surface-500">{order.customerEmail}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white shadow-soft rounded-xl p-6">
            <h2 className="font-display text-lg font-medium text-surface-900 mb-4">Shipping Address</h2>
            {order.shippingAddress ? (
              <address className="text-sm text-surface-600 not-italic">
                <p>{order.customerName}</p>
                <p>{order.shippingAddress.line1}</p>
                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                </p>
                <p>{order.shippingAddress.country}</p>
              </address>
            ) : (
              <p className="text-sm text-surface-500">No shipping address</p>
            )}
          </div>

          {/* Tracking Info */}
          {order.trackingNumber && (
            <div className="bg-white shadow-soft rounded-xl p-6">
              <h2 className="font-display text-lg font-medium text-surface-900 mb-4">Tracking</h2>
              <div className="space-y-2">
                {order.trackingCarrier && (
                  <p className="text-sm">
                    <span className="text-surface-500">Carrier:</span>{' '}
                    <span className="text-surface-900 uppercase">{order.trackingCarrier}</span>
                  </p>
                )}
                <p className="text-sm">
                  <span className="text-surface-500">Tracking #:</span>{' '}
                  <span className="text-surface-900 font-mono">{order.trackingNumber}</span>
                </p>
              </div>
            </div>
          )}

          {/* Order Notes */}
          <div className="bg-white shadow-soft rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-medium text-surface-900">Internal Notes</h2>
              {!isEditingNotes && (
                <button
                  onClick={() => {
                    setNotes(order.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Edit
                </button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-3">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="block w-full rounded-xl border-2 border-surface-200 shadow-soft focus:border-surface-900 focus:ring-2 focus:ring-surface-900 sm:text-sm"
                  placeholder="Add internal notes about this order..."
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingNotes(false)}
                    className="px-3 py-1.5 text-sm text-surface-700 hover:text-surface-900"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNotes}
                    disabled={updateNotes.isPending}
                    className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50"
                  >
                    {updateNotes.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-surface-600">
                {order.notes || 'No notes added yet.'}
              </p>
            )}
          </div>

          {/* Cancellation Reason */}
          {order.status === 'cancelled' && order.notes && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <h2 className="font-display text-lg font-medium text-red-900 mb-2">Cancellation Details</h2>
              <p className="text-sm text-red-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ShipOrderModal
        isOpen={showShipModal}
        onClose={() => setShowShipModal(false)}
        onSubmit={handleShip}
        isLoading={shipOrder.isPending}
      />
      <CancelOrderModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onSubmit={handleCancel}
        isLoading={cancelOrder.isPending}
      />
    </div>
  );
}
