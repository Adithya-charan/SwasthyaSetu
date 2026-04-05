'use client';
import { useState } from 'react';
import AppointmentCard from '@/components/shared/AppointmentCard';

const MOCK_APPOINTMENTS = [
    { id: 1, name: 'Dr. Sarah Smith', roleLabel: 'Cardiology', date: 'Oct 24, 2024', time: '10:00 AM', status: 'CONFIRMED' as const },
    { id: 2, name: 'Dr. John Doe', roleLabel: 'Dermatology', date: 'Oct 28, 2024', time: '02:30 PM', status: 'PENDING' as const },
    { id: 3, name: 'Dr. Emily Chen', roleLabel: 'General Practice', date: 'Nov 02, 2024', time: '11:15 AM', status: 'CONFIRMED' as const },
    { id: 4, name: 'Dr. Michael Brown', roleLabel: 'Orthopedics', date: 'Sep 15, 2024', time: '04:00 PM', status: 'COMPLETED' as const },
    { id: 5, name: 'Dr. Sarah Smith', roleLabel: 'Cardiology', date: 'Sep 02, 2024', time: '09:00 AM', status: 'CANCELLED' as const },
];

export default function AppointmentsPage() {
    const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');

    const filteredApps = MOCK_APPOINTMENTS.filter(app => {
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

            {filteredApps.length > 0 ? (
                <div className="space-y-4">
                    {filteredApps.map(apt => (
                        <AppointmentCard
                            key={apt.id}
                            name={apt.name}
                            roleLabel={apt.roleLabel as any}
                            date={apt.date}
                            time={apt.time}
                            status={apt.status}
                            actionButtonText={apt.status === 'CONFIRMED' ? 'Join Call' : undefined}
                            onActionClick={() => window.location.href = `/patient/consultation/${apt.id}`}
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
