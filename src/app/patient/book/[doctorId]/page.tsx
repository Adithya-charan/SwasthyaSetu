'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Clock, User, ChevronLeft, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';
import { authFetch } from '@/lib/api';

export default function BookAppointmentPage({ params }: { params: { doctorId: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const [doctor, setDoctor] = useState<any>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [reason, setReason] = useState('');

    useEffect(() => {
        const loadDoctor = async () => {
            try {
                // Fetch the real doctor profile from the backend
                const data = await authFetch(`/api/doctors/${params.doctorId}`);
                setDoctor(data.data);
            } catch (error) {
                console.error("Failed to load doctor profile", error);
                toast.error("Doctor profile not found");
            } finally {
                setIsLoading(false);
            }
        };
        if (params.doctorId) loadDoctor();
    }, [params.doctorId]);

    const handleConfirmBooking = async () => {
        if (!reason.trim()) {
            toast.warning("Please provide a reason for the visit");
            return;
        }

        setIsBooking(true);
        try {
            const scheduledDate = new Date(Date.now() + 3600000);
            const formattedDate = scheduledDate.toISOString().split('.')[0]; // Removes milliseconds and Z
            
            const payload = {
                doctorId: params.doctorId,
                scheduledAt: formattedDate,
                reason: reason
            };
            
            await authFetch('/api/appointments', {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            setIsConfirmed(true);
            toast.success("Appointment Scheduled Successfully!");
        } catch (error) {
            console.error("Booking error:", error);
            toast.error(error instanceof Error ? error.message : "Failed to book appointment. Doctor might be busy.");
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    if (isConfirmed) {
        return (
            <div className="max-w-xl mx-auto py-20 text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-600/10">
                    <CheckCircle className="w-12 h-12" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Appointment Confirmed!</h1>
                <p className="text-slate-500 mb-10">Your session with {doctor?.user?.fullName || 'the specialist'} has been scheduled. You can join the call from your dashboard at the scheduled time.</p>
                <Button onClick={() => router.push('/patient/dashboard')} size="lg" className="px-12 bg-slate-900">Go to Dashboard</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
                <ChevronLeft className="w-5 h-5" /> Back to Search
            </button>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 rounded-3xl bg-slate-50 flex items-center justify-center shadow-lg text-slate-300">
                                <User className="w-12 h-12" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">{doctor?.user?.fullName || 'Specialist Doctor'}</h1>
                                <p className="text-primary-600 font-bold uppercase tracking-widest text-xs mt-1">{doctor?.specialization || 'General Physician'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Appointment Date</label>
                                <div className="flex items-center gap-2 font-bold text-slate-700">
                                    <Calendar className="w-4 h-4 text-primary-500" /> Today, {new Date().toLocaleDateString()}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Available Time</label>
                                <div className="flex items-center gap-2 font-bold text-slate-700">
                                    <Clock className="w-4 h-4 text-primary-500" /> Immediate (Next Slot)
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-bold text-slate-900">Reason for Visit</h3>
                            <textarea 
                                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-primary-500 outline-none min-h-[120px] transition-all" 
                                placeholder="Tell the doctor about your symptoms..." 
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="md:col-span-1">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 sticky top-8 shadow-2xl">
                        <div className="space-y-2 text-center">
                            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold">Secure Booking</h3>
                            <p className="text-slate-400 text-sm">Your consultation is secure and private.</p>
                        </div>

                        <div className="bg-slate-800/50 p-6 rounded-2xl text-center">
                            <p className="text-xs text-slate-300 leading-relaxed font-medium uppercase tracking-wider">
                                Direct connection with verified medical specialist.
                            </p>
                        </div>

                        <Button 
                            isFullWidth 
                            size="lg" 
                            className="bg-primary-500 hover:bg-primary-400 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all"
                            onClick={handleConfirmBooking}
                            disabled={isBooking}
                        >
                            {isBooking ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Appointment'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
