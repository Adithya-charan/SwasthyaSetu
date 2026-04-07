'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Activity, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
    const { login } = useAuth();
    const router = useRouter();
    const [role, setRole] = useState<'patient' | 'doctor' | 'pharmacist' | 'admin'>('patient');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        console.log("LOGIN PAGE: Attempting login with role:", role);
        try {
            await login(email || `user-${Date.now()}@example.com`, password || 'password123', role, name || undefined);
            console.log("LOGIN PAGE: Login successful, redirecting to:", `/${role}/dashboard`);
            router.push(`/${role}/dashboard`);
        } catch (error) {
            console.error("LOGIN PAGE: Login failed", error);
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-8 space-y-6">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-600 mb-2">
                            <Activity className="w-6 h-6" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
                        <p className="text-slate-500">Sign in to your SwasthyaSetu account</p>
                    </div>

                    <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 rounded-lg">
                        {['patient', 'doctor', 'pharmacist', 'admin'].map((r) => (
                            <button
                                type="button"
                                key={r}
                                onClick={() => setRole(r as any)}
                                className={`
                  text-xs font-medium py-1.5 rounded-md capitalize transition-all
                  ${role === r ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}
                `}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            icon={<User className="w-4 h-4" />}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            icon={<Mail className="w-4 h-4" />}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            icon={<Lock className="w-4 h-4" />}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                                <span className="text-slate-600">Remember me</span>
                            </label>
                            <Link href="#" className="text-primary-600 hover:underline font-medium">Forgot password?</Link>
                        </div>

                        <Button isFullWidth size="lg" disabled={isLoggingIn}>
                            {isLoggingIn ? 'Signing In...' : `Sign In as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
                        </Button>
                    </form>


                    <p className="text-center text-sm text-slate-600">
                        Don't have an account? <Link href="/signup" className="text-primary-600 font-medium hover:underline">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
