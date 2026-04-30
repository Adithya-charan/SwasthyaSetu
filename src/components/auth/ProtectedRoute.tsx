'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isLoading && !user && isMounted) {
            router.push('/login');
        } else if (!isLoading && user && user.accountStatus === 'PENDING' && isMounted) {
            router.push('/waiting-approval');
        }
    }, [isLoading, user, router, isMounted]);

    if (!isMounted || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect shortly
    }

    // Check if account is still pending approval
    if (user.accountStatus === 'PENDING') {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
