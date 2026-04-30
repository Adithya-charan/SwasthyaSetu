"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, Lock, Mail, User, Phone, Stethoscope, MapPin, CheckCircle, Calendar, Droplet, Globe, Hash, UploadCloud, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { languageNames, Language } from '@/data/translations';
import { fetchApi } from '@/lib/api';

type Role = 'patient' | 'doctor' | 'pharmacist';

export default function SignupPage() {
    const { language, setLanguage, t } = useLanguage();
    const router = useRouter();

    const [step, setStep] = useState(2); 
    const [role, setRole] = useState<Role>('patient');
    const [formData, setFormData] = useState<any>({
        languagePref1: language
    });
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');
    const [certificateFile, setCertificateFile] = useState<File | null>(null);

    const handleRoleSelect = (selectedRole: Role) => {
        setRole(selectedRole);
        setStep(3);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'languagePref1') {
            setLanguage(e.target.value as Language);
        }
    };

    const [generatedOtp, setGeneratedOtp] = useState<string>('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Frontend-only OTP generation for demo
            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(randomOtp);
            console.log("DEMO SIGNUP OTP:", randomOtp);
            alert(`DEMO MODE: Your signup OTP is ${randomOtp}`);
            setStep(4);
        } catch (error: any) {
            console.error("OTP send error", error);
            alert("Something went wrong. Please try again.");
        }
    };

    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp !== generatedOtp) {
            setOtpError("Invalid OTP. For demo, check the alert message.");
            return;
        }

        if (role === 'patient') {
            finalizeSignup();
        } else {
            setStep(5); // Go to PDF upload for doctors/pharmacists
        }
    };

    const finalizeSignup = async () => {
        try {
            const body: any = {
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: role.toUpperCase(),
                phone: formData.phone,
                otp: otp
            };
            
            // For now, let's assume the backend register endpoint takes these or we'll update it.
            await fetchApi('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(body)
            });
            
            setStep(6);
        } catch (error: any) {
            console.error("Signup error", error);
            let msg = error.message || "Registration failed. Please try again.";
            // If it's a validation error, try to show the details
            if (error.data && typeof error.data === 'object') {
                const details = Object.entries(error.data).map(([field, error]) => `${field}: ${error}`).join('\n');
                msg = `Validation Failed:\n${details}`;
            }
            alert(msg);
        }
    };

    const handleCertificateUpload = (e: React.FormEvent) => {
        e.preventDefault();
        if (!certificateFile) {
            alert("Please upload your certificate PDF.");
            return;
        }
        finalizeSignup();
    };

    // --- STEP 2: ROLE SELECTION ---
    if (step === 2) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="mb-8 text-center animate-in fade-in zoom-in">
                    <Activity className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">{t("signup") || "Join SwasthyaSetu"}</h1>
                    <p className="text-slate-600">{t("role_select_desc") || "How would you like to use the platform?"}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
                    {[
                        { id: 'patient', icon: <User className="w-8 h-8" />, title: t("patient") || "Patient", desc: "Book appointments" },
                        { id: 'doctor', icon: <Stethoscope className="w-8 h-8" />, title: t("doctor") || "Doctor", desc: "Consult patients" },
                        { id: 'pharmacist', icon: <MapPin className="w-8 h-8" />, title: t("pharmacist") || "Pharmacist", desc: "Fulfill prescriptions" }
                    ].map(r => (
                        <button key={r.id} onClick={() => handleRoleSelect(r.id as Role)} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:border-primary-500 hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center gap-4 group">
                            <div className="bg-primary-50 p-4 rounded-full text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors">{r.icon}</div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{r.title}</h3>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // --- STEP 3: FORM ---
    if (step === 3) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 py-8 relative">
                <button type="button" onClick={() => setStep(2)} className="absolute top-8 left-8 text-slate-500 hover:text-slate-900 font-medium z-10">← {t("back") || "Back"}</button>
                <div className="max-w-3xl w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in flex flex-col md:flex-row">
                    <div className="hidden md:flex w-1/3 bg-primary-600 p-8 text-white flex-col justify-between relative overflow-hidden">
                        <div className="relative z-10">
                            <Activity className="w-10 h-10 mb-6" />
                            <h2 className="text-2xl font-bold mb-2">{t("create_account") || "Create Account"}</h2>
                        </div>
                    </div>
                    <div className="w-full md:w-2/3 p-8">
                        <form className="space-y-4" onSubmit={handleFormSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <Input name="fullName" onChange={handleFormChange} label={t("name") || "Full Name"} placeholder="Name" icon={<User className="w-4 h-4" />} required />
                                <Input name="age" onChange={handleFormChange} label={t("age") || "Age"} type="number" placeholder="Age" icon={<Hash className="w-4 h-4" />} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input name="phone" onChange={handleFormChange} label={t("phone") || "Phone Number"} placeholder="Phone" icon={<Phone className="w-4 h-4" />} required />
                                <Input name="email" onChange={handleFormChange} label={t("email") || "Email Address"} type="email" placeholder="Email" icon={<Mail className="w-4 h-4" />} required />
                            </div>
                            <Input name="password" onChange={handleFormChange} label={t("password") || "Password"} type="password" placeholder="Password" icon={<Lock className="w-4 h-4" />} required />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">{t("lang_pref_1") || "Language 1"}</label>
                                    <select name="languagePref1" value={formData.languagePref1 || language} onChange={handleFormChange} required className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg">
                                        {Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-slate-700">{t("lang_pref_2") || "Language 2"}</label>
                                    <select name="languagePref2" onChange={handleFormChange} className="w-full pl-3 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-lg">
                                        <option value="">None</option>
                                        {Object.entries(languageNames).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {role !== 'patient' && (
                                <div className="space-y-4">
                                    <Input name="licenseNumber" onChange={handleFormChange} label={role === 'doctor' ? t("medical_license") : t("pharmacy_license")} placeholder="License No" required />
                                    {role === 'doctor' && (
                                        <>
                                            <Input name="specialization" onChange={handleFormChange} label="Specialization" placeholder="e.g. Cardiology" required />
                                            <Input name="clinicHospitalInfo" onChange={handleFormChange} label="Clinic/Hospital Info" placeholder="e.g. Apollo Hospital" required />
                                        </>
                                    )}
                                </div>
                            )}
                            <Button isFullWidth size="lg">{t("submit") || "Next"}</Button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // --- STEP 4: OTP ---
    if (step === 4) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("verify_number") || "Verify OTP"}</h2>
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <input type="text" maxLength={6} value={otp} onChange={e => {setOtp(e.target.value.replace(/[^0-9]/g, '')); setOtpError('');}} className={`w-full text-center text-3xl tracking-[0.5em] py-4 border-b-2 outline-none ${otpError ? 'border-red-500' : 'border-slate-300'}`} placeholder="------" required />
                        {otpError && <p className="text-red-500 text-xs font-bold">{otpError}</p>}
                        <Button isFullWidth size="lg" disabled={otp.length !== 6}>{t("verify_otp") || "Verify"}</Button>
                    </form>
                </div>
            </div>
        );
    }

    // --- STEP 5: PDF UPLOAD (Mandatory for Doctors/Pharmacists) ---
    if (step === 5) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-xl text-center animate-in zoom-in">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Upload Certificate</h2>
                    <p className="text-slate-600 mb-8">Please upload your official medical/pharmacy license certificate (PDF) to complete registration.</p>
                    <form onSubmit={handleCertificateUpload} className="space-y-6">
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 relative cursor-pointer">
                            <input type="file" accept=".pdf" onChange={(e) => setCertificateFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" required />
                            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                            {certificateFile ? <p className="text-sm font-medium text-slate-900">{certificateFile.name}</p> : <p className="text-sm text-slate-500">Click to upload license certificate (PDF)</p>}
                        </div>
                        <Button isFullWidth size="lg">Confirm & Submit</Button>
                    </form>
                </div>
            </div>
        );
    }

    // --- STEP 6: SUCCESS ---
    if (step === 6) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10" /></div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("submitted") || "Success!"}</h2>
                    <p className="text-slate-600 mb-6">{t("pending_desc") || "Account pending approval."}</p>
                    <Link href="/login" passHref><Button variant="outline" isFullWidth>{t("login") || "Go to Login"}</Button></Link>
                </div>
            </div>
        );
    }

    return null;
}
