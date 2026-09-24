"use client";

import React from 'react';
import Link from 'next/link';

export default function IndoorBenefitsPage() {
  const benefits = [
    { title: "1. Natural Air Purification", desc: "NASA Clean Air studies proved that indoor plants absorb formaldehyde, benzene, and airborne VOCs, exchanging them for clean oxygen." },
    { title: "2. Stress & Cortisol Reduction", desc: "Interacting with indoor greenery lowers blood pressure and reduces stress hormone levels within just 15 minutes." },
    { title: "3. Increased Focus & Creativity", desc: "Studies show workplace productivity and creative problem solving increase by up to 15% when plants are present." },
    { title: "4. Natural Indoor Humidity Regulation", desc: "Plants release 97% of the water they take in as moisture vapor, preventing dry skin and winter respiratory irritation." },
    { title: "5. Better Sleep Quality", desc: "Plants like Snake Plant and Peace Lily release oxygen throughout the night, deepening restful sleep cycles." }
  ];

  return (
    <div className="bg-[#fcfbf7] min-h-screen pb-16">
      {/* Breadcrumbs */}
      <section className="w-full px-6 lg:px-12 pt-6 pb-4 border-b border-stone-200/80 bg-white">
        <nav aria-label="Breadcrumb" className="max-w-6xl mx-auto flex items-center gap-2 text-xs font-semibold text-stone-500">
          <Link href="/" className="hover:text-emerald-900 transition-colors">Home</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/journal" className="hover:text-emerald-900 transition-colors">Botanical Journal</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-stone-900">Top 10 Health Benefits of Living Botanicals</span>
        </nav>
      </section>

      {/* Hero Header */}
      <section className="bg-[#182d21] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3.5 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs uppercase tracking-[0.25em] font-extrabold border border-emerald-700/50 mb-4 inline-block">
            Wellness &amp; Science
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Top 10 Scientifically-Proven Benefits of Living Botanicals
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Discover how bringing nature indoors transforms your physical health, mental focus, and everyday wellbeing.
          </p>
        </div>
      </section>

      {/* Article Content */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.pexels.com/photos/3126442/pexels-photo-3126442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Botanical Wellness"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          {benefits.map((b, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{b.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/shop/indoor-plants"
            className="inline-flex items-center gap-2 bg-[#182d21] text-white font-bold px-8 py-4 rounded-full hover:bg-[#0f1c13] transition-colors text-sm shadow-md"
          >
            <span className="material-symbols-outlined">potted_plant</span>
            Explore Air-Purifying Plants
          </Link>
        </div>
      </main>
    </div>
  );
}
