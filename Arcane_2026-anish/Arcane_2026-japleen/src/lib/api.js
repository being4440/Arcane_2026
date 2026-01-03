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
        if (!response.ok) throw new Error('Signup failed');
        return response.json();
    },

    signupBuyer: async (data) => {
        const response = await fetch(`${API_URL}/auth/signup/buyer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Signup failed');
        return response.json();
    },

    // Materials
    getMaterials: async () => {
        const response = await fetch(`${API_URL}/materials/`, {
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
    }

};
