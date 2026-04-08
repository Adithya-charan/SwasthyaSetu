'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { Calendar as CalendarIcon, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { fetchApi } from '@/lib/api';

export default function BookAppointment({ params }: { params: { doctorId: string } }) {
    const router = useRouter();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

    const convertTo24Hr = (time12h: string): string => {
        const [time, modifier] = time12h.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`;
    };

    const handleBook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date || !time) {
            toast.error('Please select both date and time');
            return;
        }

        setIsSubmitting(true);
        try {
            const scheduledAt = `${date}T${convertTo24Hr(time)}`;
            
            await fetchApi('/api/appointments', {
                method: 'POST',
                body: JSON.stringify({
                    doctorId: params.doctorId,
                    scheduledAt,
                    reason: reason || 'General consultation'
                })
            });

            toast.success('Appointment booked successfully!');
            router.push('/patient/appointments');
        } catch (error: any) {
            console.error('Booking failed:', error);
            toast.error(error.message || 'Failed to book appointment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/patient/doctors" className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Book Appointment</h1>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                    <img src="https://i.pravatar.cc/150?img=1" className="w-16 h-16 rounded-full" alt="Doctor" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Dr. Sarah Smith</h2>
                        <p className="text-primary-600">Cardiology Specialist</p>
                    </div>
                </div>

                <form onSubmit={handleBook} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                        <div className="relative">
                            <CalendarIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="date" 
                                required
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full"
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Time</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                            {timeSlots.map(slot => (
                                <button
                                    type="button"
                                    key={slot}
                                    onClick={() => setTime(slot)}
                                    className={`py-2 px-3 text-sm font-medium rounded-lg border transition-all ${
                                        time === slot 
                                            ? 'bg-primary-50 border-primary-500 text-primary-700'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                    }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Symptoms / Reason for Visit</label>
                        <textarea 
                            rows={4}
                            required
                            placeholder="Briefly describe your symptoms..."
                            value={reason}
                            onChange={e => setReason(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                        ></textarea>
                    </div>

                    <button 
                        disabled={isSubmitting}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-70 flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        ) : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    );
}
