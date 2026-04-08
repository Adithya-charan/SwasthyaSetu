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
        hospital: '', 
        gender: '',
        email: '',
        phone: '',
        specialization: '', 
        licenseNumber: '', 
        experience: '',
        adminCode: '',
    });

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const isPatient = role === 'patient';
    const isDoctor = role === 'doctor';
    const isPharmacist = role === 'pharmacist';
    const isAdmin = role === 'admin';

    const nextStep = () => {
        // Patients only have 1 step
        if (isPatient) {
            handleComplete();
            return;
        }
        setStep(prev => prev + 1);
    };
    
    const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

    const handleComplete = async () => {
        await login(formData.email || `user-${Date.now()}@example.com`, 'password123', role, formData.fullName || role);
        router.push(`/${role}/dashboard`);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 py-4 px-6 fixed top-0 w-full z-10">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-primary-500" />
                        <span className="font-bold text-xl text-slate-900">SwasthyaSetu</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex items-center justify-center pt-24 pb-12 px-4 text-slate-900">
                <div className="w-full max-w-2xl">
                    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                        <div className="p-8 sm:p-12">
                            <div className="mb-10 text-center">
                                <h1 className="text-3xl font-bold mb-2">Complete your Profile</h1>
                                <p className="text-slate-500">Welcome to the platform, {role}!</p>
                            </div>

                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="space-y-6"
                                    >
                                        {isPatient ? (
                                            <div className="space-y-4">
                                                <p className="text-center text-slate-600 mb-6">We only need your age to personalize your healthcare experience.</p>
                                                <Input
                                                    label="Your Age"
                                                    type="number"
                                                    placeholder="Enter your age"
                                                    icon={<Calendar className="w-4 h-4" />}
                                                    value={formData.age}
                                                    onChange={(e) => updateForm('age', e.target.value)}
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <Input
                                                    label="Full Name"
                                                    placeholder={isAdmin ? "Account Name" : "e.g. Dr. John Doe"}
                                                    icon={<User className="w-4 h-4" />}
                                                    value={formData.fullName}
                                                    onChange={(e) => updateForm('fullName', e.target.value)}
                                                />
                                                {(isDoctor || isPharmacist) && (
                                                    <Input
                                                        label={isDoctor ? "Hospital Name" : "Pharmacy Name"}
                                                        placeholder="Where do you practice?"
                                                        icon={<Building className="w-4 h-4" />}
                                                        value={formData.hospital}
                                                        onChange={(e) => updateForm('hospital', e.target.value)}
                                                    />
                                                )}
                                                {isAdmin && (
                                                    <Input
                                                        label="Admin Security Code"
                                                        type="password"
                                                        placeholder="Enter provided admin code"
                                                        value={formData.adminCode}
                                                        onChange={(e) => updateForm('adminCode', e.target.value)}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </motion.div>
                                )}

                                {step === 2 && !isPatient && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6"
                                    >
                                        <div className="p-4 bg-primary-50 text-primary-800 rounded-2xl flex items-start gap-3 border border-primary-100">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                            <p className="text-sm">Please verify your professional credentials. These will be reviewed for verification.</p>
                                        </div>

                                        {isAdmin ? (
                                            <div className="space-y-6">
                                                <Input label="Platform ID" placeholder="PT-XXXX" />
                                                <Input label="Access Level" placeholder="Global / Regional" />
                                            </div>
                                        ) : (
                                            <>
                                                <Input
                                                    label="Professional License Number"
                                                    placeholder="e.g. MED-12345"
                                                    value={formData.licenseNumber}
                                                    onChange={(e) => updateForm('licenseNumber', e.target.value)}
                                                />
                                                {isDoctor && (
                                                    <Input
                                                        label="Medical Specialization"
                                                        placeholder="e.g. Neurosurgeon"
                                                        value={formData.specialization}
                                                        onChange={(e) => updateForm('specialization', e.target.value)}
                                                    />
                                                )}
                                                <Input
                                                    label="Years of Experience"
                                                    type="number"
                                                    placeholder="How many years?"
                                                    value={formData.experience}
                                                    onChange={(e) => updateForm('experience', e.target.value)}
                                                />
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-8 border-t border-slate-100">
                                {!isPatient && step > 1 && (
                                    <Button variant="ghost" onClick={prevStep} className="flex-1 py-6 rounded-2xl">
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous
                                    </Button>
                                )}

                                {isPatient || step === 2 ? (
                                    <Button onClick={handleComplete} className="flex-1 py-6 rounded-2xl shadow-xl shadow-primary-600/20">
                                        Complete Registration <Check className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button onClick={nextStep} className="flex-1 py-6 rounded-2xl shadow-xl shadow-primary-600/20">
                                        Next Step <ChevronRight className="w-4 h-4 ml-2" />
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
