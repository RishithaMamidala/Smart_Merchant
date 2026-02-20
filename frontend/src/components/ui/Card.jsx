/**
 * @typedef {Object} CardProps
 * @property {React.ReactNode} children
 * @property {string} [className]
 * @property {boolean} [hoverable]
 * @property {boolean} [noPadding]
 */

/**
 * Card component
 * @param {CardProps} props
 */
export function Card({ children, className = '', hoverable = false, noPadding = false }) {
  return (
    <div
      className={`card ${noPadding ? '' : 'p-6'} ${
        hoverable ? 'hover:shadow-soft-lg transition-all duration-300' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Card header component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function CardHeader({ children, className = '' }) {
  return (
    <div className={`border-b border-surface-200 pb-4 mb-4 ${className}`}>
      {children}
    </div>
  );
}

/**
 * Card title component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function CardTitle({ children, className = '' }) {
  return <h3 className={`text-lg font-semibold text-surface-900 ${className}`}>{children}</h3>;
}

/**
 * Card content component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function CardContent({ children, className = '' }) {
  return <div className={className}>{children}</div>;
}

/**
 * Card footer component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 */
export function CardFooter({ children, className = '' }) {
  return (
    <div className={`border-t border-surface-200 pt-4 mt-4 ${className}`}>
      {children}
    </div>
  );
}

export default Card;
