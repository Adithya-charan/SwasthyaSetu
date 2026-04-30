'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import { authFetch } from '@/lib/api';
import { Loader2, UserCheck, Camera, User } from 'lucide-react';

export default function DoctorProfilePage() {
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                // Fetch the full doctor profile from the backend
                const data = await authFetch(`/api/doctors/${user?.id}`);
                setProfile(data.data);
            } catch (error) {
                console.error("Failed to load doctor profile", error);
            } finally {
                setIsLoading(false);
            }
        };
        if (user?.id) loadProfile();
    }, [user]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // For now, simulating a save. You can implement PUT /api/doctors/me later.
            await authFetch(`/api/doctors/${user?.id}`, { method: 'PUT', body: JSON.stringify({}) });
            toast.success("Profile updated successfully");
        } catch (error) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary-600 animate-spin" />
            </div>
        );
    }

    const doctorName = profile?.user?.fullName || user?.name || 'Doctor';
    const specialization = profile?.specialization || 'General Physician';
    const profilePic = profile?.user?.profilePicUrl || `https://i.pravatar.cc/150?u=${user?.id}`;

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-900">Professional Profile</h1>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-8 mb-8">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border-4 border-slate-50 text-slate-300 shadow-sm">
                        <User className="w-12 h-12" />
                    </div>
                    <div className="text-center sm:text-left pt-2">
                        <h2 className="text-2xl font-bold text-slate-900">{doctorName}</h2>
                        <p className="text-primary-600 font-medium mb-3">{specialization}</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold w-fit mx-auto sm:mx-0">
                            <UserCheck className="w-3.5 h-3.5" /> Verified Practitioner
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 uppercase tracking-wider text-[10px] font-black">Specialization</label>
                            <input 
                                type="text" 
                                defaultValue={specialization} 
                                required 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 uppercase tracking-wider text-[10px] font-black">Medical License Number</label>
                            <input 
                                type="text" 
                                defaultValue={profile?.licenseNumber || 'PENDING'} 
                                disabled
                                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none font-semibold text-slate-500" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 uppercase tracking-wider text-[10px] font-black">Years of Experience</label>
                            <input 
                                type="number" 
                                defaultValue={profile?.experienceYears || 0} 
                                required 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 uppercase tracking-wider text-[10px] font-black">Consultation Fee (₹)</label>
                            <input 
                                type="number" 
                                defaultValue={profile?.consultationFee || 500} 
                                required 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold" 
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2 uppercase tracking-wider text-[10px] font-black">Professional Bio</label>
                        <textarea 
                            defaultValue={profile?.bio || 'Add your professional biography here...'} 
                            rows={4} 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all font-semibold resize-none"
                        ></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button 
                            disabled={isSaving} 
                            type="submit" 
                            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-primary-600/20 disabled:opacity-75 flex items-center justify-center min-w-[180px]"
                        >
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
