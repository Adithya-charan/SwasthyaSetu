'use client';
import { useState } from 'react';
import Link from 'next/link';
import StatusBadge from '@/components/shared/StatusBadge';
import { Check, Eye } from 'lucide-react';
import { toast } from 'react-toastify';

type QueueItem = { id: string; patient: string; doctor: string; date: string; medsCount: number; status: 'ISSUED' | 'DISPENSED' };

const MOCK_QUEUE: QueueItem[] = [
    { id: 'PR-1001', patient: 'Alice Walker', doctor: 'Dr. Sarah Smith', date: 'Oct 24, 2024', medsCount: 3, status: 'ISSUED' },
    { id: 'PR-1002', patient: 'Bob Smith', doctor: 'Dr. John Doe', date: 'Oct 24, 2024', medsCount: 1, status: 'ISSUED' },
    { id: 'PR-1003', patient: 'Emily Chen', doctor: 'Dr. Sarah Smith', date: 'Oct 23, 2024', medsCount: 2, status: 'ISSUED' },
];

export default function PharmacistQueue() {
    const [queue, setQueue] = useState<QueueItem[]>(MOCK_QUEUE);

    const handleDispense = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        setQueue(queue.map(q => q.id === id ? { ...q, status: 'DISPENSED' as const } : q));
        toast.success(`Prescription ${id} marked as dispensed`);
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Prescription Queue</h1>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left min-w-[800px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 pl-6">ID</th>
                            <th className="p-4">Patient</th>
                            <th className="p-4">Doctor</th>
                            <th className="p-4 text-center">Items</th>
                            <th className="p-4">Date Issued</th>
                            <th className="p-4 pr-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {queue.filter(q => q.status === 'ISSUED').map(q => (
                            <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6 font-medium text-slate-900">{q.id}</td>
                                <td className="p-4 font-bold text-slate-900">{q.patient}</td>
                                <td className="p-4 text-slate-600 font-medium">{q.doctor}</td>
                                <td className="p-4 text-center">
                                    <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">{q.medsCount}</span>
                                </td>
                                <td className="p-4 text-slate-500 whitespace-nowrap text-sm">{q.date}</td>
                                <td className="p-4 pr-6 text-right space-x-2 whitespace-nowrap">
                                    <Link href={`/pharmacist/prescription/${q.id}`} className="inline-flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    <button onClick={(e) => handleDispense(q.id, e)} className="inline-flex items-center justify-center p-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-sm shadow-green-500/20">
                                        <Check className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {queue.filter(q => q.status === 'ISSUED').length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-500">Queue is empty.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
