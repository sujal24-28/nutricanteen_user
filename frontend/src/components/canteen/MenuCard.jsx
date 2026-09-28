import React from 'react';
import { useCanteen } from '../../context/useCanteen';
import { Plus, Minus } from 'lucide-react';
import { getServerUrl } from '../../services/api';

// FSSAI-style Food Type Symbol (Veg, Non-Veg, Egg)
export const FoodTypeSymbol = ({ type, size = 'sm' }) => {
  const t = (type || 'veg').toLowerCase();

  if (t === 'non-veg' || t === 'non_veg' || t === 'nonveg') {
    return (
      <span
        title="Non-Vegetarian"
        className={`inline-flex items-center justify-center border border-red-700 bg-red-50/80 dark:bg-red-950/40 rounded-xs flex-shrink-0 ${
          size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
        }`}
      >
        <span className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-700 inline-block" />
      </span>
    );
  }

  if (t === 'egg' || t === 'eggetarian') {
    return (
      <span
        title="Egg Only"
        className={`inline-flex items-center justify-center border border-amber-600 bg-amber-50/80 dark:bg-amber-950/40 rounded-xs flex-shrink-0 ${
          size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
      </span>
    );
  }

  // Pure Veg
  return (
    <span
      title="Pure Vegetarian"
      className={`inline-flex items-center justify-center border border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xs flex-shrink-0 ${
        size === 'md' ? 'w-4 h-4 p-0.5' : 'w-3.5 h-3.5 p-0.5'
      }`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
    </span>
  );
};

export const MenuCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCanteen();

  const cartItem = cart.find((x) => x.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const imageUrl = item.image_url ? getServerUrl(item.image_url) : item.image;

  const sellingPrice = Number(item.price || 0);
  const mrp = item.mrp ? Number(item.mrp) : (item.originalPrice ? Number(item.originalPrice) : null);
  const hasDiscount = mrp && mrp > sellingPrice;
  const discountPercentage = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

  // Ensure first letter of the name is always capitalized
  const rawName = (item.name || '').trim();
  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

  return (
    <div className="bg-white dark:bg-leaf-950/70 rounded-2xl p-3 border border-leaf-100 dark:border-leaf-800/60 shadow-xs hover:shadow-sm transition-all flex gap-3 relative overflow-hidden group">
      {/* Discount Percentage Badge in top-right corner */}
      {hasDiscount && discountPercentage > 0 && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-blue-600 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-md shadow-xs tracking-wide">
          {discountPercentage}% OFF
        </span>
      )}

      {/* Product Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-leaf-50 dark:bg-leaf-900/40 flex-shrink-0 relative">
        <img
          src={imageUrl || 'https://ui-avatars.com/api/?name=Food&background=f3f4f6&color=9ca3af&size=200'}
          alt={displayName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 text-xs font-bold text-gray-900 flex items-center justify-center p-2 text-center"
          loading="lazy"
        />
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
        <div>
          {/* Top Row: Food Type Symbol */}
          <div className="flex items-center gap-1.5 mb-1">
            <FoodTypeSymbol type={item.food_type || (item.isVeg === false ? 'non-veg' : 'veg')} />
            {item.dietaryTag && item.dietaryTag.toLowerCase() !== 'campus fresh' && (
              <span className="text-[10px] font-semibold text-leaf-700 dark:text-leaf-300 bg-leaf-50 dark:bg-leaf-900/50 px-2 py-0.5 rounded-full border border-leaf-200/50">
                {item.dietaryTag}
              </span>
            )}
          </div>

          {/* Title - Bigger font with first letter always capital */}
          <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white leading-snug line-clamp-1 pr-16 capitalize tracking-tight">
            {displayName}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-gray-500 dark:text-leaf-200/70 line-clamp-2 mt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Row: Price & Add button */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-leaf-800/40">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-gray-400 dark:text-gray-500 line-through font-medium leading-none mb-0.5">
                ₹{mrp}
              </span>
            )}
            <div className="flex items-baseline gap-1">
              <span className="text-base font-extrabold text-leaf-800 dark:text-gold-300">
                ₹{sellingPrice}
              </span>
            </div>
          </div>

          {quantity === 0 ? (
            <button
              onClick={() => addToCart(item)}
              className="bg-leaf-600 hover:bg-leaf-700 text-white dark:bg-leaf-700 dark:hover:bg-leaf-600 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs hover:shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Pre-Order</span>
            </button>
          ) : (
            <div className="flex items-center bg-leaf-50 dark:bg-leaf-900/80 border border-leaf-200 dark:border-leaf-700 rounded-xl p-0.5 text-xs font-bold shadow-xs">
              <button
                onClick={() => updateQuantity(item.id, -1)}
                className="w-6 h-6 rounded-lg bg-white dark:bg-leaf-800 text-leaf-800 dark:text-white flex items-center justify-center hover:bg-leaf-100 active:scale-90 transition-all shadow-xs cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-7 text-center font-extrabold text-leaf-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, 1)}
                className="w-6 h-6 rounded-lg bg-leaf-600 text-white flex items-center justify-center hover:bg-leaf-700 active:scale-90 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
