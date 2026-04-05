'use client';
import { useState } from 'react';
import StatusBadge from '@/components/shared/StatusBadge';
import { ChevronDown, ChevronUp, FileText, Calendar, User } from 'lucide-react';

const MOCK_PRESCRIPTIONS = [
    {
        id: 'PR-1002',
        doctor: 'Dr. Sarah Smith',
        date: 'Oct 15, 2024',
        diagnosis: 'Hypertension',
        status: 'ISSUED' as const,
        medicines: [
            { name: 'Amlodipine 5mg', dosage: '1 tablet', freq: 'Once a day', duration: '30 days', instr: 'Take after breakfast' },
            { name: 'Atorvastatin 10mg', dosage: '1 tablet', freq: 'Once a day', duration: '30 days', instr: 'Take at bedtime' },
        ]
    },
    {
        id: 'PR-0988',
        doctor: 'Dr. Emily Chen',
        date: 'Sep 05, 2024',
        diagnosis: 'Viral Infection',
        status: 'DISPENSED' as const,
        medicines: [
            { name: 'Paracetamol 500mg', dosage: '1 tablet', freq: 'Thrice a day', duration: '5 days', instr: 'Take after meals for fever' },
            { name: 'Cetirizine 10mg', dosage: '1 tablet', freq: 'Once a day', duration: '5 days', instr: 'Take at night if allergies persist' },
        ]
    }
];

export default function PrescriptionsPage() {
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Prescriptions</h1>

            <div className="space-y-4">
                {MOCK_PRESCRIPTIONS.map(rx => (
                    <div key={rx.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div 
                            className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                            onClick={() => setExpanded(expanded === rx.id ? null : rx.id)}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{rx.diagnosis}</h3>
                                    <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{rx.doctor}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{rx.date}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 justify-between md:justify-end">
                                <StatusBadge status={rx.status} />
                                <div className="p-1 rounded-md text-slate-400 bg-slate-50 border border-slate-100">
                                    {expanded === rx.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </div>
                            </div>
                        </div>

                        {expanded === rx.id && (
                            <div className="p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
                                <div className="mt-4">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wider">Medicines</h4>
                                    <div className="space-y-3">
                                        {rx.medicines.map((med, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div>
                                                    <p className="font-bold text-slate-900">{med.name}</p>
                                                    <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{med.dosage}</span>
                                                        <span>• {med.freq} for {med.duration}</span>
                                                    </p>
                                                </div>
                                                <p className="text-sm text-slate-600 italic sm:text-right w-full sm:w-auto mt-2 sm:mt-0 bg-yellow-50 sm:bg-transparent p-2 sm:p-0 rounded">"{med.instr}"</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
