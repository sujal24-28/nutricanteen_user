'use client';
import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Power, PowerOff } from 'lucide-react';

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', email: '', phone: '', password: '', role: 'staff', is_active: true });

  const fetchStaff = async () => {
    const res = await fetch('/api/staff');
    if (res.ok) setStaff(await res.json());
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/staff/${formData.id}` : '/api/staff';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowForm(false);
      fetchStaff();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to save staff');
    }
  };

  const handleToggleAccess = async (id: number, currentStatus: boolean) => {
    const res = await fetch(`/api/staff/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus })
    });
    if (res.ok) {
      fetchStaff();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to update access');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this account?')) return;
    const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchStaff();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete staff');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-brand-brown-dark">Manage Staff & Admins</h1>
        <button onClick={() => { setFormData({ name: '', email: '', phone: '', password: '', role: 'staff', is_active: true }); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded transition-colors">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold mb-4">{formData.id ? 'Edit Staff Account' : 'New Staff Account'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm">Name</label><input required className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
            <div><label className="block text-sm">Email</label><input type="email" className="w-full border p-2 rounded" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} /></div>
            <div><label className="block text-sm">Phone</label><input required className="w-full border p-2 rounded" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div>
                <label className="block text-sm">{formData.id ? 'New Password (leave blank to keep current)' : 'Password'}</label>
                <input type="password" required={!formData.id} className="w-full border p-2 rounded" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm">Role</label>
              <select className="w-full border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="staff">Staff</option>
                <option value="superadmin">SuperAdmin</option>
              </select>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-brand-brown-light uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map(s => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap"><div className="font-medium text-brand-brown-dark">{s.name}</div></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className="capitalize px-2 py-1 bg-gray-100 rounded text-sm">{s.role}</span></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.phone} <br/> {s.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${s.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {s.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => handleToggleAccess(s.id, s.is_active)} title={s.is_active ? 'Disable Access' : 'Enable Access'} className={`${s.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}>
                      {s.is_active ? <PowerOff size={18} /> : <Power size={18} />}
                    </button>
                    <button onClick={() => { setFormData({ ...s, password: '' }); setShowForm(true); }} className="text-brand-brown-light hover:text-brand-brown-dark" title="Edit">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
