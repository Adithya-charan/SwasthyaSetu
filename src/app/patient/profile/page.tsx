'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Activity } from 'lucide-react';

export default function ProfilePage() {
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
            <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-8 mb-8">
                    <img src="https://i.pravatar.cc/150?u=patient" alt="Profile" className="w-24 h-24 rounded-full border-4 border-slate-50 object-cover shadow-sm" />
                    <div className="text-center sm:text-left pt-2">
                        <h2 className="text-2xl font-bold text-slate-900">John Doe</h2>
                        <p className="text-primary-600 font-medium mb-3">Patient Account</p>
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-colors border border-slate-200">Change Photo</button>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                            <input type="text" defaultValue="John Doe" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
                            <input type="tel" defaultValue="+1 234 567 8900" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Date of Birth</label>
                            <input type="date" defaultValue="1990-01-15" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Blood Group</label>
                            <select defaultValue="O+" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                                <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                                <option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                        <textarea defaultValue="123 Health Ave, Medical District, NY 10001" rows={3} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"></textarea>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Emergency Contact</label>
                        <input type="text" defaultValue="Jane Doe - +1 987 654 3210" placeholder="Name and Phone number" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button disabled={isSaving} type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-75 flex items-center justify-center min-w-[150px]">
                            {isSaving ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
