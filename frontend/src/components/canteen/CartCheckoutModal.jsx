import React, { useState } from 'react';
import { useCanteen } from '../../context/useCanteen';
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
  AlertCircle
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
  const displayDiscount = couponApplied
    ? cartDiscountTotal + Math.min(20, Math.floor(cartTotal * 0.1))
    : cartDiscountTotal;
  const finalPayAmount = Math.max(0, cartTotal - (couponApplied ? Math.min(20, Math.floor(cartTotal * 0.1)) : 0));

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
      await placePreOrder(selectedAddr);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header Bar matching user screenshot (Deep Blue Header with back arrow) */}
        <div className="bg-[#1976d2] text-white px-4 py-3.5 flex items-center gap-3 shrink-0 shadow-xs">
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors cursor-pointer"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-lg font-semibold tracking-tight text-white flex-1">
            Order Review
          </h2>
          <button
            type="button"
            onClick={() => setIsCartOpen(false)}
            className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1 bg-gray-50/50 dark:bg-gray-900/50">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-sm font-semibold">Your cart is empty.</p>
              <p className="text-xs mt-1">Add items from the menu to review your order.</p>
            </div>
          ) : (
            <>
              {/* Item Cards matching Screenshot */}
              <div className="space-y-2.5">
                {cart.map((item) => {
                  const unitPrice = Number(item.price) || 0;
                  const unitMrp = Number(item.mrp) || Number(item.originalPrice) || 0;
                  const hasDiscount = unitMrp > unitPrice;

                  return (
                    <div
                      key={item.id}
                      className="bg-[#f8f9fe] dark:bg-gray-800/80 rounded-2xl p-3 flex items-center gap-3.5 border border-gray-100 dark:border-gray-700/80 shadow-xs"
                    >
                      {/* Item Image */}
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 shrink-0 border border-gray-200/60 dark:border-gray-600">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-orange-50 text-orange-400 font-bold">
                            🍱
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            ₹ {unitPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 line-through">
                              ₹ {unitMrp}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            Qty : {item.quantity}
                          </span>
                          <div className="flex items-center gap-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold px-1 text-gray-800 dark:text-white">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-5 h-5 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-600 rounded text-gray-700 dark:text-gray-200 cursor-pointer"
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
              <div className="bg-[#f8f9fe] dark:bg-gray-800/80 rounded-2xl p-3.5 flex items-center justify-between border border-gray-100 dark:border-gray-700/80 shadow-xs">
                <div className="flex items-center gap-2.5 text-gray-800 dark:text-gray-200 font-medium text-sm">
                  <Tag className="w-4 h-4 text-gray-700 dark:text-gray-300" />
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
                  className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold text-sm cursor-pointer transition-colors"
                >
                  {couponApplied ? 'Applied ✓' : 'Apply Coupon'}
                </button>
              </div>

              {/* Select Address Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-0.5">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">
                    Select Address
                  </h3>
                  <button
                    type="button"
                    onClick={handleOpenAddAddress}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 font-semibold text-sm cursor-pointer transition-colors flex items-center gap-1"
                  >
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
                            ? 'border-2 border-blue-500 bg-[#f4f8ff] dark:bg-blue-950/30 shadow-xs'
                            : 'border border-gray-200/90 dark:border-gray-700 bg-white dark:bg-gray-800/90 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span className="font-bold text-xs text-gray-900 dark:text-white truncate">
                              {addr.studentName}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => handleOpenEditAddress(addr, e)}
                            className="p-1 text-gray-400 hover:text-purple-600 rounded transition-colors"
                            title="Edit Address"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5 pl-5">
                          <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                            {addr.schoolName || 'Campus School'}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            Class {addr.className} - {addr.section} · Roll {addr.rollNo}
                          </p>
                        </div>

                        {/* Selected Indicator Badge in Bottom Right corner */}
                        {isSelected && (
                          <div className="absolute bottom-2.5 right-2.5 w-4 h-4 rounded bg-blue-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Price Details Card */}
              <div className="bg-[#f8f9fe] dark:bg-gray-800/80 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/80 space-y-2.5 shadow-xs">
                <h3 className="font-bold text-gray-900 dark:text-white text-base">
                  Price Details
                </h3>

                <div className="space-y-2 text-xs pt-1 text-gray-700 dark:text-gray-300">
                  <div className="flex items-center justify-between">
                    <span>
                      MRP Price ({cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'})
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹ {displayMrpTotal.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Discount</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      - ₹ {displayDiscount.toFixed(1)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Delivery Charge</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ₹ 0
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-2.5 flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white">
                    <span>To Pay</span>
                    <span className="text-base text-gray-900 dark:text-white">
                      ₹ {finalPayAmount.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Type Section */}
              <div className="space-y-2.5 pt-1">
                <h3 className="font-bold text-gray-800 dark:text-white text-sm px-0.5">
                  Payment Type
                </h3>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 border border-gray-200/80 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-600 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      Mapstreak Wallet
                    </span>
                  </div>
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                    ₹ {walletBalance.toFixed(1)}
                  </span>
                </div>

                <div className="flex justify-center pt-0.5">
                  <button
                    type="button"
                    onClick={() => setIsRechargeOpen(true)}
                    className="px-6 py-2 rounded-full bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                  >
                    Recharge Wallet
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Bottom Confirm Order Button matching screenshot */}
        {cart.length > 0 && (
          <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmOrder}
              className="w-full bg-[#1976d2] hover:bg-[#1565c0] active:scale-[0.99] text-white font-bold py-3.5 rounded-full shadow-md transition-all text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? 'Placing Order…' : 'Confirm Order'}
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Address Dialog Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-2xl shadow-2xl p-5 border border-gray-100 dark:border-gray-700 animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>{addressMode === 'edit' ? 'Edit Address' : 'Add New Address'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Student Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.studentName}
                  onChange={(e) => setAddressForm({ ...addressForm, studentName: e.target.value })}
                  placeholder="e.g. Amarjeet Singh"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  School / Campus Name *
                </label>
                <input
                  type="text"
                  required
                  value={addressForm.schoolName}
                  onChange={(e) => setAddressForm({ ...addressForm, schoolName: e.target.value })}
                  placeholder="e.g. Delhi Public School"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Class *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.className}
                    onChange={(e) => setAddressForm({ ...addressForm, className: e.target.value })}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
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
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Roll No *
                  </label>
                  <input
                    type="text"
                    required
                    value={addressForm.rollNo}
                    onChange={(e) => setAddressForm({ ...addressForm, rollNo: e.target.value })}
                    placeholder="e.g. 12"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                )}
                <div className="flex gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="px-3 py-1.5 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-xs cursor-pointer"
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
