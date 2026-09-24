"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { POT_OPTIONS as INITIAL_POTS, PotOption, PotIllustration } from '@/components/PotSelector';
import ConfirmModal from '@/components/ConfirmModal';

export default function AdminPotsPage() {
  const [pots, setPots] = useState<PotOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPot, setEditingPot] = useState<PotOption | null>(null);

  // Pexels Dialog Modal State
  const [isPexelsModalOpen, setIsPexelsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter out the 3 removed pots by default
  const FILTERED_INITIAL_POTS = INITIAL_POTS.filter(
    (p) => p.color !== "Terracotta Red" && p.color !== "White Fluted Column" && p.color !== "Vibrant Orange Ribbed"
  );

  // Form state for adding/editing pot
  const [formData, setFormData] = useState<Partial<PotOption>>({
    color: '',
    price: 499,
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

  const loadPots = () => {
    try {
      const saved = localStorage.getItem('plantinum_pots');
      if (saved) {
        setPots(JSON.parse(saved));
      } else {
        setPots(FILTERED_INITIAL_POTS);
        localStorage.setItem('plantinum_pots', JSON.stringify(FILTERED_INITIAL_POTS));
      }
    } catch (e) {
      setPots(FILTERED_INITIAL_POTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPots();
  }, []);

  const savePotsToStorage = (updatedPots: PotOption[]) => {
    setPots(updatedPots);
    localStorage.setItem('plantinum_pots', JSON.stringify(updatedPots));
    window.dispatchEvent(new Event('plantinum_pots_updated'));
  };

  const handleOpenModal = (pot: PotOption | null = null) => {
    setSearchResults([]);
    setIsPexelsModalOpen(false);
    if (pot) {
      setEditingPot(pot);
      setFormData({ ...pot });
      setSearchQuery(pot.color || '');
    } else {
      setEditingPot(null);
      setFormData({
        color: '',
        price: 499,
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

  // Upload custom pot image file to Firebase Storage
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

  // Execute Pexels API search for Pot Planter images
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
    if (!formData.color || !formData.price) return;

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

  return (
    <div className="flex flex-col gap-6 h-full pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-primary">
            <span className="material-symbols-outlined text-xl">potted_plant</span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-900">Planter Catalog</span>
          </div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Pots & Planters Management</h1>
          <p className="text-on-surface-variant text-sm mt-1">Add new planter options, update prices, upload custom pot images, or search Pexels.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDefaults}
            className="px-4 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container text-xs font-bold transition-colors"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Add New Pot
          </button>
        </div>
      </div>

      {/* Pot List Grid */}
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-6 flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading pots...</div>
        ) : pots.length === 0 ? (
          <div className="p-12 text-center text-on-surface-variant">No pots available. Click "Add New Pot" to create one.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pots.map((pot) => (
              <div
                key={pot.id}
                className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-center justify-between shadow-sm hover:shadow-md transition-shadow relative group"
              >
                {/* Visual Preview Box */}
                <div className="w-full aspect-square bg-gradient-to-b from-stone-100/80 via-white to-stone-100 rounded-xl mb-3 flex items-center justify-center border border-stone-200/70 overflow-hidden relative">
                  <PotIllustration pot={pot} />
                </div>

                {/* Pot Details */}
                <div className="w-full text-center">
                  <h3 className="font-bold text-stone-900 text-sm">{pot.color}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      + ₹{pot.price}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                      {pot.patternType}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-2 mt-4 pt-3 border-t border-stone-100 w-full">
                  <button
                    onClick={() => handleOpenModal(pot)}
                    className="flex-1 py-1.5 px-3 text-xs font-bold text-stone-700 hover:text-emerald-900 bg-stone-100 hover:bg-emerald-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[14px]">edit</span>
                    Edit Pot
                  </button>
                  <button
                    onClick={() => handleDelete(pot.id, pot.color)}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Pot"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            ))}
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
                className="text-stone-400 hover:text-stone-700 p-1 rounded-full hover:bg-stone-100"
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-stone-700 uppercase">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:ring-2 focus:ring-emerald-600 outline-none"
                    />
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
                      className="text-xs bg-white text-stone-800 px-3 py-1.5 rounded-lg font-bold hover:bg-stone-100 transition-colors flex items-center gap-1 border border-stone-300"
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
                        className="absolute inset-0 bg-red-900/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs gap-1"
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
                        className="px-3 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shrink-0 flex items-center gap-1"
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
                    className="w-4 h-4 accent-emerald-800"
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
                className="px-4 py-2 rounded-lg font-bold text-stone-600 hover:bg-stone-200 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="potForm"
                className="px-6 py-2 rounded-lg font-bold bg-emerald-900 text-white hover:bg-emerald-950 text-sm transition-colors"
              >
                Save Pot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Pexels Image Gallery Sub-Dialog Modal for Pots */}
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
                className="text-stone-400 hover:text-red-600 p-1.5 rounded-full hover:bg-stone-200 transition-colors"
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
                        
                        {/* Overlay selection state */}
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
                className="px-6 py-2 bg-emerald-900 text-white font-bold text-sm rounded-lg hover:bg-emerald-950 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Reusable Stylized Confirmation / Alert Dialog */}
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
