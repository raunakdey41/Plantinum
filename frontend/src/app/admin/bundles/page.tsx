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

const DEFAULT_BUNDLE_REQUESTS = [
  {
    id: 'req_101',
    userName: 'Rohan Sharma',
    userEmail: 'rohan.sharma@gmail.com',
    userPhone: '+91 98765 43210',
    requestedItems: ['Monstera Deliciosa', 'Potting Mix & Soil', 'Ceramic Beige Pot'],
    notes: 'Need this packaged as a housewarming gift bundle with a customized greeting card.',
    budget: 2200,
    status: 'pending',
    createdAt: '24 Sep 2026, 04:30 PM'
  },
  {
    id: 'req_102',
    userName: 'Priya Mukherjee',
    userEmail: 'priya.m@yahoo.com',
    userPhone: '+91 98123 76543',
    requestedItems: ['Snake Plant Laurentii', 'Peace Lily', 'Indoor Liquid Fertilizer'],
    notes: 'Looking for a low maintenance desk combo for my new office space in Whitefield.',
    budget: 1800,
    status: 'approved',
    createdAt: '22 Sep 2026, 11:15 AM',
    createdBundleId: 'bndl_default_3'
  },
  {
    id: 'req_103',
    userName: 'Anish Verma',
    userEmail: 'anish.v@techcorp.io',
    userPhone: '+91 97788 11223',
    requestedItems: ['Areca Palm XL', 'Ficus Lyrata', 'SAAF Fungicide', 'Premium Aroid Mix'],
    notes: 'Balcony starter set for shaded morning sunlight on high rise terrace.',
    budget: 3500,
    status: 'fulfilled',
    createdAt: '19 Sep 2026, 06:45 PM'
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
  const [orders, setOrders] = useState<any[]>([]);
  const [bundleRequests, setBundleRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab Navigation State
  const [activeTab, setActiveTab] = useState<'catalog' | 'sold' | 'requests'>('catalog');

  // Request Filter State
  const [requestFilter, setRequestFilter] = useState<'all' | 'pending' | 'approved' | 'fulfilled'>('all');

  // Search State
  const [bundleSearch, setBundleSearch] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBundle, setEditingBundle] = useState<any>(null);
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    products: [] as string[],
    image: '',
    isAvailable: true
  });

  // Confirm Alert Modal State
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
      // 1. Fetch Bundles
      const bundlesSnap = await getDocs(collection(db, 'bundles'));
      let b: any[] = [];
      bundlesSnap.forEach((docSnap) => {
        b.push({ id: docSnap.id, ...docSnap.data() });
      });
      
      if (b.length === 0) {
        for (const defaultBundle of DEFAULT_BUNDLES) {
          const docRef = doc(db, 'bundles', defaultBundle.id);
          await setDoc(docRef, defaultBundle);
          b.push(defaultBundle);
        }
      }
      setBundles(b);

      // 2. Fetch Products
      const productsSnap = await getDocs(collection(db, 'products'));
      const p: any[] = [];
      productsSnap.forEach((docSnap) => {
        p.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllProducts(p);

      // 3. Fetch Orders for Sold Analytics
      const ordersSnap = await getDocs(collection(db, 'orders'));
      const ords: any[] = [];
      ordersSnap.forEach((docSnap) => {
        ords.push({ id: docSnap.id, ...docSnap.data() });
      });
      setOrders(ords);

      // 4. Fetch User Bundle Requests
      const requestsSnap = await getDocs(collection(db, 'bundleRequests'));
      let reqs: any[] = [];
      requestsSnap.forEach((docSnap) => {
        reqs.push({ id: docSnap.id, ...docSnap.data() });
      });
      setBundleRequests(reqs);

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

  const handleConvertRequestToBundle = (req: any) => {
    setProductSearchQuery('');
    setEditingBundle(null);

    // Auto-match products in user request with store inventory
    const matchedProductIds: string[] = [];
    (req.requestedItems || []).forEach((itemText: string) => {
      const found = allProducts.find(p => 
        p.name.toLowerCase().includes(itemText.toLowerCase()) || 
        itemText.toLowerCase().includes(p.name.toLowerCase())
      );
      if (found && !matchedProductIds.includes(found.id)) {
        matchedProductIds.push(found.id);
      }
    });

    setFormData({
      name: `Custom Bundle for ${req.userName}`,
      description: `Specially curated requested bundle for ${req.userName}. ${req.notes || ''}`,
      price: req.budget || 1999,
      products: matchedProductIds,
      image: '',
      isAvailable: true
    });

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
      images: selectedImages,
      updatedAt: new Date().toISOString()
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

  const updateRequestStatus = async (requestId: string, newStatus: string) => {
    try {
      const ref = doc(db, 'bundleRequests', requestId);
      await updateDoc(ref, { status: newStatus, updatedAt: new Date().toISOString() });
      fetchData();
    } catch (err) {
      console.error("Failed to update request status:", err);
      showAlert("Update Failed", "Could not update request status.", "danger");
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedBundles(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper for sales analytics calculation (strictly from real Firestore orders)
  const getBundleSalesInfo = (bundleId: string, bundleName: string, bundlePrice: number) => {
    let liveSoldCount = 0;
    
    orders.forEach(order => {
      (order.items || []).forEach((item: any) => {
        if (item.id === bundleId || item.name.toLowerCase().includes(bundleName.toLowerCase())) {
          liveSoldCount += (item.quantity || 1);
        }
      });
    });

    const totalSold = liveSoldCount;
    const totalRevenue = totalSold * bundlePrice;

    let badge = '⭐ Active Catalog';
    if (totalSold >= 10) badge = '🔥 Top Seller';
    else if (totalSold >= 5) badge = '🚀 High Demand';

    return { totalSold, totalRevenue, badge };
  };

  // Total Statistics Calculations
  const totalBundlesCount = bundles.length;
  const totalSoldUnits = bundles.reduce((acc, b) => acc + getBundleSalesInfo(b.id, b.name, b.price).totalSold, 0);
  const totalSoldRevenue = bundles.reduce((acc, b) => acc + getBundleSalesInfo(b.id, b.name, b.price).totalRevenue, 0);
  const pendingRequestsCount = bundleRequests.filter(r => r.status === 'pending').length;

  // Filter products into Plants vs Plant Care
  const plantProducts = allProducts.filter(p => !isPlantCareProduct(p));
  const careProducts = allProducts.filter(p => isPlantCareProduct(p));

  const filteredPlants = plantProducts.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
  );

  const filteredCareItems = careProducts.filter(p => 
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || 
    (p.category && p.category.toLowerCase().includes(productSearchQuery.toLowerCase()))
  );

  const selectedProductsObjects = formData.products
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean);

  const selectedImages = selectedProductsObjects
    .map(p => p.image || (p.gallery && p.gallery[0]))
    .filter(Boolean);

  // Filter Bundle Requests
  const filteredRequests = bundleRequests.filter(req => {
    if (requestFilter === 'pending') return req.status === 'pending';
    if (requestFilter === 'approved') return req.status === 'approved';
    if (requestFilter === 'fulfilled') return req.status === 'fulfilled';
    return true;
  });

  return (
    <div className="flex flex-col gap-5 h-full pb-2">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Bundles Management</h1>
          <p className="text-on-surface-variant font-body-sm md:font-body-md mt-1">
            Sales analytics, bundle creation, and customer custom bundle request history.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-5 py-2.5 rounded-lg font-label-md uppercase tracking-wider font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-xl">add</span>
            <span>Create New Bundle</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Summary Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-primary-container/40 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">inventory_2</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Active Catalog</p>
            <p className="text-xl font-bold text-on-surface">{totalBundlesCount} Bundles</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/40 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Bundles Sold</p>
            <p className="text-xl font-bold text-on-surface">{totalSoldUnits} Units</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-tertiary-container/40 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">payments</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Bundle Revenue</p>
            <p className="text-xl font-bold text-primary">₹{totalSoldRevenue.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant flex items-center gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-lg bg-error-container/30 text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-xl">mark_email_unread</span>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">User Requests</p>
            <p className="text-xl font-bold text-on-surface">
              {pendingRequestsCount} Pending <span className="text-xs text-on-surface-variant font-normal">({bundleRequests.length} Total)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Section Nav Tabs */}
      <div className="flex items-center justify-between border-b border-outline-variant gap-2 overflow-x-auto pb-0">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'catalog'
                ? 'border-primary text-primary bg-primary-container/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
            <span>Active Storefront Catalog ({bundles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sold')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'sold'
                ? 'border-primary text-primary bg-primary-container/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">monitoring</span>
            <span>Sold Bundles &amp; Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold text-xs md:text-sm border-b-2 transition-all cursor-pointer ${
              activeTab === 'requests'
                ? 'border-primary text-primary bg-primary-container/10'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">history_edu</span>
            <span>User Requested Bundles ({bundleRequests.length})</span>
            {pendingRequestsCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-error text-on-error text-[10px] font-bold">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'catalog' && (
          <div className="relative w-48 sm:w-64 mb-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xs">search</span>
            <input 
              type="text"
              placeholder="Search catalog..."
              value={bundleSearch}
              onChange={(e) => setBundleSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-low text-on-surface outline-none w-full"
            />
          </div>
        )}
      </div>

      {/* TAB 1: ACTIVE STOREFRONT CATALOG */}
      {activeTab === 'catalog' && (
        <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden flex-1 min-h-0 shadow-xs">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant text-xs">Loading bundle catalog...</div>
          ) : (
            <div className="overflow-auto flex-1 relative max-h-[600px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-10 bg-surface-container-low shadow-2xs">
                  <tr className="border-b border-outline-variant">
                    <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Bundle</th>
                    <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Items</th>
                    <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Price</th>
                    <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Status</th>
                    <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
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
                          <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                            <td className="p-3.5 flex items-center gap-3.5">
                              {bundle.image ? (
                                <div className="w-12 h-12 rounded-lg bg-surface-container bg-cover bg-center shrink-0 border border-outline-variant" style={{ backgroundImage: `url(${bundle.image})` }}></div>
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                                  <span className="material-symbols-outlined text-outline">inventory_2</span>
                                </div>
                              )}
                              <div>
                                <p className="font-title-md text-on-surface font-bold text-sm">{bundle.name}</p>
                                <p className="text-xs text-on-surface-variant max-w-[260px] truncate">{bundle.description}</p>
                              </div>
                            </td>
                            <td className="p-3.5">
                              <button 
                                onClick={() => toggleExpand(bundle.id)}
                                className="flex items-center gap-1 text-xs font-bold bg-surface-container hover:bg-surface-container-high px-3 py-1 rounded-full transition-colors text-on-surface border border-outline-variant cursor-pointer"
                              >
                                <span>{bundle.products?.length || 0} items</span>
                                <span className="material-symbols-outlined text-[15px]">
                                  {isExpanded ? 'expand_less' : 'expand_more'}
                                </span>
                              </button>
                            </td>
                            <td className="p-3.5 text-on-surface font-bold text-primary text-sm">₹{bundle.price}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${bundle.isAvailable ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                {bundle.isAvailable ? 'Active' : 'Draft'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button onClick={() => handleOpenModal(bundle)} className="p-1.5 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10 cursor-pointer">
                                  <span className="material-symbols-outlined text-sm">edit</span>
                                </button>
                                <button onClick={() => handleDelete(bundle.id, bundle.name)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10 cursor-pointer">
                                  <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-surface-container-lowest border-b border-outline-variant">
                              <td colSpan={5} className="p-4 px-6 max-w-0 w-full">
                                <div className="flex flex-col gap-2 w-full">
                                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-primary">Products Included in Bundle</h4>
                                  {bundleProducts.length > 0 ? (
                                    <div className="w-full overflow-hidden">
                                      <ul className="flex overflow-x-auto gap-3 mt-1 pb-2">
                                        {bundleProducts.map((product: any, idx: number) => (
                                          <li key={`${product.id}-${idx}`} className="flex-none w-[220px] flex flex-col border border-outline-variant rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xs">
                                            <div className="w-full aspect-video bg-surface-container relative">
                                              {product.image ? (
                                                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${product.image})` }}></div>
                                              ) : (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                  <span className="material-symbols-outlined text-outline">eco</span>
                                                </div>
                                              )}
                                              <div className="absolute top-1.5 right-1.5 px-2 py-0.5 bg-surface-container-lowest/90 backdrop-blur-sm rounded-md text-[10px] font-bold text-primary shadow-xs">
                                                ₹{product.price}
                                              </div>
                                            </div>
                                            <div className="p-2.5 flex flex-col flex-1">
                                              <span className="text-xs font-bold text-on-surface truncate">{product.name}</span>
                                              <span className="text-[10px] text-on-surface-variant italic truncate">{product.category || 'Plant Item'}</span>
                                            </div>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-on-surface-variant italic">No valid products assigned to this bundle.</p>
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
                      <td colSpan={5} className="p-8 text-center text-on-surface-variant text-xs">
                        No storefront bundles found. Click 'Create New Bundle' above.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SOLD BUNDLES & SALES ANALYTICS */}
      {activeTab === 'sold' && (
        <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">insights</span>
              <h3 className="font-bold text-on-surface text-sm">Bundle Sales Performance &amp; Units Sold</h3>
            </div>
            <span className="text-xs font-bold text-on-surface-variant">Live Order Analytics</span>
          </div>

          <div className="overflow-auto max-h-[600px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-surface-container-low shadow-2xs">
                <tr className="border-b border-outline-variant">
                  <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Bundle Name</th>
                  <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Price</th>
                  <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Units Sold</th>
                  <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Total Revenue</th>
                  <th className="p-3.5 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-[11px]">Sales Trend</th>
                </tr>
              </thead>
              <tbody>
                {bundles.map(bundle => {
                  const stats = getBundleSalesInfo(bundle.id, bundle.name, bundle.price);
                  return (
                    <tr key={bundle.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors text-xs">
                      <td className="p-3.5 flex items-center gap-3">
                        {bundle.image ? (
                          <div className="w-10 h-10 rounded-lg bg-surface-container bg-cover bg-center shrink-0 border border-outline-variant" style={{ backgroundImage: `url(${bundle.image})` }}></div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant">
                            <span className="material-symbols-outlined text-outline">inventory_2</span>
                          </div>
                        )}
                        <div>
                          <p className="font-title-md text-on-surface font-bold text-xs">{bundle.name}</p>
                          <p className="text-[10px] text-on-surface-variant truncate max-w-[200px]">{bundle.description}</p>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-on-surface">₹{bundle.price}</td>
                      <td className="p-3.5 font-bold text-on-surface">
                        <span className="px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container font-bold text-xs">
                          {stats.totalSold} Units Sold
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-primary text-sm">
                        ₹{stats.totalRevenue.toLocaleString()}
                      </td>
                      <td className="p-3.5 font-bold">
                        <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface text-[11px] border border-outline-variant">
                          {stats.badge}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER REQUESTED CUSTOM BUNDLES & HISTORY */}
      {activeTab === 'requests' && (
        <div className="flex flex-col gap-4">
          {/* Sub-Header & Status Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">mark_email_unread</span>
              <div>
                <h3 className="font-bold text-on-surface text-sm">Customer Custom Bundle Requests</h3>
                <p className="text-xs text-on-surface-variant">Review customer requests, convert them to active store bundles, and track request history.</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant self-start sm:self-auto">
              <button
                onClick={() => setRequestFilter('all')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  requestFilter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                All ({bundleRequests.length})
              </button>

              <button
                onClick={() => setRequestFilter('pending')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  requestFilter === 'pending' ? 'bg-error text-on-error' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Pending ({bundleRequests.filter(r => r.status === 'pending').length})
              </button>

              <button
                onClick={() => setRequestFilter('approved')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  requestFilter === 'approved' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Approved ({bundleRequests.filter(r => r.status === 'approved').length})
              </button>

              <button
                onClick={() => setRequestFilter('fulfilled')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                  requestFilter === 'fulfilled' ? 'bg-secondary text-on-secondary' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Fulfilled ({bundleRequests.filter(r => r.status === 'fulfilled').length})
              </button>
            </div>
          </div>

          {/* Requests History List / Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map(req => (
              <div key={req.id} className="bg-surface-container-lowest p-5 rounded-2xl border border-outline-variant flex flex-col gap-3 shadow-xs hover:border-primary/50 transition-colors">
                
                {/* Request Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-outline-variant/60 pb-3">
                  <div>
                    <h4 className="font-bold text-on-surface text-base">{req.userName}</h4>
                    <p className="text-xs text-on-surface-variant font-medium">✉️ {req.userEmail} | 📞 {req.userPhone}</p>
                    <p className="text-[10px] text-outline mt-0.5">Requested on: {req.createdAt}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shrink-0 ${
                    req.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : req.status === 'approved'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {req.status === 'pending' ? '⏳ Pending Approval' : req.status === 'approved' ? '✅ Approved & Created' : '🎉 Fulfilled'}
                  </span>
                </div>

                {/* Requested Items Tags */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary">Requested Plants &amp; Care Items:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(req.requestedItems || []).map((item: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface-container-high text-on-surface text-xs font-bold rounded-lg border border-outline-variant/60">
                        🌱 {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Custom Notes & Target Budget */}
                <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant/60 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface-variant">Customer Notes / Specs:</span>
                    <span className="text-xs font-bold text-primary">Target Budget: ₹{req.budget}</span>
                  </div>
                  <p className="text-xs text-on-surface italic">{req.notes || 'No extra notes provided.'}</p>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 mt-auto border-t border-outline-variant/60">
                  <button
                    onClick={() => handleConvertRequestToBundle(req)}
                    className="flex items-center gap-1.5 text-xs font-bold bg-primary text-on-primary hover:bg-secondary px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-2xs"
                  >
                    <span className="material-symbols-outlined text-sm">auto_awesome</span>
                    <span>Convert to Store Bundle</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {req.status !== 'fulfilled' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'fulfilled')}
                        className="text-xs font-bold text-secondary hover:bg-secondary-container/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Mark Fulfilled
                      </button>
                    )}
                    {req.status === 'pending' && (
                      <button
                        onClick={() => updateRequestStatus(req.id, 'approved')}
                        className="text-xs font-bold text-primary hover:bg-primary-container/40 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {filteredRequests.length === 0 && (
              <div className="col-span-2 p-12 text-center text-on-surface-variant italic bg-surface-container-lowest rounded-2xl border border-outline-variant">
                No user custom bundle requests found in this filter category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* BUNDLE CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest z-10 shrink-0">
              <div>
                <h3 className="font-headline-sm text-primary font-bold">
                  {editingBundle ? 'Edit Storefront Bundle' : 'Create New Bundle'}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Bundle collection images are dynamically built from selected items.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors cursor-pointer">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {/* Modal Search Bar */}
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
                  className="text-xs text-on-surface-variant hover:text-primary font-bold cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="overflow-y-auto flex-1">
              <form id="bundleForm" onSubmit={handleSave} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 pb-24">
              
                {/* Left Column: Details + Plants Picker */}
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

                  {/* Left Panel: Plants */}
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

                {/* Right Column: Dynamic Image Preview + Plant Care Items Picker */}
                <div className="flex flex-col gap-6 lg:border-l lg:border-outline-variant lg:pl-8">
                  
                  {/* Dynamic Image Collage */}
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
                          ✨ Bundle image is dynamically compiled from selected items.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Panel: Plant Care Items */}
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
              
            {/* Sticky Modal Footer */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3 rounded-b-2xl shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer">
                Cancel
              </button>
              <button type="submit" form="bundleForm" className="px-8 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:bg-secondary transition-colors cursor-pointer">
                Save Bundle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
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
