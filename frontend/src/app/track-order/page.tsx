"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useStore, LiveOrder, OrderStatus, ChatMessage } from '@/context/StoreContext';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const TIMELINE_STEPS = [
  { step: 1, title: 'Order Submitted', desc: 'Received & awaiting Atelier Admin approval' },
  { step: 2, title: 'Payment & Verification', desc: 'GPay QR payment & UTR verification' },
  { step: 3, title: 'Botanical Preparation', desc: 'Specimen selection & shockproof packaging' },
  { step: 4, title: 'Express Transit', desc: 'Handed over to direct air courier' },
  { step: 5, title: 'Delivered', desc: 'Delivered safely to your sanctuary' }
];

export default function TrackOrderPage() {
  const { liveOrders, submitUtr } = useStore();
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<LiveOrder | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Live Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputUtr, setInputUtr] = useState('');
  const [isSubmittingUtr, setIsSubmittingUtr] = useState(false);
  const [userMsgText, setUserMsgText] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Default active order to most recent live order or searched order
  const activeOrder = searchedOrder || (liveOrders.length > 0 ? liveOrders[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryStr = searchId.trim().toUpperCase();
    setHasSearched(true);
    if (!queryStr) {
      setSearchedOrder(null);
      return;
    }

    const found = liveOrders.find(o => 
      o.id.toUpperCase() === queryStr || 
      (o.trackingNumber && o.trackingNumber.toUpperCase() === queryStr)
    );
    setSearchedOrder(found || null);
  };

  // Subscribe to real-time Firestore Chat Messages for the active order
  useEffect(() => {
    if (!activeOrder?.id) {
      setChatMessages([]);
      return;
    }

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('orderId', '==', activeOrder.id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs: ChatMessage[] = snapshot.docs.map(doc => doc.data() as ChatMessage);
        msgs.sort((a, b) => {
          return (a.id > b.id ? 1 : -1);
        });
        setChatMessages(msgs);
      }, (err) => {
        console.warn("Chat snapshot fallback:", err);
        const saved = localStorage.getItem(`chat_${activeOrder.id}`);
        if (saved) setChatMessages(JSON.parse(saved));
      });
      return () => unsubscribe();
    } catch (e) {
      const saved = localStorage.getItem(`chat_${activeOrder.id}`);
      if (saved) setChatMessages(JSON.parse(saved));
    }
  }, [activeOrder?.id]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Customer submits UTR Number
  const handleUtrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUtr.trim() || !activeOrder) return;
    if (inputUtr.trim().length < 6) {
      alert("Please enter a valid 12-digit UTR / UPI Transaction Reference Number.");
      return;
    }

    setIsSubmittingUtr(true);
    try {
      await submitUtr(activeOrder.id, inputUtr.trim());
      setInputUtr('');
      alert("UTR submitted successfully! Our admin team is verifying your payment.");
    } catch (err) {
      console.error(err);
      alert("Failed to submit UTR. Please try again.");
    } finally {
      setIsSubmittingUtr(false);
    }
  };

  // Send standard customer message in chat
  const handleSendCustomerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userMsgText.trim() || !activeOrder) return;

    const msgId = Date.now().toString();
    const newMsg: ChatMessage = {
      id: msgId,
      orderId: activeOrder.id,
      sender: 'user',
      senderName: activeOrder.customerDetails?.fullName || 'Customer',
      text: userMsgText.trim(),
      type: 'text',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setUserMsgText('');

    try {
      await setDoc(doc(db, 'chats', `${activeOrder.id}_${msgId}`), newMsg);
    } catch (err) {
      const saved = JSON.parse(localStorage.getItem(`chat_${activeOrder.id}`) || '[]');
      const updated = [...saved, newMsg];
      localStorage.setItem(`chat_${activeOrder.id}`, JSON.stringify(updated));
      setChatMessages(updated);
    }
  };

  const getStepIndex = (status: OrderStatus) => {
    switch (status) {
      case 'pending_approval': return 1;
      case 'payment_requested':
      case 'payment_submitted': return 2;
      case 'processing': return 3;
      case 'dispatched': return 4;
      case 'delivered': return 5;
      default: return 1;
    }
  };

  const currentStep = activeOrder ? getStepIndex(activeOrder.status) : 1;

  return (
    <div className="bg-[#fcfbf7] min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-[#182d21] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-[0.25em] mb-2 block">
            Real-Time Live Order Hub
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Track Order & Live Atelier Chat
          </h1>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            View live order status, receive dynamic GPay payment QR codes, submit UTR reference numbers, and communicate directly with Plantinum Headquarters.
          </p>
        </div>
      </section>

      {/* Main Track Form & Results Container */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-6">
        {/* Search Card */}
        <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-7 border border-stone-200/80 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">
                search
              </span>
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Order ID (e.g. PLN-12345) or Tracking Code..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#182d21] text-stone-800 font-medium placeholder:text-stone-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#182d21] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#0f1c13] transition-colors shadow-md text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">local_shipping</span>
              Search Order
            </button>
          </form>
        </div>

        {/* Empty State: No Orders Placed Yet */}
        {liveOrders.length === 0 && !searchedOrder ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">shopping_basket</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">No Active Orders Found</h2>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              You haven't placed any live orders yet. Browse our hand-selected botanical specimens and place your order today!
            </p>
            <Link
              href="/shop/indoor-plants"
              className="inline-flex items-center gap-2 bg-[#182d21] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#0f1c13] transition-colors text-sm shadow-md"
            >
              <span className="material-symbols-outlined text-lg">potted_plant</span>
              Explore Plant Collection
            </Link>
          </div>
        ) : hasSearched && !searchedOrder ? (
          /* Search yielded no match */
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-sm">
            <span className="material-symbols-outlined text-stone-400 text-4xl mb-2">search_off</span>
            <h3 className="text-lg font-bold text-stone-800 mb-1">No order found for "{searchId}"</h3>
            <p className="text-stone-500 text-xs">Please check your Order ID or view your active orders below.</p>
          </div>
        ) : activeOrder ? (
          /* Active Order Status Details & Live Chat Interface */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Status Summary Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-serif font-bold text-stone-900">Order #{activeOrder.id}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    activeOrder.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                    activeOrder.status === 'payment_requested' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    activeOrder.status === 'payment_submitted' ? 'bg-blue-100 text-blue-900' :
                    'bg-stone-100 text-stone-800'
                  }`}>
                    {activeOrder.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  Customer: <strong>{activeOrder.customerDetails.fullName}</strong> ({activeOrder.customerDetails.email}) • Delivery: <strong>{activeOrder.customerDetails.address}, {activeOrder.customerDetails.pinCode}</strong>
                </p>
              </div>

              <div className="bg-emerald-950/5 border border-emerald-900/10 p-3.5 rounded-xl flex items-center gap-4">
                <span className="material-symbols-outlined text-emerald-800 text-3xl">payments</span>
                <div>
                  <span className="text-[11px] uppercase font-bold text-stone-500 block leading-tight">Grand Total</span>
                  <span className="text-lg font-extrabold text-emerald-900">₹{activeOrder.grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-800">route</span>
                Live Journey Progress
              </h3>

              <div className="relative">
                <div className="hidden md:block absolute top-5 left-[5%] right-[5%] h-1 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                  {TIMELINE_STEPS.map((s) => {
                    const isPassed = s.step <= currentStep;
                    const isCurrent = s.step === currentStep;
                    return (
                      <div key={s.step} className="flex md:flex-col items-start md:items-center text-left md:text-center gap-4 md:gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-all shadow-sm ${
                            isCurrent
                              ? 'bg-[#182d21] text-white ring-4 ring-emerald-700/20 scale-110'
                              : isPassed
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 text-stone-400 border border-stone-200'
                          }`}
                        >
                          {isPassed ? (
                            <span className="material-symbols-outlined text-lg">check</span>
                          ) : (
                            s.step
                          )}
                        </div>

                        <div>
                          <h4 className={`text-xs font-bold ${isPassed ? 'text-stone-900' : 'text-stone-400'}`}>
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                            {s.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Split Layout: Package Details (Left) & Real-Time Live Chat Desk (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Package Summary & Courier (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800">inventory_2</span>
                    Ordered Items ({activeOrder.items.length})
                  </h3>
                  <div className="space-y-3">
                    {activeOrder.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg bg-white border border-stone-200 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-stone-900 text-xs truncate">{item.name}</h4>
                          <p className="text-[11px] text-stone-500">Price: {item.price}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-stone-700 block">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100 text-xs space-y-1.5 text-stone-600">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-semibold text-stone-800">₹{activeOrder.subtotal}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping Fee:</span>
                      <span className="font-semibold text-stone-800">{activeOrder.shippingFee === 0 ? 'FREE' : `₹${activeOrder.shippingFee}`}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-emerald-950 pt-2 border-t border-dashed border-stone-200">
                      <span>Grand Total:</span>
                      <span>₹{activeOrder.grandTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800">local_shipping</span>
                    Logistics & Tracking
                  </h3>
                  <div className="space-y-2.5 text-xs">
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">Courier Service</span>
                      <span className="font-bold text-stone-800">{activeOrder.courier || 'Plantinum Express Air'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">AWB Tracking Code</span>
                      <span className="font-mono font-bold text-stone-800">{activeOrder.trackingNumber || 'Pending Assignment'}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">Delivery Address</span>
                      <span className="font-medium text-stone-700">{activeOrder.customerDetails.address}, PIN: {activeOrder.customerDetails.pinCode}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-Time Live Chat Desk (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl shadow-lg border border-stone-200 flex flex-col h-[650px] overflow-hidden">
                {/* Chat Header */}
                <div className="bg-[#182d21] text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold font-serif border border-emerald-600">
                        PA
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#182d21] absolute bottom-0 right-0 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm leading-tight">Plantinum Atelier Headquarters</h4>
                      <p className="text-[11px] text-emerald-300">Live Support & GPay Payment Desk</p>
                    </div>
                  </div>
                  <span className="bg-emerald-950/80 text-emerald-200 border border-emerald-700/50 text-[10px] px-2.5 py-1 rounded-full font-mono">
                    Order #{activeOrder.id}
                  </span>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-stone-50/50">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-12 text-stone-400 text-xs">
                      <span className="material-symbols-outlined text-3xl mb-1 text-stone-300">forum</span>
                      <p>Connecting to Atelier Live Desk...</p>
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      const isAdmin = msg.sender === 'admin' || msg.sender === 'system';
                      return (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'}`}
                        >
                          <span className="text-[10px] text-stone-400 mb-1 px-1">
                            {msg.senderName || (isAdmin ? 'Plantinum Concierge' : 'You')} • {msg.timestamp}
                          </span>

                          <div
                            className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-xs leading-relaxed ${
                              isAdmin
                                ? 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                                : 'bg-[#182d21] text-white rounded-tr-none'
                            }`}
                          >
                            <p className="whitespace-pre-line">{msg.text}</p>

                            {/* Render GPay UPI QR Payment Request Card */}
                            {msg.type === 'qr_payment_request' && msg.paymentPayload && (
                              <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-stone-900 text-center">
                                <div className="inline-block bg-white p-2.5 rounded-xl border border-emerald-200 shadow-sm mb-2">
                                  <img
                                    src={msg.paymentPayload.qrCodeUrl}
                                    alt="GPay QR Code"
                                    className="w-48 h-48 mx-auto rounded-lg"
                                  />
                                </div>
                                <div className="text-center space-y-1 mb-3">
                                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">GPay / UPI Payment Details</span>
                                  <p className="font-mono text-xs font-bold text-stone-900">UPI ID: {msg.paymentPayload.upiId}</p>
                                  <p className="text-sm font-extrabold text-emerald-950">Amount: ₹{msg.paymentPayload.amount}</p>
                                </div>

                                {/* Customer UTR Submission Box inside QR Message */}
                                {activeOrder.status === 'payment_requested' && (
                                  <form onSubmit={handleUtrSubmit} className="mt-3 pt-3 border-t border-emerald-200/80 text-left">
                                    <label className="block text-[11px] font-bold text-stone-800 mb-1">
                                      Enter 12-Digit UTR / Transaction ID after payment:
                                    </label>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        value={inputUtr}
                                        onChange={(e) => setInputUtr(e.target.value)}
                                        placeholder="e.g. 389274910284"
                                        className="flex-1 px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-mono text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                                        required
                                      />
                                      <button
                                        type="submit"
                                        disabled={isSubmittingUtr}
                                        className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                      >
                                        {isSubmittingUtr ? 'Submitting...' : 'Submit UTR'}
                                      </button>
                                    </div>
                                  </form>
                                )}
                              </div>
                            )}

                            {/* Render UTR Submission Badge */}
                            {msg.type === 'utr_submission' && (
                              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 font-mono text-[11px] font-bold border border-blue-200">
                                <span className="material-symbols-outlined text-sm text-blue-700">verified</span>
                                {msg.text}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {/* Fallback inline UTR input if payment_requested status is active but no QR message found */}
                  {activeOrder.status === 'payment_requested' && !chatMessages.some(m => m.type === 'qr_payment_request') && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-stone-900 text-xs">
                      <p className="font-bold text-amber-900 mb-2">Order Approved! Please complete GPay payment and submit UTR:</p>
                      <form onSubmit={handleUtrSubmit} className="flex gap-2">
                        <input
                          type="text"
                          value={inputUtr}
                          onChange={(e) => setInputUtr(e.target.value)}
                          placeholder="Enter 12-Digit UTR Number..."
                          className="flex-1 px-3 py-2 rounded-lg border border-amber-300 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-700"
                          required
                        />
                        <button
                          type="submit"
                          disabled={isSubmittingUtr}
                          className="bg-amber-900 text-white font-bold text-xs px-4 py-2 rounded-lg hover:bg-amber-950 transition-colors"
                        >
                          Submit UTR
                        </button>
                      </form>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Customer Chat Input Bar */}
                <form onSubmit={handleSendCustomerMessage} className="p-3 bg-white border-t border-stone-200 flex gap-2">
                  <input
                    type="text"
                    value={userMsgText}
                    onChange={(e) => setUserMsgText(e.target.value)}
                    placeholder="Type a message to Plantinum Atelier..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#182d21] text-xs font-medium text-stone-800"
                  />
                  <button
                    type="submit"
                    className="bg-[#182d21] hover:bg-[#0f1c13] text-white p-2.5 rounded-xl transition-colors shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">send</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

