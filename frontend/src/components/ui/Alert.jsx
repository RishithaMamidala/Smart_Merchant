import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

/**
 * @typedef {Object} AlertProps
 * @property {'success'|'error'|'warning'|'info'} [variant='info']
 * @property {string} [title]
 * @property {React.ReactNode} children
 * @property {boolean} [dismissible]
 * @property {() => void} [onDismiss]
 * @property {string} [className]
 */

const variants = {
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-800',
    icon: CheckCircleIcon,
    iconColor: 'text-green-400',
  },
  error: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
    icon: XCircleIcon,
    iconColor: 'text-red-400',
  },
  warning: {
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-800',
    icon: ExclamationTriangleIcon,
    iconColor: 'text-yellow-400',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
    icon: InformationCircleIcon,
    iconColor: 'text-blue-400',
  },
};

/**
 * Alert component
 * @param {AlertProps} props
 */
export function Alert({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) {
  const styles = variants[variant];
  const Icon = styles.icon;

  return (
    <div
      className={`rounded-xl border-2 p-4 ${styles.bg} ${styles.border} ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${styles.iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${styles.text}`}>{title}</h3>
          )}
          <div className={`text-sm ${styles.text} ${title ? 'mt-1' : ''}`}>
            {children}
          </div>
        </div>
        {dismissible && onDismiss && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md p-1.5 ${styles.text} hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              onClick={onDismiss}
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Alert;
