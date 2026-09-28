import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCanteen } from '../context/useCanteen';
import { MenuCard } from '../components/canteen/MenuCard';
import { getServerUrl } from '../services/api';
import {
  Search,
  Wallet,
  GraduationCap
} from 'lucide-react';

const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200',
    title: 'Fresh & Nutritious Meals',
    subtitle: 'Hygienic and wholesome food prepared fresh daily!',
  },
  {
    id: 'default-2',
    imageUrl: 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=1200',
    title: 'Healthy Campus Bites',
    subtitle: 'Balanced nutrition for energy all school day!',
  },
  {
    id: 'default-3',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&q=80&w=1200',
    title: 'Hot & Oven-Fresh Snacks',
    subtitle: 'Pre-order now and skip the long recess queue!',
  },
];

export const CanteenHomeView = () => {
  const {
    student,
    walletBalance,
    setIsRechargeOpen,
    liveMenuItems,
    banner,
  } = useCanteen();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Debounce search query input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Touch swipe support
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  // Compute slide list from backend data or fall back to defaults
  const slides = useMemo(() => {
    if (banner?.banners && Array.isArray(banner.banners) && banner.banners.length > 0) {
      return banner.banners.map((b, idx) => ({
        id: b.id || `custom-${idx}`,
        imageUrl: b.imageUrl ? getServerUrl(b.imageUrl) : DEFAULT_BANNERS[idx % DEFAULT_BANNERS.length].imageUrl,
        title: b.title || 'Fresh & Nutritious Meals',
        subtitle: b.subtitle || 'Hygienic and wholesome food prepared fresh daily!',
      }));
    }
    if (banner?.imageUrl) {
      return [
        {
          id: 'custom-single',
          imageUrl: getServerUrl(banner.imageUrl),
          title: banner.title || 'Fresh & Nutritious Meals',
          subtitle: banner.subtitle || 'Hygienic and wholesome food prepared fresh daily!',
        },
      ];
    }
    return DEFAULT_BANNERS;
  }, [banner]);

  // Keep slide index within bounds if slide count changes
  useEffect(() => {
    if (currentSlide >= slides.length) {
      setCurrentSlide(0);
    }
  }, [slides.length, currentSlide]);

  // Auto-advance carousel every 3.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [slides.length]);

  const handleTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;

    if (distance > minSwipeDistance) {
      // Swiped Left -> Next Slide
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    } else if (distance < -minSwipeDistance) {
      // Swiped Right -> Prev Slide
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  // Filter menu items using live backend items exclusively
  const itemsToFilter = liveMenuItems || [];

  const filteredItems = useMemo(() => {
    return itemsToFilter.filter((item) => {
      // Search filter
      if (!debouncedSearchQuery.trim()) return true;
      const q = debouncedSearchQuery.toLowerCase();
      const matchesName = item.name && item.name.toLowerCase().includes(q);
      const matchesDesc = item.description && item.description.toLowerCase().includes(q);
      const matchesDiet = item.dietaryTag && item.dietaryTag.toLowerCase().includes(q);
      const matchesCategory = item.category && item.category.toLowerCase().includes(q);

      return matchesName || matchesDesc || matchesDiet || matchesCategory;
    });
  }, [itemsToFilter, debouncedSearchQuery]);

  return (
    <div className="pb-28 pt-2.5 px-3.5 sm:px-5 space-y-3">
      {/* Top Brand & Campus Bar with Wallet */}
      <div className="flex items-center justify-between gap-2 pt-1 pb-1 border-b border-leaf-100/80 dark:border-leaf-900/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-leaf-600 dark:bg-leaf-700 flex items-center justify-center text-white shadow-xs shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-leaf-900 dark:text-leaf-100">
                Map<span className="text-gold-700 dark:text-gold-400">streak</span>
              </span>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-leaf-300/70 font-medium truncate max-w-[180px] sm:max-w-[260px]">
              {student ? `${student.name} • ${student.className?.replace('Class ', '') || '10'}-${student.section || 'B'} #${student.rollNo || '24'}` : 'School Canteen'}
            </p>
          </div>
        </div>

        {/* Soft Golden Wallet Chip */}
        <button
          onClick={() => setIsRechargeOpen(true)}
          className="flex items-center gap-1.5 bg-gold-100 hover:bg-gold-200 dark:bg-gold-950/60 dark:hover:bg-gold-900/80 border border-gold-200 dark:border-gold-800 text-gold-900 dark:text-gold-200 font-bold px-2.5 py-1.5 rounded-xl text-[11px] transition-all shadow-xs active:scale-95 shrink-0"
          title="Recharge Canteen Wallet"
        >
          <Wallet className="w-3.5 h-3.5 text-gold-700 dark:text-gold-400" />
          <span>₹{walletBalance}</span>
          <span className="text-[10px] text-gold-700 dark:text-gold-300 font-black">+</span>
        </button>
      </div>

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

      {/* Multi-Image Banner Slider with Slide Dots (Between Search and Menu Items) */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-xs border border-leaf-200/80 dark:border-leaf-800/80 group select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides Track */}
        <div
          className="flex transition-transform duration-500 ease-out h-32 sm:h-36"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide, index) => (
            <div
              key={slide.id || index}
              className="w-full h-full flex-shrink-0 relative overflow-hidden bg-leaf-100 dark:bg-leaf-950"
            >
              <img
                src={slide.imageUrl}
                alt={slide.title}
                onError={(e) => {
                  e.currentTarget.src = DEFAULT_BANNERS[index % DEFAULT_BANNERS.length].imageUrl;
                }}
                className="w-full h-full object-cover"
              />
              {/* Gradient overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10"></div>

              {/* Banner Text (No 'special' or 'dailyspecial' badges) */}
              <div className="absolute inset-0 p-3.5 pb-6 flex flex-col justify-end text-white pointer-events-none">
                <h3 className="font-extrabold text-sm sm:text-base text-white leading-tight drop-shadow-sm">
                  {slide.title}
                </h3>
                <p className="text-[11px] text-gray-200 mt-0.5 leading-snug drop-shadow-sm line-clamp-1">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex justify-center items-center gap-1.5 z-20">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={() => setCurrentSlide(dotIdx)}
                aria-label={`Slide ${dotIdx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  dotIdx === currentSlide
                    ? 'w-5 bg-gold-400 shadow-xs'
                    : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Menu Items Section */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-leaf-800 dark:text-leaf-300">
            {searchQuery.trim() ? 'Search Results' : 'All Menu Items'}
          </h2>
          <span className="text-[11px] font-semibold text-gray-400 dark:text-leaf-400">
            {filteredItems.length} items
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="bg-white dark:bg-leaf-950/60 p-8 rounded-2xl border border-leaf-200 dark:border-leaf-800 text-center space-y-2">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-300">
              No menu items found.
            </p>
            <p className="text-[11px] text-gray-400 dark:text-leaf-400">
              Try searching with different keywords.
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
