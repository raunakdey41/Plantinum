"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore, Order } from '@/context/StoreContext';

const TIMELINE_STEPS = [
  { step: 1, title: 'Order Confirmed', desc: 'Received & verified by Plantinum Atelier' },
  { step: 2, title: 'Botanical Inspection', desc: 'Plant selected & acclimatized by botanists' },
  { step: 3, title: 'Triple-Armor Packaging', desc: 'Custom shockproof eco-cradle sealed' },
  { step: 4, title: 'In Transit via Express', desc: 'On its way to destination hub' },
  { step: 5, title: 'Out for Delivery', desc: 'Delivered to your doorstep' }
];

export default function TrackOrderPage() {
  const { orders } = useStore();
  const [searchId, setSearchId] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // If user has orders and hasn't manually searched yet, default to most recent order
  const activeOrder = searchedOrder || (orders.length > 0 ? orders[0] : null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchId.trim().toUpperCase();
    setHasSearched(true);
    if (!query) {
      setSearchedOrder(null);
      return;
    }

    const found = orders.find(o => o.id.toUpperCase() === query || o.trackingNumber.toUpperCase() === query);
    setSearchedOrder(found || null);
  };

  return (
    <div className="bg-[#fcfbf7] min-h-screen pb-16">
      {/* Header Banner */}
      <section className="bg-[#182d21] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-[0.25em] mb-2 block">
            Real-Time Order Tracking
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Track Your Order
          </h1>
          <p className="text-stone-300 text-sm max-w-lg mx-auto">
            Enter your Plantinum Order ID or AWB Tracking Number to check live nursery inspection and delivery status.
          </p>
        </div>
      </section>

      {/* Main Track Form & Results Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6">
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
                placeholder="Enter Order ID (e.g. PLN-12345)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#182d21] text-stone-800 font-medium placeholder:text-stone-400 text-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-[#182d21] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#0f1c13] transition-colors shadow-md text-sm cursor-pointer flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">local_shipping</span>
              Track Status
            </button>
          </form>
        </div>

        {/* Empty State: No Orders Placed Yet */}
        {orders.length === 0 && !searchedOrder ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-stone-200 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-800 mx-auto flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-3xl">shopping_basket</span>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">You haven't ordered anything yet</h2>
            <p className="text-stone-500 text-sm mb-6 leading-relaxed">
              Explore our hand-grown atelier greenery and bring nature into your living sanctuary.
            </p>
            <Link
              href="/shop/indoor-plants"
              className="inline-flex items-center gap-2 bg-[#182d21] text-white font-bold px-6 py-3.5 rounded-xl hover:bg-[#0f1c13] transition-colors text-sm shadow-md"
            >
              <span className="material-symbols-outlined text-lg">potted_plant</span>
              Explore Indoor Plants
            </Link>
          </div>
        ) : hasSearched && !searchedOrder ? (
          /* Search yielded no match */
          <div className="bg-white rounded-2xl p-8 text-center border border-stone-200 shadow-sm">
            <span className="material-symbols-outlined text-stone-400 text-4xl mb-2">search_off</span>
            <h3 className="text-lg font-bold text-stone-800 mb-1">No order found for "{searchId}"</h3>
            <p className="text-stone-500 text-xs">Please verify your order ID or check your email receipt.</p>
          </div>
        ) : activeOrder ? (
          /* Active Order Status Details */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-300">
            {/* Status Summary Banner */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-serif font-bold text-stone-900">Order #{activeOrder.id}</h2>
                  <span className="px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    {activeOrder.status}
                  </span>
                </div>
                <p className="text-stone-500 text-xs">
                  Placed on {activeOrder.date} • Shipping to <strong>{activeOrder.deliveryLocation}</strong>
                </p>
              </div>

              <div className="bg-emerald-950/5 border border-emerald-900/10 p-3.5 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-800 text-2xl">schedule</span>
                <div>
                  <span className="text-[11px] uppercase font-bold text-stone-500 block leading-tight">Total Amount</span>
                  <span className="text-sm font-bold text-emerald-900">₹{activeOrder.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Visual Progress Timeline */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-stone-200">
              <h3 className="font-serif font-bold text-lg text-stone-900 mb-8 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-800">route</span>
                Live Journey Timeline
              </h3>

              <div className="relative">
                <div className="hidden md:block absolute top-5 left-[5%] right-[5%] h-1 bg-stone-200 -z-0">
                  <div
                    className="h-full bg-emerald-700 transition-all duration-500"
                    style={{ width: `${((activeOrder.currentStep - 1) / (TIMELINE_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative z-10">
                  {TIMELINE_STEPS.map((s) => {
                    const isPassed = s.step <= activeOrder.currentStep;
                    const isCurrent = s.step === activeOrder.currentStep;
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

            {/* Package Contents & Courier Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                <h3 className="font-serif font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800">inventory_2</span>
                  Package Contents ({activeOrder.items.length})
                </h3>
                <div className="space-y-3">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-stone-50 rounded-xl border border-stone-100">
                      {item.image && (
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg bg-white border border-stone-200 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-stone-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-stone-500">Price: {item.price}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-stone-700 block">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif font-bold text-base text-stone-900 mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-800">badge</span>
                    Logistics Partner
                  </h3>
                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">Courier</span>
                      <span className="font-bold text-stone-800">{activeOrder.courier}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">AWB Tracking Code</span>
                      <span className="font-mono font-bold text-stone-800">{activeOrder.trackingNumber}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 font-semibold uppercase tracking-wider text-[10px] block">Packaging Protocol</span>
                      <span className="font-semibold text-emerald-800">Triple-Armor Botanical Vault</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
