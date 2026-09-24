"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ConfirmModal from '@/components/ConfirmModal';

const DEFAULT_BUNDLES = [
  {
    id: 'bndl_default_1',
    name: 'Executive Desk Sanctuary',
    description: 'Three hardy desktop specimens (Jade, Sansevieria Dwarf, and Peperomia) designed to absorb computer glare and purify workspace air.',
    price: 2199,
    image: 'https://images.pexels.com/photos/7966284/pexels-photo-7966284.jpeg',
    isAvailable: true,
    products: []
  },
  {
    id: 'bndl_default_2',
    name: 'Living Room Statement',
    description: 'Large Monstera Deliciosa, 4ft Areca Palm, and ZZ specimen. Paired with our flagship handcrafted matte stone pots with saucers.',
    price: 4499,
    image: 'https://images.pexels.com/photos/6510886/pexels-photo-6510886.jpeg',
    isAvailable: true,
    products: ['p4', 'p8', 'p9']
  },
  {
    id: 'bndl_default_3',
    name: "Beginner's Green Sanctuary",
    description: 'Zero stress for new plant parents. Forgiving foliage that tolerates uneven watering, dry AC conditions, and indirect lighting.',
    price: 1799,
    image: 'https://images.pexels.com/photos/305821/pexels-photo-305821.jpeg',
    isAvailable: true,
    products: ['p2', 'p7', 'p8']
  }
];

const CARE_KEYWORDS = ['care', 'soil', 'fertilizer', 'pest', 'tool', 'fungicide', 'mix', 'liquid', 'neem', 'potting', 'pack', 'package'];

const isPlantCareProduct = (product: any) => {
  if (!product) return false;
  if (product.productType === 'care') return true;
  const cat = (product.category || '').toLowerCase();
  const name = (product.name || '').toLowerCase();
  return (
    cat.includes('care & soil') ||
    cat.includes('potting mix') ||
    cat.includes('organic fertilizers') ||
    cat.includes('pest control') ||
    cat.includes('tools & accessories') ||
    CARE_KEYWORDS.some(k => cat.includes(k) || name.includes(k))
  );
};

