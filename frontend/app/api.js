// API utility functions for connecting to backend

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Handle API errors
const handleApiError = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const errorData = await response.json();
    throw new Error(errorData.message || "API error occurred");
  } else {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
  
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    console.log(`📥 API Response: ${response.status} ${response.statusText} for ${url}`);
    
    if (!response.ok) {
      await handleApiError(response);
    }
    
    return response.json();
  } catch (error) {
    console.error(`❌ API Request failed for ${url}:`, error);
    throw error;
  }
};

// Login API function
export const loginAPI = {
  // Validate voter ID
  validateVoterId: async (voterId) => {
    return apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({ voterId }),
    });
  }
};

// Vote Bank API functions
export const voteBankAPI = {
  // Get all votes (vote bank) for an election
  getVoteBank: async (electionId) => apiRequest(`/elections/${electionId}/votes`),
  
  // Verify a specific vote
  verifyVote: async (electionId, voterId) => apiRequest(`/elections/${electionId}/votes/verify/${voterId}`),
  
  // Get vote statistics
  getVoteStats: async (electionId) => apiRequest(`/elections/${electionId}/votes/stats`),
};

// Election API functions
export const electionAPI = {
  // Get eligible elections for a user
  getEligibleElections: async (userId) => {
    // We need to get the voter ID from localStorage to determine eligibility
    const voterId = localStorage.getItem("voterId") || "VC2563YOZE2"; // fallback to a sample voter ID
    
    // Decode voter ID to get location information
    // In a real implementation, this would be done on the backend
    const state = "Delhi"; // fallback to a sample state
    
    return apiRequest("/elections/eligible", {
      method: "POST",
      body: JSON.stringify({ voterId, state }),
    });
  },
  
  // Get candidates for an election
  getCandidates: async (electionId) => {
    return apiRequest(`/elections/${electionId}/candidates`);
  },
  
  // Get election results
  getResults: async (electionId) => {
    return apiRequest(`/elections/${electionId}/results`);
  }
};

// Vote API functions
export const voteAPI = {
  // Cast a vote
  castVote: async (voteData) => {
    return apiRequest("/vote", {
      method: "POST",
      body: JSON.stringify(voteData),
    });
  }
};

// KYC API functions
export const kycAPI = {
  // Get KYC status
  getStatus: async (voterId) => {
    return apiRequest(`/kyc/status/${voterId}`);
  }
};

// Profile API functions
export const profileAPI = {
  // Get user profile
  getProfile: async (voterId) => {
    return apiRequest(`/profile/${voterId}`);
  }
};

// Voting History API functions
export const votingHistoryAPI = {
  // Get user's voting history
  getVotingHistory: async (voterId) => {
    return apiRequest(`/voters/${voterId}/history`);
  }
};

// Admin API functions
export const adminAPI = {
  // Create a new election
  createElection: async (electionData) => {
    return apiRequest("/admin/elections", {
      method: "POST",
      body: JSON.stringify(electionData),
    });
  },
  
  // Get all elections
  getElections: async () => {
    return apiRequest("/admin/elections");
  },
  
  // Register a new admin
  register: async (adminData) => {
    return apiRequest("/admin/register", {
      method: "POST",
      body: JSON.stringify(adminData),
    });
  },
  
  // Add candidate to election
  addCandidate: async (electionId, candidateData) => {
    return apiRequest(`/admin/elections/${electionId}/candidates`, {
      method: "POST",
      body: JSON.stringify(candidateData),
    });
  },
  
  // Remove candidate from election
  removeCandidate: async (electionId, candidateId) => {
    return apiRequest(`/admin/elections/${electionId}/candidates/${candidateId}`, {
      method: "DELETE",
    });
  },
  
  // End election
  endElection: async (electionId) => {
    return apiRequest(`/admin/elections/${electionId}/end`, {
      method: "POST",
    });
  }
};

// Registration API functions
export const registerAPI = {
  // Save personal details
  savePersonalDetails: async (userData) => {
    return apiRequest("/register/personal", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  // Save Aadhaar details (includes address proof)
  saveAadhaarDetails: async (aadhaarData) => {
    return apiRequest("/register/aadhaar", {
      method: "POST",
      body: JSON.stringify(aadhaarData),
    });
  },

  // Save face verification details
  saveFaceDetails: async (faceData) => {
    return apiRequest("/register/face", {
      method: "POST",
      body: JSON.stringify(faceData),
    });
  },
};

export default { loginAPI, electionAPI, voteAPI, kycAPI, profileAPI, adminAPI, registerAPI, votingHistoryAPI };