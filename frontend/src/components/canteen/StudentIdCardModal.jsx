import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { X, GraduationCap, School, Wallet, Info } from 'lucide-react';

export const StudentIdCardModal = () => {
  const { isStudentIdModalOpen, setIsStudentIdModalOpen, student, walletBalance } = useCanteen();

  if (!isStudentIdModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-leaf-950 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-leaf-200 dark:border-leaf-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-leaf-800 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-3.5 bg-leaf-700 text-white flex items-center justify-between border-b border-leaf-600 shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-gold-300" />
            <h3 className="font-bold text-sm text-white">Student Canteen Identity Card</h3>
          </div>
          <button
            onClick={() => setIsStudentIdModalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto">
          {/* Physical Style School ID Card */}
          <div className="rounded-3xl bg-gradient-to-br from-leaf-700 via-leaf-800 to-leaf-900 text-white p-4.5 border border-leaf-600 shadow-md relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-300/10 rounded-full blur-2xl pointer-events-none"></div>

            {/* School Header Banner */}
            <div className="flex items-center justify-between pb-2.5 border-b border-leaf-600/60">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gold-200 text-gold-950 flex items-center justify-center font-bold text-xs">
                  <School className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gold-200 leading-tight">
                    {student?.schoolName?.split('(')[0] || 'Delhi Public School'}
                  </h4>
                  <p className="text-[10px] text-leaf-200 font-medium">Digital Canteen Pass • 2026-27</p>
                </div>
              </div>
              <span className="bg-leaf-800 text-leaf-200 text-[9px] font-bold px-2 py-0.5 rounded-full border border-leaf-600">
                ACTIVE
              </span>
            </div>

            {/* Student Details Grid */}
            <div className="py-3.5 flex gap-3.5 items-center">
              <div className="w-16 h-16 rounded-2xl border border-gold-300 bg-leaf-950 overflow-hidden shadow-xs shrink-0">
                <img
                  src={student?.avatar || 'https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af&size=200'}
                  alt={student?.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-white truncate">{student?.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-leaf-100 font-semibold">{student?.className}</span>
                  <span className="text-leaf-400">•</span>
                  <span className="text-xs text-leaf-100 font-semibold">Sec {student?.section}</span>
                  <span className="text-leaf-400">•</span>
                  <span className="text-xs text-gold-200 font-bold">Roll #{student?.rollNo}</span>
                </div>
                <div className="mt-1 font-mono text-[10px] bg-leaf-950/60 border border-leaf-600/60 px-2 py-0.5 rounded-md inline-block text-gold-200">
                  ID: {student?.uniqueId}
                </div>
              </div>
            </div>

            {/* Wallet Balance on ID */}
            <div className="pt-2.5 border-t border-leaf-600/60 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-gold-200">
                <Wallet className="w-3.5 h-3.5" />
                <span className="font-medium">Canteen Balance:</span>
                <span className="font-bold text-white">₹{walletBalance}</span>
              </div>
              <span className="text-[10px] text-leaf-200">Phone-Free Verified</span>
            </div>
          </div>

          {/* Info Notice */}
          <div className="bg-leaf-50 dark:bg-leaf-900/40 p-3 rounded-2xl border border-leaf-200 dark:border-leaf-800 text-xs text-leaf-800 dark:text-leaf-200 flex items-start gap-2">
            <Info className="w-4 h-4 text-leaf-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              In school, you do <strong>not</strong> need a phone. At the canteen counter, state your <strong>{student?.className} - Section {student?.section} - Roll #{student?.rollNo}</strong> to collect pre-orders or purchase on-spot!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-leaf-900/60 border-t border-leaf-100 dark:border-leaf-800 flex justify-end">
          <button
            onClick={() => setIsStudentIdModalOpen(false)}
            className="w-full bg-leaf-700 hover:bg-leaf-600 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
