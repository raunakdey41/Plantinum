"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';

interface GPayCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GPayCheckoutModal({ isOpen, onClose }: GPayCheckoutModalProps) {
  const { cart, clearCart, setDeliveryLocation, deliveryLocation: currentLoc } = useStore();
  
  // Steps: 'details' | 'payment' | 'success'
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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant w-full max-w-xl overflow-hidden flex flex-col max-h-[92vh] relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-outline-variant bg-surface-container-low shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">local_florist</span>
            <div>
              <h3 className="font-headline-sm font-bold text-primary text-lg">
                {step === 'details' && 'Step 1: Delivery Details'}
                {step === 'payment' && 'Step 2: Pay via GPay QR Code'}
                {step === 'success' && 'Order Confirmed! 🎉'}
              </h3>
              <p className="text-[11px] text-on-surface-variant font-bold">
                {step === 'details' && 'Enter your shipping address below'}
                {step === 'payment' && 'Scan GPay QR code to complete payment'}
                {step === 'success' && 'Thank you for shopping with Plantinum'}
              </p>
            </div>
          </div>

          {step !== 'success' && (
            <button onClick={onClose} className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error/10 transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">

          {/* STEP 1: DELIVERY DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="flex flex-col gap-4">
              <div className="bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Order Summary</p>
                  <p className="font-bold text-primary text-sm mt-0.5">{cart.length} item(s) in cart</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-on-surface-variant">Total Amount</p>
                  <p className="font-headline-sm font-bold text-primary text-lg">₹{grandTotal.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Raunak Dey"
                  className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">PIN Code *</label>
                  <input 
                    type="text" 
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="e.g. 700001"
                    className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Shipping Address *</label>
                <textarea 
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat/House No, Building, Street, Area, City..."
                  className="px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm resize-none"
                />
              </div>

              <div className="pt-4 border-t border-outline-variant flex justify-end gap-3">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl font-bold text-on-surface-variant hover:bg-surface-container text-sm">
                  Cancel
                </button>
                <button type="submit" className="px-8 py-2.5 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary transition-colors text-sm shadow-md flex items-center gap-2">
                  <span>Continue to GPay Payment</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: GPAY QR CODE PAYMENT */}
          {step === 'payment' && (
            <div className="flex flex-col items-center gap-5 text-center">
              
              {/* Payment Info Badge */}
              <div className="w-full bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between text-left">
                <div>
                  <p className="text-[11px] font-bold uppercase text-emerald-900">Total Payable Amount</p>
                  <p className="text-2xl font-bold text-emerald-950">₹{grandTotal.toLocaleString('en-IN')}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold shadow-sm">
                  <span>Google Pay / UPI</span>
                </div>
              </div>

              {/* QR Code Container */}
              <div className="p-4 bg-white rounded-2xl border-2 border-primary/20 shadow-md flex flex-col items-center relative group">
                <img 
                  src={qrCodeImageUrl} 
                  alt="GPay UPI QR Code" 
                  className="w-56 h-56 object-contain rounded-lg"
                />
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  <span className="material-symbols-outlined text-sm text-primary">qr_code_scanner</span>
                  <span>Scan with GPay / PhonePe / Paytm</span>
                </div>
              </div>

              {/* UPI ID Copy Card */}
              <div className="w-full bg-surface-container-low p-3 rounded-xl border border-outline-variant flex items-center justify-between">
                <div className="text-left">
                  <p className="text-[10px] font-bold uppercase text-on-surface-variant">Merchant UPI ID</p>
                  <p className="font-mono font-bold text-primary text-sm">{upiId}</p>
                </div>
                <button 
                  type="button" 
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 bg-surface-container-lowest hover:bg-surface-container border border-outline-variant rounded-lg text-xs font-bold text-primary transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">{copiedUpi ? 'check' : 'content_copy'}</span>
                  <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
                </button>
              </div>

              {/* UTR / Transaction ID Input Field */}
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
                  className="px-4 py-2.5 rounded-xl border border-primary/40 bg-surface-container-lowest text-on-surface focus:ring-2 focus:ring-primary outline-none font-mono text-sm tracking-widest text-center"
                />
                <p className="text-[11px] text-on-surface-variant">
                  Open your Google Pay app payment history to copy the 12-digit UTR / Ref Number.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full flex items-center justify-between pt-3 border-t border-outline-variant gap-3">
                <button 
                  type="button" 
                  onClick={() => setStep('details')}
                  className="px-4 py-2.5 rounded-xl border border-outline-variant font-bold text-on-surface-variant text-xs hover:bg-surface-container"
                >
                  ← Back
                </button>
                <button 
                  type="button" 
                  onClick={handleCompleteOrder}
                  disabled={submitting || !utrNumber.trim()}
                  className="flex-1 py-3 px-6 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary transition-colors text-sm shadow-md disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{submitting ? 'Verifying...' : 'Verify & Place Order'}</span>
                  <span className="material-symbols-outlined text-lg">check_circle</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ORDER SUCCESS */}
          {step === 'success' && placedOrder && (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center shadow-inner animate-bounce">
                <span className="material-symbols-outlined text-4xl font-bold">task_alt</span>
              </div>

              <div>
                <h3 className="font-headline-sm font-bold text-primary text-2xl">Payment Received & Order Placed!</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Your order <strong className="text-primary font-mono">{placedOrder.id}</strong> has been successfully registered.
                </p>
              </div>

              <div className="w-full bg-surface-container-low p-4 rounded-2xl border border-outline-variant flex flex-col gap-2 text-left text-xs">
                <div className="flex justify-between border-b border-outline-variant pb-2">
                  <span className="text-on-surface-variant">Order ID:</span>
                  <span className="font-bold text-primary font-mono">{placedOrder.id}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant pb-2">
                  <span className="text-on-surface-variant">Payment Method:</span>
                  <span className="font-bold text-on-surface">Google Pay UPI</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant pb-2">
                  <span className="text-on-surface-variant">UTR Reference:</span>
                  <span className="font-bold font-mono text-on-surface">{placedOrder.utrNumber}</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant pb-2">
                  <span className="text-on-surface-variant">Total Paid:</span>
                  <span className="font-bold text-primary">₹{placedOrder.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Delivery To:</span>
                  <span className="font-bold text-on-surface truncate max-w-[200px]">{placedOrder.deliveryLocation}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full pt-3 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl border border-outline-variant font-bold text-on-surface hover:bg-surface-container text-xs"
                >
                  Close
                </button>
                <Link
                  href="/track-order"
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-on-primary hover:bg-secondary text-center text-xs transition-colors shadow-md flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">radar</span>
                  <span>Track Live Order</span>
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
