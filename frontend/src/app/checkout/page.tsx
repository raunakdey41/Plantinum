"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore, LiveOrder } from '@/context/StoreContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, createRealOrder, user } = useStore();
  
  const [step, setStep] = useState<'details' | 'review' | 'submitted'>('details');

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Placed Order State
  const [createdOrder, setCreatedOrder] = useState<LiveOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const subtotal = cart.reduce((sum, item) => {
    const numPrice = Number(item.price.replace(/[^0-9]/g, ''));
    return sum + (numPrice * item.quantity);
  }, 0);

  const shippingCost = subtotal > 999 ? 0 : 99;
  const grandTotal = subtotal + shippingCost;
  const lockedEmail = user?.email || 'client@plantinum.in';

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!fullName.trim() || !phone.trim() || !address.trim() || !pinCode.trim()) {
      setErrorMessage("Please fill in all mandatory delivery details.");
      return;
    }
    if (pinCode.trim().length !== 6 || isNaN(Number(pinCode.trim()))) {
      setErrorMessage("Please enter a valid 6-digit Indian Pincode.");
      return;
    }
    setStep('review');
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true);
    setErrorMessage('');
    try {
      const order = await createRealOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: lockedEmail,
        address: address.trim(),
        pinCode: pinCode.trim(),
      });

      if (order) {
        setCreatedOrder(order);
        setStep('submitted');
      }
    } catch (err: any) {
      console.error("Failed to place order:", err);
      setErrorMessage("Something went wrong while placing your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-headline-lg text-primary text-3xl md:text-4xl font-bold">
            {step === 'details' && 'Shipping & Personal Details'}
            {step === 'review' && 'Final Order Review'}
            {step === 'submitted' && 'Order Submitted Successfully! 🎉'}
          </h1>
          <p className="text-on-surface-variant font-body-md mt-1">
            {step === 'details' && 'Provide your delivery location details to proceed'}
            {step === 'review' && 'Please verify all details before clicking Place Order'}
            {step === 'submitted' && 'Your order is sent to admin for approval. You will receive a GPay QR code in chat!'}
          </p>
        </div>

        {cart.length === 0 && step !== 'submitted' ? (
          <div className="p-12 text-center bg-surface-container-lowest rounded-3xl border border-stone-200 flex flex-col items-center gap-4 shadow-sm">
            <span className="material-symbols-outlined text-6xl text-outline">shopping_basket</span>
            <h2 className="text-xl font-bold text-primary">Your cart is currently empty</h2>
            <Link href="/shop/indoor-plants" className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-bold shadow-md hover:bg-emerald-950 transition-all">
              Browse Botanicals
            </Link>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-3xl border border-stone-200 p-6 md:p-8 shadow-sm">
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 text-red-800 font-bold text-xs sm:text-sm rounded-xl border border-red-200 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-600 text-lg">error</span>
                <span>{errorMessage}</span>
              </div>
            )}
            
            {/* STEP 1: DETAILS */}
            {step === 'details' && (
              <form onSubmit={handleProceedToReview} className="flex flex-col gap-6">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cart Selection</p>
                    <p className="font-bold text-primary text-lg mt-0.5">{cart.length} item(s) selected</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-on-surface-variant">Estimated Payable</p>
                    <p className="font-headline-sm font-bold text-primary text-2xl">₹{grandTotal.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-surface-container-low border border-stone-200 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Phone Number (For Delivery Sync) *</label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-surface-container-low border border-stone-200 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm"
                    />
                  </div>
                </div>

                {/* PRESET LOCKED EMAIL FIELD */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-emerald-800">lock</span>
                      <span>Account Email (Preset &amp; Unchangeable)</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Verified Account</span>
                  </div>
                  <input 
                    type="email" 
                    disabled 
                    readOnly
                    value={lockedEmail}
                    className="px-4 py-3 rounded-xl bg-stone-100 border border-stone-300 text-stone-700 font-bold text-sm cursor-not-allowed select-none opacity-90 shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Delivery Address *</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Street, Flat/House No., Landmark..."
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-surface-container-low border border-stone-200 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Pincode *</label>
                    <input 
                      type="text" 
                      required
                      maxLength={6}
                      placeholder="700001"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-surface-container-low border border-stone-200 focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary text-on-surface font-medium text-sm"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit"
                    className="px-8 py-4 rounded-xl bg-primary text-on-primary font-bold text-base hover:bg-emerald-950 transition-all shadow-md cursor-pointer flex items-center gap-2"
                  >
                    <span>Proceed to Final Review</span>
                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: FINAL ORDER REVIEW BEFORE PLACE ORDER */}
            {step === 'review' && (
              <div className="flex flex-col gap-6 animate-in fade-in duration-200">
                <div className="bg-emerald-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">Final Verification</span>
                    <h3 className="font-bold text-lg text-white">Review Your Personal &amp; Order Details</h3>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep('details')}
                    className="text-xs font-bold underline hover:text-emerald-200 text-stone-200 self-start sm:self-auto cursor-pointer"
                  >
                    Edit Details
                  </button>
                </div>

                {/* Personal & Shipping Details Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-xs">
                  <div>
                    <p className="font-bold text-stone-400 uppercase tracking-wider mb-1">Customer Info</p>
                    <p className="font-bold text-stone-900 text-sm">{fullName}</p>
                    <p className="text-stone-600 font-medium">{phone}</p>
                    <p className="text-stone-600 font-medium flex items-center gap-1 mt-0.5">
                      <span className="material-symbols-outlined text-xs text-emerald-800">lock</span>
                      <span>{lockedEmail}</span>
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-stone-400 uppercase tracking-wider mb-1">Delivery Destination</p>
                    <p className="font-bold text-stone-900 leading-relaxed">{address}</p>
                    <p className="text-stone-700 font-bold mt-1">Pincode: {pinCode}</p>
                  </div>
                </div>

                {/* Itemized Order List */}
                <div className="border border-stone-200 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 bg-stone-100 text-stone-800 font-bold text-xs uppercase tracking-wider border-b border-stone-200">
                    Selected Botanicals ({cart.length})
                  </div>
                  <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4 bg-white">
                        <img src={item.image || '/logo_emblem.jpg'} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-stone-100 shrink-0 border border-stone-200" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-sm truncate">{item.name}</h4>
                          {item.botanicalName && <p className="text-xs text-stone-500 italic truncate">{item.botanicalName}</p>}
                          {item.potColor && <p className="text-[11px] text-emerald-800 font-semibold mt-0.5">Pot: {item.potColor}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-stone-900 text-sm">Qty: {item.quantity}</p>
                          <p className="font-bold text-emerald-800 text-sm">{item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-sm font-bold">
                    <span>Subtotal + Express Transit ({shippingCost === 0 ? 'FREE' : `₹${shippingCost}`})</span>
                    <span className="text-lg text-emerald-950">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Final Action Button: PLACE ORDER */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setStep('details')}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    Back to Form
                  </button>

                  <button 
                    type="button"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="w-full sm:w-auto px-10 py-4 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-lg shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-2xl">check_circle</span>
                    <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SUBMITTED SUCCESS & LIVE CHAT INSTRUCTION */}
            {step === 'submitted' && createdOrder && (
              <div className="flex flex-col items-center text-center gap-6 py-4 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-inner">
                  <span className="material-symbols-outlined text-5xl font-bold">task_alt</span>
                </div>

                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Order Submitted to Admin Queue
                  </span>
                  <h2 className="font-headline-md text-stone-900 text-2xl md:text-3xl font-bold mt-2">
                    Order #{createdOrder.id} Placed!
                  </h2>
                  <p className="text-stone-600 font-medium text-sm mt-2 max-w-lg mx-auto leading-relaxed">
                    Our Master Botanists are reviewing your order. Once approved, a custom **GPay UPI QR Code** will be sent to your live chat window for payment!
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2 w-full max-w-md">
                  <Link 
                    href={`/track-order?orderId=${createdOrder.id}`} 
                    className="w-full py-4 rounded-xl bg-emerald-950 text-white font-bold text-sm hover:bg-black transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-xl">forum</span>
                    <span>Open Live Order Chat &amp; Status</span>
                  </Link>

                  <Link 
                    href="/shop/indoor-plants" 
                    className="w-full py-4 rounded-xl border border-stone-300 text-stone-800 font-bold text-sm hover:bg-stone-100 transition-colors"
                  >
                    Continue Shopping
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
