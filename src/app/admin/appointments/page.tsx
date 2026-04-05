'use client';
import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';

const MOCK_A = [
    { id: 1, patient: 'Alice Walker', doctor: 'Dr. Sarah Smith', date: 'Oct 24, 2024 - 10:00 AM', status: 'PENDING' as const },
    { id: 2, patient: 'Bob Smith', doctor: 'Dr. John Doe', date: 'Oct 24, 2024 - 02:30 PM', status: 'CONFIRMED' as const },
    { id: 3, patient: 'Emily Chen', doctor: 'Dr. Sarah Smith', date: 'Oct 25, 2024 - 11:15 AM', status: 'COMPLETED' as const },
    { id: 4, patient: 'John Doe', doctor: 'Dr. Michael Brown', date: 'Oct 26, 2024 - 09:00 AM', status: 'CANCELLED' as const },
];

export default function AdminAppointmentsPage() {
    const [apps, setApps] = useState(MOCK_A);
    const [filter, setFilter] = useState('All');

    const handleCancel = (id: number) => {
        setApps(apps.map(a => a.id === id ? { ...a, status: 'CANCELLED' as const } : a));
    };

    const filtered = apps.filter(a => filter === 'All' || a.status === filter);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">All Appointments</h1>

            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-full max-w-2xl overflow-x-auto shrink-0 mb-4">
                {['All', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`flex-1 min-w-[80px] py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                            filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        {f === 'All' ? f : f.charAt(0) + f.slice(1).toLowerCase()}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 pl-6">Patient</th>
                            <th className="p-4">Doctor</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(apt => (
                            <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6 font-bold text-slate-900">{apt.patient}</td>
                                <td className="p-4 text-slate-600">{apt.doctor}</td>
                                <td className="p-4 text-sm text-slate-500">{apt.date}</td>
                                <td className="p-4"><StatusBadge status={apt.status} /></td>
                                <td className="p-4 pr-6 text-right">
                                    {apt.status !== 'CANCELLED' && apt.status !== 'COMPLETED' ? (
                                        <button 
                                            onClick={() => handleCancel(apt.id)}
                                            className="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                                        >
                                            Cancel
                                        </button>
                                    ) : (
                                        <span className="text-slate-400 text-sm">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-12 text-center text-slate-500">No appointments found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
