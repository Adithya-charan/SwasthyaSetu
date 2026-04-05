'use client';
import { useState, useRef, useEffect } from 'react';
import { Bell, Calendar, Pill, Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MOCK_NOTIFS_PATIENT = [
    { id: 1, type: 'appointment', title: 'Appointment Confirmed', desc: 'Dr. Rajesh Kumar confirmed your appointment for Tomorrow 10:00 AM', time: '5 mins ago', read: false },
    { id: 2, type: 'prescription', title: 'Prescription Ready', desc: 'Your prescription from Dr. Sarah Smith is ready for pickup', time: '2 hours ago', read: false },
    { id: 3, type: 'lab', title: 'Lab Report Uploaded', desc: 'Dr. Kumar uploaded your blood test report', time: 'Yesterday', read: true },
];

const MOCK_NOTIFS_DOCTOR = [
    { id: 4, type: 'appointment', title: 'New Appointment Request', desc: 'Priya Sharma requested an appointment for Tomorrow 2:00 PM', time: '10 mins ago', read: false },
    { id: 5, type: 'system', title: 'Patient Joined Call', desc: 'Your patient has joined the consultation room', time: '1 hour ago', read: true },
];

const MOCK_NOTIFS_PHARMACIST = [
    { id: 6, type: 'prescription', title: 'New Prescription', desc: 'Prescription #47 from Dr. Smith is waiting for dispensing', time: '15 mins ago', read: false },
];

export default function NotificationPanel() {
    const { user } = useAuth();
    const role = user?.role || 'patient';
    const [isOpen, setIsOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    const [notifs, setNotifs] = useState(() => {
        if (role === 'doctor') return MOCK_NOTIFS_DOCTOR;
        if (role === 'pharmacist') return MOCK_NOTIFS_PHARMACIST;
        return MOCK_NOTIFS_PATIENT; // default admin or patient
    });

    const unreadCount = notifs.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = (id: number) => {
        setNotifs(notifs.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllRead = () => {
        setNotifs(notifs.map(n => ({ ...n, read: true })));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'appointment': return <Calendar className="w-4 h-4 text-blue-600" />;
            case 'prescription': return <Pill className="w-4 h-4 text-green-600" />;
            case 'lab': return <Activity className="w-4 h-4 text-orange-600" />;
            default: return <AlertCircle className="w-4 h-4 text-slate-600" />;
        }
    };
    
    const getBg = (type: string) => {
        switch (type) {
            case 'appointment': return 'bg-blue-100';
            case 'prescription': return 'bg-green-100';
            case 'lab': return 'bg-orange-100';
            default: return 'bg-slate-100';
        }
    };

    return (
        <div className="relative" ref={panelRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none">
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5"/> Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifs.length === 0 ? (
                            <div className="p-8 text-center text-slate-500 text-sm">No notifications right now.</div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notifs.map(n => (
                                    <div 
                                        key={n.id} 
                                        onClick={() => markAsRead(n.id)}
                                        className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${!n.read ? 'bg-blue-50/40' : 'bg-white'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${getBg(n.type)}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-start mb-0.5">
                                                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                                                {!n.read && <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 shrink-0"></span>}
                                            </div>
                                            <p className="text-sm text-slate-600 leading-snug">{n.desc}</p>
                                            <p className="text-xs text-slate-400 mt-2 font-medium">{n.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
