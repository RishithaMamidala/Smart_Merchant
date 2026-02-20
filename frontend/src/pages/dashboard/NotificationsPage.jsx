import { useState } from 'react';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useRetryNotification,
  useNotificationPreferences,
  useUpdatePreferences,
} from '../../hooks/useNotifications.js';
import { PageLoading, InlineLoading } from '../../components/ui/Loading.jsx';

const NOTIFICATION_TYPES = {
  order_confirmation: { label: 'Order Confirmation', icon: '📦', color: 'bg-blue-100 text-blue-800' },
  new_order: { label: 'New Order', icon: '🛒', color: 'bg-green-100 text-green-800' },
  shipping_update: { label: 'Shipping Update', icon: '🚚', color: 'bg-purple-100 text-purple-800' },
  delivery_confirmation: { label: 'Delivery', icon: '✅', color: 'bg-green-100 text-green-800' },
  order_cancellation: { label: 'Cancellation', icon: '❌', color: 'bg-red-100 text-red-800' },
  low_stock: { label: 'Low Stock', icon: '⚠️', color: 'bg-yellow-100 text-yellow-800' },
  daily_summary: { label: 'Daily Summary', icon: '📊', color: 'bg-primary-100 text-primary-800' },
};

const STATUS_FILTERS = [
  { value: '', label: 'All Status' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];

const TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'new_order', label: 'Orders' },
  { value: 'shipping_update', label: 'Shipping' },
  { value: 'delivery_confirmation', label: 'Deliveries' },
  { value: 'order_cancellation', label: 'Cancellations' },
  { value: 'low_stock', label: 'Low Stock Alerts' },
  { value: 'daily_summary', label: 'Daily Summary' },
];

