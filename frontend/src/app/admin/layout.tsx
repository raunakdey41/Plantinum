"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      const isAdmin = currentUser?.email === 'plantinumindia@outlook.com';

      // If no user is logged in, and we're not on the login page, redirect to login
      if (!currentUser && pathname !== '/admin/login') {
        router.push('/admin/login');
      } 
      // If user is logged in but NOT the admin, sign them out and redirect
      else if (currentUser && !isAdmin) {
        await signOut(auth);
        router.push('/admin/login?error=unauthorized');
      }
      // If admin is logged in and tries to access login page, redirect to admin dashboard
      else if (currentUser && isAdmin && pathname === '/admin/login') {
        router.push('/admin');
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-surface-container">
      <span className="material-symbols-outlined animate-spin text-4xl text-primary">refresh</span>
    </div>;
  }

  // Render just the children if it's the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Render the admin layout for authenticated routes
  return (
    <div className="h-screen flex bg-surface-container-low overflow-hidden">
      
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`w-64 bg-surface-container-lowest border-r border-outline-variant flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 pb-2 border-b border-outline-variant flex justify-between items-center">
          <h2 className="font-headline-sm text-primary font-bold">Admin Portal</h2>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-on-surface-variant hover:text-error">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname === '/admin' ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>
          <Link href="/admin/products" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname.includes('/admin/products') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">eco</span>
            Products
          </Link>
          <Link href="/admin/filters" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname.includes('/admin/filters') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">tune</span>
            Filters & Categories
          </Link>
          <Link href="/admin/bundles" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname.includes('/admin/bundles') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">inventory_2</span>
            Bundles
          </Link>
          <Link href="/admin/pots" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname.includes('/admin/pots') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">potted_plant</span>
            Pots & Planters
          </Link>
          <Link href="/admin/revenue" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-md transition-colors ${pathname.includes('/admin/revenue') ? 'bg-primary-container text-on-primary-container' : 'text-on-surface hover:bg-surface-container'}`}>
            <span className="material-symbols-outlined">payments</span>
            Revenue Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center gap-3 px-4 py-3 rounded-lg font-label-md text-error hover:bg-error-container w-full transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-6 overflow-y-auto z-10 relative bg-surface-container-low h-full flex flex-col w-full">
        <div className="lg:hidden flex items-center mb-4 gap-4 pb-4 border-b border-outline-variant">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-on-surface-variant hover:text-primary cursor-pointer">
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h2 className="font-headline-sm text-primary font-bold">Admin Portal</h2>
        </div>
        {children}
      </main>
    </div>
  );
}
