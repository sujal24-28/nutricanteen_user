import React, { useState } from 'react';
import { useCanteen } from '../../context/CanteenContext';
import { CLASSES_LIST, SECTIONS_LIST, SAMPLE_STUDENTS_REGISTRY } from '../../data/schools';
import { X, Search, Store, Wallet, CheckCircle2, AlertCircle, ShoppingBag, ArrowRight, UserCheck, Utensils, Receipt } from 'lucide-react';
import confetti from 'canvas-confetti';

const COUNTER_SNACKS = [
  { id: 'cs1', name: 'Veg Cheese Puff', price: 40 },
  { id: 'cs2', name: 'Cold Cocoa (250ml)', price: 45 },
  { id: 'cs3', name: 'Air-Baked Samosa', price: 30 },
  { id: 'cs4', name: 'Whole Wheat Muffin', price: 40 },
  { id: 'cs5', name: 'Grilled Sandwich', price: 55 },
  { id: 'cs6', name: 'Mango Lassi', price: 45 },
];

export const CanteenStaffTerminalModal = () => {
  const {
    isStaffTerminalOpen,
    setIsStaffTerminalOpen,
    student,
    walletBalance,
    orders,
    staffDeductStudentWallet,
    staffMarkOrderCollected
  } = useCanteen();

  // Search criteria
  const [selectedClass, setSelectedClass] = useState(student?.className || 'Class 10');
  const [selectedSection, setSelectedSection] = useState(student?.section || 'B');
  const [searchRoll, setSearchRoll] = useState(student?.rollNo || '24');

  // Deduction cart on spot
  const [customAmount, setCustomAmount] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [deductionReceipt, setDeductionReceipt] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isStaffTerminalOpen) return null;

  // Determine current active student in terminal
  const isLookingAtCurrentLoggedIn =
    searchRoll.toString().trim() === student?.rollNo?.toString().trim() &&
    selectedClass.toLowerCase().includes(student?.className?.toLowerCase()) &&
    selectedSection.toUpperCase() === student?.section?.toUpperCase();

  const foundRegistryStudent = isLookingAtCurrentLoggedIn
    ? { ...student, walletBalance }
    : SAMPLE_STUDENTS_REGISTRY.find(
        (s) =>
          s.rollNo.toString().trim() === searchRoll.toString().trim() &&
          s.className.toLowerCase().includes(selectedClass.toLowerCase()) &&
          s.section.toUpperCase() === selectedSection.toUpperCase()
      );

  // Toggle item in counter selection
  const handleToggleItem = (item) => {
    setSelectedItems((prev) => {
      const exists = prev.find((x) => x.id === item.id);
      if (exists) {
        return prev.filter((x) => x.id !== item.id);
      }
      return [...prev, item];
    });
    setErrorMessage('');
  };

  const selectedItemsTotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const finalDeductionAmount = customAmount ? Number(customAmount) : selectedItemsTotal;

  const handleDeduct = () => {
    if (finalDeductionAmount <= 0) {
      setErrorMessage('Please select snacks or enter a valid deduction amount.');
      return;
    }

    const itemDescription =
      selectedItems.length > 0
        ? selectedItems.map((x) => x.name).join(', ')
        : 'On-Spot Counter Purchase';

    const result = staffDeductStudentWallet(
      searchRoll,
      selectedClass,
      selectedSection,
      finalDeductionAmount,
      itemDescription
    );

    if (result.success) {
      setDeductionReceipt({
        studentName: result.studentName,
        className: selectedClass,
        section: selectedSection,
        rollNo: searchRoll,
        amount: finalDeductionAmount,
        items: itemDescription,
        remaining: result.remaining,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

      setSelectedItems([]);
      setCustomAmount('');

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.5 },
        colors: ['#4e8d5a', '#cca95f']
      });
    } else {
      setErrorMessage(result.message);
    }
  };

  // Find pre-orders for this student
  const studentPreOrders = orders.filter((o) => o.status === 'Scheduled');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-leaf-950 w-full max-w-2xl rounded-t-[28px] sm:rounded-3xl border border-leaf-200 dark:border-leaf-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] sm:max-h-[90vh]">
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1 bg-gray-300 dark:bg-leaf-800 rounded-full mx-auto my-2 sm:hidden shrink-0" />

        {/* Header (Soft Leaf Green) */}
        <div className="p-3.5 bg-leaf-700 text-white flex items-center justify-between border-b border-leaf-600 shrink-0">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gold-200 text-gold-950 flex items-center justify-center font-bold shadow-xs shrink-0">
              <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">Canteen Staff Counter Terminal</h3>
                <span className="bg-leaf-100 text-leaf-800 border border-leaf-200 text-[9px] font-bold px-2 py-0.5 rounded-full hidden xs:inline">
                  POS ACTIVE
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-leaf-100">Look up student by unique ID & deduct money directly from wallet</p>
            </div>
          </div>
          <button
            onClick={() => setIsStaffTerminalOpen(false)}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* 1. Student Lookup Bar */}
          <div className="bg-leaf-50/70 dark:bg-leaf-900/40 p-3.5 rounded-2xl border border-leaf-200/80 dark:border-leaf-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-leaf-800 dark:text-leaf-300 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5" />
                Find Student by Unique ID (Class, Sec, Roll)
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClass(student?.className || 'Class 10');
                  setSelectedSection(student?.section || 'B');
                  setSearchRoll(student?.rollNo || '24');
                }}
                className="text-[11px] text-leaf-700 dark:text-gold-300 hover:underline font-semibold cursor-pointer"
              >
                Reset to Current Student (10-B #24)
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Class */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-leaf-300 mb-0.5">CLASS</label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full bg-white dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-700 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white"
                >
                  {CLASSES_LIST.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-leaf-300 mb-0.5">SECTION</label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full bg-white dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-700 rounded-xl px-2 py-1.5 text-xs font-bold text-gray-900 dark:text-white"
                >
                  {SECTIONS_LIST.map((s) => (
                    <option key={s} value={s}>Section {s}</option>
                  ))}
                </select>
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 dark:text-leaf-300 mb-0.5">ROLL NUMBER</label>
                <input
                  type="text"
                  value={searchRoll}
                  onChange={(e) => setSearchRoll(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full bg-white dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-700 rounded-xl px-2.5 py-1.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-leaf-400"
                />
              </div>
            </div>
          </div>

          {/* 2. Found Student Verification Badge */}
          {foundRegistryStudent ? (
            <div className="bg-leaf-700 text-white p-3.5 rounded-2xl border border-leaf-600 shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={foundRegistryStudent.avatar || 'https://ui-avatars.com/api/?name=User&background=f3f4f6&color=9ca3af&size=200'}
                  alt={foundRegistryStudent.name}
                  className="w-11 h-11 rounded-xl object-cover border border-gold-300 bg-leaf-950 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-white truncate">{foundRegistryStudent.name}</h4>
                    <span className="bg-gold-200 text-gold-950 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                      {foundRegistryStudent.className}-{foundRegistryStudent.section}
                    </span>
                  </div>
                  <p className="text-[11px] text-leaf-100 truncate max-w-[260px]">
                    {foundRegistryStudent.schoolName}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-2 border-l border-leaf-600">
                <span className="text-[10px] font-medium text-leaf-200 uppercase block tracking-wider">Available Wallet</span>
                <span className="text-lg font-bold text-gold-200">₹{foundRegistryStudent.walletBalance}</span>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-leaf-200 dark:border-leaf-800 rounded-2xl text-xs text-gray-400 dark:text-leaf-300">
              No student found for {selectedClass} - Section {selectedSection} - Roll #{searchRoll}. Try Roll #24.
            </div>
          )}

          {/* 3. Today's Pre-Ordered Meals (If any) */}
          {foundRegistryStudent && studentPreOrders.length > 0 && isLookingAtCurrentLoggedIn && (
            <div className="bg-gold-50/80 dark:bg-gold-950/40 border border-gold-200 dark:border-gold-800 p-3.5 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold-950 dark:text-gold-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Pre-Ordered Meal Ready for Pickup (Paid via Wallet)
                </span>
                <span className="bg-gold-100 text-gold-900 border border-gold-300 text-[10px] font-bold px-2 py-0.2 rounded-md">
                  Pre-Paid
                </span>
              </div>

              {studentPreOrders.map((order) => (
                <div key={order.id} className="bg-white dark:bg-leaf-950 p-2.5 rounded-xl border border-gold-200 dark:border-gold-900 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-gold-900 dark:text-gold-300">{order.tokenNumber}</span>
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      {order.items.map((x) => `${x.name} (x${x.quantity})`).join(', ')}
                    </p>
                    <span className="text-[10px] text-gray-500 dark:text-leaf-300 font-medium">{order.breakSlot}</span>
                  </div>
                  <button
                    onClick={() => staffMarkOrderCollected(order.id)}
                    className="bg-leaf-600 hover:bg-leaf-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Hand Over Meal</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. On-Spot Counter Purchase Section (Deduct from Wallet) */}
          {foundRegistryStudent && (
            <div className="bg-white dark:bg-leaf-900/30 p-3.5 rounded-2xl border border-leaf-100 dark:border-leaf-800 space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-leaf-800 pb-2">
                <div>
                  <h4 className="font-bold text-xs text-gray-900 dark:text-white uppercase tracking-wider">
                    On-Spot Counter Purchase
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-leaf-300/70">
                    If student didn't pre-order, select items below to deduct from wallet
                  </p>
                </div>
                <Utensils className="w-4 h-4 text-leaf-600" />
              </div>

              {/* Quick Snacks Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {COUNTER_SNACKS.map((snack) => {
                  const isSelected = selectedItems.some((x) => x.id === snack.id);
                  return (
                    <button
                      key={snack.id}
                      type="button"
                      onClick={() => handleToggleItem(snack)}
                      className={`p-2 rounded-xl border text-left transition-all flex items-center justify-between text-xs cursor-pointer ${
                        isSelected
                          ? 'border-leaf-500 bg-leaf-50 dark:bg-leaf-900/60 text-leaf-900 dark:text-leaf-200 font-bold'
                          : 'border-leaf-100 dark:border-leaf-800 hover:border-leaf-200 text-gray-800 dark:text-white bg-leaf-50/40 dark:bg-leaf-950'
                      }`}
                    >
                      <span className="truncate text-[11px]">{snack.name}</span>
                      <span className="font-bold text-leaf-800 dark:text-gold-300 ml-1">₹{snack.price}</span>
                    </button>
                  );
                })}
              </div>

              {/* Or Custom Amount */}
              <div className="flex items-center gap-2.5 pt-1">
                <span className="text-[11px] text-gray-400 dark:text-leaf-300 font-semibold uppercase">Or Custom Amount:</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1.5 text-xs font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    min={1}
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter manual amount"
                    className="w-full bg-leaf-50/40 dark:bg-leaf-950 border border-leaf-200 dark:border-leaf-700 rounded-xl pl-6 pr-3 py-1 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:border-leaf-400"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Deduction Button */}
              <button
                onClick={handleDeduct}
                className="w-full bg-leaf-600 hover:bg-leaf-700 text-white font-bold py-3 rounded-xl shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Deduct ₹{finalDeductionAmount} from {foundRegistryStudent.name}'s Wallet</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5. Last Deduction Digital Receipt */}
          {deductionReceipt && (
            <div className="p-3.5 bg-leaf-50 dark:bg-leaf-900/40 border border-leaf-200 dark:border-leaf-800 rounded-2xl space-y-1.5 text-xs text-leaf-950 dark:text-leaf-200">
              <div className="flex items-center justify-between pb-1 border-b border-leaf-200 dark:border-leaf-800">
                <span className="font-bold flex items-center gap-1.5 text-leaf-800 dark:text-leaf-300">
                  <Receipt className="w-3.5 h-3.5 text-leaf-600" />
                  Canteen Counter Debit Receipt
                </span>
                <span className="text-[10px] text-gray-500 dark:text-leaf-400 font-mono">{deductionReceipt.timestamp}</span>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <div><span className="text-gray-500 dark:text-leaf-400">Student:</span> <span className="font-bold">{deductionReceipt.studentName} ({deductionReceipt.className}-{deductionReceipt.section} #{deductionReceipt.rollNo})</span></div>
                <div><span className="text-gray-500 dark:text-leaf-400">Items:</span> <span className="font-bold">{deductionReceipt.items}</span></div>
                <div><span className="text-gray-500 dark:text-leaf-400">Amount Debited:</span> <span className="font-bold text-leaf-700 dark:text-gold-300">₹{deductionReceipt.amount}</span></div>
                <div><span className="text-gray-500 dark:text-leaf-400">Remaining Wallet:</span> <span className="font-bold text-leaf-700 dark:text-leaf-300">₹{deductionReceipt.remaining}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-leaf-950 border-t border-leaf-100 dark:border-leaf-800 flex justify-end">
          <button
            onClick={() => setIsStaffTerminalOpen(false)}
            className="w-full bg-leaf-700 hover:bg-leaf-600 text-white font-bold py-2 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Canteen Staff Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
