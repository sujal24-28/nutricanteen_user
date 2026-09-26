'use client';

import { useState, useEffect, useRef } from 'react';
import { RefreshCw, Download, Calendar, Filter } from 'lucide-react';

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

const getLocalToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function OrderSheetPage() {
  const [date, setDate] = useState<string>(getLocalToday);
  const [isAllDates, setIsAllDates] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const fetchOrders = async (targetDate: string, showAll: boolean) => {
    setLoading(true);
    try {
      const queryParam = showAll ? 'all' : targetDate;
      const res = await fetch(`/api/orders/sheet?date=${queryParam}&t=${Date.now()}`, {
        cache: 'no-store',
      });
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

  useEffect(() => {
    fetchOrders(date, isAllDates);
  }, [date, isAllDates]);

  const grandTotal = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  const formatDisplayDate = (dStr: string) => {
    if (isAllDates) return 'All Recorded Dates';
    try {
      const [y, m, d] = dStr.split('-');
      return `${d}/${m}/${y}`;
    } catch {
      return dStr;
    }
  };

  const handleDownloadPDF = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const win = window.open('', '_blank');
    if (!win) return;

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MAPSTREAK - Daily Order Sheet</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; font-size: 11px; color: #000; padding: 25px 20px; }
          .sheet-title { font-size: 15px; font-weight: 800; text-align: center; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 5px; }
          th, td { border: 1px solid #111; padding: 5px 6px; font-size: 10.5px; }
          th { font-weight: 700; text-align: left; background-color: #fff; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .font-bold { font-weight: bold; }
          .total-box { font-weight: 800; }
          @media print {
            body { padding: 10px; }
            @page { margin: 10mm; size: auto; }
          }
        </style>
      </head>
      <body>
        <div class="sheet-title">MAPSTREAK - Daily Order Sheet</div>
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
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Top Controls */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>📋</span> Daily Order Sheet
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            View, filter, and print student-wise order sheets
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick toggle: Today vs All */}
          <div className="flex items-center bg-gray-100 p-1 rounded-lg text-xs font-semibold text-gray-700">
            <button
              onClick={() => {
                setIsAllDates(false);
                setDate(getLocalToday());
              }}
              className={`px-3 py-1.5 rounded-md transition ${
                !isAllDates && date === getLocalToday()
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'hover:text-gray-900'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setIsAllDates(true)}
              className={`px-3 py-1.5 rounded-md transition ${
                isAllDates
                  ? 'bg-white shadow-sm text-indigo-600'
                  : 'hover:text-gray-900'
              }`}
            >
              All Dates
            </button>
          </div>

          {/* Date Picker */}
          {!isAllDates && (
            <div className="relative flex items-center">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setIsAllDates(false);
                }}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          )}

          {/* Available Dates Dropdown */}
          {availableDates.length > 0 && !isAllDates && (
            <select
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setIsAllDates(false);
              }}
              className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 bg-white focus:outline-none"
              title="Jump to date with orders"
            >
              <option value="" disabled>Jump to date...</option>
              {availableDates.map((ad) => (
                <option key={ad.order_date} value={ad.order_date}>
                  {ad.order_date} ({ad.count} orders)
                </option>
              ))}
            </select>
          )}

          {/* Refresh Button */}
          <button
            onClick={() => fetchOrders(date, isAllDates)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>

          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPDF}
            disabled={orders.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-sm transition disabled:opacity-40"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Selected Date</p>
          <p className="text-base font-bold text-gray-800 mt-0.5">{formatDisplayDate(date)}</p>
        </div>
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Orders</p>
          <p className="text-lg font-bold text-indigo-600 mt-0.5">{orders.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Total Students</p>
          <p className="text-lg font-bold text-blue-600 mt-0.5">
            {new Set(orders.map((o) => o.student?.name || o.student?.roll)).size}
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm">
          <p className="text-xs text-gray-500 font-medium">Grand Total</p>
          <p className="text-lg font-bold text-green-600 mt-0.5">₹{grandTotal.toFixed(0)}</p>
        </div>
      </div>

      {/* Main Order Sheet Container */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden p-4 md:p-6">
        <div className="text-center font-extrabold text-lg text-gray-900 uppercase tracking-wide mb-4">
          MAPSTREAK - Daily Order Sheet
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="font-medium text-gray-600">Loading order sheet data...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-base font-semibold text-gray-700">No orders found for {formatDisplayDate(date)}</p>
            <p className="text-xs text-gray-400 mt-1">Try selecting another date or click &quot;All Dates&quot; above.</p>
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

                        {/* Order Subtotal Row (Exactly matching the format in the user photo) */}
                        <tr className="bg-gray-50/30">
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-3 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5"></td>
                          <td className="border border-gray-800 px-2 py-1.5 text-center font-bold text-gray-900">
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

// React import for React.Fragment
import React from 'react';
