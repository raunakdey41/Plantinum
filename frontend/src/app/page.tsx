"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import BotanicalLivingHero from '@/components/BotanicalLivingHero';
import { SylvaLivingWorldScene } from '@/shaders/sylva-living-world/SylvaLivingWorldScene';
import '@/shaders/threeui.css';

export default function Home() {
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState<string | null>(null);

  const checkPincode = () => {
    const val = pincode.trim();
    if (val.length === 6 && /^\d+$/.test(val)) {
      setPincodeStatus(`delivery`);
    } else {
      setPincodeStatus(`error`);
    }
  };

  const { addToCart } = useStore();

  const addToCartMock = (productName: string, price: string) => {
    const id = productName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    addToCart({ id, name: productName, price });
  };

  return (
    <>
      {/* MASTER LUXURY BOTANICAL HERO SECTION */}
      <section className="relative w-full min-h-[100svh] bg-[#182d21] text-stone-100 flex flex-col justify-between overflow-hidden">
        {/* Ambient Background Glows & Spatial Atmosphere */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden z-0">
          <div className="absolute -bottom-24 right-0 w-[700px] h-[700px] bg-emerald-600/15 rounded-full blur-[140px]" />
          <div className="absolute -top-32 right-1/4 w-[600px] h-[500px] bg-[#2c533b]/30 rounded-full blur-[120px]" />
          <div className="absolute top-1/3 left-10 w-[500px] h-[500px] bg-emerald-900/25 rounded-full blur-[130px]" />
        </div>

        {/* Master Living Botanical Environment (100% static pots, table, background, with imperceptible leaf-only micro-motion) */}
        <BotanicalLivingHero 
          imageSrc="/hero_full_bg.png" 
          altText="Panoramic luxury botanical boutique website hero environment featuring seamless champagne travertine marble tabletop spanning full width with curated indoor houseplants and cascading vines against a deep forest green wall" 
        />

        {/* Header Spacer to account for fixed header */}
        <div className="w-full h-[105px] lg:h-[120px] shrink-0 pointer-events-none"></div>

        {/* Hero Main Content */}
        <div className="relative z-20 flex-1 flex items-center max-w-[1720px] w-full mx-auto px-6 lg:px-12 pt-2 pb-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            <div className="lg:col-span-7 xl:col-span-6 flex flex-col justify-center max-w-2xl pr-0 lg:pr-4">
              <h1 className="font-serif text-5xl sm:text-6xl xl:text-7xl font-normal tracking-tight text-white leading-[1.08] mb-6 drop-shadow-md">
                Office Plants.<br/>
                Garden &amp; Home
              </h1>
              <p className="text-stone-200 text-sm sm:text-base xl:text-lg leading-relaxed font-light mb-8 text-pretty max-w-xl drop-shadow-sm">
                Discover our curated collection of indoor botanical specimens, hand-selected to thrive in your unique living spaces. From resilient succulents and air-purifying aroids to elegant fruit trees and rare tropical foliage, transform your home into a natural sanctuary of calm and luxury.
              </p>
              <div className="flex items-center gap-4">
                <Link 
                  href="/shop/indoor-plants" 
                  className="group relative inline-flex items-center justify-center bg-white text-[#182d21] hover:bg-stone-100 font-semibold text-xs tracking-[0.2em] uppercase px-10 py-4 rounded-full transition-all duration-300 shadow-[0_12px_30px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_36px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>OUR PRODUCTS</span>
                  <span className="material-symbols-outlined ml-3 text-[18px] opacity-70 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
              </div>
            </div>
            {/* Spatial stage allowing the right-side plants to shine through */}
            <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 h-[460px] pointer-events-none"></div>
          </div>
        </div>

        {/* Minimal Bottom Tagline / Copyright Line */}
        <div className="relative z-20 w-full border-t border-white/5 py-4 px-6 lg:px-12 text-center text-xs text-stone-400 backdrop-blur-[2px]">
          <p>© 2026 Plantinum Luxury Botanicals. Handcrafted for modern living sanctuaries.</p>
        </div>
      </section>

      {/* Mobile Marquee (Placed after hero section) */}
      <div className="md:hidden w-full py-0.5 bg-surface-container overflow-hidden border-b border-surface-container-highest">
        <style>{`
          @keyframes marquee-mobile {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee-mobile {
            animation: marquee-mobile 25s linear infinite;
          }
        `}</style>
        <div className="flex w-max animate-marquee-mobile">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex shrink-0 gap-3 px-2 items-center">
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
                <p className="font-label-sm text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">100% Transit Safe</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">eco</span>
                <p className="font-label-sm text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">7-Day Guarantee</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">support_agent</span>
                <p className="font-label-sm text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">Expert Support</p>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-[16px]">local_shipping</span>
                <p className="font-label-sm text-[11px] text-on-surface-variant font-medium tracking-wide uppercase">Fast Courier</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* METRICS & PROMISES STRIP */}
      <section className="w-full bg-surface-container py-space-lg px-gutter-mobile lg:px-margin">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile lg:font-display-lg text-primary font-headline-lg font-bold leading-tight">150k+</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-1">Sanctuaries Created</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile lg:font-display-lg text-primary font-headline-lg font-bold leading-tight">100%</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-1">Transit-Safe Guarantee</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile lg:font-display-lg text-primary font-headline-lg font-bold leading-tight">7 Days</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-1">Replacement Promise</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="font-display-lg-mobile lg:font-display-lg text-primary font-headline-lg font-bold leading-tight">4.9★</span>
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-1">Pan-India Customer Trust</span>
          </div>
        </div>
      </section>

      {/* EXPLORE BY BOTANICAL CATEGORY */}
      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">Curated Classifications</span>
              <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
                Explore by Botanical Collection
              </h2>
            </div>
            <Link href="/shop/indoor-plants" className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md uppercase tracking-wider font-bold hover:text-primary transition-colors">
              Browse Complete Greenhouse <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-gutter">
            {/* Category Cards */}
            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8zws_gGgLWrnq7BwVqMBzIkPY2_kGw_HCcjlrlBahT6NFBgO7qeY8l7Tc0iSmaZe-5XlNpmBDwlk8bdQ2av4LvH6bL4nzxOImAXpI4U4XvDxZiT81kxhnpwttTwC4OwdX961QdXTvXjSSn0-AHnUdqBCyLKiFn7ZGpOsdzJGlZZWoYNUisR3--gmARih-5pOvRALIrTGD7hPgyodpNbNQ5-898fQDpTXHuZ1o7OXVGykcx3T1uKVFFA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Indoor Foliage" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Indoor Foliage</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">80+ Species</span>
            </Link>

            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGv29eSIe-Mqb1dihi9SH6MyItABA7CDs6Mu1V2QkTHHq2Lw2oyd_IJ-PWYBv6Oj-TpXlRLQWBJWw6yUmq7xEKvr08KuHDMaw8up5rz5Iwf7uKjt0qRjoEMz-3Y_9EXJLlmDO9cCOKH0imdr7Y7oArjeL9A9Sh_K_qSErl4gU8Tx6Cyl3fajpYWfKYSGmqOYYl_tKjlLQGpyD1l1oJ0SRqDg7SwwfrWpx_g60-2NQYtAsFY2etkDvJHQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Luxury Planters" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Luxury Planters</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">45+ Designs</span>
            </Link>

            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI1OUn2wF_IPx-G1rWOdgDbIEjzQwe_n43j6nxbRU5abRE4RSzjuFoFITD2ODWwQW3mw4XNKJEpZv6VbTYsbFB5tlU4ierDoZjeXqYirOjGlfaus1Woraj6hlf-I2PRWWWqQObLOY-J0RyklYi1CGz41fMJ6ysC-plSSqbg-ix_Gmx-bOwKWTBZz8v2ZdKcEVJZ_vrvgXCK9xjx--65Wfno0NkBmGCS6xshH_m3ONxK8pgaNvuYifAHg" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Balcony Greens" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Balcony Greens</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">60+ Varieties</span>
            </Link>

            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDjS-XqioHTS3YJKcusEMFVVWUsQTJQmRs4S-qNOU3XDqolVgJ89nraDbrecaf2rMlna7s_WbDwG018zPm8ijmLOqXYSwFrSliPpgDK8mNEIdrgqs_kkpPGZk2dXBGmk4LrmxVlkxaP2uxfYZGyghf3g97axi--F-vB05L3-EWw56h3ZHUglTTpaCQMvuFQ1XSUsrh8b5H-3gzOOKS3VpNmWWIXnCQI3GiD6ObdWxQ3v4JSx8x3C_blFA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Soil &amp; Care" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Soil &amp; Care</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">100% Organic</span>
            </Link>

            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgPAaXQ3Wh6CqhuxWrKJcJFumw-oa4M9Uimv76_I7nnX1Uz63M0egUUnaa_PH2NvTBqvSaRsF1PrTUHWyNxyNtkib4qnKSqil8B38Iwvf55t-3_-jRS-BDr5WMUX_RRo-Zi38cemSP69fSOPEJepXAshJIbIpJfzglUoqNj_hbdE-MI8MOmD3dHmqhCxhqvQ_-cIK1VpuN0jmZY3kojlM6qx_6DT8CnElKVBjTLGoXE974s76hsJPyQA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Curated Bundles" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Curated Bundles</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">Save Up to 25%</span>
            </Link>

            <Link href="/shop/indoor-plants" className="group flex flex-col items-center p-space-sm rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB1_v_pz5mOLChuDHnOe5XJKcEzrh-21CfSwMtTBhN-tgx4jCNIbJ-XYjKSgZ_vuAo4hRX0d2mxCtVdQbn8jQ-kQgG4-TlSn85WWRq21nNWg0ik460uu2_wYu-2UNi_6LEwY0kTK994PywdhZOBoFrg2XpIadVClYM7N-d2UXP1NNBgqUMBsH8G7nj639gLTGn33j-iZeeaChNcwGPpo-940dGK3UhK817N5zk5Kvvr2wJjt0rRuin89g" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Artisan Tools" />
              </div>
              <h3 className="font-title-md text-[15px] text-primary text-center font-bold">Artisan Tools</h3>
              <span className="font-body-sm text-body-sm text-outline text-center mt-0.5">Brass &amp; Steel</span>
            </Link>
          </div>
        </div>
      </section>

      {/* SPACES DESIGNED TO BREATHE (ROOM INSPIRATION) */}
      <section className="w-full bg-surface-container-low px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">Interior Spatial Design</span>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
              Spaces Designed to Breathe
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Discover how botanical architecture transforms corners, workstations, and high-ceiling corridors into regenerative living art.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Rooms */}
            <div className="group relative rounded-2xl overflow-hidden shadow-md bg-surface-container aspect-[3/4] flex flex-col justify-end p-space-md">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3SdTpMmVeijZb70Et7EuqTHB1MslXQ2-qXOpKTQ-JK1pqEw2Tri8UbusM0QUZMFB_hqgCl6VvarcPHAqhvhtDZq2KJoGqaP9L7SXiTnnfjmYDxcA8u6esYC6GH7XgIir36yRbGhESeNG47RF7KOnWgNdPeTwyQoWs6frXYqzqCgDd8trrDwK22WNg2MEdc1S4q537GTm7KFeaXZNC47XQdWc9kQ29gW0-xA3s2UMnlR-elnmB300nQw" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Balcony Sanctuary" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="relative z-10 flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Air Circulation</span>
                <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold mt-1">Balcony Sanctuary</h3>
                <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">Vibrant, heat-resilient tropical palms and trailing ferns.</p>
                <Link href="#" className="inline-flex items-center gap-1 text-tertiary-fixed font-label-md text-label-md font-semibold mt-3">
                  Explore Setting <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-md bg-surface-container aspect-[3/4] flex flex-col justify-end p-space-md">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCnUBrzENk7AdTe1A9yPOSNymkL1D9s4wRgyDzeZzNXdlCEF5xaN1rdP4LigNOMtj0RjYXAWeaZqau1GtZpYTTbCF6XBYAKDJapNCrdXxvosOt6GLEmX7VrF7mHKKn7m0kTrCli473PudBxQ_oBl_VARH2WO9QXhBnzI6Rn4dll6VVTxBHE4Sjf0oEK9p_Xhgyb3qGmq8ADHmkIUk24P8wfYhxK1P0KGG0ViMsDQOTxNn3UtJVAqvtMZA" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Living Room Statements" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="relative z-10 flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Focal Statements</span>
                <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold mt-1">Living Room Statements</h3>
                <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">High-impact architectural specimen trees that anchor the room.</p>
                <Link href="#" className="inline-flex items-center gap-1 text-tertiary-fixed font-label-md text-label-md font-semibold mt-3">
                  Explore Setting <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-md bg-surface-container aspect-[3/4] flex flex-col justify-end p-space-md">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCoD8L7HyWc6lh6z_KXZbWYtLMerTGc_bWtWTcZA32OEbpd_5S7kmRfpcEtMBht44Q1jKa4mUkes2ogkZDnw3ihvYpUZZTvHM95anhRxDo9MFrjTF6Izkgj7zCpc0DLW-bk9QDCpzHeKvbvLjY0I_JftUWX80FMZuukfXKh4BPAsyRrz4ylD2_UPrsG5DVDe6AnL20jBuZtypeHSn41hFs60lhHbNah-PcIUrGng3zSjstCB6l9CJl2Cg" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Bedroom Serenity" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="relative z-10 flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Night Oxygen</span>
                <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold mt-1">Bedroom Serenity</h3>
                <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">CAM-metabolism plants that release restorative oxygen during night.</p>
                <Link href="#" className="inline-flex items-center gap-1 text-tertiary-fixed font-label-md text-label-md font-semibold mt-3">
                  Explore Setting <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden shadow-md bg-surface-container aspect-[3/4] flex flex-col justify-end p-space-md">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDF2cQeXybvJ7eyWFH8tkOOforFehR1x2DQqIk3EDfQ1SAxK4OUJkAGXnMxgNIy8x8R3lYW2heFlUjmNFKdWewM5TwifqQhYKtDV96rlEZa8qj8eFPpzsVHASChGV1Ovrk9NUxXRD2pi-_jNVWnQjm6nC0ChlQrzNtksvGPmFEG0z92xQAIYY_DMDmABmIEoS-EpgAaEYU8kW5zy0ryIq347xwmzSV1JH561T-O_FK1q-63QKN2k7OWEQ" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Workspace Desks" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent"></div>
              <div className="relative z-10 flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary-fixed uppercase tracking-wider">Cognitive Focus</span>
                <h3 className="font-headline-sm text-headline-sm text-on-primary font-bold mt-1">Workspace Desks</h3>
                <p className="font-body-sm text-body-sm text-on-primary/80 mt-1">Drought-tolerant, low-maintenance greens tailored for desk productivity.</p>
                <Link href="#" className="inline-flex items-center gap-1 text-tertiary-fixed font-label-md text-label-md font-semibold mt-3">
                  Explore Setting <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ACCLAIMED BESTSELLERS */}
      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">Acclaimed Botanicals</span>
              <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
                Our Acclaimed Bestsellers
              </h2>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button type="button" className="px-4 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shrink-0">All Bestsellers</button>
              <button type="button" className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors shrink-0">Low Light</button>
              <button type="button" className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors shrink-0">Air Purifying</button>
              <button type="button" className="px-4 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors shrink-0">Pet Friendly</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {/* Bestseller 1 */}
            <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 p-space-sm relative group">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container mb-space-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcUXX4iTR8DmRnOsm3zDdwL6-CpAIAkl68G30W_VZEI4r8RlNcuIlf_1MYPg_EpcoCnHsLt_neFc-f2ZP2TQhPeEaoX81S6TOWik_KqTO1rs7fRyrGLupSbkdEd7liyQt8HHdedQRjck7c1P43BS1dqQH_T6yb2KochZHJHheGQQTAr2vXV9YYpDHLdpdW9AJFI0Gbd4ksrrRr--lfGmX64JIJKBow6PicEX1CJi32RhShPQNh8nn89w" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Monstera Deliciosa" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-secondary uppercase font-bold">Air Purifier</span>
                <button aria-label="Add to Wishlist" type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-outline hover:text-tertiary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-outline">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">wb_sunny</span>
                  <span className="font-body-sm text-[12px]">Indirect Sun</span>
                  <span className="text-outline-variant">•</span>
                  <span className="material-symbols-outlined text-[15px] text-secondary">water_drop</span>
                  <span className="font-body-sm text-[12px]">Weekly</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Monstera Deliciosa</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Includes 8" Off-White Ceramic Planter</p>
                <div className="mt-auto pt-space-sm flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-price-lg text-price-lg text-primary font-bold">₹1,499</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">₹1,999</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-bold">25% OFF</span>
                  </div>
                  <button type="button" onClick={() => addToCartMock('Monstera Deliciosa', '₹1,499')} className="w-9 h-9 rounded-lg bg-primary hover:bg-secondary text-on-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bestseller 2 */}
            <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 p-space-sm relative group">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container mb-space-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCn4GgGKEAYjjyew-ClUlItulF64x2RDpzlZIqYXGdfTS9vK_2qr2csN0dGnzwFd8RRQxa2c9gBuqQRmC86IWuifzIwg6YFuxyevKmbjaGs4QiLAd1EzmU8nJ7llDkThlOavi9zEo7IX_IjmLlo3RtmLsgD0X43EUlKpYpg_cfyuLa4Ue5orCly55C3bqYOBB-CsFogte3VjMDvWMsnkpjIQrUBdB8_wWxPLB4piAQMT0VWIMt19NmxQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Snake Plant Laurentii" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-secondary uppercase font-bold">Indestructible</span>
                <button aria-label="Add to Wishlist" type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-outline hover:text-tertiary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-outline">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">nightlight</span>
                  <span className="font-body-sm text-[12px]">Low Light</span>
                  <span className="text-outline-variant">•</span>
                  <span className="material-symbols-outlined text-[15px] text-secondary">water_drop</span>
                  <span className="font-body-sm text-[12px]">Bi-weekly</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Snake Plant Laurentii</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Includes Self-Watering Eco-Slate Pot</p>
                <div className="mt-auto pt-space-sm flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-price-lg text-price-lg text-primary font-bold">₹899</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">₹1,299</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-bold">30% OFF</span>
                  </div>
                  <button type="button" onClick={() => addToCartMock('Snake Plant Laurentii', '₹899')} className="w-9 h-9 rounded-lg bg-primary hover:bg-secondary text-on-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bestseller 3 */}
            <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 p-space-sm relative group">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container mb-space-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkLpHTajLr_AicXBgSftCeqKR3BGaTI_UusSWlTh_AzysodA5lxjI97_CaZcWATMFbsxB7mAxP7Lt2ak7sXwslU5iAzwE_DZVoTuCUpw8RCU0dVB48I1QKl1gHRJh7z70tDuC-q8uwsYRoKHDfKv2hdgnMxBPrAVwPDbVYdckLmuQpq2eFAEVxuYeJYY5EKibaVgQMqLUnEB2MKHuvICtY1YhAp3WtFfBCAdyjzhwKj5fAdcra3EiwtQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Zamioculcas ZZ Plant" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-secondary uppercase font-bold">Beginner Star</span>
                <button aria-label="Add to Wishlist" type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-outline hover:text-tertiary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-outline">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">wb_shade</span>
                  <span className="font-body-sm text-[12px]">Shade Tolerant</span>
                  <span className="text-outline-variant">•</span>
                  <span className="material-symbols-outlined text-[15px] text-secondary">water_drop</span>
                  <span className="font-body-sm text-[12px]">Rare Water</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Zamioculcas ZZ Plant</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Includes Handcrafted Terracotta Saucer</p>
                <div className="mt-auto pt-space-sm flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-price-lg text-price-lg text-primary font-bold">₹1,150</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">₹1,450</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-bold">20% OFF</span>
                  </div>
                  <button type="button" onClick={() => addToCartMock('Zamioculcas ZZ Plant', '₹1,150')} className="w-9 h-9 rounded-lg bg-primary hover:bg-secondary text-on-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bestseller 4 */}
            <div className="flex flex-col rounded-2xl bg-surface-container-lowest shadow-sm hover:shadow-md transition-all duration-300 p-space-sm relative group">
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-container mb-space-sm">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYwkoZ-SwTE6cjN7EjoSO5yBfNDxPoHmmaRwhj84VLbxs3GWp0KQz6j8OcVxBjrd6RMfLE3BQHIXdqzuazklc9UBE1vxfmkOeKmsat1H2wRAWWVMJ2IRZN8NpoaDlxAdVGY9aimIRoDs2JfTIfhDPGDjzfThaZN0jcJDk4-cV6ENghLrhK7QZd_ofw8JsmxuCQqHxIRVu61K_tc0uUGNOkEUWrvrqRaNZzREafn9Ps8IVcjQJ_q9_NHA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Ficus Lyrata" />
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-tertiary uppercase font-bold">Showstopper</span>
                <button aria-label="Add to Wishlist" type="button" className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-container-lowest/90 flex items-center justify-center text-outline hover:text-tertiary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">favorite</span>
                </button>
              </div>
              <div className="flex flex-col flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-outline">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">wb_sunny</span>
                  <span className="font-body-sm text-[12px]">Bright Direct</span>
                  <span className="text-outline-variant">•</span>
                  <span className="material-symbols-outlined text-[15px] text-secondary">water_drop</span>
                  <span className="font-body-sm text-[12px]">Moderate</span>
                </div>
                <h3 className="font-title-md text-title-md text-primary font-bold">Ficus Lyrata (Fiddle Leaf)</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Mature 3.5-Foot Specimen</p>
                <div className="mt-auto pt-space-sm flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="font-price-lg text-price-lg text-primary font-bold">₹2,299</span>
                    <span className="font-body-sm text-body-sm text-outline line-through">₹2,999</span>
                    <span className="font-label-sm text-[10px] px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-fixed font-bold">23% OFF</span>
                  </div>
                  <button type="button" onClick={() => addToCartMock('Ficus Lyrata (Fiddle Leaf)', '₹2,299')} className="w-9 h-9 rounded-lg bg-primary hover:bg-secondary text-on-primary flex items-center justify-center transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add_shopping_cart</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 60-SECOND PLANT FINDER CONSULTATION BANNER */}
      <section className="w-full px-gutter-mobile lg:px-margin py-space-md">
        <div className="max-w-7xl mx-auto rounded-3xl bg-primary-container text-on-primary p-space-lg lg:p-space-xl relative overflow-hidden shadow-xl">
          <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-center">
            <div className="lg:col-span-8 flex flex-col items-start gap-space-xs">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-on-secondary font-label-sm text-label-sm uppercase tracking-wider">
                <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">psychology</span>
                Customized Botanical Matcher
              </div>
              <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-on-primary font-bold tracking-tight">
                Not sure which plant fits your sunlight &amp; routine?
              </h2>
              <p className="font-body-md text-body-md text-on-primary-container max-w-2xl mt-1">
                Answer 4 quick questions about your window exposure, pet companions, and watering habits. Our in-house botanist algorithm finds your perfect botanical companion with 99.4% survival rate.
              </p>
              <div className="flex flex-wrap items-center gap-space-sm pt-space-sm">
                <button type="button" className="h-12 px-6 rounded-lg bg-tertiary hover:bg-tertiary-container text-on-tertiary font-label-md text-label-md uppercase tracking-wider transition-colors font-bold flex items-center gap-2">
                  <span>Start 60-Sec Quiz</span>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </button>
                <span className="text-body-sm font-body-sm text-on-primary-container">Over 42,000 matches made this month</span>
              </div>
            </div>
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div className="p-space-md rounded-2xl bg-surface-container-lowest text-on-surface shadow-xl max-w-xs w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-bold">Top Match Preview</span>
                  <span className="material-symbols-outlined text-tertiary">military_tech</span>
                </div>
                <div className="w-full h-32 rounded-xl bg-surface-container overflow-hidden mb-2">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAx5ee54WXPZviqZyVGbJ8qK6Uk_XKN8Q-OG-0lgBSoBgz84Zg7sJBgqJ6TMDVijJyQTp8QhHAodE7lg05EeItvPeJ0LHrRST-5huxmgB5Q-5CL1hBIpRlemfEWOIKgiJfoefC8U8QlXQcB9G6Vq-om0MyiQ0aehw5WR2MpfC5SpWf61L4ixmGpaTiPdsv7HkArLLsXl458m5yj_PrsIAIH-pBdm_m9xpjs_OETew741tEqQcJpXoYTFg" className="w-full h-full object-cover" alt="Calathea Orbifolia" />
                </div>
                <p className="font-title-md text-title-md text-primary font-bold">Calathea Orbifolia</p>
                <p className="font-body-sm text-[12px] text-on-surface-variant">Ideal for: Medium Light &amp; Pet Parents</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BOTANICAL BUNDLES FOR HOMES */}
      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">Effortless Green Sanctuary</span>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
              Complete Botanical Bundles
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Carefully paired trios of harmonized plants and luxury ceramics designed to curate an instant designer aesthetic.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Bundle 1 */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
              <div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-container mb-space-md">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVhem-5D-cVMOxvsMUKtI0Rw3w1dYwzS6MP8sM5szq4h2Spteh5PDoXn4w3R8ui6oXQGttUxwTubREI1dKx0f_kwH_YzYEVKMiOoFfdETKV0hEjXClOK_352UOU_ABVFu4O7FgQ2-MsV-fVv0EwAYzDGnhPb9x4W4SRA_Ks-F0VfE2PUcAkP7a8iaINv1RwScXHJpVNlkRb8fklS0-Epw3umc2NvLZahDWDOhlPKy3qVvTB11JIMmjOg" className="w-full h-full object-cover" alt="Workstation Trio" />
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">Workstation Trio</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">Executive Desk Sanctuary</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Three hardy desktop specimens (Jade, Sansevieria Dwarf, and Peperomia) designed to absorb computer glare and purify workspace air.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="font-price-lg text-price-lg text-primary font-bold">₹2,199</span>
                  <span className="font-body-sm text-body-sm text-outline line-through ml-1.5">₹2,899</span>
                </div>
                <button type="button" onClick={() => addToCartMock('Executive Desk Sanctuary', '₹2,199')} className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-sm text-label-sm font-bold uppercase transition-colors">
                  Add Bundle
                </button>
              </div>
            </div>

            {/* Bundle 2 */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between relative ring-2 ring-tertiary-container">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-[11px] font-bold uppercase">
                Most Popular
              </div>
              <div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-container mb-space-md">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7KWZcvWky02L4YhPcJ3MdJuC7TqxZ3JYhAvNv5mCzWw6FH_UeGXXi1A9sjL3VdSShEpUfhMC6bMwNTmG6fDwyxs1_OGdiDDjSR9FIeEnlNd4O4jaShlijjcN0JS6iRosU68od8KDYM6-eZfwXXi-aD4-Pt0-GTcpspzM7RH53_jTeNquSAi_L9oKE3U_1s1kLD4eAwVOJY5dNAZgL9qg3ZKg2Hu83KwNoUyu-dZ6rIyXqZOwO0macoA" className="w-full h-full object-cover" alt="Living Room Statement" />
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">Great Rooms</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">Living Room Statement</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Large Monstera Deliciosa, 4ft Areca Palm, and ZZ specimen. Paired with our flagship handcrafted matte stone pots with saucers.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="font-price-lg text-price-lg text-primary font-bold">₹4,499</span>
                  <span className="font-body-sm text-body-sm text-outline line-through ml-1.5">₹5,999</span>
                </div>
                <button type="button" onClick={() => addToCartMock('Living Room Statement', '₹4,499')} className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-sm text-label-sm font-bold uppercase transition-colors">
                  Add Bundle
                </button>
              </div>
            </div>

            {/* Bundle 3 */}
            <div className="rounded-2xl bg-surface-container-lowest p-space-md shadow-sm flex flex-col justify-between">
              <div>
                <div className="aspect-[16/10] rounded-xl overflow-hidden bg-surface-container mb-space-md">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuB9YMwFqf7yIJrqNa6a6MlA-SNeqSLdFqIgVD7yZ4MjUojv5GHPRaQbivyeMEnp_ct6w9SgNli2D8OX88VBeSznb7dkH1pFlV9nv5HcJJbcQPLJnVhdm_9EQQa6P4p-onZucV2MaZwPqrHn8AFL3eMqXbb4rg9X686o225Zcttmmg7-TibyKHAI-E3siK5tyt0-ijQGPdBwu4xL61hD4Az-iVIUVnE-5Q5p3k834Rl7Nr4QYd0xi1BOtQ" className="w-full h-full object-cover" alt="Beginner's Green Sanctuary" />
                </div>
                <span className="font-label-sm text-label-sm text-secondary font-bold uppercase">Unkillable</span>
                <h3 className="font-headline-sm text-headline-sm text-primary font-bold mt-1">Beginner's Green Sanctuary</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Zero stress for new plant parents. Forgiving foliage that tolerates uneven watering, dry AC conditions, and indirect lighting.
                </p>
              </div>
              <div className="mt-space-md pt-space-sm border-t border-outline-variant/30 flex items-center justify-between">
                <div>
                  <span className="font-price-lg text-price-lg text-primary font-bold">₹1,799</span>
                  <span className="font-body-sm text-body-sm text-outline line-through ml-1.5">₹2,399</span>
                </div>
                <button type="button" onClick={() => addToCartMock('Beginner’s Green Sanctuary', '₹1,799')} className="px-4 py-2 rounded-lg bg-primary hover:bg-secondary text-on-primary font-label-sm text-label-sm font-bold uppercase transition-colors">
                  Add Bundle
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY PLANTINUM */}
      <section className="w-full bg-surface-container-low px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-xl">
          <div className="text-center max-w-2xl mx-auto">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">The Plantinum Standard</span>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
              Why Discerning Gardeners Choose Us
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">inventory_2</span>
              </div>
              <h3 className="font-title-md text-title-md text-primary font-bold">Triple-Cushion Transit Pods</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Proprietary ventilated honeycomb shells lock root balls firmly in place. Not a single gram of potting mix spills during pan-India transit.
              </p>
            </div>
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">health_and_safety</span>
              </div>
              <h3 className="font-title-md text-title-md text-primary font-bold">7-Day Healthy Arrival Warranty</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                If your plant arrives with wilting foliage or damaged stems, send a single WhatsApp photo. We issue an instant, no-questions-asked greenhouse replacement.
              </p>
            </div>
            <div className="p-space-lg rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-space-sm">
              <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h3 className="font-title-md text-title-md text-primary font-bold">Free Lifetime Plant Doctor</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Every order grants lifetime direct WhatsApp access to certified agronomists for diagnostic leaf scans, seasonal feeding, and repotting advice.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BOTANICAL JOURNAL */}
      <section className="w-full px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
            <div>
              <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">Botanical Wisdom</span>
              <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
                The Botanical Journal
              </h2>
            </div>
            <Link href="#" className="inline-flex items-center gap-1 text-secondary font-label-md text-label-md uppercase tracking-wider font-bold hover:text-primary transition-colors">
              Read All Journal Editions <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <article className="flex flex-col group">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHuLmrSjUSLsRQKji-F3ZijMkCsRc4wo4REu5w-XUvBQimxJ3MWdB7wEXzOIfkAY6nvTXup0PnKosLT3nyZNchGkharZ70j02iBEZQXswYjj5P3YyRzZtMup_PqCqjCbAz_b-IZN80nU51n_rtknGFVPZc2fomDLEiIP-telyGZh9RYg7o68i-h3WSpi4kk_DfMYV9NRUiuoJ7YRtO8DnBbkwhE5_H5BLBEW1MZ2BBe6_eDrNQmMMUwQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Monsoon Watering" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-primary uppercase font-bold">Care Protocol</span>
              </div>
              <span className="font-body-sm text-[12px] text-outline">June 12, 2025 • 4 min read</span>
              <h3 className="font-headline-sm text-[18px] text-primary font-bold mt-1 group-hover:text-secondary transition-colors">
                The Monsoon Watering Pivot: Why Less is More for Indoor Aroids
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 line-clamp-2">
                Elevated atmospheric humidity changes root absorption rates. Learn how to calibrate soil drainage before root rot develops.
              </p>
            </article>

            <article className="flex flex-col group">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwlcDXwI5EDshtIz3ccMdexXjEjhRNR489HK3B1iR5HPt04J-N2VjeHkOaSsKjgO1cQF4ZgEQglwFU7300tjU7dssWB2cFr9a8-JSuZix1dXI5-viIg5FzMIb9vIt3_e0gp8nVP7yOdmXAwfrK0oUCkLRIdtm2Fh_Dwh87QT6DKhsVHixDhtuHTyrLDPfalB4D5WzS_ome_jZ0HtoDr5kEsYNOdA-52Oy_Rj_-sxEMpre-BSy9YhR5zQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Architectural Greenery" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-primary uppercase font-bold">Styling</span>
              </div>
              <span className="font-body-sm text-[12px] text-outline">May 28, 2025 • 6 min read</span>
              <h3 className="font-headline-sm text-[18px] text-primary font-bold mt-1 group-hover:text-secondary transition-colors">
                Architectural Greenery: Harmonizing Ceramic Textures with Teak &amp; Brass
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 line-clamp-2">
                Interior tips from our landscape designers on contrasting organic leaf contours against linear urban masonry.
              </p>
            </article>

            <article className="flex flex-col group">
              <div className="aspect-[16/10] rounded-2xl overflow-hidden bg-surface-container mb-space-sm relative">
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_xrbbdj2Fwlwyyt7OYe0FJeEt6YmvmPNLFUsuH_VNjhpcEEcED0wm7yt2PD0T6YRMG8ffsxJaugwlqRfB1goOSNQC4QlMkm6afH7VSNLkITDyOYfgFyT1wqewUn2yDqbl2wFkYjplYVwrEX5ZaM7J7IDM57-SzyMzX_kpPpzSuZ7ciZwnlwPDCJ5wtI9YeqlHaL61SoR6kDGMABpD0-hThSYBYRWlDfayKiR5Ntl6LToP_0VsFMCJ6w" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Soil Science" />
                <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface-container-lowest/90 font-label-sm text-label-sm text-primary uppercase font-bold">Soil Science</span>
              </div>
              <span className="font-body-sm text-[12px] text-outline">May 14, 2025 • 5 min read</span>
              <h3 className="font-headline-sm text-[18px] text-primary font-bold mt-1 group-hover:text-secondary transition-colors">
                Decoding Chunky Aroid Mix: The Chemistry of Oxygenated Roots
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 line-clamp-2">
                Why traditional garden soil suffocates tropical epiphyte root structures in indoor Indian settings.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* COMMUNITY SANCTUARY GALLERY */}
      <section className="w-full bg-surface-container-low px-gutter-mobile lg:px-margin py-space-xl lg:py-space-2xl">
        <div className="max-w-7xl mx-auto flex flex-col gap-space-lg">
          <div className="text-center max-w-xl mx-auto">
            <span className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest font-bold">#PlantinumHomes</span>
            <h2 className="font-headline-lg text-headline-lg-mobile lg:text-headline-lg text-primary font-bold tracking-tight mt-1">
              Lush Sanctuaries Across India
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Real customer spaces styled with Plantinum botanicals. Tag @plantinum.in on Instagram to be featured.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYkNEATS5uVJEVGDkRYG7f1zjTcNZrYGFS0319PUArC17900pD7TxMt5FlkMSyB7HvVcpod7zpA6BnZwptPDFWDT-kLS6hZ3h35hCRrDCLDX5RXXeGycE87G4W5LqEgf5MH6Vym2mnn6Yqdp3FBzxnejaTlRGEyMuB6gIDZRh-ACWYKR34klsfBwROIYRNnOVZHFWYm9SCOkYyNx0LEfhD4zaSsNEOJyiDhpDIEZRiVB9VRH5a5-FD7A" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Customer home 1" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary font-label-md text-label-md">
                @ananya.living
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDN01r4gVBd-Bnv58yigyq1brfzu3p1twxGdO1qgc33q9CUC3ffgWzfIkeLcLHNNbJnUmJ-pdZGonvisKBChNYlng1bpUqZS1Mj0fKqhuQI34sw6ZS5gN9qQBOIPmP5jpxyhuI_u34XXmw2ejslJqKCEtKEmEWWkfctmM7Wr348ytb8mBpHij68k0pgzqLNShT1-nfdMkTlduqeLbOQLWeWZutcN5siRIz1D2IVFHaIvloLkY3B8P5RA" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Customer home 2" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary font-label-md text-label-md">
                @vikram_arch
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBduE_ZewjojnAModjQnKeeRPlRtzWC_biLFIu_euXum8UIXt3KaQY9e1-ZgAbuppOATHSPCmQDXrGdk3ya9qKKKotNkHJYi2EgGlYhmEOBkGDLLjkyptYpD8uxP5RkfviwMj9kCK6xc_dZSX4SZ7Ez_Qa6I7wsbZqTn3R-bQorZiUpGC5RKK1XLMnbzaCYLySVCr37Cf4NyksmpxF3AtVww8vCugfcRktrnNUHBDiqw5qv98-Q6Hp7Zw" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Customer home 3" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary font-label-md text-label-md">
                @meera_greenery
              </div>
            </div>
            <div className="aspect-square rounded-2xl overflow-hidden bg-surface-container relative group">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzEBzo07xgDxsOTKc16id_nOkpAtfuC7wgeks36cpYjYUngg1D5NIvQsi5ZGyD9TkdqKuc3Q4hQBru80eE9Df9pvVz9xWIDZOTxvtjCgEx4o_z_OXPV8mkcI_h5c87HnJr49MyIVgX2lV5oPiKUBpSZeZcsL7D9Jlj7LURJRuzgRzjBNxpRALZCcZ1qZVagw5Pehd2K20dBsx22taYN_rrC03Ai2Gz0Bh9Ff5BxoSnNtu5ogJTxidKLQ" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Customer home 4" />
              <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-on-primary font-label-md text-label-md">
                @rohan_studio
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
