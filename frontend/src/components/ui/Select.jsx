import { forwardRef, Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/outline';

/**
 * @typedef {Object} SelectOption
 * @property {string} value
 * @property {string} label
 * @property {boolean} [disabled]
 */

/**
 * @typedef {Object} SelectProps
 * @property {SelectOption[]} options
 * @property {string|null} value
 * @property {(value: string) => void} onChange
 * @property {string} [label]
 * @property {string} [placeholder]
 * @property {string} [error]
 * @property {boolean} [disabled]
 * @property {string} [className]
 */

/**
 * Select component using Headless UI Listbox
 * @param {SelectProps} props
 */
export function Select({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  error,
  disabled = false,
  className = '',
}) {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <Listbox value={value} onChange={onChange} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className={`input text-left flex items-center justify-between ${
              error ? 'border-red-400 focus:border-red-500' : ''
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span className={selectedOption ? '' : 'text-surface-400'}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronUpDownIcon className="h-5 w-5 text-surface-400" aria-hidden="true" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute z-10 mt-1.5 w-full bg-white shadow-soft-lg max-h-60 rounded-xl py-1.5 border border-surface-200 overflow-auto focus:outline-none">
              {options.map((option) => (
                <Listbox.Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, disabled }) =>
                    `relative cursor-pointer select-none py-2.5 pl-10 pr-4 rounded-lg mx-1 ${
                      active ? 'bg-surface-100 text-surface-900' : 'text-surface-900'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
                  }
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${
                          selected ? 'font-medium' : 'font-normal'
                        }`}
                      >
                        {option.label}
                      </span>
                      {selected && (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-surface-900">
                          <CheckIcon className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Native select component for simpler use cases
 * @param {Object} props
 */
export const NativeSelect = forwardRef(function NativeSelect(
  { options, label, error, className = '', ...props },
  ref
) {
  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <select
        ref={ref}
        className={`input ${
          error ? 'border-red-400 focus:border-red-500' : ''
        }`}
        {...props}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

export default Select;
