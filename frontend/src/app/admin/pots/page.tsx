"use client";

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { POT_OPTIONS as INITIAL_POTS, PotOption, PotIllustration } from '@/components/PotSelector';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminPotsPage() {
  const [pots, setPots] = useState<PotOption[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<PotOption | null>(null);

  // Search State
  const [potSearchQuery, setPotSearchQuery] = useState('');

  // Pexels Dialog Modal State
  const [isPexelsModalOpen, setIsPexelsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out the 3 removed pots by default (without fake numbers)
  const FILTERED_INITIAL_POTS: PotOption[] = INITIAL_POTS
    .filter((p) => p.color !== "Terracotta Red" && p.color !== "White Fluted Column" && p.color !== "Vibrant Orange Ribbed")
    .map((p) => ({
      ...p,
      stock: p.stock !== undefined ? p.stock : 50,
      soldCount: p.soldCount !== undefined ? p.soldCount : 0
    }));

  // Form state for adding/editing pot
  const [formData, setFormData] = useState<Partial<PotOption>>({
    color: '',
    price: 499,
    stock: 50,
    soldCount: 0,
    patternType: 'smooth',
    bgHex: '#4B5563',
    secondaryHex: '#1F2937',
    lightHex: '#9CA3AF',
    imageUrl: '',
    hasCollar: false
  });

  // Stylized Modal State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const closeConfirmModal = () => {
    setConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const showAlert = (title: string, message: string, type: 'danger' | 'warning' | 'info' = 'warning') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmText: 'OK',
      cancelText: '',
      type,
      onConfirm: closeConfirmModal,
    });
  };

  const loadData = async () => {
    try {
      // 1. Fetch real orders from Firestore to count real pot sales
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ords: any[] = [];
      ordersSnap.forEach((docSnap) => {
        ords.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOrders(ords);

      // 2. Load pots from localStorage or defaults
      const saved = localStorage.getItem('plantinum_pots');
      if (saved) {
        const parsed = JSON.parse(saved);
        const normalized = parsed.map((p: any) => ({
          ...p,
          stock: p.stock !== undefined ? p.stock : 50,
          soldCount: (p.soldCount === 28 || p.soldCount === 42 || p.soldCount === 16) ? 0 : (p.soldCount || 0)
        }));
        setPots(normalized);
        localStorage.setItem('plantinum_pots', JSON.stringify(normalized));
      } else {
        setPots(FILTERED_INITIAL_POTS);
        localStorage.setItem('plantinum_pots', JSON.stringify(FILTERED_INITIAL_POTS));
      }
    } catch (e) {
      console.error("Error loading pots/orders data:", e);
      setPots(FILTERED_INITIAL_POTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const savePotsToStorage = (updatedPots: PotOption[]) => {
    setPots(updatedPots);
    localStorage.setItem('plantinum_pots', JSON.stringify(updatedPots));
    window.dispatchEvent(new Event('plantinum_pots_updated'));
  };

  // Calculate real sold count for a pot from live Firestore orders
  const getRealPotSales = (pot: PotOption) => {
    let realSalesFromOrders = 0;
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        const itemPotColor = (item.potColor || '').toLowerCase();
        const itemName = (item.name || '').toLowerCase();
        const potColorName = pot.color.toLowerCase();
        if (itemPotColor.includes(potColorName) || itemName.includes(potColorName)) {
          realSalesFromOrders += (item.quantity || 1);
        }
      });
    });

    // Combined with any manual soldCount explicitly set by admin in pot editor
    return (pot.soldCount || 0) + realSalesFromOrders;
  };

  const handleOpenModal = (pot: PotOption | null = null) => {
    setSearchResults([]);
    setIsPexelsModalOpen(false);
    if (pot) {
      setEditingPot(pot);
      setFormData({ 
        ...pot,
        stock: pot.stock !== undefined ? pot.stock : 50,
        soldCount: pot.soldCount !== undefined ? pot.soldCount : 0
      });
      setSearchQuery(pot.color || '');
    } else {
      setEditingPot(null);
      setFormData({
        color: '',
        price: 499,
        stock: 50,
        soldCount: 0,
        patternType: 'smooth',
        bgHex: '#3B82F6',
        secondaryHex: '#1D4ED8',
        lightHex: '#93C5FD',
        imageUrl: '',
        hasCollar: false
      });
      setSearchQuery('');
    }
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `pots/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      setFormData(prev => ({
        ...prev,
        imageUrl: downloadURL
      }));
    } catch (err) {
      console.error("Upload failed", err);
      showAlert("Upload Failed", "Failed to upload pot image.", "danger");
    } finally {
      setUploading(false);
    }
  };

  const searchPexelsPots = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.toLowerCase().includes('pot') || searchQuery.toLowerCase().includes('planter')
      ? searchQuery.trim()
      : `${searchQuery.trim()} planter pot`;

    setIsSearching(true);
    setIsPexelsModalOpen(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setSearchResults(data.images);
      } else if (data.error) {
        showAlert("Search Error", `Pexels Search Error: ${data.error}`, "danger");
      } else {
        showAlert("No Images Found", `No pot images found on Pexels for "${term}"`, "warning");
      }
    } catch (err: any) {
      console.error("Failed to search pot images", err);
      showAlert("Search Error", "Error searching images via Pexels API.", "danger");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPexelsImage = (url: string) => {
    setFormData(prev => ({ ...prev, imageUrl: url }));
    setIsPexelsModalOpen(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.color || formData.price === undefined) return;

    if (editingPot) {
      const updated = pots.map((p) =>
        p.id === editingPot.id ? ({ ...p, ...formData } as PotOption) : p
      );
      savePotsToStorage(updated);
    } else {
      const newPot: PotOption = {
        id: `pot_${Date.now()}`,
        color: formData.color || 'Custom Pot',
        price: Number(formData.price) || 499,
        stock: Number(formData.stock) || 50,
        soldCount: Number(formData.soldCount) || 0,
        patternType: formData.patternType || 'smooth',
        bgHex: formData.bgHex || '#4B5563',
        secondaryHex: formData.secondaryHex || '#1F2937',
        lightHex: formData.lightHex || '#9CA3AF',
        imageUrl: formData.imageUrl || undefined,
        hasCollar: formData.hasCollar || false
      };
      savePotsToStorage([...pots, newPot]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, color: string) => {
    setConfirmState({
      isOpen: true,
      title: "Remove Pot Planter?",
      message: `Are you sure you want to remove the "${color}" pot option from catalog?`,
      confirmText: "Remove Pot",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: () => {
        const updated = pots.filter((p) => p.id !== id);
        savePotsToStorage(updated);
        closeConfirmModal();
      }
    });
  };

  const handleResetDefaults = () => {
    setConfirmState({
      isOpen: true,
      title: "Reset Catalog to Defaults?",
      message: "Are you sure you want to reset pots to the default catalog (excluding removed pots)? Custom pot options will be reset.",
      confirmText: "Reset Catalog",
      cancelText: "Cancel",
      type: "warning",
      onConfirm: () => {
        savePotsToStorage(FILTERED_INITIAL_POTS);
        closeConfirmModal();
      }
    });
  };

  // Real KPI Calculations (No Fake Mock Numbers)
  const totalStockLeft = pots.reduce((acc, p) => acc + (p.stock ?? 50), 0);
  const totalUnitsSold = pots.reduce((acc, p) => acc + getRealPotSales(p), 0);
  const totalPotRevenue = pots.reduce((acc, p) => acc + (getRealPotSales(p) * p.price), 0);

  // Search Filter
  const filteredPots = pots.filter(p => 
    p.color.toLowerCase().includes(potSearchQuery.toLowerCase()) || 
    p.patternType.toLowerCase().includes(potSearchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 h-full pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-xl">potted_plant</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-900">Planter Inventory &amp; Real Sales</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Pots &amp; Planters Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Real-time pot inventory levels, actual order sales data, and price management.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-56 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xs">search</span>
            <input 
              type="text"
              placeholder="Search pots..."
              value={potSearchQuery}
              onChange={(e) => setPotSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none w-full"
            />
          </div>
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            Reset Catalog
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            <span>Add New Pot</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">palette</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pot Styles</p>
            <p className="text-xl font-bold text-on-surface">{pots.length} Planters</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
            <span className="material-symbols-outlined text-xl">inventory</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Stock Left</p>
            <p className="text-xl font-bold text-emerald-900">{totalStockLeft} Pots</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0 border border-blue-200">
            <span className="material-symbols-outlined text-xl">shopping_cart</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Total Pots Sold</p>
            <p className="text-xl font-bold text-on-surface">{totalUnitsSold} Units</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-900 flex items-center justify-center shrink-0 border border-amber-200">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Pot Revenue</p>
            <p className="text-xl font-bold text-primary">₹{totalPotRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Pot List Grid */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant text-xs">Loading pot catalog...</div>
        ) : filteredPots.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant text-xs">No pots match search query. Click "Add New Pot" to create one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredPots.map((pot) => {
              const stock = pot.stock !== undefined ? pot.stock : 50;
              const sold = getRealPotSales(pot);
              const potRevenue = sold * pot.price;

              return (
                <div
                  key={pot.id}
                  className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-between shadow-xs hover:shadow-md transition-shadow relative group"
                >
                  {/* Visual Preview Box */}
                  <div className="w-full aspect-square bg-gradient-to-b from-stone-100/80 via-white to-stone-100 rounded-xl mb-3 flex items-center justify-center border border-stone-200/70 overflow-hidden relative">
                    <PotIllustration pot={pot} />
                  </div>

                  {/* Pot Details */}
                  <div className="w-full text-center flex flex-col gap-2">
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm leading-tight">{pot.color}</h3>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          + ₹{pot.price}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                          {pot.patternType}
                        </span>
                      </div>
                    </div>

                    {/* Stock Inventory & Real Sold Breakdown Box */}
                    <div className="w-full bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 flex flex-col gap-1.5 text-xs text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 font-medium text-[11px]">Present Inventory:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          stock > 10 ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-red-100 text-red-900 border border-red-200'
                        }`}>
                          {stock} left
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-stone-600 font-medium text-[11px]">Units Sold:</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-bold text-[10px] border border-blue-200">
                          {sold} sold
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-[10px]">
                        <span className="text-stone-500">Pot Revenue:</span>
                        <span className="font-bold text-emerald-900">₹{potRevenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-center gap-2 mt-3 pt-2.5 border-t border-stone-100 w-full">
                    <button
                      onClick={() => handleOpenModal(pot)}
                      className="flex-1 py-1.5 px-3 text-xs font-bold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">edit</span>
                      Edit Pot
                    </button>
                    <button
                      onClick={() => handleDelete(pot.id, pot.color)}
                      className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Pot"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Add / Edit Pot */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-stone-200 shrink-0">
              <h3 className="font-bold text-stone-900 text-lg">
                {editingPot ? `Edit ${editingPot.color}` : 'Add New Pot Planter'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100 cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="potForm" onSubmit={handleSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700 uppercase">Pot Name / Color Style</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Emerald Velvet Ribbed"
                    value={formData.color}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData({ ...formData, color: val });
                      setSearchQuery(val);
                    }}
                    className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-700 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-700 uppercase">Stock Left</label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-700 uppercase">Base Units Sold</label>
                    <input
                      type="number"
                      required
                      value={formData.soldCount}
                      onChange={(e) => setFormData({ ...formData, soldCount: Number(e.target.value) })}
                      className="px-3 py-2 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-stone-700 uppercase">3D Surface Pattern</label>
                  <select
                    value={formData.patternType}
                    onChange={(e) => setFormData({ ...formData, patternType: e.target.value as any })}
                    className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none bg-white"
                  >
                    <option value="smooth">Smooth Cylinder</option>
                    <option value="ribbed">Vertical Ribbed</option>
                    <option value="fluted">Fluted Channels</option>
                    <option value="sphere">Spherical Bowl</option>
                    <option value="owl">Sculpted Owl</option>
                    <option value="speckled">Speckled Stone</option>
                    <option value="origami">Geometric Origami</option>
                    <option value="column">Architectural Column</option>
                  </select>
                </div>

                {/* Pot Image Upload & Pexels API Section */}
                <div className="flex flex-col gap-2 p-4 bg-stone-50 rounded-xl border border-stone-200">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <label className="text-xs font-bold text-stone-800 uppercase flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-emerald-800 text-base">image</span>
                      <span>Pot Image (Upload or Pexels)</span>
                    </label>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                    />
                    <button 
                      type="button" 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs bg-white text-stone-800 px-3 py-1.5 rounded-lg font-bold hover:bg-stone-100 transition-colors flex items-center gap-1 border border-stone-300 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      {uploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>

                  {/* Active Image Preview Box */}
                  {formData.imageUrl ? (
                    <div className="relative group rounded-xl overflow-hidden border border-stone-300 aspect-video bg-white flex items-center justify-center p-2">
                      <img src={formData.imageUrl} alt="Pot Preview" className="h-full object-contain" />
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                        Remove Image (Use 3D Shader)
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 border border-dashed border-stone-300 rounded-xl text-center bg-white">
                      <p className="text-xs text-stone-500 font-bold">No custom image uploaded/selected.</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Using interactive live 3D studio vector shader render.</p>
                    </div>
                  )}

                  {/* Pexels API Search Input */}
                  <div className="flex flex-col gap-1.5 mt-2 pt-2 border-t border-stone-200">
                    <span className="text-[11px] font-bold text-stone-600 uppercase">Search Image Online via Pexels API</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchPexelsPots(e);
                          }
                        }}
                        placeholder="e.g. ceramic planter pot"
                        className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-stone-300 bg-white text-stone-900 outline-none"
                      />
                      <button 
                        type="button"
                        onClick={(e) => searchPexelsPots(e)}
                        disabled={isSearching || !searchQuery.trim()}
                        className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">search</span>
                        {isSearching ? 'Searching...' : 'Pexels Search'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3D Color Customizer Controls */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-stone-600">Base Color</label>
                    <input
                      type="color"
                      value={formData.bgHex || '#4B5563'}
                      onChange={(e) => setFormData({ ...formData, bgHex: e.target.value })}
                      className="w-full h-9 rounded cursor-pointer border border-stone-300 p-0.5"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-stone-600">Shadow Tone</label>
                    <input
                      type="color"
                      value={formData.secondaryHex || '#1F2937'}
                      onChange={(e) => setFormData({ ...formData, secondaryHex: e.target.value })}
                      className="w-full h-9 rounded cursor-pointer border border-stone-300 p-0.5"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-stone-600">Highlight Tone</label>
                    <input
                      type="color"
                      value={formData.lightHex || '#9CA3AF'}
                      onChange={(e) => setFormData({ ...formData, lightHex: e.target.value })}
                      className="w-full h-9 rounded cursor-pointer border border-stone-300 p-0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="checkbox"
                    id="hasCollarAdmin"
                    checked={formData.hasCollar || false}
                    onChange={(e) => setFormData({ ...formData, hasCollar: e.target.checked })}
                    className="w-4 h-4 accent-emerald-800 cursor-pointer"
                  />
                  <label htmlFor="hasCollarAdmin" className="text-xs font-bold text-stone-700 cursor-pointer">
                    Upper Collar Rim Lip (Matte Black Style)
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-stone-200 bg-stone-50 shrink-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-200 text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="potForm"
                className="px-6 py-2 rounded-lg font-bold bg-emerald-900 text-white hover:bg-emerald-950 text-sm transition-colors cursor-pointer"
              >
                Save Pot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Pexels Image Gallery Sub-Dialog Modal */}
      {isPexelsModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative border border-stone-200">
            
            {/* Sub-Dialog Header */}
            <div className="flex items-center justify-between p-5 border-b border-stone-200 bg-stone-50">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-0.5">
                  <span className="material-symbols-outlined text-[18px]">photo_library</span>
                  <span>Pexels Pot Image Gallery</span>
                </div>
                <h3 className="font-bold text-stone-900 text-base sm:text-lg">
                  Pot Search Results for "{searchQuery}"
                </h3>
              </div>
              <button 
                onClick={() => setIsPexelsModalOpen(false)}
                className="text-stone-400 hover:text-red-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Gallery Grid Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isSearching ? (
                <div className="p-16 text-center text-stone-500 flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl text-emerald-800">sync</span>
                  <p className="font-bold">Fetching pot photos from Pexels API...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-16 text-center text-stone-500">
                  <span className="material-symbols-outlined text-4xl text-stone-300 mb-2">image_search</span>
                  <p className="font-bold">No pot photos found on Pexels for this search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {searchResults.map((url, i) => {
                    const isSelected = formData.imageUrl === url;
                    return (
                      <div 
                        key={i} 
                        onClick={() => handleSelectPexelsImage(url)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group shadow-sm hover:shadow-md ${
                          isSelected
                            ? 'border-emerald-700 ring-2 ring-emerald-600/40'
                            : 'border-transparent hover:border-emerald-600/60'
                        }`}
                      >
                        <img src={url} alt={`Pexels pot result ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity p-2 ${
                          isSelected ? 'bg-emerald-900/50 opacity-100' : 'bg-black/30 opacity-0 group-hover:opacity-100'
                        }`}>
                          <span className="material-symbols-outlined text-white text-3xl shadow-sm">
                            {isSelected ? 'check_circle' : 'add_circle'}
                          </span>
                          <span className="text-white text-xs font-bold mt-1 bg-black/60 px-2.5 py-1 rounded shadow">
                            {isSelected ? 'Selected' : 'Use This Image'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-Dialog Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-bold">
                Click any image to select it for your pot planter.
              </span>
              <button 
                type="button" 
                onClick={() => setIsPexelsModalOpen(false)}
                className="px-6 py-2 bg-emerald-900 text-white font-bold text-sm rounded-lg hover:bg-emerald-950 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmState.isOpen}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        onConfirm={confirmState.onConfirm}
        onCancel={closeConfirmModal}
      />
    </div>
  );
}
