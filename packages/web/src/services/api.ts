import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    // No withCredentials - we're using pure Bearer tokens, no cookies
});

// Store reference for avoiding circular dependency
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let authStore: any = null;

export const setAuthStore = (store: any) => {
    authStore = store;
};

// Request interceptor - token is set directly on api.defaults.headers by auth store
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    return config;
});

// Response interceptor to handle 401s and refresh token
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && authStore) {
            if (isRefreshing) {
                // If already refreshing, queue this request
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => api(originalRequest));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await authStore.getState().refreshAccessToken();
                if (newToken) {
                    processQueue(null);
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    return api(originalRequest);
                } else {
                    processQueue(error);
                    return Promise.reject(error);
                }
            } catch (refreshError) {
                processQueue(error);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;

