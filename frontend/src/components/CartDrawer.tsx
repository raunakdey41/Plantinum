"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products } from '@/data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart, removeFromCart, updateQuantity } = useStore();

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const cartTotal = cart.reduce((total, item) => {
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    return total + (numPrice * item.quantity);
  }, 0);

  // Full product details based on cart items
  const cartProducts = cart.map(item => {
    const p = products.find(prod => prod.id === item.id);
    return { ...item, image: p?.image, botanicalName: p?.botanicalName };
  });

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[120] bg-primary/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 z-[130] h-full w-full sm:w-[400px] bg-surface-container-lowest shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Your Cart ({cart.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface hover:text-error rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {cartProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant gap-4">
              <span className="material-symbols-outlined text-6xl text-surface-container-high">shopping_basket</span>
              <p className="font-body-lg">Your cart is feeling a bit empty.</p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-bold mt-2">Continue Shopping</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartProducts.map(item => (
                <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-surface-container-low/50 border border-surface-container/50">
                  <div className="w-20 h-20 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-title-md text-sm font-bold text-primary line-clamp-1">{item.name}</h3>
                        <p className="text-[11px] italic text-on-surface-variant line-clamp-1">{item.botanicalName}</p>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-outline hover:text-error transition-colors">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-price-lg text-primary font-bold">{item.price}</span>
                      <div className="flex items-center gap-3 bg-surface-container-lowest px-2 py-1 rounded-md border border-surface-container">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-on-surface hover:text-secondary disabled:opacity-30 cursor-pointer">
                          <span className="material-symbols-outlined text-[16px] block">remove</span>
                        </button>
                        <span className="font-bold text-sm min-w-[1ch] text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-on-surface hover:text-secondary cursor-pointer">
                          <span className="material-symbols-outlined text-[16px] block">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-surface-container bg-surface-container-lowest">
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex justify-between text-on-surface-variant text-sm">
                <span>Subtotal</span>
                <span className="font-semibold">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-secondary text-sm">
                <span>Shipping</span>
                <span className="font-semibold">{cartTotal > 999 ? 'Free' : 'Calculated at checkout'}</span>
              </div>
              <div className="h-px bg-surface-container my-1"></div>
              <div className="flex justify-between text-primary font-bold">
                <span>Total</span>
                <span className="font-price-lg text-lg">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
            <button className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-label-lg font-bold flex items-center justify-center gap-2 hover:bg-secondary transition-colors cursor-pointer shadow-md">
              <span>Checkout</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
