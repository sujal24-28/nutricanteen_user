'use client';
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Power,
  PowerOff,
  CheckSquare,
  Square,
  ShieldCheck,
  Shield,
  LayoutDashboard,
  ShoppingBag,
  ClipboardList,
  Utensils,
  Users,
  Building2,
  Image as ImageIcon
} from 'lucide-react';

interface SectionDef {
  id: string;
  name: string;
  desc: string;
  icon: any;
}

const AVAILABLE_SECTIONS: SectionDef[] = [
  { id: 'dashboard', name: 'Dashboard', desc: 'Overview, analytics & sales statistics', icon: LayoutDashboard },
  { id: 'orders', name: 'Orders', desc: 'View active orders & update status', icon: ShoppingBag },
  { id: 'orders_sheet', name: 'Order Sheet', desc: 'Daily order sheet, date filters & export', icon: ClipboardList },
  { id: 'menu', name: 'Menu Items', desc: 'Create & edit food items, prices, MRP & food types', icon: Utensils },
  { id: 'students', name: 'Students & Wallets', desc: 'Manage students, view profiles & recharge wallets', icon: Users },
  { id: 'schools', name: 'Schools', desc: 'Manage campus schools & view registered students', icon: Building2 },
  { id: 'banner', name: 'App Banner', desc: 'Update mobile app promotional banners', icon: ImageIcon },
];

