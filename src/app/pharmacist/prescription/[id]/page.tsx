'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PrescriptionDetail({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isDispensing, setIsDispensing] = useState(false);

    // Mock data based on ID
    const rx = {
        id: params.id,
        patient: 'Alice Walker',
        patientDob: '1992-05-14',
        patientPhone: '+1 234 567 8900',
        doctor: 'Dr. Sarah Smith',
        doctorLicense: 'MD-98765-Z',
        date: 'Oct 24, 2024',
        diagnosis: 'Hypertension',
        medicines: [
            { name: 'Amlodipine 5mg', dosage: '1 tablet', freq: 'Once a day', duration: '30 days', instr: 'Take after breakfast' },
            { name: 'Atorvastatin 10mg', dosage: '1 tablet', freq: 'Once a day', duration: '30 days', instr: 'Take at bedtime' },
        ]
    };

    const handleDispense = () => {
        setIsDispensing(true);
        setTimeout(() => {
            toast.success(`Prescription ${params.id} marked as dispensed`);
            router.push('/pharmacist/queue');
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/pharmacist/queue" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Prescription Details</h1>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 md:p-8 space-y-8">
                    {/* Header Info */}
                    <div className="flex flex-col md:flex-row justify-between gap-6 border-b border-slate-100 pb-8">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Patient Details</p>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">{rx.patient}</h2>
                            <p className="text-slate-600 text-sm">DOB: {rx.patientDob} • {rx.patientPhone}</p>
                        </div>
                        <div className="md:text-right">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Prescribed By</p>
                            <h2 className="text-xl font-bold text-slate-900 mb-1">{rx.doctor}</h2>
                            <p className="text-slate-600 text-sm">Lic: {rx.doctorLicense} • {rx.date}</p>
                        </div>
                    </div>

                    {/* Prescription Details */}
                    <div>
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Diagnosis</h3>
                            <p className="text-slate-900 font-medium bg-slate-50 inline-block px-3 py-1.5 rounded-lg border border-slate-100">{rx.diagnosis}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Medicines List</h3>
                            <div className="space-y-4">
                                {rx.medicines.map((med, idx) => (
                                    <div key={idx} className="border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <h4 className="font-bold text-lg text-slate-900">{med.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className="bg-primary-50 text-primary-700 px-2.5 py-1 rounded text-xs font-semibold">{med.dosage}</span>
                                                <span className="text-sm font-medium text-slate-600">{med.freq} for {med.duration}</span>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 max-w-xs w-full md:w-auto">
                                            <p className="text-sm text-yellow-800 italic font-medium text-center md:text-left">"{med.instr}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-6 flex justify-end border-t border-slate-100">
                    <button 
                        onClick={handleDispense}
                        disabled={isDispensing}
                        className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-green-600/20 disabled:opacity-75 flex items-center justify-center min-w-[200px] gap-2"
                    >
                        {isDispensing ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <><CheckCircle className="w-5 h-5"/> Mark Dispensed</>}
                    </button>
                </div>
            </div>
        </div>
    );
}
