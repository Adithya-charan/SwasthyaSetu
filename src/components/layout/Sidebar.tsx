'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Activity, LayoutDashboard, Calendar, Users, FileText, Settings, X, ActivitySquare, Pill, ClipboardList, Clock, ShieldCheck, HeartPulse, BellRing, Wallet, Package, Megaphone } from 'lucide-react';

interface SidebarProps {
    role: 'patient' | 'doctor' | 'pharmacist' | 'admin';
    isOpen: boolean;
    onClose: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    const roleLinks = {
        patient: [
            { name: 'Dashboard', href: '/patient/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: 'Book Appointment', href: '/patient/doctors', icon: <Calendar className="w-5 h-5" /> },
            { name: 'My Appointments', href: '/patient/appointments', icon: <Clock className="w-5 h-5" /> },
            { name: 'Prescriptions', href: '/patient/prescriptions', icon: <Pill className="w-5 h-5" /> },
            { name: 'Medical Records', href: '/patient/records', icon: <FileText className="w-5 h-5" /> },
            { name: 'Lab Reports', href: '/patient/lab-reports', icon: <ActivitySquare className="w-5 h-5" /> },
            { name: 'Symptom Tracker', href: '/patient/symptoms', icon: <HeartPulse className="w-5 h-5" /> },
            { name: 'Reminders', href: '/patient/reminders', icon: <BellRing className="w-5 h-5" /> },
            { name: 'Profile', href: '/patient/profile', icon: <Settings className="w-5 h-5" /> },
        ],
        doctor: [
            { name: 'Dashboard', href: '/doctor/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: 'My Schedule', href: '/doctor/appointments', icon: <Calendar className="w-5 h-5" /> },
            { name: 'My Patients', href: '/doctor/patients', icon: <Users className="w-5 h-5" /> },
            { name: 'Prescriptions', href: '/doctor/prescriptions', icon: <Pill className="w-5 h-5" /> },
            { name: 'Upload Lab Report', href: '/doctor/lab-reports/upload', icon: <ActivitySquare className="w-5 h-5" /> },
            { name: 'Earnings', href: '/doctor/earnings', icon: <Wallet className="w-5 h-5" /> },
            { name: 'Profile', href: '/doctor/profile', icon: <Settings className="w-5 h-5" /> },
        ],
        pharmacist: [
            { name: 'Dashboard', href: '/pharmacist/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: 'Prescription Queue', href: '/pharmacist/queue', icon: <ClipboardList className="w-5 h-5" /> },
            { name: 'Stock Inventory', href: '/pharmacist/inventory', icon: <Package className="w-5 h-5" /> },
            { name: 'Dispensed History', href: '/pharmacist/history', icon: <Clock className="w-5 h-5" /> },
        ],
        admin: [
            { name: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
            { name: 'Activity Monitor', href: '/admin/activity', icon: <Activity className="w-5 h-5" /> },
            { name: 'Manage Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
            { name: 'All Appointments', href: '/admin/appointments', icon: <Calendar className="w-5 h-5" /> },
            { name: 'Add Doctor', href: '/admin/create-doctor', icon: <ShieldCheck className="w-5 h-5" /> },
            { name: 'Broadcast', href: '/admin/broadcast', icon: <Megaphone className="w-5 h-5" /> },
        ]
    };

    const links = roleLinks[role as keyof typeof roleLinks] || [];

    return (
        <>
            {/* Mobile backdrop */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={onClose}
                />
            )}
            
            <aside className={`
                fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-slate-200 z-40 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary-600" />
                        <span className="font-bold text-xl text-slate-900 tracking-tight">SwasthyaSetu</span>
                    </div>
                    <button onClick={onClose} className="p-1 -mr-2 text-slate-500 hover:bg-slate-100 rounded-md lg:hidden">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-4rem)]">
                    {links.map((link) => {
                        const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200
                                    ${isActive 
                                        ? 'bg-primary-50 text-primary-700 shadow-sm' 
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                                `}
                            >
                                <span className={isActive ? 'text-primary-600' : 'text-slate-400'}>
                                    {link.icon}
                                </span>
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
