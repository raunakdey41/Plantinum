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

  // Total available plant inventory count
  const totalPlantCount = useMemo(() => products.filter(p => p.lightRequirements !== 'N/A').length, []);

  // Filter States
  const [filters, setFilters] = useState({
    categories: [] as string[],
    sunlight: [] as string[],
    watering: [] as string[],
    petFriendly: false,
    minPrice: 0,
    maxPrice: 5000
  });
  
  const [sortBy, setSortBy] = useState('featured');
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

  const checkPincode = () => {
    const val = pincode.trim();
    if (val.length === 6 && !isNaN(Number(val))) {
      setPincodeFeedback('✓ Express dispatch available: Delivered in 24-48 hours!');
    } else {
      setPincodeFeedback('⚠️ Please enter a valid 6-digit Indian pincode');
    }
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => {
      const current = prev.categories;
      return {
        ...prev,
        categories: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
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

  const handleWateringChange = (value: string) => {
    setFilters(prev => {
      const current = prev.watering;
      return {
        ...prev,
        watering: current.includes(value) ? current.filter(item => item !== value) : [...current, value]
      };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      sunlight: [],
      watering: [],
      petFriendly: false,
      minPrice: 0,
      maxPrice: 5000
    });
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.lightRequirements !== 'N/A');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.botanicalName && p.botanicalName.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.badges && p.badges.some(b => b.toLowerCase().includes(q)))
      );
    }

    if (filters.categories.length > 0) {
      result = result.filter(p => {
        return filters.categories.some(cat => {
          if (cat === 'Air Purifying') return p.badges.includes('Air Purifying') || p.badges.includes('NASA Purifier') || p.category === 'Air Purifying';
          if (cat === 'Low Light Tolerant') return p.lightRequirements.toLowerCase().includes('low') || p.category === 'Low Light Tolerant';
          if (cat === 'Pet-Safe Sanctuaries') return p.petSafe || p.category === 'Pet-Safe Sanctuaries' || p.badges.some(b => b.includes('Pet Safe'));
          if (cat === 'Lucky & Auspicious Plants') return p.name.includes('Money') || p.name.includes('Lucky') || p.badges.includes('Gifting Favorite');
          if (cat === 'Statement & Rare Foliage') return p.badges.includes('Statement Plant') || p.badges.includes('Rare Foliage') || p.badges.includes('Showstopper') || p.category === 'Monsteras & Aroids';
          if (cat === 'Flowering & Blooming') return p.badges.includes('Flowering');
          return false;
        });
      });
    }

    if (filters.petFriendly) {
      result = result.filter(p => p.petSafe || p.badges.some(b => b.includes('Pet Safe')) || p.name.includes('Spider') || p.name.includes('Areca'));
    }

    if (filters.sunlight.length > 0) {
      result = result.filter(p => filters.sunlight.some(light => p.lightRequirements.toLowerCase().includes(light.toLowerCase())));
    }

    if (filters.watering.length > 0) {
      result = result.filter(p => filters.watering.some(w => p.wateringFrequency.toLowerCase().includes(w.toLowerCase())));
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
  }, [filters, sortBy, searchQuery]);

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/10 text-emerald-900 border border-emerald-900/20 text-xs font-bold mb-3 shadow-xs">
              <span className="material-symbols-outlined text-base text-emerald-700">eco</span>
              <span>{totalPlantCount} Botanicals In Stock</span>
              <span className="mx-1 opacity-40">•</span>
              <span>Acclimatized for Indian Weather</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-bold">Indoor &amp; Living Plants</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Hand-nurtured, pest-inspected flora potted in nutrient-rich custom soil. Delivered pan-India in our specialized triple-cushion transit armor with an unconditional 7-day health guarantee.
            </p>
          </div>
          
          <div className="bg-surface-container-lowest p-3.5 rounded-xl shadow-sm flex flex-col gap-1.5 shrink-0 max-w-sm w-full md:w-auto">
            <span className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[15px] text-secondary">local_shipping</span> Check Pincode Express Dispatch
            </span>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 700001" 
                className="bg-surface-container-low px-3 py-1.5 rounded-lg text-body-sm font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest w-36 border border-stone-200" 
              />
              <button 
                type="button" 
                onClick={checkPincode}
                className="px-3.5 py-1.5 bg-primary text-on-primary text-label-sm font-label-sm rounded-lg hover:bg-primary-container transition-colors cursor-pointer font-bold"
              >
                Check
              </button>
            </div>
            <p className={`text-[11px] font-medium ${pincodeFeedback?.includes('⚠️') ? 'text-error' : 'text-secondary'}`}>
              {pincodeFeedback || '✓ Metro Kolkata: Next-Day Delivery Available'}
            </p>
          </div>
        </div>
      </section>

      {/* Controls Bar - Fixed Sticky position at top-[64px] on mobile & top-[112px] on desktop */}
      <section className="sticky top-[64px] md:top-[112px] z-40 bg-surface-container-lowest/95 backdrop-blur-md shadow-sm px-gutter-mobile lg:px-margin py-3 border-y border-stone-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Mobile Full Width / Desktop Search Input with Autosuggestion */}
          <div className="w-full md:w-auto md:flex-1 flex items-center gap-2 max-w-md">
            <div className="relative w-full">
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
                placeholder="Search plants by name..." 
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-surface-container-low border border-stone-200 text-on-surface focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary shadow-xs font-medium"
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
                    <span>Suggested Botanicals ({autoSuggestions.length})</span>
                    <span className="material-symbols-outlined text-xs text-emerald-800">local_florist</span>
                  </div>
                  <ul className="max-h-64 overflow-y-auto divide-y divide-stone-100">
                    {autoSuggestions.map((item) => (
                      <li key={item.id}>
                        <Link 
                          href={`/shop/indoor-plants/${item.id}`}
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
          </div>

          {/* Action controls row */}
          <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
            <button 
              type="button" 
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)} 
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm cursor-pointer shrink-0 border border-stone-200"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filters</span>
            </button>

            <span className="font-body-sm text-body-sm text-on-surface-variant hidden lg:inline">
              Showing <strong className="text-primary font-bold">{filteredProducts.length}</strong> of <strong className="text-primary font-bold">{totalPlantCount}</strong> curated botanicals
            </span>

            <div className="flex items-center gap-3 ml-auto md:ml-0">
              <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-surface-container-low border border-stone-200">
                <button 
                  type="button" 
                  title="4 Columns" 
                  className={`p-1 rounded-md cursor-pointer ${viewGrid4 ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary transition-colors'}`}
                  onClick={() => setViewGrid4(true)}
                >
                  <span className="material-symbols-outlined text-[18px]">grid_view</span>
                </button>
                <button 
                  type="button" 
                  title="3 Columns Editorial" 
                  className={`p-1 rounded-md cursor-pointer ${!viewGrid4 ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-outline hover:text-primary transition-colors'}`}
                  onClick={() => setViewGrid4(false)}
                >
                  <span className="material-symbols-outlined text-[18px]">view_module</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="sortBy" className="hidden sm:inline font-label-sm text-label-sm text-outline font-semibold">Sort by:</label>
                <div className="relative">
                  <select 
                    id="sortBy" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-surface-container-low text-primary font-body-sm text-body-sm font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:bg-surface-container-lowest shadow-sm cursor-pointer border border-stone-200 text-xs sm:text-sm"
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

        </div>
      </section>

      <div className="w-full px-gutter-mobile lg:px-margin py-space-lg flex gap-gutter items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 sticky top-44 max-h-[calc(100vh-12rem)] overflow-y-auto pr-3 gap-5 border-r border-stone-200/80">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="font-title-md text-title-md text-primary font-bold">Refine Search</h2>
            <button type="button" onClick={clearAllFilters} className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer">Reset All</button>
          </div>

          {/* 1. BOTANICAL CATEGORY & FEATURES FILTER */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold text-xs flex items-center justify-between">
              <span>Botanical Collection</span>
              <span className="material-symbols-outlined text-[16px]">filter_alt</span>
            </span>
            <div className="flex flex-col gap-2 pl-1 text-xs text-on-surface-variant font-medium">
              {[
                "Air Purifying",
                "Low Light Tolerant",
                "Pet-Safe Sanctuaries",
                "Lucky & Auspicious Plants",
                "Statement & Rare Foliage",
                "Flowering & Blooming"
              ].map((cat) => (
                <label key={cat} className="flex items-center gap-2.5 cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="checkbox" 
                    checked={filters.categories.includes(cat)} 
                    onChange={() => handleCategoryChange(cat)} 
                    className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" 
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-px bg-stone-200/80 w-full" />
          
          {/* 2. SUNLIGHT TOLERANCE */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold text-xs flex items-center justify-between">
              <span>Sunlight Tolerance</span>
              <span className="material-symbols-outlined text-[16px]">wb_sunny</span>
            </span>
            <div className="flex flex-col gap-2 pl-1 text-xs text-on-surface-variant font-medium">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('low')} onChange={() => handleSunlightChange('low')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Low Light Tolerant</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('indirect')} onChange={() => handleSunlightChange('indirect')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Bright Indirect</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.sunlight.includes('sun')} onChange={() => handleSunlightChange('sun')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Direct Sun / Balcony</span>
              </label>
            </div>
          </div>

          <div className="h-px bg-stone-200/80 w-full" />

          {/* 3. WATERING SCHEDULE */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold text-xs flex items-center justify-between">
              <span>Watering Schedule</span>
              <span className="material-symbols-outlined text-[16px]">water_drop</span>
            </span>
            <div className="flex flex-col gap-2 pl-1 text-xs text-on-surface-variant font-medium">
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.watering.includes('weekly')} onChange={() => handleWateringChange('weekly')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Weekly (Moisture Loving)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.watering.includes('fortnightly')} onChange={() => handleWateringChange('fortnightly')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Fortnightly (Drought Tolerant)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer hover:text-primary">
                <input type="checkbox" checked={filters.watering.includes('twice')} onChange={() => handleWateringChange('twice')} className="w-4 h-4 rounded text-secondary focus:ring-primary accent-emerald-800 cursor-pointer" />
                <span>Twice a Week</span>
              </label>
            </div>
          </div>

          <div className="h-px bg-stone-200/80 w-full" />
          
          {/* 4. PET FRIENDLY TOGGLE */}
          <div className="p-3.5 rounded-xl bg-surface-container-low flex items-center justify-between border border-stone-200">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-emerald-800 text-[20px]">pets</span>
              <div>
                <p className="font-label-md text-label-md text-primary font-bold leading-tight">Pet-Friendly Only</p>
                <p className="text-[11px] text-on-surface-variant">Non-toxic to cats &amp; dogs</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={filters.petFriendly} onChange={() => setFilters(p => ({ ...p, petFriendly: !p.petFriendly }))} className="sr-only peer" />
              <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-800"></div>
            </label>
          </div>
          
          {/* 5. PRICE BUDGET */}
          <div className="flex flex-col gap-2.5">
            <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-bold text-xs">Price Budget (₹)</span>
            <div className="flex items-center gap-2 font-body-sm">
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-xs">₹</span>
                <input type="number" value={filters.minPrice} onChange={e => setFilters(p => ({ ...p, minPrice: Number(e.target.value) }))} className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-surface-container-lowest text-body-sm font-semibold text-primary border border-stone-200" />
              </div>
              <span className="text-outline text-xs">to</span>
              <div className="relative flex-1">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-xs">₹</span>
                <input type="number" value={filters.maxPrice} onChange={e => setFilters(p => ({ ...p, maxPrice: Number(e.target.value) }))} className="w-full pl-6 pr-2 py-1.5 rounded-lg bg-surface-container-lowest text-body-sm font-semibold text-primary border border-stone-200" />
              </div>
            </div>
          </div>
          
          <div className="p-4 rounded-xl bg-emerald-900/10 text-emerald-950 flex flex-col gap-2 border border-emerald-900/20">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-label-md">
              <span className="material-symbols-outlined text-[20px]">verified</span>
              <span>Plantinum 100% Assurance</span>
            </div>
            <p className="text-xs text-stone-700 leading-relaxed">
              Every botanical is acclimated for 14 days in our Kolkata green facility before packaging. Arrives vibrant, pest-free, and guaranteed.
            </p>
          </div>
        </aside>

        {/* PRODUCT CATALOG GRID & MID-BANNER */}
        <div className="flex-1 min-w-0 flex flex-col gap-space-xl">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 p-8 shadow-sm">
              <span className="material-symbols-outlined text-stone-400 text-5xl mb-2">filter_alt_off</span>
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-1">No botanicals match your filter criteria</h3>
              <p className="text-stone-500 text-xs mb-6">Try resetting filters to explore all available plants.</p>
              <button onClick={clearAllFilters} className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-xs hover:bg-emerald-950 cursor-pointer">Reset All Filters</button>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${viewGrid4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-gutter-mobile lg:gap-gutter`}>
                {filteredProducts.slice(0, 4).map(product => {
                  const cartItem = cart.find(item => item.id === product.id);
                  return (
                    <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-stone-200/80">
                      <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                        {product.badges && product.badges.length > 0 && <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[10px] uppercase font-bold border border-stone-200">{product.badges[0]}</span>}
                        <button 
                          type="button" 
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-outline hover:text-tertiary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: wishlist.includes(product.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.includes(product.id) ? 'var(--color-tertiary)' : undefined }}>favorite</span>
                        </button>
                        <Link href={`/shop/product/${product.id}`} className="w-full h-full block">
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
                          <Link href={`/shop/product/${product.id}`}>
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
                    <article key={product.id} className="group bg-surface-container-lowest rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden border border-stone-200/80">
                      <div className="relative aspect-square w-full bg-surface-container-low overflow-hidden flex items-center justify-center p-3">
                        {product.badges && product.badges.length > 0 && <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm text-primary font-label-sm text-[10px] uppercase font-bold border border-stone-200">{product.badges[0]}</span>}
                        <button 
                          type="button" 
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 z-10 w-7 h-7 rounded-full bg-surface-container-lowest/90 backdrop-blur-sm flex items-center justify-center text-outline hover:text-tertiary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: wishlist.includes(product.id) ? "'FILL' 1" : "'FILL' 0", color: wishlist.includes(product.id) ? 'var(--color-tertiary)' : undefined }}>favorite</span>
                        </button>
                        <Link href={`/shop/product/${product.id}`} className="w-full h-full block">
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
                          <Link href={`/shop/product/${product.id}`}>
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

      {/* MOBILE FILTER MODAL DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-[120] bg-black/50 backdrop-blur-sm lg:hidden flex justify-end">
          <div className="w-full max-w-xs bg-white h-full p-5 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 mb-4">
                <h3 className="font-serif font-bold text-lg text-stone-900">Refine Search</h3>
                <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 text-stone-500 hover:text-stone-900">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="space-y-6">
                {/* Mobile Botanical Features */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-900 block mb-2">Botanical Collection</span>
                  <div className="space-y-2 text-xs text-stone-700">
                    {[
                      "Air Purifying",
                      "Low Light Tolerant",
                      "Pet-Safe Sanctuaries",
                      "Lucky & Auspicious Plants",
                      "Statement & Rare Foliage",
                      "Flowering & Blooming"
                    ].map((cat) => (
                      <label key={cat} className="flex items-center gap-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={filters.categories.includes(cat)} 
                          onChange={() => handleCategoryChange(cat)} 
                          className="w-4 h-4 rounded text-emerald-800 accent-emerald-800" 
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Mobile Sunlight */}
                <div>
                  <span className="font-bold text-xs uppercase tracking-wider text-stone-900 block mb-2">Sunlight</span>
                  <div className="space-y-2 text-xs text-stone-700">
                    <label className="flex items-center gap-2.5">
                      <input type="checkbox" checked={filters.sunlight.includes('low')} onChange={() => handleSunlightChange('low')} className="w-4 h-4 rounded accent-emerald-800" />
                      <span>Low Light</span>
                    </label>
                    <label className="flex items-center gap-2.5">
                      <input type="checkbox" checked={filters.sunlight.includes('indirect')} onChange={() => handleSunlightChange('indirect')} className="w-4 h-4 rounded accent-emerald-800" />
                      <span>Bright Indirect</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-200 flex gap-3">
              <button onClick={clearAllFilters} className="flex-1 py-2.5 rounded-xl border border-stone-300 font-bold text-xs">Reset</button>
              <button onClick={() => setIsMobileFilterOpen(false)} className="flex-1 py-2.5 rounded-xl bg-emerald-950 text-white font-bold text-xs">Apply</button>
            </div>
          </div>
        </div>
      )}

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
