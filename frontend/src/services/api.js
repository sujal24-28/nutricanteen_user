const TOKEN_KEY = 'nutricanteen_token';
const HOST_KEY = 'nutricanteen_host_v2';
export const PUBLIC_TUNNEL_HOST = (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '');
const NATIVE_API_BASE = (import.meta.env.VITE_NATIVE_API_BASE_URL || PUBLIC_TUNNEL_HOST).replace(/\/$/, '');

const isNativeApp = () => {
  return typeof window !== 'undefined' && window.Capacitor && window.Capacitor.isNativePlatform();
};

const getCandidateHosts = () => {
  const hosts = [];
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(HOST_KEY);
    if (saved) hosts.push(saved);
  }

  hosts.push(isNativeApp() ? NATIVE_API_BASE : PUBLIC_TUNNEL_HOST);

  // Local fallbacks are retained for emulator/local development, but each
  // request now has a short timeout so a dead host does not stall the UI.
  hosts.push('http://10.0.2.2:5000/api/v1');
  hosts.push('http://127.0.0.1:5000/api/v1');
  hosts.push('http://localhost:5000/api/v1');

  return Array.from(new Set(hosts));
};

export const getApiBase = () => {
  if (typeof window !== 'undefined') {
    const customHost = localStorage.getItem(HOST_KEY);
    if (customHost) return customHost;

    if (isNativeApp()) {
      return NATIVE_API_BASE;
    }

    return PUBLIC_TUNNEL_HOST
  }

  return PUBLIC_TUNNEL_HOST;
};

export const saveCustomHost = (hostUrl) => {
  if (!hostUrl) return null;
  let clean = hostUrl.trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1') && !clean.includes('/api/v1/')) {
    clean = `${clean}/api/v1`;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem(HOST_KEY, clean);
  }
  return clean;
};

export const getStoredCustomHost = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(HOST_KEY) || PUBLIC_TUNNEL_HOST;
  }
  return PUBLIC_TUNNEL_HOST;
};

export const getServerUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const base = getApiBase().replace(/\/api\/v1\/?$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
};

export const testHostConnection = async (hostUrl) => {
  let clean = (hostUrl || PUBLIC_TUNNEL_HOST).trim().replace(/\/+$/, '');
  if (!clean.endsWith('/api/v1') && !clean.includes('/api/v1/')) {
    clean = `${clean}/api/v1`;
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  const url = `${clean}/menu`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return false;
    }
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const getStoredToken = () => {
  return localStorage.getItem(TOKEN_KEY) || null;
};

export const setStoredToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

const getHeaders = (isAuth = false) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  };

  if (isAuth) {
    const token = getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const safeFetch = async (endpoint, options = {}, isAuth = false) => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const requestHeaders = {
    ...getHeaders(isAuth),
    ...(options.headers || {})
  };

  // If using FormData, let the browser set the Content-Type automatically (with boundary)
  if (options.body instanceof FormData) {
    delete requestHeaders['Content-Type'];
  }

  const candidates = getCandidateHosts();
  let lastError = null;

  for (const base of candidates) {
    const url = `${base}${cleanEndpoint}`;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(url, {
        ...options,
        headers: requestHeaders,
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res) {
        if (res.status === 401 && isAuth) {
           localStorage.removeItem(TOKEN_KEY);
           localStorage.removeItem('nutricanteen_admin_v2');
           localStorage.removeItem('nutricanteen_student_v2');
           window.dispatchEvent(new Event('auth:expired'));
           return res;
        }

        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('text/html')) {
          lastError = new Error(`Server at ${base} returned HTML instead of JSON API response.`);
          continue;
        }

        if (
          typeof window !== 'undefined' &&
          base.startsWith('http') &&
          !base.includes('localhost') &&
          !base.includes('127.0.0.1')
        ) {
          localStorage.setItem(HOST_KEY, base);
        }
        return res;
      }
    } catch (err) {
      lastError = err;
    }
  }

  const primaryBase = getApiBase();
  throw new Error(`Cannot connect to backend server at ${primaryBase}. Check server settings.`);
};

const safeJson = async (res) => {
  try {
    const json = await res.json();
    if (json.success !== undefined && json.data) {
        return { ...json, ...json.data };
    }
    return json;
  } catch (e) {
    return { success: false, message: 'Invalid response format from server.' };
  }
};

