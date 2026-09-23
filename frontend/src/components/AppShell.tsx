"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Footer from './Footer';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isAdmin = pathname.startsWith('/admin');

  return (
    <>
      {!isAdmin && <Header />}
      <main className={`w-full min-h-screen ${!isHomePage && !isAdmin ? 'pt-[130px] lg:pt-[150px] bg-surface' : ''}`}>
        <div className="flex flex-col w-full">
          {children}
        </div>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}
