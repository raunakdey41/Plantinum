"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export type CartItem = {
  id: string;
  name: string;
  price: string;
  quantity: number;
  image?: string;
  botanicalName?: string;
  potColor?: string;
};

export type OrderStatus = 
  | 'pending_approval' 
  | 'payment_requested' 
  | 'payment_submitted' 
  | 'processing' 
  | 'dispatched' 
  | 'delivered' 
  | 'cancelled';

export type CustomerDetails = {
  fullName: string;
  phone: string;
  email: string; // Locked unchangeable
  address: string;
  pinCode: string;
};

export type PaymentDetails = {
  method: string;
  utrNumber?: string;
  upiId?: string;
  qrCodeUrl?: string;
  status: 'unpaid' | 'verifying' | 'paid';
};

export type LiveOrder = {
  id: string;
  createdAt: string;
  updatedAt?: string;
  customerDetails: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  grandTotal: number;
  status: OrderStatus;
  paymentDetails: PaymentDetails;
  trackingNumber?: string;
  courier?: string;
};

export type PresetMessageRule = {
  id: string;
  condition: 'on_order_placed' | 'on_order_approved' | 'on_payment_received' | 'on_dispatched' | 'on_delivered';
  title: string;
  messageTemplate: string;
};

export type ChatMessage = {
  id: string;
  orderId: string;
  sender: 'user' | 'admin' | 'system';
  senderName?: string;
  text: string;
  type?: 'text' | 'qr_payment_request' | 'utr_submission' | 'status_update';
  paymentPayload?: {
    upiId: string;
    amount: number;
    qrCodeUrl: string;
  };
  timestamp: string;
};

