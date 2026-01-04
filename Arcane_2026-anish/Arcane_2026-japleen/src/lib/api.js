const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`; // Backend expects Bearer token
    }
    return headers;
};

export const api = {
    // Auth
    login: async (email, password) => {
        // Backend expects form data for OAuth2PasswordRequestForm
        const formData = new URLSearchParams();
        formData.append('username', email); // FastAPI OAuth2 expects 'username' field
        formData.append('password', password);

        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }
        return response.json();
    },

    signupOrganization: async (data) => {
        const response = await fetch(`${API_URL}/auth/signup/organization`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            let err = { detail: 'Signup failed' };
            try { err = await response.json(); } catch(e){}
            throw new Error(err.detail || err.message || 'Signup failed');
        }
        return response.json();
    },

    signupBuyer: async (data) => {
        const response = await fetch(`${API_URL}/auth/signup/buyer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            let err = { detail: 'Signup failed' };
            try { err = await response.json(); } catch(e){}
            throw new Error(err.detail || err.message || 'Signup failed');
        }
        return response.json();
    },

    // Profile
    getProfile: async () => {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            let err = { detail: 'Failed to fetch profile' };
            try { err = await response.json(); } catch(e){}
            throw new Error(err.detail || err.message || 'Failed to fetch profile');
        }
        return response.json();
    },

    updateProfile: async (data) => {
        const response = await fetch(`${API_URL}/auth/me`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            let err = { detail: 'Failed to update profile' };
            try { err = await response.json(); } catch(e){}
            throw new Error(err.detail || err.message || 'Failed to update profile');
        }
        return response.json();
    },

    // Materials
    getMaterials: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.city) queryParams.append('city', params.city);
        if (params.q) queryParams.append('q', params.q);
        if (params.industry) queryParams.append('industry', params.industry);
        if (params.skip) queryParams.append('skip', params.skip);
        if (params.limit) queryParams.append('limit', params.limit);
        
        const queryString = queryParams.toString();
        const url = queryString ? `${API_URL}/materials/?${queryString}` : `${API_URL}/materials/`;
        
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch materials');
        return response.json();
    },

    createMaterial: async (materialData) => {
        const response = await fetch(`${API_URL}/materials/`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(materialData),
        });
        if (!response.ok) throw new Error('Failed to create material');
        return response.json();
    },

    getMaterial: async (id) => {
        const response = await fetch(`${API_URL}/materials/${id}`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch material');
        return response.json();
    },


    // Requests
    createRequest: async (materialId, requestData) => {
        const response = await fetch(`${API_URL}/interactions/materials/${materialId}/request`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(requestData)
        });
        if (!response.ok) throw new Error('Failed to create request');
        return response.json();
    },

    viewRequests: async (materialId) => {
        const response = await fetch(`${API_URL}/interactions/org/materials/${materialId}/requests`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        return response.json();
    },

    getOrgRequests: async () => {
        const response = await fetch(`${API_URL}/interactions/org/requests`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch organization requests');
        return response.json();
    },

    updateRequestStatus: async (requestId, status) => {
        const response = await fetch(`${API_URL}/interactions/requests/${requestId}/status`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ status })
        });
        if (!response.ok) throw new Error('Failed to update status');
        return response.json();
    },

    // Feedback
    createFeedback: async (requestId, feedbackData) => {
        const response = await fetch(`${API_URL}/interactions/${requestId}/feedback`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(feedbackData)
        });
        if (!response.ok) throw new Error('Failed to submit feedback');
        return response.json();
    },

    getFeedback: async (requestId) => {
        const response = await fetch(`${API_URL}/interactions/${requestId}/feedback`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch feedback');
        return response.json();
    },

    getOrgFeedbacks: async () => {
        const response = await fetch(`${API_URL}/interactions/org/feedbacks`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch organization feedbacks');
        return response.json();
    }

};
