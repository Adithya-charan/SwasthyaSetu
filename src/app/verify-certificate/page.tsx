"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { CheckCircle, UploadCloud, FileText, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function VerifyCertificatePage() {
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const [status, setStatus] = useState<'upload' | 'pending'>('upload');
    const [file, setFile] = useState<File | null>(null);

    const handleUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please select a file to upload.");
            return;
        }
        // Save that this user has uploaded their certificate
        if (user?.email) {
            const uploaded = JSON.parse(localStorage.getItem('uploadedCertificates') || '[]');
            if (!uploaded.includes(user.email)) {
                uploaded.push(user.email);
                localStorage.setItem('uploadedCertificates', JSON.stringify(uploaded));
            }
        }
        // Simulate upload and transition to pending state
        setStatus('pending');
    };

    const handleMockApproval = () => {
        // This simulates the admin clicking "Approve" so the user can test the app
        if (user?.role) {
            router.push(`/${user.role}/dashboard`);
        }
    };

    if (status === 'upload') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl animate-in zoom-in fade-in">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Submit Verification Proof</h2>
                    <p className="text-slate-600 mb-8">
                        As a <span className="font-semibold text-slate-800 capitalize">{user?.role || 'professional'}</span>, you must submit a valid certification or license document before your account can be approved by the Admin.
                    </p>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input 
                                type="file" 
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                            {file ? (
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium text-slate-700">Click to upload or drag and drop</p>
                                    <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                        </div>

                        <Button isFullWidth size="lg">Submit Document</Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center animate-in zoom-in fade-in relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
                
                <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-10 h-10" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 mb-4">Pending Admin Approval</h2>
                <p className="text-slate-600 mb-6">
                    Your verification document has been submitted successfully. You will not be able to access the dashboard until an Admin reviews and approves your account.
                </p>
                
                <div className="p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
                    <p className="text-sm text-slate-500">You will receive an email notification once your status changes.</p>
                </div>

                {/* DEMO BUTTON TO BYPASS APPROVAL */}
                <div className="border-t border-slate-100 pt-6 mt-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Demo Testing Controls</p>
                    <button 
                        onClick={handleMockApproval}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        Simulate Admin Approval (Proceed)
                    </button>
                </div>
            </div>
        </div>
    );
}
