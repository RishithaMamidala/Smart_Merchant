import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

/**
 * @typedef {Object} ModalProps
 * @property {boolean} isOpen
 * @property {() => void} onClose
 * @property {React.ReactNode} children
 * @property {string} [title]
 * @property {string} [description]
 * @property {'sm'|'md'|'lg'|'xl'|'full'} [size='md']
 * @property {boolean} [showCloseButton=true]
 */

const sizes = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

/**
 * Modal component using Headless UI Dialog
 * @param {ModalProps} props
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-surface-950/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${sizes[size]} transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-soft-lg transition-all border border-surface-100`}
              >
                {showCloseButton && (
                  <button
                    type="button"
                    className="absolute top-4 right-4 text-surface-400 hover:text-surface-600 transition-colors"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                )}

                {title && (
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-semibold leading-6 text-surface-900 pr-8"
                  >
                    {title}
                  </Dialog.Title>
                )}

                {description && (
                  <Dialog.Description className="mt-2 text-sm text-surface-500">
                    {description}
                  </Dialog.Description>
                )}

                <div className={title || description ? 'mt-4' : ''}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default Modal;
