'use client';

import { useState, useEffect } from 'react';
import {
  Wallet,
  Search,
  X,
  User,
  ShoppingBag,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  XCircle,
  Eye,
  RefreshCw,
  School,
  Phone,
  Hash,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface StudentItem {
  id: number;
  name: string;
  phone: string;
  class: string;
  section: string;
  roll: string;
  wallet_balance: number | string;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  school?: { id: number; name: string };
}

interface OrderDetail {
  id: number;
  status: string;
  total_amount: number | string;
  created_at?: string;
  createdAt?: string;
  pickup_time?: string;
  note?: string;
  items: Array<{
    id: number;
    quantity: number;
    unit_price: number | string;
    menuItem?: { name: string; price: number | string; image_url?: string };
  }>;
}

interface TransactionDetail {
  id: number;
  type: 'credit' | 'debit';
  amount: number | string;
  balance_after: number | string;
  ref_id?: string;
  description?: string;
  created_at?: string;
  createdAt?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: any }> = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  accepted:  { bg: 'bg-blue-100', text: 'text-blue-800', icon: Package },
  ready:     { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
  delivered: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
};

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Active student for the Detail Modal
  const [activeStudentId, setActiveStudentId] = useState<number | null>(null);
  const [studentDetails, setStudentDetails] = useState<{
    student: StudentItem;
    orders: OrderDetail[];
    transactions: TransactionDetail[];
    stats: { totalOrders: number; totalSpent: number; totalRecharged: number; currentBalance: number };
  } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'edit' | 'orders' | 'wallet'>('profile');

  // Quick Wallet Transaction Modal
  const [walletModalStudent, setWalletModalStudent] = useState<StudentItem | null>(null);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletType, setWalletType] = useState<'refund' | 'deduct'>('refund');
  const [walletProcessing, setWalletProcessing] = useState(false);

  // Edit Student Profile State
  const [schools, setSchools] = useState<Array<{ id: number; name: string; address?: string }>>([]);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    class: '',
    section: '',
    roll: '',
    school_id: '',
    is_active: true
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Delete Student State
  const [studentToDelete, setStudentToDelete] = useState<StudentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSchools = async () => {
    try {
      const res = await fetch('/api/schools');
      if (res.ok) {
        const data = await res.json();
        setSchools(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch schools:', e);
    }
  };

  const openEditStudent = (student: StudentItem) => {
    setEditingStudent(student);
    setEditError('');
    setEditFormData({
      name: student.name || '',
      phone: student.phone || '',
      class: student.class || '',
      section: student.section || '',
      roll: student.roll || '',
      school_id: student.school?.id?.toString() || (student as any).school_id?.toString() || '',
      is_active: student.is_active !== undefined ? Boolean(student.is_active) : true
    });
  };

  const closeEditStudent = () => {
    setEditingStudent(null);
    setEditError('');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudentId = activeStudentId || editingStudent?.id;
    if (!targetStudentId) return;

    setSavingEdit(true);
    setEditError('');
    setEditSuccess('');

    try {
      const res = await fetch(`/api/students/${targetStudentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });

      const data = await res.json();

      if (!res.ok) {
        setEditError(data.error || 'Failed to update student profile');
        setSavingEdit(false);
        return;
      }

      const updated = data.student;

      // Update in main table list
      setStudents(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));

      // Update in active details modal if open
      if (studentDetails && studentDetails.student.id === updated.id) {
        setStudentDetails({
          ...studentDetails,
          student: {
            ...studentDetails.student,
            ...updated
          }
        });
      }

      setEditSuccess('Student profile updated successfully!');
      setTimeout(() => {
        setEditSuccess('');
        if (activeTab === 'edit') {
          setActiveTab('profile');
        }
      }, 1000);

      if (editingStudent) {
        closeEditStudent();
      }
      fetchStudents();
    } catch (err: any) {
      setEditError(err.message || 'Error updating student');
    } finally {
      setSavingEdit(false);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/students?t=' + Date.now(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch students:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchSchools();
  }, []);

  const openStudentDetails = async (studentId: number, defaultTab: 'profile' | 'edit' | 'orders' | 'wallet' = 'profile') => {
    setActiveStudentId(studentId);
    setActiveTab(defaultTab);
    setLoadingDetails(true);
    setEditError('');
    setEditSuccess('');
    try {
      const res = await fetch(`/api/students/${studentId}?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setStudentDetails(data);
        if (data.student) {
          setEditFormData({
            name: data.student.name || '',
            phone: data.student.phone || '',
            class: data.student.class || '',
            section: data.student.section || '',
            roll: data.student.roll || '',
            school_id: data.student.school?.id?.toString() || data.student.school_id?.toString() || '',
            is_active: data.student.is_active !== undefined ? Boolean(data.student.is_active) : true
          });
        }
      }
    } catch (e) {
      console.error('Failed to load student details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const closeStudentDetails = () => {
    setActiveStudentId(null);
    setStudentDetails(null);
  };

  const handleDeleteStudent = (student: StudentItem) => {
    setStudentToDelete(student);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/students/${studentToDelete.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        if (activeStudentId === studentToDelete.id) {
          closeStudentDetails();
        }
        setStudentToDelete(null);
        await fetchStudents();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete student');
      }
    } catch (e: any) {
      alert('Error deleting student: ' + (e.message || 'Unknown error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = walletModalStudent || studentDetails?.student;
    if (!targetStudent) return;

    setWalletProcessing(true);
    try {
      const res = await fetch(`/api/students/${targetStudent.id}/wallet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: walletAmount, type: walletType })
      });

      if (res.ok) {
        alert(`Successfully ${walletType === 'refund' ? 'credited' : 'debited'} ₹${walletAmount}`);
        setWalletAmount('');
        setWalletModalStudent(null);
        await fetchStudents();
        if (activeStudentId === targetStudent.id) {
          openStudentDetails(targetStudent.id, activeTab);
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Transaction failed');
      }
    } catch (e) {
      alert('Error processing transaction');
    } finally {
      setWalletProcessing(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.class?.toLowerCase().includes(q) ||
      s.roll?.toLowerCase().includes(q) ||
      s.section?.toLowerCase().includes(q)
    );
  });

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
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
    <div className="p-2 md:p-4 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-brand-brown-dark">
            Students & Wallets
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View student profiles, monitor wallet balances, order history, and full transaction ledgers
          </p>
        </div>
        <button
          onClick={fetchStudents}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-brand-brown-light/20 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full max-w-lg">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            className="w-full pl-10 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold/60"
            placeholder="Search by student name, phone, class, or roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
          Total Students: <span className="font-bold text-gray-800">{filteredStudents.length}</span>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow border border-brand-brown-light/20 overflow-hidden">
        <div className="overflow-x-auto w-full custom-scrollbar">
          <table className="min-w-[760px] w-full divide-y divide-gray-200">
            <thead className="bg-brand-offwhite">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Class / Roll</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase tracking-wider">Wallet Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-brand-brown-light uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                  <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">No students found</p>
                  {search && <p className="text-xs text-gray-400 mt-1">Try another search term</p>}
                </td>
              </tr>
            ) : (
              filteredStudents.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openStudentDetails(s.id, 'profile')}
                        className="w-10 h-10 rounded-full bg-brand-gold/20 text-brand-brown-dark font-bold flex items-center justify-center text-sm border border-brand-gold/40 hover:scale-105 transition cursor-pointer"
                        title="Click to view student profile"
                      >
                        {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                      </button>
                      <div>
                        <button
                          onClick={() => openStudentDetails(s.id, 'profile')}
                          className="font-bold text-brand-brown-dark hover:text-brand-gold-dark transition text-left cursor-pointer"
                          title="Click to view student profile"
                        >
                          {s.name}
                        </button>
                        <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                          <Phone size={12} /> {s.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-800">
                      {s.class || '—'} {s.section ? `(${s.section})` : ''}
                    </div>
                    <div className="text-xs text-gray-400">Roll: {s.roll || '—'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-base font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg border border-green-200 inline-block">
                      ₹{Number(s.wallet_balance || 0).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      {/* Merged Single Action: View Profile */}
                      <button
                        onClick={() => openStudentDetails(s.id, 'profile')}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition border border-indigo-200 shadow-2xs cursor-pointer"
                        title="View Profile, Edit Details, Orders & Wallet History"
                      >
                        <Eye size={14} />
                        View Profile
                      </button>

                      {/* Delete Student Button */}
                      <button
                        onClick={() => handleDeleteStudent(s)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition border border-red-200 shadow-2xs hover:border-red-300 cursor-pointer"
                        title="Delete student account"
                      >
                        <Trash2 size={13} />
                        Delete
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
      {/* STUDENT PROFILE & HISTORY MODAL                         */}
      {/* ======================================================= */}
      {activeStudentId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-brown-dark text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-brand-gold text-brand-brown-dark font-extrabold text-lg flex items-center justify-center border-2 border-white/20">
                  {studentDetails?.student.name ? studentDetails.student.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    {studentDetails?.student.name || 'Loading Student...'}
                    <span className="text-xs bg-brand-gold/30 text-brand-gold border border-brand-gold/50 px-2 py-0.5 rounded-full font-semibold">
                      ID #{activeStudentId}
                    </span>
                  </h2>
                  <p className="text-xs text-brand-brown-light mt-0.5 flex items-center gap-3">
                    <span>📱 {studentDetails?.student.phone}</span>
                    <span>🎓 {studentDetails?.student.class} {studentDetails?.student.section}</span>
                    <span>🏷️ Roll {studentDetails?.student.roll}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {studentDetails?.student && (
                  <button
                    type="button"
                    onClick={() => handleDeleteStudent(studentDetails.student)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold rounded-lg transition cursor-pointer"
                    title="Delete this student"
                  >
                    <Trash2 size={13} />
                    <span className="hidden sm:inline">Delete Student</span>
                  </button>
                )}
                <button
                  onClick={closeStudentDetails}
                  className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-4 md:px-6 pt-2 overflow-x-auto whitespace-nowrap custom-scrollbar">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'profile'
                    ? 'border-brand-gold text-brand-brown-dark bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <User size={16} /> Profile & Top-up
              </button>
              <button
                onClick={() => {
                  setActiveTab('edit');
                  if (studentDetails?.student) {
                    openEditStudent(studentDetails.student);
                  }
                }}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'edit'
                    ? 'border-brand-gold text-brand-brown-dark bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Edit size={16} /> Edit Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'orders'
                    ? 'border-brand-gold text-brand-brown-dark bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <ShoppingBag size={16} /> Order History
                {studentDetails && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                    {studentDetails.orders.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('wallet')}
                className={`flex items-center gap-2 py-3 px-4 text-sm font-semibold border-b-2 transition ${
                  activeTab === 'wallet'
                    ? 'border-brand-gold text-brand-brown-dark bg-white rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <History size={16} /> Wallet Ledger
                {studentDetails && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                    {studentDetails.transactions.length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
              {loadingDetails ? (
                <div className="py-20 text-center text-gray-400">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm font-medium text-gray-600">Fetching student details & history...</p>
                </div>
              ) : !studentDetails ? (
                <div className="py-20 text-center text-gray-400">Failed to load student details</div>
              ) : (
                <>
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                      <p className="text-xs text-gray-500 font-medium">Wallet Balance</p>
                      <p className="text-lg font-bold text-green-600 mt-0.5">
                        ₹{Number(studentDetails.stats.currentBalance).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                      <p className="text-xs text-gray-500 font-medium">Total Orders</p>
                      <p className="text-lg font-bold text-blue-600 mt-0.5">
                        {studentDetails.stats.totalOrders}
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                      <p className="text-xs text-gray-500 font-medium">Total Spent</p>
                      <p className="text-lg font-bold text-purple-600 mt-0.5">
                        ₹{Number(studentDetails.stats.totalSpent).toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 shadow-xs">
                      <p className="text-xs text-gray-500 font-medium">Total Recharged</p>
                      <p className="text-lg font-bold text-brand-gold-dark font-bold mt-0.5">
                        ₹{Number(studentDetails.stats.totalRecharged).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* TAB 1: PROFILE & WALLET TOPUP */}
                  {activeTab === 'profile' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left: Detailed Student Profile Card */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
                        <div className="flex items-center justify-between border-b pb-2 mb-4">
                          <h3 className="text-base font-bold text-brand-brown-dark flex items-center gap-2">
                            <User size={18} className="text-brand-gold-dark" />
                            Profile Information
                          </h3>
                          <button
                            type="button"
                            onClick={() => openEditStudent(studentDetails.student)}
                            className="flex items-center gap-1.5 px-3 py-1 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark text-xs font-bold rounded-lg transition shadow-2xs"
                            title="Edit this student's profile"
                          >
                            <Edit size={13} />
                            Edit Profile
                          </button>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">Full Name</span>
                            <span className="font-semibold text-gray-900">{studentDetails.student.name}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">Mobile Phone</span>
                            <span className="font-semibold text-gray-900">+91 {studentDetails.student.phone}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">Class & Section</span>
                            <span className="font-semibold text-gray-900">
                              {studentDetails.student.class || '—'} {studentDetails.student.section ? `(${studentDetails.student.section})` : ''}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">Roll Number</span>
                            <span className="font-semibold text-gray-900">{studentDetails.student.roll || '—'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">School / Branch</span>
                            <span className="font-semibold text-gray-900">
                              {studentDetails.student.school?.name || 'Default Campus'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-gray-100">
                            <span className="text-gray-500">Account Status</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              studentDetails.student.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {studentDetails.student.is_active !== false ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="flex justify-between py-1">
                            <span className="text-gray-500">Registered On</span>
                            <span className="text-gray-700 font-medium">
                              {formatDate(studentDetails.student.createdAt || studentDetails.student.created_at)}
                            </span>
                          </div>

                          {/* Danger Zone: Delete Student */}
                          <div className="pt-3.5 mt-2 border-t border-red-100 flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-red-700 block">Delete Student Account</span>
                              <span className="text-[11px] text-gray-400">Permanently disable login and remove from directory</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteStudent(studentDetails.student)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-600 text-red-700 hover:text-white border border-red-200 hover:border-red-600 text-xs font-bold rounded-lg transition shadow-2xs cursor-pointer"
                              title="Delete this student"
                            >
                              <Trash2 size={13} />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Action Topup/Deduct */}
                      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
                        <div>
                          <h3 className="text-base font-bold text-brand-brown-dark mb-4 flex items-center gap-2 border-b pb-2">
                            <Wallet size={18} className="text-brand-gold-dark" />
                            Perform Wallet Transaction
                          </h3>
                          <p className="text-xs text-gray-500 mb-4">
                            Directly add refunds/recharges or manual counter purchase deductions for this student.
                          </p>

                          <form onSubmit={handleWalletSubmit} className="space-y-4">
                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Transaction Type</label>
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setWalletType('refund')}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                                    walletType === 'refund'
                                      ? 'bg-green-500 text-white border-green-600 shadow-xs'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  + Refund / Top-up (Add)
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setWalletType('deduct')}
                                  className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                                    walletType === 'deduct'
                                      ? 'bg-red-500 text-white border-red-600 shadow-xs'
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  - Deduct (Purchase)
                                </button>
                              </div>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                              <input
                                type="number"
                                required
                                min="1"
                                step="1"
                                placeholder="e.g. 50, 100, 500"
                                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                                value={walletAmount}
                                onChange={(e) => setWalletAmount(e.target.value)}
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={walletProcessing || !walletAmount}
                              className="w-full py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
                            >
                              {walletProcessing ? 'Processing...' : `Confirm ${walletType === 'refund' ? 'Top-up' : 'Deduction'}`}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: EDIT STUDENT PROFILE */}
                  {activeTab === 'edit' && (
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs max-w-2xl mx-auto">
                      <div className="border-b pb-3 mb-5 flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-bold text-brand-brown-dark flex items-center gap-2">
                            <Edit size={18} className="text-brand-gold-dark" />
                            Edit Student Profile
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Update personal details, campus assignment, and login phone number
                          </p>
                        </div>
                        <span className="text-xs font-mono font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md">
                          Student ID: #{studentDetails.student.id}
                        </span>
                      </div>

                      {editSuccess && (
                        <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-xs font-bold text-green-700 flex items-center gap-2">
                          <CheckCircle size={16} className="shrink-0" />
                          <span>{editSuccess}</span>
                        </div>
                      )}

                      {editError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                          <XCircle size={16} className="shrink-0" />
                          <span>{editError}</span>
                        </div>
                      )}

                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={editFormData.name}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            placeholder="Student Full Name"
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Mobile Number (for OTP Login) <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">+91</span>
                            <input
                              type="tel"
                              required
                              pattern="[0-9]{10}"
                              maxLength={10}
                              value={editFormData.phone}
                              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '') })}
                              placeholder="10-digit number"
                              className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold font-mono focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                            />
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1">Must be exactly 10 digits for student login.</p>
                        </div>

                        {/* School / Campus Branch */}
                        <div>
                          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            School / Campus Branch
                          </label>
                          <select
                            value={editFormData.school_id}
                            onChange={(e) => setEditFormData({ ...editFormData, school_id: e.target.value })}
                            className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                          >
                            <option value="">No School / General Campus</option>
                            {schools.map((sch) => (
                              <option key={sch.id} value={sch.id}>
                                {sch.name} {sch.address ? `(${sch.address})` : ''}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Class, Section, Roll */}
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Class <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editFormData.class}
                              onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                              placeholder="e.g. Class 10"
                              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Section <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editFormData.section}
                              onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                              placeholder="e.g. A"
                              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                              Roll No <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={editFormData.roll}
                              onChange={(e) => setEditFormData({ ...editFormData, roll: e.target.value })}
                              placeholder="e.g. 23"
                              className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                            />
                          </div>
                        </div>

                        {/* Account Status Toggle */}
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                          <div>
                            <span className="text-sm font-bold text-gray-800 block">Account Status</span>
                            <span className="text-xs text-gray-400">
                              {editFormData.is_active ? 'Student can log in and place canteen orders' : 'Account suspended / disabled'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              editFormData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {editFormData.is_active ? 'Active' : 'Inactive'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setEditFormData({ ...editFormData, is_active: !editFormData.is_active })}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                editFormData.is_active ? 'bg-green-600' : 'bg-gray-300'
                              }`}
                              role="switch"
                              aria-checked={editFormData.is_active}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  editFormData.is_active ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={savingEdit}
                            className="px-5 py-2 bg-brand-brown-dark hover:bg-brand-brown text-white rounded-lg text-sm font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                          >
                            {savingEdit && <RefreshCw size={14} className="animate-spin" />}
                            {savingEdit ? 'Saving...' : 'Save Profile'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: ORDER HISTORY */}
                  {activeTab === 'orders' && (
                    <div className="space-y-4">
                      {studentDetails.orders.length === 0 ? (
                        <div className="bg-white p-12 rounded-xl text-center text-gray-400 border border-gray-200">
                          <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="font-semibold text-gray-700">No orders placed yet</p>
                          <p className="text-xs text-gray-400 mt-1">This student has not submitted any canteen orders.</p>
                        </div>
                      ) : (
                        studentDetails.orders.map((order) => {
                          const statusConfig = STATUS_COLORS[order.status] || {
                            bg: 'bg-gray-100',
                            text: 'text-gray-700',
                            icon: Clock
                          };
                          const StatusIcon = statusConfig.icon;

                          return (
                            <div key={order.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-brand-brown-dark text-base">
                                    Order #{order.id}
                                  </span>
                                  <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text}`}>
                                    <StatusIcon size={12} />
                                    {order.status.toUpperCase()}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 flex items-center gap-1.5">
                                  <Calendar size={13} />
                                  {formatDate(order.created_at || order.createdAt)}
                                </div>
                              </div>

                              {/* Items list */}
                              <div className="py-3">
                                <ul className="divide-y divide-gray-100 text-sm">
                                  {order.items && order.items.length > 0 ? (
                                    order.items.map((item, idx) => (
                                      <li key={item.id || idx} className="py-2 flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                          <span className="font-semibold text-gray-800">{item.quantity}x</span>
                                          <span className="text-gray-700 font-medium">
                                            {item.menuItem?.name || 'Meal item'}
                                          </span>
                                        </div>
                                        <div className="text-gray-600 font-semibold">
                                          ₹{(Number(item.unit_price) * item.quantity).toFixed(2)}
                                        </div>
                                      </li>
                                    ))
                                  ) : (
                                    <li className="text-xs text-gray-400 py-1">Items details archived</li>
                                  )}
                                </ul>
                              </div>

                              {/* Footer Total */}
                              <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-sm">
                                <span className="text-xs text-gray-500">
                                  {order.note ? `Note: "${order.note}"` : 'Pre-order via Canteen App'}
                                </span>
                                <div className="font-bold text-gray-900">
                                  Total: <span className="text-base text-green-700">₹{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* TAB 3: WALLET LEDGER */}
                  {activeTab === 'wallet' && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                      {studentDetails.transactions.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                          <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p className="font-semibold text-gray-700">No transactions recorded</p>
                          <p className="text-xs text-gray-400 mt-1">This student has no wallet recharges or deductions.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto w-full custom-scrollbar">
                          <table className="min-w-[650px] w-full divide-y divide-gray-200 text-sm">
                          <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <tr>
                              <th className="px-4 py-3 text-left">Type</th>
                              <th className="px-4 py-3 text-left">Description / Ref</th>
                              <th className="px-4 py-3 text-right">Amount</th>
                              <th className="px-4 py-3 text-right">Balance After</th>
                              <th className="px-4 py-3 text-right">Date & Time</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {studentDetails.transactions.map((tx) => {
                              const isCredit = tx.type === 'credit';
                              return (
                                <tr key={tx.id} className="hover:bg-gray-50/50">
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span
                                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                        isCredit ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {isCredit ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
                                      {isCredit ? 'Credit (Top-up)' : 'Debit (Spent)'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-gray-700 font-medium">
                                    {tx.description || (tx.ref_id ? `Ref: ${tx.ref_id}` : 'Wallet Transaction')}
                                  </td>
                                  <td className={`px-4 py-3 text-right font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                    {isCredit ? '+' : '-'}₹{Number(tx.amount).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right font-semibold text-gray-800">
                                    ₹{Number(tx.balance_after).toFixed(2)}
                                  </td>
                                  <td className="px-4 py-3 text-right text-xs text-gray-500 whitespace-nowrap">
                                    {formatDate(tx.created_at || tx.createdAt)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* QUICK WALLET TOP-UP / DEDUCT MODAL                      */}
      {/* ======================================================= */}
      {walletModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-brand-brown-dark flex items-center gap-2">
                  <Wallet size={20} className="text-brand-gold-dark" />
                  Manage Student Wallet
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{walletModalStudent.name}</p>
              </div>
              <button
                onClick={() => setWalletModalStudent(null)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-brand-offwhite p-3.5 rounded-xl border border-brand-brown-light/20 mb-4 flex justify-between items-center text-sm">
              <span className="text-gray-600">Current Balance:</span>
              <span className="text-base font-bold text-green-600">
                ₹{Number(walletModalStudent.wallet_balance || 0).toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleWalletSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Action Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWalletType('refund')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      walletType === 'refund'
                        ? 'bg-green-500 text-white border-green-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    + Refund / Top-up
                  </button>
                  <button
                    type="button"
                    onClick={() => setWalletType('deduct')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                      walletType === 'deduct'
                        ? 'bg-red-500 text-white border-red-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    - Deduct (Purchase)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                  value={walletAmount}
                  onChange={(e) => setWalletAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWalletModalStudent(null)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={walletProcessing || !walletAmount}
                  className="flex-1 py-2.5 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded-lg text-sm transition shadow-sm disabled:opacity-50"
                >
                  {walletProcessing ? 'Saving...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* EDIT STUDENT PROFILE MODAL                             */}
      {/* ======================================================= */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-brown-dark text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-gold/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold font-bold">
                  {editingStudent.name ? editingStudent.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Edit Student Profile
                  </h2>
                  <p className="text-xs text-brand-brown-light mt-0.5">
                    Student ID: #{editingStudent.id} · {editingStudent.name}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditStudent}
                className="text-gray-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
                title="Cancel & close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <XCircle size={16} className="shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  placeholder="e.g. Sujal Sharma"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                />
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (for OTP login) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-gray-400 font-semibold">+91</span>
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    maxLength={10}
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value.replace(/\D/g, '') })}
                    placeholder="10-digit number"
                    className="w-full pl-12 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold font-mono focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Must be exactly 10 digits for student OTP login.</p>
              </div>

              {/* School / Branch Assignment */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  School / Campus Branch
                </label>
                <select
                  value={editFormData.school_id}
                  onChange={(e) => setEditFormData({ ...editFormData, school_id: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white font-medium focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                >
                  <option value="">No School / General Campus</option>
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} {sch.address ? `(${sch.address})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Class, Section, Roll Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Class */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.class}
                    onChange={(e) => setEditFormData({ ...editFormData, class: e.target.value })}
                    placeholder="e.g. Class 10"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                  />
                </div>

                {/* Section */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.section}
                    onChange={(e) => setEditFormData({ ...editFormData, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                  />
                </div>

                {/* Roll */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Roll No <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.roll}
                    onChange={(e) => setEditFormData({ ...editFormData, roll: e.target.value })}
                    placeholder="e.g. 23"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-brand-gold/60 focus:outline-none"
                  />
                </div>
              </div>

              {/* Account Status Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200">
                <div>
                  <span className="text-sm font-bold text-gray-800 block">Account Status</span>
                  <span className="text-xs text-gray-400">
                    {editFormData.is_active ? 'Student can log in and place canteen orders' : 'Account suspended / disabled'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    editFormData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {editFormData.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditFormData({ ...editFormData, is_active: !editFormData.is_active })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      editFormData.is_active ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                    role="switch"
                    aria-checked={editFormData.is_active}
                  >
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        editFormData.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditStudent}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-brand-brown-dark hover:bg-brand-brown text-white rounded-lg text-sm font-bold transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {savingEdit && <RefreshCw size={14} className="animate-spin" />}
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Delete Student Account</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to delete <strong className="text-gray-900">{studentToDelete.name}</strong>?
                </p>

                <div className="mt-3 p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs space-y-1.5 text-gray-600">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Class & Roll:</span>
                    <span className="font-semibold text-gray-800">{studentToDelete.class} ({studentToDelete.section || 'A'}) • #{studentToDelete.roll || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Mobile Phone:</span>
                    <span className="font-semibold text-gray-800">+91 {studentToDelete.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Wallet Balance:</span>
                    <span className="font-bold text-green-700">₹{Number(studentToDelete.wallet_balance || 0).toFixed(2)}</span>
                  </div>
                </div>

                {Number(studentToDelete.wallet_balance || 0) > 0 && (
                  <div className="mt-2.5 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-800 font-medium">
                    <AlertTriangle size={15} className="shrink-0 text-amber-600" />
                    <span>This student still has a remaining wallet balance of ₹{Number(studentToDelete.wallet_balance).toFixed(2)}.</span>
                  </div>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  This action disables login access and removes the student from the active directory. Past order records and sales history remain preserved in reports.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setStudentToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg transition disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteStudent}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Student</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
