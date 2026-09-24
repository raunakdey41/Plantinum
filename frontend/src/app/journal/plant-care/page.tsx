"use client";

import React from 'react';
import Link from 'next/link';

export default function PlantCareMasterclassPage() {
  const careSteps = [
    { title: "1. The Finger Test for Watering", desc: "Never water on a rigid calendar. Always press your finger 2 inches into the soil. If it feels dry, water deeply until moisture drains from the bottom." },
    { title: "2. Bright Indirect Light Standard", desc: "Most tropical plants thrive near east or south-facing windows where they receive bright light without scorching direct midday rays." },
    { title: "3. Soil Aeration & Drainage", desc: "Ensure your potting mix contains perlite, coco peat, and organic humus to prevent waterlogging and root rot." },
    { title: "4. Seasonal Feeding Routine", desc: "Feed your plants with liquid organic fertilizer every 2 to 3 weeks during spring and summer growth cycles." }
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
          <span className="text-stone-900">How to Take Care of Your Indoor Plants</span>
        </nav>
      </section>

      {/* Hero Header */}
      <section className="bg-[#182d21] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3.5 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs uppercase tracking-[0.25em] font-extrabold border border-emerald-700/50 mb-4 inline-block">
            Masterclass Guide
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            How to Take Care of Your Indoor Plants
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Learn the essential secrets to watering, light exposure, and repotting for a thriving indoor jungle.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-10">
        <div className="aspect-[16/9] w-full rounded-3xl overflow-hidden shadow-md">
          <img
            src="https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            alt="Indoor Plant Care"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="space-y-6">
          {careSteps.map((c, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs">
              <h3 className="font-serif text-xl font-bold text-stone-900 mb-2">{c.title}</h3>
              <p className="text-stone-600 text-sm leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/shop/care-and-soil"
            className="inline-flex items-center gap-2 bg-[#182d21] text-white font-bold px-8 py-4 rounded-full hover:bg-[#0f1c13] transition-colors text-sm shadow-md"
          >
            <span className="material-symbols-outlined">science</span>
            Explore Plant Care &amp; Soil Products
          </Link>
        </div>
      </main>
    </div>
  );
}
