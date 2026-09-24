"use client";

import React from 'react';
import Link from 'next/link';

export default function JournalHubPage() {
  const articles = [
    {
      title: "Why these 5 Plants Bring Luck to Your Home",
      category: "Plant Lore",
      href: "/journal/lucky-plants",
      image: "https://images.pexels.com/photos/7352303/pexels-photo-7352303.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      excerpt: "Discover the ancient botanical secrets behind Money Plants, Jade, and other auspicious greenery."
    },
    {
      title: "How to Take Care of Your Indoor Plants",
      category: "Masterclass",
      href: "/journal/plant-care",
      image: "https://images.pexels.com/photos/6208087/pexels-photo-6208087.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      excerpt: "Learn essential secrets to watering, light exposure, and repotting for a thriving indoor jungle."
    },
    {
      title: "Top 10 Health Benefits of Living Botanicals",
      category: "Wellness",
      href: "/journal/indoor-benefits",
      image: "https://images.pexels.com/photos/3126442/pexels-photo-3126442.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
      excerpt: "From air purification to stress reduction, here is why a green space is a healthy space."
    }
  ];

  return (
    <div className="bg-[#fcfbf7] min-h-screen pb-16">
      <section className="bg-[#182d21] text-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-emerald-400 font-bold text-xs uppercase tracking-[0.25em] mb-2 block">
            Cultivation &amp; Wisdom
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            The Botanical Journal
          </h1>
          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto">
            Master care guides, horticulturist insights, and botanical lore curated by Plantinum Atelier.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((art, idx) => (
            <Link key={idx} href={art.href} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 flex flex-col justify-between hover:shadow-md transition-all">
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100">
                  <img src={art.image} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">{art.category}</span>
                  <h3 className="font-serif font-bold text-lg text-stone-900 mt-1.5 group-hover:text-emerald-900 transition-colors leading-snug">{art.title}</h3>
                  <p className="text-stone-600 text-xs mt-2 leading-relaxed">{art.excerpt}</p>
                </div>
              </div>
              <div className="px-6 pb-6 pt-0 text-xs font-bold text-emerald-800 flex items-center gap-1">
                <span>Read Full Article</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
