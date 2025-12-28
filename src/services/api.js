export const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");


// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
};

export const employeeAPI = {
  getAll: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/employee/all-employees`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  delete: async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/employees/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
};

export const settingsAPI = {
  getSettings: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  updateSettings: async (settings) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
};

export const dashboardAPI = {
  getTopPerformers: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/top-performers`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  },
  getAllAttendanceHistory: async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/admin/attendance-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, keep default statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }
    return response.json();
  }
};
