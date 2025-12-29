import axios from 'axios';

// API base URL - FIXED: removed the 'z' typo
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('🔧 API Base URL configured as:', API_BASE_URL); // Debug log

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to request headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
    } else {
      console.warn(`⚠️ No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // Log full URL for debugging
    console.log(`🌐 Making request to: ${config.baseURL}${config.url}`);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for better error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status}: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle specific errors
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - clearing token and redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Only redirect if we're not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    // Return a consistent error format
    return Promise.reject({
      message: error.response?.data?.error || error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

/**
 * Authentication API calls
 */
export const authAPI = {
  register: (username, email, password, fullName, dateOfBirth) => {
    console.log('📝 Registering user:', username);
    return apiClient.post('/auth/register', {
      username,
      email,
      password,
      full_name: fullName,
      date_of_birth: dateOfBirth
    });
  },

  login: (username, password) => {
    console.log('🔐 Logging in user:', username);
    return apiClient.post('/auth/login', { username, password });
  },

  getProfile: () => {
    console.log('👤 Getting user profile');
    return apiClient.get('/auth/profile');
  },

  updateProfile: (fullName, dateOfBirth) => {
    console.log('✏️ Updating profile:', { fullName, dateOfBirth });
    return apiClient.put('/auth/profile', {
      full_name: fullName,
      date_of_birth: dateOfBirth
    });
  }
};

/**
 * Reports API calls
 */
export const reportsAPI = {
  uploadReport: (file, reportType, reportDate, description) => {
    console.log('📄 Uploading report:', { 
      fileName: file.name, 
      reportType, 
      reportDate 
    });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', reportType);
    formData.append('report_date', reportDate);
    if (description) formData.append('description', description);

    return apiClient.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000 // 30 seconds for file uploads
    });
  },

  getReports: (reportType, fromDate, toDate) => {
    console.log('📋 Getting reports:', { reportType, fromDate, toDate });
    return apiClient.get('/reports', {
      params: {
        report_type: reportType,
        from_date: fromDate,
        to_date: toDate
      }
    });
  },

  getReport: (reportId) => {
    console.log('🔍 Getting report:', reportId);
    return apiClient.get(`/reports/${reportId}`);
  },

  updateReport: (reportId, reportType, reportDate, description) => {
    console.log('✏️ Updating report:', reportId);
    return apiClient.put(`/reports/${reportId}`, {
      report_type: reportType,
      report_date: reportDate,
      description
    });
  },

  deleteReport: (reportId) => {
    console.log('🗑️ Deleting report:', reportId);
    return apiClient.delete(`/reports/${reportId}`);
  },

  downloadReport: (reportId) => {
    console.log('⬇️ Downloading report:', reportId);
    return apiClient.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
      timeout: 30000
    });
  }
};

/**
 * Vitals API calls
 */
export const vitalsAPI = {
  addVital: (vitalType, value, unit, measuredAt, notes) => {
    console.log('📊 Adding vital:', { vitalType, value, unit });
    return apiClient.post('/vitals', {
      vital_type: vitalType,
      value,
      unit,
      measured_at: measuredAt,
      notes
    });
  },

  getVitals: (vitalType, fromDate, toDate) => {
    console.log('📈 Getting vitals:', { vitalType, fromDate, toDate });
    return apiClient.get('/vitals', {
      params: {
        vital_type: vitalType,
        from_date: fromDate,
        to_date: toDate
      }
    });
  },

  getVitalTypes: () => {
    console.log('📋 Getting vital types');
    return apiClient.get('/vitals/types');
  },

  getVitalSummary: (vitalType, days = 30) => {
    console.log('📊 Getting vital summary:', { vitalType, days });
    return apiClient.get(`/vitals/summary/${vitalType}`, {
      params: { days }
    });
  },

  deleteVital: (vitalId) => {
    console.log('🗑️ Deleting vital:', vitalId);
    return apiClient.delete(`/vitals/${vitalId}`);
  }
};

/**
 * Sharing API calls
 */
export const sharesAPI = {
  shareReport: (reportId, sharedWithUsername, accessLevel = 'viewer', expiresAt) => {
    console.log('🤝 Sharing report:', { 
      reportId, 
      sharedWithUsername, 
      accessLevel 
    });
    return apiClient.post(`/shares/reports/${reportId}/share`, {
      shared_with_username: sharedWithUsername,
      access_level: accessLevel,
      expires_at: expiresAt
    });
  },

  getSharedWithMe: () => {
    console.log('📨 Getting shared reports with me');
    return apiClient.get('/shares/shared-with-me');
  },

  getReportShares: (reportId) => {
    console.log('👥 Getting report shares:', reportId);
    return apiClient.get(`/shares/reports/${reportId}/shares`);
  },

  revokeShare: (reportId, shareId) => {
    console.log('🚫 Revoking share:', { reportId, shareId });
    return apiClient.delete(`/shares/reports/${reportId}/shares/${shareId}`);
  },

  updateShareAccess: (reportId, shareId, accessLevel) => {
    console.log('⚙️ Updating share access:', { reportId, shareId, accessLevel });
    return apiClient.put(`/shares/reports/${reportId}/shares/${shareId}`, {
      access_level: accessLevel
    });
  }
};

// Helper function to check API connection
export const checkAPIConnection = async () => {
  try {
    console.log('🔌 Checking API connection...');
    const response = await apiClient.get('/health');
    console.log('✅ API Connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ API Connection failed:', error);
    return { success: false, error };
  }
};

// Test the configuration on import
console.log('🚀 API Client initialized');
console.log('🌐 Base URL:', API_BASE_URL);
console.log('📁 Endpoints available:');
console.log('   - Auth: /auth/register, /auth/login, /auth/profile');
console.log('   - Reports: /reports/*');
console.log('   - Vitals: /vitals/*');
console.log('   - Shares: /shares/*');

export default apiClient;