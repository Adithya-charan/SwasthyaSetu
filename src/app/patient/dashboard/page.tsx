'use client';
import { useState, useEffect } from 'react';
import { Calendar, Pill, ActivitySquare, ArrowRight, Video, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import StatCard from '@/components/shared/StatCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import { authFetch } from '@/lib/api';
import { useLanguage } from '@/context/LanguageContext';

import { useAuth } from '@/context/AuthContext';

export default function PatientDashboard() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            try {
                // Try real API first
                const data = await authFetch('/api/appointments/my');
                if (data.data.content && data.data.content.length > 0) {
                    setAppointments(data.data.content);
                } else {
                    throw new Error("No real appts");
                }
            } catch (error) {
                // Guaranteed Demo Appointment
                setAppointments([{
                    id: 'demo-appt-' + Math.random().toString(36).substring(7),
                    doctorId: 'demo-doc-123',
                    doctorName: 'Dr. Sharma (Specialist)',
                    scheduledAt: new Date().toISOString(),
                    status: 'CONFIRMED'
                }]);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, [user]);
    // Countdown timer logic
    const [timeLeft, setTimeLeft] = useState<{ hours: number, minutes: number, seconds: number, totalMs: number } | null>(null);
    const [isJoinActive, setIsJoinActive] = useState(false);
    
    useEffect(() => {
        // Mock appointment is exactly 2 hours, 14 min, 30 sec from component mount
        const appointmentTime = new Date().getTime() + (2 * 60 * 60 * 1000) + (14 * 60 * 1000) + (30 * 1000);
        
        const updateTimer = () => {
            const now = new Date().getTime();
            const distance = appointmentTime - now;

            if (distance < 0) {
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
                setIsJoinActive(true); // Past time, can join
                return;
            }

            const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ hours: h, minutes: m, seconds: s, totalMs: distance });
            setIsJoinActive(distance <= 24 * 60 * 60 * 1000); // <= 24 hours away
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, []);

    const renderTimerBanner = () => {
        if (!timeLeft) return null; // loading state

        const totalWaitMs = (2 * 60 * 60 * 1000) + (14 * 60 * 1000) + (30 * 1000);
        const progressPercentage = Math.min(100, Math.max(0, 100 - (timeLeft.totalMs / totalWaitMs * 100)));

        return (
            <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden text-white flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-4 border-slate-800">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-900/50 to-transparent"></div>
                <div className="absolute top-0 left-0 h-1 bg-primary-500 transition-all duration-1000 ease-linear" style={{ width: `${progressPercentage}%` }}></div>
                
                <div className="z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 bg-slate-800/50 backdrop-blur px-3 py-1.5 rounded-full mb-4 border border-slate-700">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Appointment Status</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold mb-1">{appointments.length > 0 ? 'Upcoming Consultation' : 'No Upcoming Calls'}</h2>
                    <p className="text-primary-300 font-medium tracking-wide text-sm opacity-60">
                        {appointments.length > 0 
                            ? `You have a scheduled session with ${appointments[0].doctorName || "Dr. Sharma (Specialist)"}.` 
                            : "Book a doctor from the 'Find Doctor' section to see your next session here."}
                    </p>
                </div>

                <div className="z-10 flex flex-col items-center md:items-end gap-4 min-w-[200px]">
                    <div className="flex items-center gap-3 font-mono text-2xl font-bold">
                        <Clock className="w-6 h-6 text-slate-400" />
                        <span>{timeLeft.hours.toString().padStart(2, '0')}<span className="text-slate-500 mx-1">:</span>{timeLeft.minutes.toString().padStart(2, '0')}<span className="text-slate-500 mx-1">:</span><span className="text-primary-400">{timeLeft.seconds.toString().padStart(2, '0')}</span></span>
                    </div>
                    {appointments.length > 0 ? (
                        <button onClick={() => window.open(`/patient/consultation/${appointments[0].id}`, '_blank')} className="w-full md:w-auto px-8 py-3 bg-green-500  hover:bg-green-400 text-slate-900 font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all text-center flex items-center justify-center gap-2">
                            <Video className="w-5 h-5"/> Join Call 
                        </button>
                    ) : (
                        <button disabled className="w-full md:w-auto px-8 py-3 bg-slate-800 text-slate-500 font-bold rounded-xl cursor-not-allowed border border-slate-700/50 text-center flex items-center justify-center gap-2 transition-all">
                            <Video className="w-5 h-5 opacity-50"/> {isJoinActive ? 'No Appointment' : 'Join Call (Locked)'}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome, {user?.name || 'Patient'}</h1>
            
            {renderTimerBanner()}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Calendar className="w-6 h-6" />} value="4" label="Total Appointments" accentColor="primary" />
                <StatCard icon={<Pill className="w-6 h-6" />} value="2" label="Active Prescriptions" accentColor="green" />
                <StatCard icon={<ActivitySquare className="w-6 h-6" />} value="1" label="Pending Lab Reports" accentColor="yellow" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-slate-800">Upcoming Appointments</h2>
                        <Link href="/patient/appointments" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                            View All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {isLoading ? (
                         <div className="flex items-center justify-center p-12 bg-white rounded-2xl border border-slate-100">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : appointments.length > 0 ? (
                        <div className="space-y-4">
                            {appointments.map((apt: any) => (
                                <AppointmentCard
                                    key={apt.id}
                                    name={apt.doctorName || "Dr. Sharma (Specialist)"}
                                    roleLabel="Doctor"
                                    date={new Date(apt.scheduledAt).toLocaleDateString()}
                                    time={new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    status={apt.status.toUpperCase()}
                                    actionButtonText={['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status) ? 'Join Call' : undefined}
                                    onActionClick={() => window.open(`/patient/consultation/${apt.id}`, '_blank')}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 border border-slate-200 border-dashed text-center">
                            <p className="text-slate-500 mb-4">No upcoming consultations. Book an appointment with a specialist today.</p>
                            <Link href="/patient/doctors" className="inline-flex px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                                Book Now
                            </Link>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Quick Actions</h2>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
                        <Link href="/patient/doctors" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                            <div className="bg-primary-50 p-2 rounded-lg text-primary-600"><Calendar className="w-5 h-5"/></div>
                            <span className="font-medium">Book Appointment</span>
                        </Link>
                        <Link href="/patient/prescriptions" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                            <div className="bg-green-50 p-2 rounded-lg text-green-600"><Pill className="w-5 h-5"/></div>
                            <span className="font-medium">View Prescriptions</span>
                        </Link>
                        <Link href="/patient/records" className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 text-slate-700 transition-colors border border-transparent hover:border-slate-200">
                            <div className="bg-purple-50 p-2 rounded-lg text-purple-600"><ActivitySquare className="w-5 h-5"/></div>
                            <span className="font-medium">My Medical Records</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
