import config from "../config";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  // Handle 401 Unauthorized
  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
    throw new Error("Session expired. Please login again.");
  }
  
  return { response, data };
};

// ==================== USER APIs ====================

export const userAPI = {
  // Login user
  login: async (email, password) => {
    const response = await fetch(`${config.API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(response);
  },

  // Get all users (Admin only)
  getAllUsers: async () => {
    const response = await fetch(`${config.API_BASE_URL}/user`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new user (Admin only)
  createUser: async (userData) => {
    const response = await fetch(`${config.API_BASE_URL}/user`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // Delete user (Admin only)
  deleteUser: async (userId) => {
    const response = await fetch(`${config.API_BASE_URL}/user/${userId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Toggle admin status (Admin only)
  toggleAdmin: async (userId) => {
    const response = await fetch(
      `${config.API_BASE_URL}/user/${userId}/toggle-admin`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },
};

// ==================== SCENARIO APIs ====================

export const scenarioAPI = {
  // Get all scenarios
  getAllScenarios: async () => {
    const response = await fetch(`${config.API_BASE_URL}/scenario`, {
      method: "GET",
      credentials: "include",
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get single scenario by ID
  getScenarioById: async (scenarioId) => {
    const response = await fetch(
      `${config.API_BASE_URL}/scenario/${scenarioId}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Create new scenario
  createScenario: async (scenarioData) => {
    const response = await fetch(`${config.API_BASE_URL}/scenario`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(scenarioData),
    });
    return handleResponse(response);
  },

  // Update scenario
  updateScenario: async (scenarioId, scenarioData) => {
    const response = await fetch(
      `${config.API_BASE_URL}/scenario/${scenarioId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(scenarioData),
      }
    );
    return handleResponse(response);
  },

  // Delete scenario
  deleteScenario: async (scenarioId) => {
    const response = await fetch(
      `${config.API_BASE_URL}/scenario/${scenarioId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Download video
  downloadVideo: async (scenarioId) => {
    const response = await fetch(
      `${config.API_BASE_URL}/scenario/${scenarioId}/video/download`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Download failed");
    }

    return response.blob();
  },
};

// ==================== HELPER FUNCTIONS ====================

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Get current user data
export const getCurrentUser = () => {
  const userData = localStorage.getItem("user");
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  }
  return null;
};

// Logout user
export const logout = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  localStorage.removeItem("scenarios");
  window.location.href = "/";
};
