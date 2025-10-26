import axios from 'axios';
import config from './config';

// Create API client for Apps Script
const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to handle errors
const handleError = (error) => {
  console.error('API Error:', error);
  if (error.response) {
    throw new Error(error.response.data?.error || 'API request failed');
  } else if (error.request) {
    throw new Error('Network error - please check your connection');
  } else {
    throw new Error(error.message);
  }
};

// Products API
export const getProducts = async () => {
  try {
    const response = await api.get('', {
      params: { action: 'getProducts' },
    });
    return response.data?.data || [];
  } catch (error) {
    handleError(error);
  }
};

export const getProduct = async (productId) => {
  try {
    const response = await api.get('', {
      params: { 
        action: 'getProduct',
        id: productId,
      },
    });
    return response.data?.data || null;
  } catch (error) {
    handleError(error);
  }
};

// Orders API
export const createOrder = async (orderData) => {
  try {
    const payload = JSON.stringify({
      action: 'createOrder',
      ...orderData,
    });
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
  }
};

export const getOrders = async (filters = {}) => {
  try {
    const params = new URLSearchParams({
      action: 'getOrders',
      ...filters,
    });
    
    const response = await api.get('', { params });
    return response.data?.data || [];
  } catch (error) {
    handleError(error);
  }
};

export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const payload = JSON.stringify({
      action: 'updateOrderStatus',
      orderId,
      status,
      token,
    });
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
  }
};

// Address API
export const getAddresses = async (level, parentId = '') => {
  try {
    // Cache in localStorage for offline support
    const cacheKey = `address_${level}_${parentId}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const data = JSON.parse(cached);
      const now = Date.now();
      // Cache for 24 hours
      if (now - data.timestamp < 86400000) {
        return data.data;
      }
    }

    const params = new URLSearchParams({
      action: 'getAddress',
      level,
    });
    
    if (parentId) {
      params.append('parentId', parentId);
    }

    const response = await api.get('', { params });
    const addressData = response.data?.data || [];

    // Cache the response
    if (addressData.length > 0) {
      localStorage.setItem(cacheKey, JSON.stringify({
        data: addressData,
        timestamp: Date.now(),
      }));
    }

    return addressData;
  } catch (error) {
    handleError(error);
  }
};

// J&T Booking API
export const triggerJtBooking = async (orderIds, token) => {
  try {
    const payload = JSON.stringify({
      action: 'triggerJtBooking',
      orderIds,
      token,
    });
    
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    handleError(error);
  }
};

export default api;