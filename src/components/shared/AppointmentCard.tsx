'use client';
import { Calendar, Clock, User } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { Button } from '@/components/ui/Button';

interface AppointmentCardProps {
    name: string;
    roleLabel: 'Doctor' | 'Patient';
    date: string;
    time: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    actionButtonText?: string;
    onActionClick?: () => void;
    secondaryActionText?: string;
    onSecondaryClick?: () => void;
}

export default function AppointmentCard({ 
    name, roleLabel, date, time, status, 
    actionButtonText, onActionClick,
    secondaryActionText, onSecondaryClick 
}: AppointmentCardProps) {
    return (
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center text-primary-600">
                    <User className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-semibold text-slate-900">{name}</h4>
                    <p className="text-sm text-slate-500">{roleLabel}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-1 md:justify-center">
                <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span className="text-sm font-medium">{date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{time}</span>
                </div>
                <div className="flex items-center">
                    <StatusBadge status={status} />
                </div>
            </div>

            {(actionButtonText || secondaryActionText) && (
                <div className="flex items-center gap-2 mt-4 md:mt-0">
                    {secondaryActionText && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={onSecondaryClick}
                        >
                            {secondaryActionText}
                        </Button>
                    )}
                    {actionButtonText && (
                        <Button 
                            size="sm" 
                            onClick={onActionClick}
                        >
                            {actionButtonText}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
