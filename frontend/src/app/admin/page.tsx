"use client";

import React, { useState } from 'react';
import { useStore, LiveOrder, OrderStatus, PresetMessageRule } from '@/context/StoreContext';

export default function AdminDashboard() {
  const { 
    liveOrders, 
    updateOrderStatus, 
    presetRules, 
    updatePresetRules 
  } = useStore();

  const [activeTab, setActiveTab] = useState<'orders' | 'preset_messages'>('orders');
  const [editingRules, setEditingRules] = useState<PresetMessageRule[]>(presetRules);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<LiveOrder | null>(null);

  // Status Filter for Orders Queue
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const pendingApprovalCount = liveOrders.filter(o => o.status === 'pending_approval').length;
  const paymentSubmittedCount = liveOrders.filter(o => o.status === 'payment_submitted').length;
  const completedCount = liveOrders.filter(o => o.status === 'delivered').length;

  // Provisional Revenue: Pending, payment requested, payment submitted, processing, dispatched orders
  const provisionalRevenue = liveOrders
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  // Realized Revenue: Strictly delivered orders only
  const realizedRevenue = liveOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.grandTotal || 0), 0);

  const filteredOrders = liveOrders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return o.status === 'pending_approval' || o.status === 'payment_requested' || o.status === 'payment_submitted';
    if (filterStatus === 'active') return o.status === 'processing' || o.status === 'dispatched';
    if (filterStatus === 'completed') return o.status === 'delivered';
    return true;
  });

  const handleSavePresetRules = (e: React.FormEvent) => {
    e.preventDefault();
    updatePresetRules(editingRules);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const getStatusBadgeStyle = (status: OrderStatus) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'payment_requested':
        return 'bg-blue-100 text-blue-900 border-blue-300';
      case 'payment_submitted':
        return 'bg-purple-100 text-purple-900 border-purple-300 animate-pulse';
      case 'processing':
        return 'bg-emerald-100 text-emerald-900 border-emerald-300';
      case 'dispatched':
        return 'bg-indigo-100 text-indigo-900 border-indigo-300';
      case 'delivered':
        return 'bg-emerald-950 text-white border-emerald-900';
      case 'cancelled':
        return 'bg-red-100 text-red-900 border-red-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-300';
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'pending_approval': return 'Pending Admin Approval';
      case 'payment_requested': return 'GPay QR Sent (Awaiting Payment)';
      case 'payment_submitted': return 'UTR Submitted (Verification Required)';
      case 'processing': return 'Payment Verified (Packaging)';
      case 'dispatched': return 'In Transit (Dispatched)';
      case 'delivered': return 'Delivered & Stock Deducted';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8 pb-12 relative">
      {/* 1. STATIC TOP HEADER (Pins to very top edge of scroll container) */}
      <div className="sticky -top-4 lg:-top-6 z-30 bg-[#f5f5f0] -mt-4 lg:-mt-6 pt-4 lg:pt-6 pb-4 border-b border-stone-300/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-900">Real-Time Control Center</span>
          </div>
          <h1 className="font-headline-lg text-stone-900 text-2xl md:text-3xl font-bold">Admin Order &amp; Preset Message Portal</h1>
        </div>

        <div className="flex items-center gap-2 bg-stone-200/70 p-1.5 rounded-2xl border border-stone-300 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orders' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Live Orders Queue ({liveOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preset_messages')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'preset_messages' ? 'bg-emerald-900 text-white shadow-md' : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            Chat Preset Messages Rules
          </button>
        </div>
      </div>

      {/* Real-time Metric Badges (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-amber-50/80 p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Requires Approval</span>
            <span className="material-symbols-outlined text-amber-800 text-xl">notifications_active</span>
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">{pendingApprovalCount}</p>
          <p className="text-[11px] text-amber-800 mt-1">Pending GPay QR approval</p>
        </div>

        <div className="bg-purple-50/80 p-4 rounded-2xl border border-purple-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-900">UTR Submitted</span>
            <span className="material-symbols-outlined text-purple-800 text-xl">verified_user</span>
          </div>
          <p className="text-2xl font-bold text-purple-950 mt-2">{paymentSubmittedCount}</p>
          <p className="text-[11px] text-purple-800 mt-1">Awaiting payment check</p>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900">Completed Orders</span>
            <span className="material-symbols-outlined text-emerald-800 text-xl">task_alt</span>
          </div>
          <p className="text-2xl font-bold text-emerald-950 mt-2">{completedCount}</p>
          <p className="text-[11px] text-emerald-800 mt-1">Delivered &amp; auto-deducted</p>
        </div>

        <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-900">Provisional Revenue</span>
            <span className="material-symbols-outlined text-blue-700 text-xl">hourglass_top</span>
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">₹{provisionalRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-blue-800 mt-1">Pending &amp; in-transit pipeline</p>
        </div>

        <div className="bg-stone-900 text-white p-4 rounded-2xl border border-stone-800 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-300">Realized Revenue</span>
            <span className="material-symbols-outlined text-emerald-400 text-xl">payments</span>
          </div>
          <p className="text-2xl font-bold text-white mt-2">₹{realizedRevenue.toLocaleString('en-IN')}</p>
          <p className="text-[11px] text-stone-400 mt-1">Strictly delivered orders only</p>
        </div>
      </div>

      {/* TAB 1: LIVE ORDERS QUEUE */}
      {activeTab === 'orders' && (
        <div className="flex flex-col gap-6">
          {/* 2. SUB-HEADER FOR ORDERS QUEUE (Sticks right below top header when scrolled up) */}
          <div className="sticky top-[68px] md:top-[74px] z-20 bg-[#f5f5f0] py-3.5 border-b border-stone-300/80 flex items-center justify-between flex-wrap gap-3 shadow-2xs">
            <h2 className="font-bold text-lg text-stone-900">Incoming Orders Queue</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-500">Filter:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-white border border-stone-300 text-stone-800 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="all">All Orders ({liveOrders.length})</option>
                <option value="pending">Pending Approval / Payment ({pendingApprovalCount + paymentSubmittedCount})</option>
                <option value="active">Active Packaging / Shipping</option>
                <option value="completed">Completed / Delivered ({completedCount})</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-5xl text-stone-300">inbox</span>
              <p className="font-bold text-base text-stone-800">No matching orders found</p>
              <p className="text-xs text-stone-500">Customer orders placed on the storefront will appear here instantly in real-time.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 flex flex-col gap-5 relative overflow-hidden">
                  
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-lg text-emerald-950">#{order.id}</span>
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusBadgeStyle(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 font-medium mt-1">Placed on: {new Date(order.createdAt).toLocaleString()}</p>
                    </div>

                    <div className="text-right self-start sm:self-auto">
                      <p className="text-xs text-stone-500 font-medium">Grand Total</p>
                      <p className="text-2xl font-bold text-emerald-900">₹{order.grandTotal.toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  {/* Customer Info & Order Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Customer Details Box */}
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/80 text-xs flex flex-col gap-2">
                      <p className="font-bold text-stone-400 uppercase tracking-wider">Customer &amp; Address Details</p>
                      <div className="space-y-1 text-stone-800 font-semibold">
                        <p><strong className="text-stone-900">Name:</strong> {order.customerDetails.fullName}</p>
                        <p><strong className="text-stone-900">Phone:</strong> {order.customerDetails.phone}</p>
                        <p className="flex items-center gap-1.5 text-emerald-900">
                          <span className="material-symbols-outlined text-xs">lock</span>
                          <strong>Account Email:</strong> {order.customerDetails.email}
                        </p>
                        <p><strong className="text-stone-900">Delivery Address:</strong> {order.customerDetails.address}, PIN: {order.customerDetails.pinCode}</p>
                      </div>

                      {order.paymentDetails.utrNumber && (
                        <div className="mt-2 p-2.5 bg-purple-100 border border-purple-300 rounded-xl text-purple-950 font-bold flex items-center justify-between">
                          <span>Submitted UTR: {order.paymentDetails.utrNumber}</span>
                          <button 
                            type="button"
                            onClick={() => navigator.clipboard.writeText(order.paymentDetails.utrNumber || '')}
                            className="text-[10px] bg-purple-950 text-white px-2 py-1 rounded cursor-pointer"
                          >
                            Copy UTR
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Order Items List */}
                    <div className="border border-stone-200 rounded-2xl overflow-hidden text-xs">
                      <div className="px-4 py-2 bg-stone-100 font-bold text-stone-700 uppercase tracking-wider border-b border-stone-200">
                        Purchased Items ({order.items.length})
                      </div>
                      <div className="divide-y divide-stone-100 max-h-48 overflow-y-auto">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="p-3 flex items-center gap-3">
                            <img src={item.image || '/logo_emblem.jpg'} alt={item.name} className="w-10 h-10 object-cover rounded-lg bg-stone-100" />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-stone-900 truncate">{item.name}</p>
                              {item.potColor && <p className="text-[10px] text-emerald-800">Pot: {item.potColor}</p>}
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-stone-900">x{item.quantity}</p>
                              <p className="text-stone-600">{item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ADMIN ACTION CONTROLS */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 bg-stone-50/50 p-4 rounded-2xl">
                    <span className="text-xs font-bold text-stone-600">Admin Actions:</span>

                    <div className="flex items-center gap-2.5 flex-wrap">
                      {order.status === 'pending_approval' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'payment_requested')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-950 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">qr_code_2</span>
                          <span>Approve &amp; Send GPay QR to Chat</span>
                        </button>
                      )}

                      {order.status === 'payment_submitted' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'processing')}
                          className="px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-950 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">verified</span>
                          <span>Verify UTR &amp; Mark Paid (Packaging)</span>
                        </button>
                      )}

                      {(order.status === 'processing' || order.status === 'payment_requested') && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'dispatched')}
                          className="px-4 py-2.5 rounded-xl bg-indigo-800 hover:bg-indigo-950 text-white font-bold text-xs shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">local_shipping</span>
                          <span>Mark Dispatched</span>
                        </button>
                      )}

                      {order.status === 'dispatched' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-5 py-2.5 rounded-xl bg-emerald-950 hover:bg-black text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <span className="material-symbols-outlined text-sm">inventory_2</span>
                          <span>Mark Delivered &amp; Auto-Deduct Stock</span>
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'delivered' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="px-3.5 py-2 rounded-xl border border-red-300 text-red-800 font-bold text-xs hover:bg-red-50 cursor-pointer"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRESET MESSAGE RULES ENGINE */}
      {activeTab === 'preset_messages' && (
        <form onSubmit={handleSavePresetRules} className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 flex flex-col gap-6 shadow-sm">
          {/* 2. SUB-HEADER FOR PRESET MESSAGES (Sticks right below top header when scrolled up) */}
          <div className="sticky top-[68px] md:top-[74px] z-20 bg-white py-3 border-b border-stone-200 shadow-2xs">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Automated Conditional Messaging Engine
            </span>
            <h2 className="font-headline-md text-stone-900 text-xl md:text-2xl font-bold mt-2">
              Customize Chat Messages by Event Condition
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Define the template text sent to the customer chatbox when order conditions change. Click any variable chip below to insert it into your message template.
            </p>
          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-100 text-emerald-950 rounded-2xl border border-emerald-300 font-bold text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base">check_circle</span>
              <span>Preset message rules saved successfully!</span>
            </div>
          )}

          {/* Rules List Container */}
          <div className="space-y-5">
            {editingRules.map((rule, index) => {
              let vars = [
                { key: '{fullName}', label: 'Customer Name' },
                { key: '{orderId}', label: 'Order ID' }
              ];

              if (rule.condition === 'on_order_approved') {
                vars.push({ key: '{grandTotal}', label: 'Grand Total' });
              } else if (rule.condition === 'on_payment_received') {
                vars.push({ key: '{utrNumber}', label: 'UTR Ref No.' });
              } else if (rule.condition === 'on_dispatched') {
                vars.push({ key: '{trackingNumber}', label: 'Tracking Code' });
              }

              return (
                <div key={rule.id} className="p-5 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-3 py-1 rounded-lg self-start">
                      Event Condition: {rule.condition.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-stone-600">{rule.title}</span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700">Automated Message Template</label>
                      <span className="text-[10px] text-stone-400 font-medium">Click chip to insert variable</span>
                    </div>

                    <textarea
                      rows={2}
                      value={rule.messageTemplate}
                      onChange={(e) => {
                        const updated = [...editingRules];
                        updated[index].messageTemplate = e.target.value;
                        setEditingRules(updated);
                      }}
                      className="p-3 bg-white border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />

                    {/* Interactive Clickable Variable Chips */}
                    <div className="flex items-center gap-2 flex-wrap mt-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">Insert Variable:</span>
                      {vars.map(v => (
                        <button
                          key={v.key}
                          type="button"
                          onClick={() => {
                            const updated = [...editingRules];
                            updated[index].messageTemplate = (updated[index].messageTemplate + ` ${v.key}`).trim();
                            setEditingRules(updated);
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 hover:border-emerald-500 rounded-lg text-xs font-mono font-bold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
                          title={`Click to insert ${v.label}`}
                        >
                          <span className="text-emerald-700 text-xs font-bold">+</span>
                          <span>{v.key}</span>
                          <span className="text-[10px] font-normal text-stone-500 font-sans">({v.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">save</span>
              <span>Save Preset Message Rules</span>
            </button>
          </div>
        </form>
      )}

    </div>
  );
}

