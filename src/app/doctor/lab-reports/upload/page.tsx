'use client';
import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UploadLabReport() {
    const [isUploading, setIsUploading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsUploading(true);
        setTimeout(() => {
            setIsUploading(false);
            toast.success("Lab report uploaded successfully!");
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-slate-900">Upload Lab Report</h1>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Select Patient</label>
                        <select required className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">-- Choose Patient --</option>
                            <option>Alice Walker</option>
                            <option>Bob Smith</option>
                            <option>Emily Chen</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Report Type</label>
                        <select required className="w-full p-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                            <option value="">-- Choose Type --</option>
                            <option>Blood Test</option>
                            <option>X-Ray</option>
                            <option>MRI</option>
                            <option>ECG</option>
                            <option>Urine Test</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Upload File (PDF, JPG, PNG)</label>
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center cursor-pointer group relative bg-white">
                            <input type="file" required accept=".pdf,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <div className="w-16 h-16 bg-primary-50 text-primary-500 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <p className="font-semibold text-slate-800 text-center">Click to upload or drag and drop</p>
                            <p className="text-sm text-slate-500 text-center mt-1">Maximum file size 5MB</p>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Remarks</label>
                        <textarea rows={4} className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500 resize-none" placeholder="Add any notes for the patient..."></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isUploading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-colors shadow-xl shadow-primary-600/20 disabled:opacity-75 flex justify-center items-center"
                    >
                        {isUploading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : 'Upload Report'}
                    </button>
                </form>
            </div>
        </div>
    );
}
