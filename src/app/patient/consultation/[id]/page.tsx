'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { PhoneOff, MessageSquare, FileText, ClipboardList, ShieldCheck, Download, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import VideoConsult from '@/components/consultation/VideoConsult';
import { fetchApi } from '@/lib/api';

export default function PatientConsultationPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'chat' | 'prescription'>('chat');
    const [isLoading, setIsLoading] = useState(true);
    const [roomName, setRoomName] = useState('');
    
    // Mock prescription received from doctor
    const [receivedRx, setReceivedRx] = useState<any>(null);
    const [doctorData, setDoctorData] = useState<any>({ name: 'Doctor' });

    useEffect(() => {
        const loadConsultation = async () => {
            try {
                // Fetch appointment to get doctor info
                const apptResponse = await fetchApi(`/api/appointments/${params.id}`);
                const appt = apptResponse.data;
                setDoctorData({ name: appt.doctorName || "Dr. Sharma (Specialist)" });

                // Fetch real video room name
                const roomResponse = await fetchApi(`/api/appointments/${params.id}/video-room`);
                setRoomName(roomResponse.data.video_room_name);
            } catch (error) {
                console.warn("Failed to load patient consultation, using Demo Room:", error);
                setDoctorData({ name: "Dr. Sharma (Specialist)" });
                setRoomName("DemoConsultationRoom-" + params.id.substring(0, 5));
            } finally {
                setIsLoading(false);
            }
        };

        if (params.id) loadConsultation();
    }, [params.id, router]);

    useEffect(() => {
        // Poll for prescriptions every 5 seconds
        const checkRx = () => {
            const allRx = JSON.parse(localStorage.getItem('mockPrescriptions') || '[]');
            const myRx = allRx.find((rx: any) => rx.patientName === (user?.name || 'Alice Walker'));
            if (myRx) {
                setReceivedRx(myRx);
                toast.success("Prescription received from Doctor!");
            }
        };
        const interval = setInterval(checkRx, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleCallEnd = () => {
        toast.info("Consultation finished. You can view your prescription in the dashboard.");
        router.push('/patient/dashboard');
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-80px)] bg-slate-900 overflow-hidden">
            
            {/* LEFT SIDE: VIDEO (65%) */}
            <div className="flex-1 relative bg-black flex flex-col">
                <div className="absolute top-4 left-4 z-20 flex items-center gap-3 bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_green]"></div>
                    <span className="text-white text-xs font-bold uppercase tracking-widest">Consulting with {doctorData.name}</span>
                </div>
                
                <div className="flex-1 w-full">
                    <VideoConsult 
                        roomName={roomName} 
                        userName={user?.name || 'Patient'} 
                        userRole="patient" 
                        onCallEnd={handleCallEnd}
                    />
                </div>
            </div>

            {/* RIGHT SIDE: TABS (35%) */}
            <div className="w-[450px] bg-white flex flex-col shadow-2xl z-30">
                <div className="flex bg-slate-100 p-1.5 m-4 rounded-2xl">
                    <button 
                        onClick={() => setActiveTab('chat')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'chat' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <MessageSquare className="w-4 h-4" /> Live Chat
                    </button>
                    <button 
                        onClick={() => setActiveTab('prescription')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black uppercase tracking-wider transition-all ${activeTab === 'prescription' ? 'bg-white text-primary-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <ClipboardList className="w-4 h-4" /> Prescription
                    </button>
                </div>

                {activeTab === 'chat' ? (
                    <div className="flex-1 flex flex-col bg-slate-50 animate-in slide-in-from-right duration-500">
                        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
                                <MessageSquare className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Live Specialist Interaction</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">Secure communication with {doctorData.name}. All messages are automatically translated to your preference.</p>
                            </div>
                            <div className="w-full p-4 bg-white border border-slate-200 rounded-2xl shadow-sm italic text-[10px] text-slate-400">
                                (Chat panel is integrated on the video screen for instant communication)
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in slide-in-from-right duration-500 custom-scrollbar">
                        {receivedRx ? (
                            <div className="space-y-6">
                                <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                    <span className="text-xs text-emerald-800 font-bold">Official E-Prescription Received</span>
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Diagnosis</label>
                                        <p className="text-lg font-bold text-slate-900">{receivedRx.diagnosis}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Medications</label>
                                        <div className="space-y-2">
                                            {receivedRx.medicines.map((med: any, i: number) => (
                                                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                    <span className="font-bold text-slate-800">{med.name}</span>
                                                    <span className="text-xs bg-white px-2 py-1 rounded-md border border-slate-200">{med.dosage}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all shadow-xl">
                                    <Download className="w-5 h-5" /> Download PDF
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center animate-pulse">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Waiting for Doctor...</p>
                                    <p className="text-slate-400 text-[10px] mt-1 max-w-[180px]">Your prescription will appear here once the doctor finalizes the visit.</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
