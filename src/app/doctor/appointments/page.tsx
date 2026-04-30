'use client';
import { useState, useEffect } from 'react';
import AppointmentCard from '@/components/shared/AppointmentCard';
import { fetchApi } from '@/lib/api';
import { Loader2, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DoctorAppointments() {
    const [apps, setApps] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAppointments = async () => {
        setIsLoading(true);
        try {
            // Fetch appointments for the logged-in doctor
            const data = await fetchApi('/api/appointments/my');
            setApps(data.data.content || []);
        } catch (error) {
            console.error("Failed to load doctor appointments", error);
            toast.error("Failed to fetch appointments");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleConfirm = async (id: string) => {
        try {
            await fetchApi(`/api/appointments/${id}/confirm`, { method: 'PUT' });
            toast.success("Appointment confirmed");
            loadAppointments();
        } catch (error) {
            toast.error("Failed to confirm appointment");
        }
    };

    const handleCancel = async (id: string) => {
        const reason = prompt("Enter reason for cancellation:");
        if (!reason) return;
        try {
            await fetchApi(`/api/appointments/${id}/cancel?reason=${encodeURIComponent(reason)}`, { method: 'PUT' });
            toast.success("Appointment cancelled");
            loadAppointments();
        } catch (error) {
            toast.error("Failed to cancel appointment");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900">Patient Appointments</h1>
                <button 
                    onClick={loadAppointments}
                    className="p-2 bg-white rounded-xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all text-slate-600"
                >
                    <Calendar className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
                        <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                        <p className="text-slate-500 font-medium">Fetching your appointments...</p>
                    </div>
                ) : apps.length > 0 ? (
                    apps.map(apt => (
                        <AppointmentCard
                            key={apt.id}
                            name={apt.patientName || "Adithya Charan (Patient)"}
                            roleLabel="Patient"
                            date={new Date(apt.scheduledAt).toLocaleDateString()}
                            time={new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            status={apt.status.toUpperCase()}
                            actionButtonText={apt.status === 'PENDING' ? 'Confirm' : ['CONFIRMED', 'IN_PROGRESS'].includes(apt.status) ? 'Start Consultation' : undefined}
                            onActionClick={() => {
                                if (apt.status === 'PENDING') handleConfirm(apt.id);
                                else if (['CONFIRMED', 'IN_PROGRESS'].includes(apt.status)) window.open(`/doctor/consultation/${apt.id}`, '_blank');
                            }}
                            secondaryActionText={apt.status === 'PENDING' ? 'Cancel' : undefined}
                            onSecondaryClick={() => handleCancel(apt.id)}
                        />
                    ))
                ) : (
                    <div className="bg-white rounded-xl p-24 border-2 border-slate-100 border-dashed text-center flex flex-col items-center">
                        <Calendar className="w-12 h-12 text-slate-200 mb-4" />
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No Appointments Found</h3>
                        <p className="text-slate-500 max-w-xs">When patients book consultations with you, they will appear here automatically.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
