'use client';
import { Pill, Clock, CheckCircle } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Download, FileText } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PharmacistDashboard() {
    
    const handlePrint = () => {
        toast.success("Downloading today's dispensing report...");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Pharmacist Dashboard</h1>
                <button onClick={handlePrint} className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl font-medium shadow-sm transition-colors w-full sm:w-auto justify-center">
                    <Download className="w-4 h-4"/> Daily Report
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Clock className="w-6 h-6" />} value="12" label="Pending Prescriptions" accentColor="yellow" />
                <StatCard icon={<CheckCircle className="w-6 h-6" />} value="35" label="Dispensed Today" accentColor="green" />
                <StatCard icon={<Pill className="w-6 h-6" />} value="1,204" label="Total Dispensed" accentColor="primary" />
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
                    <Clock className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">Prescription Queue</h2>
                    <p className="text-slate-500 max-w-sm mb-6">You have 12 pending prescriptions waiting to be dispensed to patients.</p>
                </div>
                <Link href="/pharmacist/queue">
                    <Button size="lg" className="px-8 shadow-lg shadow-primary-600/20">Go to Queue</Button>
                </Link>
            </div>
        </div>
    );
}
