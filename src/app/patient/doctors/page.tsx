'use client';
import { useState, useEffect } from 'react';
import { Search, Star, User, Calendar, Clock, UserCheck, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/api';

export default function DoctorsPage() {
    const [filter, setFilter] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const loadDoctors = async () => {
            try {
                // Fetch approved doctors from the backend
                const data = await authFetch('/api/doctors');
                setDoctors(data.data.content || []);
            } catch (error) {
                console.error("Failed to load doctors", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadDoctors();
    }, []);

    const filtered = doctors.filter(d => 
        (d.specialization && d.specialization.toLowerCase().includes(filter.toLowerCase())) || 
        (d.user?.fullName && d.user.fullName.toLowerCase().includes(filter.toLowerCase()))
    );

    if (!isMounted) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Find Your Doctor</h1>
                    <p className="text-slate-500 mt-1">Book an appointment with our verified medical experts.</p>
                </div>
                <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by specialty or name..."
                        className="pl-12 pr-6 py-3 border-2 border-slate-100 bg-white rounded-2xl focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none w-full sm:w-80 shadow-sm transition-all"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                    <p className="text-slate-500 font-medium">Fetching verified doctors...</p>
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filtered.map(doc => {
                        const id = doc.user?.id;
                        const name = doc.user?.fullName;
                        const spec = doc.specialization;
                        const exp = doc.experienceYears;
                        const pic = doc.user?.profilePicUrl;

                        return (
                            <div key={id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col items-center text-center relative overflow-hidden group">
                                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-100 shadow-sm z-10">
                                    <span className={`w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse`}></span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest text-green-600`}>Available</span>
                                </div>

                                <div className="relative mb-6">
                                    <div className="w-32 h-32 rounded-3xl bg-slate-50 flex items-center justify-center border-4 border-white shadow-xl text-slate-300">
                                        <User className="w-16 h-16" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
                                        <UserCheck className="w-4 h-4" />
                                    </div>
                                </div>

                                <h3 className="font-bold text-xl text-slate-900 group-hover:text-primary-600 transition-colors">{name}</h3>
                                <p className="text-primary-600 font-bold mb-6 text-xs bg-primary-50 px-4 py-1.5 rounded-full mt-2 uppercase tracking-widest">{spec || 'General Physician'}</p>
                                
                                <div className="w-full grid grid-cols-2 gap-4 text-sm text-slate-600 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Experience</span>
                                        <span className="font-bold text-slate-800">{exp ? `${exp} Years` : 'Verified'}</span>
                                    </div>
                                    <div className="flex flex-col border-l border-slate-200 pl-4">
                                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Rating</span>
                                        <span className="flex items-center justify-center gap-1.5 font-bold text-slate-800">
                                            4.9 <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        </span>
                                    </div>
                                </div>
                                
                                <Link href={`/patient/book/${id}`} className="w-full bg-slate-900 hover:bg-primary-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2 group-hover:shadow-primary-600/20">
                                    <Calendar className="w-5 h-5" /> Book Appointment
                                </Link>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-slate-100 border-dashed flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">No Registered Doctors Found</h3>
                    <p className="text-slate-500 max-w-sm">When the admin approves a new doctor, they will appear here automatically.</p>
                </div>
            )}
        </div>
    );
}
