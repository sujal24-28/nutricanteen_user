import React from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { Plus, Minus, Flame, Sparkles } from 'lucide-react';

export const MenuCard = ({ item }) => {
  const { cart, addToCart, updateQuantity } = useCanteen();

  const cartItem = cart.find((x) => x.id === item.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  return (
    <div className="bg-white dark:bg-leaf-950/70 rounded-2xl p-3 border border-leaf-100 dark:border-leaf-800/60 shadow-xs hover:shadow-sm transition-all flex gap-3 relative overflow-hidden group">
      {/* Product Image */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-leaf-50 dark:bg-leaf-900/40 flex-shrink-0 relative">
        <img
          src={item.image || 'https://ui-avatars.com/api/?name=Food&background=f3f4f6&color=9ca3af&size=200'}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 text-xs font-bold text-gray-900 flex items-center justify-center p-2 text-center"
          loading="lazy"
        />
        {item.isChefSpecial && (
          <span className="absolute top-1.5 left-1.5 bg-gold-100 dark:bg-gold-950/80 text-gold-900 dark:text-gold-200 border border-gold-300/80 font-bold text-[9px] px-1.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
            <Sparkles className="w-2.5 h-2.5 text-gold-700" />
            Special
          </span>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          {/* Top Row: Veg indicator & Dietary Tag */}
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-3.5 h-3.5 border border-emerald-600/70 rounded-sm flex items-center justify-center p-0.5 bg-emerald-50/80">
              <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
            </span>
            <span className="text-[10px] font-semibold text-leaf-700 dark:text-leaf-300 bg-leaf-50 dark:bg-leaf-900/50 px-2 py-0.5 rounded-full border border-leaf-200/50">
              {item.dietaryTag}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-leaf-300/60 flex items-center gap-0.5 ml-auto font-medium">
              <Flame className="w-3 h-3 text-gold-600" />
              {item.calories}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug line-clamp-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-[11px] text-gray-500 dark:text-leaf-200/70 line-clamp-2 mt-0.5 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Bottom Row: Price & Add button */}
        <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100 dark:border-leaf-800/40">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-leaf-800 dark:text-gold-300">
              ₹{item.price}
            </span>
            <span className="text-[10px] text-gray-400 dark:text-leaf-300/50">/ portion</span>
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
