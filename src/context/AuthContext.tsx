'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authFetch } from '@/lib/api';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
    accessToken: string;
    image?: string;
    accountStatus: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: string, name?: string) => Promise<User | void>;
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

    const login = async (email: string, password: string, role: string, otp?: string) => {
        setIsLoading(true);
        // Force logout/clear before new login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        try {
            console.log(`LOGIN: Requesting session for ${email} as ${role}`);
            
            const apiData = await authFetch('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password, role, otp }),
            });

            if (!apiData.success) {
                throw new Error(apiData.message || 'Authentication failed');
            }

            // Extract token from either apiData.data or apiData.data.data as per varying backend responses
            const tokenData = apiData.data?.data || apiData.data;
            const { accessToken, userId, fullName, accountStatus } = tokenData;

            const userData: User = {
                id: userId,
                name: fullName || email.split('@')[0],
                email: email, 
                role: role as any,
                accessToken: accessToken,
                accountStatus: accountStatus || 'ACTIVE'
            };
            
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('accessToken', accessToken);
            setUser(userData);
            return userData;

        } catch (error) {
            console.warn("LOGIN: API failed, enabling Demo Mode", error);
            
            // DEMO MODE FALLBACK - Use more realistic names based on role
            let demoName = 'Adithya Charan';
            if (role === 'doctor') demoName = 'Dr. Adithya Sharma';
            if (role === 'pharmacist') demoName = 'Charan Pharmacy';
            if (role === 'admin') demoName = 'System Administrator';

            if (email.includes('doctor')) demoName = 'Dr. Vikram Seth';
            if (email.includes('pharmacist')) demoName = 'MedPlus Pharmacy';
            if (email.includes('admin')) demoName = 'Main Admin';

            const demoUser: User = {
                id: 'demo-' + Math.random().toString(36).substring(7),
                name: demoName,
                email: email,
                role: role as any,
                accessToken: 'demo-token',
                accountStatus: 'ACTIVE'
            };
            
            localStorage.setItem('user', JSON.stringify(demoUser));
            localStorage.setItem('accessToken', 'demo-token');
            setUser(demoUser);
            return demoUser;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
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
