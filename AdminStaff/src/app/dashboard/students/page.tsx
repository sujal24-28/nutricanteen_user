'use client';
import { useState, useEffect } from 'react';
import { Wallet, Search } from 'lucide-react';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deduct');

  const fetchStudents = async () => {
    const res = await fetch('/api/students');
    if (res.ok) setStudents(await res.json());
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const res = await fetch(`/api/students/${selectedStudent.id}/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, type })
    });

    if (res.ok) {
      alert('Transaction successful');
      setSelectedStudent(null);
      setAmount('');
      fetchStudents();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed');
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-brown-dark mb-6">Students & Wallets</h1>
      
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            className="w-full pl-10 pr-4 py-2 border rounded-md"
            placeholder="Search by name or phone..."
            value={search} onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-lg shadow overflow-x-auto border border-brand-brown-light/20">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-brand-offwhite">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-brand-brown-light uppercase">Balance</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-brand-brown-light uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(s => (
                <tr key={s.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-brand-brown-dark">{s.name}</div>
                    <div className="text-sm text-gray-500">{s.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.class}-{s.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">?{s.wallet_balance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => setSelectedStudent(s)}
                      className="text-brand-gold-dark hover:text-brand-brown-dark flex items-center justify-end gap-1 w-full"
                    >
                      <Wallet size={16} /> Manage Wallet
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div className="bg-white p-6 rounded-lg shadow border border-brand-brown-light/20 h-fit">
            <h2 className="text-xl font-bold mb-4 text-brand-brown-dark">Wallet Transaction</h2>
            <div className="mb-4 text-sm bg-brand-offwhite p-3 rounded">
              <p><strong>Student:</strong> {selectedStudent.name}</p>
              <p><strong>Balance:</strong> ?{selectedStudent.wallet_balance}</p>
            </div>
            
            <form onSubmit={handleTransaction}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
                  <option value="deduct">Deduct (Counter Purchase)</option>
                  <option value="refund">Refund / Top-up</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount (?)</label>
                <input 
                  type="number" required min="1" step="1"
                  className="w-full border p-2 rounded"
                  value={amount} onChange={e => setAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelectedStudent(null)} className="flex-1 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-brand-gold hover:bg-brand-gold-dark text-brand-brown-dark font-bold rounded">Confirm</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
