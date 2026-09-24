"use client";

import React, { useEffect, useState } from 'react';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order } from '@/context/StoreContext';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [productCount, setProductCount] = useState<number>(0);
  const [bundleCount, setBundleCount] = useState<number>(0);
  const [potCount, setPotCount] = useState<number>(0);

  const fetchDashboardMetrics = async () => {
    setLoading(true);
    let fetchedOrders: Order[] = [];

    // 1. Fetch real orders from Firestore
    try {
      const ordersSnap = await getDocs(collection(db, 'orders'));
      ordersSnap.forEach((docSnap) => {
        fetchedOrders.push({ id: docSnap.id, ...docSnap.data() } as Order);
      });
    } catch (e) {
      console.error("Error fetching Firestore orders:", e);
    }

    // 2. Merge with localStorage orders if any were placed locally
    try {
      const localSaved = localStorage.getItem('plantinum_orders');
      if (localSaved) {
        const localOrders: Order[] = JSON.parse(localSaved);
        localOrders.forEach((locOrd) => {
          if (!fetchedOrders.some((o) => o.id === locOrd.id)) {
            fetchedOrders.push(locOrd);
          }
        });
      }
    } catch (e) {
      console.error("Error reading localStorage orders:", e);
    }

    setOrders(fetchedOrders);

    // 3. Fetch product count
    try {
      const productsSnap = await getCountFromServer(collection(db, 'products'));
      setProductCount(productsSnap.data().count);
    } catch (e) {
      setProductCount(0);
    }

    // 4. Fetch bundle count
    try {
      const bundlesSnap = await getCountFromServer(collection(db, 'bundles'));
      setBundleCount(bundlesSnap.data().count);
    } catch (e) {
      setBundleCount(0);
    }

    // 5. Fetch pots count from localStorage
    try {
      const savedPots = localStorage.getItem('plantinum_pots');
      if (savedPots) {
        const potsArr = JSON.parse(savedPots);
        setPotCount(potsArr.length);
      } else {
        setPotCount(12);
      }
    } catch (e) {
      setPotCount(12);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, []);

  // Compute Live Metrics from real orders data
  const totalOrdersReceived = orders.length;
  const ordersCompleted = orders.filter((o) => o.status === 'Delivered' || o.currentStep === 5).length;
  const ordersInTransit = orders.filter((o) => o.status !== 'Delivered' && o.currentStep < 5).length;
  const totalEarnings = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const avgOrderValue = totalOrdersReceived > 0 ? Math.round(totalEarnings / totalOrdersReceived) : 0;

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-8">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-xl">insights</span>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Store Performance</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Store Dashboard</h1>
          <p className="text-on-surface-variant text-sm mt-1">Real-time overview of orders received, completions, and store earnings.</p>
        </div>

        <button
          onClick={fetchDashboardMetrics}
          className="self-start md:self-auto px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline-variant rounded-xl text-xs font-bold text-on-surface flex items-center gap-2 transition-colors"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Main Analytics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Card 1: Orders Received */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Orders Received</span>
            <div className="w-10 h-10 bg-primary-container/60 text-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">shopping_bag</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-headline-lg text-primary font-bold">
              {loading ? '--' : totalOrdersReceived}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Total customer orders placed</p>
          </div>
        </div>

        {/* Card 2: Orders Completed */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Orders Completed</span>
            <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">task_alt</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-headline-lg text-emerald-800 font-bold">
              {loading ? '--' : ordersCompleted}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Successfully delivered to customers</p>
          </div>
        </div>

        {/* Card 3: Total Earnings / Revenue */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Gross Earnings</span>
            <div className="w-10 h-10 bg-secondary-container/60 text-secondary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">payments</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-headline-lg text-secondary font-bold">
              {loading ? '--' : `₹${totalEarnings.toLocaleString('en-IN')}`}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Combined order revenues</p>
          </div>
        </div>

        {/* Card 4: In Transit / Active Orders */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant shadow-sm flex flex-col justify-between gap-4 relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Active / In Transit</span>
            <div className="w-10 h-10 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-headline-lg text-amber-800 font-bold">
              {loading ? '--' : ordersInTransit}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">Orders being packaged or shipped</p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Bar: AOV & Inventory Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">analytics</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Avg Order Value</p>
            <p className="text-sm font-bold text-on-surface">₹{avgOrderValue.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-lg">eco</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Products</p>
            <p className="text-sm font-bold text-on-surface">{productCount} items</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-lg">inventory_2</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Bundles</p>
            <p className="text-sm font-bold text-on-surface">{bundleCount} catalog</p>
          </div>
        </div>

        <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-emerald-800">
            <span className="material-symbols-outlined text-lg">potted_plant</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pots Atelier</p>
            <p className="text-sm font-bold text-on-surface">{potCount} designs</p>
          </div>
        </div>
      </div>

      {/* Real Recent Orders Table */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant flex flex-col overflow-hidden">
        <div className="p-5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
            <h3 className="font-title-md font-bold text-on-surface">Recent Customer Orders</h3>
          </div>
          <span className="text-xs text-on-surface-variant font-bold bg-surface-container px-3 py-1 rounded-full">
            {orders.length} Total Records
          </span>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant text-sm">
              Loading recent orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-on-surface-variant flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-outline">shopping_bag</span>
              <p className="font-bold text-base text-on-surface">No orders received yet</p>
              <p className="text-xs text-on-surface-variant max-w-sm">
                Orders placed by customers on the Plantinum storefront will appear here automatically with earnings and status metrics.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const isCompleted = order.status === 'Delivered' || order.currentStep === 5;
                  return (
                    <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-sm text-primary">
                        {order.id}
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant font-bold">
                        {order.date}
                      </td>
                      <td className="p-4 text-xs font-bold text-on-surface">
                        {order.deliveryLocation || 'Standard Delivery'}
                      </td>
                      <td className="p-4 text-xs text-on-surface-variant font-bold">
                        {order.items?.length || 0} item(s)
                      </td>
                      <td className="p-4 text-sm font-bold text-on-surface">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {order.status || 'In Transit'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
