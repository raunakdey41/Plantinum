"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import AuthModal from './AuthModal';
import LocationModal from './LocationModal';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import PlantDoctorModal from './PlantDoctorModal';
import { searchProducts, Product } from '@/data/products';

export default function Header() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const shopDropdownRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomePage = pathname === '/';
  const isLightHeader = isScrolled;
  const glowEffect = ''; 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isPlantDoctorOpen, setIsPlantDoctorOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isShopDropdownOpen, setIsShopDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const { cart, cartCount, wishlistCount, deliveryLocation, setDeliveryLocation, user } = useStore();

  const navLinks = [
    { label: 'HOME', href: '/' },
    { label: 'INDOOR PLANTS', href: '/shop/indoor-plants' },
    { label: 'PLANT CARE & SOIL', href: '/shop/care-and-soil' },
    { label: 'SHOP BY SPACE', href: '/shop/by-space' },
    { label: 'SHOP BY BUNDLE', href: '/shop/bundles' },
  ];

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close account menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target as Node)) {
        setIsShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updateIndicator = () => {
      if (!navRef.current) return;
      const activeLink = navRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeLink) {
        setIndicatorStyle({
          left: activeLink.offsetLeft,
          width: activeLink.offsetWidth,
          opacity: 1
        });
      } else {
        setIndicatorStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateIndicator();
    const timeout = setTimeout(updateIndicator, 50);
    window.addEventListener('resize', updateIndicator);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateIndicator);
    };
  }, [pathname]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    const results = await searchProducts(query);
    setSearchResults(results);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsAccountMenuOpen(false);
      showToast("Signed out successfully.");
    } catch (e) {
      console.error(e);
    }
  };

  const cartTotal = cart.reduce((total, item) => {
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    return total + (numPrice * item.quantity);
  }, 0);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50">
        <div 
          className={`w-full transition-all duration-300 border-b ${
            isLightHeader 
              ? 'bg-white/80 backdrop-blur-2xl border-stone-200/80 shadow-[0_12px_35px_rgba(0,0,0,0.08)]' 
              : isHomePage
                ? 'bg-black/25 backdrop-blur-md border-white/15'
                : 'bg-[#182d21] border-white/10 shadow-lg'
          }`}
          style={isLightHeader ? {
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          } : undefined}
        >
          {/* Top Utility & Main Navigation Bar - Expanded Layout */}
          <div className={`max-w-[1720px] mx-auto px-6 lg:px-12 py-4 lg:py-5 flex items-center justify-between gap-4 lg:gap-8 ${glowEffect}`}>
            {/* Left Section: Prominent Logo Emblem & Deliver-to Selector */}
            <div className="flex items-center gap-6 lg:gap-8 shrink-0">
              <button 
                aria-label="Open menu" 
                type="button" 
                className={`lg:hidden p-2 rounded-lg focus:outline-none cursor-pointer transition-colors ${
                  isLightHeader ? 'text-[#182d21] hover:text-[#182d21]/70' : 'text-white hover:text-white/80'
                }`} 
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <span className="material-symbols-outlined text-3xl">menu</span>
              </button>
              
              <Link href="/" className="flex items-center gap-4 group">
                <div className="w-13 h-13 lg:w-15 lg:h-15 rounded-2xl bg-white flex items-center justify-center p-1 shadow-md shadow-black/15 group-hover:scale-105 transition-all duration-300 shrink-0 overflow-hidden border-2 border-white/40 ring-1 ring-black/5">
                  <img src="/logo_emblem.jpg" alt="Plantinum Emblem" className="w-full h-full object-cover rounded-xl" />
                </div>
                <div className="flex flex-col">
                  <span className={`font-serif text-2xl lg:text-3xl font-extrabold tracking-widest uppercase leading-none transition-colors duration-300 ${
                    isLightHeader ? 'text-[#182d21]' : 'text-white'
                  }`}>Plantinum</span>
                  <span className={`text-[10px] lg:text-[11px] tracking-[0.28em] font-extrabold mt-1.5 transition-colors duration-300 ${
                    isLightHeader ? 'text-stone-600' : 'text-stone-300'
                  }`}>WHERE NATURE MEETS LUXURY</span>
                </div>
              </Link>

              <button 
                type="button" 
                onClick={() => setIsLocationOpen(true)}
                className={`hidden xl:flex items-center gap-2.5 px-4 py-2.5 rounded-full text-xs tracking-wide font-medium cursor-pointer transition-all duration-300 ${
                  isLightHeader 
                    ? 'bg-white/80 hover:bg-white text-stone-800 border border-stone-300/80 shadow-2xs backdrop-blur-md' 
                    : 'nav-pill text-stone-200'
                }`}
              >
                <span className={`material-symbols-outlined text-[18px] ${isLightHeader ? 'text-emerald-800' : 'text-emerald-400'}`}>location_on</span>
                <span>Deliver to: <strong className={`font-semibold ${isLightHeader ? 'text-[#182d21]' : 'text-white'}`}>{deliveryLocation}</strong></span>
                <span className={`material-symbols-outlined text-[14px] ml-0.5 ${isLightHeader ? 'text-stone-500' : 'text-stone-300'}`}>expand_more</span>
              </button>
            </div>

            {/* Middle Section: EXPANDED Search Plants Bar */}
            <div className="hidden md:flex flex-1 max-w-2xl lg:max-w-3xl mx-4 lg:mx-8 relative">
              <div className={`relative w-full flex items-center rounded-full px-5 py-3 transition-all duration-300 ${
                isLightHeader 
                  ? 'bg-white/80 hover:bg-white border border-stone-300/80 focus-within:bg-white focus-within:border-emerald-800 focus-within:shadow-md backdrop-blur-md' 
                  : 'search-input-bg'
              }`}>
                <span className={`material-symbols-outlined text-[20px] ml-1 mr-3 pointer-events-none ${isLightHeader ? 'text-stone-500' : 'text-stone-400'}`}>search</span>
                <input 
                  type="text" 
                  placeholder="Search plants, pots, fertilizers, potting mixes..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setIsSearchOpen(true)}
                  onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
                  className={`w-full bg-transparent border-0 text-sm focus:ring-0 focus:outline-none p-0 transition-colors ${
                    isLightHeader 
                      ? 'text-[#182d21] placeholder-stone-400' 
                      : 'text-white placeholder-stone-400'
                  }`} 
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

            {/* Right Section: Compact Action Icons & Stylized Account Dropdown */}
            <nav aria-label="Customer quick links" className={`flex items-center gap-4 lg:gap-5 shrink-0 text-xs font-semibold tracking-wide transition-colors duration-300 ${
              isLightHeader ? 'text-stone-700' : 'text-stone-200'
            }`}>
              <button type="button" aria-label="Search" className={`md:hidden p-2 cursor-pointer transition-colors ${
                isLightHeader ? 'text-[#182d21] hover:text-[#182d21]/70' : 'text-white hover:text-white/80'
              }`} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <span className="material-symbols-outlined text-2xl">{isSearchOpen ? 'close' : 'search'}</span>
              </button>

              {/* Wishlist Icon */}
              <button type="button" onClick={() => setIsWishlistOpen(true)} aria-label="Wishlist" className={`w-10 h-10 rounded-full hidden md:flex items-center justify-center transition relative cursor-pointer ${
                isLightHeader 
                  ? 'hover:bg-black/5 text-stone-700 hover:text-[#182d21]' 
                  : 'hover:bg-white/10 text-stone-200 hover:text-white'
              }`}>
                <span className="material-symbols-outlined text-[22px]">favorite_border</span>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-tertiary-container text-on-tertiary font-bold text-[10px] rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart Button */}
              <button type="button" onClick={() => setIsCartOpen(true)} aria-label="Cart" className={`flex items-center gap-2.5 px-4 py-2.5 rounded-full transition shadow-md cursor-pointer ${
                isLightHeader
                  ? 'bg-[#182d21] hover:bg-[#112218] border border-[#182d21] text-white'
                  : 'bg-[#0f1c13]/80 hover:bg-[#0f1c13] border border-white/20'
              }`}>
                <span className="material-symbols-outlined text-[20px] text-emerald-400">shopping_bag</span>
                <div className="flex flex-col text-left leading-tight">
                  <span className={`text-[10px] uppercase font-semibold tracking-wider ${isLightHeader ? 'text-stone-300' : 'text-stone-400'}`}>Cart</span>
                  <span className="text-xs font-bold text-white">₹{cartTotal.toLocaleString('en-IN')}</span>
                </div>
              </button>

              {/* Account Dropdown Wrapper */}
              <div className="relative" ref={accountMenuRef}>
                <button 
                  type="button" 
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)} 
                  className={`flex items-center gap-2 transition px-3 py-2 rounded-full cursor-pointer border ${
                    isLightHeader 
                      ? 'border-stone-300/80 hover:bg-stone-100 text-stone-800' 
                      : 'border-white/20 hover:bg-white/10 text-white'
                  }`}
                >
                  {user ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold uppercase text-xs shadow-xs">
                      {user.email?.charAt(0) || 'U'}
                    </div>
                  ) : (
                    <span className={`material-symbols-outlined text-[24px] ${isLightHeader ? 'text-emerald-800' : 'text-emerald-400'}`}>account_circle</span>
                  )}
                  <span className="hidden sm:inline font-bold text-xs">
                    {user ? user.email?.split('@')[0] : 'Account'}
                  </span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </button>

                {/* Stylized Account Dropdown Menu */}
                {isAccountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2.5 w-60 rounded-2xl bg-white shadow-2xl border border-stone-200/90 py-3 z-[150] text-stone-800 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 pb-2.5 mb-2 border-b border-stone-100">
                      <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Account Portal</p>
                      <p className="text-xs font-bold text-stone-900 truncate mt-0.5">
                        {user ? user.email : 'Guest Client'}
                      </p>
                    </div>

                    <div className="space-y-1 px-2">
                      <Link
                        href="/track-order"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-emerald-950/5 hover:text-emerald-900 transition-colors text-xs font-bold"
                      >
                        <span className="material-symbols-outlined text-emerald-800 text-lg">local_shipping</span>
                        <span>Track your order</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setIsAccountMenuOpen(false);
                          setIsPlantDoctorOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-stone-700 hover:bg-emerald-950/5 hover:text-emerald-900 transition-colors text-xs font-bold cursor-pointer text-left"
                      >
                        <span className="material-symbols-outlined text-emerald-800 text-lg">support_agent</span>
                        <span>Plant Doctor</span>
                      </button>
                    </div>

                    <div className="mt-2 pt-2 border-t border-stone-100 px-2">
                      {user ? (
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors text-xs font-bold cursor-pointer text-left"
                        >
                          <span className="material-symbols-outlined text-lg">logout</span>
                          <span>Sign Out</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            setIsAuthOpen(true);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-emerald-900 hover:bg-emerald-50 transition-colors text-xs font-bold cursor-pointer text-left"
                        >
                          <span className="material-symbols-outlined text-lg">login</span>
                          <span>Sign In / Register</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
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
          <nav 
            ref={navRef}
            aria-label="Store departments" 
            className={`relative hidden lg:flex items-center justify-center gap-16 md:gap-24 lg:gap-28 py-3 text-[11px] md:text-xs tracking-[0.2em] uppercase transition-colors duration-300 ${
              isLightHeader 
                ? 'border-t border-stone-200/80' 
                : `border-t border-white/10 ${glowEffect}`
            }`}
          >
            {/* Smooth Sliding Underline Indicator */}
            <span
              className={`absolute bottom-0 h-[2.5px] rounded-full transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none ${
                isLightHeader ? 'bg-[#182d21]' : 'bg-white'
              }`}
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
                transform: 'translateZ(0)',
              }}
            />

            {navLinks.map((link) => {
              const isActive = link.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(link.href);
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  data-active={isActive}
                  className={`relative py-1 transition-all duration-300 ${
                    isActive 
                      ? (isLightHeader ? 'text-[#182d21] font-bold' : 'text-white font-bold') 
                      : (isLightHeader ? 'text-stone-700 hover:text-[#182d21] font-medium' : 'text-stone-300 hover:text-white font-medium')
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      
      {/* Mobile Drawer Menu */}
      <div className={`fixed inset-0 z-[120] bg-surface/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-surface-container-lowest z-[130] shadow-2xl transition-transform duration-300 transform lg:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-surface-container">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center p-0.5 border border-stone-200 overflow-hidden shadow-xs">
              <img src="/logo_emblem.jpg" alt="Plantinum Logo" className="w-full h-full object-cover rounded-md" />
            </div>
            <span className="font-serif text-lg font-bold tracking-wider text-[#182d21]">PLANTINUM</span>
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
            <Link href="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 font-semibold">
              <span className="material-symbols-outlined">local_shipping</span> Track Order
            </Link>
            <button type="button" onClick={() => {setIsMobileMenuOpen(false); setIsPlantDoctorOpen(true);}} className="w-full text-left px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors flex items-center gap-3 cursor-pointer font-semibold">
              <span className="material-symbols-outlined">support_agent</span> Plant Doctor
            </button>
          </div>
        </div>
      </div>
      
      {/* Render Modals */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <LocationModal isOpen={isLocationOpen} onClose={() => setIsLocationOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WishlistDrawer isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
      <PlantDoctorModal isOpen={isPlantDoctorOpen} onClose={() => setIsPlantDoctorOpen(false)} />

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
      <div className="md:hidden fixed bottom-0 inset-x-0 z-[95] bg-surface-container-lowest/95 backdrop-blur-md shadow-[0_-8px_20px_-4px_rgba(11,43,38,0.15)] border-t border-stone-200/80">
        <div ref={shopDropdownRef} className="relative">
          {/* Shop Dropdown Popup with smooth transition */}
          {isShopDropdownOpen && (
            <div className="absolute bottom-16 left-[37.5%] -translate-x-1/2 mb-2 w-56 bg-white border border-stone-200/90 shadow-2xl rounded-2xl p-2.5 z-50 flex flex-col gap-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
              <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 border-b border-stone-100 flex items-center justify-between">
                <span>Shop Categories</span>
                <span className="material-symbols-outlined text-xs">keyboard_arrow_down</span>
              </div>
              <Link 
                href="/shop/indoor-plants" 
                onClick={() => setIsShopDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg text-emerald-800">potted_plant</span>
                <span>Indoor plants</span>
              </Link>
              <Link 
                href="/shop/care-and-soil" 
                onClick={() => setIsShopDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg text-emerald-800">compost</span>
                <span>Plant Care and Soil</span>
              </Link>
              <Link 
                href="/shop/by-space" 
                onClick={() => setIsShopDropdownOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-stone-800 hover:bg-emerald-50 hover:text-emerald-900 rounded-xl transition-all"
              >
                <span className="material-symbols-outlined text-lg text-emerald-800">space_dashboard</span>
                <span>Shop by Space</span>
              </Link>
            </div>
          )}

          <div className="grid grid-cols-4 h-16 items-center w-full px-2 text-center">
            <Link href="/" onClick={() => setIsShopDropdownOpen(false)} className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-emerald-800 w-full py-1">
              <span className="material-symbols-outlined text-2xl">home</span>
              <span className="font-label-sm text-[10px] font-bold">Home</span>
            </Link>
            
            <button 
              type="button" 
              onClick={() => setIsShopDropdownOpen(!isShopDropdownOpen)} 
              className={`flex flex-col items-center justify-center gap-0.5 w-full py-1 transition-colors cursor-pointer ${
                isShopDropdownOpen ? 'text-emerald-900 font-extrabold' : 'text-stone-600 hover:text-emerald-800'
              }`}
            >
              <span className="material-symbols-outlined text-2xl">potted_plant</span>
              <span className="font-label-sm text-[10px] font-bold flex items-center justify-center gap-0.5">
                <span>Shop</span>
                <span className="material-symbols-outlined text-[12px]">{isShopDropdownOpen ? 'expand_less' : 'expand_more'}</span>
              </span>
            </button>
            
            <button type="button" onClick={() => { setIsShopDropdownOpen(false); setIsWishlistOpen(true); }} className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-emerald-800 relative cursor-pointer w-full py-1">
              <span className="material-symbols-outlined text-2xl">favorite</span>
              {wishlistCount > 0 && <span className="absolute top-1 right-[22%] w-4 h-4 bg-tertiary-container text-on-tertiary font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">{wishlistCount}</span>}
              <span className="font-label-sm text-[10px] font-bold">Wishlist</span>
            </button>
            
            <button type="button" onClick={() => { setIsShopDropdownOpen(false); setIsCartOpen(true); }} className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-emerald-800 relative cursor-pointer w-full py-1">
              <span className="material-symbols-outlined text-2xl">shopping_bag</span>
              {cartCount > 0 && <span className="absolute top-1 right-[22%] w-4 h-4 bg-primary text-on-primary font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">{cartCount}</span>}
              <span className="font-label-sm text-[10px] font-bold">Cart</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
