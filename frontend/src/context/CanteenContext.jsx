import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Capacitor } from '@capacitor/core';
import {
  checkBackendHealth,
  apiSendOtp,
  apiVerifyOtp,
  apiGetProfile,
  apiGetWallet,
  apiGetOrderList,
  apiGetCities,
  apiGetCategories,
  apiGetSchools,
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
  apiGetBanner,
  setStoredToken,
  clearStoredToken,
  getStoredToken,
  getApiBase
} from '../services/api';
import { CanteenContext } from './useCanteen';
import { getInitialTheme, applyAppTheme } from '../utils/theme';

const STORAGE_KEY_PRODUCTS = 'nutricanteen_products_v2';
const STORAGE_KEY_STUDENT = 'nutricanteen_student_v2';
const STORAGE_KEY_ADMIN = 'nutricanteen_admin_v2';
const STORAGE_KEY_WALLET = 'nutricanteen_wallet_v2';
const STORAGE_KEY_ORDERS = 'nutricanteen_orders_v2';
const STORAGE_KEY_TRANSACTIONS = 'nutricanteen_transactions_v2';
const STORAGE_KEY_ADDRESSES = 'nutricanteen_addresses_v2';
const STORAGE_KEY_CART = 'nutricanteen_cart_v2';

export const CanteenProvider = ({ children }) => {
  // Backend connection status
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendProducts, setBackendProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });
  const [backendCities, setBackendCities] = useState([]);
  const [backendCategories, setBackendCategories] = useState([]);
  const [backendSchools, setBackendSchools] = useState(() => {
    try {
      const saved = localStorage.getItem('nutricanteen_schools_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

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

  // 4. Cart State (Persisted across app closures)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CART);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [];
  });

  // 5. Orders State
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ORDERS);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // 6. Multi-Address State
  const [addresses, setAddresses] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ADDRESSES);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    return addresses.length > 0 ? addresses[0].id : null;
  });

  // 7. Navigation and Modals
  const [activeTab, setActiveTabState] = useState('menu'); // 'menu' | 'orders' | 'wallet' | 'studentId' | 'settings'
  const [tabHistory, setTabHistory] = useState(['menu']);

  const setActiveTab = React.useCallback((tab) => {
    setActiveTabState((current) => {
      if (current === tab) return current;
      setTabHistory((hist) => {
        if (tab === 'menu') return ['menu'];
        return [...hist.filter((t) => t !== tab), tab];
      });
      return tab;
    });
  }, []);

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPreOrderModalOpen, setIsPreOrderModalOpen] = useState(false);
  const [isStudentIdModalOpen, setIsStudentIdModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isStaffTerminalOpen, setIsStaffTerminalOpen] = useState(false);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [banner, setBanner] = useState(null);

  // 8. Global Theme & Native Status Bar Synchronization
  const [darkMode, setDarkModeState] = useState(() => getInitialTheme());

  const toggleDarkMode = React.useCallback(() => {
    setDarkModeState((prev) => {
      const next = !prev;
      applyAppTheme(next);
      return next;
    });
  }, []);

  const setDarkMode = React.useCallback((val) => {
    setDarkModeState(val);
    applyAppTheme(val);
  }, []);

  useEffect(() => {
    applyAppTheme(darkMode);
  }, []);

  const backStateRef = React.useRef({
    isEditProfileOpen: false,
    isServerSettingsOpen: false,
    isOrderHistoryOpen: false,
    isStudentIdModalOpen: false,
    isPreOrderModalOpen: false,
    isRechargeOpen: false,
    isCartOpen: false,
    isStaffTerminalOpen: false,
    authStep: 'phone',
    activeTab: 'menu',
    tabHistory: ['menu']
  });

  useEffect(() => {
    backStateRef.current = {
      isEditProfileOpen,
      isServerSettingsOpen,
      isOrderHistoryOpen,
      isStudentIdModalOpen,
      isPreOrderModalOpen,
      isRechargeOpen,
      isCartOpen,
      isStaffTerminalOpen,
      authStep,
      activeTab,
      tabHistory
    };
  }, [
    isEditProfileOpen,
    isServerSettingsOpen,
    isOrderHistoryOpen,
    isStudentIdModalOpen,
    isPreOrderModalOpen,
    isRechargeOpen,
    isCartOpen,
    isStaffTerminalOpen,
    authStep,
    activeTab,
    tabHistory
  ]);

  // Centralized Hardware / Gesture Back Button Interceptor for Android Phone
  useEffect(() => {
    const handleBackNavigation = () => {
      const state = backStateRef.current;

      // 1. If any overlay modal is open, close the topmost modal
      if (state.isEditProfileOpen) {
        setIsEditProfileOpen(false);
        return true;
      }
      if (state.isServerSettingsOpen) {
        setIsServerSettingsOpen(false);
        return true;
      }
      if (state.isOrderHistoryOpen) {
        setIsOrderHistoryOpen(false);
        return true;
      }
      if (state.isStudentIdModalOpen) {
        setIsStudentIdModalOpen(false);
        return true;
      }
      if (state.isPreOrderModalOpen) {
        setIsPreOrderModalOpen(false);
        return true;
      }
      if (state.isRechargeOpen) {
        setIsRechargeOpen(false);
        return true;
      }
      if (state.isCartOpen) {
        setIsCartOpen(false);
        return true;
      }
      if (state.isStaffTerminalOpen) {
        setIsStaffTerminalOpen(false);
        return true;
      }

      // 2. Auth flow back: from OTP step back to phone number input
      if (state.authStep === 'otp') {
        setAuthStep('phone');
        return true;
      }

      // 3. Tab navigation back: return to previous section!
      if (state.activeTab !== 'menu') {
        const hist = state.tabHistory || [];
        if (hist.length > 1) {
          const nextHist = hist.slice(0, -1);
          const previousSection = nextHist[nextHist.length - 1] || 'menu';
          setTabHistory(nextHist);
          setActiveTabState(previousSection);
        } else {
          setTabHistory(['menu']);
          setActiveTabState('menu');
        }
        return true;
      }

      // 4. On root home section ('menu') with no modals open:
      // Return false to allow native double-back exit handler in MainActivity
      return false;
    };

    // Expose for native Android BridgeActivity WebView evaluation
    window.__handleHardwareBack = handleBackNavigation;

    // Web browser history navigation support
    const handlePopState = (e) => {
      const handled = handleBackNavigation();
      if (handled) {
        e.preventDefault();
        window.history.pushState(null, '', window.location.href);
      }
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      delete window.__handleHardwareBack;
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

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
    try {
      if (cart && cart.length > 0) {
        localStorage.setItem(STORAGE_KEY_CART, JSON.stringify(cart));
      } else {
        localStorage.removeItem(STORAGE_KEY_CART);
      }
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    if (backendProducts && backendProducts.length > 0) {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(backendProducts));
    }
  }, [backendProducts]);

  // Ensure default address exists if student is logged in and sync addresses when school changes
  useEffect(() => {
    if (student) {
      setAddresses((prev) => {
        if (!prev || prev.length === 0) {
          const initial = {
            id: 'addr_' + Date.now(),
            studentName: student.name || 'Student',
            schoolName: student.schoolName || 'School Canteen',
            className: (student.className || '10').replace('Class ', '').trim(),
            section: (student.section || 'A').toUpperCase().trim(),
            rollNo: (student.rollNo || '1').toString().trim()
          };
          setSelectedAddressId(initial.id);
          return [initial];
        }

        // When student's school is changed or updated, update all saved addresses
        if (student.schoolName) {
          let hasChange = false;
          const updated = prev.map((addr) => {
            if (
              !addr.schoolName ||
              addr.schoolName === 'Campus School' ||
              addr.schoolName === 'Campus' ||
              addr.schoolName === 'Campus Canteen' ||
              addr.schoolName !== student.schoolName
            ) {
              hasChange = true;
              return { ...addr, schoolName: student.schoolName };
            }
            return addr;
          });
          if (hasChange) return updated;
        }

        return prev;
      });
    }
  }, [student?.schoolName, student?.name]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ADDRESSES, JSON.stringify(addresses));
    if (addresses.length > 0 && (!selectedAddressId || !addresses.some((a) => a.id === selectedAddressId))) {
      setSelectedAddressId(addresses[0].id);
    }
  }, [addresses, selectedAddressId]);

  const liveMenuItems = React.useMemo(() => {
    if (backendProducts && backendProducts.length > 0) {
      return backendProducts.map((bp) => {
        return {
          id: bp.id.toString(),
          backendId: bp.id,
          name: bp.name ? bp.name.trim().charAt(0).toUpperCase() + bp.name.trim().slice(1) : '',
          category: (bp.category || 'lunch').toLowerCase(),
          price: Number(bp.price) || 0,
          mrp: bp.mrp ? Number(bp.mrp) : null,
          originalPrice: bp.mrp ? Number(bp.mrp) : Number(bp.price) || 0,
          description: bp.description || 'Nutritious canteen meal prepared fresh daily.',
          image: bp.image_url 
            ? (bp.image_url.startsWith('http') ? bp.image_url : getApiBase().replace('/api/v1', '') + bp.image_url) 
            : null,
          calories: bp.calories || '',
          prepTime: 'Instant / Fresh',
          food_type: bp.food_type || 'veg',
          isVeg: (bp.food_type || 'veg').toLowerCase() === 'veg',
          isChefSpecial: true,
          dietaryTag: '',
          availableSlots: ['recess', 'lunch'],
          rating: 4.9,
          isLiveBackend: true,
          is_available: bp.is_available !== false && bp.is_available !== 'false' && bp.is_available !== 0 && bp.is_available !== '0',
          isAvailable: bp.is_available !== false && bp.is_available !== 'false' && bp.is_available !== 0 && bp.is_available !== '0'
        };
      });
    }
    // No hardcoded fallback — show empty state when backend is unavailable
    return [];
  }, [backendProducts]);

  // Show banner alert with quick auto-dismiss (1.8s)
  const showToast = React.useCallback((title, message, type = 'success', duration = 1800) => {
    setNotification({ title, message, type, id: Date.now() });
    setTimeout(() => {
      setNotification((current) => (current?.title === title ? null : current));
    }, duration);
  }, []);

  const dismissToast = React.useCallback(() => {
    setNotification(null);
  }, []);

  const normalizeOrderStatus = (raw) => {
    const s = String(raw || 'pending').toLowerCase().trim();
    if (s === 'confirmed' || s === 'preparing' || s === 'cooking') return 'preparing';
    if (s === 'ready' || s === 'accepted') return 'ready';
    if (s === 'delivered' || s === 'completed' || s.includes('collected') || s.includes('handed')) return 'delivered';
    if (s === 'cancelled' || s === 'rejected' || s.includes('cancel')) return 'cancelled';
    return 'pending';
  };

  const prevOrdersRef = React.useRef(new Map()); // id -> status
  const prevWalletRef = React.useRef(null);
  const prevProductsHashRef = React.useRef('');
  const isSyncingRef = React.useRef(false);

  // Synchronize state with Backend Live at runtime without tearing down UI
  const syncLiveStatus = React.useCallback(async (isInitial = false) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    try {
      const hasToken = !!getStoredToken();
      const promises = [
        apiGetAllProducts().catch(() => null),
        apiGetBanner().catch(() => null),
        apiGetCategories().catch(() => null),
        apiGetSchools().catch(() => null)
      ];
      if (hasToken) {
        promises.push(apiGetOrderList().catch(() => null));
        promises.push(apiGetWallet().catch(() => null));
        promises.push(apiGetProfile().catch(() => null));
      }

      const [prodRes, bannerRes, catRes, schoolsRes, ordersRes, walletRes, profileRes] = await Promise.all(promises);

      // Sync Categories Live
      if (catRes?.ok && Array.isArray(catRes.data) && catRes.data.length > 0) {
        setBackendCategories(catRes.data);
      }

      // Sync Schools Live
      if (schoolsRes?.ok && Array.isArray(schoolsRes.data) && schoolsRes.data.length > 0) {
        setBackendSchools(schoolsRes.data);
        try {
          localStorage.setItem('nutricanteen_schools_v2', JSON.stringify(schoolsRes.data));
        } catch (e) {}
      }

      // 1. Sync Menu Products Live (Instant Menu changes from Admin/Staff)
      if (prodRes?.ok && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
        const prodData = prodRes.data;
        const newHash = JSON.stringify(prodData.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          mrp: p.mrp,
          is_available: p.is_available,
          food_type: p.food_type,
          image_url: p.image_url,
          category: p.category
        })));

        if (newHash !== prevProductsHashRef.current) {
          prevProductsHashRef.current = newHash;
          setBackendProducts(prodData);
          setIsBackendConnected(true);
        }
      }

      // 2. Sync Orders Live (Instant status updates: pending -> preparing -> ready -> delivered)
      if (ordersRes?.ok) {
        const ordersArray = ordersRes.data?.data?.orders || ordersRes.data?.orders || [];
        if (Array.isArray(ordersArray)) {
          const mappedOrders = ordersArray.map((o, idx) => {
            let items = [];
            try {
              if (o.items && Array.isArray(o.items)) {
                items = o.items.map(i => ({
                  name: i.menuItem?.name || i.name || 'Meal Item',
                  quantity: i.quantity,
                  price: Number(i.unit_price || i.price || 0)
                }));
              } else if (o.product_details) {
                items = typeof o.product_details === 'string' ? JSON.parse(o.product_details) : o.product_details;
              }
            } catch (e) {
              items = [{ name: 'Meal Item', quantity: o.product_count || 1, price: Number(o.total_amount || 0) }];
            }

            const rawStatus = (o.status || o.order_status || 'pending').toLowerCase();
            const normalizedStatus = normalizeOrderStatus(rawStatus);

            return {
              id: o.id || o.order_id,
              tokenNumber: `TK-${(o.id || o.order_id || idx + 10).toString().slice(-2)}`,
              items: Array.isArray(items) ? items : [items],
              totalAmount: Number(o.grand_amount || o.total_amount || 0),
              preOrderDate: (new Date(o.pickup_time || o.created_at || Date.now())).toLocaleDateString(),
              breakSlot: o.note || 'Lunch Break (1:15 PM)',
              status: normalizedStatus,
              rawStatus: o.status || o.order_status,
              pickupNote: o.student 
                ? `Student: ${o.student.name} (${o.student.class}-${o.student.section}, Roll #${o.student.roll})` 
                : `Student: Student`,
              createdAt: o.created_at || o.order_time || 'Recent'
            };
          });

          // Check for status transitions to notify student with instant alerts
          if (!isInitial && prevOrdersRef.current.size > 0) {
            mappedOrders.forEach((newOrder) => {
              const prevStatus = prevOrdersRef.current.get(newOrder.id);
              if (prevStatus && prevStatus !== newOrder.status) {
                if (newOrder.status === 'ready') {
                  showToast('Order Ready for Pickup! 🍱', `Token ${newOrder.tokenNumber} is ready at the canteen counter!`, 'success');
                  try {
                    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
                  } catch (e) {}
                } else if (newOrder.status === 'preparing') {
                  showToast('Preparing Order 👨‍🍳', `Kitchen is preparing your order (${newOrder.tokenNumber}).`, 'info');
                } else if (newOrder.status === 'delivered') {
                  showToast('Order Collected 🎉', `Order ${newOrder.tokenNumber} collected. Enjoy your meal!`, 'success');
                } else if (newOrder.status === 'cancelled') {
                  showToast('Order Cancelled ⚠️', `Order ${newOrder.tokenNumber} was cancelled and refunded.`, 'error');
                }
              }
            });
          }

          // Update known orders map
          const newMap = new Map();
          mappedOrders.forEach(o => newMap.set(o.id, o.status));
          prevOrdersRef.current = newMap;

          setOrders(mappedOrders);
        }
      }

      // 3. Sync Wallet Live (Instant Wallet update on staff refund / debit / credit)
      if (walletRes?.ok) {
        const wData = walletRes.data?.data || walletRes.data;
        if (wData?.wallet_balance !== undefined) {
          const newBal = Number(wData.wallet_balance);
          if (prevWalletRef.current !== null && !isInitial && newBal !== prevWalletRef.current) {
            if (newBal > prevWalletRef.current) {
              const diff = (newBal - prevWalletRef.current).toFixed(2);
              showToast('Wallet Credited 💳', `₹${diff} added to your wallet! Current balance: ₹${newBal}`, 'success');
            }
          }
          prevWalletRef.current = newBal;
          setWalletBalance(newBal);

          const history = wData.transactions || wData.wallet_history || [];
          if (Array.isArray(history)) {
            const mappedHistory = history.map((th) => ({
              id: `TXN-${th.id}`,
              type: th.type,
              amount: Number(th.amount),
              title: th.description || (th.type === 'credit' ? 'Wallet Top-up' : 'Canteen Order'),
              description: th.type === 'credit' ? 'Added via Online Payment / Refund' : 'Deducted for Pre-Order',
              date: th.created_at ? new Date(th.created_at).toLocaleDateString() : 'Today',
              status: 'Success'
            }));
            setTransactions(mappedHistory);
          }
        }
      }

      // 4. Sync Profile Live (Instant updates when admin changes student school, class, or name at runtime)
      if (profileRes?.ok && profileRes.data) {
        const raw = profileRes.data;
        const profile = raw?.data || raw?.student || raw?.profile || raw?.user || raw;
        const newSchoolName = profile.school_name || profile.school?.name || null;
        const newSchoolId = profile.school_id !== undefined && profile.school_id !== null ? profile.school_id : profile.city_id;

        setStudent((prev) => {
          if (!prev) return prev;
          const currentSchoolName = newSchoolName || prev.schoolName || 'School Canteen';
          const currentSchoolId = newSchoolId !== undefined && newSchoolId !== null ? newSchoolId : prev.schoolId;

          const schoolChanged = Boolean(newSchoolName && prev.schoolName !== newSchoolName);
          const schoolIdChanged = Boolean(newSchoolId !== undefined && newSchoolId !== null && prev.schoolId !== newSchoolId);
          const nameChanged = Boolean(profile.name && prev.name !== profile.name);
          const classChanged = Boolean((profile.class || profile.class_name) && prev.className !== (profile.class || profile.class_name));
          const sectionChanged = Boolean(profile.section && prev.section !== profile.section);
          const rollChanged = Boolean((profile.roll || profile.roll_no) && String(prev.rollNo) !== String(profile.roll || profile.roll_no));

          if (schoolChanged || schoolIdChanged || nameChanged || classChanged || sectionChanged || rollChanged) {
            if (schoolChanged && !isInitial) {
              showToast('School Updated 🏫', `School changed to ${currentSchoolName}`, 'info');
            }
            return {
              ...prev,
              name: profile.name || prev.name,
              schoolId: currentSchoolId,
              schoolName: currentSchoolName,
              className: profile.class || profile.class_name || prev.className,
              section: profile.section || prev.section,
              rollNo: profile.roll || profile.roll_no || prev.rollNo,
            };
          }
          return prev;
        });
      }

      // 5. Banner Live Sync
      if (bannerRes?.ok && bannerRes.data) {
        setBanner(bannerRes.data);
      }
    } catch (err) {
      console.warn('[LiveSync] Background sync error:', err);
    } finally {
      isSyncingRef.current = false;
    }
  }, [showToast]);

  // Synchronize full profile state with Backend
  const syncBackendData = async () => {
    try {
      let profilePromise = Promise.resolve(null);
      if (getStoredToken()) {
        profilePromise = apiGetProfile();
      }

      const [profileRes] = await Promise.all([
        profilePromise,
        syncLiveStatus(true)
      ]);

      // Sync Profile Data
      if (profileRes?.ok && profileRes?.data) {
        const raw = profileRes.data;
        const profile = raw?.data || raw?.student || raw?.profile || raw?.user || raw;
        const resolvedSchoolName = profile.school_name || profile.school?.name || null;
        const resolvedSchoolId = profile.school_id !== undefined && profile.school_id !== null ? profile.school_id : profile.city_id;

        setStudent((prev) => {
          const updated = {
            id: profile.id || prev?.id,
            uniqueId: profile.unique_id || `STU-${(profile.class || profile.class_name || '10').replace('Class ', '')}${profile.section || 'A'}-${profile.roll || profile.roll_no || '1'}`,
            phone: profile.phone || prev?.phone || tempPhone,
            name: profile.name || prev?.name || 'Student',
            schoolId: resolvedSchoolId !== undefined && resolvedSchoolId !== null ? resolvedSchoolId : (prev?.schoolId || 1),
            schoolName: resolvedSchoolName || prev?.schoolName || 'School Canteen',
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
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }
  };

  // Connect & Real-time Live Polling Engine
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

    // Periodic live sync every 3.5 seconds
    const interval = setInterval(() => {
      syncLiveStatus(false);
    }, 3500);

    // Instant sync on app visibility change, window focus, or network online
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncLiveStatus(false);
      }
    };
    const handleFocus = () => {
      syncLiveStatus(false);
    };
    const handleOnline = () => {
      syncLiveStatus(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    const handleAuthExpired = () => {
      setStudent(null);
      setAdminUser(null);
      setAuthStep('phone');
      showToast('Session Expired', 'Please log in again.', 'error');
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, [syncLiveStatus, showToast]);

  const refreshBanner = async () => {
    try {
      const res = await apiGetBanner();
      if (res.ok && res.data) {
        setBanner(res.data);
      }
    } catch (e) {
      console.error('Failed to refresh banner:', e);
    }
  };

  // Explicit user-triggered live backend test & synchronization
  const makeLiveRequest = async () => {
    try {
      showToast('Contacting Backend ⏳', `Sending request to ${getApiBase()}...`);
      const isHealthy = await checkBackendHealth();
      setIsBackendConnected(isHealthy);
      if (!isHealthy) {
        showToast('Backend Unreachable ⚠️', `Could not reach ${getApiBase()}.`, 'error');
        return false;
      }
      await syncBackendData();
      showToast('Live Request Successful! 🚀', `Synced products, wallet (₹${walletBalance}) & orders.`);
      return true;
    } catch (err) {
      showToast('API Request Failed', err.message, 'error');
      return false;
    }
  };

  // Cart actions
  const addToCart = (item) => {
    if (item.is_available === false || item.isAvailable === false) {
      showToast('Out of Stock ⚠️', `${item.name || 'This item'} is currently out of stock.`, 'error');
      return;
    }
    setCart((prev) => {
      const existing = prev.find((x) => x.id === item.id);
      if (existing) {
        return prev.map((x) => (x.id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((x) => x.id !== itemId));
  };

  const updateQuantity = (itemId, delta) => {
    if (delta > 0) {
      const menuItem = liveMenuItems.find((m) => m.id === itemId || String(m.backendId) === String(itemId));
      if (menuItem && (menuItem.is_available === false || menuItem.isAvailable === false)) {
        showToast('Out of Stock ⚠️', `${menuItem.name || 'This item'} is currently out of stock.`, 'error');
        return;
      }
    }
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

  const clearCart = () => {
    setCart([]);
    try {
      localStorage.removeItem(STORAGE_KEY_CART);
    } catch (e) {}
  };

  const cartTotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * item.quantity, 0);
  const cartMrpTotal = cart.reduce((sum, item) => {
    const unitMrp = Number(item.mrp) || Number(item.originalPrice) || Number(item.price) || 0;
    return sum + unitMrp * item.quantity;
  }, 0);
  const cartDiscountTotal = Math.max(0, cartMrpTotal - cartTotal);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Address Helper Actions
  const addAddress = (addr) => {
    const newAddr = {
      id: 'addr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      studentName: (addr.studentName || student?.name || 'Student').trim(),
      schoolName: (addr.schoolName || student?.schoolName || 'School Canteen').trim(),
      className: (addr.className || '10').replace('Class ', '').trim(),
      section: (addr.section || 'A').toUpperCase().trim(),
      rollNo: (addr.rollNo || '1').toString().trim()
    };
    setAddresses((prev) => [newAddr, ...prev]);
    setSelectedAddressId(newAddr.id);
    showToast('Address Added 📍', `Added address for ${newAddr.studentName}.`);
    return newAddr;
  };

  const updateAddress = (id, updatedFields) => {
    setAddresses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updatedFields } : a))
    );
    showToast('Address Updated ✏️', 'Delivery address details updated successfully.');
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => {
      const remaining = prev.filter((a) => a.id !== id);
      if (selectedAddressId === id && remaining.length > 0) {
        setSelectedAddressId(remaining[0].id);
      }
      return remaining;
    });
    showToast('Address Removed', 'The address has been removed.');
  };

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
          name: 'Mapstreak',
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
  const placePreOrder = async (overrideAddress = null) => {
    if (cart.length === 0) return false;

    // Check if any cart item is out of stock
    const outOfStockItem = cart.find((c) => {
      const menuItem = liveMenuItems.find((m) => m.id === c.id || String(m.backendId) === String(c.backendId || c.id));
      return menuItem ? (menuItem.is_available === false || menuItem.isAvailable === false) : (c.is_available === false || c.isAvailable === false);
    });
    if (outOfStockItem) {
      showToast('Item Unavailable ⚠️', `"${outOfStockItem.name}" is out of stock. Please remove it from cart.`, 'error');
      return false;
    }

    if (cartTotal >= 5000) {
      showToast('Cart Limit Exceeded ⚠️', 'Cart value exceeds limit. You can only place orders less than ₹5000.', 'error');
      return false;
    }

    if (walletBalance < cartTotal) {
      showToast('Insufficient Wallet Balance ⚠️', `Please top up ₹${cartTotal - walletBalance} to complete this order.`, 'error');
      setIsRechargeOpen(true);
      return false;
    }

    const currentAddr = overrideAddress || addresses.find((a) => a.id === selectedAddressId) || addresses[0] || {
      studentName: student?.name || 'Student',
      schoolName: student?.schoolName || 'School Canteen',
      className: (student?.className || '10').replace('Class ', '').trim(),
      section: student?.section || 'A',
      rollNo: student?.rollNo || '1'
    };

    const addressText = `School: ${currentAddr.schoolName || student?.schoolName || 'School Canteen'} | Class: ${currentAddr.className || ''} | Sec: ${currentAddr.section || ''} | Roll: ${currentAddr.rollNo || ''} | Name: ${currentAddr.studentName || student?.name || ''}`;

    const orderTotal = cartTotal;
    let orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const tokenNo = `TK-${Math.floor(10 + Math.random() * 90)}`;

    // If backend is live or user is logged in, send real HTTP POST /api/v1/orders
    if (isBackendConnected || getStoredToken()) {
      try {
        const orderPayload = {
          product_details: JSON.stringify(cart.map((c) => ({
            id: c.backendId || c.id,
            backendId: c.backendId || c.id,
            name: c.name,
            price: c.price,
            quantity: c.quantity
          }))),
          total_amount: orderTotal,
          user_address: addressText,
          note: addressText,
          delivery_address: currentAddr,
          payment_status: 'paid'
        };

        const res = await apiStoreOrder(orderPayload);
        if (res.ok) {
          const backendId = res.data?.id || res.data?.order_id || res.data?.data?.id;
          if (backendId) {
            orderId = backendId;
          }
          // Immediate live refresh from backend
          await syncLiveStatus(true);
        } else {
          const errorMsg =
            res.data?.data?.[0]?.message ||
            res.data?.message ||
            res.error ||
            'Server could not process your order. Please check wallet balance.';
          showToast('Order Failed ⚠️', errorMsg, 'error');
          return false;
        }
      } catch (err) {
        console.warn('Backend order store error:', err);
        showToast('Order Failed ⚠️', err.message || 'Could not connect to backend server.', 'error');
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
      pickupNote: `${currentAddr.studentName} (${currentAddr.schoolName || student?.schoolName || 'School Canteen'}, Class ${currentAddr.className}-${currentAddr.section}, Roll #${currentAddr.rollNo})`,
      deliveryAddress: currentAddr,
      note: addressText,
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

    showToast('Order Placed Successfully! 🎉', `Token ${tokenNo} created for ${preOrderDateLabel}. Deducted ₹${orderTotal} from Wallet.`);
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
      return { success: false, message: 'Student not logged in. Cannot deduct wallet for other students from the frontend.' };
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
        } else {
          const profile = res.data.student || res.data.profile || res.data.user || {};
          const resolvedSchoolId = profile.school_id !== undefined ? profile.school_id : (profile.city_id || 1);
          const resolvedSchoolName = profile.school_name || profile.school?.name || 'School Canteen';
          const stu = {
            id: profile.id,
            uniqueId: profile.unique_id || `STU-${(profile.class || profile.class_name || '10').replace('Class ', '')}${profile.section || 'A'}-${profile.roll || profile.roll_no || '1'}`,
            phone: profile.phone || tempPhone,
            name: profile.name || 'Student',
            schoolId: resolvedSchoolId,
            schoolName: resolvedSchoolName,
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
          // ── Clear previous user's data so orders/cart never bleed between sessions ──
          setCart([]);
          setOrders([]);
          setTransactions([]);
          localStorage.removeItem(STORAGE_KEY_ORDERS);
          localStorage.removeItem(STORAGE_KEY_WALLET);
          localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
          localStorage.removeItem(STORAGE_KEY_CART);
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
        school_id: profileData.schoolId || profileData.school_id || 1,
        city_id: profileData.schoolId || profileData.school_id || 1,
        class_name: profileData.className,
        section: profileData.section,
        roll_no: profileData.rollNo
      });

      const uniqueId = `STU-${profileData.className.replace('Class ', '')}${profileData.section}-${profileData.rollNo}`;
      const newStudent = {
        uniqueId,
        phone: tempPhone,
        name: profileData.name,
        schoolId: profileData.schoolId || profileData.school_id || 1,
        schoolName: profileData.schoolName || profileData.school_name || 'School Canteen',
        className: profileData.className,
        section: profileData.section,
        rollNo: profileData.rollNo,
        avatar: profileData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name || 'User')}&background=f3f4f6&color=9ca3af&size=200`,
        walletBalance: res.ok && res.data?.user?.wallet !== undefined ? Number(res.data.user.wallet) : 0,
        parentContact: `+91 ${tempPhone}`
      };

      if (res.ok) {
        setStudent(newStudent);
        setWalletBalance(newStudent.walletBalance);
        setAuthStep('authenticated');

        confetti({
          particleCount: 60,
          spread: 60,
          colors: ['#4e8d5a', '#cca95f']
        });

        await syncBackendData();
        return true;
      } else {
        const errMsg = res.data?.message || res.error || 'Failed to save profile. Please try again.';
        showToast('Profile Setup Failed', errMsg, 'error');
        return false;
      }
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
      setOrders([]);
      setTransactions([]);
      setWalletBalance(0);
      clearStoredToken();
      localStorage.removeItem(STORAGE_KEY_STUDENT);
      localStorage.removeItem(STORAGE_KEY_ADMIN);
      localStorage.removeItem(STORAGE_KEY_ORDERS);
      localStorage.removeItem(STORAGE_KEY_WALLET);
      localStorage.removeItem(STORAGE_KEY_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY_CART);
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
        backendSchools,
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
        cartMrpTotal,
        cartDiscountTotal,
        cartItemCount,
        isCartOpen,
        setIsCartOpen,
        placePreOrder,

        // Multi-Address Management
        addresses,
        setAddresses,
        selectedAddressId,
        setSelectedAddressId,
        addAddress,
        updateAddress,
        deleteAddress,

        // Orders
        orders,
        isStudentIdModalOpen,
        setIsStudentIdModalOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isOrderHistoryOpen,
        setIsOrderHistoryOpen,

        // Canteen Staff Terminal
        isStaffTerminalOpen,
        setIsStaffTerminalOpen,
        staffDeductStudentWallet,
        staffMarkOrderCollected,

        // UI & Banners
        banner,
        setBanner,
        refreshBanner,
        activeTab,
        setActiveTab,
        isServerSettingsOpen,
        setIsServerSettingsOpen,
        notification,
        showToast,
        dismissToast,
        darkMode,
        toggleDarkMode,
        setDarkMode
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export default CanteenProvider;
