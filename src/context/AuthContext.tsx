'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
    login: (email: string, role: string, name?: string) => Promise<void>;
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

    const login = async (email: string, role: string, name?: string) => {
        setIsLoading(true);
        console.log("LOGIN: Starting login process for", email, role, name);

        try {
            // Mock user creation
            const mockUser: User = {
                id: Math.random().toString(36).substr(2, 9),
                name: name || email.split('@')[0],
                email,
                role: role as any,
                token: 'mock-jwt-token-123',
                image: undefined
            };

            // Save to local storage
            console.log("LOGIN: Saving to local storage...");
            localStorage.setItem('user', JSON.stringify(mockUser));
            localStorage.setItem('token', mockUser.token);

            // Update State
            console.log("LOGIN: Updating user state...");
            setUser(mockUser);
            console.log("LOGIN: User state updated");

            // Fire-and-forget socket logic
            setTimeout(async () => {
                try {
                    console.log("LOGIN: Initializing socket connection...");
                    const socketIO = await import('socket.io-client');
                    const io = socketIO.default || socketIO;
                    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000');

                    socket.on('connect', () => {
                        console.log("LOGIN: Socket connected, emitting event");
                        socket.emit('user_login', {
                            userId: mockUser.id,
                            name: mockUser.name,
                            role: mockUser.role,
                            image: mockUser.image
                        });
                    });
                } catch (error) {
                    console.error("LOGIN: Socket error", error);
                }
            }, 0);

        } catch (error) {
            console.error("LOGIN: Critical error during login", error);
        } finally {
            setIsLoading(false);
            console.log("LOGIN: Completed, isLoading set to false");
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
