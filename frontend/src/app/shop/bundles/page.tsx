"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function BundlesShop() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { addToCart } = useStore();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        const q = query(collection(db, 'bundles'), where('isAvailable', '==', true));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBundles(fetched);
      } catch (err) {
        console.error("Error fetching bundles: ", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBundles();
  }, []);

  const addToCartMock = (productName: string, price: string) => {
    const id = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addToCart({ id, name: productName, price });
  };

  const filteredBundles = bundles.filter(b => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return b.name?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q);
  });

  return (
    <>
      <section className="w-full px-gutter-mobile lg:px-margin pt-32 pb-space-lg bg-surface-container-low/50">
        <nav aria-label="Breadcrumbs" className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-medium">Bundles</span>
        </nav>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="max-w-3xl">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">Complete Botanical Bundles</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-2xl">
              Curated collections of our finest plants and accessories. Perfect for transforming any space effortlessly and saving up to 25%.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center">
            <Link 
              href="/shop/bundles/custom" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md text-label-md font-bold rounded-xl transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              Create Your Own Bundle
            </Link>
          </div>
        </div>

        {/* Mobile & Desktop Search Bar */}
        <div className="relative max-w-md mt-4">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">search</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bundles by name..." 
            className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-surface-container-lowest border border-stone-300 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-error cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </section>

      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl min-h-[50vh]">
        {loading ? (
          <div className="flex items-center justify-center w-full h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredBundles.length === 0 ? (
          <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-surface-container">
            <span className="material-symbols-outlined text-4xl text-outline mb-3">inventory_2</span>
            <h3 className="font-title-lg text-primary font-bold">No bundles found</h3>
            <p className="text-on-surface-variant mt-2">Try searching for another bundle name or clear search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {filteredBundles.map((bundle) => (
              <div key={bundle.id} className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between border border-surface-container">
                <div>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden bg-surface-container mb-space-md">
                    <img src={bundle.image || '/hero_full_bg.png'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={bundle.name} />
                  </div>
                  <h3 className="font-title-lg text-primary font-bold mt-1">{bundle.name}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 line-clamp-3">
                    {bundle.description}
                  </p>
                </div>
                <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                  <div>
                    <span className="font-price-lg text-price-lg text-primary font-bold">₹{bundle.price}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => addToCartMock(bundle.name, `₹${bundle.price}`)} 
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-sm text-label-sm font-bold uppercase transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
                    Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
