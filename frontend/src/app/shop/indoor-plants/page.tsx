"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products } from '@/data/products';

export default function IndoorPlantsCatalogue() {
  const [pincode, setPincode] = useState('');
  const [pincodeFeedback, setPincodeFeedback] = useState<string | null>(null);
  const [viewGrid4, setViewGrid4] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();

  // Filter States
  const [filters, setFilters] = useState({
    sunlight: [] as string[],
    petFriendly: false,
    minPrice: 0,
    maxPrice: 5000
  });
  
  const [sortBy, setSortBy] = useState('featured');

  const checkPincode = () => {
    const val = pincode.trim();
    if (val.length === 6 && !isNaN(Number(val))) {
      setPincodeFeedback('✓ Express dispatch available: Delivered in 24-48 hours!');
    } else {
      setPincodeFeedback('⚠️ Please enter a valid 6-digit Indian pincode');
    }
  };

  const handleSunlightChange = (value: string) => {
    setFilters(prev => {
      const current = prev.sunlight;
      return {
        ...prev,
        sunlight: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      sunlight: [],
      petFriendly: false,
      minPrice: 0,
      maxPrice: 5000
    });
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.lightRequirements !== 'N/A');

    if (filters.petFriendly) {
      result = result.filter(p => p.badges.includes('Pet Safe 🐾') || p.badges.includes('Pet Safe') || p.name.includes('Spider') || p.name.includes('Areca'));
    }

    if (filters.sunlight.length > 0) {
      result = result.filter(p => filters.sunlight.some(light => p.lightRequirements.toLowerCase().includes(light.toLowerCase())));
    }

    result = result.filter(p => p.price >= filters.minPrice && p.price <= filters.maxPrice);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [filters, sortBy]);

  const handleFakeAction = (action: string) => {
    setToastMessage(`${action} feature coming soon!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <>
      <section className="w-full px-gutter-mobile lg:px-margin pt-space-md pb-space-lg bg-surface-container-low/50">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="#" className="hover:text-primary transition-colors">Plants</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">All Indoor &amp; Living Plants</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-label-sm font-label-sm mb-3">
              <span className="material-symbols-outlined text-sm text-tertiary">eco</span>
              <span>{products.filter(p => p.category === 'Plants').length} Botanicals In Stock</span>
              <span className="mx-1 opacity-40">•</span>
              <span>Acclimatized for Indian Weather</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Indoor &amp; Living Plants</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Hand-nurtured, pest-inspected flora potted in nutrient-rich custom soil. Delivered pan-India in our specialized triple-cushion transit armor with an unconditional 7-day health guarantee.
            </p>
          </div>
          
          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-1.5 shrink-0 max-w-sm w-full md:w-auto">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px] text-secondary">local_shipping</span> Check Pincode Express Dispatch
            </span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 400001" 
                className="bg-surface-container-low px-3 py-1.5 rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest w-36" 
              />
              <button 
                type="button" 
                onClick={checkPincode}
                className="px-3.5 py-1.5 bg-primary text-on-primary text-label-sm font-label-sm rounded-lg hover:bg-primary-container transition-colors"
              >
                Check
              </button>
            </div>
            <p className={`text-[11px] font-medium ${pincodeFeedback?.includes('⚠️') ? 'text-error' : 'text-secondary'}`}>
              {pincodeFeedback || '✓ Metro Mumbai: Next-Day Delivery Available'}
            </p>
          </div>
        </div>
      </section>

      {/* Controls Bar */}
      <section className="sticky top-[112px] md:top-28 z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm px-gutter-mobile lg:px-margin py-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filters</span>
            </button>
            <span className="font-body-sm text-body-sm text-on-surface-variant hidden sm:inline">Showing <strong className="text-primary font-semibold">1-{filteredProducts.length}</strong> of <strong className="text-primary font-semibold">{filteredProducts.length}</strong> curated botanicals</span>
          </div>
          
          <div className="flex items-center gap-3 ml-auto">
            <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-surface-container-low">
              <button 
                type="button" 
                title="4 Columns" 
                className={`p-1 rounded-md ${viewGrid4 ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary transition-colors'}`}
                onClick={() => setViewGrid4(true)}
              >
                <span className="material-symbols-outlined text-[18px]">grid_view</span>
              </button>
              <button 
                type="button" 
                title="3 Columns Editorial" 
                className={`p-1 rounded-md ${!viewGrid4 ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary transition-colors'}`}
                onClick={() => setViewGrid4(false)}
              >
                <span className="material-symbols-outlined text-[18px]">view_module</span>
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <label htmlFor="sortBy" className="hidden sm:inline font-label-sm text-label-sm text-outline">Sort by:</label>
              <div className="relative">
                <select 
                  id="sortBy" 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-surface-container-low text-primary font-body-sm text-body-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:bg-surface-container-lowest shadow-sm cursor-pointer"
                >
                  <option value="featured">Featured &amp; Bestselling</option>
                  <option value="rating">Customer Rating (High to Low)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[16px] pointer-events-none">expand_more</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full px-gutter-mobile lg:px-margin py-space-lg flex gap-gutter items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-2 gap-space-lg">
          <div className="flex items-center justify-between pb-2">
            <h2 className="font-title-md text-title-md text-primary font-bold">Refine Botanical Search</h2>
            <button type="button" onClick={clearAllFilters} className="text-xs font-semibold text-secondary hover:text-primary">Reset</button>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <button type="button" className="flex items-center justify-between font-label-md text-label-md text-primary uppercase tracking-wider text-left">
              <span>Sunlight Tolerance</span>
              <span className="material-symbols-outlined text-[18px]">expand_less</span>
            </button>
            <div className="flex flex-col gap-2 pl-1 font-body-sm text-body-sm text-on-surface-variant">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('low')} onChange={() => handleSunlightChange('low')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-secondary" />
                <span>Low Light Tolerant</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('indirect')} onChange={() => handleSunlightChange('indirect')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-secondary" />
                <span>Bright Indirect</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('sun')} onChange={() => handleSunlightChange('sun')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-secondary" />
                <span>Direct Sun / Balcony</span>
              </label>
            </div>
          </div>
          
          <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">pets</span>
              <div>
                <p className="font-label-md text-label-md text-primary font-bold leading-tight">Pet-Friendly Only</p>
                <p className="text-[11px] text-on-surface-variant">Non-toxic to cats &amp; dogs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={filters.petFriendly} onChange={() => setFilters(p => ({ ...p, petFriendly: !p.petFriendly }))} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
          
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider">Price Budget</span>
            <div className="flex items-center gap-2 font-body-sm">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-xs">₹</span>
                <input type="number" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: Number(e.target.value) }))} className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-surface-container-lowest text-body-sm font-semibold text-primary" />
              </div>
              <span className="text-outline">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-xs">₹</span>
                <input type="number" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: Number(e.target.value) }))} className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-surface-container-lowest text-body-sm font-semibold text-primary" />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-secondary-container/60 text-on-secondary-fixed flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary font-bold text-label-md">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Plantinum 100% Assurance</span>
            </div>
            <p className="text-xs text-on-secondary-container leading-relaxed">
              Every botanical is acclimated for 14 days in our Pune green facility before packaging. Arrives vibrant, pest-free, and guaranteed.
            </p>
          </div>
        </aside>

        {/* PRODUCT CATALOG & MID-BANNER */}
        <div className="flex-1 min-w-0 flex flex-col gap-space-xl">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-on-surface-variant font-body-lg">No botanicals match your selected filters.</p>
              <button onClick={clearAllFilters} className="mt-4 px-6 py-2 bg-primary text-on-primary rounded-lg font-bold">Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${viewGrid4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-gutter-mobile lg:gap-gutter`}>
                {filteredProducts.slice(0, 4).map(product => {
                  const cartItem = cart.find(item => item.id === product.id);
                  return (
                    <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                      <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                        {product.badges && product.badges.length > 0 && <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[10px] uppercase font-bold">{product.badges[0]}</span>}
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
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary mb-1">
                            <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
                            <span>{product.lightRequirements}</span>
                            <span className="text-outline-variant">•</span>
                            <span className="material-symbols-outlined text-[14px]">water_drop</span>
                            <span>{product.wateringFrequency}</span>
                          </div>
                          <Link href={`/shop/indoor-plants/${product.id}`}>
                            <h3 className="font-title-md text-[16px] text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h3>
                          </Link>
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
                })}
              </div>

              {/* MID-GRID EDITORIAL MERCHANDISING BANNER */}
              {filteredProducts.length > 4 && (
                <div className="w-full rounded-2xl bg-gradient-to-r from-primary via-primary-container to-secondary p-space-lg lg:p-space-xl text-on-primary flex flex-col lg:flex-row items-center justify-between gap-space-lg shadow-md relative overflow-hidden">
                  <div className="relative z-10 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm mb-3">
                      <span className="material-symbols-outlined text-sm">psychology</span> Unsure About Your Lighting?
                    </span>
                    <h2 className="font-headline-md text-headline-md text-on-primary font-semibold mb-2">Find your space's botanical soulmate in 60 seconds.</h2>
                    <p className="font-body-md text-body-md text-on-primary-container mb-space-md">Answer 4 simple questions about sunlight, lifestyle, and pets. Our algorithm curates the exact species that flourish in your room.</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button onClick={() => handleFakeAction('Start Free Quiz')} type="button" className="px-5 py-2.5 rounded-lg bg-tertiary-container text-on-tertiary font-label-md text-label-md font-bold hover:bg-tertiary-fixed hover:text-on-tertiary-fixed transition-colors flex items-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">auto_awesome</span> Start Free Quiz
                      </button>
                      <button onClick={() => handleFakeAction('Chat with Horticulturist')} type="button" className="px-4 py-2.5 rounded-lg bg-surface-container-lowest/15 backdrop-blur-sm text-on-primary font-label-md text-label-md hover:bg-surface-container-lowest/25 transition-colors flex items-center gap-1.5 cursor-pointer">
                        <span className="material-symbols-outlined text-[18px]">chat</span> Chat with Horticulturist
                      </button>
                    </div>
                  </div>
                  <div className="relative z-10 shrink-0 w-full lg:w-80 h-52 rounded-xl overflow-hidden shadow-xl">
                    <img src="https://images.pexels.com/photos/10293102/pexels-photo-10293102.jpeg?auto=compress&cs=tinysrgb&h=650&w=940" className="w-full h-full object-cover" alt="Find your botanical soulmate" />
                  </div>
                </div>
              )}

              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${viewGrid4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-gutter-mobile lg:gap-gutter`}>
                {filteredProducts.slice(4).map(product => {
                  const cartItem = cart.find(item => item.id === product.id);
                  return (
                    <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                      <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                        {product.badges && product.badges.length > 0 && <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[10px] uppercase font-bold">{product.badges[0]}</span>}
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
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-secondary mb-1">
                            <span className="material-symbols-outlined text-[14px]">wb_sunny</span>
                            <span>{product.lightRequirements}</span>
                            <span className="text-outline-variant">•</span>
                            <span className="material-symbols-outlined text-[14px]">water_drop</span>
                            <span>{product.wateringFrequency}</span>
                          </div>
                          <Link href={`/shop/indoor-plants/${product.id}`}>
                            <h3 className="font-title-md text-[16px] text-primary font-bold group-hover:text-secondary transition-colors line-clamp-1">{product.name}</h3>
                          </Link>
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
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Polished Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[110] bg-surface-container-highest text-on-surface px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <span className="material-symbols-outlined text-primary">info</span>
          <span className="font-label-md font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-outline hover:text-on-surface transition-colors cursor-pointer flex items-center">
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}
    </>
  );
}
