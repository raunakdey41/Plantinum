"use client";

import React from 'react';
import Link from 'next/link';

export default function LuckyPlantsPage() {
  const luckyPlants = [
    {
      name: "Money Plant (Epipremnum aureum)",
      symbolism: "Attracts Prosperity & Positive Financial Energy",
      description: "In Feng Shui lore, the heart-shaped glossy leaves of the Money Plant act as green magnets for wealth, harmony, and positive vibe flow. Highly resilient and air-cleansing.",
      image: "https://images.pexels.com/photos/7352303/pexels-photo-7352303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      placement: "Southeast corner of living rooms or office desks."
    },
    {
      name: "Lucky Bamboo (Dracaena sanderiana)",
      symbolism: "Good Fortune, Longevity & Growth",
      description: "A centuries-old Asian symbol of prosperity. The number of stalks holds special meaning: 3 for happiness, 5 for wealth, and 6 for good luck.",
      image: "https://images.pexels.com/photos/3097770/pexels-photo-3097770.jpeg?auto=compress&cs=tinysrgb&w=600",
      placement: "East facing windows or dining table centerpieces."
    },
    {
      name: "Jade Plant (Crassula ovata)",
      symbolism: "Wealth, Abundance & Renewal",
      description: "Known as the 'Money Tree' or 'Dollar Plant', Jade's jade-green succulent leaves resemble precious jade coins, storing energy and prosperity.",
      image: "https://images.pexels.com/photos/7966291/pexels-photo-7966291.jpeg?auto=compress&cs=tinysrgb&w=600",
      placement: "Entrance foyer or near business cash counters."
    },
    {
      name: "Peace Lily (Spathiphyllum)",
      symbolism: "Serenity, Healing & Spiritual Harmony",
      description: "With elegant white spathes and lush emerald foliage, the Peace Lily neutralizes indoor toxins while promoting calm, soothing energy in bedrooms.",
      image: "https://images.pexels.com/photos/3952024/pexels-photo-3952024.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      placement: "Bedrooms, meditation spaces, and quiet study nooks."
    },
    {
      name: "Snake Plant (Sansevieria trifasciata)",
      symbolism: "Protection & Shielding Energy",
      description: "Sturdy upright sword-shaped leaves cut through stagnant energy and act as natural air purifiers releasing oxygen throughout the night.",
      image: "https://images.pexels.com/photos/824572/pexels-photo-824572.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      placement: "Main entrance doorways and bedroom corners."
    }
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
          <span className="text-stone-900">Why these 5 Plants Bring Luck to Your Home</span>
        </nav>
      </section>

      {/* Hero Header */}
      <section className="bg-[#182d21] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="px-3.5 py-1 rounded-full bg-emerald-800/80 text-emerald-300 text-xs uppercase tracking-[0.25em] font-extrabold border border-emerald-700/50 mb-4 inline-block">
            Plant Lore &amp; Feng Shui
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Why these 5 Plants Bring Luck &amp; Prosperity to Your Sanctuary
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Explore the ancient botanical wisdom, energy alignment, and air-cleansing magic behind nature's most auspicious green companions.
          </p>
        </div>
      </section>

      {/* Article Body */}
      <main className="max-w-4xl mx-auto px-6 pt-12 space-y-12">
        <div className="prose prose-stone max-w-none text-stone-800 text-sm sm:text-base leading-relaxed">
          <p className="text-lg font-serif text-stone-900 leading-relaxed italic border-l-4 border-emerald-800 pl-4 bg-emerald-50/50 py-3 rounded-r-xl">
            "Bringing plants into your living space isn't merely interior decoration — it is inviting living vital energy (Chi) into your home."
          </p>
          <p className="mt-4">
            For millennia, cultures across East Asia, ancient India, and the Mediterranean have recognized that specific plants possess frequencies that encourage calm, abundance, and resilience. Here is our curated guide to the top 5 lucky plants for your home sanctuary.
          </p>
        </div>

        {/* Lucky Plant Cards */}
        <div className="space-y-8">
          {luckyPlants.map((plant, idx) => (
            <article key={idx} className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-stone-200/90 flex flex-col md:flex-row gap-6 items-center">
              <img
                src={plant.image}
                alt={plant.name}
                className="w-full md:w-56 h-56 object-cover rounded-2xl bg-stone-100 shrink-0 border border-stone-200"
              />
              <div className="flex-1 space-y-3">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-900 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                  {plant.symbolism}
                </div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">{plant.name}</h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">{plant.description}</p>
                <div className="pt-2 border-t border-stone-100 text-xs font-medium text-stone-700 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-800 text-base">explore</span>
                  <span><strong>Optimal Placement:</strong> {plant.placement}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Back Link */}
        <div className="pt-8 text-center">
          <Link
            href="/shop/indoor-plants"
            className="inline-flex items-center gap-2 bg-[#182d21] text-white font-bold px-8 py-4 rounded-full hover:bg-[#0f1c13] transition-colors shadow-md text-sm"
          >
            <span className="material-symbols-outlined">shopping_bag</span>
            Browse Atelier Lucky Plants
          </Link>
        </div>
      </main>
    </div>
  );
}
