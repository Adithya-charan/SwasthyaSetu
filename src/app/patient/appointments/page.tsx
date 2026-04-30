'use client';
import { useState, useEffect } from 'react';
import { fetchApi } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import AppointmentCard from '@/components/shared/AppointmentCard';

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');

    useEffect(() => {
        const loadAppointments = async () => {
            try {
                const data = await fetchApi('/api/appointments/my');
                setAppointments(data.data.content || []);
            } catch (error) {
                console.error("Failed to load appointments", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadAppointments();
    }, []);

    const filteredApps = appointments.filter(app => {
        if (filter === 'All') return true;
        if (filter === 'Upcoming') return app.status === 'CONFIRMED' || app.status === 'PENDING';
        if (filter === 'Completed') return app.status === 'COMPLETED';
        if (filter === 'Cancelled') return app.status === 'CANCELLED';
        return true;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-full max-w-lg overflow-x-auto">
                {['All', 'Upcoming', 'Completed', 'Cancelled'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`flex-1 py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                            filter === f 
                                ? 'bg-white text-slate-900 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
            ) : filteredApps.length > 0 ? (
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
                <div className="bg-white rounded-xl p-12 border border-slate-200 border-dashed text-center">
                    <p className="text-slate-500">No appointments found.</p>
                </div>
            )}
        </div>
    );
}
