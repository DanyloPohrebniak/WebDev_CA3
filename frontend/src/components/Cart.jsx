'use client';

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';

const coverUrl = (isbn) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

export default function CartDrawer({
  open,
  onClose,
  cartItems,
  onRemove,
  onUpdateQty,
  onCheckout,
  checkingOut,
  checkoutMessage,
}) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);
  const discountPct = subtotal >= 150 ? 5 : 0;
  const total = subtotal * (1 - discountPct / 100);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500/75 transition-opacity duration-300 ease-in-out data-closed:opacity-0"
      />

      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <DialogPanel
              transition
              className="pointer-events-auto w-screen max-w-md transform transition duration-300 ease-in-out data-closed:translate-x-full"
            >
              <div className="flex h-full flex-col overflow-y-auto bg-white shadow-xl">
                <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                  <div className="flex items-start justify-between">
                    <DialogTitle className="text-lg font-medium text-gray-900">
                      Shopping cart
                    </DialogTitle>
                    <div className="ml-3 flex h-7 items-center">
                      <button
                        type="button"
                        onClick={onClose}
                        className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon aria-hidden="true" className="size-6" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flow-root">
                      {cartItems.length === 0 ? (
                        <p className="text-sm text-gray-500">Your cart is empty.</p>
                      ) : (
                        <ul role="list" className="-my-6 divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <li key={item.book._id} className="flex py-6">
                              <div className="size-24 shrink-0 overflow-hidden rounded-md border border-gray-200">
                                <img
                                  alt={item.book.title}
                                  src={coverUrl(item.book.isbn)}
                                  className="size-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "https://i.imgur.com/sJ3CT4V.gif";
                                  }}
                                />
                              </div>

                              <div className="ml-4 flex flex-1 flex-col">
                                <div>
                                  <div className="flex justify-between text-base font-medium text-gray-900">
                                    <h3 className="line-clamp-2">{item.book.title}</h3>
                                    <p className="ml-4">{item.book.price}€</p>
                                  </div>
                                  <p className="mt-1 text-sm text-gray-500">{item.book.author}</p>
                                  <p className="mt-1 text-xs text-gray-500">ISBN: {item.book.isbn}</p>
                                </div>

                                <div className="flex flex-1 items-end justify-between text-sm">
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">Qty</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={5}
                                      value={item.quantity}
                                      onChange={(e) => onUpdateQty(item.book._id, Number(e.target.value))}
                                      className="w-16 rounded border border-gray-300 px-2 py-1 text-sm"
                                    />
                                  </div>

                                  <div className="flex">
                                    <button
                                      type="button"
                                      onClick={() => onRemove(item.book._id)}
                                      className="font-medium text-indigo-600 hover:text-indigo-500"
                                    >
                                      Remove
                                    </button>
                                  </div>
                                </div>

                                {item.error && (
                                  <p className="mt-2 text-xs text-red-600">{item.error}</p>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                    <div className="flex justify-between text-sm text-gray-700 mt-2">
                        <p>Discount</p>
                        <p>{discountPct}%</p>
                    </div>
                  <div className="flex justify-between text-base font-medium text-gray-900">
                    <p>Subtotal</p>
                    <p>{total.toFixed(2)}€</p>
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Purchases are processed per item (quantity 1–5).
                  </p>

                  {checkoutMessage && (
                    <p className="mt-2 text-sm text-gray-700">{checkoutMessage}</p>
                  )}

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={onCheckout}
                      disabled={checkingOut || cartItems.length === 0}
                      className="flex w-full items-center justify-center rounded-md bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {checkingOut ? "Checking out..." : "Checkout"}
                    </button>
                  </div>

                  <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                    <button
                      type="button"
                      onClick={onClose}
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                    >
                      Continue Shopping <span aria-hidden="true">→</span>
                    </button>
                  </div>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
