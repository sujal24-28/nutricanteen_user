import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { SAMPLE_STUDENTS_REGISTRY } from '../data/schools';
import { CANTEEN_MENU_ITEMS } from '../data/canteenMenu';
import {
  checkBackendHealth,
  apiSendOtp,
  apiVerifyOtp,
  apiGetProfile,
  apiGetWallet,
  apiGetOrderList,
  apiGetCities,
  apiGetCategories,
  apiGetAllProducts,
  apiStoreOrder,
  apiCompleteProfile,
  apiCreateTopupOrder,
  apiVerifyTopupPayment,
  apiRegister,
  apiAdminLogin,
  apiGetAdminDashboard,
  apiAdminListStudents,
  apiAdminDebitWallet,
  apiAdminCreditWallet,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  getApiBase
} from '../services/api';

const CanteenContext = createContext();

const STORAGE_KEY_STUDENT = 'nutricanteen_student_v2';
const STORAGE_KEY_ADMIN = 'nutricanteen_admin_v2';
const STORAGE_KEY_WALLET = 'nutricanteen_wallet_v2';
const STORAGE_KEY_ORDERS = 'nutricanteen_orders_v2';
const STORAGE_KEY_TRANSACTIONS = 'nutricanteen_transactions_v2';

export const CanteenProvider = ({ children }) => {
  // Backend connection status
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendProducts, setBackendProducts] = useState([]);
  const [backendMenuLoaded, setBackendMenuLoaded] = useState(false);
  const [backendCities, setBackendCities] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);

  // 1. Student / Auth State
  const [student, setStudent] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_STUDENT);
    const token = getStoredToken();
    if (saved && token) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // Admin Auth State
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADMIN);
    const token = getStoredToken();
    if (saved && token) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  const [authStep, setAuthStep] = useState(() => {
    const token = getStoredToken();
    if (token) {
      if (localStorage.getItem(STORAGE_KEY_ADMIN)) return 'admin-dashboard';
      if (localStorage.getItem(STORAGE_KEY_STUDENT)) return 'authenticated';
    }
    return 'phone';
  });
  const [tempPhone, setTempPhone] = useState('');
  const [debugOtp, setDebugOtp] = useState(null);

  // 2. Wallet Balance & Transaction Ledger
  const [walletBalance, setWalletBalance] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_WALLET);
    return saved !== null ? Number(saved) : 0;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 3. Pre-Order Schedule State
  const getTomorrowFormatted = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getDayAfterFormatted = () => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const [preOrderDateKey, setPreOrderDateKey] = useState('tomorrow');
  const [preOrderDateLabel, setPreOrderDateLabel] = useState(`Tomorrow (${getTomorrowFormatted()})`);
  const [breakSlot, setBreakSlot] = useState('lunch'); // 'recess' | 'lunch'

  // 4. Cart State
  const [cart, setCart] = useState([]);

  // 5. Orders State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 6. Navigation and Modals
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders' | 'wallet' | 'studentId'
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const [isStudentIdModalOpen, setIsStudentIdModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isStaffTerminalOpen, setIsStaffTerminalOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  // Sync to local storage
  useEffect(() => {
    if (student) {
      localStorage.setItem(STORAGE_KEY_STUDENT, JSON.stringify(student));
    } else {
      localStorage.removeItem(STORAGE_KEY_STUDENT);
    }
  }, [student]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem(STORAGE_KEY_ADMIN, JSON.stringify(adminUser));
    } else {
      localStorage.removeItem(STORAGE_KEY_ADMIN);
    }
  }, [adminUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_WALLET, walletBalance.toString());
  }, [walletBalance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  const liveMenuItems = React.useMemo(() => {
    // Keep the local menu visible while the live API is loading or unavailable.
    // Once the backend successfully responds, prefer its menu data.
    if (!backendMenuLoaded) return CANTEEN_MENU_ITEMS;

    if (backendProducts.length > 0) {
      return backendProducts.map((bp) => ({
        id: bp.id.toString(),
        backendId: bp.id,
        name: bp.name,
        category: (bp.category || 'lunch').toLowerCase(),
        price: Number(bp.price) || 0,
        originalPrice: (Number(bp.price) || 0) + 10,
        mrp: (Number(bp.price) || 0) + 10,
        description: bp.description || 'Nutritious canteen meal prepared fresh daily.',
        image: bp.image_url
          ? (bp.image_url.startsWith('http') ? bp.image_url : getApiBase().replace('/api/v1', '') + bp.image_url)
          : null,
        calories: '260 kcal',
        prepTime: 'Instant / Fresh',
        isVeg: true,
        isChefSpecial: true,
        dietaryTag: 'Campus Fresh',
        availableSlots: ['recess', 'lunch'],
        rating: 4.9,
        isLiveBackend: true
      }));
    }

    // A successful empty response should not blank the customer's menu.
    return CANTEEN_MENU_ITEMS;
  }, [backendProducts, backendMenuLoaded]);

  // Synchronize state with the Node/Express backend
  const syncBackendData = async () => {
    try {
      // 0. Sync authenticated data in parallel to reduce startup latency.
      if (getStoredToken()) {
        const [profileRes, walletRes, ordersRes] = await Promise.all([
          apiGetProfile(),
          apiGetWallet(),
          apiGetOrderList()
        ]);
        if (profileRes?.ok && profileRes?.data) {
          const profile = profileRes.data.student || profileRes.data.profile || profileRes.data.user || profileRes.data;
          
          setStudent((prev) => {
            const updated = {
              id: profile.id || prev?.id,
              uniqueId: profile.unique_id || `STU-${(profile.class || profile.class_name || '10').replace('Class ', '')}${profile.section || 'A'}-${profile.roll || profile.roll_no || '1'}`,
              phone: profile.phone || prev?.phone || tempPhone,
              name: profile.name || prev?.name || 'Student',
              schoolId: profile.city_id || prev?.schoolId || 1,
              schoolName: profile.school_name || prev?.schoolName || 'Campus Canteen',
              className: profile.class || profile.class_name || prev?.className || 'Class 10',
              section: profile.section || prev?.section || 'A',
              rollNo: profile.roll || profile.roll_no || prev?.rollNo || '1',
              avatar: (profile.avatar ? `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${profile.avatar}` : null) || profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || prev?.name || 'User')}&background=f3f4f6&color=9ca3af&size=200`,
              walletBalance: Number(profile.wallet_balance || profile.wallet || prev?.walletBalance || 0),
              parentContact: `+91 ${profile.phone || prev?.phone || tempPhone}`
            };
            return updated;
          });
        }

        // 1. Wallet & Ledger
        const wData = walletRes?.data?.data || walletRes?.data;
        if (walletRes?.ok && wData?.wallet_balance !== undefined) {
          setWalletBalance(Number(wData.wallet_balance));
          
          const history = wData.transactions || wData.wallet_history || [];
          if (Array.isArray(history) && history.length > 0) {
            const mappedHistory = history.map((th) => ({
              id: `TXN-${th.id}`,
              type: th.type,
              amount: Number(th.amount),
              title: th.description || (th.type === 'credit' ? 'Wallet Top-up' : 'Canteen Order'),
              description: th.type === 'credit' ? 'Added via Online Payment' : 'Deducted for Pre-Order',
              date: th.created_at ? new Date(th.created_at).toLocaleDateString() : 'Today',
              status: 'Success'
            }));
            setTransactions(mappedHistory);
          } else {
            setTransactions([]);
          }
        }

        // 2. Orders List
        const ordersArray = ordersRes?.data?.data?.orders || ordersRes?.data?.orders || [];
        if (ordersRes?.ok && Array.isArray(ordersArray)) {
          const mappedOrders = ordersArray.map((o, idx) => {
            let items = [];
            try {
              if (o.items && Array.isArray(o.items)) {
                items = o.items.map(i => ({
                  name: i.menuItem?.name || 'Meal Item',
                  quantity: i.quantity,
                  price: Number(i.unit_price || 0)
                }));
              } else {
                items = typeof o.product_details === 'string' ? JSON.parse(o.product_details) : o.product_details;
              }
            } catch (e) {
              items = [{ name: 'Meal Item', quantity: o.product_count || 1, price: Number(o.total_amount) }];
            }
            return {
              id: o.id || o.order_id,
              tokenNumber: `TK-${(o.id || o.order_id || idx + 10).toString().slice(-2)}`,
              items: Array.isArray(items) ? items : [items],
              totalAmount: Number(o.grand_amount || o.total_amount || 0),
              preOrderDate: (new Date(o.pickup_time || o.created_at || Date.now())).toLocaleDateString(),
              breakSlot: o.note || 'Lunch Break (1:15 PM)',
              status: (o.status === 'pending' || o.order_status === 'Pending') ? 'Scheduled' : (o.status || o.order_status),
              pickupNote: o.student 
                ? `Student: ${o.student.name} (${o.student.class}-${o.student.section}, Roll #${o.student.roll})` 
                : `Student: ${student?.name || 'Student'}`,
              createdAt: o.created_at || o.order_time || 'Recent'
            };
          });
          if (mappedOrders.length > 0) {
            setOrders(mappedOrders);
          } else {
            setOrders([]);
          }
        }
      }

      try {
        const [prodRes, catRes] = await Promise.all([
          apiGetAllProducts(),
          apiGetCategories()
        ]);

        if (prodRes?.ok && Array.isArray(prodRes?.data)) {
          setBackendProducts(prodRes.data);
          setBackendMenuLoaded(true);
          setIsBackendConnected(true);
        } else {
          setBackendMenuLoaded(false);
          setIsBackendConnected(false);
        }

        // Categories are loaded in parallel with the menu.
      if (catRes?.ok && Array.isArray(catRes?.data?.category)) {
        setBackendCategories(catRes.data.category);
      }
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  };

  // Connect & Sync with Node/Express backend on mount
  useEffect(() => {
    const initBackend = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setIsBackendConnected(isHealthy);
        if (isHealthy) {
          await syncBackendData();
        }
      } catch (err) {
        setIsBackendConnected(false);
      }
    };

    initBackend();

    const handleAuthExpired = () => {
      setStudent(null);
      setAdminUser(null);
      setAuthStep('phone');
      showToast('Session Expired', 'Please log in again.', 'error');
      // If we are on a nested admin route like /menu, push them back to root
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, []);

  // Explicit user-triggered live backend test & synchronization
  const makeLiveRequest = async () => {
    try {
      showToast('Contacting Backend ⏳', `Sending request to ${getApiBase()}...`);
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
      if (!isHealthy) {
        showToast('Backend Unreachable ⚠️', `Could not reach ${getApiBase()}. Verify Laravel dev server is running on port 8000.`, 'error');
        return false;
      }
      await syncBackendData();
      showToast('Live Request Successful! 🚀', `Synced products, wallet (₹${walletBalance}) & orders from Laravel API.`);
      return true;
    } catch (err) {
      showToast('API Request Failed', err.message, 'error');
      return false;
    }
  };

  // Show banner alert
  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Cart actions
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast('Added to Pre-Order Cart', `${item.name} for ${breakSlot === 'recess' ? 'Morning Recess' : 'Lunch Break'}`);
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((x) => x.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    setCart((prev) =>
      prev
        .map((x) => {
          if (x.id === itemId) {
            const newQ = x.quantity + delta;
            return newQ > 0 ? { ...x, quantity: newQ } : null;
          }
          return x;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Wallet Recharge Action with Razorpay
  const rechargeWallet = async (amount, paymentMethod = 'Razorpay') => {
    if (isBackendConnected) {
      try {
        // 1. Create order on backend
        const orderRes = await apiCreateTopupOrder(amount);
        if (!orderRes.ok || !orderRes.data) {
          showToast('Recharge Failed', orderRes.error || 'Failed to initiate payment.');
          setIsRechargeOpen(false);
          return;
        }

        const { order_id, amount: orderAmount, currency, key_id } = orderRes.data;

        // 2. Open Razorpay Checkout
        const options = {
          key: key_id,
          amount: orderAmount * 100,
          currency: currency,
          name: 'NutriCanteen',
          description: 'Wallet Recharge',
          order_id: order_id,
          handler: async (response) => {
            // 3. Verify payment on backend
            const verifyRes = await apiVerifyTopupPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount
            });

            if (verifyRes.ok) {
              await syncBackendData();
              confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 }, colors: ['#4e8d5a', '#cca95f'] });
              showToast('Wallet Recharged! 🎉', `₹${amount} added successfully.`);
              setIsRechargeOpen(false);
            } else {
              showToast('Payment Failed', verifyRes.error || 'Verification failed.');
            }
          },
          prefill: {
            name: student?.name || '',
            contact: student?.phone || '',
          },
          theme: {
            color: '#15803d' // leaf-700
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          showToast('Payment Failed', response.error.description);
        });
        rzp.open();

      } catch (err) {
        showToast('Error', 'Failed to communicate with server.');
        setIsRechargeOpen(false);
      }
    } else {
      // Fallback local logic
      const newBal = walletBalance + amount;
      setWalletBalance(newBal);

      const newTxn = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'credit',
        amount,
        title: 'Wallet Recharge Successful',
        description: `Recharged via Mock Razorpay`,
        date: 'Just Now',
        method: paymentMethod,
        status: 'Completed'
      };
      setTransactions((prev) => [newTxn, ...prev]);

      confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 }, colors: ['#4e8d5a', '#cca95f'] });
      showToast('Wallet Recharged! 🎉', `₹${amount} added successfully.`);
      setIsRechargeOpen(false);
    }
  };


  // Pre-Order Checkout (Strictly Wallet-Only) with Live Backend API call
  const placePreOrder = async () => {
    if (cart.length === 0) return false;

    if (walletBalance < cartTotal) {
      showToast('Insufficient Wallet Balance ⚠️', `Please top up ₹${cartTotal - walletBalance} to complete this order.`, 'error');
      setIsRechargeOpen(true);
      return false;
    }

    const orderTotal = cartTotal;
    let orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tokenNo = `TK-${Math.floor(10 + Math.random() * 90)}`;

    // If backend is live, send real HTTP POST /api/order-store
    if (isBackendConnected) {
      try {
        const orderPayload = {
          product_details: JSON.stringify(cart.map((c) => ({
            id: c.id,
            name: c.name,
            price: c.price,
            quantity: c.quantity
          }))),
          total_amount: orderTotal,
          coupon_code: '',
          coupon_discount: 0,
          grand_amount: orderTotal,
          user_address: `Class ${student.className}-${student.section}, Roll #${student.rollNo} (${student.schoolName || 'Campus'})`,
          payment_status: 'paid'
        };

        const res = await apiStoreOrder(orderPayload);
        if (!res.ok) {
          showToast('Order Failed', res.error || res.data?.message || 'Unable to place order.', 'error');
          return false;
        }

        if (res.data?.order_id || res.data?.data?.id || res.data?.id) {
          orderId = res.data.order_id || res.data.data?.id || res.data.id;
        }

        // Backend transaction already deducts the wallet. Refresh authoritative state.
        await syncBackendData();
      } catch (err) {
        showToast('Order Failed', err.message || 'Unable to place order.', 'error');
        return false;
      }
    }

    const newOrder = {
      id: orderId,
      tokenNumber: tokenNo,
      items: [...cart],
      totalAmount: orderTotal,
      preOrderDate: preOrderDateLabel,
      breakSlot: breakSlot === 'recess' ? 'Morning Recess (10:30 AM)' : 'Lunch Break (1:15 PM)',
      status: 'Scheduled',
      pickupNote: `Student: ${student.name} (${student.className}-${student.section}, Roll #${student.rollNo})`,
      createdAt: 'Just now'
    };

    // Deduct Wallet locally as well if not already updated by sync
    setWalletBalance((prev) => (prev >= orderTotal ? prev - orderTotal : prev));

    // Add debit transaction
    const newTxn = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'debit',
      amount: orderTotal,
      title: `Pre-Order: ${cart.map((c) => `${c.name} (x${c.quantity})`).join(', ')}`,
      description: `Debited for ${newOrder.breakSlot} on ${preOrderDateLabel}`,
      date: 'Just Now',
      method: 'Wallet Direct Debit',
      status: 'Debited'
    };

    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);
    setTransactions((prev) => [newTxn, ...prev]);
    clearCart();
    setIsCartOpen(false);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4e8d5a', '#cca95f']
    });

    showToast('Pre-Order Placed! 🍱', `Token ${tokenNo} created for ${preOrderDateLabel}. Deducted ₹${orderTotal} from Wallet.`);
    setActiveTab('orders');
    return true;
  };


  // Canteen Staff Admin Counter Action
  const staffDeductStudentWallet = (targetRollNo, targetClass, targetSec, amount, itemName = 'Canteen Counter Purchase') => {
    const isCurrent =
      student &&
      student.rollNo.toString().trim() === targetRollNo.toString().trim() &&
      student.className.toLowerCase().includes(targetClass.toLowerCase()) &&
      student.section.toUpperCase() === targetSec.toUpperCase();

    if (isCurrent) {
      if (walletBalance < amount) {
        return { success: false, message: `Insufficient balance! Student has only ₹${walletBalance}.` };
      }

      setWalletBalance((prev) => prev - amount);

      const newTxn = {
        id: `TXN-COUNTER-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'debit',
        amount,
        title: `Canteen Counter: ${itemName}`,
        description: `Deducted by Canteen Staff at School Counter for ${student.name} (${student.className}-${student.section} #${student.rollNo})`,
        date: 'Just Now (Counter)',
        method: `Counter Debit (${student.className}-${student.section} #${student.rollNo})`,
        status: 'Debited'
      };

      setTransactions((prev) => [newTxn, ...prev]);

      showToast('Counter Deduction Successful', `Deducted ₹${amount} for ${itemName}. Remaining Wallet: ₹${walletBalance - amount}`);
      return { success: true, remaining: walletBalance - amount, studentName: student.name };
    } else {
      const found = SAMPLE_STUDENTS_REGISTRY.find(
        (s) =>
          s.rollNo.toString().trim() === targetRollNo.toString().trim() &&
          s.className.toLowerCase().includes(targetClass.toLowerCase()) &&
          s.section.toUpperCase() === targetSec.toUpperCase()
      );

      if (found) {
        if (found.walletBalance < amount) {
          return { success: false, message: `Insufficient balance! ${found.name} has only ₹${found.walletBalance}.` };
        }
        found.walletBalance -= amount;
        return { success: true, remaining: found.walletBalance, studentName: found.name };
      }

      return { success: false, message: 'Student record not found for this Class, Section and Roll No.' };
    }
  };

  // Staff mark pre-order as collected
  const staffMarkOrderCollected = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Collected / Handed Over' } : o))
    );
    showToast('Meal Handed Over ✅', `Pre-order ${orderId} marked as collected.`);
  };

  // Login & Profile Setup with Backend API (Production Grade)
  const sendOtp = async (phone) => {
    setTempPhone(phone);
    setDebugOtp(null);
    try {
      const res = await apiSendOtp(phone);
      if (res.ok) {
        setAuthStep('otp');
        const payloadData = res.data?.data || res.data;
        const isSmsDispatched = Boolean(payloadData?.sms_dispatched);
        const returnedOtp = payloadData?.debug_otp;
        if (returnedOtp) {
          setDebugOtp(returnedOtp);
        }

        if (isSmsDispatched) {
          showToast('SMS Sent 📲', `Verification code delivered to +91 ${phone}'s SMS inbox.`);
        } else {
          showToast('Dev OTP Generated 🧪', `No SMS Gateway in .env. Test OTP for +91 ${phone}: ${returnedOtp}`);
        }
        return { ok: true, data: res.data };
      } else {
        const err = res.data?.message || res.error || 'Please check your phone number and try again.';
        showToast('Failed to Send OTP', `${err} (Tap server badge to verify IP)`, 'error');
        return { ok: false, error: err };
      }
    } catch (e) {
      showToast('Connection Error', `Could not reach backend at ${getApiBase()}. Tap server badge to adjust Server IP.`, 'error');
      return { ok: false, error: e.message };
    }
  };

  const registerUser = async (payload) => {
    try {
      const res = await apiRegister(payload);
      if (res.ok) {
        return { success: true };
      } else {
        const err = res.data?.message || res.error || 'Registration failed.';
        showToast('Registration Error', err, 'error');
        return { success: false, message: err };
      }
    } catch (e) {
      showToast('Connection Error', e.message, 'error');
      return { success: false, message: e.message };
    }
  };

  const adminLogin = async (identifier, password) => {
    try {
      const res = await apiAdminLogin(identifier, password);
      if (res.ok && res.data?.admin) {
        setAdminUser(res.data.admin);
        setAuthStep('admin-dashboard');
        showToast('Admin Logged In', `Welcome, ${res.data.admin.name}`);
        return { success: true };
      } else {
        const err = res.data?.message || res.error || 'Invalid credentials.';
        showToast('Login Error', err, 'error');
        return { success: false, message: err };
      }
    } catch (e) {
      showToast('Connection Error', e.message, 'error');
      return { success: false, message: e.message };
    }
  };

  const verifyOtp = async (otp) => {
    if (!otp || otp.length < 6) {
      showToast('Invalid OTP', 'Please enter a valid 6-digit OTP', 'error');
      return false;
    }

    try {
      const res = await apiVerifyOtp(tempPhone, otp);
      if (res.ok && res.data) {
        if (res.data.token) {
          setStoredToken(res.data.token);
        }

        if (res.data.is_new_user) {
          setAuthStep('profile');
          showToast('OTP Verified! 🎓', 'Please complete your student profile.');
        } else {
          const profile = res.data.student || res.data.profile || res.data.user || {};
          const stu = {
            id: profile.id,
            uniqueId: profile.unique_id || `STU-${(profile.class || profile.class_name || '10').replace('Class ', '')}${profile.section || 'A'}-${profile.roll || profile.roll_no || '1'}`,
            phone: profile.phone || tempPhone,
            name: profile.name || 'Student',
            schoolId: profile.city_id || 1,
            schoolName: profile.school_name || 'Campus Canteen',
            className: profile.class || profile.class_name || 'Class 10',
            section: profile.section || 'A',
            rollNo: profile.roll || profile.roll_no || '1',
            avatar: (profile.avatar ? `${import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')}${profile.avatar}` : null) || profile.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || 'User')}&background=f3f4f6&color=9ca3af&size=200`,
            walletBalance: Number(profile.wallet_balance || profile.wallet || 0),
            parentContact: `+91 ${profile.phone || tempPhone}`
          };
          setStudent(stu);
          setWalletBalance(Number(profile.wallet || 0));
          setAuthStep('authenticated');
          showToast('Welcome Back! 👋', `Logged in as ${stu.name}`);
          await syncBackendData();
        }
        return true;
      } else {
        showToast('Verification Failed ⚠️', res.data?.message || res.error || 'Incorrect OTP code. Please try again.', 'error');
        return false;
      }
    } catch (e) {
      showToast('Verification Error', e.message || 'Error connecting to authentication service.', 'error');
      return false;
    }
  };

  const completeStudentProfile = async (profileData) => {
    try {
      const res = await apiCompleteProfile({
        name: profileData.name,
        city_id: profileData.schoolId || 1,
        class_name: profileData.className,
        section: profileData.section,
        roll_no: profileData.rollNo
      });

      const uniqueId = `STU-${profileData.className.replace('Class ', '')}${profileData.section}-${profileData.rollNo}`;
      const newStudent = {
        uniqueId,
        phone: tempPhone,
        name: profileData.name,
        schoolId: profileData.schoolId || 1,
        schoolName: profileData.schoolName || 'Campus Canteen',
        className: profileData.className,
        section: profileData.section,
        rollNo: profileData.rollNo,
        avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=f3f4f6&color=9ca3af&size=200`,
        walletBalance: res.ok && res.data?.user?.wallet !== undefined ? Number(res.data.user.wallet) : 0,
        parentContact: `+91 ${tempPhone}`
      };

      setStudent(newStudent);
      setWalletBalance(newStudent.walletBalance);
      setAuthStep('authenticated');

      confetti({
        particleCount: 60,
        spread: 60,
        colors: ['#4e8d5a', '#cca95f']
      });

      showToast('Welcome to NutriCanteen! 🎒', `Account created for ${newStudent.name}. Profile linked to school canteen.`);
      await syncBackendData();
      return true;
    } catch (e) {
      console.error('completeStudentProfile error:', e);
      showToast('Profile Error', 'Failed to save student profile on server.', 'error');
      return false;
    }
  };

  const logout = () => {
    try {
      setStudent(null);
      setAdminUser(null);
      setAuthStep('phone');
      setCart([]);
      clearStoredToken();
      localStorage.removeItem(STORAGE_KEY_STUDENT);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
      showToast('Signed Out', 'You have been signed out.');
    } catch (e) {
      console.error(e);
      showToast('Logout Error', e.message, 'error');
    }
  };

  const userRole = adminUser ? adminUser.role : (student ? 'student' : null);

  return (
    <CanteenContext.Provider
      value={{
        // Backend connectivity & Live Data
        isBackendConnected,
        liveMenuItems,
        backendProducts,
        backendCities,
        backendCategories,
        syncBackendData,
        makeLiveRequest,
        getApiBase,

        // Auth & Student
        student,
        setStudent,
        adminUser,
        setAdminUser,
        userRole,
        authStep,
        setAuthStep,
        tempPhone,
        debugOtp,
        sendOtp,
        verifyOtp,
        registerUser,
        adminLogin,
        completeStudentProfile,
        logout,

        // Wallet
        walletBalance,
        transactions,
        rechargeWallet,
        isRechargeOpen,
        setIsRechargeOpen,

        // Pre-Order Scheduling
        preOrderDateKey,
        setPreOrderDateKey,
        preOrderDateLabel,
        setPreOrderDateLabel,
        breakSlot,
        setBreakSlot,
        isPreOrderModalOpen,
        setIsPreOrderModalOpen,
        getTomorrowFormatted,
        getDayAfterFormatted,

        // Cart
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        isCartOpen,
        setIsCartOpen,
        placePreOrder,

        // Orders
        orders,
        isStudentIdModalOpen,
        setIsStudentIdModalOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,

        // Canteen Staff Terminal
        isStaffTerminalOpen,
        setIsStaffTerminalOpen,
        staffDeductStudentWallet,
        staffMarkOrderCollected,

        // UI
        activeTab,
        setActiveTab,
        isServerSettingsOpen,
        setIsServerSettingsOpen,
        notification,
        showToast
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => useContext(CanteenContext);
