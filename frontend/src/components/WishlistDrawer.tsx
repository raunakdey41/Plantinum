"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products } from '@/data/products';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WishlistDrawer({ isOpen, onClose }: WishlistDrawerProps) {
  const { wishlist, toggleWishlist, addToCart } = useStore();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Full product details based on wishlist ids
  const wishlistProducts = wishlist.map(id => {
    const p = products.find(prod => prod.id === id);
    return p;
  }).filter(p => p !== undefined);

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
            <span className="material-symbols-outlined text-secondary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-bold">Your Wishlist ({wishlist.length})</h2>
          </div>
          <button onClick={onClose} className="p-2 text-on-surface hover:text-error rounded-full transition-colors cursor-pointer">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {wishlistProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant gap-4">
              <span className="material-symbols-outlined text-6xl text-surface-container-high">favorite_border</span>
              <p className="font-body-lg">You haven't saved any botanicals yet.</p>
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg bg-surface-container text-primary font-bold mt-2">Explore Catalogue</button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {wishlistProducts.map(item => (
                <div key={item!.id} className="flex gap-4 p-3 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-container/30 relative group">
                  <div className="w-24 h-24 rounded-lg bg-surface-container overflow-hidden shrink-0">
                    <img src={item!.image} alt={item!.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <div className="flex flex-col flex-1 justify-between py-1">
                    <div>
                      <h3 className="font-title-md text-sm font-bold text-primary line-clamp-1 pr-6">{item!.name}</h3>
                      <span className="font-price-md text-primary font-bold block mt-1">₹{item!.price}</span>
                    </div>
                    <button 
                      onClick={() => {
                        addToCart({ id: item!.id, name: item!.name, price: `₹${item!.price}` });
                        toggleWishlist(item!.id);
                      }}
                      className="w-full py-1.5 mt-2 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary hover:text-on-primary transition-colors"
                    >
                      Move to Cart
                    </button>
                  </div>
                  
                  {/* Remove button */}
                  <button 
                    onClick={() => toggleWishlist(item!.id)} 
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-surface-container-lowest/80 flex items-center justify-center text-outline hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
