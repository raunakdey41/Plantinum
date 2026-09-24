"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { products, Product } from '@/data/products';
import { useStore } from '@/context/StoreContext';

import PotSelector from '@/components/PotSelector';

export default function ProductDetail() {
  const { id } = useParams();
  
  const rawId = String(id || '').trim();
  const slug = rawId.toLowerCase();
  
  // Mapping for known aliases/slugs from homepage and links
  const slugAliases: Record<string, string> = {
    'snake-plant': 'p2',
    'peace-lily': 'p3',
    'areca-palm': 'p4',
    'lucky-bamboo': 'p5',
    'aglaonema': 'p6',
    'spider-plant': 'p7',
    'zz-plant': 'p8',
    'monstera-deliciosa': 'p9',
    'ficus-lyrata': 'p10',
    'fiddle-leaf': 'p10',
    'fiddle-leaf-fig': 'p10',
  };

  const resolvedId = slugAliases[slug] || rawId;
  let product = products.find(p => p.id === resolvedId || p.id.toLowerCase() === slug);
  if (!product) {
    product = products.find(p => 
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').includes(slug) || 
      slug.includes(p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))
    );
  }
  if (!product) {
    if (slug.includes('ficus') || slug.includes('lyrata')) {
      product = products.find(p => p.id === 'p10');
    } else if (slug.includes('snake')) {
      product = products.find(p => p.id === 'p2');
    } else if (slug.includes('zz')) {
      product = products.find(p => p.id === 'p8');
    } else if (slug.includes('monstera')) {
      product = products.find(p => p.id === 'p9');
    }
  }
  if (!product) {
    product = products[0];
  }

  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();
  
  // State for image gallery
  const [activeImage, setActiveImage] = useState(0);

  const isPlant = product.category !== 'Care & Soil' && (product as any).productType !== 'care' && product.lightRequirements !== 'N/A';

  const cartItem = cart.find(item => item.id === product.id);
  let similarProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  if (similarProducts.length === 0) {
    similarProducts = products.filter(p => p.id !== product.id && p.category !== 'Care & Soil').slice(0, 4);
  }
  const recommendedCareProducts = product.recommendedCareIds 
    ? product.recommendedCareIds.map(careId => products.find(p => p.id === careId)).filter((p): p is Product => p !== undefined)
    : [];

  const gallery = product.gallery && product.gallery.length > 0 
    ? product.gallery 
    : [
        product.image,
        product.image,
        product.image,
        product.image
      ];

  const [selectedPot, setSelectedPot] = useState(0);

  return (
    <div className="bg-surface min-h-screen pb-space-md">
      {/* Breadcrumbs - Crisp minimal padding matching header */}
      <section className="w-full px-gutter-mobile lg:px-margin pt-4 pb-3 bg-surface-container-low/50 border-b border-outline-variant/10">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/shop/indoor-plants" className="hover:text-primary transition-colors">Plants</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">{product.name}</span>
        </nav>
      </section>

      <section className="w-full px-gutter-mobile lg:px-margin py-space-md lg:py-space-lg">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-space-2xl">
          
          {/* Left: Image Gallery (Amazon Style) */}
          <div className="w-full lg:w-1/2 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            <div className="flex flex-row sm:flex-col gap-3 shrink-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 hide-scrollbar">
              {gallery.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-secondary shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover bg-surface-container-low" />
                </button>
              ))}
            </div>
            {/* Main Image */}
            <div className="flex-1 relative bg-surface-container-lowest rounded-2xl aspect-[4/5] flex items-center justify-center shadow-sm overflow-hidden">
              <button 
                type="button" 
                onClick={() => toggleWishlist(product.id)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-outline hover:text-tertiary transition-colors shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: wishlist.includes(product.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.includes(product.id) ? 'var(--color-tertiary)' : undefined }}>favorite</span>
              </button>
              {product.badges && product.badges.length > 0 && (
                <span className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-xs uppercase font-bold shadow-sm">
                  {product.badges[0]}
                </span>
              )}
              <img src={gallery[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="w-full lg:w-1/2 flex flex-col pt-4">
            <h1 className="font-headline-lg text-headline-lg text-primary font-bold mb-1">{product.name}</h1>
            <p className="font-title-lg text-on-surface-variant italic mb-4">{product.botanicalName}</p>
            
            <div className="flex items-center gap-2 mb-6">
              <div className="flex text-tertiary">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: i < Math.floor(product.rating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                ))}
              </div>
              <span className="font-bold text-primary">{product.rating}</span>
              <a href="#reviews" className="text-secondary hover:underline text-sm font-medium">({product.reviews} customer reviews)</a>
            </div>

            <div className="flex items-baseline gap-3 mb-8 pb-8 border-b border-surface-container">
              <span className="font-price-xl text-4xl text-primary font-bold">₹{product.price}</span>
              {product.originalPrice && <span className="text-xl text-outline line-through">₹{product.originalPrice}</span>}
              {product.discount > 0 && <span className="px-2 py-1 bg-error/10 text-error rounded-md font-bold text-sm">{product.discount}% OFF</span>}
            </div>

            {/* Quick Care Guide or Product Highlights */}
            {isPlant ? (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">wb_sunny</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Sunlight</p>
                    <p className="text-on-surface-variant text-sm">{product.lightRequirements}</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">water_drop</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Watering</p>
                    <p className="text-on-surface-variant text-sm">{product.wateringFrequency}</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">pets</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Toxicity</p>
                    <p className="text-on-surface-variant text-sm">{product.petSafe ? 'Pet & Baby Safe' : 'Toxic if ingested'}</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">psychology</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Difficulty</p>
                    <p className="text-on-surface-variant text-sm">Beginner Friendly</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-emerald-800 text-2xl">eco</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Formula</p>
                    <p className="text-on-surface-variant text-sm">100% Organic &amp; Natural</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-emerald-800 text-2xl">verified</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Quality</p>
                    <p className="text-on-surface-variant text-sm">Botanist Tested</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-emerald-800 text-2xl">shield</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Protection</p>
                    <p className="text-on-surface-variant text-sm">Plant Health Shield</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl flex gap-3">
                  <span className="material-symbols-outlined text-emerald-800 text-2xl">local_shipping</span>
                  <div>
                    <p className="font-bold text-primary text-sm mb-1">Dispatch</p>
                    <p className="text-on-surface-variant text-sm">Pan-India Express</p>
                  </div>
                </div>
              </div>
            )}

            {/* Add to Cart Actions */}
            <div className="flex flex-col gap-4 mb-8">
              {cartItem ? (
                <div className="flex items-center justify-between w-full p-4 rounded-xl border-2 border-secondary bg-secondary/5 text-secondary">
                  <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="p-2 hover:bg-secondary/10 rounded-full transition-colors cursor-pointer"><span className="material-symbols-outlined text-2xl">remove</span></button>
                  <span className="font-bold text-xl">{cartItem.quantity} In Cart</span>
                  <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="p-2 hover:bg-secondary/10 rounded-full transition-colors cursor-pointer"><span className="material-symbols-outlined text-2xl">add</span></button>
                </div>
              ) : (
                <button 
                  onClick={() => addToCart({ id: product.id, name: product.name, price: `₹${product.price}` })} 
                  className="w-full py-4 rounded-xl bg-primary text-on-primary font-bold text-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined">add_shopping_cart</span>
                  Add to Cart
                </button>
              )}
              
              <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-2 bg-surface-container-lowest p-3 rounded-lg border border-surface-container">
                <span className="material-symbols-outlined text-tertiary">local_shipping</span>
                <span>Ships in triple-armor packaging. <strong>Free delivery</strong> to Kolkata 700001.</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 1. Choose Your Pot Carousel (ONLY for Plants, NOT for Plant Care & Soil products) */}
      {isPlant && (
        <section className="w-full px-gutter-mobile lg:px-margin py-space-xl bg-surface-container-lowest border-t border-surface-container overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <PotSelector selectedPot={selectedPot} onSelectPot={setSelectedPot} />
          </div>
        </section>
      )}

      {/* 2. Plant-Linked Care Products */}
      {recommendedCareProducts.length > 0 && (
        <section className="w-full px-gutter-mobile lg:px-margin py-space-xl bg-surface-container-low border-t border-surface-container">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 mb-2 text-secondary font-bold">
              <span className="material-symbols-outlined text-[20px]">science</span>
              <span className="font-label-md text-label-md uppercase tracking-wider">Horticulturist Recommended</span>
            </div>
            <h2 className="font-headline-md text-primary font-bold mb-6">Essential Care for {product.name}</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendedCareProducts.map(careProduct => {
                const careCartItem = cart.find(item => item.id === careProduct.id);
                return (
                  <div key={careProduct.id} className="bg-surface-container-lowest p-3 rounded-xl shadow-sm border border-surface-container flex flex-col justify-between">
                    <div>
                      <div className="aspect-square w-full bg-surface-container-low rounded-lg mb-3 p-2 flex items-center justify-center overflow-hidden">
                        <img src={careProduct.image} alt={careProduct.name} className="w-full h-full object-contain mix-blend-multiply" />
                      </div>
                      <h4 className="font-bold text-primary text-sm line-clamp-1">{careProduct.name}</h4>
                      <p className="text-xs text-on-surface-variant mb-3 line-clamp-1">{careProduct.botanicalName}</p>
                    </div>
                    <div>
                      <div className="font-price-md text-primary font-bold mb-2">₹{careProduct.price}</div>
                      {careCartItem ? (
                        <div className="flex items-center justify-between w-full py-1 px-2 rounded-lg border border-primary text-primary">
                          <button onClick={() => updateQuantity(careProduct.id, careCartItem.quantity - 1)} className="hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                          <span className="font-bold text-xs">{careCartItem.quantity}</span>
                          <button onClick={() => updateQuantity(careProduct.id, careCartItem.quantity + 1)} className="hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[16px]">add</span></button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart({ id: careProduct.id, name: careProduct.name, price: `₹${careProduct.price}` })}
                          className="w-full py-1.5 rounded-lg bg-surface-container text-primary font-bold text-xs hover:bg-secondary hover:text-on-secondary transition-colors cursor-pointer"
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 3. Similar Plants Section */}
      {similarProducts.length > 0 && (
        <section className="w-full px-gutter-mobile lg:px-margin py-space-xl bg-surface border-t border-surface-container">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-headline-md text-primary font-bold">Similar Items</h2>
              <Link href="/shop/indoor-plants" className="text-secondary font-bold hover:underline">View All</Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter-mobile lg:gap-gutter">
              {similarProducts.map(p => {
                const simCartItem = cart.find(item => item.id === p.id);
                return (
                  <article key={p.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                    <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                      <button 
                        type="button" 
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-outline hover:text-tertiary transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: wishlist.includes(p.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.includes(p.id) ? 'var(--color-tertiary)' : undefined }}>favorite</span>
                      </button>
                      <Link href={`/shop/product/${p.id}`} className="w-full h-full block">
                        <img src={p.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={p.name} />
                      </Link>
                    </div>
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/shop/product/${p.id}`}>
                          <h3 className="font-title-md text-[16px] text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">{p.name}</h3>
                        </Link>
                        <p className="text-xs text-on-surface-variant italic mb-2">{p.botanicalName}</p>
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-price-lg text-price-lg text-primary">₹{p.price}</span>
                        </div>
                        {simCartItem ? (
                          <div className="flex items-center justify-between w-full py-1.5 px-3 rounded-lg border border-primary text-primary">
                            <button onClick={() => updateQuantity(p.id, simCartItem.quantity - 1)} className="p-1 hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[18px]">remove</span></button>
                            <span className="font-bold text-sm">{simCartItem.quantity}</span>
                            <button onClick={() => updateQuantity(p.id, simCartItem.quantity + 1)} className="p-1 hover:text-secondary cursor-pointer"><span className="material-symbols-outlined text-[18px]">add</span></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => addToCart({ id: p.id, name: p.name, price: `₹${p.price}` })} className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-secondary transition-colors flex items-center justify-center gap-1.5 cursor-pointer">
                            <span className="material-symbols-outlined text-[16px]">add_shopping_cart</span>
                            <span>Add to Cart</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
