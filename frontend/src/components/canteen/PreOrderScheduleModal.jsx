import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { X, Calendar, Clock, AlertCircle, Sun, Soup, Check } from 'lucide-react';

export const PreOrderScheduleModal = () => {
  const {
    isPreOrderModalOpen,
    setIsPreOrderModalOpen,
    preOrderDateKey,
    setPreOrderDateKey,
    preOrderDateLabel,
    setPreOrderDateLabel,
    breakSlot,
    setBreakSlot,
    getTomorrowFormatted,
    getDayAfterFormatted
  } = useCanteen();

  if (!isPreOrderModalOpen) return null;

  const tomorrowStr = getTomorrowFormatted();
  const dayAfterStr = getDayAfterFormatted();

  const handleSelectDate = (key, label) => {
    setPreOrderDateKey(key);
    setPreOrderDateLabel(label);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-leaf-950 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl border border-leaf-200 dark:border-leaf-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-leaf-800 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Modal Header */}
        <div className="p-3.5 bg-leaf-700 text-white flex items-center justify-between border-b border-leaf-600 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gold-200 text-gold-950 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Pre-Order Schedule</h3>
              <p className="text-[11px] text-leaf-100">Select when your meal should be ready</p>
            </div>
          </div>
          <button
            onClick={() => setIsPreOrderModalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Rule Note */}
          <div className="bg-gold-50/80 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800/60 p-3 rounded-2xl flex items-start gap-2.5 text-xs text-gold-900 dark:text-gold-200">
            <AlertCircle className="w-4 h-4 text-gold-700 dark:text-gold-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-gold-950 dark:text-gold-300 mb-0.5">
                School Canteen Pre-Order Rule:
              </span>
              Orders must be placed 1 day in advance. Kitchen packs and labels your hot box with your <span className="font-bold">Class, Section & Roll No</span> for rapid counter pickup.
            </div>
          </div>

          {/* 1. Select Date */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-leaf-200 mb-2 uppercase tracking-wider">
              1. Choose Advance Day
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tomorrow */}
              <button
                type="button"
                onClick={() => handleSelectDate('tomorrow', `Tomorrow (${tomorrowStr})`)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  preOrderDateKey === 'tomorrow'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] bg-leaf-100 dark:bg-leaf-800 text-leaf-800 dark:text-leaf-200 font-bold px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                  {preOrderDateKey === 'tomorrow' && <Check className="w-4 h-4 text-leaf-600 dark:text-leaf-400 stroke-[3]" />}
                </div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Tomorrow</h4>
                <p className="text-[11px] text-gray-500 dark:text-leaf-300 mt-0.5">{tomorrowStr}</p>
              </button>

              {/* Day After Tomorrow */}
              <button
                type="button"
                onClick={() => handleSelectDate('day_after', `Day After (${dayAfterStr})`)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  preOrderDateKey === 'day_after'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase">Advance</span>
                  {preOrderDateKey === 'day_after' && <Check className="w-4 h-4 text-leaf-600 dark:text-leaf-400 stroke-[3]" />}
                </div>
                <h4 className="font-bold text-xs text-gray-900 dark:text-white">Day After</h4>
                <p className="text-[11px] text-gray-500 dark:text-leaf-300 mt-0.5">{dayAfterStr}</p>
              </button>
            </div>
          </div>

          {/* 2. Select Break Slot */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-leaf-200 mb-2 uppercase tracking-wider">
              2. Choose School Break Slot
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Morning Recess */}
              <button
                type="button"
                onClick={() => setBreakSlot('recess')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                  breakSlot === 'recess'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${breakSlot === 'recess' ? 'bg-leaf-600 text-white' : 'bg-gray-100 dark:bg-leaf-900 text-gray-500'}`}>
                  <Sun className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">Morning Recess</h4>
                  <p className="text-[10px] text-gray-500 dark:text-leaf-300 mt-0.5">10:30 AM - 10:50 AM</p>
                  <span className="text-[9px] text-leaf-700 dark:text-leaf-300 font-semibold mt-1 inline-block">Quick Snacks</span>
                </div>
              </button>

              {/* Lunch Break */}
              <button
                type="button"
                onClick={() => setBreakSlot('lunch')}
                className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2 cursor-pointer ${
                  breakSlot === 'lunch'
                    ? 'border-leaf-500 bg-leaf-50/80 dark:bg-leaf-900/60 shadow-xs'
                    : 'border-leaf-100 dark:border-leaf-800/80 hover:border-leaf-200 bg-white dark:bg-leaf-950'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${breakSlot === 'lunch' ? 'bg-leaf-600 text-white' : 'bg-gray-100 dark:bg-leaf-900 text-gray-500'}`}>
                  <Soup className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white">Lunch Break</h4>
                  <p className="text-[10px] text-gray-500 dark:text-leaf-300 mt-0.5">01:15 PM - 01:50 PM</p>
                  <span className="text-[9px] text-leaf-700 dark:text-leaf-300 font-semibold mt-1 inline-block">Warm Meals</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 bg-gray-50 dark:bg-leaf-900/60 border-t border-leaf-100 dark:border-leaf-800 flex items-center justify-end">
          <button
            onClick={() => setIsPreOrderModalOpen(false)}
            className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-2.5 rounded-xl shadow-xs text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Confirm Schedule & View Menu
          </button>
        </div>
      </div>
    </div>
  );
};
