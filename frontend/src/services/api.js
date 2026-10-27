/**
 * CloudTrack™ API Client Service
 * Directly interfaces with Express REST API endpoints using standard fetch().
 * Does NOT rely on hardcoded shipment data as final source.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper for HTTP requests with authorization and error parsing
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errorMsg =
        data.message ||
        data.error ||
        `Request failed with HTTP status ${res.status} (${res.statusText})`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        `Unable to connect to backend server at ${API_BASE_URL}. Please ensure the Node/Express server is running on port 5000.`
      );
    }
    throw error;
  }
};

export const api = {
  // Authentication Endpoints
  async register(userData) {
    return await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile() {
    return await request('/auth/profile', {
      method: 'GET',
    });
  },

  async updateProfile(profileData) {
    return await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Public Tracking Endpoint
  async trackParcel(trackingNumber) {
    const cleanNum = encodeURIComponent(trackingNumber.trim().toUpperCase());
    return await request(`/tracking/${cleanNum}`, {
      method: 'GET',
    });
  },

  async addTrackingCheckpoint(trackingNumber, checkpointData) {
    const cleanNum = encodeURIComponent(trackingNumber.trim().toUpperCase());
    return await request(`/tracking/${cleanNum}/checkpoint`, {
      method: 'POST',
      body: JSON.stringify(checkpointData),
    });
  },

  // Shipments Management Endpoints
  async getAllShipments(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') {
      query.append('status', params.status);
    }
    if (params.search) {
      query.append('search', params.search);
    }
    if (params.bookingDate) {
      query.append('bookingDate', params.bookingDate);
    }
    if (params.startDate) {
      query.append('startDate', params.startDate);
    }
    if (params.endDate) {
      query.append('endDate', params.endDate);
    }
    if (params.page) {
      query.append('page', params.page);
    }
    if (params.limit) {
      query.append('limit', params.limit);
    }

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return await request(`/shipments${queryString}`, {
      method: 'GET',
    });
  },

  async getShipmentById(id) {
    const cleanId = encodeURIComponent(id.trim());
    return await request(`/shipments/${cleanId}`, {
      method: 'GET',
    });
  },

  async createShipment(shipmentData) {
    return await request('/shipments', {
      method: 'POST',
      body: JSON.stringify(shipmentData),
    });
  },

  async updateShipmentStatus(id, statusUpdateData) {
    const cleanId = encodeURIComponent(id.trim());
    return await request(`/shipments/${cleanId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusUpdateData),
    });
  },

  async updateShipment(id, shipmentData) {
    const cleanId = encodeURIComponent(id.trim());
    return await request(`/shipments/${cleanId}`, {
      method: 'PUT',
      body: JSON.stringify(shipmentData),
    });
  },

  async deleteShipment(id) {
    const cleanId = encodeURIComponent(id.trim());
    return await request(`/shipments/${cleanId}`, {
      method: 'DELETE',
    });
  },

  async getDashboardStats() {
    return await request('/shipments/stats/summary', {
      method: 'GET',
    });
  },

  async getShipmentReports(params = {}) {
    const query = new URLSearchParams();
    if (params.startDate) query.append('startDate', params.startDate);
    if (params.endDate) query.append('endDate', params.endDate);
    if (params.status && params.status !== 'All') query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return await request(`/shipments/reports/analytics${qs}`, {
      method: 'GET',
    });
  },
};
