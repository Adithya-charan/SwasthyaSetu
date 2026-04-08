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
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string, role: string, name?: string) => {
        setIsLoading(true);
        console.log("LOGIN: Authenticating", email);

        try {
            const apiData = await fetchApi('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });

            if (!apiData.success) {
                throw new Error(apiData.message || 'Authentication failed');
            }

            const { accessToken, userId, fullName, email: userEmail, role: userRole } = apiData.data;

            const userData: User = {
                id: userId,
                name: fullName || name || email.split('@')[0],
                email: userEmail || email,
                role: (userRole || role).toLowerCase() as any,
                token: accessToken
            };

            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', accessToken);
            setUser(userData);
            console.log("LOGIN: Success — real JWT stored for user", userData.id);

        } catch (error) {
            console.error("LOGIN: Backend unreachable, trying registration...", error);
            
            // If login fails, try to register the user first, then login again
            try {
                await fetchApi('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        fullName: name || email.split('@')[0],
                        email,
                        password,
                        role: role.toUpperCase(),
                        phone: ''
                    })
                });
                console.log("LOGIN: Auto-registered, retrying login...");
                
                const retryData = await fetchApi('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                const { accessToken, userId, fullName, email: userEmail, role: userRole } = retryData.data;
                const userData: User = {
                    id: userId,
                    name: fullName || name || email.split('@')[0],
                    email: userEmail || email,
                    role: (userRole || role).toLowerCase() as any,
                    token: accessToken
                };
                localStorage.setItem('user', JSON.stringify(userData));
                localStorage.setItem('token', accessToken);
                setUser(userData);
                console.log("LOGIN: Auto-register + login succeeded for", userData.id);
                
            } catch (regError) {
                console.error("LOGIN: Both login and register failed. Backend offline?", regError);
                throw new Error("Unable to connect to the server. Please ensure the backend is running.");
            }
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
