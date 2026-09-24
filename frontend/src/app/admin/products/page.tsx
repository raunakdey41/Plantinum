"use client";

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import ConfirmModal from '@/components/ConfirmModal';

const PLANT_CATEGORIES = [
  'Air Purifying',
  'Low Light Tolerant',
  'Pet-Safe Sanctuaries',
  'Monsteras & Aroids',
  'Flowering',
  'Statement Plant'
];

const CARE_CATEGORIES = [
  'Potting Mix & Soil',
  'Organic Fertilizers',
  'Pest Control',
  'Tools & Accessories'
];

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Product Type State ('plant' | 'care')
  const [productType, setProductType] = useState<'plant' | 'care'>('plant');

  // Products Filter State
  const [productSearch, setProductSearch] = useState('');

  // Pexels Dialog Modal State
  const [isPexelsModalOpen, setIsPexelsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Category Input State
  const [customCategoryInput, setCustomCategoryInput] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    botanicalName: '',
    price: 0,
    discount: 0,
    stock: 50,
    category: '',
    gallery: [] as string[],
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

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      const prods: any[] = [];
      querySnapshot.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product: any = null) => {
    setSearchResults([]);
    setIsPexelsModalOpen(false);
    setCustomCategoryInput('');

    if (product) {
      setEditingProduct(product);
      const isCare = product.category === 'Care & Soil' || CARE_CATEGORIES.some(c => (product.category || '').includes(c));
      setProductType(isCare ? 'care' : 'plant');
      setFormData({
        name: product.name || '',
        botanicalName: product.botanicalName || '',
        price: product.price || 0,
        discount: product.discount || 0,
        stock: product.stock || 0,
        category: product.category || '',
        gallery: product.gallery || (product.image ? [product.image] : []),
        isAvailable: product.isAvailable !== false
      });
      setSearchQuery(product.name || '');
    } else {
      setEditingProduct(null);
      setProductType('plant');
      setFormData({
        name: '',
        botanicalName: '',
        price: 0,
        discount: 0,
        stock: 50,
        category: PLANT_CATEGORIES[0],
        gallery: [],
        isAvailable: true
      });
      setSearchQuery('');
    }
    setIsModalOpen(true);
  };

  const handleProductTypeChange = (newType: 'plant' | 'care') => {
    setProductType(newType);
    // Reset categories to default preset of selected type
    const defaultCat = newType === 'plant' ? PLANT_CATEGORIES[0] : CARE_CATEGORIES[0];
    setFormData(prev => ({ ...prev, category: defaultCat }));
  };

  // Helper for Category Checkbox Toggling
  const selectedCategoryList = (formData.category || '')
    .split(',')
    .map(c => c.trim())
    .filter(Boolean);

  const toggleCategoryCheckbox = (catName: string) => {
    let updated: string[];
    if (selectedCategoryList.includes(catName)) {
      updated = selectedCategoryList.filter(c => c !== catName);
    } else {
      updated = [...selectedCategoryList, catName];
    }
    setFormData(prev => ({ ...prev, category: updated.join(', ') }));
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryInput.trim()) return;
    const tag = customCategoryInput.trim();
    if (!selectedCategoryList.includes(tag)) {
      const updated = [...selectedCategoryList, tag];
      setFormData(prev => ({ ...prev, category: updated.join(', ') }));
    }
    setCustomCategoryInput('');
  };

  // Execute Pexels Image Search
  const searchImages = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    const finalSearchTerm = productType === 'care' 
      ? `${searchQuery.trim()} package` 
      : searchQuery.trim();

    setIsSearching(true);
    setIsPexelsModalOpen(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(finalSearchTerm)}`);
      const data = await res.json();
      if (data.images && data.images.length > 0) {
        setSearchResults(data.images);
      } else if (data.error) {
        showAlert("Search Error", `Pexels Search Error: ${data.error}`, "danger");
      } else {
        showAlert("No Images Found", `No images found on Pexels for "${finalSearchTerm}"`, "warning");
      }
    } catch (err: any) {
      console.error("Failed to search images", err);
      showAlert("Search Error", "Error searching images via Pexels API.", "danger");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, file);
      const downloadURL = await getDownloadURL(uploadTask.ref);

      setFormData(prev => ({
        ...prev,
        gallery: [...prev.gallery, downloadURL]
      }));
    } catch (err) {
      console.error("Upload failed", err);
      showAlert("Upload Failed", "Failed to upload image.", "danger");
    } finally {
      setUploading(false);
    }
  };

  const addImageToGallery = (url: string) => {
    if (!formData.gallery.includes(url)) {
      setFormData(prev => ({ ...prev, gallery: [...prev.gallery, url] }));
    }
  };

  const removeImageFromGallery = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      gallery: prev.gallery.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSave = {
        ...formData,
        category: productType === 'care' && !formData.category.includes('Care & Soil') 
          ? `Care & Soil, ${formData.category}` 
          : formData.category,
        image: formData.gallery.length > 0 ? formData.gallery[0] : ''
      };

      if (editingProduct) {
        const docRef = doc(db, 'products', editingProduct.id);
        await updateDoc(docRef, dataToSave);
      } else {
        const newId = `p_${Date.now()}`;
        const docRef = doc(db, 'products', newId);
        await setDoc(docRef, { ...dataToSave, id: newId });
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      showAlert("Save Failed", "Failed to save product.", "danger");
    }
  };

  const handleDelete = (id: string, name: string = 'this product') => {
    setConfirmState({
      isOpen: true,
      title: "Delete Product?",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Product",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'products', id));
          fetchProducts();
        } catch (error) {
          console.error("Error deleting product:", error);
          showAlert("Delete Failed", "Failed to delete product.", "danger");
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  const activeCategories = productType === 'plant' ? PLANT_CATEGORIES : CARE_CATEGORIES;

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Products Management</h1>
          <p className="text-on-surface-variant font-body-sm md:font-body-md mt-1 md:mt-2">Manage your inventory, prices, and availability.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input 
              type="text"
              placeholder="Search products..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none w-full"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-label-sm md:font-label-md uppercase tracking-wider font-bold transition-colors flex items-center gap-1 md:gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] md:text-2xl">add</span>
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden flex-1 min-h-0">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant">Loading products...</div>
        ) : (
          <div className="overflow-auto flex-1 relative">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-surface-container-low shadow-sm">
                <tr className="border-b border-outline-variant">
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Product</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Category</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Price</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs">Stock</th>
                  <th className="p-4 font-label-md text-on-surface-variant font-bold uppercase tracking-wider text-xs text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products
                  .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || (p.botanicalName && p.botanicalName.toLowerCase().includes(productSearch.toLowerCase())))
                  .map(product => (
                  <tr key={product.id} className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 flex items-center gap-4">
                      {product.image && (
                        <div className="w-12 h-12 rounded-lg bg-surface-container bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${product.image})` }}></div>
                      )}
                      <div>
                        <p className="font-title-md text-on-surface font-bold">{product.name}</p>
                        <p className="text-xs text-on-surface-variant italic">{product.botanicalName}</p>
                      </div>
                    </td>
                    <td className="p-4 text-on-surface text-sm">{product.category}</td>
                    <td className="p-4 text-on-surface font-bold">₹{product.price}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock > 10 ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
                        {product.stock} left
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(product)} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10">
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button onClick={() => handleDelete(product.id, product.name)} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10">
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Main Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
            
            {/* Modal Header with Product Type Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest z-10 shrink-0 gap-4">
              <div className="flex items-center gap-4">
                <h3 className="font-headline-sm text-primary font-bold">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>

                {/* Product Type Toggle Selector */}
                <div className="flex items-center bg-surface-container p-1 rounded-xl border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('plant')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      productType === 'plant'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span>🌿</span>
                    <span>Plant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleProductTypeChange('care')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      productType === 'care'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    <span>🧪</span>
                    <span>Plant Care Item</span>
                  </button>
                </div>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors self-end sm:self-auto">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              <form id="productForm" onSubmit={handleSave} className="p-6 flex flex-col md:flex-row gap-8 pb-24">
              
              {/* Left Column: Details */}
              <div className="flex-1 flex flex-col gap-5">
                <h4 className="font-title-md font-bold text-on-surface border-b border-outline-variant pb-2">Product Details</h4>
                
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Product Name</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => {
                      const newName = e.target.value;
                      setFormData(prev => ({ ...prev, name: newName }));
                      setSearchQuery(newName);
                    }} 
                    placeholder={productType === 'plant' ? "e.g. Monstera Deliciosa" : "e.g. NPK 19:19:19"}
                    className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {productType === 'plant' ? "Botanical Name (Optional)" : "Description / Formula Specs"}
                  </label>
                  <input 
                    type="text" 
                    value={formData.botanicalName} 
                    onChange={e => setFormData({...formData, botanicalName: e.target.value})} 
                    placeholder={productType === 'plant' ? "e.g. Monstera deliciosa" : "e.g. Water Soluble Fertilizer for Foliage"}
                    className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Price (₹)</label>
                    <input type="number" required value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Stock Qty</label>
                    <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                </div>

                {/* Preset Categories Checkboxes Section */}
                <div className="flex flex-col gap-2 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <div className="flex items-center justify-between border-b border-outline-variant pb-2 mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-primary">
                      {productType === 'plant' ? "Plant Categories & Badges" : "Plant Care Categories"}
                    </label>
                    <span className="text-[11px] text-on-surface-variant">Select all that apply</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    {activeCategories.map((cat) => {
                      const isChecked = selectedCategoryList.includes(cat);
                      return (
                        <label 
                          key={cat} 
                          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors border text-xs font-bold ${
                            isChecked
                              ? 'bg-primary-container/40 border-primary text-primary'
                              : 'bg-surface-container-lowest border-outline-variant text-on-surface hover:bg-surface-container'
                          }`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => toggleCategoryCheckbox(cat)}
                            className="w-4 h-4 accent-primary cursor-pointer"
                          />
                          <span>{cat}</span>
                        </label>
                      );
                    })}
                  </div>

                  {/* Add Custom Category Tag */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-outline-variant/60">
                    <input
                      type="text"
                      placeholder="Add custom tag..."
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomCategory}
                      className="px-3 py-1.5 bg-secondary text-on-secondary text-xs font-bold rounded-lg hover:bg-primary transition-colors"
                    >
                      + Add
                    </button>
                  </div>

                  {/* Display Current Selected Category String */}
                  <div className="text-[11px] text-on-surface-variant mt-1">
                    Selected: <strong className="text-primary">{formData.category || 'None'}</strong>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 mt-1 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
                  <input type="checkbox" id="isAvailable" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="w-5 h-5 accent-primary cursor-pointer" />
                  <div>
                    <label htmlFor="isAvailable" className="text-sm font-bold text-on-surface cursor-pointer block">Visible on Storefront</label>
                    <p className="text-xs text-on-surface-variant">If unchecked, customers cannot see or buy this product.</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Images */}
              <div className="flex-1 flex flex-col gap-5 border-l border-outline-variant pl-8">
                <div className="flex items-center justify-between border-b border-outline-variant pb-2">
                  <h4 className="font-title-md font-bold text-on-surface">Image Gallery</h4>
                  <div className="flex gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs bg-surface-container text-on-surface px-3 py-1.5 rounded-lg font-bold hover:bg-surface-container-high transition-colors flex items-center gap-1 border border-outline-variant">
                      <span className="material-symbols-outlined text-[14px]">upload</span>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>

                {/* Selected Gallery Grid */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Selected Images ({formData.gallery.length})</label>
                  {formData.gallery.length === 0 ? (
                    <div className="p-8 border-2 border-dashed border-outline-variant rounded-xl text-center bg-surface-container-low">
                      <span className="material-symbols-outlined text-4xl text-outline mb-2">imagesmode</span>
                      <p className="text-sm text-on-surface-variant">No images selected yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {formData.gallery.map((url, idx) => (
                        <div key={idx} className="relative group rounded-lg overflow-hidden border border-outline-variant aspect-square bg-surface-container">
                          <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                          {idx === 0 && (
                            <div className="absolute top-1 left-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                              MAIN
                            </div>
                          )}
                          <button 
                            type="button" 
                            onClick={() => removeImageFromGallery(idx)}
                            className="absolute inset-0 bg-error/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <span className="material-symbols-outlined">delete</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Search Pexels Online Section */}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-outline-variant">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Find Images Online (Pexels API)</label>
                    {productType === 'care' && (
                      <span className="text-[11px] font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded">
                        Auto-appends "+ package"
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 flex items-center">
                      <input 
                        type="text" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            searchImages(e);
                          }
                        }}
                        placeholder="e.g. Monstera plant" 
                        className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm pr-20" 
                      />

                      {/* Unchangeable "+ package" tag indicator for Care products */}
                      {productType === 'care' && (
                        <span className="absolute right-2 px-2 py-1 bg-stone-200 text-stone-700 text-xs font-bold rounded pointer-events-none select-none">
                          + package
                        </span>
                      )}
                    </div>

                    <button 
                      type="button" 
                      onClick={(e) => searchImages(e)}
                      disabled={isSearching || !searchQuery.trim()}
                      className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">search</span>
                      <span>{isSearching ? 'Searching...' : 'Search'}</span>
                    </button>
                  </div>

                  <p className="text-[11px] text-on-surface-variant">
                    Click Search to open the Pexels Image Gallery Picker dialog in a separate window.
                  </p>
                </div>
              </div>
              </form>
            </div>
              
            {/* Sticky Footer */}
            <div className="absolute bottom-0 inset-x-0 p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3 rounded-b-2xl shrink-0 z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" form="productForm" className="px-8 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:bg-secondary transition-colors">
                Save Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Separate Pexels Image Gallery Sub-Dialog Modal */}
      {isPexelsModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden relative border border-outline-variant">
            
            {/* Sub-Dialog Header */}
            <div className="flex items-center justify-between p-5 border-b border-outline-variant bg-surface-container-low">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-0.5">
                  <span className="material-symbols-outlined text-[18px]">photo_library</span>
                  <span>Pexels Image Gallery Picker</span>
                </div>
                <h3 className="font-headline-sm text-on-surface font-bold text-base sm:text-lg">
                  Results for "{productType === 'care' ? `${searchQuery} package` : searchQuery}"
                </h3>
              </div>
              <button 
                onClick={() => setIsPexelsModalOpen(false)}
                className="text-on-surface-variant hover:text-error p-1.5 rounded-full hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Gallery Grid Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {isSearching ? (
                <div className="p-16 text-center text-on-surface-variant flex flex-col items-center justify-center gap-3">
                  <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                  <p className="font-title-md">Fetching images from Pexels API...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-16 text-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">image_search</span>
                  <p className="font-title-md">No photos found on Pexels for this search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {searchResults.map((url, i) => {
                    const isSelected = formData.gallery.includes(url);
                    return (
                      <div 
                        key={i} 
                        onClick={() => addImageToGallery(url)}
                        className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all relative group shadow-sm hover:shadow-md ${
                          isSelected
                            ? 'border-primary ring-2 ring-primary/40'
                            : 'border-transparent hover:border-primary/60'
                        }`}
                      >
                        <img src={url} alt={`Pexels result ${i}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        
                        {/* Overlay selection state */}
                        <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity p-2 ${
                          isSelected ? 'bg-primary/40 opacity-100' : 'bg-primary/20 opacity-0 group-hover:opacity-100'
                        }`}>
                          <span className="material-symbols-outlined text-white text-3xl shadow-sm">
                            {isSelected ? 'check_circle' : 'add_circle'}
                          </span>
                          <span className="text-white text-xs font-bold mt-1 bg-black/60 px-2 py-0.5 rounded shadow">
                            {isSelected ? 'Added to Product' : 'Click to Add'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sub-Dialog Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-bold">
                {formData.gallery.length} image(s) selected for product gallery
              </span>
              <button 
                type="button" 
                onClick={() => setIsPexelsModalOpen(false)}
                className="px-6 py-2 bg-primary text-on-primary font-bold text-sm rounded-lg hover:bg-secondary transition-colors"
              >
                Done
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
