import { create } from 'zustand';
import api, { setAuthStore } from '../services/api';
import { useToast } from './toast';
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'host' | 'partner' | 'admin' | 'guest';
    business_name?: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: { email: string; password: string }) => Promise<void>;
    register: (data: {
        name: string;
        email: string;
        password: string;
        password_confirmation: string;
        role: string;
        business_name?: string;
        phone?: string;
    }) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
    refreshAccessToken: () => Promise<string | null>;
    initializeAuth: () => Promise<void>;
}

const REFRESH_TOKEN_KEY = 'bumblekey_refresh_token';

export const useAuth = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            const { user, access_token, refresh_token } = response.data;

            // Store refresh token in localStorage for persistence
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

            // Store access token in memory only
            set({
                user,
                accessToken: access_token,
                isAuthenticated: true,
                isLoading: false
            });

            // Update axios default header for subsequent requests
            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            useToast.getState().showToast('Welcome back!', 'success');
        } catch (error) {
            console.error('Login failed:', error);
            useToast.getState().showToast('Login failed. Please check your credentials.', 'error');
            throw error;
        }
    },

    register: async (data) => {
        try {
            const response = await api.post('/auth/register', data);
            const { user, access_token, refresh_token } = response.data;

            // Store refresh token in localStorage
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh_token);

            set({
                user,
                accessToken: access_token,
                isAuthenticated: true,
                isLoading: false
            });

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            useToast.getState().showToast('Registration successful! Welcome aboard.', 'success');
        } catch (error) {
            console.error('Registration failed:', error);
            useToast.getState().showToast('Registration failed. Please try again.', 'error');
            throw error;
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Clear refresh token from localStorage
            localStorage.removeItem(REFRESH_TOKEN_KEY);

            set({ user: null, accessToken: null, isAuthenticated: false });
            delete api.defaults.headers.common['Authorization'];
            useToast.getState().showToast('Logged out successfully', 'info');
        }
    },

    fetchUser: async () => {
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
            delete api.defaults.headers.common['Authorization'];
        }
    },

    refreshAccessToken: async () => {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
            return null;
        }

        try {
            // Use axios directly to avoid interceptors during refresh
            const response = await axios.post(
                `${api.defaults.baseURL}/auth/refresh`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${refreshToken}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    }
                }
            );

            const { user, access_token, refresh_token: newRefreshToken } = response.data;

            // Update refresh token in localStorage (rotation)
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

            set({
                user,
                accessToken: access_token,
                isAuthenticated: true,
                isLoading: false
            });

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            return access_token;
        } catch (error) {
            console.error('Token refresh failed:', error);
            localStorage.removeItem(REFRESH_TOKEN_KEY);
            set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
            delete api.defaults.headers.common['Authorization'];
            return null;
        }
    },

    /**
     * Initialize auth on app load.
     * Attempts silent login using stored refresh token.
     */
    initializeAuth: async () => {
        set({ isLoading: true });

        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
            // No refresh token stored, user is not authenticated
            set({ isLoading: false, isAuthenticated: false });
            return;
        }

        // Attempt to refresh and get user data
        const token = await get().refreshAccessToken();

        if (!token) {
            // Refresh failed, user needs to login again
            set({ isLoading: false, isAuthenticated: false });
        }
        // If successful, state is already set by refreshAccessToken
    },
}));

// Connect the auth store to the API interceptors
setAuthStore(useAuth);

