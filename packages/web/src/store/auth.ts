import { create } from 'zustand';
import api from '../services/api';
import { useToast } from './toast';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'host' | 'partner' | 'admin' | 'guest';
    business_name?: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    fetchUser: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,

    login: async (credentials) => {
        console.log('Auth Store: Requesting CSRF cookie...');
        // Sanctum CSRF protection
        await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
        console.log('Auth Store: CSRF cookie obtained. Logging in...');
        try {
            await api.post('/auth/login', credentials);
            console.log('Auth Store: Login successful. Fetching user...');
            await useAuth.getState().fetchUser();
            useToast.getState().showToast('Welcome back!', 'success');
        } catch (error) {
            console.error('Login failed:', error);
            useToast.getState().showToast('Login failed. Please check your credentials.', 'error');
            throw error;
        }
    },

    register: async (data) => {
        try {
            await api.get('/sanctum/csrf-cookie', { baseURL: '/' });
            await api.post('/auth/register', data);
            await useAuth.getState().fetchUser();
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
            set({ user: null, isAuthenticated: false });
            useToast.getState().showToast('Logged out successfully', 'info');
        } catch (error) {
            console.error('Logout failed:', error);
            // Still clear state even if API call fails
            set({ user: null, isAuthenticated: false });
        }
    },

    fetchUser: async () => {
        try {
            const response = await api.get('/auth/me');
            set({ user: response.data, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },
}));
