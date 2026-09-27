'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';

export interface ChartPoint {
  date?: string;
  month?: string;
  label: string;
  revenue: number;
  recharge: number;
  orders: number;
  deliveredOrders: number;
  newStudents: number;
}

export interface ChartsData {
  last7Days: ChartPoint[];
  last30Days: ChartPoint[];
  monthly: ChartPoint[];
}

interface GrowthChartsProps {
  charts?: ChartsData;
  loading?: boolean;
}

// Catmull-Rom to Cubic Bezier smooth path generator
function getSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function GrowthCharts({ charts, loading }: GrowthChartsProps) {
  const [timeframe, setTimeframe] = useState<'7D' | '30D' | '12M'>('7D');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const rawData: ChartPoint[] = useMemo(() => {
    if (!charts) return [];
    if (timeframe === '7D') return charts.last7Days || [];
    if (timeframe === '30D') return charts.last30Days || [];
    return charts.monthly || [];
  }, [charts, timeframe]);

  // Overall Financial Summary for active timeframe
  const summary = useMemo(() => {
    let totalRevenue = 0;
    let totalRecharge = 0;
    let totalOrders = 0;
    let deliveredOrders = 0;
    let newStudents = 0;
    let peakRevenue = 0;
    let peakRevenueLabel = '';
    let peakOrders = 0;
    let peakOrdersLabel = '';

    rawData.forEach((pt) => {
      totalRevenue += pt.revenue;
      totalRecharge += pt.recharge;
      totalOrders += pt.orders;
      deliveredOrders += pt.deliveredOrders;
      newStudents += pt.newStudents;

      if (pt.revenue > peakRevenue) {
        peakRevenue = pt.revenue;
        peakRevenueLabel = pt.label;
      }
      if (pt.deliveredOrders > peakOrders) {
        peakOrders = pt.deliveredOrders;
        peakOrdersLabel = pt.label;
      }
    });

    const avgDailyRevenue = rawData.length > 0 ? totalRevenue / rawData.length : 0;
    const fulfillmentRate = totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 100;

    return {
      totalRevenue,
      totalRecharge,
      totalOrders,
      deliveredOrders,
      newStudents,
      peakRevenue,
      peakRevenueLabel,
      peakOrders,
      peakOrdersLabel,
      avgDailyRevenue,
      fulfillmentRate
    };
  }, [rawData]);

  // SVG Chart Geometry Setup
  const width = 640;
  const height = 220;
  const padding = { top: 25, right: 25, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Max scale for Revenue Chart (Revenue & Recharges)
  const maxRevenueVal = useMemo(() => {
    const maxVal = Math.max(
      ...rawData.map((d) => Math.max(d.revenue, d.recharge)),
      100 // minimum ceiling
    );
    // Round up to clean integer
    const factor = Math.pow(10, Math.floor(Math.log10(maxVal)));
    return Math.ceil(maxVal / factor) * factor;
  }, [rawData]);

  // Max scale for Business Growth Chart (Orders & Students)
  const maxGrowthVal = useMemo(() => {
    const maxVal = Math.max(
      ...rawData.map((d) => Math.max(d.orders, d.deliveredOrders, d.newStudents)),
      5 // minimum ceiling
    );
    return Math.max(5, Math.ceil(maxVal * 1.15));
  }, [rawData]);

  // Compute Revenue Coordinates
  const revenuePoints = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
      const y = padding.top + chartH - (d.revenue / maxRevenueVal) * chartH;
      return { x, y, data: d };
    });
  }, [rawData, maxRevenueVal, chartW, chartH, padding.left, padding.top]);

  const rechargePoints = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
      const y = padding.top + chartH - (d.recharge / maxRevenueVal) * chartH;
      return { x, y, data: d };
    });
  }, [rawData, maxRevenueVal, chartW, chartH, padding.left, padding.top]);

  // Compute Growth Coordinates (Delivered Orders & New Students)
  const orderPoints = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
      const y = padding.top + chartH - (d.deliveredOrders / maxGrowthVal) * chartH;
      return { x, y, data: d };
    });
  }, [rawData, maxGrowthVal, chartW, chartH, padding.left, padding.top]);

  const studentPoints = useMemo(() => {
    if (rawData.length === 0) return [];
    return rawData.map((d, i) => {
      const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
      const y = padding.top + chartH - (d.newStudents / maxGrowthVal) * chartH;
      return { x, y, data: d };
    });
  }, [rawData, maxGrowthVal, chartW, chartH, padding.left, padding.top]);

  // Path Strings
  const revenueLine = useMemo(() => getSmoothPath(revenuePoints), [revenuePoints]);
  const revenueArea = useMemo(() => {
    if (revenuePoints.length === 0) return '';
    const bottom = padding.top + chartH;
    return `${revenueLine} L ${revenuePoints[revenuePoints.length - 1].x},${bottom} L ${revenuePoints[0].x},${bottom} Z`;
  }, [revenueLine, revenuePoints, padding.top, chartH]);

  const rechargeLine = useMemo(() => getSmoothPath(rechargePoints), [rechargePoints]);
  const rechargeArea = useMemo(() => {
    if (rechargePoints.length === 0) return '';
    const bottom = padding.top + chartH;
    return `${rechargeLine} L ${rechargePoints[rechargePoints.length - 1].x},${bottom} L ${rechargePoints[0].x},${bottom} Z`;
  }, [rechargeLine, rechargePoints, padding.top, chartH]);

  const orderLine = useMemo(() => getSmoothPath(orderPoints), [orderPoints]);
  const orderArea = useMemo(() => {
    if (orderPoints.length === 0) return '';
    const bottom = padding.top + chartH;
    return `${orderLine} L ${orderPoints[orderPoints.length - 1].x},${bottom} L ${orderPoints[0].x},${bottom} Z`;
  }, [orderLine, orderPoints, padding.top, chartH]);

  const studentLine = useMemo(() => getSmoothPath(studentPoints), [studentPoints]);

  // Active hover point
  const activePt = hoverIndex !== null && hoverIndex >= 0 && hoverIndex < rawData.length ? rawData[hoverIndex] : null;

  return (
    <div className="space-y-4">
      {/* ── Section Header with Timeframe Tabs ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-100 text-amber-800 rounded-xl">
              <TrendingUp size={20} />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-brand-brown-dark tracking-tight">
                Business Growth & Revenue Analytics
              </h2>
              <p className="text-xs text-gray-500">
                Visual trends for canteen financial intake, order fulfillment, and user acquisition
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold text-gray-600">
          <button
            onClick={() => { setTimeframe('7D'); setHoverIndex(null); }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              timeframe === '7D'
                ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => { setTimeframe('30D'); setHoverIndex(null); }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              timeframe === '30D'
                ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => { setTimeframe('12M'); setHoverIndex(null); }}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              timeframe === '12M'
                ? 'bg-white shadow-2xs text-brand-brown-dark font-bold'
                : 'hover:text-gray-900'
            }`}
          >
            Monthly (This Year)
          </button>
        </div>
      </div>

      {/* ── Two High-Level Charts Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ======================================================== */}
        {/* CHART 1: REVENUE & FINANCIAL INTAKE                      */}
        {/* ======================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  ₹
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Revenue & Cashflow Trend</h3>
                  <p className="text-[11px] text-gray-500">Sales revenue vs student wallet recharges</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                  Order Sales
                </div>
                <div className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                  Wallet Recharge
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 mb-2">
              <div className="bg-emerald-50/60 border border-emerald-100/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Total Sales</span>
                <p className="text-base font-extrabold text-emerald-900 mt-0.5">
                  ₹{summary.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-amber-50/60 border border-amber-100/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Recharges</span>
                <p className="text-base font-extrabold text-amber-900 mt-0.5">
                  ₹{summary.totalRecharge.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200/70 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Peak Sales</span>
                <p className="text-base font-extrabold text-gray-800 mt-0.5">
                  ₹{summary.peakRevenue.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            {/* SVG Canvas */}
            <div className="relative mt-2">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  {/* Revenue Gradient */}
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Recharge Gradient */}
                  <linearGradient id="rechargeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padding.top + chartH - pct * chartH;
                  const val = Math.round(pct * maxRevenueVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#9CA3AF"
                        fontWeight="500"
                      >
                        ₹{val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Areas */}
                {rechargeArea && <path d={rechargeArea} fill="url(#rechargeGrad)" />}
                {revenueArea && <path d={revenueArea} fill="url(#revenueGrad)" />}

                {/* Lines */}
                {rechargeLine && (
                  <path
                    d={rechargeLine}
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {revenueLine && (
                  <path
                    d={revenueLine}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* X-Axis Labels */}
                {rawData.map((d, i) => {
                  // If 30D, show every 5th label to prevent clutter
                  if (timeframe === '30D' && i % 5 !== 0 && i !== rawData.length - 1) return null;
                  const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
                  const isHovered = hoverIndex === i;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? '#111827' : '#9CA3AF'}
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {d.label}
                    </text>
                  );
                })}

                {/* Interactive Overlay for Hover Detection */}
                {rawData.map((_, i) => {
                  const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
                  const colW = chartW / Math.max(1, rawData.length);
                  return (
                    <rect
                      key={i}
                      x={x - colW / 2}
                      y={padding.top}
                      width={colW}
                      height={chartH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                  );
                })}

                {/* Hover Highlights */}
                {hoverIndex !== null && revenuePoints[hoverIndex] && (
                  <g>
                    {/* Vertical guideline */}
                    <line
                      x1={revenuePoints[hoverIndex].x}
                      y1={padding.top}
                      x2={revenuePoints[hoverIndex].x}
                      y2={padding.top + chartH}
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Recharge point circle */}
                    {rechargePoints[hoverIndex] && (
                      <circle
                        cx={rechargePoints[hoverIndex].x}
                        cy={rechargePoints[hoverIndex].y}
                        r="5"
                        fill="#F59E0B"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="shadow-md"
                      />
                    )}

                    {/* Revenue point circle */}
                    <circle
                      cx={revenuePoints[hoverIndex].x}
                      cy={revenuePoints[hoverIndex].y}
                      r="6"
                      fill="#10B981"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="shadow-md"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Interactive Tooltip Card at Bottom of Chart */}
          <div className="mt-2 bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 text-xs flex items-center justify-between">
            {activePt ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                    📅 {activePt.label}
                  </span>
                  <span className="text-gray-500">Selected Point</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 font-semibold text-emerald-700">
                    <span>Sales:</span>
                    <strong>₹{activePt.revenue.toFixed(0)}</strong>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-amber-700">
                    <span>Recharge:</span>
                    <strong>₹{activePt.recharge.toFixed(0)}</strong>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-gray-400 italic">
                Hover over the chart to inspect specific date revenue and recharges
              </span>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* CHART 2: BUSINESS GROWTH (ORDERS & CUSTOMER ADOPTION)    */}
        {/* ======================================================== */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShoppingBag size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Business & Volume Growth</h3>
                  <p className="text-[11px] text-gray-500">Fulfilled orders volume & registered student growth</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-indigo-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-200" />
                  Fulfilled Orders
                </div>
                <div className="flex items-center gap-1.5 text-purple-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ring-2 ring-purple-200" />
                  New Students
                </div>
              </div>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-3 gap-2 mt-3.5 mb-2">
              <div className="bg-indigo-50/60 border border-indigo-100/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-indigo-700 tracking-wider">Orders Delivered</span>
                <p className="text-base font-extrabold text-indigo-900 mt-0.5">
                  {summary.deliveredOrders} <span className="text-xs font-normal text-indigo-600">({summary.totalOrders} total)</span>
                </p>
              </div>
              <div className="bg-purple-50/60 border border-purple-100/80 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">New Students</span>
                <p className="text-base font-extrabold text-purple-900 mt-0.5">
                  +{summary.newStudents}
                </p>
              </div>
              <div className="bg-gray-50 border border-gray-200/70 p-2.5 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Fulfillment Rate</span>
                <p className="text-base font-extrabold text-gray-800 mt-0.5">
                  {summary.fulfillmentRate.toFixed(0)}%
                </p>
              </div>
            </div>

            {/* SVG Canvas */}
            <div className="relative mt-2">
              <svg
                viewBox={`0 0 ${width} ${height}`}
                className="w-full h-auto overflow-visible select-none"
                onMouseLeave={() => setHoverIndex(null)}
              >
                <defs>
                  {/* Orders Gradient */}
                  <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
                  const y = padding.top + chartH - pct * chartH;
                  const val = Math.round(pct * maxGrowthVal);
                  return (
                    <g key={idx}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={width - padding.right}
                        y2={y}
                        stroke="#E5E7EB"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#9CA3AF"
                        fontWeight="500"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Filled Area for Orders */}
                {orderArea && <path d={orderArea} fill="url(#orderGrad)" />}

                {/* Fulfilled Orders Line */}
                {orderLine && (
                  <path
                    d={orderLine}
                    fill="none"
                    stroke="#4F46E5"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* New Students Line */}
                {studentLine && (
                  <path
                    d={studentLine}
                    fill="none"
                    stroke="#8B5CF6"
                    strokeWidth="2.5"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Student Point Markers (Dots) */}
                {studentPoints.map((pt, i) => {
                  if (pt.data.newStudents === 0) return null;
                  return (
                    <circle
                      key={`student-dot-${i}`}
                      cx={pt.x}
                      cy={pt.y}
                      r="4"
                      fill="#8B5CF6"
                      stroke="#FFFFFF"
                      strokeWidth="1.5"
                    />
                  );
                })}

                {/* X-Axis Labels */}
                {rawData.map((d, i) => {
                  if (timeframe === '30D' && i % 5 !== 0 && i !== rawData.length - 1) return null;
                  const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
                  const isHovered = hoverIndex === i;
                  return (
                    <text
                      key={i}
                      x={x}
                      y={height - 8}
                      textAnchor="middle"
                      fontSize="10"
                      fill={isHovered ? '#111827' : '#9CA3AF'}
                      fontWeight={isHovered ? '700' : '500'}
                    >
                      {d.label}
                    </text>
                  );
                })}

                {/* Interactive Overlay for Hover Detection */}
                {rawData.map((_, i) => {
                  const x = padding.left + (i / Math.max(1, rawData.length - 1)) * chartW;
                  const colW = chartW / Math.max(1, rawData.length);
                  return (
                    <rect
                      key={i}
                      x={x - colW / 2}
                      y={padding.top}
                      width={colW}
                      height={chartH}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoverIndex(i)}
                    />
                  );
                })}

                {/* Hover Highlights */}
                {hoverIndex !== null && orderPoints[hoverIndex] && (
                  <g>
                    {/* Vertical guideline */}
                    <line
                      x1={orderPoints[hoverIndex].x}
                      y1={padding.top}
                      x2={orderPoints[hoverIndex].x}
                      y2={padding.top + chartH}
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Student point circle */}
                    {studentPoints[hoverIndex] && (
                      <circle
                        cx={studentPoints[hoverIndex].x}
                        cy={studentPoints[hoverIndex].y}
                        r="5"
                        fill="#8B5CF6"
                        stroke="#FFFFFF"
                        strokeWidth="2.5"
                        className="shadow-md"
                      />
                    )}

                    {/* Orders point circle */}
                    <circle
                      cx={orderPoints[hoverIndex].x}
                      cy={orderPoints[hoverIndex].y}
                      r="6"
                      fill="#4F46E5"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      className="shadow-md"
                    />
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Interactive Tooltip Card at Bottom of Chart */}
          <div className="mt-2 bg-gray-50 border border-gray-200/80 rounded-xl p-2.5 text-xs flex items-center justify-between">
            {activePt ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded-md border border-gray-200 shadow-2xs">
                    📅 {activePt.label}
                  </span>
                  <span className="text-gray-500">Selected Point</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 font-semibold text-indigo-700">
                    <span>Delivered Orders:</span>
                    <strong>{activePt.deliveredOrders}</strong>
                    <span className="text-gray-400 font-normal">({activePt.orders} total)</span>
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-purple-700">
                    <span>New Students:</span>
                    <strong>+{activePt.newStudents}</strong>
                  </div>
                </div>
              </>
            ) : (
              <span className="text-gray-400 italic">
                Hover over the chart to inspect specific date orders and student registrations
              </span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
