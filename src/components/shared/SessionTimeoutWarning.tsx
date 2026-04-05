'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { LogOut } from 'lucide-react';

export default function SessionTimeoutWarning() {
    const { logout } = useAuth();
    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(120);
    const [lastActivity, setLastActivity] = useState(Date.now());
    
    const INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes

    const resetTimer = useCallback(() => {
        setLastActivity(Date.now());
        if (showWarning) {
            setShowWarning(false);
            setCountdown(120);
        }
    }, [showWarning]);

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));
        
        const checkInterval = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > INACTIVITY_LIMIT && !showWarning) {
                setShowWarning(true);
            }
        }, 30000); // Check every 30 seconds

        return () => {
            events.forEach(e => window.removeEventListener(e, resetTimer));
            clearInterval(checkInterval);
        };
    }, [lastActivity, showWarning, resetTimer]);

    useEffect(() => {
        if (showWarning && countdown > 0) {
            const timerId = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (showWarning && countdown <= 0) {
            // Logout
            logout();
            toast.error("You were logged out due to inactivity.");
        }
    }, [showWarning, countdown, logout]);

    if (!showWarning) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={resetTimer}>
            <div className="bg-white rounded-2xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center animate-pulse">
                        <LogOut className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Session Expiring Soon</h2>
                    <p className="text-slate-600">You have been inactive for 10 minutes. Your session will automatically end in <span className="font-bold text-red-600 text-lg">{countdown}</span> seconds.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button onClick={resetTimer} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-sm">
                        Stay Logged In
                    </button>
                    <button onClick={() => { logout(); toast.info("You logged out."); }} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-3 rounded-xl transition-colors shadow-sm border border-red-200">
                        Logout Now
                    </button>
                </div>
            </div>
        </div>
    );
}
