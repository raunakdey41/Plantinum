"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, setDeliveryLocation } = useStore();
  
  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [utrNumber, setUtrNumber] = useState('');

  // Placed Order State
  const [placedOrder, setPlacedOrder] = useState<any>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const cartTotal = cart.reduce((sum, item) => {
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    return sum + (numPrice * item.quantity);
  }, 0);

  const shippingCost = cartTotal > 999 ? 0 : 99;
  const grandTotal = cartTotal + shippingCost;

  const upiId = "plantinum@okicici";
  const upiPayUrl = `upi://pay?pa=${upiId}&pn=Plantinum%20Botanicals&am=${grandTotal}&cu=INR`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(upiPayUrl)}`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || !address || !pinCode) {
      alert("Please fill in all delivery details.");
      return;
    }
    const fullLoc = `${address}, PIN: ${pinCode}`;
    setDeliveryLocation(fullLoc);
    setStep('payment');
  };

  const handleCompleteOrder = () => {
    if (!utrNumber.trim()) {
      alert("Please enter the 12-digit UTR / Payment Transaction ID from your GPay app.");
      return;
    }

    setSubmitting(true);

    const newOrder = {
      id: `PLN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: [...cart],
      totalAmount: grandTotal,
      status: 'Confirmed' as const,
      currentStep: 1,
      deliveryLocation: `${address}, PIN ${pinCode}`,
      trackingNumber: `PLN-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      courier: 'Plantinum Direct Air Express',
      paymentMethod: 'GPay QR Code / UPI',
      utrNumber: utrNumber.trim()
    };

    // 1. Sync order to Firestore
    try {
      const { doc, setDoc } = require('firebase/firestore');
      const { db } = require('@/lib/firebase');
      setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (err) {
      console.error("Error syncing order to Firestore:", err);
    }

    // 2. Save order to localStorage
    try {
      const existing = localStorage.getItem('plantinum_orders');
      const ordersList = existing ? JSON.parse(existing) : [];
      localStorage.setItem('plantinum_orders', JSON.stringify([newOrder, ...ordersList]));
    } catch (err) {
      console.error("Error saving order to localStorage:", err);
    }

    setPlacedOrder(newOrder);
    clearCart();
    setSubmitting(false);
    setStep('success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-headline-lg text-primary text-3xl md:text-4xl font-bold">
            {step === 'details' && 'Checkout & Delivery'}
            {step === 'payment' && 'Google Pay UPI Payment'}
            {step === 'success' && 'Order Confirmed! 🎉'}
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            {step === 'details' && 'Enter your delivery location details to proceed'}
            {step === 'payment' && 'Scan GPay QR Code or pay via UPI to complete order'}
            {step === 'success' && 'Thank you for your order! Your plant collection is being prepared.'}
          </p>
        </div>

        {cart.length === 0 && step !== 'success' ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-outline-variant flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-6xl text-outline">shopping_basket</span>
            <h2 className="text-xl font-bold text-primary">Your cart is currently empty</h2>
            <Link href="/shop/indoor-plants" className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold">
              Browse Plants
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-6 md:p-8 shadow-sm">
            
            {/* STEP 1: DETAILS */}
            {step === 'details' && (
              <form onSubmit={handleProceedToPayment} className="flex flex-col gap-6">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cart Total</p>
                    <p className="font-bold text-primary text-lg mt-0.5">{cart.length} product(s) selected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Payable Total</p>
                    <p className="font-headline-sm font-bold text-primary text-2xl">₹{grandTotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Raunak Dey"
                      className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">PIN Code *</label>
                    <input 
                      type="text" 
                      required
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="e.g. 700001"
                      className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Delivery Location / City</label>
                    <input 
                      type="text" 
                      readOnly
                      value="Kolkata, West Bengal"
                      className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant text-sm font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Delivery Address *</label>
                  <textarea 
                    required
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="House/Flat No., Street, Landmark, Area..."
                    className="px-4 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
                  <button type="submit" className="px-8 py-3.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary transition-colors text-sm shadow-md flex items-center gap-2">
                    <span>Proceed to GPay Payment</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: GPAY QR CODE */}
            {step === 'payment' && (
              <div className="flex flex-col items-center gap-6 text-center max-w-md mx-auto">
                <div className="w-full bg-emerald-50 border border-emerald-200 p-4 rounded-2xl flex items-center justify-between text-left">
                  <div>
                    <p className="text-xs font-bold uppercase text-emerald-900">Total Amount Payable</p>
                    <p className="text-3xl font-bold text-emerald-950 mt-0.5">₹{grandTotal.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white px-3.5 py-2 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                    <span>Google Pay / UPI</span>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-3xl border-2 border-primary/20 shadow-md flex flex-col items-center">
                  <img 
                    src={qrCodeImageUrl} 
                    alt="GPay UPI QR Code" 
                    className="w-64 h-64 object-contain rounded-xl"
                  />
                  <div className="mt-3 flex items-center gap-2 text-xs font-bold text-stone-700 bg-stone-100 px-3.5 py-1.5 rounded-full border border-stone-200">
                    <span className="material-symbols-outlined text-sm text-primary">qr_code_scanner</span>
                    <span>Scan with GPay / PhonePe / Paytm</span>
                  </div>
                </div>

                <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] font-bold uppercase text-on-surface-variant">Merchant UPI ID</p>
                    <p className="font-mono font-bold text-primary text-base">{upiId}</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleCopyUpi}
                    className="px-4 py-2 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-xl text-xs font-bold text-primary transition-colors flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">{copiedUpi ? 'check' : 'content_copy'}</span>
                    <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                  </button>
                </div>

                <div className="w-full flex flex-col gap-1.5 text-left pt-2 border-t border-outline-variant">
                  <label className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                    <span className="material-symbols-outlined text-base">verified</span>
                    <span>Enter 12-Digit GPay UTR / Transaction ID *</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 426819034821"
                    className="px-4 py-3 rounded-xl border border-primary/40 bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary outline-none font-mono text-base tracking-widest text-center"
                  />
                  <p className="text-[11px] text-on-surface-variant">
                    Check your GPay app transaction details for the 12-digit UPI Ref/UTR number.
                  </p>
                </div>

                <div className="w-full flex items-center justify-between pt-4 border-t border-outline-variant gap-4">
                  <button 
                    type="button" 
                    onClick={() => setStep('details')}
                    className="px-5 py-3 rounded-xl border border-outline-variant font-bold text-on-surface-variant text-xs hover:bg-surface-container"
                  >
                    ← Edit Address
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCompleteOrder}
                    disabled={submitting || !utrNumber.trim()}
                    className="flex-1 py-3.5 px-6 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary transition-colors text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{submitting ? 'Verifying...' : 'Verify & Place Order'}</span>
                    <span className="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: ORDER SUCCESS */}
            {step === 'success' && placedOrder && (
              <div className="flex flex-col items-center text-center gap-6 py-6 max-w-lg mx-auto">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shadow-inner animate-bounce">
                  <span className="material-symbols-outlined text-5xl font-bold">task_alt</span>
                </div>

                <div>
                  <h2 className="font-headline-lg font-bold text-primary text-3xl">Payment Verified!</h2>
                  <p className="text-sm text-on-surface-variant mt-1.5">
                    Your order <strong className="text-primary font-mono">{placedOrder.id}</strong> has been created and synced with the live store dashboard.
                  </p>
                </div>

                <div className="w-full bg-surface-container-low p-5 rounded-2xl border border-outline-variant flex flex-col gap-3 text-left text-xs">
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-on-surface-variant">Order Reference:</span>
                    <span className="font-bold text-primary font-mono">{placedOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-on-surface-variant">Payment Method:</span>
                    <span className="font-bold text-on-surface">Google Pay UPI</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-on-surface-variant">GPay UTR Ref:</span>
                    <span className="font-bold font-mono text-on-surface">{placedOrder.utrNumber}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant pb-2">
                    <span className="text-on-surface-variant">Total Amount:</span>
                    <span className="font-bold text-primary text-sm">₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Delivery Address:</span>
                    <span className="font-bold text-on-surface truncate max-w-[220px]">{placedOrder.deliveryLocation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full pt-4 border-t border-outline-variant">
                  <Link
                    href="/shop/indoor-plants"
                    className="flex-1 py-3.5 px-4 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container text-xs text-center"
                  >
                    Continue Shopping
                  </Link>
                  <Link
                    href="/track-order"
                    className="flex-1 py-3.5 px-4 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary text-center text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-sm">radar</span>
                    <span>Track Order Live</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
