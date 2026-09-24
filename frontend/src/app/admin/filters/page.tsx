"use client";

import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ConfirmModal from '@/components/ConfirmModal';

const DEFAULT_CATEGORIES = [
  { id: 'cat_default_1', name: 'Air Purifying', description: 'Plants that clean the air', group: 'plants' },
  { id: 'cat_default_2', name: 'Low Light Tolerant', description: 'Plants that survive in low light', group: 'plants' },
  { id: 'cat_default_3', name: 'Pet-Safe Sanctuaries', description: 'Non-toxic to cats and dogs', group: 'plants' },
  { id: 'cat_default_4', name: 'Monsteras & Aroids', description: 'Tropical statement plants', group: 'plants' },
  { id: 'cat_default_5', name: 'Care & Soil', description: 'Potting mix, fertilizers, and pest control', group: 'essentials' }
];

export default function FiltersPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  
  // Search State
  const [categorySearch, setCategorySearch] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group: 'plants'
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
      // Fetch Categories
      const catSnap = await getDocs(collection(db, 'categories'));
      let cats: any[] = [];
      catSnap.forEach((doc) => {
        cats.push({ id: doc.id, ...doc.data() });
      });
      
      if (cats.length === 0) {
        for (const defaultCat of DEFAULT_CATEGORIES) {
          const docRef = doc(db, 'categories', defaultCat.id);
          await setDoc(docRef, defaultCat);
          cats.push(defaultCat);
        }
      }
      setCategories(cats);

      // Fetch Products to count items per category
      const prodSnap = await getDocs(collection(db, 'products'));
      let prods: any[] = [];
      prodSnap.forEach((doc) => {
        prods.push({ id: doc.id, ...doc.data() });
      });
      setProducts(prods);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || '',
        group: category.group || 'plants'
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        group: 'plants'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        const docRef = doc(db, 'categories', editingCategory.id);
        await updateDoc(docRef, formData);
      } else {
        const newId = `cat_${Date.now()}`;
        const docRef = doc(db, 'categories', newId);
        await setDoc(docRef, { ...formData, id: newId });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error saving category:", error);
      showAlert("Save Failed", "Failed to save category.", "danger");
    }
  };

  const handleDelete = (id: string, name: string = 'this category') => {
    setConfirmState({
      isOpen: true,
      title: "Delete Category?",
      message: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      confirmText: "Delete Category",
      cancelText: "Cancel",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'categories', id));
          fetchData();
        } catch (error) {
          console.error("Error deleting category:", error);
          showAlert("Delete Failed", "Failed to delete category.", "danger");
        } finally {
          closeConfirmModal();
        }
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredCategories = categories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  const plantCategories = filteredCategories.filter(c => c.group === 'plants');
  const essentialCategories = filteredCategories.filter(c => c.group === 'essentials');

  const getProductsForCategory = (categoryName: string) => {
    return products.filter(p => p.category === categoryName);
  };

  const renderCategoryRow = (category: any) => {
    const categoryProducts = getProductsForCategory(category.name);
    const isExpanded = expandedCategories[category.id];

    return (
      <React.Fragment key={category.id}>
        <tr className="border-b border-outline-variant hover:bg-surface-container-low/50 transition-colors">
          <td className="p-4">
            <p className="font-title-md text-on-surface font-bold">{category.name}</p>
          </td>
          <td className="p-4">
            <button 
              onClick={() => toggleExpand(category.id)}
              className="flex items-center gap-1 text-sm font-bold bg-surface-container hover:bg-surface-container-high px-3 py-1.5 rounded-full transition-colors text-on-surface"
            >
              {categoryProducts.length} items
              <span className="material-symbols-outlined text-[16px]">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </td>
          <td className="p-4 text-on-surface-variant text-sm max-w-[200px] truncate">{category.description || '-'}</td>
          <td className="p-4 text-right">
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => handleOpenModal(category)} className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-full hover:bg-primary/10">
                <span className="material-symbols-outlined text-sm">edit</span>
              </button>
              <button onClick={() => handleDelete(category.id, category.name)} className="p-2 text-on-surface-variant hover:text-error transition-colors rounded-full hover:bg-error/10">
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          </td>
        </tr>
        {isExpanded && (
          <tr className="bg-surface-container-lowest border-b border-outline-variant">
            <td colSpan={4} className="p-4 px-8 max-w-0 w-full">
              <div className="flex flex-col gap-2 w-full">
                <h4 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Products in this Category</h4>
                {categoryProducts.length > 0 ? (
                  <div className="w-full overflow-hidden">
                    <ul className="flex overflow-x-auto gap-4 mt-3 pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-surface-container-low [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-outline transition-colors">
                      {categoryProducts.map((product: any, idx: number) => (
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
                  <p className="text-sm text-on-surface-variant italic">No products found in this category.</p>
                )}
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="flex flex-col gap-4 lg:gap-6 h-full pb-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-primary text-2xl md:text-3xl font-bold">Filters & Categories</h1>
          <p className="text-on-surface-variant font-body-sm md:font-body-md mt-1 md:mt-2">Manage the categories and filter tags for your store.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 md:flex-none">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input 
              type="text"
              placeholder="Search categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none w-full"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-primary hover:bg-secondary text-on-primary px-4 py-2 md:px-5 md:py-2.5 rounded-lg font-label-sm md:font-label-md uppercase tracking-wider font-bold transition-colors flex items-center gap-1 md:gap-2 shrink-0"
          >
            <span className="material-symbols-outlined text-[18px] md:text-2xl">add</span>
            <span className="hidden sm:inline">Add Category</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 overflow-auto flex-1 min-h-0">
        {loading ? (
          <div className="p-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant">Loading categories...</div>
        ) : (
          <>
            {/* Plants Section */}
            <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden shrink-0">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">psychiatry</span>
                <h3 className="font-title-md font-bold text-on-surface">Plants</h3>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low/50 shadow-sm text-xs uppercase tracking-wider">
                    <tr className="border-b border-outline-variant text-on-surface-variant font-bold">
                      <th className="p-4 w-[25%]">Category Name</th>
                      <th className="p-4 w-[20%]">Items</th>
                      <th className="p-4 w-[40%]">Description</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plantCategories.map(renderCategoryRow)}
                    {plantCategories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant text-sm">
                          No plant categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Plant Essentials Section */}
            <div className="bg-surface-container-lowest rounded-xl md:rounded-2xl border border-outline-variant flex flex-col overflow-hidden shrink-0">
              <div className="p-4 bg-surface-container-low border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">handyman</span>
                <h3 className="font-title-md font-bold text-on-surface">Plant Essentials</h3>
              </div>
              <div className="overflow-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low/50 shadow-sm text-xs uppercase tracking-wider">
                    <tr className="border-b border-outline-variant text-on-surface-variant font-bold">
                      <th className="p-4 w-[25%]">Category Name</th>
                      <th className="p-4 w-[20%]">Items</th>
                      <th className="p-4 w-[40%]">Description</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {essentialCategories.map(renderCategoryRow)}
                    {essentialCategories.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-on-surface-variant text-sm">
                          No essential categories found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant bg-surface-container-lowest z-10 shrink-0">
              <h3 className="font-headline-sm text-primary font-bold">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-error p-1 rounded-full hover:bg-error/10 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form id="categoryForm" onSubmit={handleSave} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Category Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="e.g. Care & Soil"
                  className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Description (Optional)</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                  placeholder="Brief description of this category"
                  rows={3}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none resize-none" 
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Group</label>
                <select 
                  value={formData.group}
                  onChange={e => setFormData({...formData, group: e.target.value})}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="plants">Plants</option>
                  <option value="essentials">Plant Essentials</option>
                </select>
              </div>
            </form>
              
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant flex justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-lg font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Cancel
              </button>
              <button type="submit" form="categoryForm" className="px-8 py-2.5 rounded-lg font-bold bg-primary text-on-primary hover:bg-secondary transition-colors">
                Save
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
