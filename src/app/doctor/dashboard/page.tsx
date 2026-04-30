'use client';
import { useState, useEffect } from 'react';
import { Calendar, Users, Pill, Activity, UserPlus, Loader2 } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

export default function DoctorDashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Fetch appointments for the logged in doctor
                const data = await fetchApi('/api/appointments/my');
                setAppointments(data.data.content || []);
            } catch (error) {
                console.warn("DASHBOARD: Failed to fetch live data, using Demo Data", error);
                setAppointments([{
                    id: 'demo-appt-doc-123',
                    patientId: 'demo-pat-456',
                    patientName: 'Adithya Charan',
                    scheduledAt: new Date().toISOString(),
                    status: 'CONFIRMED'
                }]);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name || 'Doctor'}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<Calendar className="w-6 h-6" />} value="8" label="Today's Appointments" accentColor="primary" />
                <StatCard icon={<Users className="w-6 h-6" />} value="1,240" label="Total Patients Seen" accentColor="blue" />
                <StatCard icon={<Pill className="w-6 h-6" />} value="850" label="Prescriptions Issued" accentColor="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Today's Schedule</h2>
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : appointments.length > 0 ? (
                        <div className="space-y-4">
                            {appointments.map((apt: any) => (
                                <AppointmentCard
                                    key={apt.id}
                                    name={apt.patientName || "Adithya Charan (Patient)"}
                                    roleLabel="Patient"
                                    date={new Date(apt.scheduledAt).toLocaleDateString()}
                                    time={new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    status={apt.status.toUpperCase()}
                                    actionButtonText={['PENDING', 'CONFIRMED', 'IN_PROGRESS'].includes(apt.status) ? 'Start Call' : undefined}
                                    onActionClick={() => window.open(`/doctor/consultation/${apt.id}`, '_blank')}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 border border-slate-200 border-dashed text-center">
                            <p className="text-slate-500">No appointments scheduled for today.</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-slate-800">Recent Patients</h2>
                    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
                        <div className="text-center p-6 text-slate-500 text-sm italic">
                            No recent patients found.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
