'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface RoleRouteProps {
    children: React.ReactNode;
    allowedRole: 'patient' | 'doctor' | 'pharmacist' | 'admin';
}

export default function RoleRoute({ children, allowedRole }: RoleRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && user && user.role !== allowedRole && isMounted) {
            router.push(`/${user.role}/dashboard`);
        }
    }, [isLoading, user, allowedRole, router, isMounted]);

    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user || user.role !== allowedRole) {
        return null; // Will redirect shortly
    }

    return <>{children}</>;
}
