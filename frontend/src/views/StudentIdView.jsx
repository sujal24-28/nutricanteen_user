import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import {
  GraduationCap,
  ShieldCheck,
  Wallet,
  Building2,
  Clock,
  Phone,
  LogOut,
  ArrowLeft
} from 'lucide-react';

export const StudentIdView = () => {
  const {
    student,
    walletBalance,
    setIsRechargeOpen,
    logout,
    setActiveTab
  } = useCanteen();

  if (!student) return null;

  return (
    <div className="pb-28 px-4 pt-3 space-y-3.5">
      {/* Title & Badge */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setActiveTab('menu')}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span>Student Canteen Pass</span>
            <span className="text-[10px] bg-leaf-50 dark:bg-leaf-950 text-leaf-700 dark:text-leaf-300 font-bold px-2 py-0.5 rounded-full border border-leaf-200 dark:border-leaf-800">
              Verified
            </span>
          </h1>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            Unique digital identifier for school canteen access
          </p>
        </div>
      </div>

      {/* Main Student ID Card (Soft Leaf Green & Warm Gold Accents) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-leaf-700 via-leaf-800 to-leaf-900 text-white p-5 shadow-md border border-leaf-600/50">
        {/* Background Decorative Rings */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-gold-300/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-leaf-400/10 blur-2xl pointer-events-none" />
        <div className="absolute top-2 right-4 text-leaf-600/20 text-8xl font-black select-none pointer-events-none">
          {student.rollNo}
        </div>

        {/* School Header */}
        <div className="flex items-center justify-between border-b border-leaf-600/50 pb-3 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gold-400/20 border border-gold-300/30 flex items-center justify-center text-gold-200">
              <GraduationCap className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] tracking-wider uppercase font-bold text-gold-200 block">
                Official School Pass
              </span>
              <span className="text-xs font-bold text-gray-100 line-clamp-1">
                {student.schoolName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-leaf-200 bg-leaf-800/80 px-2 py-0.5 rounded-full border border-leaf-600/40">
            <ShieldCheck className="w-3 h-3 text-leaf-300" />
            <span>Active</span>
          </div>
        </div>

        {/* Student Profile Row */}
        <div className="flex items-center gap-3.5 my-3.5 relative z-10">
          <div className="relative">
            <img
              src={student.avatar || 'https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af&size=200'}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-gold-300/80 shadow-xs bg-leaf-950"
            />
            <div className="absolute -bottom-1 -right-1 bg-gold-300 text-gold-950 font-black text-[9px] px-1.5 py-0.2 rounded-full shadow-xs">
              #{student.rollNo}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-white tracking-tight truncate">
              {student.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-medium text-leaf-100">
                {student.className} - Sec {student.section}
              </span>
              <span className="w-1 h-1 rounded-full bg-gold-300" />
              <span className="text-xs font-bold text-gold-200">
                Roll #{student.rollNo}
              </span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono bg-leaf-950/60 border border-leaf-600/40 px-2 py-0.2 rounded-lg text-gold-200">
              ID: {student.uniqueId}
            </div>
          </div>
        </div>

        {/* 3-Pillar Identification Grid (Unique Address) */}
        <div className="grid grid-cols-3 gap-2 bg-leaf-900/70 backdrop-blur-xs p-2.5 rounded-2xl border border-leaf-600/40 text-center relative z-10">
          <div>
            <span className="text-[9px] text-leaf-200 uppercase font-semibold block">Class</span>
            <span className="text-xs font-bold text-white">{student.className}</span>
          </div>
          <div className="border-x border-leaf-700/60">
            <span className="text-[9px] text-leaf-200 uppercase font-semibold block">Section</span>
            <span className="text-xs font-bold text-gold-200 font-mono">{student.section}</span>
          </div>
          <div>
            <span className="text-[9px] text-leaf-200 uppercase font-semibold block">Roll No</span>
            <span className="text-xs font-bold text-white font-mono">{student.rollNo}</span>
          </div>
        </div>

        {/* Live Wallet Chip on Pass */}
        <div className="mt-2.5 flex items-center justify-between bg-gold-400/10 border border-gold-300/30 p-2.5 rounded-2xl relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gold-300 flex items-center justify-center text-gold-950">
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[9px] text-gold-200 block font-medium">Canteen Wallet</span>
              <span className="text-xs font-bold text-white">₹{walletBalance}</span>
            </div>
          </div>
          <button
            onClick={() => setIsRechargeOpen(true)}
            className="text-[11px] bg-gold-300 hover:bg-gold-200 text-gold-950 font-bold px-3 py-1 rounded-xl transition shadow-xs active:scale-95 cursor-pointer"
          >
            + Top Up
          </button>
        </div>
      </div>



      {/* School Canteen Timings & Counter Info */}
      <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-leaf-100 dark:border-leaf-800 space-y-2.5 shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
          School Canteen Details
        </span>

        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-leaf-50 dark:bg-leaf-900/60 text-leaf-700 dark:text-leaf-300 flex items-center justify-center shrink-0">
            <Building2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">
              {student.schoolName}
            </span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">
              Ground Floor, Main Dining Hall & Counters 1–4
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800">
          <div className="p-2 bg-leaf-50/60 dark:bg-gray-800/60 rounded-xl">
            <div className="flex items-center gap-1 text-leaf-700 dark:text-leaf-400 text-xs font-bold mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Morning Recess</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
              10:30 AM – 10:50 AM
            </span>
            <span className="text-[10px] text-gray-400">Quick snacks & drinks</span>
          </div>

          <div className="p-2 bg-gold-50/60 dark:bg-gray-800/60 rounded-xl">
            <div className="flex items-center gap-1 text-gold-700 dark:text-gold-400 text-xs font-bold mb-0.5">
              <Clock className="w-3 h-3" />
              <span>Lunch Break</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 block">
              01:15 PM – 01:50 PM
            </span>
            <span className="text-[10px] text-gray-400">Hot meals & combos</span>
          </div>
        </div>
      </div>

      {/* Parent Contact Card */}
      <div className="bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-leaf-100 dark:border-leaf-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gold-50 dark:bg-gold-900/60 text-gold-700 dark:text-gold-300 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[9px] text-gray-400 uppercase font-bold block">
              Parent Contact (Recharge Alerts)
            </span>
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {student.parentContact || `+91 ${student.phone}`}
            </span>
          </div>
        </div>
      </div>

      {/* Switch Student / Logout */}
      <button
        onClick={logout}
        className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/80 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition active:scale-98 cursor-pointer"
      >
        <LogOut className="w-3.5 h-3.5" />
        <span>Switch Account / Sign Out (+91 {student.phone})</span>
      </button>
    </div>
  );
};
