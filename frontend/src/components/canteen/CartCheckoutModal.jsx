import React, { useState } from 'react';
import { useCanteen } from '../../context/useCanteen';
import { FoodTypeSymbol } from './MenuCard';
import {
  ArrowLeft,
  X,
  Plus,
  Minus,
  Trash2,
  MapPin,
  Edit3,
  Check,
  Tag,
  Wallet,
  AlertCircle,
  Calendar,
  Clock,
  Sparkles,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export const CartCheckoutModal = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartTotal,
    cartMrpTotal,
    cartDiscountTotal,
    cartItemCount,
    updateQuantity,
    removeFromCart,
    clearCart,
    walletBalance,
    preOrderDateLabel,
    breakSlot,
    student,
    placePreOrder,
    setIsRechargeOpen,
    addresses = [],
    selectedAddressId,
    setSelectedAddressId,
    addAddress,
    updateAddress,
    deleteAddress,
    showToast
  } = useCanteen();

  // Address modal states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressMode, setAddressMode] = useState('add'); // 'add' | 'edit'
  const [currentEditId, setCurrentEditId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    studentName: '',
    schoolName: '',
    className: '',
    section: '',
    rollNo: ''
  });

  const [couponApplied, setCouponApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  // Fallback address if none configured
  const fallbackAddress = {
    id: 'addr_temp_default',
    studentName: student?.name || 'Student',
    schoolName: student?.schoolName || 'Campus School',
    className: (student?.className || '10').replace('Class ', '').trim(),
    section: (student?.section || 'A').toUpperCase().trim(),
    rollNo: (student?.rollNo || '1').toString().trim()
  };

  const displayAddresses = addresses.length > 0 ? addresses : [fallbackAddress];
  const activeSelectedId = selectedAddressId || displayAddresses[0].id;

  // Price calculations
  const displayMrpTotal = cartMrpTotal > 0 ? cartMrpTotal : cartTotal;
  const couponDiscount = couponApplied ? Math.min(20, Math.floor(cartTotal * 0.1)) : 0;
  const displayDiscount = cartDiscountTotal + couponDiscount;
  const finalPayAmount = Math.max(0, cartTotal - couponDiscount);
  const isOverCartLimit = cartTotal >= 5000 || finalPayAmount >= 5000;

  // Address actions
  const handleOpenAddAddress = () => {
    setAddressMode('add');
    setCurrentEditId(null);
    setAddressForm({
      studentName: student?.name || '',
      schoolName: student?.schoolName || 'Campus School',
      className: (student?.className || '10').replace('Class ', '').trim(),
      section: (student?.section || 'A').toUpperCase().trim(),
      rollNo: (student?.rollNo || '1').toString().trim()
    });
    setIsAddressModalOpen(true);
  };

  const handleOpenEditAddress = (addr, e) => {
    if (e) e.stopPropagation();
    setAddressMode('edit');
    setCurrentEditId(addr.id);
    setAddressForm({
      studentName: addr.studentName || '',
      schoolName: addr.schoolName || '',
      className: addr.className || '',
      section: addr.section || '',
      rollNo: addr.rollNo || ''
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!addressForm.studentName.trim()) {
      alert('Please enter student name');
      return;
    }
    if (addressMode === 'edit' && currentEditId) {
      updateAddress(currentEditId, addressForm);
    } else {
      addAddress(addressForm);
    }
    setIsAddressModalOpen(false);
  };

  const handleConfirmOrder = async () => {
    if (isOverCartLimit) {
      showToast('Cart Limit Exceeded ⚠️', 'Cart value exceeds limit. You can only place orders less than ₹5000.', 'error');
      return;
    }

    if (walletBalance < finalPayAmount) {
      const needed = (finalPayAmount - walletBalance).toFixed(1);
      if (
        window.confirm(
          `Insufficient Wallet Balance!\nYou need ₹${needed} more to complete this order.\n\nWould you like to recharge your wallet now?`
        )
      ) {
        setIsRechargeOpen(true);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedAddr =
        displayAddresses.find((a) => a.id === activeSelectedId) || displayAddresses[0];
      const success = await placePreOrder(selectedAddr);
      if (success) {
        clearCart();
        setIsCartOpen(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#f6f9f7] dark:bg-[#0c140e] w-full max-w-lg h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:border border-leaf-200 dark:border-leaf-800">
        
        {/* Top Header Bar with Safe-Area Status Bar clearance & App NutriCanteen Green Theme */}
        <div className="bg-leaf-800 dark:bg-leaf-950 text-white px-4 pt-[max(0.85rem,calc(env(safe-area-inset-top,0px)+0.6rem))] pb-3 flex items-center justify-between border-b border-leaf-700/70 dark:border-leaf-900 shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all cursor-pointer text-white"
              aria-label="Back"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div>
              <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                Order Review
              </h2>
              <p className="text-[11px] text-leaf-200 font-medium flex items-center gap-1">
                <span>{preOrderDateLabel}</span>
                <span>•</span>
                <span className="capitalize">{breakSlot === 'recess' ? 'Morning Recess' : 'Lunch Break'}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center transition-all text-leaf-200 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body with Extra Bottom Room */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 pb-12">
          {cart.length === 0 ? (
            <div className="text-center py-20 text-gray-400 dark:text-leaf-300/60">
              <div className="w-16 h-16 rounded-2xl bg-leaf-100 dark:bg-leaf-900/40 text-leaf-700 dark:text-gold-300 mx-auto flex items-center justify-center mb-3">
                <Wallet className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-gray-700 dark:text-white">Your pre-order basket is empty.</p>
              <p className="text-xs mt-1 text-gray-500 dark:text-leaf-300/60">Add fresh meals from the menu to review your order.</p>
            </div>
          ) : (
            <>
              {/* Item Cards matching App theme */}
              <div className="space-y-2.5">
                {cart.map((item) => {
                  const unitPrice = Number(item.price) || 0;
                  const unitMrp = Number(item.mrp) || Number(item.originalPrice) || 0;
                  const hasDiscount = unitMrp > unitPrice;
                  const rawName = (item.name || '').trim();
                  const displayName = rawName ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : '';

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-leaf-950/70 rounded-2xl p-3 flex items-center gap-3.5 border border-leaf-100 dark:border-leaf-800/60 shadow-xs"
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-leaf-50 dark:bg-leaf-900/40 shrink-0 border border-leaf-100 dark:border-leaf-800/60 flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-xl">🍱</div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <FoodTypeSymbol type={item.food_type || (item.isVeg === false ? 'non-veg' : 'veg')} size="sm" />
                          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">
                            {displayName}
                          </h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-leaf-800 dark:text-gold-300">
                            ₹ {unitPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through font-medium">
                              ₹ {unitMrp}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[11px] text-gray-500 dark:text-leaf-300/70 font-semibold">
                            Qty: {item.quantity}
                          </span>

                          {/* Stepper Buttons matching MenuCard */}
                          <div className="flex items-center bg-leaf-50 dark:bg-leaf-900/80 border border-leaf-200 dark:border-leaf-700 rounded-xl p-0.5 text-xs font-bold shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-6 h-6 rounded-lg bg-white dark:bg-leaf-800 text-leaf-800 dark:text-white flex items-center justify-center hover:bg-leaf-100 active:scale-90 transition-all shadow-xs cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center font-extrabold text-leaf-900 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-6 h-6 rounded-lg bg-leaf-600 text-white flex items-center justify-center hover:bg-leaf-700 active:scale-90 transition-all shadow-xs cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon / Check Offers Row */}
              <div className="bg-white dark:bg-leaf-950/70 rounded-2xl p-3.5 flex items-center justify-between border border-leaf-100 dark:border-leaf-800/60 shadow-xs">
                <div className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200 font-semibold text-sm">
                  <div className="w-7 h-7 rounded-xl bg-gold-100 dark:bg-gold-950/70 text-gold-700 dark:text-gold-300 flex items-center justify-center">
                    <Tag className="w-3.5 h-3.5" />
                  </div>
                  <span>Check Offers</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (couponApplied) {
                      setCouponApplied(false);
                      showToast?.('Coupon Removed', 'Standard price applied.');
                    } else {
                      setCouponApplied(true);
                      showToast?.('Coupon Applied! 🎉', 'Campus meal discount activated.');
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs cursor-pointer transition-all ${
                    couponApplied
                      ? 'bg-leaf-100 dark:bg-leaf-900/60 text-leaf-800 dark:text-leaf-200 border border-leaf-300 dark:border-leaf-700'
                      : 'bg-gold-50 hover:bg-gold-100 dark:bg-gold-950/60 dark:hover:bg-gold-900/70 text-gold-800 dark:text-gold-300 border border-gold-200 dark:border-gold-800/70'
                  }`}
                >
                  {couponApplied ? 'Applied ✓' : 'Apply Coupon'}
                </button>
              </div>

              {/* Select Address Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-leaf-600 dark:text-leaf-400" />
                    <span>Select Address</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="text-leaf-700 dark:text-leaf-300 hover:text-leaf-800 font-bold text-xs cursor-pointer transition-colors flex items-center gap-1 bg-leaf-50 dark:bg-leaf-900/40 px-2.5 py-1 rounded-xl border border-leaf-200 dark:border-leaf-800/60"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Horizontal Scrollable Address Cards */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 pt-0.5 scrollbar-thin">
                  {displayAddresses.map((addr) => {
                    const isSelected = addr.id === activeSelectedId;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`min-w-[210px] max-w-[240px] shrink-0 rounded-2xl p-3 relative cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-leaf-600 bg-leaf-50/80 dark:bg-leaf-900/50 shadow-xs'
                            : 'border border-leaf-100 dark:border-leaf-800/60 bg-white dark:bg-leaf-950/70 hover:border-leaf-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {addr.studentName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditAddress(addr, e)}
                            className="p-1 text-gray-400 hover:text-leaf-600 dark:hover:text-leaf-300 rounded transition-colors"
                            title="Edit Address"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5">
                          <p className="truncate font-semibold text-gray-800 dark:text-gray-200">
                            {addr.schoolName || 'Campus School'}
                          </p>
                          <p className="text-gray-500 dark:text-leaf-300/70 font-medium">
                            Class {addr.className} - {addr.section} · Roll {addr.rollNo}
                          </p>
                        </div>

                        {/* Selected Indicator Badge in Bottom Right corner */}
                        {isSelected && (
                          <div className="absolute bottom-2.5 right-2.5 w-4.5 h-4.5 rounded-lg bg-leaf-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Details Card */}
              <div className="bg-white dark:bg-leaf-950/70 rounded-2xl p-4 border border-leaf-100 dark:border-leaf-800/60 space-y-2.5 shadow-xs">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-tight">
                  Price Details
                </h3>

                <div className="space-y-2 text-xs pt-1 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>
                      MRP Price ({cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'})
                    </span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      ₹ {displayMrpTotal.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-leaf-700 dark:text-leaf-400 font-medium">
                    <span>Discount</span>
                    <span>- ₹ {displayDiscount.toFixed(1)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-leaf-700 dark:text-leaf-400">
                      FREE Campus Pickup
                    </span>
                  </div>

                  <div className="border-t border-gray-100 dark:border-leaf-800/60 pt-2.5 flex items-center justify-between text-sm font-extrabold text-gray-900 dark:text-white">
                    <span>To Pay</span>
                    <span className="text-base text-leaf-800 dark:text-gold-300">
                      ₹ {finalPayAmount.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Type Section */}
              <div className="space-y-2 pt-0.5">
                <h3 className="font-bold text-gray-900 dark:text-white text-xs tracking-tight px-0.5">
                  Payment Method
                </h3>

                <div className="bg-white dark:bg-leaf-950/70 rounded-2xl p-3.5 border border-leaf-100 dark:border-leaf-800/60 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-gold-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4 text-gold-600 dark:text-gold-400" />
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        Mapstreak Wallet
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-leaf-800 dark:text-gold-300">
                    ₹ {walletBalance.toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsRechargeOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-gold-100 hover:bg-gold-200 dark:bg-gold-950/60 dark:hover:bg-gold-900/60 text-gold-900 dark:text-gold-200 border border-gold-300 dark:border-gold-800/70 font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    <span>Recharge Wallet</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Fixed Checkout Footer with Safe-Area clearance for Android navigation bar */}
        {cart.length > 0 && (
          <div className="p-4 pt-3 pb-[max(1.25rem,calc(env(safe-area-inset-bottom,0px)+0.75rem))] bg-white dark:bg-[#101812] border-t border-leaf-100 dark:border-leaf-900/80 shrink-0 space-y-2.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
            {isOverCartLimit && (
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/80 p-2.5 rounded-2xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>Cart value exceeds limit. You can only place orders less than ₹5000.</span>
              </div>
            )}
            <button
              type="button"
              disabled={isSubmitting || isOverCartLimit}
              onClick={handleConfirmOrder}
              className={`w-full py-3.5 rounded-2xl shadow-lg transition-all text-sm font-extrabold flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                isOverCartLimit
                  ? 'bg-rose-600 text-white opacity-75'
                  : 'bg-leaf-700 hover:bg-leaf-800 active:scale-[0.99] text-white shadow-leaf-glow'
              }`}
            >
              {isSubmitting ? (
                'Placing Pre-Order…'
              ) : isOverCartLimit ? (
                'Limit Exceeded (Max ₹5,000)'
              ) : (
                <>
                  <Wallet className="w-4 h-4 text-gold-300" />
                  <span>Confirm Pre-Order • Pay ₹{finalPayAmount.toFixed(1)}</span>
                  <ArrowRight className="w-4 h-4 text-gold-300" />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Address Dialog Modal with NutriCanteen theme */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-leaf-950 w-full max-w-sm rounded-3xl shadow-2xl p-5 border border-leaf-100 dark:border-leaf-800 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-leaf-100 dark:border-leaf-800">
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-leaf-600 dark:text-leaf-400" />
                <span>{addressMode === 'edit' ? 'Edit Address' : 'Add New Address'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-leaf-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.studentName}
                  onChange={(e) => setAddressForm({ ...addressForm, studentName: e.target.value })}
                  placeholder="e.g. Amarjeet Singh"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  School / Campus Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.schoolName}
                  onChange={(e) => setAddressForm({ ...addressForm, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.className}
                    onChange={(e) => setAddressForm({ ...addressForm, className: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.section}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, section: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. A"
                    maxLength={3}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-900 text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.rollNo}
                    onChange={(e) => setAddressForm({ ...addressForm, rollNo: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-leaf-200 dark:border-leaf-700 bg-white dark:bg-leaf-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 gap-2">
                {addressMode === 'edit' && addresses.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this address?')) {
                        deleteAddress(currentEditId);
                        setIsAddressModalOpen(false);
                      }
                    }}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer font-bold"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-leaf-300 hover:bg-gray-100 dark:hover:bg-leaf-900 rounded-xl transition-colors cursor-pointer font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-leaf-700 hover:bg-leaf-800 text-white font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    {addressMode === 'edit' ? 'Save Changes' : 'Add Address'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
