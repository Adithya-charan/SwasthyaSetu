'use client';
import { ReactNode } from 'react';

interface StatCardProps {
    icon: ReactNode;
    value: string | number;
    label: string;
    accentColor?: 'primary' | 'green' | 'blue' | 'purple' | 'yellow' | 'red';
}

export default function StatCard({ icon, value, label, accentColor = 'primary' }: StatCardProps) {
    const colorStyles = {
        primary: 'bg-primary-50 text-primary-600',
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        red: 'bg-red-50 text-red-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${colorStyles[accentColor]}`}>
                {icon}
            </div>
            <div>
                <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">{label}</p>
            </div>
        </div>
    );
}
