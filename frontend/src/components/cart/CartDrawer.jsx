import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, Transition } from '@headlessui/react';
import { selectCartIsOpen, closeCartDrawer } from '../../store/slices/cartSlice';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import CartSummary from './CartSummary';

/**
 * Slide-out cart drawer component
 */
export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector(selectCartIsOpen);
  const { cart, isLoading } = useCart();

  const closeDrawer = () => dispatch(closeCartDrawer());

  const items = cart?.items || [];
  const isEmpty = items.length === 0;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeDrawer}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-surface-950/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col bg-white shadow-soft-lg rounded-l-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-4 border-b border-surface-100">
                      <Dialog.Title className="text-lg font-semibold text-surface-900">
                        Shopping Cart
                      </Dialog.Title>
                      <button
                        type="button"
                        onClick={closeDrawer}
                        className="text-surface-400 hover:text-surface-500"
                      >
                        <span className="sr-only">Close cart</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Cart content */}
                    <div className="flex-1 overflow-y-auto px-4">
                      {isLoading ? (
                        <div className="flex items-center justify-center py-12">
                          <div className="animate-spin h-8 w-8 border-2 border-primary-600 rounded-full border-t-transparent" />
                        </div>
                      ) : isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-12">
                          <svg
                            className="h-16 w-16 text-surface-300 mb-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.5}
                              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                            />
                          </svg>
                          <p className="text-surface-500 text-center">Your cart is empty</p>
                          <Link
                            to="/products"
                            onClick={closeDrawer}
                            className="mt-4 text-primary-600 hover:text-primary-500 font-medium"
                          >
                            Continue Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="divide-y divide-surface-100">
                          {items.map((item) => (
                            <CartItem key={item.variantId} item={item} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Footer with summary and checkout */}
                    {!isEmpty && (
                      <div className="border-t border-surface-100 px-4 py-4 space-y-4">
                        <CartSummary cart={cart} />

                        <Link
                          to="/checkout"
                          onClick={closeDrawer}
                          className="block w-full py-3 px-4 bg-surface-900 hover:bg-surface-800 text-white text-center font-semibold rounded-xl transition-colors"
                        >
                          Proceed to Checkout
                        </Link>

                        <button
                          type="button"
                          onClick={closeDrawer}
                          className="block w-full text-center text-sm text-surface-600 hover:text-surface-900"
                        >
                          Continue Shopping
                        </button>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
