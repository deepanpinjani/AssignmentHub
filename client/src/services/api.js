const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Universal helper for API calls with token injection & response parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('assignmenthub_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to parse server response.',
    }));

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw new Error('Unable to connect to server. Please check your network connection.');
  }
};

export const apiService = {
  // Authentication
  adminRegister: (data) =>
    request('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminLogin: (data) =>
    request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  studentRegister: (data) =>
    request('/auth/student/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  studentLogin: (data) =>
    request('/auth/student/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request('/auth/me'),

  // Assignments
  createAssignment: (data) =>
    request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getAssignments: () => request('/assignments'),

  getAssignmentById: (id) => request(`/assignments/${id}`),

  // Submissions
  createSubmission: (data) =>
    request('/submissions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSubmissionsForAssignment: (assignmentId) =>
    request(`/submissions/assignment/${assignmentId}`),

  reviewSubmission: (submissionId, data) =>
    request(`/submissions/${submissionId}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getMySubmissions: () => request('/submissions/my'),
};

export default apiService;
