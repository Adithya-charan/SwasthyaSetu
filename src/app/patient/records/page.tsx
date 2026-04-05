'use client';
import { Fragment } from 'react';
import { Calendar, User, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';

const MOCK_RECORDS = [
    {
        id: '1',
        visitDate: 'Oct 15, 2024',
        doctor: 'Dr. Sarah Smith',
        complaint: 'Chest pain and shortness of breath',
        diagnosis: 'Mild Angina',
        notes: 'Advised rest and prescribed beta blockers.'
    },
    {
        id: '2',
        visitDate: 'Sep 05, 2024',
        doctor: 'Dr. Emily Chen',
        complaint: 'High fever and body ache',
        diagnosis: 'Viral Influenza',
        notes: 'Rest for 5 days. Drink lots of fluids.'
    },
    {
        id: '3',
        visitDate: 'Mar 12, 2023',
        doctor: 'Dr. Michael Brown',
        complaint: 'Left knee pain after falling',
        diagnosis: 'Sprain',
        notes: 'Apply ice. Wear knee brace for 2 weeks.'
    }
];

export default function RecordsPage() {
    const handleShare = () => {
        toast.info("A secure sharing link has been sent to your registered email address.");
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Medical Records Timeline</h1>
                <button onClick={handleShare} className="flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-xl transition-colors font-medium shadow-sm">
                    <Share2 className="w-4 h-4" /> Share Records
                </button>
            </div>

            <div className="relative border-l-2 border-primary-200 ml-4 py-8 space-y-12">
                {MOCK_RECORDS.map((rec) => (
                    <div key={rec.id} className="relative pl-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="absolute -left-3.5 top-1 bg-white border-4 border-primary-500 rounded-full w-7 h-7 shadow"></div>
                        
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                                <h3 className="text-lg font-bold text-slate-900">{rec.visitDate}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                    <User className="w-4 h-4 text-primary-500" /> {rec.doctor}
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Chief Complaint</p>
                                    <p className="text-slate-900 font-medium">{rec.complaint}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Diagnosis</p>
                                    <p className="text-slate-900 font-medium bg-red-50 text-red-700 inline-block px-3 py-1 rounded-md mb-2">{rec.diagnosis}</p>
                                </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-slate-50 space-y-2">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Doctor Notes</p>
                                <p className="text-slate-600 italic bg-yellow-50 p-3 rounded-lg text-sm border border-yellow-100/50">"{rec.notes}"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
