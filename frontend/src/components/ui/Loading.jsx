/**
 * @typedef {Object} LoadingProps
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {string} [className]
 * @property {string} [text]
 */

const sizes = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

/**
 * Loading spinner component
 * @param {LoadingProps} props
 */
export function Loading({ size = 'md', className = '', text }) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <svg
        className={`animate-spin text-surface-900 ${sizes[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="mt-2 text-sm text-surface-500">{text}</p>}
    </div>
  );
}

/**
 * Full page loading component
 * @param {Object} props
 * @param {string} [props.text]
 */
export function PageLoading({ text = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loading size="lg" text={text} />
    </div>
  );
}

/**
 * Skeleton loader component
 * @param {Object} props
 * @param {string} [props.className]
 */
export function Skeleton({ className = '' }) {
  return (
    <div
      className={`animate-pulse bg-surface-200 rounded-lg ${className}`}
      aria-hidden="true"
    />
  );
}

/**
 * Inline loading spinner for buttons and small containers
 */
export function InlineLoading() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default Loading;
