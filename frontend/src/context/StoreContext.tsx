"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type CartItem = {
  id: string;
  name: string;
  price: string; // Storing as string for simplicity since we format it as ₹XXX
  quantity: number;
};

type StoreContextType = {
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  cartCount: number;
  
  wishlist: string[]; // Store product IDs
  toggleWishlist: (id: string) => void;
  wishlistCount: number;
  
  user: User | null;
  setUser: (user: User | null) => void;
  
  deliveryLocation: string;
  setDeliveryLocation: (location: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState('Kolkata 700001');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Hydrate from localStorage on client mount
  useEffect(() => {
    const savedCart = localStorage.getItem('plantinum_cart');
    const savedWishlist = localStorage.getItem('plantinum_wishlist');
    const savedLocation = localStorage.getItem('plantinum_location');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedLocation) setDeliveryLocation(savedLocation);
  }, []);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('plantinum_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('plantinum_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('plantinum_location', deliveryLocation);
  }, [deliveryLocation]);

  const addToCart = (item: { id: string; name: string; price: string }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => i.id === id ? { ...i, quantity } : i));
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, cartCount,
      wishlist, toggleWishlist, wishlistCount,
      user, setUser,
      deliveryLocation, setDeliveryLocation
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
