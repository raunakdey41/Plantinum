"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products, Product } from '@/data/products';

export default function CareAndSoilPage() {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();
  
  const allFilters = ['Organic Fertilizers', 'Potting Mix & Soil', 'Pest Control', 'Tools & Accessories'];
  const [selectedFilters, setSelectedFilters] = useState<string[]>(allFilters);

  const handleFilterChange = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const getSubcategory = (product: Product) => {
    const textLower = (product.name + " " + product.botanicalName).toLowerCase();
    if (textLower.includes('mix') || textLower.includes('soil') || textLower.includes('perlite')) {
      return 'Potting Mix & Soil';
    } else if (textLower.includes('fertilizer') || textLower.includes('npk') || textLower.includes('vermicompost') || textLower.includes('seaweed')) {
      return 'Organic Fertilizers';
    } else if (textLower.includes('neem') || textLower.includes('fungicide') || textLower.includes('pest') || textLower.includes('saaf')) {
      return 'Pest Control';
    }
    return 'Tools & Accessories';
  };

  const careProducts = products
    .filter(p => p.category === 'Care & Soil')
    .filter(p => {
      if (selectedFilters.length === 0) return true;
      return selectedFilters.includes(getSubcategory(p));
    });

  return (
    <>
      <section className="w-full px-gutter-mobile lg:px-margin pt-space-md pb-space-lg bg-surface-container-low/50">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="#" className="hover:text-primary transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">Plant Care &amp; Soil</span>
        </nav>
        
        <div className="max-w-3xl">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Plant Care &amp; Custom Soils</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
            Premium organic fertilizers, natural pest repellents, and aerated soil blends crafted by our horticulturists. Give your botanicals the essential nutrients they need to thrive indoors.
          </p>
        </div>
      </section>

      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl flex gap-gutter items-start">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-space-lg">
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Categories</span>
            <div className="flex flex-col gap-2 font-body-sm text-on-surface-variant">
              {allFilters.map(filter => (
                <label key={filter} className="flex items-center gap-2 cursor-pointer hover:text-primary">
                  <input 
                    type="checkbox" 
                    checked={selectedFilters.includes(filter)}
                    onChange={() => handleFilterChange(filter)}
                    className="accent-secondary w-4 h-4" 
                  /> {filter}
                </label>
              ))}
            </div>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter-mobile lg:gap-gutter">
            {careProducts.length > 0 ? (
              careProducts.map(product => {
                const cartItem = cart.find(item => item.id === product.id);
                return (
                  <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-surface-container/50">
                    <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-6">
                      {product.badges && product.badges.length > 0 && (
                        <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed font-label-sm text-[10px] uppercase font-bold">
                          {product.badges[0]}
                        </span>
                      )}
                      <button 
                        type="button" 
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-outline hover:text-tertiary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: wishlist.includes(product.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.includes(product.id) ? 'var(--color-tertiary)' : undefined }}>favorite</span>
                      </button>
                      <img src={product.image} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-title-md text-[16px] text-primary font-bold line-clamp-1">{product.name}</h3>
                        <p className="text-xs text-on-surface-variant italic mb-2">{product.botanicalName}</p>
                        <div className="flex items-center gap-1 mb-2.5">
                          <span className="material-symbols-outlined text-tertiary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-bold text-xs text-primary">{product.rating}</span>
                          <span className="text-xs text-outline">({product.reviews} reviews)</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-price-lg text-price-lg text-primary">₹{product.price}</span>
                          {product.originalPrice && <span className="text-xs text-outline line-through">₹{product.originalPrice}</span>}
                          {product.discount > 0 && <span className="text-[11px] font-bold text-secondary">{product.discount}% OFF</span>}
                        </div>
                        {cartItem ? (
                          <div className="flex items-center justify-between w-full py-1.5 px-3 rounded-lg border border-primary text-primary">
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="p-1 hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                            <span className="font-bold text-sm">{cartItem.quantity}</span>
                            <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="p-1 hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[18px]">add</span></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => addToCart({ id: product.id, name: product.name, price: `₹${product.price}` })} className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="col-span-full py-12 text-center flex flex-col items-center">
                <span className="material-symbols-outlined text-5xl text-outline-variant mb-4">search_off</span>
                <p className="font-title-md text-on-surface-variant">No products match your selected filters.</p>
                <button onClick={() => setSelectedFilters(allFilters)} className="mt-4 text-primary font-bold hover:underline">Clear Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
