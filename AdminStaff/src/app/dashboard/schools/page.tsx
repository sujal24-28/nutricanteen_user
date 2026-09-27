'use client';
import { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  Edit,
  Power,
  PowerOff,
  Search,
  X,
  Building2,
  Eye,
  Users,
  CheckCircle,
  Wallet,
  ShoppingBag,
  Calendar,
  MapPin,
  RefreshCw,
  Phone,
  UserX
} from 'lucide-react';

interface StudentType {
  id: number;
  name: string;
  class: string;
  section: string;
  roll: string;
  phone: string;
  wallet_balance: number;
  is_active: boolean;
  created_at?: string;
}

interface SchoolType {
  id: number;
  name: string;
  address?: string | null;
  is_active: boolean;
  student_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface SchoolDetailResponse {
  school: SchoolType;
  stats: {
    total_students: number;
    active_students: number;
    total_wallet_balance: number;
    total_orders: number;
  };
  students: StudentType[];
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<any>({ name: '', address: '', is_active: true });

  // View Details Modal State
  const [activeSchoolId, setActiveSchoolId] = useState<number | null>(null);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetailResponse | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) setSchools(await res.json());
    } catch (e) {
      console.error('Failed to fetch schools:', e);
    }
  };

  useEffect(() => { fetchSchools(); }, []);

  const openSchoolDetails = async (id: number) => {
    setActiveSchoolId(id);
    setLoadingDetails(true);
    setStudentSearch('');
    try {
      const res = await fetch(`/api/schools/${id}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        setSchoolDetails(await res.json());
      }
    } catch (e) {
      console.error('Failed to load school details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeSchoolDetails = () => {
    setActiveSchoolId(null);
    setSchoolDetails(null);
    setStudentSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEdit = !!formData.id;
    const url = isEdit ? `/api/schools/${formData.id}` : '/api/schools';
    const method = isEdit ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      setShowForm(false);
      fetchSchools();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to save school');
    }
  };

  const handleToggleAccess = async (id: number, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    // Optimistic update in modal
    if (schoolDetails && schoolDetails.school.id === id) {
      setSchoolDetails({
        ...schoolDetails,
        school: {
          ...schoolDetails.school,
          is_active: newStatus
        }
      });
    }
    // Optimistic update in list
    setSchools(prev => prev.map(s => s.id === id ? { ...s, is_active: newStatus } : s));

    try {
      const res = await fetch(`/api/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus })
      });
      if (res.ok) {
        fetchSchools();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update access');
        fetchSchools();
        if (activeSchoolId === id) openSchoolDetails(id);
      }
    } catch (e) {
      alert('Failed to update access');
      fetchSchools();
      if (activeSchoolId === id) openSchoolDetails(id);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this school? Students enrolled in this school may be affected.')) return;
    const res = await fetch(`/api/schools/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchSchools();
      if (activeSchoolId === id) closeSchoolDetails();
    } else {
      const errorData = await res.json();
      alert(errorData.error || 'Failed to delete school');
    }
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

  // Filtered schools for main table
  const filteredSchools = schools.filter((s) => {
    const q = search.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.name?.toLowerCase().includes(q) ||
      s.address?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? s.is_active : !s.is_active);

    return matchesSearch && matchesStatus;
  });

  // Filtered students inside modal
  const filteredStudents = (schoolDetails?.students || []).filter((st) => {
    const q = studentSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      st.name?.toLowerCase().includes(q) ||
      st.class?.toLowerCase().includes(q) ||
      st.section?.toLowerCase().includes(q) ||
      st.roll?.toLowerCase().includes(q) ||
      st.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-dark">
            Manage Schools / Branches
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">Control registered campus branches, canteen locations, and student enrollment</p>
        </div>
        <button
          onClick={() => { setFormData({ name: '', address: '', is_active: true }); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg transition-colors shadow-sm"
        >
          <Plus size={16} /> Add School
        </button>
      </div>

      {/* Search and Status Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-brown-light/20 mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
            placeholder="Search school by name or address..."
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

        {/* Status filter */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
          >
            <option value="all">All Statuses ({schools.length})</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          {/* School count badge */}
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-2 rounded-lg font-medium whitespace-nowrap">
            Showing {filteredSchools.length} of {schools.length}
          </span>
        </div>
      </div>

      {/* Create / Edit Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow mb-6 border border-brand-brown-light/20">
          <h2 className="text-lg font-bold text-brand-brown-dark mb-4">{formData.id ? 'Edit School' : 'New School'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School / Branch Name</label>
              <input
                required
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. St. Xavier High School"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address / Details</label>
              <textarea
                className="w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                rows={3}
                value={formData.address || ''}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Full campus location address or branch notes..."
              />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-brand-brown-dark text-white rounded-lg hover:bg-brand-brown text-sm font-semibold"
              >
                Save School
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow border border-brand-brown-light/20 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="min-w-[780px] w-full divide-y divide-gray-200">
          <thead className="bg-brand-offwhite">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown-light uppercase tracking-wider">School / Branch</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown-light uppercase tracking-wider">Address</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown-light uppercase tracking-wider">Enrolled Students</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-brand-brown-light uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-brand-brown-light uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSchools.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <Building2 className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No schools found</p>
                  {search && <p className="text-xs text-gray-400 mt-1">No matching results for &quot;{search}&quot;</p>}
                </td>
              </tr>
            ) : (
              filteredSchools.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  {/* Name column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => openSchoolDetails(s.id)}
                      className="text-left font-bold text-brand-brown-dark hover:text-brand-gold-dark transition"
                      title="Click to view full school details and registered students"
                    >
                      {s.name}
                    </button>
                    <div className="text-[11px] text-gray-400">Branch ID: #{s.id}</div>
                  </td>

                  {/* Address column */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {s.address || '—'}
                  </td>

                  {/* Registered Students Count */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      (s.student_count ?? 0) > 0
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Users size={13} />
                      {s.student_count ?? 0} {s.student_count === 1 ? 'Student' : 'Students'}
                    </span>
                  </td>

                  {/* Status column */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleAccess(s.id, s.is_active)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          s.is_active ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={s.is_active}
                        title={s.is_active ? 'Click to disable school branch' : 'Click to activate school branch'}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            s.is_active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <span className={`text-xs font-semibold ${s.is_active ? 'text-green-700' : 'text-red-600'}`}>
                        {s.is_active ? 'Active' : 'Disabled'}
                      </span>
                    </div>
                  </td>

                  {/* Actions column */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Details Button */}
                      <button
                        onClick={() => openSchoolDetails(s.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition"
                        title="View School Details & Registered Students"
                      >
                        <Eye size={14} />
                        View Details
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => { setFormData({ ...s }); setShowForm(true); }}
                        className="p-1.5 text-brand-brown-light hover:text-brand-brown-dark rounded-md hover:bg-gray-100 transition"
                        title="Edit School"
                      >
                        <Edit size={16} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 rounded-md hover:bg-red-50 transition"
                        title="Delete School"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* ======================================================= */}
      {/* SCHOOL DETAILS MODAL                                   */}
      {/* ======================================================= */}
      {activeSchoolId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-brown-dark text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {schoolDetails?.school.name || 'Loading School...'}
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${
                      schoolDetails?.school.is_active
                        ? 'bg-green-500/20 text-green-300 border-green-500/40'
                        : 'bg-red-500/20 text-red-300 border-red-500/40'
                    }`}>
                      {schoolDetails?.school.is_active ? 'Active Campus' : 'Disabled'}
                    </span>
                  </h2>
                  <p className="text-xs text-brand-brown-light mt-0.5 flex items-center gap-2">
                    <span>School ID: #{activeSchoolId}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {schoolDetails?.school.address || 'Address not set'}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={closeSchoolDetails}
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
                  <p className="text-sm font-medium text-gray-600">Fetching school details & student directory...</p>
                </div>
              ) : !schoolDetails ? (
                <div className="py-20 text-center text-gray-400">Failed to load school details</div>
              ) : (
                <>
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Total Students */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Registered Students</p>
                        <p className="text-xl font-bold text-gray-900 mt-0.5">
                          {schoolDetails.stats.total_students}{' '}
                          <span className="text-xs text-gray-500 font-normal">enrolled</span>
                        </p>
                      </div>
                    </div>

                    {/* Active Accounts */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-green-50 text-green-700 rounded-xl">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Active Students</p>
                        <p className="text-xl font-bold text-green-600 mt-0.5">
                          {schoolDetails.stats.active_students}{' '}
                          <span className="text-xs text-gray-500 font-normal">active</span>
                        </p>
                      </div>
                    </div>

                    {/* Orders Placed */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-purple-50 text-purple-700 rounded-xl">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Orders</p>
                        <p className="text-xl font-bold text-purple-700 mt-0.5">
                          {schoolDetails.stats.total_orders}{' '}
                          <span className="text-xs text-gray-500 font-normal">orders</span>
                        </p>
                      </div>
                    </div>

                    {/* Total Wallet Funds */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-3">
                      <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
                        <Wallet size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase">Total Wallet Funds</p>
                        <p className="text-xl font-bold text-amber-700 mt-0.5">
                          ₹{Number(schoolDetails.stats.total_wallet_balance).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* School Information Card */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <h3 className="text-base font-bold text-brand-brown-dark mb-4 flex items-center gap-2 border-b pb-2">
                      <Building2 size={18} className="text-brand-gold-dark" />
                      Branch & Campus Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">School / Branch Name</span>
                        <span className="font-bold text-gray-900">{schoolDetails.school.name}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Status</span>
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            schoolDetails.school.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {schoolDetails.school.is_active ? 'Active' : 'Disabled'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAccess(schoolDetails.school.id, schoolDetails.school.is_active)}
                            className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                              schoolDetails.school.is_active ? 'bg-green-600' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={schoolDetails.school.is_active}
                            title={schoolDetails.school.is_active ? 'Click to disable' : 'Click to activate'}
                          >
                            <span
                              aria-hidden="true"
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                schoolDetails.school.is_active ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Campus Location</span>
                        <span className="font-medium text-gray-800 text-right">{schoolDetails.school.address || '—'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-gray-100">
                        <span className="text-gray-500 font-medium">Created On</span>
                        <span className="text-gray-700">{formatDate(schoolDetails.school.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Registered Students Directory Section */}
                  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b pb-3">
                      <div>
                        <h3 className="text-base font-bold text-brand-brown-dark flex items-center gap-2">
                          <Users size={18} className="text-brand-gold-dark" />
                          Registered Students from this School
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                            {schoolDetails.students.length} {schoolDetails.students.length === 1 ? 'student' : 'students'}
                          </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">Students enrolled under this school branch in Mapstreak</p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Search input in modal */}
                        <div className="relative">
                          <Search className="absolute left-2.5 top-2 text-gray-400" size={14} />
                          <input
                            type="text"
                            placeholder="Filter students..."
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className="pl-8 pr-7 py-1.5 border border-gray-300 rounded-lg text-xs w-48 sm:w-56 focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
                          />
                          {studentSearch && (
                            <button
                              onClick={() => setStudentSearch('')}
                              className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                              title="Clear search"
                            >
                              <X size={13} />
                            </button>
                          )}
                        </div>

                        {/* Refresh button */}
                        <button
                          onClick={() => openSchoolDetails(schoolDetails.school.id)}
                          className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition"
                          title="Refresh students"
                        >
                          <RefreshCw size={14} className={loadingDetails ? 'animate-spin' : ''} />
                        </button>
                      </div>
                    </div>

                    {schoolDetails.students.length === 0 ? (
                      <div className="py-12 text-center text-gray-400">
                        <UserX size={36} className="mx-auto mb-2 opacity-30 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-700">No students registered yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                          Students who register with this school branch on the Mapstreak mobile app will automatically be listed here.
                        </p>
                      </div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs">
                        No students match the search &quot;{studentSearch}&quot;
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-100 rounded-lg custom-scrollbar">
                        <table className="min-w-[720px] w-full text-xs text-left">
                          <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                            <tr>
                              <th className="px-3.5 py-2.5">Student</th>
                              <th className="px-3.5 py-2.5">Class & Section</th>
                              <th className="px-3.5 py-2.5">Roll No.</th>
                              <th className="px-3.5 py-2.5">Phone Number</th>
                              <th className="px-3.5 py-2.5 text-right">Wallet Balance</th>
                              <th className="px-3.5 py-2.5 text-center">Status</th>
                              <th className="px-3.5 py-2.5 text-right">Enrolled Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredStudents.map((st) => (
                              <tr key={st.id} className="hover:bg-gray-50/70 transition">
                                <td className="px-3.5 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-brand-gold/20 text-brand-brown-dark font-bold flex items-center justify-center text-xs uppercase">
                                      {st.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900">{st.name}</div>
                                      <div className="text-[10px] text-gray-400 font-mono">ID: #{st.id}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 font-medium text-gray-700">
                                  {st.class} {st.section ? `(${st.section})` : ''}
                                </td>
                                <td className="px-3.5 py-2.5 font-mono text-gray-600">
                                  {st.roll || '—'}
                                </td>
                                <td className="px-3.5 py-2.5 text-gray-500 font-mono">
                                  <div className="flex items-center gap-1">
                                    <Phone size={11} className="text-gray-400" />
                                    {st.phone}
                                  </div>
                                </td>
                                <td className="px-3.5 py-2.5 text-right font-bold text-green-600">
                                  ₹{Number(st.wallet_balance).toFixed(2)}
                                </td>
                                <td className="px-3.5 py-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    st.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {st.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-3.5 py-2.5 text-right text-gray-400 whitespace-nowrap">
                                  {formatDate(st.created_at)}
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
                        const schoolToEdit = schoolDetails.school;
                        closeSchoolDetails();
                        setFormData({
                          id: schoolToEdit.id,
                          name: schoolToEdit.name,
                          address: schoolToEdit.address || '',
                          is_active: schoolToEdit.is_active
                        });
                        setShowForm(true);
                      }}
                      className="px-4 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg text-sm transition"
                    >
                      Edit School
                    </button>
                    <button
                      onClick={closeSchoolDetails}
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
    </div>
  );
}
