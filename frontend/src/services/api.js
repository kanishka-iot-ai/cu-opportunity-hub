// API Client for CU Opportunity Hub
const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/$/, '') + '/api' : '/api');

export const getAuthToken = () => localStorage.getItem('cu_auth_token');
export const setAuthToken = (token) => {
  if (token) localStorage.setItem('cu_auth_token', token);
  else localStorage.removeItem('cu_auth_token');
};

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && token) {
      // Token expired or invalid
      setAuthToken(null);
      window.dispatchEvent(new Event('cu-auth-expired'));
    }
    const err = new Error(data.error || data.message || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  // Auth
  login: (identifier, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }),
  register: (payload) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getMe: () => request('/auth/me'),
  updateProfile: (profileData) => request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  }),

  // Opportunities
  getOpportunities: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    return request(`/opportunities?${qs.toString()}`);
  },
  getOpportunity: (id) => request(`/opportunities/${id}`),
  toggleSaveOpportunity: (id) => request(`/opportunities/${id}/save`, { method: 'POST' }),
  getSavedOpportunities: () => request('/opportunities/saved'),
  getCategories: () => request('/opportunities/meta/categories'),
  getDepartments: () => request('/opportunities/meta/departments'),
  getSkills: () => request('/opportunities/meta/skills'),

  // Applications
  getApplications: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.append(k, v);
    });
    return request(`/applications?${qs.toString()}`);
  },
  createOrUpdateApplication: (payload) => request('/applications', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateApplication: (id, payload) => request(`/applications/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),

  // Recommendations
  getRecommendations: (filter = 'all') => request(`/recommendations?filter=${filter}`),

  // Notifications & Reminders
  getNotifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request('/notifications/read-all', { method: 'PUT' }),
  triggerDeadlineScan: () => request('/notifications/trigger-deadline-scan', { method: 'POST' }),

  getReminders: () => request('/notifications/reminders'),
  createReminder: (payload) => request('/notifications/reminders', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  toggleReminder: (id) => request(`/notifications/reminders/${id}/toggle`, { method: 'PUT' }),
  deleteReminder: (id) => request(`/notifications/reminders/${id}`, { method: 'DELETE' }),

  // Faculty & Announcements
  getFacultyDashboard: () => request('/faculty/dashboard'),
  getAnnouncements: (departmentId) => {
    const qs = departmentId ? `?department_id=${departmentId}` : '';
    return request(`/faculty/announcements${qs}`);
  },
  postAnnouncement: (payload) => request('/faculty/announcements', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Admin
  getAdminStats: () => request('/admin/stats'),
  getAdminOpportunities: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/opportunities?${qs}`);
  },
  createOpportunity: (payload) => request('/admin/opportunities', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateOpportunity: (id, payload) => request(`/admin/opportunities/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  verifyOpportunity: (id, status) => request(`/admin/opportunities/${id}/verify`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),
  deleteOpportunity: (id) => request(`/admin/opportunities/${id}`, { method: 'DELETE' }),
  getAdminUsers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/admin/users?${qs}`);
  },
  toggleUserStatus: (id) => request(`/admin/users/${id}/toggle-status`, { method: 'PUT' }),
  getAuditLogs: () => request('/admin/audit-logs')
};
