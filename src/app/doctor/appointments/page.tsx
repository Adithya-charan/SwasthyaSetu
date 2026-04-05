'use client';
import { useState } from 'react';
import AppointmentCard from '@/components/shared/AppointmentCard';

const MOCK_APPOINTMENTS = [
    { id: 1, name: 'Alice Walker', roleLabel: 'Patient', date: 'Oct 24, 2024', time: '10:00 AM', status: 'PENDING' as const },
    { id: 2, name: 'Bob Smith', roleLabel: 'Patient', date: 'Oct 24, 2024', time: '02:30 PM', status: 'CONFIRMED' as const },
    { id: 3, name: 'Emily Chen', roleLabel: 'Patient', date: 'Oct 25, 2024', time: '11:15 AM', status: 'CONFIRMED' as const },
];

export default function DoctorAppointments() {
    const [apps, setApps] = useState<{ id: number; name: string; roleLabel: string; date: string; time: string; status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' }[]>(MOCK_APPOINTMENTS);

    const handleConfirm = (id: number) => {
        setApps(apps.map(a => a.id === id ? { ...a, status: 'CONFIRMED' as const } : a));
    };

    const handleCancel = (id: number) => {
        setApps(apps.map(a => a.id === id ? { ...a, status: 'CANCELLED' as const } : a));
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Patient Appointments</h1>

            <div className="space-y-4">
                {apps.map(apt => (
                    <AppointmentCard
                        key={apt.id}
                        name={apt.name}
                        roleLabel={apt.roleLabel as any}
                        date={apt.date}
                        time={apt.time}
                        status={apt.status}
                        actionButtonText={apt.status === 'PENDING' ? 'Confirm' : apt.status === 'CONFIRMED' ? 'Start Consultation' : undefined}
                        onActionClick={() => {
                            if (apt.status === 'PENDING') handleConfirm(apt.id);
                            else if (apt.status === 'CONFIRMED') window.location.href = `/doctor/consultation/${apt.id}`;
                        }}
                        secondaryActionText={apt.status === 'PENDING' ? 'Cancel' : undefined}
                        onSecondaryClick={() => handleCancel(apt.id)}
                    />
                ))}
            </div>
        </div>
    );
}
