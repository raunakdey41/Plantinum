"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type LiveOrder = {
  id: string;
  createdAt: string;
  customerDetails?: {
    fullName: string;
    email: string;
    phone: string;
  };
  items?: any[];
  grandTotal: number;
  status: string;
  paymentDetails?: {
    status: 'unpaid' | 'verifying' | 'paid';
    method?: string;
  };
};

export default function AdminRevenuePage() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const fetchOrders = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'orders'));
      const fetched: LiveOrder[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as LiveOrder);
      });
      
      // Sort orders by createdAt date descending
      fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setOrders(fetched);
    } catch (error) {
      console.error("Error fetching orders for revenue:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Helper to test if date is today
  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0] === todayStr;
  };

  // Helper to test if date is yesterday
  const isYesterday = (dateStr: string) => {
    if (!dateStr) return false;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yStr = y.toISOString().split('T')[0];
    const d = new Date(dateStr);
    return d.toISOString().split('T')[0] === yStr;
  };

  // Helper to test if date is within last N days
  const isWithinDays = (dateStr: string, days: number) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= days;
  };

  // Helper to test if date is in current month
  const isThisMonth = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  // Helper to test if date is in last month
  const isLastMonth = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear();
  };

  // Revenue calculation helpers (Strictly real Firestore data)
  const isConfirmedRevenue = (order: LiveOrder) => {
    return order.status === 'delivered' || order.paymentDetails?.status === 'paid';
  };

  const isProvisionalRevenue = (order: LiveOrder) => {
    return order.status !== 'cancelled' && !isConfirmedRevenue(order);
  };

  // Aggregation Metrics
  let todayConfirmed = 0;
  let todayProvisional = 0;
  let yesterdayConfirmed = 0;

  let weekConfirmed = 0;
  let weekProvisional = 0;
  let lastWeekConfirmed = 0;

  let monthConfirmed = 0;
  let monthProvisional = 0;
  let lastMonthConfirmed = 0;

  let totalAllTimeConfirmed = 0;
  let totalAllTimeProvisional = 0;

  orders.forEach((order) => {
    const amount = Number(order.grandTotal) || 0;
    const dateStr = order.createdAt;

    if (order.status === 'cancelled') return;

    // All Time
    if (isConfirmedRevenue(order)) totalAllTimeConfirmed += amount;
    else if (isProvisionalRevenue(order)) totalAllTimeProvisional += amount;

    // Daily
    if (isToday(dateStr)) {
      if (isConfirmedRevenue(order)) todayConfirmed += amount;
      else if (isProvisionalRevenue(order)) todayProvisional += amount;
    } else if (isYesterday(dateStr)) {
      if (isConfirmedRevenue(order)) yesterdayConfirmed += amount;
    }

    // Weekly (Last 7 Days)
    if (isWithinDays(dateStr, 7)) {
      if (isConfirmedRevenue(order)) weekConfirmed += amount;
      else if (isProvisionalRevenue(order)) weekProvisional += amount;
    } else if (isWithinDays(dateStr, 14)) {
      if (isConfirmedRevenue(order)) lastWeekConfirmed += amount;
    }

    // Monthly
    if (isThisMonth(dateStr)) {
      if (isConfirmedRevenue(order)) monthConfirmed += amount;
      else if (isProvisionalRevenue(order)) monthProvisional += amount;
    } else if (isLastMonth(dateStr)) {
      if (isConfirmedRevenue(order)) lastMonthConfirmed += amount;
    }
  });

  // Daily Breakdown Grouping (Last 7 Days)
  const getDailyBreakdown = () => {
    const daysMap: Record<string, { date: string; confirmed: number; provisional: number; count: number }> = {};
    
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const isoKey = d.toISOString().split('T')[0];
      daysMap[isoKey] = { date: key, confirmed: 0, provisional: 0, count: 0 };
    }

    orders.forEach(order => {
      if (!order.createdAt || order.status === 'cancelled') return;
      const isoKey = new Date(order.createdAt).toISOString().split('T')[0];
      if (daysMap[isoKey]) {
        const amount = Number(order.grandTotal) || 0;
        daysMap[isoKey].count += 1;
        if (isConfirmedRevenue(order)) daysMap[isoKey].confirmed += amount;
        else daysMap[isoKey].provisional += amount;
      }
    });

    return Object.values(daysMap);
  };

  // Monthly Breakdown Grouping
  const getMonthlyBreakdown = () => {
    const monthsMap: Record<string, { month: string; confirmed: number; provisional: number; count: number }> = {};

    orders.forEach(order => {
      if (!order.createdAt || order.status === 'cancelled') return;
      const d = new Date(order.createdAt);
      const key = d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
      
      if (!monthsMap[key]) {
        monthsMap[key] = { month: key, confirmed: 0, provisional: 0, count: 0 };
      }

      const amount = Number(order.grandTotal) || 0;
      monthsMap[key].count += 1;
      if (isConfirmedRevenue(order)) monthsMap[key].confirmed += amount;
      else monthsMap[key].provisional += amount;
    });

    return Object.values(monthsMap);
  };

  const dailyBreakdown = getDailyBreakdown();
  const monthlyBreakdown = getMonthlyBreakdown();

  return (
    <div className="flex flex-col gap-6 h-full pb-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-xl">payments</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-900">Financial Audit &amp; Analytics</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Revenue Analytics</h1>
          <p className="text-on-surface-variant text-sm mt-1">Real-time daily, weekly, and monthly revenue metrics generated strictly from real orders.</p>
        </div>

        <div className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant shadow-2xs">
          <button
            onClick={() => setTimeFilter('daily')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeFilter === 'daily' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Daily View
          </button>
          <button
            onClick={() => setTimeFilter('weekly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeFilter === 'weekly' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Weekly View
          </button>
          <button
            onClick={() => setTimeFilter('monthly')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              timeFilter === 'monthly' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Monthly View
          </button>
        </div>
      </div>

      {/* Main KPI Revenue Cards Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* CARD 1: DAILY REVENUE */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
          timeFilter === 'daily' ? 'bg-surface-container-lowest border-primary ring-1 ring-primary/40' : 'bg-surface-container-lowest border-outline-variant'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-base">today</span>
                <span>Daily Revenue</span>
              </span>
              <span className="text-[10px] font-bold bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full">
                Today
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-on-surface-variant font-medium">Confirmed Delivered Revenue</span>
              <p className="text-3xl font-bold text-primary mt-0.5">₹{todayConfirmed.toLocaleString()}</p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-outline-variant/40">
              <span className="text-on-surface-variant">Provisional Revenue (In Progress):</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                + ₹{todayProvisional.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-on-surface-variant/80 italic">
            Yesterday's Delivered Revenue: <strong className="text-on-surface font-semibold">₹{yesterdayConfirmed.toLocaleString()}</strong>
          </div>
        </div>

        {/* CARD 2: WEEKLY REVENUE */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
          timeFilter === 'weekly' ? 'bg-surface-container-lowest border-primary ring-1 ring-primary/40' : 'bg-surface-container-lowest border-outline-variant'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-base">date_range</span>
                <span>Weekly Revenue</span>
              </span>
              <span className="text-[10px] font-bold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded-full">
                Last 7 Days
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-on-surface-variant font-medium">Confirmed Delivered Revenue</span>
              <p className="text-3xl font-bold text-secondary mt-0.5">₹{weekConfirmed.toLocaleString()}</p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-outline-variant/40">
              <span className="text-on-surface-variant">Provisional Revenue (In Progress):</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                + ₹{weekProvisional.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-on-surface-variant/80 italic">
            Previous Week's Revenue: <strong className="text-on-surface font-semibold">₹{lastWeekConfirmed.toLocaleString()}</strong>
          </div>
        </div>

        {/* CARD 3: MONTHLY REVENUE */}
        <div className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col justify-between ${
          timeFilter === 'monthly' ? 'bg-surface-container-lowest border-primary ring-1 ring-primary/40' : 'bg-surface-container-lowest border-outline-variant'
        }`}>
          <div>
            <div className="flex items-center justify-between border-b border-outline-variant/60 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-base">calendar_month</span>
                <span>Monthly Revenue</span>
              </span>
              <span className="text-[10px] font-bold bg-tertiary-container text-on-tertiary-container px-2 py-0.5 rounded-full">
                This Month
              </span>
            </div>

            <div className="mt-4">
              <span className="text-[11px] text-on-surface-variant font-medium">Confirmed Delivered Revenue</span>
              <p className="text-3xl font-bold text-tertiary mt-0.5">₹{monthConfirmed.toLocaleString()}</p>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-outline-variant/40">
              <span className="text-on-surface-variant">Provisional Revenue (In Progress):</span>
              <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                + ₹{monthProvisional.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-on-surface-variant/80 italic">
            Last Month's Delivered Revenue: <strong className="text-on-surface font-semibold">₹{lastMonthConfirmed.toLocaleString()}</strong>
          </div>
        </div>

      </div>

      {/* Confirmed vs Provisional Explanation Banner */}
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">verified</span>
          </div>
          <div>
            <h4 className="font-bold text-on-surface text-xs sm:text-sm">Revenue Accounting Classification Rule</h4>
            <p className="text-[11px] text-on-surface-variant">
              <strong>Confirmed Revenue</strong> includes paid/delivered items. <strong>Provisional Revenue</strong> tracks pending/processing items before delivery.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 shrink-0 text-xs font-bold">
          <span className="text-emerald-900 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Total Confirmed All-Time: ₹{totalAllTimeConfirmed.toLocaleString()}
          </span>
          <span className="text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Total Provisional All-Time: ₹{totalAllTimeProvisional.toLocaleString()}
          </span>
        </div>
      </div>

      {/* TIME-FILTERED REVENUE BREAKDOWN TABLE */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant flex flex-col overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">table_chart</span>
            <h3 className="font-bold text-on-surface text-sm">
              {timeFilter === 'daily' ? 'Daily Revenue Breakdown (Last 7 Days)' : timeFilter === 'weekly' ? 'Weekly Revenue Trends' : 'Monthly Historical Revenue Breakdown'}
            </h3>
          </div>
          <span className="text-xs text-on-surface-variant font-bold">Real Order Audits</span>
        </div>

        <div className="overflow-auto max-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-low shadow-2xs">
              <tr className="border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-3.5">Time Period</th>
                <th className="p-3.5">Total Orders</th>
                <th className="p-3.5">Confirmed Delivered Revenue</th>
                <th className="p-3.5">Provisional Pending Revenue</th>
                <th className="p-3.5">Total Period Volume</th>
              </tr>
            </thead>
            <tbody>
              {timeFilter === 'daily' && dailyBreakdown.map((row, idx) => (
                <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                  <td className="p-3.5 font-bold text-on-surface">📅 {row.date}</td>
                  <td className="p-3.5 font-semibold text-on-surface">{row.count} Orders</td>
                  <td className="p-3.5 font-bold text-emerald-900">₹{row.confirmed.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-amber-800">₹{row.provisional.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-primary">₹{(row.confirmed + row.provisional).toLocaleString()}</td>
                </tr>
              ))}

              {timeFilter === 'monthly' && monthlyBreakdown.map((row, idx) => (
                <tr key={idx} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                  <td className="p-3.5 font-bold text-on-surface">📆 {row.month}</td>
                  <td className="p-3.5 font-semibold text-on-surface">{row.count} Orders</td>
                  <td className="p-3.5 font-bold text-emerald-900">₹{row.confirmed.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-amber-800">₹{row.provisional.toLocaleString()}</td>
                  <td className="p-3.5 font-bold text-primary">₹{(row.confirmed + row.provisional).toLocaleString()}</td>
                </tr>
              ))}

              {timeFilter === 'weekly' && (
                <>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                    <td className="p-3.5 font-bold text-on-surface">Current Week (Last 7 Days)</td>
                    <td className="p-3.5 font-semibold text-on-surface">
                      {orders.filter(o => isWithinDays(o.createdAt, 7) && o.status !== 'cancelled').length} Orders
                    </td>
                    <td className="p-3.5 font-bold text-emerald-900">₹{weekConfirmed.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-amber-800">₹{weekProvisional.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-primary">₹{(weekConfirmed + weekProvisional).toLocaleString()}</td>
                  </tr>
                  <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                    <td className="p-3.5 font-bold text-on-surface">Previous Week (Days 8-14)</td>
                    <td className="p-3.5 font-semibold text-on-surface">
                      {orders.filter(o => isWithinDays(o.createdAt, 14) && !isWithinDays(o.createdAt, 7) && o.status !== 'cancelled').length} Orders
                    </td>
                    <td className="p-3.5 font-bold text-emerald-900">₹{lastWeekConfirmed.toLocaleString()}</td>
                    <td className="p-3.5 font-bold text-amber-800">₹0</td>
                    <td className="p-3.5 font-bold text-primary">₹{lastWeekConfirmed.toLocaleString()}</td>
                  </tr>
                </>
              )}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-on-surface-variant text-xs italic">
                    No order transactions recorded in Firestore yet. As customers place real orders, revenue trends will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECENT REAL ORDERS FINANCIAL AUDIT LOG */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant flex flex-col overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">receipt_long</span>
            <h3 className="font-bold text-on-surface text-sm">Real Customer Order Financial Audit Log</h3>
          </div>
          <span className="text-xs text-on-surface-variant">{orders.length} Total Orders Recorded</span>
        </div>

        <div className="overflow-auto max-h-[500px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-surface-container-low shadow-2xs">
              <tr className="border-b border-outline-variant text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Date &amp; Time</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Order Amount</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Order Status</th>
                <th className="p-3.5">Revenue Audit Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const isConfirmed = isConfirmedRevenue(order);
                const isCancelled = order.status === 'cancelled';
                
                return (
                  <tr key={order.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                    <td className="p-3.5 font-bold font-mono text-primary">#{order.id}</td>
                    <td className="p-3.5 text-on-surface-variant">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-on-surface">{order.customerDetails?.fullName || 'Customer'}</p>
                      <p className="text-[10px] text-on-surface-variant">{order.customerDetails?.email || 'N/A'}</p>
                    </td>
                    <td className="p-3.5 font-bold text-on-surface text-sm">₹{order.grandTotal || 0}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.paymentDetails?.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : order.paymentDetails?.status === 'verifying'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-100 text-stone-700 border border-stone-300'
                      }`}>
                        {order.paymentDetails?.status || 'unpaid'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-xs font-semibold capitalize text-on-surface">
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3.5">
                      {isCancelled ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 text-stone-500 border border-stone-200">
                          🚫 Cancelled (No Revenue)
                        </span>
                      ) : isConfirmed ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          ✅ Confirmed Revenue
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          ⏳ Provisional Revenue
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-on-surface-variant text-xs italic">
                    No customer orders found in Firestore database. When customers place orders and pay, detailed financial audit logs will appear here automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
