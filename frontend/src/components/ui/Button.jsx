import { forwardRef } from 'react';

/**
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'outline'|'danger'|'ghost'} [variant='primary']
 * @property {'sm'|'md'|'lg'} [size='md']
 * @property {boolean} [isLoading=false]
 * @property {boolean} [fullWidth=false]
 * @property {React.ReactNode} [leftIcon]
 * @property {React.ReactNode} [rightIcon]
 */

const variants = {
  primary: 'bg-surface-900 text-white hover:bg-surface-800 focus-visible:ring-surface-900 shadow-soft hover:shadow-soft-lg',
  secondary: 'bg-surface-100 text-surface-700 hover:bg-surface-200 focus-visible:ring-surface-400',
  outline: 'border-2 border-surface-200 bg-white text-surface-700 hover:border-surface-900 hover:text-surface-900 focus-visible:ring-surface-900',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
  ghost: 'bg-transparent text-surface-600 hover:bg-surface-100 focus-visible:ring-surface-400',
  accent: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500 shadow-soft hover:shadow-glow',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

/**
 * Button component
 * @param {ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>} props
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    fullWidth = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props
  },
  ref
) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]';

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${
        fullWidth ? 'w-full' : ''
      } ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
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
          Loading...
        </>
      ) : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
