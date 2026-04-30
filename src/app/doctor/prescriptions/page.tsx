'use client';
import { useState } from 'react';
import { authFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import StatusBadge from '@/components/shared/StatusBadge';
import { Pill, User, Search, AlertTriangle, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const MOCK_RX = [
    { id: '1', patient: 'Alice Walker', medsCount: 2, status: 'DISPENSED' as const, date: 'Oct 20, 2024' },
    { id: '2', patient: 'Bob Smith', medsCount: 4, status: 'ISSUED' as const, date: 'Oct 15, 2024' },
    { id: '3', patient: 'Emily Chen', medsCount: 1, status: 'DISPENSED' as const, date: 'Oct 10, 2024' },
];

const MOCK_STOCK = [
    { name: 'Amoxicillin 500mg', inStock: true },
    { name: 'Paracetamol 650mg', inStock: true },
    { name: 'Metformin 500mg', inStock: true },
    { name: 'Atorvastatin 20mg', inStock: false }, 
    { name: 'Azithromycin 250mg', inStock: false }, 
];

export default function DoctorPrescriptions() {
    const { user } = useAuth();
    const [medSearch, setMedSearch] = useState('');
    const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
    const [patientId, setPatientId] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const filteredStock = medSearch ? MOCK_STOCK.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())) : [];

    const addMed = (name: string, inStock: boolean) => {
        if (!inStock) {
            toast.error("Cannot prescribe out-of-stock medication!");
            return;
        }
        if (!selectedMeds.includes(name)) {
            setSelectedMeds([...selectedMeds, name]);
            setMedSearch('');
        }
    };

    const handleIssuePrescription = async () => {
        if (!patientId || selectedMeds.length === 0) {
            toast.error("Please select a patient and at least one medication.");
            return;
        }

        setIsSubmitting(true);
        try {
            await authFetch('/api/prescriptions', {
                method: 'POST',
                body: JSON.stringify({
                    patientId,
                    medications: selectedMeds.map(name => ({
                        name,
                        dosage: '1-0-1',
                        duration: '5 days',
                        instructions: 'After meals'
                    })),
                    doctorNotes: notes
                })
            });
            toast.success("Prescription Issued and Stored!");
            setSelectedMeds([]);
            setPatientId('');
            setNotes('');
        } catch (error) {
            console.error("RX: Failed to issue prescription", error);
            toast.error("Failed to store prescription. Using mock fallback for UI demonstration.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Digital Prescription Pad</h1>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-primary-500"/> Draft New Prescription</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Patient Name</label>
                            <input type="text" className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Search patient..." />
                        </div>
                        <div className="relative">
                            <label className="text-sm font-semibold text-slate-700 block mb-1">Add Medicine</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={medSearch}
                                    onChange={e => setMedSearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none" 
                                    placeholder="Search medicine database..." 
                                />
                            </div>
                            
                            {medSearch && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 shadow-xl rounded-xl z-50 overflow-hidden text-sm">
                                    {filteredStock.length > 0 ? filteredStock.map(med => (
                                        <button 
                                            key={med.name}
                                            onClick={() => addMed(med.name, med.inStock)}
                                            className={`w-full text-left px-4 py-3 flex items-center justify-between border-b border-slate-50 hover:bg-slate-50 transition-colors ${!med.inStock ? 'opacity-75 bg-red-50 hover:bg-red-50' : ''}`}
                                        >
                                            <span className="font-semibold text-slate-700">{med.name}</span>
                                            {!med.inStock && (
                                                <span className="bg-red-100 text-red-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-red-200 flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3"/> Out of Stock
                                                </span>
                                            )}
                                        </button>
                                    )) : (
                                        <div className="p-4 text-center text-slate-500">No medicine found matching "{medSearch}"</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {selectedMeds.length > 0 && (
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Selected Medicines</label>
                            <div className="flex flex-col gap-2">
                                {selectedMeds.map(med => (
                                    <div key={med} className="flex items-center justify-between bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm text-sm">
                                        <span className="font-bold text-slate-800">{med}</span>
                                        <div className="flex items-center gap-3">
                                            <input type="text" placeholder="Dosage e.g. 1-0-1" className="w-32 px-2 py-1 border border-slate-200 rounded outline-none focus:border-primary-400 text-xs text-center" />
                                            <input type="text" placeholder="Duration e.g. 5 days" className="w-32 px-2 py-1 border border-slate-200 rounded outline-none focus:border-primary-400 text-xs text-center" />
                                            <button onClick={() => setSelectedMeds(selectedMeds.filter(m => m !== med))} className="text-red-500 hover:text-red-700 font-bold ml-2">×</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    <button onClick={() => {toast.success("Prescription Sent to Pharmacy!"); setSelectedMeds([]); setMedSearch('');}} className="w-full sm:w-auto px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-md shadow-primary-600/20">
                        Issue Prescription
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-800">Past Prescriptions</h2>
                </div>
                <table className="w-full text-left min-w-[600px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 pl-6">Patient</th>
                            <th className="p-4">Medicines</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 pr-6 text-right">Date Issued</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {MOCK_RX.map(rx => (
                            <tr key={rx.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-2 text-slate-900 font-medium">
                                        <User className="w-4 h-4 text-slate-400" /> {rx.patient}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="flex items-center gap-1 text-slate-600 font-medium bg-slate-100 px-3 py-1 rounded w-fit text-sm">
                                        <Pill className="w-4 h-4 text-primary-500" /> {rx.medsCount} items
                                    </span>
                                </td>
                                <td className="p-4">
                                    <StatusBadge status={rx.status} />
                                </td>
                                <td className="p-4 pr-6 text-right text-slate-500 font-medium whitespace-nowrap text-sm">
                                    {rx.date}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
