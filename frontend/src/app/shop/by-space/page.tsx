"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products } from '@/data/products';

type SpaceCategory = 'Bedroom' | 'Table Top' | 'Living Room' | 'Balcony' | 'Office Cubicle' | 'Shop Desk';

export default function ShopBySpacePage() {
  const [activeSpace, setActiveSpace] = useState<SpaceCategory>('Bedroom');
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();

  // Filter logic based on the mock data attributes
  const filteredProducts = products.filter(p => {
    if (p.category === 'Care & Soil') return false;
    
    switch (activeSpace) {
      case 'Bedroom':
        return p.lightRequirements.includes('Indirect') || p.lightRequirements.includes('Low Light');
      case 'Table Top':
        return p.price < 1000; // Mock logic: smaller plants are cheaper
      case 'Living Room':
        return p.price >= 1000 || p.category === 'Monsteras & Aroids'; // Statement plants
      case 'Balcony':
        return p.lightRequirements.includes('Direct') || p.lightRequirements.includes('Full');
      case 'Office Cubicle':
        return p.lightRequirements.includes('Low Light') || p.name.includes('ZZ Plant') || p.name.includes('Snake Plant');
      case 'Shop Desk':
        return p.name.includes('Lucky Bamboo') || p.name.includes('Money Plant');
      default:
        return true;
    }
  });

  return (
    <>
      <section className="w-full px-gutter-mobile lg:px-margin pt-space-md pb-space-xl bg-surface">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="#" className="hover:text-primary transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">By Space</span>
        </nav>
        
        <div className="text-center max-w-2xl mx-auto mb-space-2xl">
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Curate Your Sanctuary</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Select a room to discover botanicals perfectly suited for its unique lighting, humidity, and aesthetic needs.
          </p>
        </div>

        {/* Space Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-space-xl">
          {(['Bedroom', 'Table Top', 'Living Room', 'Balcony', 'Office Cubicle', 'Shop Desk'] as SpaceCategory[]).map(space => (
            <button
              key={space}
              onClick={() => setActiveSpace(space)}
              className={`px-6 py-3 rounded-xl font-label-md font-bold transition-all flex items-center gap-2 ${
                activeSpace === space 
                ? 'bg-primary text-on-primary shadow-md scale-105' 
                : 'bg-surface-container-low text-on-surface hover:bg-surface-container hover:scale-105'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {space === 'Bedroom' && 'bed'}
                {space === 'Table Top' && 'desk'}
                {space === 'Living Room' && 'weekend'}
                {space === 'Balcony' && 'balcony'}
                {space === 'Office Cubicle' && 'apartment'}
                {space === 'Shop Desk' && 'storefront'}
              </span>
              {space}
            </button>
          ))}
        </div>

        {/* Dynamic Space Header Info */}
        <div className="bg-surface-container-low p-space-lg rounded-2xl mb-space-xl flex flex-col md:flex-row items-center gap-space-lg">
          <div className="flex-1">
            <h2 className="font-headline-md text-primary font-bold mb-2">
              {activeSpace === 'Bedroom' && 'Air-Purifying Sleep Companions'}
              {activeSpace === 'Table Top' && 'Compact Desk Botanicals'}
              {activeSpace === 'Living Room' && 'Statement Showpieces'}
              {activeSpace === 'Balcony' && 'Sun-Loving Outdoor Flora'}
              {activeSpace === 'Office Cubicle' && 'Low-Light Corporate Survivors'}
              {activeSpace === 'Shop Desk' && 'Prosperity & Vastu Staples'}
            </h2>
            <p className="text-on-surface-variant text-body-md">
              {activeSpace === 'Bedroom' && 'Transform your bedroom into an oxygen-rich oasis. These low-light tolerant plants naturally filter airborne toxins while you sleep.'}
              {activeSpace === 'Table Top' && 'Perfectly sized for work desks and shelves. These low-maintenance companions boost productivity and focus without taking up too much space.'}
              {activeSpace === 'Living Room' && 'Make a bold architectural statement. These large, lush varieties thrive in ambient indirect light and become the natural focal point of your home.'}
              {activeSpace === 'Balcony' && 'Hardy, resilient plants that bask in direct Indian sunlight and tolerate temperature fluctuations on open balconies and terraces.'}
              {activeSpace === 'Office Cubicle' && 'Survives on fluorescent lighting and irregular watering. Perfect for brightening up air-conditioned office spaces.'}
              {activeSpace === 'Shop Desk' && 'Auspicious gifting and decor plants like Lucky Bamboo and Money Plant to bring prosperity and a welcoming vibe to your storefront.'}
            </p>
          </div>
          <div className="hidden md:flex shrink-0 p-4 rounded-xl bg-surface-container-lowest border border-surface-container">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary">wb_sunny</span>
                <span>
                  {activeSpace === 'Bedroom' && 'Low to Medium Indirect Light'}
                  {activeSpace === 'Table Top' && 'Medium Indirect Light'}
                  {activeSpace === 'Living Room' && 'Bright Indirect Light'}
                  {activeSpace === 'Balcony' && 'Full Direct Sun'}
                  {activeSpace === 'Office Cubicle' && 'Low Fluorescent Light'}
                  {activeSpace === 'Shop Desk' && 'Ambient Indoor Light'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary">water_drop</span>
                <span>
                  {activeSpace === 'Bedroom' && 'Low Humidity Tolerant'}
                  {activeSpace === 'Table Top' && 'Moderate Watering'}
                  {activeSpace === 'Living Room' && 'Weekly Watering'}
                  {activeSpace === 'Balcony' && 'Frequent Watering Required'}
                  {activeSpace === 'Office Cubicle' && 'Forgiving / Irregular'}
                  {activeSpace === 'Shop Desk' && 'Low Maintenance'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-gutter-mobile lg:gap-gutter">
          {filteredProducts.length > 0 ? filteredProducts.map(product => {
            const cartItem = cart.find(item => item.id === product.id);
            return (
              <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                  {product.badges && product.badges.length > 0 && (
                    <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[10px] uppercase font-bold">
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
                  <Link href={`/shop/indoor-plants/${product.id}`} className="w-full h-full block">
                    <img src={product.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={product.name} />
                  </Link>
                </div>
                <div className="p-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/shop/indoor-plants/${product.id}`}>
                      <h3 className="font-title-md text-[16px] text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    <p className="text-xs text-on-surface-variant italic mb-2">{product.botanicalName}</p>
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="font-price-lg text-price-lg text-primary">₹{product.price}</span>
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
          }) : (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">eco</span>
              <p className="text-on-surface-variant font-medium">We're currently restocking botanicals for this space.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
