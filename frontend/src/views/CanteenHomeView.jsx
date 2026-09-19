import React, { useState, useMemo } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { CANTEEN_CATEGORIES, CANTEEN_MENU_ITEMS } from '../data/canteenMenu';
import { MenuCard } from '../components/canteen/MenuCard';
import {
  Search,
  Clock,
  Sun,
  Soup,
  Cookie,
  Cake,
  Coffee,
  Calendar,
  Wallet,
  ChevronDown,
  GraduationCap
} from 'lucide-react';

const ICON_MAP = {
  Sparkles: Search,
  Sun: Sun,
  Soup: Soup,
  Cookie: Cookie,
  Cake: Cake,
  Coffee: Coffee
};

export const CanteenHomeView = () => {
  const {
    student,
    preOrderDateLabel,
    breakSlot,
    setIsPreOrderModalOpen,
    walletBalance,
    setIsRechargeOpen,
    liveMenuItems,
  } = useCanteen();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBreak, setFilterBreak] = useState('all'); // 'all', 'recess', 'lunch'

  // Filter menu items using live backend items exclusively
  const itemsToFilter = liveMenuItems || [];

  const filteredItems = useMemo(() => {
    return itemsToFilter.filter((item) => {
      // Category filter
      const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
      // Break filter
      const matchesBreak =
        filterBreak === 'all' || item.availableSlots.includes(filterBreak);
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.dietaryTag && item.dietaryTag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesBreak && matchesSearch;
    });
  }, [itemsToFilter, activeCategory, filterBreak, searchQuery]);

  return (
    <div className="pb-28 pt-2.5 px-3.5 sm:px-5 space-y-3">
      {/* Top Brand & Campus Bar */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-1 border-b border-leaf-100/80 dark:border-leaf-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-leaf-600 dark:bg-leaf-700 flex items-center justify-center text-white shadow-xs">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-leaf-900 dark:text-leaf-100">
                Nutri<span className="text-gold-700 dark:text-gold-400">Canteen</span>
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-leaf-300/70 font-medium truncate max-w-[200px]">
              {student ? `${student.name} • ${student.className?.replace('Class ', '') || '10'}-${student.section || 'B'} #${student.rollNo || '24'}` : 'School Canteen'}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Compact Light Utility Bar (Pre-order slot & Wallet balance) */}
      <div className="flex items-center justify-between gap-2">
        {/* Pre-Order Date & Break Slot Pill */}
        <button
          onClick={() => setIsPreOrderModalOpen(true)}
          className="flex items-center gap-1.5 bg-leaf-50 dark:bg-leaf-950/80 hover:bg-leaf-100 border border-leaf-200 dark:border-leaf-800/80 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-leaf-800 dark:text-leaf-200 transition-colors shadow-xs group"
          title="Change Pre-Order Date & Break Slot"
        >
          <Calendar className="w-3.5 h-3.5 text-leaf-600 dark:text-leaf-400" />
          <span>{preOrderDateLabel.split('(')[0].trim() || 'Tomorrow'}</span>
          <span className="text-leaf-400 dark:text-leaf-600">•</span>
          <span className="text-leaf-700 dark:text-leaf-300 font-bold capitalize">
            {breakSlot === 'recess' ? 'Recess' : 'Lunch'}
          </span>
          <ChevronDown className="w-3 h-3 text-leaf-500 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Soft Golden Wallet Chip */}
        <button
          onClick={() => setIsRechargeOpen(true)}
          className="flex items-center gap-1.5 bg-gold-100 hover:bg-gold-200 dark:bg-gold-950/60 dark:hover:bg-gold-900/80 border border-gold-200 dark:border-gold-800 text-gold-900 dark:text-gold-200 font-bold px-2.5 py-1.5 rounded-xl text-[11px] transition-all shadow-xs active:scale-95"
          title="Recharge Canteen Wallet"
        >
          <Wallet className="w-3.5 h-3.5 text-gold-700 dark:text-gold-400" />
          <span>₹{walletBalance}</span>
          <span className="text-[10px] text-gold-700 dark:text-gold-300 font-black">+</span>
        </button>
      </div>

      {/* 2. Search & Break Slot Pills */}
      <div className="space-y-2">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-leaf-600 dark:text-leaf-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search meals, wraps, juices, snacks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-leaf-950/50 border border-leaf-200/80 dark:border-leaf-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-900 dark:text-white placeholder-gray-800 dark:placeholder-leaf-300/80 shadow-xs focus:outline-none focus:border-leaf-400 focus:ring-1 focus:ring-leaf-400 transition"
          />
        </div>

        {/* Break Slot Quick Filter Tabs */}
        <div className="flex items-center gap-1 bg-leaf-50 dark:bg-leaf-950/60 p-1 rounded-2xl border border-leaf-200/70 dark:border-leaf-800 text-xs font-semibold">
          <button
            onClick={() => setFilterBreak('all')}
            className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
              filterBreak === 'all'
                ? 'bg-white dark:bg-leaf-800 text-leaf-900 dark:text-white font-bold shadow-xs'
                : 'text-gray-500 dark:text-leaf-300/70 hover:text-gray-800'
            }`}
          >
            All Menu
          </button>
          <button
            onClick={() => setFilterBreak('recess')}
            className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
              filterBreak === 'recess'
                ? 'bg-white dark:bg-leaf-800 text-leaf-900 dark:text-white font-bold shadow-xs'
                : 'text-gray-500 dark:text-leaf-300/70 hover:text-gray-800'
            }`}
          >
            Morning Recess
          </button>
          <button
            onClick={() => setFilterBreak('lunch')}
            className={`flex-1 py-1.5 rounded-xl text-center transition-all ${
              filterBreak === 'lunch'
                ? 'bg-white dark:bg-leaf-800 text-leaf-900 dark:text-white font-bold shadow-xs'
                : 'text-gray-500 dark:text-leaf-300/70 hover:text-gray-800'
            }`}
          >
            Lunch Break
          </button>
        </div>
      </div>

      {/* 3. Horizontal Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {CANTEEN_CATEGORIES.map((cat) => {
          const IconComponent = ICON_MAP[cat.icon] || Sparkles;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-leaf-600 dark:bg-leaf-700 text-white shadow-xs'
                  : 'bg-white dark:bg-leaf-950/60 border border-leaf-200/80 dark:border-leaf-800 text-gray-700 dark:text-leaf-200/80 hover:bg-leaf-50'
              }`}
            >
              <IconComponent className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Menu Items Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-leaf-800 dark:text-leaf-300">
            {activeCategory === 'all'
              ? 'Available for Pre-Order'
              : CANTEEN_CATEGORIES.find((c) => c.id === activeCategory)?.name}
          </h2>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-leaf-400">
            {filteredItems.length} items
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-leaf-950/60 p-8 rounded-2xl border border-leaf-200 dark:border-leaf-800 text-center space-y-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              No menu items found for this selection.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-leaf-400">
              Try choosing a different break slot or clearing search terms.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
