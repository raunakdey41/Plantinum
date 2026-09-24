"use client";

import React, { useRef, useState, useEffect } from 'react';

export interface PotOption {
  id: string;
  color: string;
  price: number;
  bgHex: string;
  secondaryHex: string;
  lightHex: string;
  patternType: 'ribbed' | 'smooth' | 'owl' | 'speckled' | 'fluted' | 'origami' | 'sphere' | 'column';
  hasCollar?: boolean;
  imageUrl?: string;
}

export const DEFAULT_POT_OPTIONS: PotOption[] = [
  { id: 'p1', color: "White Ribbed Ceramic", price: 499, bgHex: "#F3F4F6", secondaryHex: "#9CA3AF", lightHex: "#FFFFFF", patternType: 'ribbed' },
  { id: 'p2', color: "Matte Black Minimalist", price: 499, bgHex: "#272A30", secondaryHex: "#111317", lightHex: "#4B5563", patternType: 'smooth', hasCollar: true },
  { id: 'p3', color: "Beige Ribbed Studio", price: 549, bgHex: "#E4D5C3", secondaryHex: "#9E8770", lightHex: "#FAF4EC", patternType: 'ribbed' },
  { id: 'p4', color: "Sage Green Terracotta", price: 549, bgHex: "#7A9279", secondaryHex: "#475946", lightHex: "#B8CBB7", patternType: 'smooth', hasCollar: true }
];

export const POT_OPTIONS = DEFAULT_POT_OPTIONS;

