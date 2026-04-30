"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, Lock, Phone, Mail, Globe, User, Stethoscope, MapPin, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { languageNames, Language } from '@/data/translations';

type Role = 'patient' | 'doctor' | 'pharmacist' | 'admin';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const { language, setLanguage, t } = useLanguage();

    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<Role>('patient');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    
    const [flowState, setFlowState] = useState<'login' | 'otp' | 'forgot_password'>('login');
    const [otp, setOtp] = useState('');
    const [otpError, setOtpError] = useState('');

    useEffect(() => {
        const handleFillPassword = (e: any) => {
            if (e.detail) {
                setPassword(e.detail);
            }
        };
        document.addEventListener('fill-password', handleFillPassword);
        return () => document.removeEventListener('fill-password', handleFillPassword);
    }, []);

    const [generatedOtp, setGeneratedOtp] = useState<string>('');

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        try {
            // Frontend-only OTP generation for demo
            const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(randomOtp);
            console.log("DEMO OTP:", randomOtp);
            alert(`DEMO MODE: Your OTP is ${randomOtp}`);
            setFlowState('otp');
        } catch (error: any) {
            console.error("Failed to start login flow", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (otp !== generatedOtp) {
            setOtpError("Invalid OTP. For demo, check the alert message.");
            return;
        }

        setIsLoggingIn(true);
        try {
            const cleanIdentifier = identifier.trim();
            const loggedInUser = await login(cleanIdentifier, password, role, otp);
            const actualRole = (loggedInUser as any)?.role || role;
            
            if (actualRole === 'doctor' || actualRole === 'pharmacist') {
                const uploaded = JSON.parse(localStorage.getItem('uploadedCertificates') || '[]');
                const hasUploaded = uploaded.includes(cleanIdentifier.toLowerCase());
                if (hasUploaded) {
                    router.push(`/${actualRole}/dashboard`);
                } else {
                    router.push('/verify-certificate');
                }
            } else {
                router.push(`/${actualRole}/dashboard`);
            }
        } catch (error: any) {
            console.error("Login failed", error);
            let msg = error.message || "Invalid OTP or credentials";
            // If it's a validation error, try to show the details
            if (error.data && typeof error.data === 'object') {
                const details = Object.entries(error.data).map(([field, error]) => `${field}: ${error}`).join('\n');
                msg = `Validation Failed:\n${details}`;
            }
            setOtpError(msg);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4 relative">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-2">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{t("login") || "Login"}</h1>
                        <p className="text-slate-500">{t("login_desc") || "Sign in to your account"}</p>
                    </div>

                    {flowState === 'login' && (
                        <form className="space-y-4" onSubmit={handleLoginSubmit}>
                            {/* ROLE TABS */}
                            <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-xl mb-4">
                                <button type="button" onClick={() => setRole('patient')} className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${role === 'patient' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <User className="w-4 h-4"/> {t("patient") || "Patient"}
                                </button>
                                <button type="button" onClick={() => setRole('doctor')} className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${role === 'doctor' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <Stethoscope className="w-4 h-4"/> {t("doctor") || "Doctor"}
                                </button>
                                <button type="button" onClick={() => setRole('pharmacist')} className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${role === 'pharmacist' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <MapPin className="w-4 h-4"/> {t("pharmacist") || "Pharma"}
                                </button>
                                <button type="button" onClick={() => setRole('admin')} className={`py-2 text-xs font-bold rounded-lg flex flex-col items-center gap-1 transition-all ${role === 'admin' ? 'bg-white text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                                    <Shield className="w-4 h-4"/> {t("admin") || "Admin"}
                                </button>
                            </div>

                            <Input
                                label={t("phone_email") || "Email or Phone Number"}
                                type="text"
                                placeholder={t("phone_email_placeholder") || "Email or 10-digit number"}
                                icon={<Mail className="w-4 h-4" />}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                            <Input
                                label={t("password") || "Password"}
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-4 h-4" />}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                    <span className="text-slate-600">{t("remember_me") || "Remember me"}</span>
                                </label>
                                <button type="button" onClick={() => setFlowState('forgot_password')} className="text-primary-600 hover:underline font-medium">{t("forgot_pwd") || "Forgot password?"}</button>
                            </div>

                            <Button isFullWidth size="lg" disabled={isLoggingIn}>
                                {isLoggingIn ? (t("verifying") || 'Verifying...') : (t("continue") || 'Continue')}
                            </Button>
                        </form>
                    )}

                    {/* DEMO CREDENTIALS SECTION */}
                    {flowState === 'login' && (
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">{t("demo_mode") || "Quick Demo Login"}</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => {
                                        setIdentifier('patient@swasthyasetu.com');
                                        setPassword('password123');
                                        setRole('patient');
                                    }}
                                    className="flex flex-col items-center p-2 rounded-xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors group"
                                >
                                    <User className="w-4 h-4 text-blue-600 mb-1" />
                                    <span className="text-[10px] font-bold text-blue-700">Patient Demo</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setIdentifier('smith@swasthyasetu.com');
                                        setPassword('password123');
                                        setRole('doctor');
                                    }}
                                    className="flex flex-col items-center p-2 rounded-xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition-colors"
                                >
                                    <Stethoscope className="w-4 h-4 text-emerald-600 mb-1" />
                                    <span className="text-[10px] font-bold text-emerald-700">Doctor Demo</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setIdentifier('pharmacist@swasthyasetu.com');
                                        setPassword('password123');
                                        setRole('pharmacist');
                                    }}
                                    className="flex flex-col items-center p-2 rounded-xl bg-orange-50 border border-orange-100 hover:bg-orange-100 transition-colors"
                                >
                                    <MapPin className="w-4 h-4 text-orange-600 mb-1" />
                                    <span className="text-[10px] font-bold text-orange-700">Pharma Demo</span>
                                </button>
                                <button 
                                    onClick={() => {
                                        setIdentifier('admin@swasthyasetu.com');
                                        setPassword('password123');
                                        setRole('admin');
                                    }}
                                    className="flex flex-col items-center p-2 rounded-xl bg-purple-50 border border-purple-100 hover:bg-purple-100 transition-colors"
                                >
                                    <Shield className="w-4 h-4 text-purple-600 mb-1" />
                                    <span className="text-[10px] font-bold text-purple-700">Admin Demo</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {flowState === 'otp' && (
                        <form className="space-y-6 animate-in slide-in-from-right" onSubmit={handleOtpSubmit}>
                            <div className="text-center">
                                <p className="text-slate-600 text-sm mb-4">{t("enter_otp") || "Enter the 6-digit OTP sent to"} {identifier}</p>
                                <input 
                                    type="text" 
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => {
                                        setOtp(e.target.value.replace(/[^0-9]/g, ''));
                                        setOtpError('');
                                    }}
                                    className={`w-full text-center text-3xl tracking-[0.5em] py-4 border-b-2 outline-none transition-colors ${otpError ? 'border-red-500 text-red-600' : 'border-slate-300 focus:border-primary-600'}`}
                                    placeholder="------"
                                    required
                                />
                                {otpError && <p className="text-red-500 text-xs mt-2 font-bold">{otpError}</p>}
                            </div>
                            <Button isFullWidth size="lg" disabled={isLoggingIn || otp.length !== 6}>
                                {isLoggingIn ? (t("signing_in") || 'Signing In...') : (t("verify_otp") || 'Verify & Sign In')}
                            </Button>
                            <button type="button" onClick={() => setFlowState('login')} className="w-full text-sm text-slate-500 hover:text-slate-800">← {t("back_login") || "Back to Login"}</button>
                        </form>
                    )}

                    {flowState === 'forgot_password' && (
                        <form className="space-y-4 animate-in slide-in-from-right" onSubmit={() => setFlowState('otp')}>
                            <p className="text-sm text-slate-600 text-center mb-4">{t("forgot_desc") || "Enter your registered phone/email to reset your password."}</p>
                            <Input
                                label={t("phone_email") || "Email or Phone Number"}
                                type="text"
                                placeholder="Email or 10-digit number"
                                icon={<Phone className="w-4 h-4" />}
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                            />
                            <Button isFullWidth size="lg">{t("send_otp") || "Send Reset OTP"}</Button>
                            <button type="button" onClick={() => setFlowState('login')} className="w-full text-sm text-slate-500 hover:text-slate-800">← {t("back_login") || "Back to Login"}</button>
                        </form>
                    )}

                    {flowState === 'login' && (
                        <p className="text-center text-sm text-slate-600">
                            {t("no_account") || "Don't have an account?"} <Link href="/signup" className="text-primary-600 font-medium hover:underline">{t("signup") || "Sign up"}</Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
