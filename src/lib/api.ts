/**
 * Unified API Client for SwasthyaSetu
 * Handles dynamic protocol detection for Vercel/Production vs Local environments.
 */

const getApiBaseUrl = () => {
    if (typeof window === 'undefined') return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
    
    const isVercel = window.location.hostname.includes('vercel.app') || window.location.hostname.includes('swasthyasetu');
    
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
    
    // Fallback logic
    if (isVercel) {
        // Assume backend is on the same host or has a specific convention
        // For now, return the current origin as a guess (Next.js rewrites or same-domain backend)
        return window.location.origin;
    }
    
    return `${window.location.protocol}//${window.location.hostname}:8080`;
};

export const API_BASE_URL = getApiBaseUrl();

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
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
        throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return response.json();
};
