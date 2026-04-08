'use client';
import { useState, useEffect } from 'react';
import { Calendar, Users, Pill, Activity, UserPlus, Loader2 } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import AppointmentCard from '@/components/shared/AppointmentCard';
import { fetchApi } from '@/lib/api';
import Link from 'next/link';

export default function DoctorDashboard() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Fetch appointments for the logged in doctor
                const data = await fetchApi('/api/appointments/my');
                setAppointments(data.data.content || []);
            } catch (error) {
                console.error("DASHBOARD: Failed to fetch live data", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDashboard();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Doctor Dashboard</h1>
            
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
                                    name={`Patient #${apt.patientId.substring(0, 8)}`}
                                    roleLabel="Patient"
                                    date={new Date(apt.scheduledAt).toLocaleDateString()}
                                    time={new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    status={apt.status.toUpperCase()}
                                    actionButtonText="Start Call"
                                    onActionClick={() => window.location.href = `/doctor/consultation/${apt.id}`}
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
                        {['Alice Walker', 'John Doe', 'Emily Chen'].map((name, i) => (
                            <Link key={i} href={`/doctor/patients`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center">
                                    <Activity className="w-5 h-5"/>
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-medium text-slate-900 group-hover:text-primary-600 transition-colors">{name}</h4>
                                    <p className="text-xs text-slate-500">Last visit: 2 days ago</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
