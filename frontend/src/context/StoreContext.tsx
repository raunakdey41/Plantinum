"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  botanicalName?: string;
};

export type Order = {
  id: string;
  date: string;
  items: CartItem[];
  totalAmount: number;
  status: 'Confirmed' | 'Acclimatizing' | 'Packaged' | 'In Transit' | 'Delivered';
  currentStep: number; // 1 to 5
  deliveryLocation: string;
  trackingNumber: string;
  courier: string;
};

type StoreContextType = {
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: string; image?: string; botanicalName?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  wishlistCount: number;
  
  orders: Order[];
  createOrderFromCart: () => Order | null;
  
  user: User | null;
  setUser: (user: User | null) => void;
  
  deliveryLocation: string;
  setDeliveryLocation: (location: string) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
    const savedOrders = localStorage.getItem('plantinum_orders');
    const savedLocation = localStorage.getItem('plantinum_location');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
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
    localStorage.setItem('plantinum_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('plantinum_location', deliveryLocation);
  }, [deliveryLocation]);

  const addToCart = (item: { id: string; name: string; price: string; image?: string; botanicalName?: string }) => {
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

  const clearCart = () => setCart([]);

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      return [...prev, id];
    });
  };

  const createOrderFromCart = (): Order | null => {
    if (cart.length === 0) return null;
    const total = cart.reduce((sum, item) => sum + (Number(item.price.replace(/[^0-9]/g, '')) * item.quantity), 0);
    const newOrder: Order = {
      id: `PLN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      totalAmount: total,
      status: 'In Transit',
      currentStep: 4,
      deliveryLocation,
      trackingNumber: `PLN-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      courier: 'Plantinum Direct Air Express'
    };

    // Save to Firestore orders collection
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('@/lib/firebase');
      setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (err) {
      console.error("Failed to sync order to Firestore", err);
    }

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    return newOrder;
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount,
      wishlist, toggleWishlist, wishlistCount,
      orders, createOrderFromCart,
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
