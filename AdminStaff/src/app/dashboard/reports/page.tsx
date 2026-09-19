'use client';
import { useState, useEffect } from 'react';
import { TrendingUp, ShoppingBag } from 'lucide-react';

export default function ReportsPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/reports').then(res => {
      if (res.ok) {
        res.json().then(setData);
      }
    });
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-brown-dark mb-6">Financial Reports</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow border border-brand-brown-light/20 flex items-center gap-4">
          <div className="p-4 bg-brand-gold-light rounded-full text-brand-brown-dark"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-sm text-brand-brown-light">Total Delivered Orders</p>
            <h3 className="text-2xl font-bold text-brand-brown-dark">{data.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow border border-brand-brown-light/20 flex items-center gap-4">
          <div className="p-4 bg-green-100 rounded-full text-green-700"><TrendingUp size={24} /></div>
          <div>
            <p className="text-sm text-brand-brown-light">Total Revenue (?)</p>
            <h3 className="text-2xl font-bold text-brand-gold-dark">?{data.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