type StoreContextType = {
  cart: CartItem[];
  addToCart: (item: { id: string; name: string; price: string; image?: string; botanicalName?: string; potColor?: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  wishlistCount: number;
  
  liveOrders: LiveOrder[];
  createRealOrder: (details: CustomerDetails) => Promise<LiveOrder | null>;
  updateOrderStatus: (orderId: string, status: OrderStatus, extraPayload?: Partial<LiveOrder>) => Promise<void>;
  submitUtr: (orderId: string, utrNumber: string) => Promise<void>;
  
  presetRules: PresetMessageRule[];
  updatePresetRules: (rules: PresetMessageRule[]) => void;
  
  user: User | null;
  setUser: (user: User | null) => void;
  
  deliveryLocation: string;
  setDeliveryLocation: (location: string) => void;
};

const DEFAULT_PRESET_RULES: PresetMessageRule[] = [
  {
    id: 'r1',
    condition: 'on_order_placed',
    title: 'Order Received Confirmation',
    messageTemplate: 'Hello {fullName}, your order #{orderId} has been placed and sent to our Master Botanists for review!'
  },
  {
    id: 'r2',
    condition: 'on_order_approved',
    title: 'Order Approved & GPay QR Request',
    messageTemplate: 'Great news {fullName}! Your order #{orderId} is approved. Please scan the GPay QR code below to complete your payment of ₹{grandTotal}.'
  },
  {
    id: 'r3',
    condition: 'on_payment_received',
    title: 'Payment Verified & Processing',
    messageTemplate: 'Payment verified! Your UTR {utrNumber} has been checked. We are now carefully packaging your specimens.'
  },
  {
    id: 'r4',
    condition: 'on_dispatched',
    title: 'Dispatched Notification',
    messageTemplate: 'Your plant shipment is on its way via Express transit! Tracking #: {trackingNumber}.'
  },
  {
    id: 'r5',
    condition: 'on_delivered',
    title: 'Delivered Confirmation',
    messageTemplate: 'Your order #{orderId} has been successfully delivered! Enjoy your lush new botanicals 🌿'
  }
];

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [liveOrders, setLiveOrders] = useState<LiveOrder[]>([]);
  const [presetRules, setPresetRules] = useState<PresetMessageRule[]>(DEFAULT_PRESET_RULES);
  const [user, setUser] = useState<User | null>(null);
  const [deliveryLocation, setDeliveryLocation] = useState('Kolkata 700001');

  // Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Hydrate from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('plantinum_cart');
    const savedWishlist = localStorage.getItem('plantinum_wishlist');
    const savedLocation = localStorage.getItem('plantinum_location');
    const savedRules = localStorage.getItem('plantinum_preset_rules');
    
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedLocation) setDeliveryLocation(savedLocation);
    if (savedRules) setPresetRules(JSON.parse(savedRules));
  }, []);

  // Real-time Firestore Live Orders Listener
  useEffect(() => {
    try {
      const ordersRef = collection(db, 'orders');
      const unsubscribe = onSnapshot(ordersRef, (snapshot) => {
        const fetchedOrders: LiveOrder[] = snapshot.docs.map((doc) => doc.data() as LiveOrder);
        const map = new Map<string, LiveOrder>();
        fetchedOrders.forEach(o => map.set(o.id, o));
        const uniqueOrders = Array.from(map.values());
        uniqueOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLiveOrders(uniqueOrders);
        localStorage.setItem('plantinum_live_orders', JSON.stringify(uniqueOrders));
      }, (err) => {
        console.warn("Firestore live orders snapshot fallback to localStorage:", err);
        const fallback = localStorage.getItem('plantinum_live_orders');
        if (fallback) setLiveOrders(JSON.parse(fallback));
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firestore orders subscription error:", e);
    }
  }, []);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('plantinum_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('plantinum_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('plantinum_preset_rules', JSON.stringify(presetRules));
  }, [presetRules]);

  useEffect(() => {
    localStorage.setItem('plantinum_location', deliveryLocation);
  }, [deliveryLocation]);

  const addToCart = (item: { id: string; name: string; price: string; image?: string; botanicalName?: string; potColor?: string }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.potColor === item.potColor);
      if (existing) {
        return prev.map((i) => (i.id === item.id && i.potColor === item.potColor) ? { ...i, quantity: i.quantity + 1 } : i);
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

  // Helper to send message in chat
  const sendSystemChatMessage = async (orderId: string, text: string, type: ChatMessage['type'] = 'text', paymentPayload?: ChatMessage['paymentPayload']) => {
    const msgId = Date.now().toString();
    const chatMsg: ChatMessage = {
      id: msgId,
      orderId,
      sender: 'admin',
      senderName: 'Plantinum Headquarters',
      text,
      type,
      paymentPayload,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const chatDocRef = doc(db, 'chats', `${orderId}_${msgId}`);
      await setDoc(chatDocRef, chatMsg);
    } catch (e) {
      // Fallback in local storage
      const savedChats = JSON.parse(localStorage.getItem(`chat_${orderId}`) || '[]');
      localStorage.setItem(`chat_${orderId}`, JSON.stringify([...savedChats, chatMsg]));
    }
  };

  // Create Real Live Order in Firestore
  const createRealOrder = async (customerDetails: CustomerDetails): Promise<LiveOrder | null> => {
    if (cart.length === 0) return null;

    const subtotal = cart.reduce((sum, item) => sum + (Number(item.price.replace(/[^0-9]/g, '')) * item.quantity), 0);
    const shippingFee = subtotal > 999 ? 0 : 99;
    const grandTotal = subtotal + shippingFee;
    const orderId = `PLN-${Math.floor(10000 + Math.random() * 90000)}`;

    const newOrder: LiveOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      customerDetails,
      items: [...cart],
      subtotal,
      shippingFee,
      grandTotal,
      status: 'pending_approval',
      paymentDetails: {
        method: 'GPay UPI QR Code',
        status: 'unpaid'
      },
      trackingNumber: `PLN-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      courier: 'Plantinum Direct Air Express'
    };

    try {
      await setDoc(doc(db, 'orders', orderId), newOrder);
    } catch (err) {
      console.warn("Firestore save order fallback to local storage:", err);
      const existingLocal = JSON.parse(localStorage.getItem('plantinum_live_orders') || '[]');
      localStorage.setItem('plantinum_live_orders', JSON.stringify([newOrder, ...existingLocal]));
    }

    setLiveOrders(prev => {
      const map = new Map<string, LiveOrder>();
      map.set(newOrder.id, newOrder);
      prev.forEach(o => map.set(o.id, o));
      return Array.from(map.values());
    });

    // Send initial automated confirmation chat message
    const rule = presetRules.find(r => r.condition === 'on_order_placed');
    const msgText = rule 
      ? rule.messageTemplate.replace('{fullName}', customerDetails.fullName).replace('{orderId}', orderId)
      : `Hello ${customerDetails.fullName}, your order #${orderId} has been received and is under review by our Master Botanists!`;
    
    await sendSystemChatMessage(orderId, msgText, 'status_update');

    clearCart();
    return newOrder;
  };

  // Automatically decrement inventory when status changes to 'delivered'
  const autoDecrementInventoryOnDelivery = async (items: CartItem[]) => {
    try {
      const savedProducts = JSON.parse(localStorage.getItem('plantinum_admin_products') || '[]');
      let updated = false;

      const newProducts = savedProducts.map((p: any) => {
        const itemInOrder = items.find(i => i.id === p.id);
        if (itemInOrder) {
          updated = true;
          const currentStock = p.stock !== undefined ? p.stock : 10;
          const newStock = Math.max(0, currentStock - itemInOrder.quantity);
          return {
            ...p,
            stock: newStock,
            inStock: newStock > 0
          };
        }
        return p;
      });

      if (updated) {
        localStorage.setItem('plantinum_admin_products', JSON.stringify(newProducts));
      }
    } catch (err) {
      console.error("Failed to auto-decrement inventory:", err);
    }
  };

  // Admin Updates Order Status
  const updateOrderStatus = async (orderId: string, status: OrderStatus, extraPayload?: Partial<LiveOrder>) => {
    const targetOrder = liveOrders.find(o => o.id === orderId);
    const updatedFields: Partial<LiveOrder> = {
      status,
      updatedAt: new Date().toISOString(),
      ...extraPayload
    };

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, updatedFields);
    } catch (e) {
      console.warn("Firestore updateDoc fallback:", e);
    }

    setLiveOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updatedFields } : o));

    // Handle Admin Action Chat Triggers
    if (targetOrder) {
      if (status === 'payment_requested') {
        const rule = presetRules.find(r => r.condition === 'on_order_approved');
        const text = rule 
          ? rule.messageTemplate.replace('{fullName}', targetOrder.customerDetails.fullName).replace('{orderId}', orderId).replace('{grandTotal}', targetOrder.grandTotal.toString())
          : `Great news ${targetOrder.customerDetails.fullName}! Your order #${orderId} is approved. Scan the GPay QR code below to complete payment of ₹${targetOrder.grandTotal}.`;

        const upiId = "plantinum@okicici";
        const upiPayUrl = `upi://pay?pa=${upiId}&pn=Plantinum%20Botanicals&am=${targetOrder.grandTotal}&cu=INR`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiPayUrl)}`;

        await sendSystemChatMessage(orderId, text, 'qr_payment_request', {
          upiId,
          amount: targetOrder.grandTotal,
          qrCodeUrl
        });
      } else if (status === 'processing') {
        const rule = presetRules.find(r => r.condition === 'on_payment_received');
        const text = rule 
          ? rule.messageTemplate.replace('{fullName}', targetOrder.customerDetails.fullName).replace('{orderId}', orderId).replace('{utrNumber}', targetOrder.paymentDetails.utrNumber || '')
          : `Payment verified! UTR ${targetOrder.paymentDetails.utrNumber || ''} approved. We are now packaging your specimens.`;

        await sendSystemChatMessage(orderId, text, 'status_update');
      } else if (status === 'dispatched') {
        const rule = presetRules.find(r => r.condition === 'on_dispatched');
        const text = rule 
          ? rule.messageTemplate.replace('{fullName}', targetOrder.customerDetails.fullName).replace('{orderId}', orderId).replace('{trackingNumber}', targetOrder.trackingNumber || '')
          : `Your order #${orderId} has been dispatched! Tracking #: ${targetOrder.trackingNumber || ''}.`;

        await sendSystemChatMessage(orderId, text, 'status_update');
      } else if (status === 'delivered') {
        const rule = presetRules.find(r => r.condition === 'on_delivered');
        const text = rule 
          ? rule.messageTemplate.replace('{fullName}', targetOrder.customerDetails.fullName).replace('{orderId}', orderId)
          : `Your order #${orderId} has been delivered! Enjoy your lush new botanicals 🌿`;

        await sendSystemChatMessage(orderId, text, 'status_update');

        // Automatically Decrement Product Stock Count on Delivery
        await autoDecrementInventoryOnDelivery(targetOrder.items);
      }
    }
  };

  // Submit UTR Number from Customer
  const submitUtr = async (orderId: string, utrNumber: string) => {
    const updatedPaymentDetails: PaymentDetails = {
      method: 'GPay UPI QR Code',
      utrNumber,
      status: 'verifying'
    };

    await updateOrderStatus(orderId, 'payment_submitted', {
      paymentDetails: updatedPaymentDetails
    });

    // Send chat message confirming UTR submission
    const msgId = Date.now().toString();
    const chatMsg: ChatMessage = {
      id: msgId,
      orderId,
      sender: 'user',
      senderName: 'Customer',
      text: `Submitted UTR Transaction ID: ${utrNumber}. Awaiting admin payment verification.`,
      type: 'utr_submission',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    try {
      const chatDocRef = doc(db, 'chats', `${orderId}_${msgId}`);
      await setDoc(chatDocRef, chatMsg);
    } catch (e) {
      const savedChats = JSON.parse(localStorage.getItem(`chat_${orderId}`) || '[]');
      localStorage.setItem(`chat_${orderId}`, JSON.stringify([...savedChats, chatMsg]));
    }
  };

  const updatePresetRules = (rules: PresetMessageRule[]) => {
    setPresetRules(rules);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = wishlist.length;

  return (
    <StoreContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount,
      wishlist, toggleWishlist, wishlistCount,
      liveOrders, createRealOrder, updateOrderStatus, submitUtr,
      presetRules, updatePresetRules,
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