export default function BundlesPage() {
  const [bundles, setBundles] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});
  
  // Search State
  const [bundleSearch, setBundleSearch] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    products: [] as string[],
    image: '',
    isAvailable: true
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

  const fetchData = async () => {
    try {
      // Fetch Bundles
      const bundlesSnap = await getDocs(collection(db, 'bundles'));
      let b: any[] = [];
      bundlesSnap.forEach((doc) => {
        b.push({ id: doc.id, ...doc.data() });
      });
      
      // Auto-seed default bundles if empty
      if (b.length === 0) {
        for (const defaultBundle of DEFAULT_BUNDLES) {
          const docRef = doc(db, 'bundles', defaultBundle.id);
          await setDoc(docRef, defaultBundle);
          b.push(defaultBundle);
        }
      }
      setBundles(b);

      // Fetch Products
      const productsSnap = await getDocs(collection(db, 'products'));
      const p: any[] = [];
      productsSnap.forEach((doc) => {
        p.push({ id: doc.id, ...doc.data() });
      });
      setAllProducts(p);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (bundle: any = null) => {
    setProductSearchQuery('');
    if (bundle) {
      setEditingBundle(bundle);
      setFormData({
        name: bundle.name || '',
        description: bundle.description || '',
        price: bundle.price || 0,
        products: bundle.products || [],
        image: bundle.image || '',
        isAvailable: bundle.isAvailable !== false
      });
    } else {
      setEditingBundle(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        products: [],
        image: '',
        isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    setFormData(prev => {
      const selected = prev.products.includes(productId) 
        ? prev.products.filter(id => id !== productId)
        : [...prev.products, productId];
      return { ...prev, products: selected };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.products.length === 0) {
      showAlert("Product Required", "Please select at least one plant or plant care item for this bundle.", "warning");
      return;
    }

    // Automatically derive bundle image collection from selected products
    const selectedProds = formData.products
      .map(id => allProducts.find(p => p.id === id))
      .filter(Boolean);

    const selectedImages = selectedProds
      .map(p => p.image || (p.gallery && p.gallery[0]))
      .filter(Boolean);

    const primaryImage = selectedImages.length > 0 
      ? selectedImages[0] 
      : (formData.image || '');

    const bundleDataToSave = {
      ...formData,
      image: primaryImage,
      images: selectedImages
    };

    try {
      if (editingBundle) {
        const docRef = doc(db, 'bundles', editingBundle.id);
        await updateDoc(docRef, bundleDataToSave);
      } else {
        const newId = `bndl_${Date.now()}`;
        const docRef = doc(db, 'bundles', newId);
        await setDoc(docRef, { ...bundleDataToSave, id: newId });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving bundle:", error);
      showAlert("Save Failed", "Failed to save bundle. Please try again.", "danger");
    }
  };

  const handleDelete = (id: string, name: string = 'this bundle') => {
    setConfirmState({
      isOpen: true,
      title: "Delete Bundle?",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Bundle",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'bundles', id));
          fetchData();
        } catch (error) {
          console.error("Error deleting bundle:", error);
          showAlert("Delete Failed", "Failed to delete bundle.", "danger");
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedBundles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products into Plants vs Plant Care
  const plantProducts = allProducts.filter(p => !isPlantCareProduct(p));
  const careProducts = allProducts.filter(p => isPlantCareProduct(p));

  // Search filtered product lists
  const filteredPlants = plantProducts.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
  );

  const filteredCareItems = careProducts.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
  );

  // Selected Images for Bundle Collage
  const selectedProductsObjects = formData.products
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);

  const selectedImages = selectedProductsObjects
    .map(p => p.image || (p.gallery && p.gallery[0]))
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Bundles Management</h1>
          <p className="text-on-surface-variant font-body-sm md:font-body-md mt-1 md:mt-2">Group existing products into discounted bundles.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input 
              type="text"
              placeholder="Search bundles..."
              value={bundleSearch}
              onChange={(e) => setBundleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none w-full"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-label-sm md:font-label-md uppercase tracking-wider font-bold transition-colors flex items-center gap-1 md:gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] md:text-2xl">add</span>
            <span className="hidden sm:inline">Add Bundle</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden flex-1 min-h-0">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading bundles...</div>
        ) : (
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-surface-container-low shadow-sm">
                <tr className="border-b border-outline-variant">
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Bundle</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Items</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Price</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Status</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bundles
                  .filter(b => b.name.toLowerCase().includes(bundleSearch.toLowerCase()))
                  .map(bundle => {
                    const isExpanded = expandedBundles[bundle.id];
                    const bundleProducts = (bundle.products || [])
                      .map((pId: string) => allProducts.find(p => p.id === pId))
                      .filter(Boolean);

                    return (
                      <React.Fragment key={bundle.id}>
                        <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                          <td className="p-4 flex items-center gap-4">
                            {bundle.image ? (
                              <div className="w-12 h-12 rounded-lg bg-surface-container bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${bundle.image})` }}></div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                                <span className="material-symbols-outlined text-outline">inventory_2</span>
                              </div>
                            )}
                            <div>
                              <p className="font-title-md text-on-surface font-bold">{bundle.name}</p>
                              <p className="text-xs text-on-surface-variant max-w-[200px] truncate">{bundle.description}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <button 
                              onClick={() => toggleExpand(bundle.id)}
                              className="flex items-center gap-1 text-sm font-bold bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-full transition-colors text-on-surface"
                            >
                              {bundle.products?.length || 0} items
                              <span className="material-symbols-outlined text-[16px]">
                                {isExpanded ? 'expand_less' : 'expand_more'}
                              </span>
                            </button>
                          </td>
                          <td className="p-4 text-on-surface font-bold text-primary">₹{bundle.price}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bundle.isAvailable ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                              {bundle.isAvailable ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleOpenModal(bundle)} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10">
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button onClick={() => handleDelete(bundle.id, bundle.name)} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10">
                                <span className="material-symbols-outlined text-sm">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-surface-container-lowest border-b border-outline-variant">
                            <td colSpan={5} className="p-4 px-8 max-w-0 w-full">
                              <div className="flex flex-col gap-2 w-full">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Products Included in Bundle</h4>
                                {bundleProducts.length > 0 ? (
                                  <div className="w-full overflow-hidden">
                                    <ul className="flex overflow-x-auto gap-4 mt-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-surface-container-low [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-outline transition-colors">
                                      {bundleProducts.map((product: any, idx: number) => (
                                        <li key={`${product.id}-${idx}`} className="flex-none w-[260px] flex flex-col border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest shadow-sm hover:shadow-md transition-shadow snap-start">
                                          <div className="w-full aspect-square bg-surface-container relative">
                                            {product.image ? (
                                              <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }}></div>
                                            ) : (
                                              <div className="absolute inset-0 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-[32px] text-outline">eco</span>
                                              </div>
                                            )}
                                            <div className="absolute top-2 right-2 px-2 py-1 bg-surface-container-lowest/90 backdrop-blur-sm rounded-lg text-xs font-bold text-primary shadow-sm">
                                              ₹{product.price}
                                            </div>
                                          </div>
                                          <div className="p-3 flex flex-col flex-1">
                                            <span className="text-sm font-bold text-on-surface line-clamp-2 leading-tight min-h-[2.5rem] mb-2">{product.name}</span>
                                            <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-outline-variant/60">
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-on-surface-variant">In Bundle</span>
                                                <span className="text-xs font-bold text-on-surface bg-surface-container-high px-1.5 rounded">1x</span>
                                              </div>
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs text-on-surface-variant">Inventory</span>
                                                <span className="text-xs font-bold text-on-surface bg-surface-container-high px-1.5 rounded">
                                                  {product.stock !== undefined ? product.stock : 0} units
                                                </span>
                                              </div>
                                            </div>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>

                                ) : (
                                  <p className="text-sm text-on-surface-variant italic">No valid products are currently assigned to this bundle.</p>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                {bundles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-on-surface-variant">
                      No bundles found. Click 'Add Bundle' to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest z-10 shrink-0">
              <div>
                <h3 className="font-headline-sm text-primary font-bold">
                  {editingBundle ? 'Edit Bundle' : 'Create New Bundle'}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bundle images are dynamically generated from selected plants & care products.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Sub-Header: Global Product Search Bar */}
            <div className="px-6 py-3 bg-surface-container-low border-b border-outline-variant flex items-center gap-3">
              <span className="material-symbols-outlined text-outline text-sm">search</span>
              <input 
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search plants or plant care items by name or category..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-on-surface-variant/70"
              />
              {productSearchQuery && (
                <button 
                  type="button" 
                  onClick={() => setProductSearchQuery('')}
                  className="text-xs text-on-surface-variant hover:text-primary font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="bundleForm" onSubmit={handleSave} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
              
                {/* Left Column: Bundle Details + Plants Selection Panel */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 bg-surface-container-low/50 p-4 rounded-xl border border-outline-variant">
                    <h4 className="font-title-md font-bold text-on-surface border-b border-outline-variant pb-2">Bundle Details</h4>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bundle Name</label>
                      <input 
                        type="text" 
                        required 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. Desk Sanctuary Bundle"
                        className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description</label>
                      <textarea 
                        value={formData.description} 
                        onChange={e => setFormData({...formData, description: e.target.value})} 
                        rows={2} 
                        placeholder="Short summary of what's included..."
                        className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm resize-none" 
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Bundle Price (₹)</label>
                      <input 
                        type="number" 
                        required 
                        value={formData.price} 
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})} 
                        className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm" 
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 mt-1">
                      <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-4 h-4 accent-primary cursor-pointer" />
                      <label htmlFor="isAvailable" className="text-xs font-bold text-on-surface cursor-pointer">Active (Visible on Storefront)</label>
                    </div>
                  </div>

                  {/* Left Panel: Plants Only */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                      <h4 className="font-title-md font-bold text-primary flex items-center gap-1.5">
                        <span>🌿</span>
                        <span>Select Plants</span>
                      </h4>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        {formData.products.filter(id => plantProducts.some(p => p.id === id)).length} Selected
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto pr-2 flex flex-col gap-2">
                      {filteredPlants.length === 0 ? (
                        <div className="p-4 text-center text-xs text-on-surface-variant italic bg-surface-container-low rounded-lg">
                          No plants match search query.
                        </div>
                      ) : (
                        filteredPlants.map(product => {
                          const isSelected = formData.products.includes(product.id);
                          return (
                            <div 
                              key={product.id}
                              onClick={() => toggleProductSelection(product.id)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'border-primary bg-primary-container/20 ring-1 ring-primary/40' 
                                  : 'border-outline-variant hover:bg-surface-container-low bg-surface-container-lowest'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary border-primary text-on-primary' : 'border-outline text-transparent'}`}>
                                <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                              </div>
                              {product.image && (
                                <div className="w-9 h-9 rounded-lg bg-cover bg-center shrink-0 border border-outline-variant/60" style={{ backgroundImage: `url(${product.image})` }}></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-on-surface truncate">{product.name}</p>
                                <p className="text-[11px] text-on-surface-variant truncate">₹{product.price}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Dynamic Bundle Image Collection + Plant Care Items Panel */}
                <div className="flex flex-col gap-6 lg:border-l lg:border-outline-variant lg:pl-8">
                  
                  {/* Dynamic Bundle Image Collage Preview */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                      <h4 className="font-title-md font-bold text-on-surface flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-primary text-lg">auto_awesome</span>
                        <span>Bundle Image Collection</span>
                      </h4>
                      <span className="text-xs font-bold text-primary bg-primary-container/40 px-2 py-0.5 rounded-full">
                        {selectedImages.length} Images
                      </span>
                    </div>

                    {selectedImages.length === 0 ? (
                      <div className="aspect-video border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant p-4 text-center">
                        <span className="material-symbols-outlined text-4xl mb-1 text-outline">collections</span>
                        <p className="text-xs font-bold">Auto-Generated Bundle Collection Image</p>
                        <p className="text-[11px] text-on-surface-variant mt-0.5 max-w-xs">
                          Select plants or care items — their images will automatically combine to create this bundle's image.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className={`grid gap-2 aspect-video bg-surface-container-low p-2.5 rounded-xl border border-outline-variant overflow-hidden ${
                          selectedImages.length === 1 
                            ? 'grid-cols-1' 
                            : selectedImages.length === 2 
                            ? 'grid-cols-2' 
                            : selectedImages.length === 3 
                            ? 'grid-cols-3' 
                            : 'grid-cols-2 sm:grid-cols-4'
                        }`}>
                          {selectedImages.map((imgUrl, idx) => (
                            <div key={idx} className="relative rounded-lg overflow-hidden border border-outline-variant/60 bg-surface-container aspect-square group shadow-sm">
                              <img src={imgUrl} alt={`Bundle Item ${idx + 1}`} className="w-full h-full object-cover" />
                              <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                #{idx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[11px] text-on-surface-variant italic">
                          ✨ Bundle image is dynamically compiled from the {selectedImages.length} selected product image(s).
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Panel: Plant Care Items Only */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                      <h4 className="font-title-md font-bold text-secondary flex items-center gap-1.5">
                        <span>🧪</span>
                        <span>Select Plant Care Items</span>
                      </h4>
                      <span className="text-xs font-bold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
                        {formData.products.filter(id => careProducts.some(p => p.id === id)).length} Selected
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto pr-2 flex flex-col gap-2">
                      {filteredCareItems.length === 0 ? (
                        <div className="p-4 text-center text-xs text-on-surface-variant italic bg-surface-container-low rounded-lg">
                          No plant care items match search query.
                        </div>
                      ) : (
                        filteredCareItems.map(product => {
                          const isSelected = formData.products.includes(product.id);
                          return (
                            <div 
                              key={product.id}
                              onClick={() => toggleProductSelection(product.id)}
                              className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'border-secondary bg-secondary-container/20 ring-1 ring-secondary/40' 
                                  : 'border-outline-variant hover:bg-surface-container-low bg-surface-container-lowest'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-secondary border-secondary text-on-secondary' : 'border-outline text-transparent'}`}>
                                <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                              </div>
                              {product.image && (
                                <div className="w-9 h-9 rounded-lg bg-cover bg-center shrink-0 border border-outline-variant/60" style={{ backgroundImage: `url(${product.image})` }}></div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-xs text-on-surface truncate">{product.name}</p>
                                <p className="text-[11px] text-on-surface-variant truncate">₹{product.price}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </form>
            </div>
              
            {/* Sticky Footer */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3 rounded-b-2xl shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" form="bundleForm" className="px-8 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:bg-secondary transition-colors">
                Save Bundle
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