export function PotIllustration({ pot }: { pot: PotOption }) {
  const { id, bgHex, secondaryHex, lightHex, patternType, hasCollar, imageUrl } = pot;
  const [imgError, setImgError] = useState(false);

  if (imageUrl && !imgError) {
    return (
      <div className="w-full h-full flex items-center justify-center relative select-none p-1">
        {/* Photorealistic 3D Image Asset */}
        <img
          src={imageUrl}
          alt={pot.color}
          onError={() => setImgError(true)}
          className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-1.5 relative select-none">
      {/* 3D Realistic Soft Studio Ambient Contact Shadow */}
      <div className="absolute bottom-2.5 w-[75%] h-[12px] bg-black/35 rounded-[100%] blur-[6px] pointer-events-none transform scale-y-75" />
      <div className="absolute bottom-3 w-[50%] h-[7px] bg-black/55 rounded-[100%] blur-[3px] pointer-events-none" />

      <svg viewBox="0 0 200 220" className="w-full h-full max-w-[150px] max-h-[150px] transition-transform duration-300 group-hover:scale-105 overflow-visible">
        <defs>
          <linearGradient id={`cylinder3d-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={secondaryHex} stopOpacity="0.95" />
            <stop offset="22%" stopColor={lightHex} stopOpacity="1" />
            <stop offset="55%" stopColor={bgHex} stopOpacity="1" />
            <stop offset="88%" stopColor={secondaryHex} stopOpacity="0.95" />
            <stop offset="100%" stopColor="#08080a" stopOpacity="0.65" />
          </linearGradient>

          <radialGradient id={`sphere3d-${id}`} cx="32%" cy="28%" r="72%" fx="25%" fy="20%">
            <stop offset="0%" stopColor={lightHex} stopOpacity="1" />
            <stop offset="42%" stopColor={bgHex} stopOpacity="1" />
            <stop offset="82%" stopColor={secondaryHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#050507" stopOpacity="0.75" />
          </radialGradient>

          <linearGradient id={`rim3d-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lightHex} stopOpacity="0.9" />
            <stop offset="40%" stopColor={bgHex} stopOpacity="1" />
            <stop offset="85%" stopColor={secondaryHex} stopOpacity="1" />
            <stop offset="100%" stopColor="#111" stopOpacity="0.5" />
          </linearGradient>

          <linearGradient id={`innerRimShadow-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a0807" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#251a14" stopOpacity="1" />
          </linearGradient>

          <radialGradient id={`soilBed-${id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B281C" />
            <stop offset="60%" stopColor="#241710" />
            <stop offset="100%" stopColor="#120A06" />
          </radialGradient>

          {patternType === 'speckled' && (
            <pattern id={`specklePattern-${id}`} width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="3" cy="4" r="1.4" fill="#1F2937" opacity="0.6" />
              <circle cx="14" cy="12" r="1.1" fill="#4B5563" opacity="0.5" />
              <circle cx="17" cy="5" r="1.6" fill="#111827" opacity="0.7" />
              <circle cx="8" cy="16" r="1.2" fill="#374151" opacity="0.6" />
              <circle cx="12" cy="2" r="0.9" fill="#F9FAFB" opacity="0.8" />
            </pattern>
          )}
        </defs>

        {patternType === 'sphere' ? (
          <g>
            <ellipse cx="100" cy="58" rx="42" ry="12" fill={`url(#innerRimShadow-${id})`} />
            <ellipse cx="100" cy="60" rx="38" ry="9.5" fill={`url(#soilBed-${id})`} />
          </g>
        ) : (
          <g>
            <ellipse cx="100" cy="54" rx="48" ry="13" fill={`url(#innerRimShadow-${id})`} />
            <ellipse cx="100" cy="56" rx="44" ry="10.5" fill={`url(#soilBed-${id})`} />
          </g>
        )}

        <ellipse cx="92" cy="56" rx="2" ry="1" fill="#4a3528" opacity="0.8" />
        <ellipse cx="112" cy="57" rx="2.5" ry="1" fill="#5c4233" opacity="0.8" />

        {patternType === 'sphere' ? (
          <g>
            <path
              d="M 54 58 C 30 95, 38 165, 100 165 C 162 165, 170 95, 146 58 Z"
              fill={`url(#sphere3d-${id})`}
            />
            <path
              d="M 64 68 C 50 98, 56 138, 92 156"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.45"
            />
            <path
              d="M 64 68 C 50 98, 56 138, 92 156"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.7"
            />
            <ellipse cx="100" cy="58" rx="46" ry="13" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
            <ellipse cx="100" cy="58" rx="42" ry="11" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.6" />
          </g>
        ) : patternType === 'owl' ? (
          <g>
            <path
              d="M 50 54 L 46 156 C 46 168, 154 168, 154 156 L 150 54 Z"
              fill={`url(#cylinder3d-${id})`}
            />
            <ellipse cx="100" cy="54" rx="50" ry="14" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
            <ellipse cx="100" cy="54" rx="45" ry="11.5" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
            <circle cx="78" cy="98" r="16" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
            <circle cx="78" cy="98" r="7.5" fill="#1E293B" />
            <circle cx="81" cy="95" r="2.8" fill="#FFFFFF" />
            <circle cx="122" cy="98" r="16" fill="#FFFFFF" stroke="#64748B" strokeWidth="2" />
            <circle cx="122" cy="98" r="7.5" fill="#1E293B" />
            <circle cx="125" cy="95" r="2.8" fill="#FFFFFF" />
            <polygon points="100,102 91,116 109,116" fill="#D97706" />
            <path d="M 68 134 Q 78 142 88 134" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 94 134 Q 104 142 114 134" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 120 134 Q 130 142 140 134" fill="none" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ) : patternType === 'origami' ? (
          <g>
            <path d="M 52 54 L 38 106 L 64 162 L 100 166 L 136 162 L 162 106 L 148 54 Z" fill={`url(#cylinder3d-${id})`} />
            <polygon points="52,54 38,106 70,110 100,54" fill="#FFFFFF" opacity="0.35" />
            <polygon points="100,54 70,110 100,166 100,54" fill="#000000" opacity="0.18" />
            <polygon points="100,54 100,166 130,110 148,54" fill="#FFFFFF" opacity="0.4" />
            <polygon points="148,54 130,110 162,106 148,54" fill="#000000" opacity="0.25" />
            <ellipse cx="100" cy="54" rx="48" ry="13" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
            <ellipse cx="100" cy="54" rx="44" ry="10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.7" />
          </g>
        ) : patternType === 'column' ? (
          <g>
            <path
              d="M 52 54 L 54 164 C 54 170, 146 170, 146 164 L 148 54 Z"
              fill={`url(#cylinder3d-${id})`}
            />
            <g opacity="0.7">
              <path d="M 64 56 L 66 164" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 67.5 56 L 69.5 164" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <path d="M 84 56 L 85 165" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 87.5 56 L 88.5 165" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <path d="M 104 56 L 104 166" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 107.5 56 L 107.5 166" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
              <path d="M 124 56 L 123 165" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 127.5 56 L 126.5 165" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            </g>
            <ellipse cx="100" cy="54" rx="48" ry="13" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
            <ellipse cx="100" cy="54" rx="44" ry="10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.8" opacity="0.7" />
          </g>
        ) : (
          <g>
            <path
              d="M 48 54 L 54 158 C 55 167, 145 167, 146 158 L 152 54 Z"
              fill={`url(#cylinder3d-${id})`}
            />

            {patternType === 'speckled' && (
              <path
                d="M 48 54 L 54 158 C 55 167, 145 167, 146 158 L 152 54 Z"
                fill={`url(#specklePattern-${id})`}
              />
            )}

            {(patternType === 'ribbed' || patternType === 'fluted') && (
              <g>
                <path d="M 64 55 C 66 90, 69 125, 70 159" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 67.5 55 C 69.5 90, 72.5 125, 73.5 159" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

                <path d="M 82 55 C 83 90, 85 125, 86 161" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 85.5 55 C 86.5 90, 88.5 125, 89.5 161" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

                <path d="M 100 55 C 100 90, 101 125, 101 162" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 103.5 55 C 103.5 90, 104.5 125, 104.5 162" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

                <path d="M 118 55 C 117 90, 116 125, 115 161" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 121.5 55 C 120.5 90, 119.5 125, 118.5 161" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.3" />

                <path d="M 136 55 C 134 90, 131 125, 129 159" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.5" />
                <path d="M 139.5 55 C 137.5 90, 134.5 125, 132.5 159" stroke="#000000" strokeWidth="3" strokeLinecap="round" opacity="0.3" />
              </g>
            )}

            <path
              d="M 58 56 C 62 90, 66 125, 68 156"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.45"
            />

            {hasCollar ? (
              <g>
                <path
                  d="M 46 54 L 46 80 C 46 87, 154 87, 154 80 L 154 54 Z"
                  fill={`url(#cylinder3d-${id})`}
                  stroke={secondaryHex}
                  strokeWidth="0.8"
                />
                <ellipse cx="100" cy="54" rx="54" ry="15" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
                <ellipse cx="100" cy="54" rx="48" ry="12" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
                <path d="M 47 80 C 60 88, 140 88, 153 80" fill="none" stroke="#0a0a0c" strokeWidth="2.5" opacity="0.5" />
              </g>
            ) : (
              <g>
                <ellipse cx="100" cy="54" rx="52" ry="14" fill={`url(#rim3d-${id})`} stroke={secondaryHex} strokeWidth="1" />
                <ellipse cx="100" cy="54" rx="46" ry="11.5" fill="none" stroke="#FFFFFF" strokeWidth="2" opacity="0.7" />
              </g>
            )}
          </g>
        )}
      </svg>
    </div>
  );
}

interface PotSelectorProps {
  selectedPot: number;
  onSelectPot: (index: number) => void;
}

export default function PotSelector({ selectedPot, onSelectPot }: PotSelectorProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePots, setActivePots] = useState<PotOption[]>(DEFAULT_POT_OPTIONS);

  const loadActivePots = () => {
    try {
      const saved = localStorage.getItem('plantinum_pots');
      if (saved) {
        const parsed: PotOption[] = JSON.parse(saved);
        const filtered = parsed.filter(
          (p) => p.color !== "Terracotta Red" && p.color !== "White Fluted Column" && p.color !== "Vibrant Orange Ribbed"
        );
        setActivePots(filtered);
      } else {
        setActivePots(DEFAULT_POT_OPTIONS);
      }
    } catch (e) {
      setActivePots(DEFAULT_POT_OPTIONS);
    }
  };

  useEffect(() => {
    loadActivePots();
    const handleUpdate = () => loadActivePots();
    window.addEventListener('plantinum_pots_updated', handleUpdate);
    return () => window.removeEventListener('plantinum_pots_updated', handleUpdate);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const selectedOption = activePots[selectedPot] || activePots[0] || DEFAULT_POT_OPTIONS[0];

  return (
    <div className="w-full">
      {/* Title & Selected Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 text-emerald-800 font-bold">
            <span className="material-symbols-outlined text-[20px]">potted_plant</span>
            <span className="font-label-md text-xs uppercase tracking-widest text-emerald-900">Planter Collection</span>
          </div>
          <h2 className="font-headline-md text-stone-900 font-bold text-xl sm:text-2xl">Choose Your Pot</h2>
        </div>
        
        {/* Selected Pot Pill */}
        <div className="flex items-center gap-2.5 bg-emerald-950/10 text-emerald-950 font-bold px-4 py-2.5 rounded-full text-xs sm:text-sm self-start sm:self-auto border border-emerald-900/20 shadow-xs">
          <span className="material-symbols-outlined text-[18px] text-emerald-700">check_circle</span>
          <span>Selected: <strong>{selectedOption.color}</strong> (+₹{selectedOption.price})</span>
        </div>
      </div>

      {/* Horizontal Carousel Wrapper with Navigation Arrows */}
      <div className="relative group">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 sm:-translate-x-5 z-20 w-10 h-10 rounded-full bg-white text-stone-800 shadow-xl border border-stone-200 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          <span className="material-symbols-outlined text-xl">chevron_left</span>
        </button>

        {/* Carousel Items Container */}
        <div
          ref={carouselRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar py-3 px-1 scroll-p-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {activePots.map((pot, idx) => {
            const isSelected = selectedPot === idx;
            return (
              <div
                key={pot.id}
                onClick={() => onSelectPot(idx)}
                className={`snap-start shrink-0 min-w-[160px] sm:min-w-[180px] w-[160px] sm:w-[180px] rounded-2xl p-3 text-center cursor-pointer transition-all duration-300 group relative flex flex-col items-center justify-between border ${
                  isSelected
                    ? 'bg-emerald-950/5 border-emerald-800 ring-2 ring-emerald-700/40 shadow-xl scale-[1.03] -translate-y-1'
                    : 'bg-white border-stone-200/90 hover:border-emerald-700/60 hover:shadow-lg hover:-translate-y-1'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-2.5 right-2.5 z-10 w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center shadow-md animate-in fade-in zoom-in duration-200">
                    <span className="material-symbols-outlined text-[14px] font-bold">check</span>
                  </span>
                )}

                {/* 3D Studio Product Render Canvas Box */}
                <div className="w-full aspect-square bg-gradient-to-b from-stone-100/80 via-white to-stone-100 rounded-xl mb-3 flex items-center justify-center border border-stone-200/70 shadow-inner overflow-hidden relative">
                  <PotIllustration pot={pot} />
                </div>

                {/* Pot Details */}
                <div className="w-full text-center">
                  <h4 className="font-title-sm text-stone-900 font-bold text-xs sm:text-sm line-clamp-1 group-hover:text-emerald-900 transition-colors">
                    {pot.color}
                  </h4>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    + ₹{pot.price}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 sm:translate-x-5 z-20 w-10 h-10 rounded-full bg-white text-stone-800 shadow-xl border border-stone-200 flex items-center justify-center hover:bg-emerald-900 hover:text-white transition-all cursor-pointer opacity-90 hover:opacity-100"
        >
          <span className="material-symbols-outlined text-xl">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
