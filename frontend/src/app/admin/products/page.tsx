"use client";

import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // Products Filter State
  const [productSearch, setProductSearch] = useState('');
  
  // Image Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    botanicalName: '',
    price: 0,
    discount: 0,
    stock: 0,
    category: '',
    gallery: [] as string[],
    isAvailable: true
  });

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
    if (product) {
      setEditingProduct(product);
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
      setFormData({
        name: '',
        botanicalName: '',
        price: 0,
        discount: 0,
        stock: 50,
        category: '',
        gallery: [],
        isAvailable: true
      });
      setSearchQuery('');
    }
    setIsModalOpen(true);
  };

  const searchImages = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/images/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.images) {
        setSearchResults(data.images);
      }
    } catch (err) {
      console.error("Failed to search images", err);
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
      alert("Failed to upload image.");
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
        image: formData.gallery.length > 0 ? formData.gallery[0] : '' // legacy compat
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
      alert("Failed to save product.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

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
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest z-10 shrink-0">
              <h3 className="font-headline-sm text-primary font-bold">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors">
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
                  <input type="text" required value={formData.name} onChange={e => {
                    setFormData({...formData, name: e.target.value});
                    if (!editingProduct && !searchQuery) setSearchQuery(e.target.value);
                  }} className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Botanical Name (Optional)</label>
                  <input type="text" value={formData.botanicalName} onChange={e => setFormData({...formData, botanicalName: e.target.value})} className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" />
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Category</label>
                  <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="e.g. Air Purifying" className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" />
                </div>
                
                <div className="flex items-center gap-3 mt-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant">
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

                {/* Selected Gallery */}
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

                {/* Search Pexels */}
                <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-outline-variant">
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Find Images Online</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)} 
                      placeholder="e.g. Monstera plant" 
                      className="flex-1 px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none text-sm" 
                    />
                    <button 
                      type="button" 
                      onClick={searchImages}
                      disabled={isSearching || !searchQuery}
                      className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>

                  {searchResults.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto p-1">
                      {searchResults.map((url, i) => (
                        <div 
                          key={i} 
                          onClick={() => addImageToGallery(url)}
                          className="aspect-square rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all relative group"
                        >
                          <img src={url} alt="Search result" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white shadow-sm">add_circle</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
    </div>
  );
}
