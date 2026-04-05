'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PhoneOff, FileText, MessageSquare, Pill } from 'lucide-react';
import VideoConsult from '@/components/consultation/VideoConsult';
import RatingModal from '@/components/shared/RatingModal';
import { useState, useEffect, useRef } from 'react';

export default function PatientConsultationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    
    const doctorName = 'Dr. Sarah Smith';
    const appointmentTime = 'Today, 10:00 AM';
    
    const [showRating, setShowRating] = useState(false);
    const [incomingPrescription, setIncomingPrescription] = useState<any | null>(null);
    
    // Live Transcripts from the AI pipeline
    const [transcripts, setTranscripts] = useState<Array<{id: number, sender: string, original: string, translated: string}>>([]);
    const transcriptsEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        transcriptsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [transcripts]);

    useEffect(() => {
        const bc = new BroadcastChannel(`prescription_${params.id}`);
        bc.onmessage = (event) => {
            setIncomingPrescription(event.data);
        };
        return () => bc.close();
    }, [params.id]);

    const handleCallEnd = () => setShowRating(true);
    const handleModalClose = () => router.push('/patient/appointments');

    const roomNameStr = `SwasthyaSetu${params.id}`;

    return (
        <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)] bg-slate-50 overflow-hidden rounded-[2rem] shadow-2xl relative z-10 border border-slate-200/50 custom-scrollbar">
            
            {/* LEFT COLUMN - Video & Records */}
            <div className="w-full lg:w-[70%] h-full flex flex-col overflow-y-auto border-r border-slate-300">
                
                {/* BIG VIDEO STREAM PANEL */}
                <div className="w-full h-[450px] lg:h-[550px] shrink-0 bg-black flex flex-col z-20 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative">
                    <div className="h-14 bg-gradient-to-b from-slate-900/90 to-transparent flex items-center justify-between px-6 text-white absolute top-0 left-0 w-full z-30 pointer-events-none">
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                            <div>
                                <h1 className="font-bold text-sm tracking-wide leading-tight drop-shadow-md">{doctorName}</h1>
                                <p className="text-[10px] text-emerald-300 font-bold tracking-widest uppercase opacity-80">Connected</p>
                            </div>
                        </div>
                        <button onClick={handleCallEnd} className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 rounded-lg text-xs font-bold transition-all shadow-lg border border-red-500/50 hover:scale-105 active:scale-95">
                            <PhoneOff className="w-3.5 h-3.5" /> <span className="hidden sm:inline">End Call</span>
                        </button>
                    </div>
                    
                    <div className="flex-1 w-full bg-slate-950 relative">
                        <VideoConsult 
                            roomName={roomNameStr} 
                            userName={user?.name || 'Patient'} 
                            userRole="patient" 
                            onCallEnd={handleCallEnd}
                            onTranscript={(sender, original, translated) => {
                                setTranscripts(prev => [...prev, { id: Date.now(), sender, original, translated }]);
                            }}
                        />
                    </div>
                </div>

                {/* SCROLLABLE RECORDS BELOW VIDEO */}
                <div className="w-full p-6 sm:p-8 space-y-6 pb-20 bg-slate-50/50 flex-1">
                    
                    {incomingPrescription ? (
                        <div className="bg-white p-6 sm:p-8 rounded-[2rem] shadow-lg shadow-indigo-900/5 border border-indigo-100 animate-in slide-in-from-bottom-8 fade-in duration-700 ease-out">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shadow-sm">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Prescription Received</h3>
                                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span> Signed by {doctorName}
                                        </p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 px-4 py-2.5 rounded-xl border border-slate-200 transition-all active:scale-95 shadow-sm hidden sm:block">Print Document</button>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Clinical Diagnosis</span>
                                    <p className="text-slate-800 font-bold text-lg">{incomingPrescription.diagnosis}</p>
                                </div>
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
                                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Consultation Notes</span>
                                    <p className="text-slate-600 text-sm font-medium leading-relaxed">{incomingPrescription.complaint}</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="block text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Pill className="w-5 h-5 text-indigo-500" /> Authorized Medications
                                </span>
                                <div className="space-y-3">
                                    {incomingPrescription.medicines.map((m: any, mIdx: number) => (
                                        <div key={mIdx} className="bg-white border-l-4 border-indigo-500 border-y border-r border-y-slate-200 border-r-slate-200 rounded-r-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                                            <div>
                                                <h4 className="font-extrabold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">{m.name}</h4>
                                                <p className="text-sm font-bold text-slate-500 mt-1">{m.dosage}</p>
                                            </div>
                                            <div className="bg-slate-50 px-5 py-2.5 rounded-xl text-sm font-bold text-slate-700 border border-slate-100 flex items-center shadow-inner">
                                                <span className="text-indigo-600">{m.freq}</span> <span className="text-slate-300 font-black mx-2">•</span> <span>{m.duration} days</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200/60 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-20 h-20 bg-slate-50 shadow-inner rounded-full flex items-center justify-center border border-slate-100 mb-6 animate-pulse">
                                <FileText className="w-10 h-10 text-slate-300 relative -right-1" />
                            </div>
                            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Accessing Health Records...</h3>
                            <p className="text-slate-500 text-sm mt-3 max-w-sm font-medium leading-relaxed">When {doctorName} finishes writing your clinical notes and medication, the verified digital prescription will automatically appear here securely.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN - Live Chat and Subtitle Area */}
            <div className="w-full lg:w-[30%] h-[50vh] lg:h-full bg-white flex flex-col shadow-[-10px_0_20px_-5px_rgba(0,0,0,0.05)] relative z-30 border-l border-slate-200">
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
                            Call securely connected. Live transcripts will actively stream here instantly as the doctor speaks...
                        </div>
                    </div>
                    
                    {transcripts.map((t) => (
                        <div key={t.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 font-bold text-xs shadow-sm ${t.sender === 'Patient' ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-primary-100 border-primary-200 text-primary-700'}`}>
                                {t.sender === 'Patient' ? 'PAT' : 'DOC'}
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${t.sender === 'Patient' ? 'text-emerald-500' : 'text-primary-500'}`}>{t.sender}</span>
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
            
            {showRating && (
                <RatingModal doctorName={doctorName} onClose={handleModalClose} />
            )}
        </div>
    );
}
