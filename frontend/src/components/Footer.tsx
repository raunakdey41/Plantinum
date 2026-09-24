"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  if (pathname.startsWith('/admin')) {
    return null;
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <footer className="w-full bg-[#182d21] text-white mt-space-xl pt-12 pb-24 md:pb-12 border-t border-white/10">
      
      {/* Top Value Propositions Marquee Banner */}
      <div className="w-full py-4 bg-black/20 overflow-hidden border-y border-white/10 mb-10">
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 gap-8 md:gap-16 px-4 md:px-8 items-center">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">verified_user</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">100% Transit Safe</p>
                  <p className="text-[11px] text-stone-300">Triple-cushioned armor delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">eco</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">7-Day Health Guarantee</p>
                  <p className="text-[11px] text-stone-300">Free replacement if damaged</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">support_agent</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Horticulturalist Support</p>
                  <p className="text-[11px] text-stone-300">Lifetime free plant advice</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-400 text-2xl">local_shipping</span>
                <div className="text-left">
                  <p className="text-xs font-bold text-white">Pan-India Fast Courier</p>
                  <p className="text-[11px] text-stone-300">Delivered within 2-4 days</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Footer Grid Section */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
        
        {/* Col 1: Brand Info */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-md">
              <img src="/logo_emblem.jpg" alt="Plantinum Emblem" className="w-full h-full object-cover rounded-lg" />
            </div>
            <span className="font-serif text-2xl font-bold tracking-widest text-white">PLANTINUM</span>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed">
            Where Nature Meets Luxury. Hand-reared botanicals potted in nutrient-dense soil for Indian homes and modern executive workspaces.
          </p>
        </div>

        {/* Col 2: Navigation Links with Interactive "Shop" Dropdown */}
        <div className="flex flex-col gap-3" ref={dropdownRef}>
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Quick Navigation</h4>
          <ul className="flex flex-col gap-2.5 text-xs text-stone-200">
            <li>
              <Link href="/" className="hover:text-emerald-400 transition-colors">Home</Link>
            </li>

            {/* Interactive Shop Dropdown Item */}
            <li className="relative">
              <button 
                type="button" 
                onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)}
                className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer text-xs font-bold text-white group"
              >
                <span>Shop</span>
                <span className={`material-symbols-outlined text-base text-emerald-400 transition-transform duration-300 ${isShopDropdownOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {/* Animated Shop Sub-Menu Dropdown */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isShopDropdownOpen 
                  ? 'max-h-48 opacity-100 mt-2 pt-2 border-t border-white/10' 
                  : 'max-h-0 opacity-0 pointer-events-none'
              }`}>
                <ul className="flex flex-col gap-2 pl-3 border-l-2 border-emerald-500/60 text-xs">
                  <li>
                    <Link 
                      href="/shop/indoor-plants" 
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="text-stone-200 hover:text-emerald-400 transition-colors flex items-center gap-2 py-1 font-medium"
                    >
                      <span>🌿</span>
                      <span>Indoor plants</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/shop/care-and-soil" 
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="text-stone-200 hover:text-emerald-400 transition-colors flex items-center gap-2 py-1 font-medium"
                    >
                      <span>🧪</span>
                      <span>Plant Care and Soil</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/shop/by-space" 
                      onClick={() => setIsShopDropdownOpen(false)}
                      className="text-stone-200 hover:text-emerald-400 transition-colors flex items-center gap-2 py-1 font-medium"
                    >
                      <span>🏡</span>
                      <span>Shop by Space</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </li>

            <li>
              <Link href="/shop/bundles" className="hover:text-emerald-400 transition-colors">Shop by Bundle</Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-emerald-400 transition-colors">Track Order</Link>
            </li>
          </ul>
        </div>

        {/* Col 3: Customer Care & Plant Doctor */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Botanical Support</h4>
          <ul className="flex flex-col gap-2 text-xs text-stone-200">
            <li><span className="text-stone-300">Mon - Sat: 9:00 AM - 7:00 PM</span></li>
            <li><span className="text-stone-300">Email: info@plantinum.in</span></li>
            <li><span className="text-stone-300">Dispatch: Metro Kolkata &amp; Pan-India</span></li>
            <li>
              <Link href="/track-order" className="inline-flex items-center gap-1.5 text-emerald-400 font-bold hover:underline mt-1">
                <span className="material-symbols-outlined text-sm">support_agent</span>
                <span>Plant Doctor Helpdesk</span>
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 4: Trust & Guarantee Badge */}
        <div className="flex flex-col gap-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Quality Assured</h4>
          <div className="bg-black/30 p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <span className="material-symbols-outlined text-base">verified</span>
              <span>Plantinum Promise</span>
            </div>
            <p className="text-[11px] text-stone-300">
              Every specimen undergoes 3-stage pest checks and arrives in specialized protective transit frames.
            </p>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-stone-400">
        <p>© 2026 Plantinum Botanicals. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <Link href="/shop/indoor-plants" className="hover:text-white transition-colors">Indoor Plants</Link>
          <Link href="/shop/care-and-soil" className="hover:text-white transition-colors">Plant Care</Link>
          <Link href="/shop/by-space" className="hover:text-white transition-colors">Shop by Space</Link>
        </div>
      </div>
    </footer>
  );
}
