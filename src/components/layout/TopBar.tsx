'use client';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import NotificationPanel from '../shared/NotificationPanel';

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { user, logout } = useAuth();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-6">
                <NotificationPanel />

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 capitalize">
                            {user?.role || 'patient'}
                        </span>
                    </div>
                    {user?.image ? (
                        <img src={user.image} alt="Profile" className="w-10 h-10 rounded-full border-2 border-slate-100 object-cover" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <button
                        onClick={logout}
                        className="text-slate-500 hover:text-red-600 p-2 rounded-lg transition-colors ml-2"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
