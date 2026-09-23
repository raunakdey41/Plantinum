"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      <footer className="w-full bg-surface-container-low text-on-surface mt-space-2xl">
        <div className="bg-primary-container text-on-primary py-space-xl px-gutter-mobile lg:px-margin">
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="material-symbols-outlined text-tertiary-fixed text-4xl mb-2">local_florist</span>
            <h3 className="font-headline-md text-headline-md text-on-primary mb-space-xs">Join the Plantinum Circle</h3>
            <p className="font-body-md text-body-md text-on-primary-container max-w-xl mb-space-lg">Cultivate a greener sanctuary. Receive curated plant guides, seasonal repotting calendars &amp; private collection botanical access.</p>
            <form className="flex flex-col sm:flex-row w-full max-w-md gap-2" suppressHydrationWarning>
              <input type="email" placeholder="Enter your personal email..." className="flex-1 px-4 py-3 rounded-lg bg-surface-container-lowest text-on-surface text-body-sm font-body-sm placeholder:text-outline focus:outline-none" suppressHydrationWarning />
              <button type="button" className="px-6 py-3 bg-secondary text-on-secondary font-label-md text-label-md rounded-lg hover:bg-secondary-fixed hover:text-on-secondary-fixed transition-colors font-bold uppercase tracking-wider">Subscribe</button>
            </form>
            <p className="text-label-sm font-label-sm text-on-primary-container/80 mt-space-sm">Zero spam. Handcrafted botanical wisdom directly to your inbox.</p>
          </div>
        </div>
        <div className="w-full px-gutter-mobile lg:px-margin py-space-xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-space-xl gap-x-gutter">
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-primary font-bold tracking-tight">Shop Botanicals</h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><Link href="/shop/indoor-plants">Indoor Plants</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Outdoor Flowering</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Rare Aroid Collection</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Desk &amp; Table Greens</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Pet-Safe Sanctuaries</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Bonsai &amp; Ficus</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-primary font-bold tracking-tight">Planters &amp; Styling</h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><Link href="#">Italian Ceramic</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Self-Watering Pots</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Handcrafted Brass</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Minimalist Fiberstone</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Wall &amp; Railing Planters</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-primary font-bold tracking-tight">Plant Health &amp; Care</h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><Link href="#">Organic Soil Blends</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Micro-Nutrient Elixirs</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Leaf Tonics &amp; Shiners</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Moisture &amp; pH Meters</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Repotting Accessories</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-space-sm">
            <h4 className="font-title-md text-title-md text-primary font-bold tracking-tight">Plantinum Experience</h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><Link href="/">About Our Greenhouses</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="#">Plant Doctor Consultation</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Corporate Green Gifting</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Sustainable Packaging</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Garden &amp; Terrace Styling</Link></li>
            </ul>
          </div>
          <div className="flex flex-col gap-space-sm col-span-2 sm:col-span-1">
            <h4 className="font-title-md text-title-md text-primary font-bold tracking-tight">Customer Care</h4>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              <li className="hover:text-primary transition-colors"><Link href="#">Track My Consignment</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Pan-India Delivery Policy</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">7-Day Health Guarantee</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Returns &amp; Replacements</Link></li>
              <li className="hover:text-primary transition-colors"><Link href="/">Frequently Asked Questions</Link></li>
            </ul>
          </div>
        </div>
        <div className="hidden md:block w-full py-space-md bg-surface-container overflow-hidden">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
            .animate-marquee {
              animation: marquee 30s linear infinite;
            }
          `}</style>
          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex shrink-0 gap-8 md:gap-16 px-4 md:px-8 items-center">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">verified_user</span>
                  <div className="text-left">
                    <p className="font-label-md text-label-md text-primary font-bold">100% Transit Safe</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Triple-cushioned delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">eco</span>
                  <div className="text-left">
                    <p className="font-label-md text-label-md text-primary font-bold">7-Day Health Guarantee</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Free replacement if damaged</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">support_agent</span>
                  <div className="text-left">
                    <p className="font-label-md text-label-md text-primary font-bold">Horticulturalist Support</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Lifetime free plant advice</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary text-2xl">local_shipping</span>
                  <div className="text-left">
                    <p className="font-label-md text-label-md text-primary font-bold">Pan-India Fast Courier</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Delivered within 2-4 days</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full px-gutter-mobile lg:px-margin py-space-md flex flex-col md:flex-row items-center justify-center font-body-sm text-body-sm text-on-surface-variant">
          <div>© 2025 Plantinum Botanicals LLP. Crafted for Green Sanctuaries.</div>
        </div>
      </footer>
    </>
  );
}
