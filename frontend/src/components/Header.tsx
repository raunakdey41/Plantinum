"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import AuthModal from './AuthModal';
import LocationModal from './LocationModal';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import { searchProducts, Product } from '@/data/products';

export default function Header() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';
  const isSolid = !isHomePage || isScrolled;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { cart, cartCount, wishlistCount, deliveryLocation, setDeliveryLocation, user } = useStore();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Small timeout ensures the DOM has updated with the correct active classes before measuring
    const timeout = setTimeout(() => {
      const activeLink = navRef.current?.querySelector('.active-nav-link') as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1
        });
      }
    }, 50);
    return () => clearTimeout(timeout);
  }, [pathname, isSolid]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const results = await searchProducts(query);
    setSearchResults(results);
  };

  const cartTotal = cart.reduce((total, item) => {
    // Remove all non-numeric characters from price string and convert to number
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    return total + (numPrice * item.quantity);
  }, 0);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        <div className={`w-full transition-all duration-300 border-b border-white/10 ${
          isScrolled 
            ? 'bg-[#182d21]/90 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.25)]' 
            : isHomePage 
              ? 'bg-transparent backdrop-blur-[2px]' 
              : 'bg-[#182d21]/90 backdrop-blur-xl'
        }`}>
          {/* Top Utility & Main Navigation Bar */}
          <div className="max-w-[1720px] mx-auto px-6 lg:px-12 py-3.5 flex items-center justify-between gap-4 lg:gap-8">
            {/* Left Section: Logo & Deliver-to Selector */}
            <div className="flex items-center gap-6 shrink-0">
              <button aria-label="Open menu" type="button" className="lg:hidden p-2 rounded-lg focus:outline-none cursor-pointer text-white hover:text-white/80" onClick={() => setIsMobileMenuOpen(true)}>
                <span className="material-symbols-outlined text-2xl">menu</span>
              </button>
              <Link href="/" className="flex items-center gap-3.5 group">
                <div className="w-11 h-11 lg:w-12 lg:h-12 rounded-lg bg-stone-100/95 flex items-center justify-center p-1.5 shadow-md shadow-black/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                  <svg className="w-full h-full text-[#182d21] fill-current" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <path d="M50 8C43 25 22 35 15 55c-7 20 5 37 25 37 14 0 25-8 30-18 5 10 16 18 30 18 20 0 32-17 25-37C118 35 97 25 90 8c-3 18-12 32-20 40 3-15-8-30-20-40z" opacity="0.85"></path>
                    <path d="M50 20c-2 20-10 38-20 52 8 0 16-5 20-14 4 9 12 14 20 14-10-14-18-32-20-52z" fill="#0f1c13"></path>
                    <circle cx="50" cy="50" fill="#d4af37" r="4"></circle>
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif text-xl lg:text-2xl font-bold tracking-wider text-white uppercase leading-none">Plantinum</span>
                  <span className="text-[9px] tracking-[0.26em] text-stone-300 font-semibold mt-1">WHERE NATURE MEETS LUXURY</span>
                </div>
              </Link>
              <button 
                type="button" 
                onClick={() => setIsLocationOpen(true)}
                className="nav-pill hidden xl:flex items-center gap-2.5 px-4 py-2 rounded-full text-xs text-stone-200 tracking-wide font-medium cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px] text-stone-300">location_on</span>
                <span>Deliver to: <strong className="font-semibold text-white">{deliveryLocation}</strong></span>
                <span className="material-symbols-outlined text-[14px] text-stone-300 ml-0.5">expand_more</span>
              </button>
            </div>

            {/* Middle Section: Search Plants Bar */}
            <div className="hidden md:flex flex-1 max-w-xl mx-2 relative">
              <div className="search-input-bg relative w-full flex items-center rounded-full px-4 py-2.5 transition-all">
                <span className="material-symbols-outlined text-stone-400 text-[18px] ml-1 mr-3 pointer-events-none">search</span>
                <input 
                  type="text" 
                  placeholder="Search plants..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  className="w-full bg-transparent border-0 text-sm text-white placeholder-stone-400 focus:ring-0 focus:outline-none p-0" 
                />
              </div>
              
              {isSearchOpen && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container overflow-hidden z-[100]">
                  <ul className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map(product => (
                      <li key={product.id}>
                        <Link href={`/shop/indoor-plants/${product.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container transition-colors">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-surface-container-low" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-title-md text-sm text-primary font-bold truncate">{product.name}</span>
                            <span className="text-[11px] text-on-surface-variant italic truncate">{product.botanicalName}</span>
                          </div>
                          <span className="font-price-lg text-primary text-sm">₹{product.price}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right Section: Action Links & Profile Icons */}
            <nav aria-label="Customer quick links" className="flex items-center gap-4 lg:gap-6 shrink-0 text-xs font-medium tracking-wide text-stone-200">
              <button type="button" onClick={() => showToast("Order tracking details will be sent via SMS.")} className="hidden xl:flex items-center gap-2 text-stone-300 hover:text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-stone-300">location_searching</span>
                <span>Track Order</span>
              </button>
              <button type="button" onClick={() => showToast("Plant Doctor consultation is ready to assist you.")} className="hidden xl:flex items-center gap-2 text-stone-300 hover:text-white transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-stone-300">support_agent</span>
                <span>Plant Doctor</span>
              </button>
              <button type="button" aria-label="Search" className="md:hidden p-2 cursor-pointer transition-colors text-white hover:text-white/80" onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <span className="material-symbols-outlined text-2xl">{isSearchOpen ? 'close' : 'search'}</span>
              </button>
              <button type="button" onClick={() => setIsWishlistOpen(true)} aria-label="Wishlist" className="w-9 h-9 rounded-full hidden md:flex items-center justify-center hover:bg-white/10 text-stone-200 hover:text-white transition relative cursor-pointer">
                <span className="material-symbols-outlined text-[20px]">favorite_border</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-tertiary-container text-on-tertiary font-bold text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button type="button" onClick={() => setIsCartOpen(true)} aria-label="Cart" className="bg-[#0f1c13]/70 hover:bg-[#0f1c13] border border-white/15 flex items-center gap-2.5 px-4 py-2 rounded-full transition shadow-sm cursor-pointer">
                <span className="material-symbols-outlined text-[18px] text-stone-200">shopping_bag</span>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Cart</span>
                  <span className="text-xs font-bold text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </button>
              <button type="button" onClick={() => setIsAuthOpen(true)} className="flex items-center gap-2 text-stone-200 hover:text-white transition pl-1 cursor-pointer">
                {user ? (
                  <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-secondary font-bold uppercase text-xs">
                    {user.email?.charAt(0) || 'U'}
                  </div>
                ) : (
                  <span className="material-symbols-outlined text-[22px] text-stone-300">account_circle</span>
                )}
                <span className="hidden sm:inline font-semibold text-xs">
                  {user ? user.email?.split('@')[0] : 'Sign In'}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Mobile Search Bar Expandable */}
          {isSearchOpen && (
            <div className="md:hidden px-gutter-mobile pb-3">
              <div className="relative w-full">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Search plants..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-body-sm font-body-sm bg-surface-container-low rounded-full text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest focus:ring-1 focus:ring-primary shadow-inner" 
                />
              </div>
              {searchResults.length > 0 && (
                <div className="absolute left-4 right-4 mt-2 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-container overflow-hidden z-[100]">
                  <ul className="max-h-80 overflow-y-auto py-2">
                    {searchResults.map(product => (
                      <li key={product.id}>
                        <Link href={`/shop/indoor-plants/${product.id}`} onClick={() => setIsSearchOpen(false)} className="flex items-center gap-3 px-4 py-2 hover:bg-surface-container transition-colors">
                          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg bg-surface-container-low" />
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="font-title-md text-sm text-primary font-bold truncate">{product.name}</span>
                            <span className="text-[11px] text-on-surface-variant italic truncate">{product.botanicalName}</span>
                          </div>
                          <span className="font-price-lg text-primary text-sm">₹{product.price}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Secondary Categorized Header Navigation Menu */}
          <nav aria-label="Store departments" className="hidden lg:flex items-center justify-center gap-8 md:gap-14 border-t border-white/10 py-3 text-[11px] md:text-xs font-semibold tracking-[0.2em] text-stone-300 uppercase">
            <Link href="/" className={`relative py-1 transition-colors ${pathname === '/' ? 'text-white' : 'hover:text-white'}`}>
              HOME
              {pathname === '/' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
              )}
            </Link>
            <Link href="/shop/indoor-plants" className={`relative py-1 transition-colors ${pathname.startsWith('/shop/indoor-plants') ? 'text-white' : 'hover:text-white'}`}>
              INDOOR PLANTS
              {pathname.startsWith('/shop/indoor-plants') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
              )}
            </Link>
            <Link href="/shop/care-and-soil" className={`relative py-1 transition-colors ${pathname.startsWith('/shop/care-and-soil') ? 'text-white' : 'hover:text-white'}`}>
              PLANT CARE &amp; SOIL
              {pathname.startsWith('/shop/care-and-soil') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
              )}
            </Link>
            <Link href="/shop/by-space" className={`relative py-1 transition-colors ${pathname.startsWith('/shop/by-space') ? 'text-white' : 'hover:text-white'}`}>
              SHOP BY SPACE
              {pathname.startsWith('/shop/by-space') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full"></span>
              )}
            </Link>
          </nav>
        </div>
      </header>
      
      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-[120] bg-surface/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-surface-container-lowest z-[130] shadow-2xl transition-transform duration-300 transform lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <div className="flex items-center gap-2 text-primary font-bold">
            <img src="/logo.jpeg" alt="Plantinum Logo" className="h-8 w-auto rounded object-contain" /> PLANTINUM
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-on-surface hover:text-error rounded-full transition-colors cursor-pointer"><span className="material-symbols-outlined">close</span></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <div className="flex flex-col gap-1 px-3 mb-6">
            <Link href="/shop/indoor-plants" className="px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Indoor Plants</Link>
            <Link href="/shop/care-and-soil" className="px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Plant Care &amp; Soil</Link>
            <Link href="/shop/by-space" className="px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Shop by Space</Link>
          </div>
          <div className="h-px bg-surface-container mx-4 mb-6"></div>
          <div className="flex flex-col gap-1 px-3">
            <button type="button" onClick={() => {setIsMobileMenuOpen(false); setIsAuthOpen(true);}} className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 cursor-pointer">
              <span className="material-symbols-outlined">account_circle</span> {user ? 'My Account' : 'Sign In'}
            </button>
            <button type="button" onClick={() => {setIsMobileMenuOpen(false); setIsLocationOpen(true);}} className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 cursor-pointer">
              <span className="material-symbols-outlined">location_on</span> Delivery Address
            </button>
            <button type="button" onClick={() => {setIsMobileMenuOpen(false); setIsWishlistOpen(true);}} className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 cursor-pointer">
              <span className="material-symbols-outlined">favorite</span> Wishlist ({wishlistCount})
            </button>
            <button type="button" onClick={() => {setIsMobileMenuOpen(false); setIsCartOpen(true);}} className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 cursor-pointer">
              <span className="material-symbols-outlined">shopping_bag</span> Cart ({cartCount})
            </button>
            <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined">pin_drop</span> Track Order
            </Link>
            <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3">
              <span className="material-symbols-outlined">support_agent</span> Plant Doctor
            </Link>
          </div>
        </div>
      </div>
      
      {/* Render the modals outside the header to avoid backdrop-blur clipping */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />

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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[90] bg-surface-container-lowest/90 backdrop-blur-md shadow-[0_-8px_20px_-4px_rgba(11,43,38,0.08)] border-t border-surface-container">
        <div className="grid grid-cols-5 h-16 items-center px-space-xs text-center">
          <Link href="/" className="flex flex-col items-center justify-center gap-0.5 text-secondary">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="font-label-sm text-[10px]">Home</span>
          </Link>
          <Link href="/shop/indoor-plants" className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-secondary">
            <span className="material-symbols-outlined text-2xl">potted_plant</span>
            <span className="font-label-sm text-[10px]">Shop</span>
          </Link>
          <button type="button" onClick={() => setIsWishlistOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-secondary relative cursor-pointer">
            <span className="material-symbols-outlined text-2xl">favorite</span>
            {wishlistCount > 0 && <span className="absolute top-1 right-3 sm:right-5 w-4 h-4 bg-tertiary-container text-on-tertiary font-bold text-[10px] rounded-full flex items-center justify-center">{wishlistCount}</span>}
            <span className="font-label-sm text-[10px]">Wishlist</span>
          </button>
          <button type="button" onClick={() => setIsCartOpen(true)} className="flex flex-col items-center justify-center gap-0.5 text-on-surface-variant hover:text-secondary relative cursor-pointer">
            <span className="material-symbols-outlined text-2xl">shopping_bag</span>
            {cartCount > 0 && <span className="absolute top-1 right-3 sm:right-5 w-4 h-4 bg-primary text-on-primary font-bold text-[10px] rounded-full flex items-center justify-center">{cartCount}</span>}
            <span className="font-label-sm text-[10px]">Cart</span>
          </button>
        </div>
      </div>
    </>
  );
}