function NotificationItem({ notification, onMarkRead, onRetry }) {
  const typeInfo = NOTIFICATION_TYPES[notification.type] || {
    label: notification.type,
    icon: '📬',
    color: 'bg-surface-100 text-surface-800',
  };

  const isUnread = !notification.readAt;
  const isFailed = notification.status === 'failed';

  return (
    <div
      className={`p-4 border-b border-surface-200 hover:bg-surface-50 ${isUnread ? 'bg-blue-50' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${typeInfo.color} flex items-center justify-center text-lg`}>
          {typeInfo.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${typeInfo.color}`}>
              {typeInfo.label}
            </span>
            {isFailed && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                Failed
              </span>
            )}
            {isUnread && (
              <span className="w-2 h-2 rounded-full bg-blue-500" title="Unread" />
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-surface-900">{notification.subject}</p>
          <p className="mt-1 text-xs text-surface-500">
            {notification.recipientEmail} • {new Date(notification.createdAt).toLocaleString()}
          </p>
          {isFailed && notification.error && (
            <p className="mt-1 text-xs text-red-600">Error: {notification.error}</p>
          )}
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          {isUnread && (
            <button
              onClick={() => onMarkRead(notification.id)}
              className="text-xs text-primary-600 hover:text-primary-700"
            >
              Mark read
            </button>
          )}
          {isFailed && notification.retryCount < 3 && (
            <button
              onClick={() => onRetry(notification.id)}
              className="text-xs text-orange-600 hover:text-orange-900"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationList({ notifications, isLoading, onMarkRead, onRetry }) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <InlineLoading />
      </div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-surface-900">No notifications</h3>
        <p className="mt-1 text-sm text-surface-500">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-surface-200">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onMarkRead={onMarkRead}
          onRetry={onRetry}
        />
      ))}
    </div>
  );
}

function PreferencesForm({ preferences, onSave, isSaving }) {
  const [formData, setFormData] = useState(preferences || {
    emailNotifications: true,
    orderConfirmations: true,
    shippingUpdates: true,
    lowStockAlerts: true,
    dailySummary: true,
    lowStockThreshold: 5,
  });

  const handleToggle = (key) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleThresholdChange = (e) => {
    setFormData((prev) => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 5 }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-surface-900">Email Notifications</h3>
        <p className="mt-1 text-sm text-surface-500">
          Control which email notifications you receive
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-surface-900">All Email Notifications</label>
            <p className="text-sm text-surface-500">Master toggle for all email notifications</p>
          </div>
          <button
            type="button"
            onClick={() => handleToggle('emailNotifications')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 ${
              formData.emailNotifications ? 'bg-primary-600' : 'bg-surface-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="border-t border-surface-200 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-surface-900">Order Confirmations</label>
              <p className="text-sm text-surface-500">Send confirmation emails to customers</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('orderConfirmations')}
              disabled={!formData.emailNotifications}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 disabled:opacity-50 ${
                formData.orderConfirmations && formData.emailNotifications ? 'bg-primary-600' : 'bg-surface-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.orderConfirmations && formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-surface-900">Shipping Updates</label>
              <p className="text-sm text-surface-500">Send shipping notifications to customers</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('shippingUpdates')}
              disabled={!formData.emailNotifications}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 disabled:opacity-50 ${
                formData.shippingUpdates && formData.emailNotifications ? 'bg-primary-600' : 'bg-surface-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.shippingUpdates && formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-surface-900">Low Stock Alerts</label>
              <p className="text-sm text-surface-500">Get notified when inventory is low</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('lowStockAlerts')}
              disabled={!formData.emailNotifications}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 disabled:opacity-50 ${
                formData.lowStockAlerts && formData.emailNotifications ? 'bg-primary-600' : 'bg-surface-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.lowStockAlerts && formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-surface-900">Daily Summary</label>
              <p className="text-sm text-surface-500">Receive daily business summary emails</p>
            </div>
            <button
              type="button"
              onClick={() => handleToggle('dailySummary')}
              disabled={!formData.emailNotifications}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 disabled:opacity-50 ${
                formData.dailySummary && formData.emailNotifications ? 'bg-primary-600' : 'bg-surface-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.dailySummary && formData.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-surface-200 pt-6">
        <h3 className="text-lg font-medium text-surface-900">Inventory Settings</h3>
        <div className="mt-4">
          <label htmlFor="lowStockThreshold" className="block text-sm font-medium text-surface-700">
            Low Stock Threshold
          </label>
          <p className="text-sm text-surface-500 mb-2">
            Alert when inventory drops to this level
          </p>
          <input
            type="number"
            id="lowStockThreshold"
            min="1"
            max="100"
            value={formData.lowStockThreshold}
            onChange={handleThresholdChange}
            className="mt-1 block w-32 rounded-xl border-surface-200 shadow-soft focus:border-surface-900 focus:ring-surface-900 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex justify-center rounded-xl border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-soft hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-surface-900 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>
    </form>
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
            Page <span className="font-medium">{page}</span> of{' '}
            <span className="font-medium">{totalPages}</span> ({total} notifications)
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

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    type: '',
  });

  const { data, isLoading, error } = useNotifications(filters);
  const { data: preferences, isLoading: prefsLoading } = useNotificationPreferences();
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const retryNotification = useRetryNotification();
  const updatePreferences = useUpdatePreferences();

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleMarkRead = async (id) => {
    try {
      await markAsRead.mutateAsync(id);
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleRetry = async (id) => {
    try {
      await retryNotification.mutateAsync(id);
    } catch (err) {
      console.error('Failed to retry:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead.mutateAsync();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleSavePreferences = async (prefs) => {
    try {
      await updatePreferences.mutateAsync(prefs);
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading notifications: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-surface-900">Notifications</h1>
          <p className="mt-1 text-sm text-surface-500">
            Manage your notifications and preferences
          </p>
        </div>
        {activeTab === 'notifications' && data?.notifications?.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={markAllAsRead.isPending}
            className="inline-flex items-center px-3 py-1.5 border-2 border-surface-200 shadow-soft text-sm font-medium rounded-xl text-surface-700 bg-white hover:bg-surface-50 disabled:opacity-50"
          >
            {markAllAsRead.isPending ? 'Marking...' : 'Mark all as read'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-surface-900 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200'
            }`}
          >
            Notifications
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'preferences'
                ? 'border-surface-900 text-primary-600'
                : 'border-transparent text-surface-500 hover:text-surface-700 hover:border-surface-200'
            }`}
          >
            Preferences
          </button>
        </nav>
      </div>

      {activeTab === 'notifications' && (
        <>
          {/* Filters */}
          <div className="bg-white shadow-soft rounded-xl p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-surface-700">
                  Type
                </label>
                <select
                  id="type"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-surface-200 shadow-soft focus:border-surface-900 focus:ring-surface-900 sm:text-sm"
                >
                  {TYPE_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-surface-700">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full rounded-xl border-surface-200 shadow-soft focus:border-surface-900 focus:ring-surface-900 sm:text-sm"
                >
                  {STATUS_FILTERS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setFilters({ page: 1, limit: 20, status: '', type: '' })}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border-2 border-surface-200 shadow-soft text-sm font-medium rounded-xl text-surface-700 bg-white hover:bg-surface-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white shadow-soft rounded-xl overflow-hidden">
            {isLoading && !data ? (
              <PageLoading />
            ) : (
              <>
                <NotificationList
                  notifications={data?.notifications}
                  isLoading={isLoading}
                  onMarkRead={handleMarkRead}
                  onRetry={handleRetry}
                />
                <Pagination pagination={data?.pagination} onPageChange={handlePageChange} />
              </>
            )}
          </div>
        </>
      )}

      {activeTab === 'preferences' && (
        <div className="bg-white shadow-soft rounded-xl p-6">
          {prefsLoading ? (
            <PageLoading />
          ) : (
            <PreferencesForm
              preferences={preferences}
              onSave={handleSavePreferences}
              isSaving={updatePreferences.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
}
