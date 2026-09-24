"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { products, Product } from '@/data/products';

export default function CareAndSoilPage() {
  const { cart, addToCart, updateQuantity, wishlist, toggleWishlist } = useStore();
  
  const allFilters = ['Organic Fertilizers', 'Potting Mix & Soil', 'Pest Control', 'Tools & Accessories'];
  const [selectedFilters, setSelectedFilters] = useState<string[]>(allFilters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);

  const autoSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.botanicalName && p.botanicalName.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [searchQuery]);

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
    })
    .filter(p => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        p.name.toLowerCase().includes(q) || 
        p.botanicalName.toLowerCase().includes(q) ||
        (p.badges && p.badges.some(b => b.toLowerCase().includes(q)))
      );
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

        {/* Search Bar for Mobile & Desktop with Autosuggestion */}
        <div className="relative max-w-md mt-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSuggestionsOpen(true);
            }}
            onFocus={() => {
              if (searchQuery.trim()) setIsSuggestionsOpen(true);
            }}
            onBlur={() => {
              setTimeout(() => setIsSuggestionsOpen(false), 200);
            }}
            placeholder="Search fertilizers, neem oil, soils, tools..." 
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-surface-container-lowest border border-stone-300 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-xs font-medium"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => { setSearchQuery(''); setIsSuggestionsOpen(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}

          {/* Autosuggestion Dropdown Overlay */}
          {isSuggestionsOpen && autoSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden z-[110] animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3.5 py-2 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-[10px] font-extrabold text-stone-500 uppercase tracking-wider">
                <span>Suggested Care Products ({autoSuggestions.length})</span>
                <span className="material-symbols-outlined text-xs text-emerald-800">compost</span>
              </div>
              <ul className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                {autoSuggestions.map((item) => (
                  <li key={item.id}>
                    <Link 
                      href={`/shop/product/${item.id}`}
                      onClick={() => setIsSuggestionsOpen(false)}
                      className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-emerald-50/80 transition-colors cursor-pointer group"
                    >
                      <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-stone-100 shrink-0 border border-stone-200/60" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="font-bold text-xs text-stone-900 group-hover:text-emerald-900 truncate">{item.name}</span>
                        <span className="text-[10px] text-stone-500 italic truncate">{item.botanicalName}</span>
                      </div>
                      <span className="font-bold text-xs text-emerald-800 shrink-0">₹{item.price}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl flex gap-gutter items-start">
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-space-lg">
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold">Categories</span>
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
                <p className="font-title-md text-on-surface-variant">No products match your search/filters.</p>
                <button onClick={() => { setSelectedFilters(allFilters); setSearchQuery(''); }} className="mt-4 text-primary font-bold hover:underline">Clear Search &amp; Filters</button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
