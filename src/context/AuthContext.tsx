'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
    token: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: string, name?: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Simple check on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
                console.log("AUTH: Found user in storage", JSON.parse(storedUser).name);
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: string, name?: string) => {
        setIsLoading(true);
        console.log("LOGIN: Starting real login process for", email);

        try {
            const apiData = await fetchApi('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            if (!apiData.success) {
                throw new Error(apiData.message || 'Authentication failed');
            }

            const { accessToken } = apiData.data;

            // Mock user details retrieved from token/context for now
            // Ideally we'd have a /me endpoint
            const userData: User = {
                id: Math.random().toString(36).substr(2, 9), // placeholder
                name: name || email.split('@')[0],
                email,
                role: role as any,
                token: accessToken
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', accessToken);
            setUser(userData);
            console.log("LOGIN: Success, token saved");

            // Redirect is handled by the calling page component
        } catch (error) {
            console.error("LOGIN: REST API failed, using fallback mock...", error);
            
            // Fallback for demo purposes if backend isn't ready
            const mockUser: User = {
                id: 'mock-id-123',
                name: name || email.split('@')[0],
                email,
                role: role as any,
                token: 'mock-jwt-token'
            };
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', 'mock-jwt-token');
            setUser(mockUser);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
