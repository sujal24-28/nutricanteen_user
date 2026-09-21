'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function MenuPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', description: '', price: '', category: 'General', is_available: true });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchMenu = async () => {
    const res = await fetch('/api/menu?t=' + Date.now(), { cache: 'no-store' });
    if (res.ok) setMenu(await res.json());
  };

  useEffect(() => { fetchMenu(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/menu/${formData.id}` : '/api/menu';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description || '');
    payload.append('price', formData.price.toString());
    payload.append('category', formData.category);
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
    if (!confirm('Are you sure?')) return;
    const res = await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchMenu();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete menu item');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-brown-dark">Menu Management</h1>
        <button onClick={() => { setFormData({ name: '', description: '', price: '', category: 'General', is_available: true }); setImageFile(null); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded transition-colors">
          <Plus size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Item' : 'New Menu Item'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm">Name</label><input required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-sm">Price (?)</label><input required type="number" step="0.01" className="w-full border p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} /></div>
            <div>
              <label className="block text-sm">Category</label>
              <select required className="w-full border p-2 rounded bg-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                <option value="breakfast">Morning Recess (breakfast)</option>
                <option value="lunch">Hot Lunch Meals (lunch)</option>
                <option value="snacks">Nutri-Snacks (snacks)</option>
                <option value="bakery">Bakery & Sweets (bakery)</option>
                <option value="drinks">Fresh Drinks & Shakes (drinks)</option>
                <option value="general">General (Other)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm">Availability</label>
              <select className="w-full border p-2 rounded" value={formData.is_available.toString()} onChange={e => setFormData({...formData, is_available: e.target.value === 'true'})}>
                <option value="true">Available</option>
                <option value="false">Out of Stock</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm">Description</label>
              <textarea className="w-full border p-2 rounded" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm">Image</label>
              <input type="file" accept="image/*" className="w-full border p-2 rounded" onChange={e => setImageFile(e.target.files ? e.target.files[0] : null)} />
              {formData.image_url && !imageFile && <p className="text-sm mt-1 text-gray-500">Current image: {formData.image_url}</p>}
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-brand-brown-dark text-white rounded hover:bg-brand-brown">Save</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-x-auto border border-brand-brown-light/20">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-brand-offwhite">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-brand-brown-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {menu.map(item => (
              <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.image_url ? (
                      <img src={`http://localhost:5000${item.image_url}`} alt={item.name} className="h-10 w-10 object-cover rounded" />
                    ) : (
                    <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">N/A</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-brand-brown-dark">{item.name}</div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-gold-dark font-bold">?{item.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.is_available ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => { setFormData(item); setImageFile(null); setShowForm(true); }} className="text-brand-brown-light hover:text-brand-brown-dark mr-4"><Edit size={16}/></button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
