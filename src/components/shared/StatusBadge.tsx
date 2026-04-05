'use client';

interface StatusBadgeProps {
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ISSUED' | 'DISPENSED' | 'ACTIVE' | 'INACTIVE';
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const statusMap: Record<string, { label: string, classes: string }> = {
        PENDING: { label: 'Pending', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        CONFIRMED: { label: 'Confirmed', classes: 'bg-blue-50 text-blue-700 border-blue-200' },
        IN_PROGRESS: { label: 'In Progress', classes: 'bg-purple-50 text-purple-700 border-purple-200' },
        COMPLETED: { label: 'Completed', classes: 'bg-green-50 text-green-700 border-green-200' },
        CANCELLED: { label: 'Cancelled', classes: 'bg-red-50 text-red-700 border-red-200' },
        ISSUED: { label: 'Issued', classes: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
        DISPENSED: { label: 'Dispensed', classes: 'bg-green-50 text-green-700 border-green-200' },
        ACTIVE: { label: 'Active', classes: 'bg-green-50 text-green-700 border-green-200' },
        INACTIVE: { label: 'Inactive', classes: 'bg-slate-50 text-slate-700 border-slate-200' }
    };

    const config = statusMap[status] || { label: status, classes: 'bg-slate-100 text-slate-700 border-slate-200' };

    return (
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${config.classes}`}>
            {config.label}
        </span>
    );
}
