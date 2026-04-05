'use client';
import { useState } from 'react';
import { Search, Star, User, Calendar, Clock, PhoneOff } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

const MOCK_DOCTORS = [
    { id: '1', name: 'Dr. Sarah Smith', spec: 'Cardiology', exp: '15 years', rating: 4.8, img: 'https://i.pravatar.cc/150?img=1', status: 'Available Now', nextSlot: 'Available Now' },
    { id: '2', name: 'Dr. John Doe', spec: 'Dermatology', exp: '8 years', rating: 4.5, img: 'https://i.pravatar.cc/150?img=11', status: 'In Consultation', nextSlot: 'Available in ~20 mins' },
    { id: '3', name: 'Dr. Emily Chen', spec: 'General Practice', exp: '12 years', rating: 4.9, img: 'https://i.pravatar.cc/150?img=5', status: 'Offline', nextSlot: 'Next available: Tomorrow 10:00 AM' },
    { id: '4', name: 'Dr. Michael Brown', spec: 'Orthopedics', exp: '20 years', rating: 4.2, img: 'https://i.pravatar.cc/150?img=8', status: 'Available Now', nextSlot: 'Available Now' },
];

export default function DoctorsPage() {
    const [filter, setFilter] = useState('');

    const filtered = MOCK_DOCTORS.filter(d => d.spec.toLowerCase().includes(filter.toLowerCase()) || d.name.toLowerCase().includes(filter.toLowerCase()));

    const getStatusUI = (status: string) => {
        if (status === 'Available Now') return { color: 'bg-green-500', text: 'text-green-600' };
        if (status === 'In Consultation') return { color: 'bg-yellow-400', text: 'text-yellow-600' };
        return { color: 'bg-slate-300', text: 'text-slate-500' };
    };

    const getActionButton = (docId: string, status: string) => {
        if (status === 'Available Now') {
            return (
                <Link href={`/patient/book/${docId}`} className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-green-600/20 text-center block">
                    Book Now
                </Link>
            );
        } else if (status === 'In Consultation') {
            return (
                <button onClick={() => toast.success("Added to waitlist! You will be notified.")} className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-yellow-600/20">
                    Join Waitlist
                </button>
            );
        } else {
            return (
                <Link href={`/patient/book/${docId}`} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-all border border-slate-200 text-center block">
                    Schedule Appointment
                </Link>
            );
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Find a Doctor</h1>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by specialty or name..."
                        className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none w-full sm:w-64"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 gap-4">
                    {filtered.map(doc => {
                        const statusUI = getStatusUI(doc.status);
                        return (
                            <div key={doc.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col items-center text-center relative overflow-hidden">
                                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                    <span className={`w-2 h-2 rounded-full ${statusUI.color}`}></span>
                                    <span className={`text-xs font-bold ${statusUI.text}`}>{doc.status}</span>
                                </div>

                                <img src={doc.img} alt={doc.name} className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 mb-4 mt-6" />
                                <h3 className="font-bold text-lg text-slate-900">{doc.name}</h3>
                                <p className="text-primary-600 font-semibold mb-1 text-sm bg-primary-50 px-3 py-1 rounded-full mt-1 mb-4">{doc.spec}</p>
                                
                                <div className="w-full grid grid-cols-2 gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Exp</span>
                                        <span className="font-semibold text-slate-800">{doc.exp}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-0.5">Rating</span>
                                        <span className="flex items-center justify-center gap-1 font-semibold text-slate-800">
                                            {doc.rating} <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500 -mt-0.5" />
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-xs font-medium text-slate-500 mb-4">{doc.nextSlot}</p>
                                {getActionButton(doc.id, doc.status)}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
                    <User className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <h3 className="text-lg font-medium text-slate-900">No doctors found</h3>
                    <p className="text-slate-500">Try adjusting your search criteria</p>
                </div>
            )}
        </div>
    );
}
