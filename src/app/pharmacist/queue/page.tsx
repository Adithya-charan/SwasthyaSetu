'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Check, Eye, ClipboardList } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PharmacistQueue() {
    const [queue, setQueue] = useState<any[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        loadQueue();
    }, []);

    const loadQueue = () => {
        const stored = JSON.parse(localStorage.getItem('mockPrescriptions') || '[]');
        // Only show pending prescriptions
        const combined = stored.filter((q: any) => q.status === 'pending');
        setQueue(combined);
    };

    const handleDispense = (id: string) => {
        // Update local storage
        const stored = JSON.parse(localStorage.getItem('mockPrescriptions') || '[]');
        const updated = stored.map((q: any) => q.id === id ? { ...q, status: 'dispensed' } : q);
        localStorage.setItem('mockPrescriptions', JSON.stringify(updated));
        
        // Also update local state for the static ones if they match
        setQueue(queue.filter(q => q.id !== id));
        toast.success(`Prescription ${id} marked as dispensed successfully!`);
    };

    if (!isMounted) return null;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-primary-600" /> Dispensing Queue
                </h1>
                <div className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100">
                    {queue.length} Pending Orders
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px] border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                                <th className="p-4 pl-6">ID</th>
                                <th className="p-4">Patient Name</th>
                                <th className="p-4">Consulting Doctor</th>
                                <th className="p-4 text-center">Items</th>
                                <th className="p-4">Date Issued</th>
                                <th className="p-4 pr-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {queue.map(q => (
                                <tr key={q.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 pl-6 font-mono text-xs text-slate-400">#{q.id.toString().slice(-6)}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-slate-900">{q.patientName}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className="text-sm text-slate-600 font-medium">{q.doctorName}</div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="bg-primary-50 text-primary-700 px-3 py-1 rounded-lg text-xs font-bold border border-primary-100">
                                            {q.medicines?.length || 0} Meds
                                        </span>
                                    </td>
                                    <td className="p-4 text-slate-500 text-xs font-medium">
                                        {new Date(q.date).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 pr-6 text-right space-x-2">
                                        <button className="inline-flex items-center justify-center w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all shadow-sm">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDispense(q.id)}
                                            className="inline-flex items-center justify-center h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md shadow-emerald-600/20 font-bold text-xs gap-2"
                                        >
                                            <Check className="w-4 h-4" /> Dispense
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {queue.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
                                                <ClipboardList className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="text-slate-400 font-medium">The queue is currently empty.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
