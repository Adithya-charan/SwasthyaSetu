'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function DoctorProfilePage() {
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            toast.success("Profile updated successfully");
        }, 1000);
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <h1 className="text-2xl font-bold text-slate-900">Professional Profile</h1>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-8 mb-8">
                    <img src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2864&auto=format&fit=crop" alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-sm" />
                    <div className="text-center sm:text-left pt-2">
                        <h2 className="text-2xl font-bold text-slate-900">Dr. Sarah Smith</h2>
                        <p className="text-primary-600 font-medium mb-3">Cardiology Specialist</p>
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">Change Photo</button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                            <input type="text" defaultValue="Cardiology" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Medical License Number</label>
                            <input type="text" defaultValue="MD-98765-Z" required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                            <input type="number" defaultValue={15} required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Consultation Fee ($)</label>
                            <input type="number" defaultValue={100} required className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio</label>
                        <textarea defaultValue="Certified Cardiologist with over 15 years of experience in leading hospitals. Specializing in preventive cardiology and heart failure management." rows={4} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-100">
                        <button disabled={isSaving} type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-75 flex items-center justify-center min-w-[150px]">
                            {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
