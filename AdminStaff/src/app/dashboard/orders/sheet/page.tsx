'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  RefreshCw,
  Download,
  Calendar,
  Filter,
  ShoppingBag,
  TrendingUp,
  Users,
  Clock,
  ArrowRight,
  Layers,
  ChevronDown
} from 'lucide-react';

interface OrderItem {
  id: number | string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  status: string;
  total_amount: number;
  createdAt: string;
  dateDisplay: string;
  student: {
    name: string;
    class: string;
    section: string;
    roll: string;
    phone?: string;
  };
  items: OrderItem[];
}

interface AvailableDate {
  order_date: string;
  count: number;
}

const formatDateToInput = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getLocalToday = () => formatDateToInput(new Date());

const getPastDate = (daysAgo: number) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return formatDateToInput(d);
};

const getStartOfMonth = () => {
  const now = new Date();
  return formatDateToInput(new Date(now.getFullYear(), now.getMonth(), 1));
};

export default function OrderSheetPage() {
  // Filter mode: 'preset' | 'range' | 'single' | 'all'
  const [filterMode, setFilterMode] = useState<'today' | 'yesterday' | 'last7' | 'thisMonth' | 'last30' | 'range' | 'all'>('last7');
  const [startDate, setStartDate] = useState<string>(() => getPastDate(6));
  const [endDate, setEndDate] = useState<string>(getLocalToday);
  const [singleDate, setSingleDate] = useState<string>(getLocalToday);

  const [orders, setOrders] = useState<Order[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch orders based on active filter
  const fetchOrders = async () => {
    setLoading(true);
    try {
      let queryUrl = `/api/orders/sheet?t=${Date.now()}`;

      if (filterMode === 'all') {
        queryUrl += '&date=all';
      } else if (filterMode === 'today') {
        queryUrl += `&date=${getLocalToday()}`;
      } else if (filterMode === 'yesterday') {
        queryUrl += `&date=${getPastDate(1)}`;
      } else if (filterMode === 'range' || filterMode === 'last7' || filterMode === 'thisMonth' || filterMode === 'last30') {
        queryUrl += `&startDate=${startDate}&endDate=${endDate}`;
      } else {
        queryUrl += `&date=${singleDate}`;
      }

      const res = await fetch(queryUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
          if (data.availableDates) {
            setAvailableDates(data.availableDates);
          }
        }
      }
    } catch (e) {
      console.error('Failed to fetch orders sheet:', e);
    } finally {
      setLoading(false);
    }
  };

  // Preset Handlers
  const handleSelectPreset = (preset: 'today' | 'yesterday' | 'last7' | 'thisMonth' | 'last30' | 'range' | 'all') => {
    setFilterMode(preset);
    const today = getLocalToday();

    if (preset === 'today') {
      setStartDate(today);
      setEndDate(today);
      setSingleDate(today);
    } else if (preset === 'yesterday') {
      const yest = getPastDate(1);
      setStartDate(yest);
      setEndDate(yest);
      setSingleDate(yest);
    } else if (preset === 'last7') {
      setStartDate(getPastDate(6));
      setEndDate(today);
    } else if (preset === 'thisMonth') {
      setStartDate(getStartOfMonth());
      setEndDate(today);
    } else if (preset === 'last30') {
      setStartDate(getPastDate(29));
      setEndDate(today);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filterMode, startDate, endDate, singleDate]);

  // Derived summaries
  const grandTotal = useMemo(() => orders.reduce((s, o) => s + Number(o.total_amount || 0), 0), [orders]);
  const uniqueStudents = useMemo(() => new Set(orders.map((o) => o.student?.name || o.student?.roll)).size, [orders]);

  // Orders breakdown by day in the current selection
  const ordersByDay = useMemo(() => {
    const map: Record<string, number> = {};
    for (const o of orders) {
      const d = o.dateDisplay || 'Unknown';
      map[d] = (map[d] || 0) + 1;
    }
    return Object.entries(map).map(([day, count]) => ({ day, count }));
  }, [orders]);

  // Human-readable active date range label
  const formatRangeLabel = () => {
    if (filterMode === 'all') return 'All Recorded Dates';
    if (filterMode === 'today') return `Today (${getLocalToday()})`;
    if (filterMode === 'yesterday') return `Yesterday (${getPastDate(1)})`;
    if (startDate === endDate) return startDate;
    return `${startDate} to ${endDate}`;
  };

  const handleDownloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (!win) return;

    const rangeLabel = formatRangeLabel();

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAPSTREAK - Order Sheet (${rangeLabel})</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #000; padding: 25px 20px; }
          .sheet-title { font-size: 16px; font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px; }
          .sheet-subtitle { font-size: 11px; font-weight: 600; text-align: center; color: #444; margin-bottom: 12px; }
          .metrics-bar { display: flex; justify-content: space-around; background: #f4f4f4; border: 1px solid #ccc; padding: 6px 12px; margin-bottom: 12px; border-radius: 4px; font-weight: 700; font-size: 11px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #111; padding: 5px 6px; font-size: 10.5px; }
          th { font-weight: 700; text-align: left; background-color: #f0f0f0; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .total-box { font-weight: 800; background-color: #fbfbfb; }
          @media print {
            body { padding: 10px; }
            @page { margin: 10mm; size: auto; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-title">MAPSTREAK - Order Sheet</div>
        <div class="sheet-subtitle">Date Range: ${rangeLabel}</div>
        <div class="metrics-bar">
          <span>Total Orders: ${orders.length}</span>
          <span>Students Served: ${uniqueStudents}</span>
          <span>Grand Total: ₹ ${grandTotal.toFixed(0)}</span>
        </div>
        ${printContent.innerHTML}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* ======================================================= */}
      {/* 1. TOP HEADER & FILTER CONTROLS                         */}
      {/* ======================================================= */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-6 h-6 text-indigo-600" />
              Order Sheet & Range Analytics
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Filter by date range to inspect incoming order volume, student demand, and export sheets
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
              title="Refresh Orders"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={orders.length === 0}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-40 cursor-pointer"
              title="Print or Save PDF"
            >
              <Download size={14} />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

        {/* Quick Range Preset Buttons */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide mr-2 flex items-center gap-1">
              <Calendar size={13} /> Filter:
            </span>

            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'thisMonth', label: 'This Month' },
              { id: 'last30', label: 'Last 30 Days' },
              { id: 'range', label: 'Custom Range 📅' },
              { id: 'all', label: 'All Dates' },
            ].map((p) => {
              const active = filterMode === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Date Range Inputs Box (Shown whenever in range mode or custom range) */}
          {filterMode !== 'all' && (
            <div className="flex flex-wrap items-center gap-3 pt-2 bg-gray-50/80 p-3 rounded-xl border border-gray-200/70 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">From Date:</span>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || getLocalToday()}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setFilterMode('range');
                  }}
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">To Date:</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  max={getLocalToday()}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setFilterMode('range');
                  }}
                  className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {availableDates.length > 0 && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <span className="text-gray-500 font-medium">Quick Jump:</span>
                  <select
                    value={startDate === endDate ? startDate : ''}
                    onChange={(e) => {
                      const selected = e.target.value;
                      setStartDate(selected);
                      setEndDate(selected);
                      setFilterMode('range');
                    }}
                    className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none"
                  >
                    <option value="" disabled>Select active date...</option>
                    {availableDates.map((ad) => (
                      <option key={ad.order_date} value={ad.order_date}>
                        {ad.order_date} ({ad.count} orders)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. PROMINENT DATE RANGE ORDER COUNT & METRICS BANNER    */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders in Range Card (Highlighted) */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 text-white p-5 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-indigo-100 uppercase tracking-wider">
                Orders in Date Range
              </p>
              <h2 className="text-3xl font-extrabold mt-1 tracking-tight">
                {orders.length} <span className="text-sm font-medium text-indigo-200">orders</span>
              </h2>
            </div>
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-xs">
              <ShoppingBag size={22} className="text-white" />
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/15 flex items-center justify-between text-[11px] text-indigo-100">
            <span>Range: {formatRangeLabel()}</span>
          </div>
        </div>

        {/* Selected Period Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Period</p>
              <h3 className="text-base font-extrabold text-gray-800 mt-1 line-clamp-1">
                {formatRangeLabel()}
              </h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Calendar size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
            {filterMode === 'all'
              ? 'Showing all orders across all time'
              : startDate === endDate
              ? 'Single day report'
              : `${ordersByDay.length} day(s) with order activity`}
          </p>
        </div>

        {/* Revenue in Range Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Revenue in Range</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">
                ₹{grandTotal.toFixed(2)}
              </h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
            Avg: ₹{orders.length > 0 ? (grandTotal / orders.length).toFixed(1) : 0} per order
          </p>
        </div>

        {/* Unique Students Served Card */}
        <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Students Served</p>
              <h3 className="text-2xl font-extrabold text-blue-600 mt-1">
                {uniqueStudents} <span className="text-xs font-medium text-gray-400">students</span>
              </h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users size={22} />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
            Unique students with orders in this range
          </p>
        </div>
      </div>

      {/* Daily Breakdown Chips (When multiple days exist in the range) */}
      {ordersByDay.length > 1 && (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock size={13} className="text-indigo-600" />
            Daily Order Breakdown in Selected Range ({ordersByDay.length} Days):
          </div>
          <div className="flex flex-wrap gap-2">
            {ordersByDay.map(({ day, count }) => (
              <span
                key={day}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/80 border border-indigo-200/80 text-indigo-900 rounded-lg text-xs font-semibold"
              >
                <span>{day}:</span>
                <span className="bg-indigo-600 text-white px-1.5 py-0.2 rounded text-[11px] font-bold">
                  {count} {count === 1 ? 'order' : 'orders'}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 3. ORDER SHEET TABLE                                    */}
      {/* ======================================================= */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden p-4 md:p-6">
        <div className="text-center pb-4 mb-4 border-b border-gray-100">
          <h2 className="font-extrabold text-lg text-gray-900 uppercase tracking-wide">
            MAPSTREAK - Order Sheet
          </h2>
          <p className="text-xs text-gray-500 mt-0.5 font-medium">
            Period: <span className="font-bold text-gray-700">{formatRangeLabel()}</span> · Total Orders: <span className="font-bold text-indigo-600">{orders.length}</span> · Grand Total: <span className="font-bold text-emerald-600">₹{grandTotal.toFixed(0)}</span>
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="font-medium text-gray-600">Fetching order sheet for {formatRangeLabel()}...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">
              No orders found for {formatRangeLabel()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting the date range or select &quot;All Dates&quot; above to view historical orders.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Printable ref element */}
            <div ref={printRef}>
              <table className="w-full text-xs border-collapse border border-gray-800">
                <thead>
                  <tr className="bg-gray-100 text-gray-900 border-b border-gray-800 font-bold">
                    <th className="border border-gray-800 px-3 py-2 text-left w-[18%]">Name</th>
                    <th className="border border-gray-800 px-3 py-2 text-left w-[12%]">Class</th>
                    <th className="border border-gray-800 px-3 py-2 text-left w-[8%]">Roll</th>
                    <th className="border border-gray-800 px-3 py-2 text-left w-[24%]">Product</th>
                    <th className="border border-gray-800 px-2 py-2 text-center w-[6%]">Qty</th>
                    <th className="border border-gray-800 px-2 py-2 text-right w-[8%]">Price</th>
                    <th className="border border-gray-800 px-2 py-2 text-center w-[10%]">Status</th>
                    <th className="border border-gray-800 px-2 py-2 text-center w-[12%]">Total</th>
                    <th className="border border-gray-800 px-2 py-2 text-center w-[10%]">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const studentClass = `${order.student?.class || ''} ${order.student?.section || ''}`.trim() || '—';
                    const orderDateStr = order.dateDisplay || '—';

                    return (
                      <React.Fragment key={order.id}>
                        {/* Render all item rows for this order */}
                        {order.items.map((item, idx) => (
                          <tr key={`${order.id}-${item.id || idx}`} className="hover:bg-gray-50/50">
                            {/* Student Name only on row 0 */}
                            <td className="border border-gray-800 px-3 py-2 font-medium text-gray-900 align-top">
                              {idx === 0 ? order.student?.name || 'Student' : ''}
                            </td>
                            {/* Class only on row 0 */}
                            <td className="border border-gray-800 px-3 py-2 text-gray-700 align-top">
                              {idx === 0 ? studentClass : ''}
                            </td>
                            {/* Roll only on row 0 */}
                            <td className="border border-gray-800 px-3 py-2 text-gray-700 align-top">
                              {idx === 0 ? order.student?.roll || '—' : ''}
                            </td>
                            {/* Product */}
                            <td className="border border-gray-800 px-3 py-2 text-gray-800">
                              {item.product_name}
                            </td>
                            {/* Qty */}
                            <td className="border border-gray-800 px-2 py-2 text-center text-gray-800 font-medium">
                              {item.quantity}
                            </td>
                            {/* Price */}
                            <td className="border border-gray-800 px-2 py-2 text-right text-gray-800">
                              {Number(item.unit_price).toFixed(0)}
                            </td>
                            {/* Status */}
                            <td className="border border-gray-800 px-2 py-2 text-center text-gray-700 font-medium capitalize">
                              {order.status || 'Pending'}
                            </td>
                            {/* Total column (blank during item rows) */}
                            <td className="border border-gray-800 px-2 py-2 text-center"></td>
                            {/* Date displayed on every product row */}
                            <td className="border border-gray-800 px-2 py-2 text-center text-gray-700 whitespace-nowrap">
                              {orderDateStr}
                            </td>
                          </tr>
                        ))}

                        {/* Order Subtotal Row */}
                        <tr className="bg-gray-50/40 font-bold">
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5 text-center text-gray-900">
                            Total: ₹ {Number(order.total_amount).toFixed(0)}
                          </td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
