'use client';

import { useState, useEffect } from 'react';
import { Pill, Search, Activity, FileText, CheckCircle, IndianRupee, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

interface Medicine {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
    price?: number;
    available?: boolean;
}

interface Prescription {
    id: string;
    patientName: string;
    patientPhone: string;
    doctorName: string;
    date: string;
    diagnosis: string;
    medicines: Medicine[];
    status: 'pending' | 'processing' | 'billed' | 'dispatched';
    totalAmount?: number;
}

// Mock initial data
const initialPrescriptions: Prescription[] = [
    {
        id: "PR-2024-1001",
        patientName: "Ramesh Kumar",
        patientPhone: "9876543210",
        doctorName: "Dr. Arjun Sharma",
        date: new Date().toISOString(),
        diagnosis: "Viral Fever",
        status: 'pending',
        medicines: [
            { name: "Paracetamol 500mg", dosage: "1 Tablet", frequency: "Twice a day", duration: "5 Days", instructions: "After food" },
            { name: "Azithromycin 250mg", dosage: "1 Tablet", frequency: "Once a day", duration: "3 Days", instructions: "After food" }
        ]
    }
];

export default function PharmacistPrescriptions() {
    const [prescriptions, setPrescriptions] = useState<Prescription[]>(initialPrescriptions);
    const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null);
    const [isGeneratingBill, setIsGeneratingBill] = useState(false);

    useEffect(() => {
        // Socket.io for real-time new prescriptions
        const socket = io(process.env.NEXT_PUBLIC_NODE_SERVER_URL || 'http://localhost:3001');
        // This is a placeholder for receiving real-time prescriptions
        socket.on('new_prescription', (data: Prescription) => {
            setPrescriptions(prev => [data, ...prev]);
            toast.info(`New prescription received for ${data.patientName}`);
        });

        return () => { socket.disconnect(); };
    }, []);

    const handleSelect = (p: Prescription) => {
        setSelectedPrescription({ ...p }); // Create a copy so we can edit prices safely
    };

    const handleMedicineChange = (index: number, field: keyof Medicine, value: any) => {
        if (!selectedPrescription) return;
        const newMeds = [...selectedPrescription.medicines];
        newMeds[index] = { ...newMeds[index], [field]: value };
        
        let newTotal = 0;
        newMeds.forEach(m => {
            if (m.available !== false && m.price) newTotal += m.price;
        });

        setSelectedPrescription({ ...selectedPrescription, medicines: newMeds, totalAmount: newTotal });
    };

    const handleGenerateBill = () => {
        setIsGeneratingBill(true);
        setTimeout(() => {
            if (selectedPrescription) {
                setPrescriptions(prev => prev.map(p => p.id === selectedPrescription.id ? { ...selectedPrescription, status: 'billed' } : p));
                setSelectedPrescription({ ...selectedPrescription, status: 'billed' });
            }
            setIsGeneratingBill(false);
            toast.success("Bill Generated Successfully");
        }, 1000);
    };

    const handleSendPaymentRequest = () => {
        // Simulated SMS and Notification Send
        toast.success(`Payment request of ₹${selectedPrescription?.totalAmount} sent to ${selectedPrescription?.patientPhone} via SMS & In-app Notification!`);
        // Move to Dispatched
        setPrescriptions(prev => prev.map(p => p.id === selectedPrescription?.id ? { ...p, status: 'dispatched' } : p));
        setSelectedPrescription(null);
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex gap-6">
            {/* LEFT: Queue List */}
            <div className="w-1/3 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 flex items-center gap-2"><Pill className="w-5 h-5 text-primary-500" /> Prescription Queue</h2>
                    <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-1 rounded-full">{prescriptions.filter(p => p.status === 'pending').length} New</span>
                </div>
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" placeholder="Search Patient or ID..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {prescriptions.filter(p => p.status !== 'dispatched').map(p => (
                        <div 
                            key={p.id} 
                            onClick={() => handleSelect(p)}
                            className={`p-4 rounded-xl cursor-pointer border transition-all ${selectedPrescription?.id === p.id ? 'bg-primary-50 border-primary-300 shadow-sm' : 'bg-white border-slate-200 hover:border-primary-300 hover:shadow-sm'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-900">{p.patientName}</h3>
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${p.status === 'billed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {p.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium">By {p.doctorName}</p>
                            <p className="text-xs text-slate-400 mt-1">{new Date(p.date).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT: Detail View & Fulfillment */}
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 h-full overflow-hidden flex flex-col">
                {selectedPrescription ? (
                    <>
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2"><FileText className="w-6 h-6 text-primary-600"/> {selectedPrescription.id}</h2>
                                <p className="text-slate-500 font-medium mt-1">Patient: {selectedPrescription.patientName} | Contact: {selectedPrescription.patientPhone}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-slate-800">{selectedPrescription.doctorName}</p>
                                <p className="text-sm text-slate-500">Diagnosis: {selectedPrescription.diagnosis}</p>
                            </div>
                        </div>
                        
                        <div className="flex-1 p-6 overflow-y-auto">
                            <h3 className="font-bold text-slate-800 mb-4">Prescribed Medicines</h3>
                            <div className="space-y-4">
                                {selectedPrescription.medicines.map((med, idx) => (
                                    <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-900">{med.name}</h4>
                                            <p className="text-sm text-slate-600">{med.dosage} • {med.frequency} • {med.duration}</p>
                                            <p className="text-xs text-slate-400 mt-1">Instructions: {med.instructions}</p>
                                        </div>
                                        
                                        {selectedPrescription.status === 'pending' || selectedPrescription.status === 'processing' ? (
                                            <div className="flex items-center gap-4 border-l border-slate-200 pl-4 ml-4">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={med.available !== false} 
                                                        onChange={(e) => handleMedicineChange(idx, 'available', e.target.checked)}
                                                        className="w-4 h-4 text-primary-600 rounded border-slate-300"
                                                    />
                                                    <span className="text-sm font-medium text-slate-700">Available</span>
                                                </label>
                                                <div className="relative w-32">
                                                    <IndianRupee className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input 
                                                        type="number" 
                                                        placeholder="Price" 
                                                        disabled={med.available === false}
                                                        value={med.price || ''}
                                                        onChange={(e) => handleMedicineChange(idx, 'price', Number(e.target.value))}
                                                        className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none disabled:bg-slate-100 disabled:opacity-50"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-right border-l border-slate-200 pl-4 ml-4 min-w-[100px]">
                                                {med.available === false ? (
                                                    <span className="text-red-500 font-bold text-sm">Unavailable</span>
                                                ) : (
                                                    <span className="text-slate-900 font-black text-lg">₹{med.price || 0}</span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-lg font-bold text-slate-700">Total Amount:</span>
                                <span className="text-3xl font-black text-primary-700 flex items-center"><IndianRupee className="w-7 h-7" /> {selectedPrescription.totalAmount || 0}</span>
                            </div>
                            
                            {selectedPrescription.status !== 'billed' ? (
                                <Button 
                                    isFullWidth size="lg" 
                                    onClick={handleGenerateBill}
                                    disabled={!selectedPrescription.totalAmount || selectedPrescription.totalAmount <= 0 || isGeneratingBill}
                                >
                                    {isGeneratingBill ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Bill'}
                                </Button>
                            ) : (
                                <Button 
                                    isFullWidth size="lg" 
                                    onClick={handleSendPaymentRequest}
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Send className="w-5 h-5 mr-2" /> Send Payment Request to Patient
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <Activity className="w-16 h-16 mb-4 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-600 mb-2">Select a Prescription</h3>
                        <p className="max-w-xs">Click on a prescription from the queue to view details, verify stock, and generate a bill.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
