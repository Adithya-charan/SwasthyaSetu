/**
 * Unified API Client for SwasthyaSetu
 * Handles dynamic protocol detection for Vercel/Production vs Local environments.
 */

const getApiBaseUrl = () => {
    // 1. Check for explicit environment variable (build-time or server-side)
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // 2. Server-side rendering fallback
    if (typeof window === 'undefined') return 'http://localhost:8080';
    
    // 3. Use relative paths for both Local and Vercel to leverage next.config.js rewrites
    return ''; 
};

export const API_BASE_URL = getApiBaseUrl();

export const authFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    console.log(`[API] Fetching ${url}`);
    
    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `API Error: ${response.status}`);
        (error as any).data = errorData.data;
        throw error;
    }

    return response.json();
};

// Maintain fetchApi as an alias for backward compatibility during transition
export const fetchApi = authFetch;
