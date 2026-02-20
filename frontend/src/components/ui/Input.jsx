import { forwardRef } from 'react';

/**
 * @typedef {Object} InputProps
 * @property {string} [label]
 * @property {string} [error]
 * @property {string} [hint]
 * @property {React.ReactNode} [leftIcon]
 * @property {React.ReactNode} [rightIcon]
 */

/**
 * Input component
 * @param {InputProps & React.InputHTMLAttributes<HTMLInputElement>} props
 */
export const Input = forwardRef(function Input(
  { label, error, hint, leftIcon, rightIcon, className = '', id, ...props },
  ref
) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={inputId} className="label">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${leftIcon ? 'pl-10' : ''} ${
            rightIcon ? 'pr-10' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500'
              : ''
          }`}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-surface-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="mt-1 text-sm text-surface-500">
          {hint}
        </p>
      )}
    </div>
  );
});

export default Input;