export const checkBackendHealth = async () => {
  try {
    const base = getApiBase().replace(/\\/api\\/v1\\/?$/, '');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(base ? `${base}/health` : '/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Bypass-Tunnel-Reminder': 'true'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return res.ok;
  } catch (err) {
    return false;
  }
};

export const apiRegister = async (payload) => {
  try {
    const res = await safeFetch('/auth/student/register', { 
      method: 'POST', 
      body: JSON.stringify(payload)
    }, false);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiCheckUser = async (phone) => {
  try {
    const res = await safeFetch('/auth/check-user', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }, false);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};



export const apiSendOtp = async (phone) => {
  try {
    const res = await safeFetch('/auth/student/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone })
    }, false);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiVerifyOtp = async (phone, otp) => {
  try {
    const res = await safeFetch('/auth/student/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp })
    }, false);
    const data = await safeJson(res);
    if (res.ok && data.accessToken) {
      setStoredToken(data.accessToken);
    } else if (res.ok && data.token) {
      setStoredToken(data.token);
    }
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiGetProfile = async () => {
  try {
    const res = await safeFetch('/student/profile', { method: 'GET' }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiGetWallet = async () => {
  try {
    const res = await safeFetch('/wallet', { method: 'GET' }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiGetOrderList = async () => {
  try {
    const res = await safeFetch('/orders', { method: 'GET' }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiGetCities = async () => {
  return { ok: true, data: [] };
};

export const apiGetCategories = async () => {
  return { ok: true, data: [] };
};

export const apiGetAllProducts = async () => {
  try {
    const res = await safeFetch('/menu?limit=100', { method: 'GET' }, true);
    const json = await safeJson(res);
    // Our Node backend wraps responses in { success: true, data: { items: [...] } }
    let items = [];
    if (json.data && Array.isArray(json.data.items)) {
      items = json.data.items;
    } else if (Array.isArray(json.data)) {
      items = json.data;
    } else if (Array.isArray(json.items)) {
      items = json.items;
    } else if (Array.isArray(json)) {
      items = json;
    }
    return { ok: res.ok, data: items };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiStoreOrder = async (orderPayload) => {
  try {
    let items = [];
    try {
      const products = JSON.parse(orderPayload.product_details || '[]');
      items = products.map(p => ({ menu_item_id: p.backendId || p.id, quantity: p.quantity }));
    } catch(e) {}
    
    // 1. Clear cart
    await safeFetch('/cart', { method: 'DELETE' }, true);
    
    // 2. Add each item to backend cart
    for (const item of items) {
      if (item.menu_item_id) {
        await safeFetch('/cart', {
          method: 'POST',
          body: JSON.stringify({ item_id: item.menu_item_id, quantity: item.quantity })
        }, true);
      }
    }
    
    // 3. Place order
    const nodePayload = {
      note: 'Pre-order via Canteen App',
      pickupTime: new Date(Date.now() + 3600000).toISOString() // 1 hour from now as fallback
    };

    const res = await safeFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(nodePayload)
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiCompleteProfile = async (profileData) => {
  try {
    const res = await safeFetch('/student/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    }, true);
    
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiCreateTopupOrder = async (amount) => {
  try {
    const res = await safeFetch('/wallet/topup/order', {
      method: 'POST',
      body: JSON.stringify({ amount })
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiVerifyTopupPayment = async (payload) => {
  try {
    const res = await safeFetch('/wallet/topup/verify', {
      method: 'POST',
      body: JSON.stringify(payload)
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

// --- ADMIN API ENDPOINTS ---
export const apiAdminLogin = async (identifier, password) => {
  try {
    const res = await safeFetch('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }, false);
    const data = await safeJson(res);
    if (res.ok && data.accessToken) {
      setStoredToken(data.accessToken);
    }
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiGetAdminDashboard = async () => {
  try {
    const res = await safeFetch('/admin/dashboard', { method: 'GET' }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiAdminListStudents = async () => {
  try {
    const res = await safeFetch('/admin/students', { method: 'GET' }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiAdminDebitWallet = async (studentId, amount, description) => {
  try {
    const res = await safeFetch(`/admin/students/${studentId}/debit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description })
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiAdminCreditWallet = async (studentId, amount, description) => {
  try {
    const res = await safeFetch(`/admin/students/${studentId}/credit`, {
      method: 'POST',
      body: JSON.stringify({ amount, description })
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiAdminCreateMenuItem = async (formData) => {
  try {
    const res = await safeFetch('/menu', {
      method: 'POST',
      body: formData
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};

export const apiAdminUpdateOrderStatus = async (orderId, status) => {
  try {
    const res = await safeFetch(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    }, true);
    const data = await safeJson(res);
    return { ok: res.ok, data };
  } catch (err) {
    return { ok: false, error: err.message };
  }
};
