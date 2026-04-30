'use client';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function WaitingApprovalPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/login');
        } else if (user.accountStatus === 'ACTIVE') {
            const dashboardPath = `/${user.role.toLowerCase()}/dashboard`;
            router.push(dashboardPath);
        }
    }, [user, router]);

    if (!user || user.accountStatus === 'ACTIVE') return null;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full text-center space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="flex justify-center">
                    <div className="bg-yellow-100 p-4 rounded-full">
                        <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900">
                    Account Under Review
                </h2>
                <p className="text-gray-600">
                    Your account is under admin verification. You will be able to access the platform once your credentials and documents have been approved.
                </p>
                <div className="pt-4">
                    <button
                        onClick={logout}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
                <p className="text-xs text-gray-400">
                    Please check back later or contact support if you have any questions.
                </p>
            </div>
        </div>
    );
}
