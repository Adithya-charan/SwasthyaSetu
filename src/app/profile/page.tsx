"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { User, Mail, Phone, Calendar, Globe, Shield, Save, Lock, Edit3, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function ProfilePage() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [isMounted, setIsMounted] = useState(false);
    
    const [profileData, setProfileData] = useState<any>(null);
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });
    const [editForm, setEditForm] = useState({ name: '', age: '', phone: '', email: '' });

    useEffect(() => {
        setIsMounted(true);
        loadProfile();
    }, [user]);

    const loadProfile = () => {
        const pendingList = JSON.parse(localStorage.getItem('mockPendingApprovals') || '[]');
        const found = pendingList.find((u: any) => u.email === user?.email || u.name === user?.name);
        if (found) {
            setProfileData(found);
            setEditForm({ name: found.name, age: found.age, phone: found.phone, email: found.email });
        } else {
            const fallback = {
                name: user?.name || 'User',
                email: user?.email || 'user@example.com',
                role: user?.role || 'patient',
                age: '25',
                phone: '1234567890',
                date: new Date().toISOString()
            };
            setProfileData(fallback);
            setEditForm({ name: fallback.name, age: fallback.age, phone: fallback.phone, email: fallback.email });
        }
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        const pendingList = JSON.parse(localStorage.getItem('mockPendingApprovals') || '[]');
        const updatedList = pendingList.map((u: any) => {
            if (u.email === user?.email || u.name === user?.name) {
                return { ...u, ...editForm };
            }
            return u;
        });
        localStorage.setItem('mockPendingApprovals', JSON.stringify(updatedList));
        setProfileData({ ...profileData, ...editForm });
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            toast.error("Passwords do not match!");
            return;
        }
        toast.success("Password changed successfully!");
        setIsChangingPwd(false);
        setPasswords({ old: '', new: '', confirm: '' });
    };

    if (!isMounted || !profileData) return <div className="p-8 animate-pulse">Loading Profile...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{t('profile') || "My Profile"}</h1>
                    <p className="text-slate-500">Manage your personal information and security settings.</p>
                </div>
                <div className="bg-primary-50 text-primary-600 px-4 py-2 rounded-xl text-sm font-bold border border-primary-100 capitalize">
                    {profileData.role} Account
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Overview */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-primary-50">
                            <User className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{profileData.name}</h2>
                        <p className="text-slate-500 text-sm mb-6">{profileData.email}</p>
                        <div className="w-full pt-6 border-t border-slate-50 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Status</span>
                                <span className="text-emerald-600 font-bold">Active</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400 font-medium">Joined</span>
                                <span className="text-slate-900 font-bold">{new Date(profileData.date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button 
                            onClick={() => { setIsEditing(!isEditing); setIsChangingPwd(false); }}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-md ${isEditing ? 'bg-slate-100 text-slate-600' : 'bg-primary-600 text-white hover:bg-primary-700'}`}
                        >
                            {isEditing ? <><X className="w-4 h-4" /> Cancel Edit</> : <><Edit3 className="w-4 h-4" /> Edit Profile</>}
                        </button>
                        <button 
                            onClick={() => { setIsChangingPwd(!isChangingPwd); setIsEditing(false); }}
                            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all shadow-md ${isChangingPwd ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                        >
                            <Shield className="w-4 h-4" /> {isChangingPwd ? "View Information" : "Change Password"}
                        </button>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="md:col-span-2">
                    {isEditing ? (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
                                <Edit3 className="w-5 h-5 text-primary-600" /> Edit Information
                            </h3>
                            <form onSubmit={handleSaveProfile} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input label="Full Name" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />
                                    <Input label="Email Address" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />
                                    <Input label="Phone Number" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                    <Input label="Age" type="number" value={editForm.age} onChange={e => setEditForm({...editForm, age: e.target.value})} />
                                </div>
                                <Button isFullWidth size="lg">Save Profile Changes</Button>
                            </form>
                        </div>
                    ) : isChangingPwd ? (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-8">
                                <Lock className="w-5 h-5 text-red-500" /> Security Settings
                            </h3>
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <Input label="Current Password" type="password" placeholder="••••••••" required value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <Input label="New Password" type="password" placeholder="••••••••" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                                    <Input label="Confirm New Password" type="password" placeholder="••••••••" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                                </div>
                                <Button isFullWidth size="lg">Update Password</Button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8 animate-in slide-in-from-right duration-300">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary-600" /> Account Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <User className="w-4 h-4 text-slate-400" />
                                        <span className="font-semibold text-slate-700">{profileData.name}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        <span className="font-semibold text-slate-700">{profileData.email}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        <span className="font-semibold text-slate-700">{profileData.phone}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age</label>
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        <span className="font-semibold text-slate-700">{profileData.age} Years</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
