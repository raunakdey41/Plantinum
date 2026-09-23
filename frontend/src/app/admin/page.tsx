"use client";

import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-headline-lg text-primary text-3xl font-bold">Dashboard</h1>
        <p className="text-on-surface-variant font-body-md mt-2">Welcome to the Plantinum Admin Portal. Select an option from the sidebar to start managing your store.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">eco</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface font-bold">Total Products</h3>
            <p className="text-3xl font-headline-lg text-primary mt-1">--</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">inventory_2</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface font-bold">Active Bundles</h3>
            <p className="text-3xl font-headline-lg text-secondary mt-1">--</p>
          </div>
        </div>
        
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col gap-4">
          <div className="w-12 h-12 bg-tertiary-container text-on-tertiary-container rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined">shopping_cart</span>
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface font-bold">Recent Orders</h3>
            <p className="text-3xl font-headline-lg text-tertiary mt-1">--</p>
          </div>
        </div>
      </div>
    </div>
  );
}
