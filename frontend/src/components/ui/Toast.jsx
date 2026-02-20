import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subscribeToToasts } from '../../utils/toast.js';

/**
 * Toast notification container
 * Displays auto-dismissing notification toasts
 */
export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Subscribe to toast events
    const unsubscribe = subscribeToToasts((toast) => {
      setToasts((prev) => [...prev, toast]);

      // Auto-dismiss after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, toast.duration || 5000);
    });

    return unsubscribe;
  }, []);

  const handleToastClick = (toast) => {
    if (toast.type === 'notification' && toast.data?.relatedOrderId) {
      // Navigate to order detail
      navigate(`/dashboard/orders/${toast.data.relatedOrderId}`);
      // Remove toast
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }
  };

  const dismissToast = (toastId) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white rounded-lg shadow-lg p-4 border border-neutral-200 cursor-pointer hover:shadow-xl transition-shadow"
          onClick={() => handleToastClick(toast)}
          role="alert"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              {toast.title && (
                <div className="font-semibold text-neutral-900 mb-1">
                  {toast.title}
                </div>
              )}
              {toast.message && (
                <div className="text-sm text-neutral-600">
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                dismissToast(toast.id);
              }}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
              aria-label="Dismiss notification"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {toast.type === 'notification' && (
            <div className="text-xs text-neutral-400 mt-2">
              Click to view details
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
