'use client';
import { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import SessionTimeoutWarning from '../shared/SessionTimeoutWarning';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <SessionTimeoutWarning />
            {/* Sidebar component */}
            <Sidebar role={role} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 lg:pl-64`}>
                <TopBar onMenuClick={() => setSidebarOpen(true)} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 p-4 md:p-6 lg:p-8">
                    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
