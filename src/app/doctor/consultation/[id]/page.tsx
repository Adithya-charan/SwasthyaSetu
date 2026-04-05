'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Trash2, Plus, Save, User as UserIcon, PhoneOff, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import VideoConsult from '@/components/consultation/VideoConsult';

export default function DoctorConsultationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    
    // Form states
    const [complaint, setComplaint] = useState('');
    const [examination, setExamination] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [medicines, setMedicines] = useState([{ name: '', dosage: '', freq: 'Once daily', duration: 5, instructions: '' }]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Store latest synced prescription locally
    const [savedPrescriptions, setSavedPrescriptions] = useState<any[]>([]);
    
    // Live Transcripts from the AI pipeline
    const [transcripts, setTranscripts] = useState<Array<{id: number, sender: string, original: string, translated: string}>>([]);
    
    // Auto-scroll anchor for transcripts
    const transcriptsEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom whenever new transcripts arrive
    useEffect(() => {
        transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcripts]);

    const patientName = 'Alice Walker';
    const patientAge = '32 years';
    const appointmentDate = 'Oct 24, 2024';

    const handleCallEnd = () => toast.info("Call ended. You can finish your notes before submitting.");
    const handleAddMedicine = () => setMedicines([...medicines, { name: '', dosage: '', freq: 'Once daily', duration: 5, instructions: '' }]);
    const handleRemoveMedicine = (index: number) => { const newMeds = [...medicines]; newMeds.splice(index, 1); setMedicines(newMeds); };
    const handleMedicineChange = (index: number, field: string, value: any) => { const newMeds = [...medicines]; newMeds[index] = { ...newMeds[index], [field]: value }; setMedicines(newMeds); };

    const handleSubmitAll = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            const formData = { complaint, examination, diagnosis, medicines };
            const bc = new BroadcastChannel(`prescription_${params.id}`);
            bc.postMessage(formData);
            bc.close();
            
            setSavedPrescriptions(prev => [formData, ...prev]);
            setComplaint(''); setExamination(''); setDiagnosis(''); setMedicines([{ name: '', dosage: '', freq: 'Once daily', duration: 5, instructions: '' }]);
            setIsSubmitting(false); toast.success('Prescription submitted successfully!');
        }, 1500);
    };

    const roomNameStr = `SwasthyaSetu${params.id}`;

    return (
        <div className="flex flex-col lg:flex-row bg-slate-100 overflow-hidden w-full h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] rounded-[2rem] shadow-2xl relative z-10 custom-scrollbar border border-slate-200/50">
            
            {/* LEFT COLUMN - Video & Patient File & Prescription */}
            <div className="w-full lg:w-[70%] h-full overflow-y-auto flex flex-col border-r border-slate-300">
                
                {/* BIG VIDEO STREAM PANEL */}
                <div className="w-full h-[450px] lg:h-[550px] shrink-0 bg-black flex flex-col z-20 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative">
                    <div className="h-14 bg-gradient-to-b from-slate-900/90 to-transparent flex items-center justify-between px-6 text-white absolute top-0 left-0 w-full z-30 pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
                            <h1 className="font-bold text-sm tracking-wide drop-shadow-md">Doctor Video Room</h1>
                        </div>
                        <button onClick={handleCallEnd} className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-all shadow-lg border border-red-500/50 hover:scale-105 active:scale-95">
                            <PhoneOff className="w-3.5 h-3.5" /> <span>End Call</span>
                        </button>
                    </div>
                    <div className="flex-1 w-full bg-slate-950 relative">
                        <VideoConsult 
                            roomName={roomNameStr} 
                            userName={user?.name || 'Doctor'} 
                            userRole="doctor" 
                            onCallEnd={handleCallEnd}
                            onTranscript={(sender, original, translated) => {
                                setTranscripts(prev => [...prev, { id: Date.now(), sender, original, translated }]);
                            }}
                        />
                    </div>
                </div>

                {/* SCROLLABLE FILES BELOW VIDEO */}
                <div className="w-full p-6 sm:p-8 space-y-6 pb-20 bg-slate-50/50">
                    
                    {/* Patient Header Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 flex items-center justify-between transition-all hover:border-primary-200 hover:shadow-md">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-600 border border-primary-100 shadow-inner">
                                <UserIcon className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 tracking-tight">{patientName}</h2>
                                <p className="text-sm font-semibold text-slate-500 mt-0.5">{patientAge} <span className="mx-1">•</span> {appointmentDate}</p>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-100 shadow-sm flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Active File
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmitAll} className="space-y-6">
                        {/* Clinical Documentation */}
                        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                            <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center border border-primary-100"><Activity className="w-4 h-4" /></div>
                                Clinical Documentation
                            </h3>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-1.5 align-top">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Chief Complaint <span className="text-red-500">*</span></label>
                                    <input required type="text" className="w-full p-3 text-sm font-medium border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all shadow-sm" value={complaint} onChange={e => setComplaint(e.target.value)} placeholder="e.g. Constant headache" />
                                </div>
                                <div className="space-y-1.5 row-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Examination Notes</label>
                                    <textarea rows={5} className="w-full h-full p-3 text-sm font-medium border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none bg-slate-50 focus:bg-white transition-all shadow-sm" value={examination} onChange={e => setExamination(e.target.value)} placeholder="Full physical details..."></textarea>
                                </div>
                                <div className="space-y-1.5 align-top">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Diagnosis <span className="text-red-500">*</span></label>
                                    <input required type="text" className="w-full p-3 text-sm font-medium border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-50 focus:bg-white transition-all shadow-sm" value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="Final diagnosis" />
                                </div>
                            </div>
                        </div>

                        {/* Prescription Formulation */}
                        <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-2">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center border border-green-100"><Plus className="w-4 h-4" /></div>
                                    Medical Prescription
                                </h3>
                                <button type="button" onClick={handleAddMedicine} className="text-primary-600 hover:text-white hover:bg-primary-600 text-xs font-bold flex items-center gap-1.5 bg-primary-50 px-4 py-2 rounded-xl transition-colors border border-primary-100 hover:border-primary-600 shadow-sm active:scale-95">
                                    <Plus className="w-4 h-4" /> Add Compound
                                </button>
                            </div>

                            <div className="space-y-4">
                                {medicines.map((med, idx) => (
                                    <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 sm:p-4 flex flex-col md:flex-row gap-3 items-start md:items-center shadow-sm">
                                        <div className="w-6 h-6 bg-white shadow-sm text-slate-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200">{idx + 1}</div>
                                        <input required type="text" placeholder="Medicine Name" className="w-full md:w-[30%] p-2.5 text-sm font-semibold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm" value={med.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} />
                                        <input required type="text" placeholder="Dosage (e.g. 1 Tablet)" className="w-full md:w-[20%] p-2.5 text-sm font-semibold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm" value={med.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} />
                                        <select className="w-full md:w-[20%] p-2.5 text-sm font-semibold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white shadow-sm" value={med.freq} onChange={e => handleMedicineChange(idx, 'freq', e.target.value)}>
                                            <option>Once daily</option><option>Twice daily</option><option>Three times daily</option><option>As needed</option>
                                        </select>
                                        <div className="relative w-full md:w-[20%]">
                                            <input required type="number" min="1" placeholder="Days" className="w-full p-2.5 text-sm font-semibold border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white pr-10 shadow-sm" value={med.duration} onChange={e => handleMedicineChange(idx, 'duration', parseInt(e.target.value))} />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">days</span>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveMedicine(idx)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-lg transition-colors border border-transparent hover:border-red-100" title="Remove"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {medicines.length === 0 && (
                                    <p className="text-sm text-slate-500 font-medium text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-300">No medicines in current draft.</p>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-100 mt-6 md:px-8">
                                <button type="submit" disabled={isSubmitting} className="w-full shadow-lg shadow-primary-600/30 bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-75 flex justify-center items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]">
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2"><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span><span>Encrypting & Sending securely...</span></div>
                                    ) : (<><Save className="w-5 h-5" /> Push Prescription Automatically to Patient</>)}
                                </button>
                            </div>
                        </div>
                    </form>

                    {savedPrescriptions.length > 0 && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50/5">
                            <h3 className="text-sm font-bold text-emerald-800 border-b border-emerald-100 pb-2 mb-4 uppercase tracking-wide">Recently Sent Records</h3>
                            <div className="space-y-4">
                                {savedPrescriptions.map((rx, idx) => (
                                    <div key={idx} className="bg-white border border-emerald-100 rounded-xl p-5 shadow-sm text-sm hover:border-emerald-300 transition-colors">
                                        <p className="font-bold text-slate-800 mb-1 text-base">Diagnosis: {rx.diagnosis}</p>
                                        <p className="text-slate-600 mb-3 font-medium">Chief Complaint: {rx.complaint}</p>
                                        <ul className="list-disc list-inside text-slate-500 space-y-1 font-medium bg-emerald-50/50 p-3 rounded-lg">
                                            {rx.medicines.map((m: any, mIdx: number) => (
                                                <li key={mIdx}><span className="text-emerald-700 font-bold">{m.name}</span> - {m.dosage} ({m.freq} for {m.duration} days)</li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN - Live Chat and Subtitle Area */}
            <div className="w-full lg:w-[30%] h-[50vh] lg:h-full bg-white flex flex-col shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.05)] relative z-30">
                <div className="p-5 lg:p-6 border-b border-slate-100 bg-gradient-to-br from-indigo-50/40 to-white">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-0 bg-indigo-500/10 animate-pulse"></div>
                            <MessageSquare className="w-5 h-5 relative z-10" />
                        </div>
                        <div>
                            <span>Live Transcription</span>
                            <span className="block text-xs font-semibold text-slate-500 mt-0.5">Real-time captions & chat</span>
                        </div>
                    </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50/80">
                    <div className="bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded-full self-center mb-2 shadow-sm">Secure Line Established</div>
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700 font-bold text-xs shadow-sm">SYS</div>
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm text-sm text-slate-600 shadow-sm leading-relaxed font-medium">
                            Call securely connected. Live transcripts will actively stream here instantly as you speak...
                        </div>
                    </div>
                    
                    {transcripts.map((t) => (
                        <div key={t.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${t.sender === 'Doctor' ? 'bg-primary-100 border-primary-200 text-primary-700' : 'bg-emerald-100 border-emerald-200 text-emerald-700'}`}>
                                {t.sender === 'Doctor' ? 'DOC' : 'PAT'}
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${t.sender === 'Doctor' ? 'text-primary-500' : 'text-emerald-500'}`}>{t.sender}</span>
                                <div className="bg-white border border-slate-200 p-3.5 rounded-2xl rounded-tl-sm text-sm text-slate-800 shadow-sm leading-relaxed font-semibold">
                                    {t.translated ? t.translated : t.original}
                                </div>
                                {t.translated && t.original !== '' && (
                                    <div className="text-xs text-slate-400 italic">Target Match: {t.original}</div>
                                )}
                            </div>
                        </div>
                    ))}
                    
                    <div ref={transcriptsEndRef} />
                </div>

                <div className="p-4 sm:p-5 bg-white border-t border-slate-100 shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.02)]">
                    <div className="flex gap-3 relative">
                        <input type="text" placeholder="Type a secure message..." className="flex-1 p-3.5 text-sm font-medium border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 hover:bg-white transition-colors shadow-inner" disabled />
                        <button disabled className="bg-indigo-600 shadow-lg shadow-indigo-600/30 text-white px-6 py-3 font-bold text-sm rounded-2xl opacity-50 cursor-not-allowed">Send</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Ensure Activity is available for the module above
import { Activity } from 'lucide-react';
