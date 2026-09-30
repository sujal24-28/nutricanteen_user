'use client';
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Search,
  X,
  Eye,
  ShoppingBag,
  TrendingUp,
  Clock,
  Calendar,
  Tag,
  CheckCircle,
  XCircle,
  RefreshCw,
  Utensils
} from 'lucide-react';

interface MenuItemType {
  id: number;
  name: string;
  description: string;
  price: string | number;
  mrp?: string | number | null;
  category: string;
  food_type?: 'veg' | 'non-veg' | 'egg' | string;
  is_available: boolean;
  daily_limit?: number | null;
  image_url?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

// FSSAI-style Dietary Symbol Component (Veg, Non-Veg, Egg)
export const FoodTypeSymbol = ({ type, size = 'sm' }: { type?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const t = (type || 'veg').toLowerCase();

  if (t === 'non-veg' || t === 'non_veg' || t === 'nonveg') {
    return (
      <span
        title="Non-Vegetarian"
        className={`inline-flex items-center justify-center border border-red-700 bg-red-50/80 rounded-xs flex-shrink-0 ${
          size === 'lg' ? 'w-5 h-5 p-0.5' : size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
        }`}
      >
        <span
          className={`w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-700 inline-block ${
            size === 'lg' ? 'border-l-[5px] border-r-[5px] border-b-[8px]' : ''
          }`}
        />
      </span>
    );
  }

  if (t === 'egg' || t === 'eggetarian') {
    return (
      <span
        title="Egg Only"
        className={`inline-flex items-center justify-center border border-amber-600 bg-amber-50/80 rounded-xs flex-shrink-0 ${
          size === 'lg' ? 'w-5 h-5 p-0.5' : size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
        }`}
      >
        <span
          className={`rounded-full bg-amber-600 inline-block ${
            size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'
          }`}
        />
      </span>
    );
  }

  // Pure Veg
  return (
    <span
      title="Pure Vegetarian"
      className={`inline-flex items-center justify-center border border-emerald-600 bg-emerald-50/80 rounded-xs flex-shrink-0 ${
        size === 'lg' ? 'w-5 h-5 p-0.5' : size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
      }`}
    >
      <span
        className={`rounded-full bg-emerald-600 inline-block ${
          size === 'lg' ? 'w-2.5 h-2.5' : size === 'md' ? 'w-2 h-2' : 'w-1.5 h-1.5'
        }`}
      />
    </span>
  );
};

interface ItemDetailResponse {
  item: MenuItemType;
  stats: {
    totalSold: number;
    totalRevenue: number;
    totalOrders: number;
  };
  recentOrders: Array<{
    id: number;
    orderId: number;
    quantity: number;
    unitPrice: number | string;
    orderStatus: string;
    studentName: string;
    studentClass: string;
    studentRoll: string;
    orderDate?: string;
  }>;
}

interface CategoryType {
  id: number;
  name: string;
  slug: string;
  description?: string;
  item_count?: number;
}

export default function MenuPage() {
  const [menu, setMenu] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [isSubmittingCat, setIsSubmittingCat] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', description: '', price: '', mrp: '', category: 'General', food_type: 'veg', is_available: true });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // View Details Modal State
  const [activeItemId, setActiveItemId] = useState<number | null>(null);
  const [itemDetails, setItemDetails] = useState<ItemDetailResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchMenu = async () => {
    const res = await fetch('/api/menu?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) setMenu(await res.json());
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim() || isSubmittingCat) return;
    setIsSubmittingCat(true);
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCatName.trim(), description: newCatDesc.trim() })
      });
      if (res.ok) {
        setNewCatName('');
        setNewCatDesc('');
        await fetchCategories();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add category');
      }
    } catch (e) {
      alert('An unexpected error occurred');
    } finally {
      setIsSubmittingCat(false);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"? Any items in this category will be moved to "General".`)) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
        await fetchMenu();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete category');
      }
    } catch (e) {
      alert('Failed to delete category');
    }
  };

  const openItemDetails = async (id: number) => {
    setActiveItemId(id);
    setLoadingDetails(true);
    try {
      const res = await fetch(`/api/menu/${id}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        setItemDetails(await res.json());
      }
    } catch (e) {
      console.error('Failed to load item details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeItemDetails = () => {
    setActiveItemId(null);
    setItemDetails(null);
  };

  const toggleAvailability = async (item: MenuItemType) => {
    const newStatus = !item.is_available;
    // Optimistically update details modal if currently open
    if (itemDetails && itemDetails.item.id === item.id) {
      setItemDetails({
        ...itemDetails,
        item: {
          ...itemDetails.item,
          is_available: newStatus
        }
      });
    }
    // Optimistically update menu list table
    setMenu(prev => prev.map(m => m.id === item.id ? { ...m, is_available: newStatus } : m));

    try {
      const res = await fetch(`/api/menu/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: newStatus })
      });
      if (res.ok) {
        await fetchMenu();
      } else {
        fetchMenu();
        if (activeItemId === item.id) openItemDetails(item.id);
      }
    } catch (e) {
      console.error('Failed to toggle availability:', e);
      fetchMenu();
      if (activeItemId === item.id) openItemDetails(item.id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/menu/${formData.id}` : '/api/menu';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = new FormData();
    const rawName = (formData.name || '').trim();
    const formattedName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';
    payload.append('name', formattedName);
    payload.append('description', formData.description || '');
    payload.append('price', formData.price.toString());
    payload.append('mrp', formData.mrp ? formData.mrp.toString() : '');
    payload.append('category', formData.category);
    payload.append('food_type', formData.food_type || 'veg');
    payload.append('is_available', formData.is_available.toString());
    if (imageFile) {
      payload.append('image', imageFile);
    }

    const res = await fetch(url, {
      method,
      body: payload
    });

    if (res.ok) {
      setShowForm(false);
      setImageFile(null);
      fetchMenu();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to save menu item');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;
    const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchMenu();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete menu item');
    }
  };

  // Filtered menu items
  const filteredMenu = menu.filter((item) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q) ||
      item.food_type?.toLowerCase().includes(q) ||
      item.price?.toString().includes(q) ||
      item.mrp?.toString().includes(q);

    const matchesCategory =
      categoryFilter === 'all' ||
      item.category?.toLowerCase() === categoryFilter.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const getImageSrc = (img?: string | null) => {
    if (!img) return null;
    return img.startsWith('http') ? img : `http://localhost:5000${img}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-dark">
            Menu Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage dishes, pricing & MRP, dietary types (Veg/Non-Veg/Egg), photos, and inspect individual item analytics</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowCategoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 hover:border-brand-gold text-brand-brown-dark font-semibold rounded-lg transition-colors shadow-xs text-sm cursor-pointer"
          >
            <Tag size={16} className="text-brand-gold" />
            <span>Manage Categories</span>
            <span className="ml-1 px-1.5 py-0.5 text-xs bg-gray-100 rounded-full font-bold">
              {categories.length}
            </span>
          </button>
          <button
            onClick={() => {
              setFormData({ name: '', description: '', price: '', mrp: '', category: categories[0]?.slug || 'general', food_type: 'veg', is_available: true });
              setImageFile(null);
              setShowForm(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg transition-colors shadow-sm text-sm cursor-pointer"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Search and Category Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-brown-light/20 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
            placeholder="Search items by name, category, price..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category dropdown filter */}
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/60 capitalize"
          >
            <option value="all">All Categories ({menu.length})</option>
            {categories.map((c) => {
              const count = menu.filter(m => m.category?.toLowerCase() === c.slug.toLowerCase() || m.category?.toLowerCase() === c.name.toLowerCase()).length;
              return (
                <option key={c.id} value={c.slug}>
                  {c.name} ({count})
                </option>
              );
            })}
          </select>

          {/* Items count badge */}
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-2 rounded-lg font-medium whitespace-nowrap">
            Showing {filteredMenu.length} of {menu.length}
          </span>
        </div>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold text-brand-brown-dark mb-4">{formData.id ? 'Edit Item' : 'New Menu Item'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                required
                className="w-full border p-2 rounded-lg"
                value={formData.name}
                onChange={e => {
                  const val = e.target.value;
                  const capitalized = val ? val.charAt(0).toUpperCase() + val.slice(1) : '';
                  setFormData({ ...formData, name: capitalized });
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selling Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 179"
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                <span>MRP / List Price (₹)</span>
                {formData.mrp && Number(formData.mrp) > Number(formData.price) && (
                  <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {Math.round(((Number(formData.mrp) - Number(formData.price)) / Number(formData.mrp)) * 100)}% OFF
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 249 (optional)"
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                value={formData.mrp ?? ''}
                onChange={e => setFormData({...formData, mrp: e.target.value})}
              />
              <p className="text-[11px] text-gray-400 mt-1">If entered, MRP will be strikethrough with discount % badge shown</p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="text-xs text-brand-gold hover:underline font-bold cursor-pointer"
                >
                  + Manage Categories
                </button>
              </div>
              <select required className="w-full border p-2 rounded-lg bg-white capitalize" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select className="w-full border p-2 rounded-lg bg-white" value={formData.is_available.toString()} onChange={e => setFormData({...formData, is_available: e.target.value === 'true'})}>
                <option value="true">Available</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Dietary Preference / Food Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, food_type: 'veg' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                    (formData.food_type || 'veg') === 'veg'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FoodTypeSymbol type="veg" size="md" />
                  <span>Veg (Pure)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, food_type: 'non-veg' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                    formData.food_type === 'non-veg'
                      ? 'border-red-600 bg-red-50 text-red-800 ring-2 ring-red-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FoodTypeSymbol type="non-veg" size="md" />
                  <span>Non-Veg</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, food_type: 'egg' })}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border text-sm font-semibold transition cursor-pointer ${
                    formData.food_type === 'egg'
                      ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/30'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FoodTypeSymbol type="egg" size="md" />
                  <span>Egg Only</span>
                </button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea className="w-full border p-2 rounded-lg" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Item Photo</label>
              <input type="file" accept="image/*" className="w-full border p-2 rounded-lg text-sm" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
              {formData.image_url && !imageFile && <p className="text-xs mt-1 text-gray-500">Current image: {formData.image_url}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-brown-dark text-white rounded-lg hover:bg-brand-brown text-sm font-semibold">Save Item</button>
            </div>
          </form>
        </div>
      )}

      {/* Menu Table */}
      <div className="bg-white rounded-xl shadow overflow-x-auto custom-scrollbar border border-brand-brown-light/20">
        <table className="min-w-[700px] w-full divide-y divide-gray-200">
          <thead className="bg-brand-offwhite">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Price & MRP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-brand-brown-light uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMenu.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  <p className="text-sm font-medium">No menu items found</p>
                  {search && <p className="text-xs text-gray-400 mt-1">Try clearing your search query &quot;{search}&quot;</p>}
                </td>
              </tr>
            ) : (
              filteredMenu.map(item => (
                <tr key={item.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image_url ? (
                      <img
                        src={getImageSrc(item.image_url) || ''}
                        alt={item.name}
                        onClick={() => openItemDetails(item.id)}
                        className="h-11 w-11 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition"
                      />
                    ) : (
                      <div
                        onClick={() => openItemDetails(item.id)}
                        className="h-11 w-11 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400 font-semibold border border-gray-200 cursor-pointer hover:bg-gray-200"
                      >
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <FoodTypeSymbol type={item.food_type || 'veg'} size="sm" />
                      <button
                        onClick={() => openItemDetails(item.id)}
                        className="font-bold text-base text-brand-brown-dark hover:text-brand-gold-dark text-left transition capitalize"
                      >
                        {item.name}
                      </button>
                    </div>
                    {item.description && <div className="text-xs text-gray-400 line-clamp-1 max-w-xs pl-5">{item.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-extrabold text-gray-900">₹{Number(item.price).toFixed(2)}</span>
                        {item.mrp && Number(item.mrp) > Number(item.price) && (
                          <span className="text-xs text-gray-400 line-through font-medium">₹{Number(item.mrp).toFixed(2)}</span>
                        )}
                      </div>
                      {item.mrp && Number(item.mrp) > Number(item.price) && (
                        <span className="inline-flex items-center text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-blue-100">
                          {Math.round(((Number(item.mrp) - Number(item.price)) / Number(item.mrp)) * 100)}% OFF
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleAvailability(item)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          item.is_available ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={item.is_available}
                        title={item.is_available ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            item.is_available ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold ${item.is_available ? 'text-green-700' : 'text-red-600'}`}>
                        {item.is_available ? 'Available' : 'Out of Stock'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => openItemDetails(item.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                        title="View Complete Item Details & Orders"
                      >
                        <Eye size={14} />
                        View Details
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => { setFormData({ ...item, name: item.name ? item.name.charAt(0).toUpperCase() + item.name.slice(1) : '', mrp: item.mrp || '', food_type: item.food_type || 'veg' }); setImageFile(null); setShowForm(true); }}
                        className="p-1.5 text-brand-brown-light hover:text-brand-brown-dark rounded-md hover:bg-gray-100 transition"
                        title="Edit Item"
                      >
                        <Edit size={16}/>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition"
                        title="Delete Item"
                      >
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================================= */}
      {/* MENU ITEM DETAIL MODAL                                 */}
      {/* ======================================================= */}
      {activeItemId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-brown-dark text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold overflow-hidden">
                  {itemDetails?.item.image_url ? (
                    <img
                      src={getImageSrc(itemDetails.item.image_url) || ''}
                      alt={itemDetails.item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Utensils size={22} />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FoodTypeSymbol type={itemDetails?.item.food_type || 'veg'} size="md" />
                    <span>{itemDetails?.item.name || 'Loading Dish...'}</span>
                    <span className="text-xs bg-brand-gold/20 text-brand-gold border border-brand-gold/40 px-2 py-0.5 rounded-full font-semibold capitalize">
                      {itemDetails?.item.category || 'General'}
                    </span>
                  </h2>
                  <p className="text-xs text-brand-brown-light mt-0.5">
                    Item ID: #{activeItemId} · Price: ₹{itemDetails?.item.price || 0}
                  </p>
                </div>
              </div>
              <button
                onClick={closeItemDetails}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                title="Close modal"
              >
                <X size={22} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
              {loadingDetails ? (
                <div className="py-20 text-center text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm font-medium text-gray-600">Fetching item details & demand metrics...</p>
                </div>
              ) : !itemDetails ? (
                <div className="py-20 text-center text-gray-400">Failed to load item details</div>
              ) : (
                <>
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Units Sold</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">
                          {itemDetails.stats.totalSold} <span className="text-xs text-gray-500 font-normal">units</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Revenue</p>
                        <p className="text-xl font-bold text-green-600 mt-0.5">
                          ₹{Number(itemDetails.stats.totalRevenue).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                        <Clock size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Orders</p>
                        <p className="text-xl font-bold text-purple-700 mt-0.5">
                          {itemDetails.stats.totalOrders} <span className="text-xs text-gray-500 font-normal">orders</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Main Item Information Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <h3 className="text-base font-bold text-brand-brown-dark mb-4 flex items-center gap-2 border-b pb-2">
                      <Utensils size={18} className="text-brand-gold-dark" />
                      Complete Item Specifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* High-res Image preview */}
                      <div className="flex flex-col items-center">
                        <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center shadow-inner">
                          {itemDetails.item.image_url ? (
                            <img
                              src={getImageSrc(itemDetails.item.image_url) || ''}
                              alt={itemDetails.item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="text-center text-gray-400 p-4">
                              <Utensils size={36} className="mx-auto mb-2 opacity-50" />
                              <p className="text-xs font-semibold">No Image Uploaded</p>
                            </div>
                          )}
                        </div>
                        {itemDetails.item.image_url && (
                          <a
                            href={getImageSrc(itemDetails.item.image_url) || '#'}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-indigo-600 hover:underline mt-2 font-medium"
                          >
                            View Full Resolution ↗
                          </a>
                        )}
                      </div>

                      {/* Detailed Metadata */}
                      <div className="md:col-span-2 space-y-3 text-sm">
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Item Name</span>
                          <span className="font-bold text-gray-900">{itemDetails.item.name}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Selling Price</span>
                          <span className="font-bold text-brand-gold-dark text-base">₹{Number(itemDetails.item.price).toFixed(2)}</span>
                        </div>
                        {itemDetails.item.mrp && Number(itemDetails.item.mrp) > Number(itemDetails.item.price) && (
                          <>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 font-medium">MRP (List Price)</span>
                              <span className="font-semibold text-gray-400 line-through text-sm">₹{Number(itemDetails.item.mrp).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-1.5 border-b border-gray-100">
                              <span className="text-gray-500 font-medium">Discount Applied</span>
                              <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs border border-blue-200">
                                {Math.round(((Number(itemDetails.item.mrp) - Number(itemDetails.item.price)) / Number(itemDetails.item.mrp)) * 100)}% OFF (Save ₹{(Number(itemDetails.item.mrp) - Number(itemDetails.item.price)).toFixed(2)})
                              </span>
                            </div>
                          </>
                        )}
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Meal Category</span>
                          <span className="font-semibold text-gray-800 capitalize bg-gray-100 px-2 py-0.5 rounded-md text-xs">
                            {itemDetails.item.category}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Dietary Type</span>
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-800 capitalize bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md text-xs">
                            <FoodTypeSymbol type={itemDetails.item.food_type || 'veg'} size="sm" />
                            {itemDetails.item.food_type === 'non-veg' ? 'Non-Vegetarian' : itemDetails.item.food_type === 'egg' ? 'Egg Only' : 'Vegetarian'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-100">
                          <div>
                            <span className="text-gray-700 font-medium block">Availability Status</span>
                            <span className="text-[11px] text-gray-400">Toggle whether students can order this item</span>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                              itemDetails.item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${itemDetails.item.is_available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                              {itemDetails.item.is_available ? 'Available' : 'Out of Stock'}
                            </span>
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => toggleAvailability(itemDetails.item)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                itemDetails.item.is_available ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                              role="switch"
                              aria-checked={itemDetails.item.is_available}
                              title={itemDetails.item.is_available ? 'Click to mark Out of Stock' : 'Click to mark Available'}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  itemDetails.item.is_available ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Daily Kitchen Limit</span>
                          <span className="font-semibold text-gray-800">
                            {itemDetails.item.daily_limit ? `${itemDetails.item.daily_limit} units/day` : 'Unlimited'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-gray-100">
                          <span className="text-gray-500 font-medium">Created On</span>
                          <span className="text-gray-700">
                            {formatDate(itemDetails.item.created_at || itemDetails.item.createdAt)}
                          </span>
                        </div>
                        <div className="pt-1">
                          <span className="text-gray-500 font-medium block mb-1">Description</span>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg text-xs leading-relaxed border border-gray-100">
                            {itemDetails.item.description || 'No detailed description provided for this item.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Customer Orders for this item */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex items-center justify-between mb-3 border-b pb-2.5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={18} className="text-brand-gold-dark" />
                        <h3 className="text-base font-bold text-brand-brown-dark">
                          Recent Purchases of this Item
                        </h3>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                          {itemDetails.recentOrders.length} {itemDetails.recentOrders.length === 1 ? 'record' : 'records'}
                        </span>
                      </div>
                      <button
                        onClick={() => openItemDetails(itemDetails.item.id)}
                        className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 font-medium transition"
                        title="Reload latest purchases"
                      >
                        <RefreshCw size={12} className={loadingDetails ? 'animate-spin' : ''} />
                        Refresh
                      </button>
                    </div>

                    {itemDetails.recentOrders.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs">
                        <ShoppingBag size={28} className="mx-auto mb-2 opacity-30 text-gray-400" />
                        <p className="font-semibold text-gray-600">No purchase orders found</p>
                        <p className="text-gray-400 mt-0.5">This dish has not been ordered by any student yet.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-lg custom-scrollbar">
                        <table className="min-w-[650px] w-full text-xs text-left">
                          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                            <tr>
                              <th className="px-3.5 py-2.5">Order</th>
                              <th className="px-3.5 py-2.5">Student Name</th>
                              <th className="px-3.5 py-2.5">Class & Section</th>
                              <th className="px-3.5 py-2.5">Roll No.</th>
                              <th className="px-3.5 py-2.5 text-center">Qty</th>
                              <th className="px-3.5 py-2.5 text-right">Unit Price</th>
                              <th className="px-3.5 py-2.5 text-right">Total Amount</th>
                              <th className="px-3.5 py-2.5 text-center">Status</th>
                              <th className="px-3.5 py-2.5 text-right">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {itemDetails.recentOrders.map((ro) => (
                              <tr key={ro.id} className="hover:bg-gray-50/70 transition">
                                <td className="px-3.5 py-2.5 font-bold text-brand-brown-dark">
                                  #{ro.orderId}
                                </td>
                                <td className="px-3.5 py-2.5 font-semibold text-gray-900">
                                  {ro.studentName}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-600">
                                  {ro.studentClass}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-500 font-mono">
                                  {ro.studentRoll}
                                </td>
                                <td className="px-3.5 py-2.5 text-center font-bold text-gray-900">
                                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100">
                                    {ro.quantity}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-gray-600">
                                  ₹{Number(ro.unitPrice).toFixed(2)}
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-bold text-green-600">
                                  ₹{(Number(ro.unitPrice) * ro.quantity).toFixed(2)}
                                </td>
                                <td className="px-3.5 py-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                                    ro.orderStatus === 'delivered'
                                      ? 'bg-green-100 text-green-800'
                                      : ro.orderStatus === 'cancelled'
                                      ? 'bg-red-100 text-red-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {ro.orderStatus}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-gray-500 whitespace-nowrap">
                                  {formatDate(ro.orderDate)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                    <button
                      onClick={() => {
                        const itemToEdit = itemDetails.item;
                        closeItemDetails();
                        setFormData(itemToEdit);
                        setImageFile(null);
                        setShowForm(true);
                      }}
                      className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg text-sm transition"
                    >
                      Edit This Item
                    </button>
                    <button
                      onClick={closeItemDetails}
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold rounded-lg text-sm transition"
                    >
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 flex items-center justify-center text-brand-brown-dark">
                  <Tag size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Manage Categories</h3>
                  <p className="text-xs text-gray-500">Create new food categories or delete unused ones</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Add New Category Form */}
              <form onSubmit={handleAddCategory} className="bg-brand-gold/10 p-4 rounded-xl border border-brand-gold/30 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-brand-brown-dark flex items-center gap-1.5">
                  <Plus size={14} /> Add New Category
                </h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    required
                    placeholder="Category name (e.g. Healthy Juices, Chinese, Rolls)"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                  />
                  <input
                    type="text"
                    placeholder="Brief description (optional)"
                    value={newCatDesc}
                    onChange={(e) => setNewCatDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmittingCat || !newCatName.trim()}
                    className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark disabled:opacity-50 text-brand-brown-dark font-bold text-xs rounded-lg transition shadow-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{isSubmittingCat ? 'Adding...' : 'Add Category'}</span>
                  </button>
                </div>
              </form>

              {/* Existing Categories List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                  <span>Active Categories ({categories.length})</span>
                  <span>Items</span>
                </div>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                  {categories.length === 0 ? (
                    <div className="p-6 text-center text-xs text-gray-400">
                      No categories found. Add your first category above.
                    </div>
                  ) : (
                    categories.map((cat) => {
                      const count = menu.filter(m => m.category?.toLowerCase() === cat.slug.toLowerCase() || m.category?.toLowerCase() === cat.name.toLowerCase()).length;
                      return (
                        <div key={cat.id} className="p-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 capitalize">{cat.name}</span>
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-mono">
                                {cat.slug}
                              </span>
                            </div>
                            {cat.description && (
                              <p className="text-xs text-gray-500 truncate mt-0.5">{cat.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-700 rounded-lg">
                              {count} {count === 1 ? 'item' : 'items'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id, cat.name)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title={`Delete category "${cat.name}"`}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
