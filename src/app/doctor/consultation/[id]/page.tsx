'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Save, PhoneOff, ClipboardList, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import VideoConsult from '@/components/consultation/VideoConsult';
import { fetchApi } from '@/lib/api';

export default function DoctorConsultationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    
    // UI State
    const [activeTab, setActiveTab] = useState<'prescription' | 'chat'>('prescription');
    const [isLoading, setIsLoading] = useState(true);
    const [roomName, setRoomName] = useState('');

    // Form states
    const [complaint, setComplaint] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', freq: 'Once daily', duration: 5, instructions: '' }]);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [patientData, setPatientData] = useState<any>({ name: 'Patient', age: 'N/A' });

    useEffect(() => {
        const loadConsultationData = async () => {
            try {
                // 1. Fetch Appointment to get patient name
                const apptResponse = await fetchApi(`/api/appointments/${params.id}`);
                const appt = apptResponse.data;
                setPatientData({ 
                    name: appt.patientName || `Patient #${appt.patientId.substring(0, 8)}`, 
                    age: 'N/A' 
                });

                // 2. Fetch/Create Video Room Name from backend
                const roomResponse = await fetchApi(`/api/appointments/${params.id}/video-room`);
                setRoomName(roomResponse.data.video_room_name);
            } catch (error) {
                console.warn("Failed to load consultation data, using Demo Room", error);
                setPatientData({ name: "Adithya Charan", age: '24' });
                setRoomName("DemoConsultationRoom-" + params.id.substring(0, 5));
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) loadConsultationData();
    }, [params.id, router]);

    const handleCallEnd = () => {
        toast.info(`Consultation with ${patientData.name} ended.`);
    };

    const handleAddMedicine = () => setMedicines([...medicines, { name: '', dosage: '', freq: 'Once daily', duration: 5, instructions: '' }]);
    const handleRemoveMedicine = (index: number) => { const newMeds = [...medicines]; newMeds.splice(index, 1); setMedicines(newMeds); };
    const handleMedicineChange = (index: number, field: string, value: any) => { const newMeds = [...medicines]; newMeds[index] = { ...newMeds[index], [field]: value }; setMedicines(newMeds); };

    const handleSubmitAll = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!complaint || !diagnosis || medicines.length === 0) {
            toast.error("Please complete all mandatory prescription fields.");
            return;
        }
        setIsSubmitting(true);
        
        try {
            // Call the real backend to save the summary and generate AI report
            const payload = {
                chiefComplaint: complaint,
                diagnosis: diagnosis,
                medicineList: medicines.map(m => `${m.name} (${m.dosage}) - ${m.freq} for ${m.duration} days`).join('\n'),
                notes: notes,
                language: 'English'
            };

            await fetchApi(`/api/consultations/${params.id}/summary`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            await fetchApi(`/api/appointments/${params.id}/complete`, { method: 'PUT' });

            toast.success('Consultation Finalized & Summary Saved!');
            router.push('/doctor/dashboard');
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("Failed to save consultation summary");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-950 overflow-hidden">
            
            {/* LEFT SIDE: LARGE VIDEO (60%) */}
            <div className="flex-1 relative bg-black flex flex-col">
                <div className="absolute top-6 left-6 z-20 flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl px-6 py-3 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]"></div>
                    <div className="flex flex-col">
                        <span className="text-white text-xs font-black uppercase tracking-widest">Live Consultation</span>
                        <span className="text-slate-300 text-[10px] font-bold">{patientData.name}</span>
                    </div>
                </div>
                
                <div className="flex-1 w-full">
                    <VideoConsult 
                        roomName={roomName} 
                        userName={user?.name || 'Doctor'} 
                        userRole="doctor" 
                        onCallEnd={handleCallEnd}
                    />
                </div>
            </div>

            {/* RIGHT SIDE: ENLARGED PRESCRIPTION & CHAT (40%) */}
            <div className="w-[550px] bg-white flex flex-col shadow-2xl z-30 border-l border-slate-200">
                {/* Tab Switcher */}
                <div className="flex bg-slate-100 p-1.5 m-6 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('prescription')}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'prescription' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ClipboardList className="w-5 h-5" /> E-Prescription
                    </button>
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'chat' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <MessageSquare className="w-5 h-5" /> Live Patient Chat
                    </button>
                </div>

                {activeTab === 'prescription' ? (
                    <div className="flex-1 overflow-y-auto px-8 space-y-8 flex flex-col animate-in slide-in-from-right duration-500 custom-scrollbar">
                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                            <p className="text-xs text-amber-800 font-medium leading-relaxed">Ensure all medication dosages are verified before dispatching to the pharmacist.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chief Complaint <span className="text-red-500">*</span></label>
                                <textarea className="w-full p-4 text-base bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-medium" rows={2} value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="What are the patient symptoms?" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Final Diagnosis <span className="text-red-500">*</span></label>
                                <input className="w-full p-4 text-base bg-slate-50 border-2 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all font-bold" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Diagnosis name..." />
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 border-t-2 border-slate-50">
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Medication List</label>
                                <button onClick={handleAddMedicine} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-primary-100 transition-all">
                                    <Plus className="w-4 h-4" /> Add Med
                                </button>
                            </div>
                            <div className="space-y-4">
                                {medicines.map((med, idx) => (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 relative group transition-all hover:border-primary-200">
                                        <div className="grid grid-cols-1 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase">Medicine Name</label>
                                                <input className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white font-bold" value={med.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase">Dosage</label>
                                                    <input className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white" placeholder="e.g. 500mg" value={med.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase">Days</label>
                                                    <input className="w-full text-sm p-3 rounded-xl border border-slate-200 bg-white" type="number" value={med.duration} onChange={e => handleMedicineChange(idx, 'duration', parseInt(e.target.value))} />
                                                </div>
                                            </div>
                                        </div>
                                        <select className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-bold uppercase tracking-wider" value={med.freq} onChange={e => handleMedicineChange(idx, 'freq', e.target.value)}>
                                            <option>Once daily (OD)</option>
                                            <option>Twice daily (BD)</option>
                                            <option>Thrice daily (TDS)</option>
                                            <option>As needed (SOS)</option>
                                        </select>
                                        {idx > 0 && (
                                            <button onClick={() => handleRemoveMedicine(idx)} className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-2 shadow-lg border border-red-50 transition-transform hover:scale-110">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-auto py-8 border-t-2 border-slate-50 sticky bottom-0 bg-white">
                            <button 
                                onClick={handleSubmitAll}
                                disabled={isSubmitting}
                                className="w-full py-5 bg-emerald-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                Finalize & Dispatch to Pharma
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col animate-in slide-in-from-right duration-500 h-full">
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                <MessageSquare className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Live Patient Interaction</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">Secure, real-time messaging with {patientData.name}. All communications are private and encrypted.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
