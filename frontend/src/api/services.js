import apiClient from './client';

export const AuthService = {
  loginInit: async (email, password, role = 'customer') => {
    const response = await apiClient.post('/auth/login-init/', { email, password, role });
    return response.data;
  },

  registerInit: async (userData) => {
    const response = await apiClient.post('/auth/register-init/', userData);
    return response.data;
  },

  verifyOTP: async (sessionToken, otpCode) => {
    const response = await apiClient.post('/auth/verify-otp/', {
      session_token: sessionToken,
      otp_code: otpCode,
    });
    return response.data;
  },

  resendOTP: async (sessionToken) => {
    const response = await apiClient.post('/auth/resend-otp/', {
      session_token: sessionToken,
    });
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login/', { email, password });
    return response.data;
  },

  adminLogin: async (email, password) => {
    const response = await apiClient.post('/auth/admin-login/', { email, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register/', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await apiClient.put('/auth/profile/', userData);
    return response.data;
  },
};

export const CategoryService = {
  getAll: async () => {
    const response = await apiClient.get('/categories/');
    return response.data;
  },

  create: async (categoryData) => {
    const response = await apiClient.post('/categories/', categoryData);
    return response.data;
  },

  update: async (id, categoryData) => {
    const response = await apiClient.put(`/categories/${id}/`, categoryData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/categories/${id}/`);
    return response.data;
  },
};

export const ProductService = {
  getAll: async (params = {}) => {
    const response = await apiClient.get('/products/', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/products/${id}/`);
    return response.data;
  },

  create: async (productData) => {
    const response = await apiClient.post('/products/', productData);
    return response.data;
  },

  update: async (id, productData) => {
    const response = await apiClient.patch(`/products/${id}/`, productData);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/products/${id}/`);
    return response.data;
  },
};

export const CartService = {
  getCart: async () => {
    const response = await apiClient.get('/cart/');
    return response.data;
  },

  addItem: async (itemData) => {
    // { product_id, quantity, unit }
    const response = await apiClient.post('/cart/add/', itemData);
    return response.data;
  },

  updateItem: async (itemId, quantity) => {
    const response = await apiClient.put(`/cart/items/${itemId}/`, { quantity });
    return response.data;
  },

  removeItem: async (itemId) => {
    const response = await apiClient.delete(`/cart/items/${itemId}/`);
    return response.data;
  },

  clearCart: async () => {
    const response = await apiClient.post('/cart/clear/');
    return response.data;
  },
};

export const OrderService = {
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders/', orderData);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await apiClient.get('/orders/');
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await apiClient.get(`/orders/${id}/`);
    return response.data;
  },
};

export const AdminService = {
  getDashboardData: async () => {
    const response = await apiClient.get('/admin/dashboard/');
    return response.data;
  },

  getCustomers: async () => {
    const response = await apiClient.get('/admin/customers/');
    return response.data;
  },

  getAllOrders: async () => {
    const response = await apiClient.get('/orders/');
    return response.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.put(`/admin/orders/${orderId}/status/`, { status });
    return response.data;
  },

  quickUpdateProduct: async (productId, data) => {
    const response = await apiClient.put(`/admin/products/${productId}/quick-update/`, data);
    return response.data;
  },

  uploadImage: async (formData) => {
    const response = await apiClient.post('/admin/upload-image/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const PaymentService = {
  createPaymentOrder: async (orderId, paymentMethod = 'upi') => {
    const response = await apiClient.post('/payments/create-order/', {
      order_id: orderId,
      payment_method: paymentMethod,
    });
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await apiClient.post('/payments/verify/', verificationData);
    return response.data;
  },

  recordFailure: async (orderId, reason) => {
    const response = await apiClient.post('/payments/fail/', {
      order_id: orderId,
      reason,
    });
    return response.data;
  },
};

export const StoreService = {
  getSettings: async () => {
    const response = await apiClient.get('/store-settings/');
    return response.data;
  },

  updateSettings: async (settingsData) => {
    const response = await apiClient.put('/store-settings/', settingsData);
    return response.data;
  },
};

