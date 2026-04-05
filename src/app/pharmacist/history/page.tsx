'use client';
import StatusBadge from '@/components/shared/StatusBadge';
import { Eye } from 'lucide-react';
import Link from 'next/link';

const MOCK_HISTORY = [
    { id: 'PR-0988', patient: 'Michael Brown', doctor: 'Dr. Emily Chen', dispensedAt: 'Oct 23, 2024 - 04:30 PM', medsCount: 2, status: 'DISPENSED' as const },
    { id: 'PR-0985', patient: 'Sarah Connor', doctor: 'Dr. John Doe', dispensedAt: 'Oct 23, 2024 - 02:15 PM', medsCount: 1, status: 'DISPENSED' as const },
    { id: 'PR-0970', patient: 'Tom Hardy', doctor: 'Dr. Sarah Smith', dispensedAt: 'Oct 22, 2024 - 11:00 AM', medsCount: 4, status: 'DISPENSED' as const },
];

export default function PharmacistHistory() {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Dispensed History</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 pl-6">ID</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Items</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Dispensed Timestamp</th>
                            <th className="p-4 pr-6 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_HISTORY.map(rx => (
                            <tr key={rx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6 font-medium text-slate-900">{rx.id}</td>
                                <td className="p-4 font-bold text-slate-900">{rx.patient}</td>
                                <td className="p-4">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">{rx.medsCount}</span>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={rx.status} />
                                </td>
                                <td className="p-4 text-slate-500 whitespace-nowrap text-sm">{rx.dispensedAt}</td>
                                <td className="p-4 pr-6 text-right">
                                    <Link href={`/pharmacist/prescription/${rx.id}`} className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
