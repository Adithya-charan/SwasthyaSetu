'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

export default function CreateDoctor() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTimeout(() => {
            toast.success("Doctor account created successfully!");
            router.push('/admin/users');
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Add New Doctor</h1>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="border-b border-slate-200 py-2">
                        <h2 className="text-lg font-bold text-slate-800">Account Credentials</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                            <input required type="text" placeholder="Sarah" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                            <input required type="text" placeholder="Smith" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <input required type="email" placeholder="sarah.s@hospital.com" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Temporary Password</label>
                            <input required type="password" placeholder="••••••••" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>

                    <div className="border-b border-slate-200 py-2 mt-8">
                        <h2 className="text-lg font-bold text-slate-800">Professional Details</h2>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Specialization</label>
                            <select required className="w-full p-3 border border-slate-300 rounded-lg bg-white outline-none focus:ring-2 focus:ring-primary-500">
                                <option value="">Select Specialization...</option>
                                <option>Cardiology</option>
                                <option>Dermatology</option>
                                <option>General Practice</option>
                                <option>Orthopedics</option>
                                <option>Pediatrics</option>
                                <option>Neurology</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Medical License Number</label>
                            <input required type="text" placeholder="MD-XXXXX-X" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Years of Experience</label>
                            <input required type="number" min="0" placeholder="e.g. 5" className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">Professional Bio</label>
                            <textarea required rows={4} placeholder="Brief description of experience and expertise..." className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none"></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end pt-6">
                        <button disabled={isSubmitting} type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-medium transition-colors shadow-lg shadow-primary-600/20 disabled:opacity-75 flex items-center justify-center min-w-[200px]">
                            {isSubmitting ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Create Doctor Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