export default function StaffPage() {
  const [staff, setStaff] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff',
    permissions: ['orders', 'orders_sheet'],
    is_active: true
  });

  const fetchStaff = async () => {
    const res = await fetch('/api/staff');
    if (res.ok) setStaff(await res.json());
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleOpenAddForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'staff',
      permissions: ['orders', 'orders_sheet'],
      is_active: true
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (s: any) => {
    let perms = s.permissions;
    if (!Array.isArray(perms) || perms.length === 0) {
      perms = s.role === 'superadmin' ? AVAILABLE_SECTIONS.map((sec) => sec.id) : ['orders', 'orders_sheet'];
    }
    setFormData({
      ...s,
      permissions: perms,
      password: ''
    });
    setShowForm(true);
  };

  const handleTogglePermission = (sectionId: string) => {
    const current: string[] = Array.isArray(formData.permissions) ? formData.permissions : [];
    if (current.includes(sectionId)) {
      setFormData({
        ...formData,
        permissions: current.filter((id) => id !== sectionId)
      });
    } else {
      setFormData({
        ...formData,
        permissions: [...current, sectionId]
      });
    }
  };

  const handleSelectAllPermissions = () => {
    setFormData({
      ...formData,
      permissions: AVAILABLE_SECTIONS.map((s) => s.id)
    });
  };

  const handleSelectOrdersOnly = () => {
    setFormData({
      ...formData,
      permissions: ['orders', 'orders_sheet']
    });
  };

  const handleClearAllPermissions = () => {
    setFormData({
      ...formData,
      permissions: []
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/staff/${formData.id}` : '/api/staff';
    const method = isEdit ? 'PATCH' : 'POST';

    const payload = {
      ...formData,
      permissions: formData.role === 'superadmin' ? AVAILABLE_SECTIONS.map((s) => s.id) : formData.permissions
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-dark">Manage Staff & Permissions</h1>
          <p className="text-sm text-brand-brown-light mt-0.5">
            Configure staff accounts and control which sections they can access in the portal.
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
        >
          <Plus size={16} /> Add Staff Account
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-brand-brown-light/20 animate-fade-in">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-lg font-bold text-brand-brown-dark">
                {formData.id ? `Edit Account: ${formData.name}` : 'New Staff Account'}
              </h2>
              <p className="text-xs text-gray-500">
                Set credentials and specify allowed panel sections.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-md">
              Role: {formData.role}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  required
                  placeholder="e.g. Counter Staff"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. staff@school.edu"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <input
                  required
                  placeholder="e.g. 9876543210"
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  {formData.id ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  required={!formData.id}
                  placeholder={formData.id ? '••••••••' : 'Minimum 6 characters'}
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold outline-none"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                  Account Role
                </label>
                <select
                  className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-brand-gold outline-none bg-white"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="staff">Staff (Custom Section Access)</option>
                  <option value="superadmin">SuperAdmin (Full Access to Everything)</option>
                </select>
              </div>
            </div>

            {/* Section Permissions Selector for Staff */}
            {formData.role === 'staff' ? (
              <div className="pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-brand-brown-dark flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-brand-gold-dark" />
                      Allowed Portal Sections for this Staff
                    </h3>
                    <p className="text-xs text-gray-500">
                      Check the sections this staff member is allowed to see and manage in their panel:
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={handleSelectAllPermissions}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded font-medium transition cursor-pointer"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectOrdersOnly}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-medium transition cursor-pointer"
                    >
                      Orders Only
                    </button>
                    <button
                      type="button"
                      onClick={handleClearAllPermissions}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-medium transition cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {AVAILABLE_SECTIONS.map((sec) => {
                    const isChecked = Array.isArray(formData.permissions) && formData.permissions.includes(sec.id);
                    const IconComp = sec.icon;
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleTogglePermission(sec.id)}
                        className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                          isChecked
                            ? 'border-brand-gold bg-amber-50/50 shadow-xs'
                            : 'border-gray-200 bg-white hover:border-gray-300 opacity-75'
                        }`}
                      >
                        <div className="mt-0.5 text-brand-brown-dark shrink-0">
                          {isChecked ? (
                            <CheckSquare className="w-5 h-5 text-brand-gold-dark" />
                          ) : (
                            <Square className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-xs text-gray-900">
                            <IconComp className="w-3.5 h-3.5 text-brand-brown-light" />
                            <span>{sec.name}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">
                            {sec.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0" />
                <span>SuperAdmin accounts automatically have full access to all portal sections and cannot be restricted.</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-5 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-brand-brown-dark hover:bg-brand-brown text-white font-bold rounded-lg text-sm transition shadow-xs cursor-pointer"
              >
                {formData.id ? 'Save Changes' : 'Create Staff'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden border border-brand-brown-light/20">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-offwhite">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-brown-light uppercase tracking-wider">
                  Name & Contact
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-brown-light uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-brown-light uppercase tracking-wider">
                  Allowed Sections
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-bold text-brand-brown-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-bold text-brand-brown-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-400">
                    No accounts found. Click "Add Staff Account" above to create one.
                  </td>
                </tr>
              ) : (
                staff.map((s) => {
                  const isSuper = s.role === 'superadmin';
                  const perms: string[] = Array.isArray(s.permissions) ? s.permissions : [];

                  return (
                    <tr key={s.id} className="hover:bg-gray-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-brand-brown-dark text-sm">{s.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          📞 {s.phone || 'No phone'}
                          {s.email && <span className="ml-2">✉️ {s.email}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`capitalize px-2.5 py-1 rounded-full text-xs font-bold ${
                            isSuper
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ShieldCheck className="w-3.5 h-3.5" /> Full Access (All Sections)
                          </span>
                        ) : perms.length === 0 ? (
                          <span className="text-xs text-gray-500 italic">
                            Default (Orders & Sheet)
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {perms.map((pid) => {
                              const found = AVAILABLE_SECTIONS.find((x) => x.id === pid);
                              return (
                                <span
                                  key={pid}
                                  className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[11px] font-medium"
                                >
                                  {found?.name || pid}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            s.is_active
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}
                        >
                          {s.is_active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center gap-3">
                          <button
                            onClick={() => handleToggleAccess(s.id, s.is_active)}
                            title={s.is_active ? 'Disable Account' : 'Enable Account'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              s.is_active
                                ? 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                : 'text-green-600 hover:bg-green-50 hover:text-green-800'
                            }`}
                          >
                            {s.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                          </button>
                          <button
                            onClick={() => handleOpenEditForm(s)}
                            className="p-1.5 text-brand-brown-light hover:text-brand-brown-dark hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Permissions & Details"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Account"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
