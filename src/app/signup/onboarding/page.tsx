'use client';

import { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Activity, Building, User, Calendar, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function OnboardingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { login } = useAuth(); // We'll use this to "finalize" the session if needed

    // Get role from URL param or default to patient
    const roleParam = searchParams.get('role') || 'patient';
    const [role, setRole] = useState(roleParam);

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        age: '',
        hospital: '', // Required for Doctor/Pharmacist
        gender: '',
        email: '',
        phone: '',
        specialization: '', // Doctor
        licenseNumber: '', // Doctor/Pharmacist
        experience: '',
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleComplete = async () => {
        // Here you would save the profile to the backend

        // Then log the user in (simulated)
        await login(formData.email || `user-${Date.now()}@example.com`, 'password123', role, formData.fullName);

        // The login function in AuthContext will trigger the socket event
        // Then we redirect to the dashboard
        router.push(`/${role}`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary-500" />
                        <span className="font-bold text-xl text-slate-900">VirtualCare</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4">
                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-slate-900 capitalize">
                                    {role} Profile Setup
                                </h2>
                                <p className="text-slate-500">Please complete your profile to continue.</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-4"
                                    >
                                        <Input
                                            label="Full Name"
                                            placeholder="e.g. Dr. John Doe"
                                            icon={<User className="w-4 h-4" />}
                                            value={formData.fullName}
                                            onChange={(e) => updateForm('fullName', e.target.value)}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Age"
                                                type="number"
                                                placeholder="e.g. 35"
                                                icon={<Calendar className="w-4 h-4" />}
                                                value={formData.age}
                                                onChange={(e) => updateForm('age', e.target.value)}
                                            />
                                            <div className="space-y-1.5">
                                                <label className="block text-sm font-medium text-slate-700">Gender</label>
                                                <select
                                                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none"
                                                    value={formData.gender}
                                                    onChange={(e) => updateForm('gender', e.target.value)}
                                                >
                                                    <option value="">Select</option>
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                        </div>

                                        {(role === 'doctor' || role === 'pharmacist') && (
                                            <Input
                                                label="Hospital / Pharmacy Name"
                                                placeholder={role === 'doctor' ? "e.g. General Hospital" : "e.g. City Pharmacy"}
                                                icon={<Building className="w-4 h-4" />}
                                                value={formData.hospital}
                                                onChange={(e) => updateForm('hospital', e.target.value)}
                                            />
                                        )}

                                        {role === 'doctor' && (
                                            <Input
                                                label="Specialization"
                                                placeholder="e.g. Cardiology"
                                                icon={<Activity className="w-4 h-4" />}
                                                value={formData.specialization}
                                                onChange={(e) => updateForm('specialization', e.target.value)}
                                            />
                                        )}
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">Please provide accurate professional details. Your account will be verified by our admin team.</p>
                                        </div>

                                        <Input
                                            label="License Number"
                                            placeholder="License ID"
                                            value={formData.licenseNumber}
                                            onChange={(e) => updateForm('licenseNumber', e.target.value)}
                                        />

                                        <Input
                                            label="Years of Experience"
                                            type="number"
                                            placeholder="e.g. 10"
                                            value={formData.experience}
                                            onChange={(e) => updateForm('experience', e.target.value)}
                                        />

                                        <Input
                                            label="Email Address"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => updateForm('email', e.target.value)}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100">
                                <Button
                                    variant="ghost"
                                    onClick={prevStep}
                                    disabled={step === 1}
                                    className={step === 1 ? 'invisible' : ''}
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" /> Back
                                </Button>

                                {step < 2 ? (
                                    <Button onClick={nextStep}>
                                        Next Step <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={handleComplete}>
                                        Complete & Login <Check className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OnboardingContent />
        </Suspense>
    );
}
