const API_BASE_URL = (import.meta.env.VITE_API_URL || "https://express-api-eight-brown.vercel.app").replace(/\/$/, "");


// Auth API calls
export const authAPI = {
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
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
