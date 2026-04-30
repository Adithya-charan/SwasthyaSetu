"use client";

import { useState, useEffect } from 'react';
import StatCard from '@/components/shared/StatCard';
import { Users, UserCheck, Calendar, Pill, Activity, CheckCircle, XCircle, Eye, Download, Trash2, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';
import { useLanguage } from '@/context/LanguageContext';
import { fetchApi } from '@/lib/api';

export default function AdminDashboard() {
    const { t } = useLanguage();
    const [isMounted, setIsMounted] = useState(false);
    const [pendingTab, setPendingTab] = useState<'DOCTOR' | 'PATIENT' | 'PHARMACIST'>('DOCTOR');
    const [statusTab, setStatusTab] = useState<'PENDING' | 'ACTIVE'>('PENDING');
    const [users, setUsers] = useState<any[]>([]);
    const [stats, setStats] = useState({
        pending: 0,
        doctors: 0,
        patients: 0,
        prescriptions: 0
    });
    const [viewingPdf, setViewingPdf] = useState<any | null>(null);

    useEffect(() => { 
        setIsMounted(true); 
        loadUsers();
    }, [pendingTab, statusTab]);

    const loadUsers = async () => {
        try {
            const data = await fetchApi(`/api/admin/users?role=${pendingTab}&status=${statusTab}&page=0&size=10`);
            if (data.success) {
                setUsers(data.data.content);
                if (statusTab === 'PENDING') {
                    setStats(prev => ({ ...prev, pending: data.data.totalElements }));
                }
            }
        } catch (error) {
            console.error("Error loading users", error);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'reject' | 'suspend' | 'activate') => {
        try {
            let status = '';
            if (action === 'approve' || action === 'activate') status = pendingTab === 'DOCTOR' ? 'VERIFIED' : 'ACTIVE';
            else if (action === 'reject' || action === 'suspend') status = 'SUSPENDED';

            if (pendingTab === 'DOCTOR' && (action === 'approve' || action === 'reject')) {
                await fetchApi(`/api/admin/doctors/${id}/verify?status=${status}`, {
                    method: 'PUT'
                });
            } else {
                await fetchApi(`/api/admin/users/${id}/status?status=${status === 'VERIFIED' ? 'ACTIVE' : status}`, {
                    method: 'PUT'
                });
            }
            alert(`User updated successfully.`);
            loadUsers();
        } catch (error) {
            console.error("Action error", error);
            alert("Failed to update user status.");
        }
    };

    if (!isMounted) return <div className="min-h-screen bg-slate-50 animate-pulse" />;
    
    const barData = [
        { name: 'Mon', appointments: 12 }, { name: 'Tue', appointments: 8 }, { name: 'Wed', appointments: 15 },
        { name: 'Thu', appointments: 6 }, { name: 'Fri', appointments: 20 }, { name: 'Sat', appointments: 5 }, { name: 'Sun', appointments: 3 }
    ];

    const customTooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-900">Admin Control Panel</h1>
                <div className="flex gap-3">
                    <div className="flex bg-white rounded-xl border border-slate-200 p-1">
                        {(['PENDING', 'ACTIVE'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setStatusTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${statusTab === tab ? 'bg-primary-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION: USER MANAGEMENT */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-primary-600" /> {statusTab} {pendingTab.toLowerCase()}s
                    </h2>
                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                        {(['DOCTOR', 'PATIENT', 'PHARMACIST'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setPendingTab(tab)}
                                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize ${pendingTab === tab ? 'bg-primary-100 text-primary-900' : 'text-slate-600 hover:bg-slate-50'}`}
                            >
                                {tab.toLowerCase()}s
                            </button>
                        ))}
                    </div>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                                <th className="p-4 font-medium">Name</th>
                                <th className="p-4 font-medium">Email</th>
                                <th className="p-4 font-medium">Status</th>
                                <th className="p-4 font-medium">Documents</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50">
                                    <td className="p-4 font-medium text-slate-900">{user.fullName}</td>
                                    <td className="p-4 text-sm text-slate-600">{user.email}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.accountStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                            {user.accountStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'DOCTOR' ? (
                                            <button 
                                                onClick={() => setViewingPdf(user)}
                                                className="flex items-center gap-1 text-primary-600 hover:underline text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4"/> View License
                                            </button>
                                        ) : <span className="text-slate-400 text-sm">N/A</span>}
                                    </td>
                                    <td className="p-4 text-right flex items-center justify-end gap-2">
                                        {statusTab === 'PENDING' ? (
                                            <>
                                                <button onClick={() => handleAction(user.id, 'approve')} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-sm font-bold flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Approve</button>
                                                <button onClick={() => handleAction(user.id, 'reject')} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold flex items-center gap-1"><XCircle className="w-4 h-4"/> Reject</button>
                                            </>
                                        ) : (
                                            <button onClick={() => handleAction(user.id, 'suspend')} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold flex items-center gap-1"><XCircle className="w-4 h-4"/> Suspend</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400">No {statusTab.toLowerCase()} {pendingTab.toLowerCase()}s found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-6 h-6" />} value={stats.pending.toString()} label="Pending Approvals" accentColor="primary" />
                <StatCard icon={<UserCheck className="w-6 h-6" />} value="-" label="Verified Doctors" accentColor="blue" />
                <StatCard icon={<Calendar className="w-6 h-6" />} value="-" label="Active Consultations" accentColor="purple" />
                <StatCard icon={<Pill className="w-6 h-6" />} value="-" label="Total Prescriptions" accentColor="green" />
            </div>

            {/* TRACKING SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" /> Consultation Tracking
                    </h3>
                    <p className="text-sm text-slate-500">Real-time monitor for active and upcoming consultations across the platform.</p>
                    <div className="mt-4 p-8 bg-slate-50 rounded-xl text-center text-slate-400 border border-dashed border-slate-200">
                        Integration with live signaling server...
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Pill className="w-5 h-5 text-emerald-500" /> Prescription Tracking
                    </h3>
                    <p className="text-sm text-slate-500">Monitor generated prescriptions and pharmacy fulfillment status.</p>
                    <div className="mt-4 p-8 bg-slate-50 rounded-xl text-center text-slate-400 border border-dashed border-slate-200">
                        Connecting to prescription module...
                    </div>
                </div>
            </div>

            {/* PDF VIEWER MODAL */}
            {viewingPdf && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-primary-600" /> License Verification: {viewingPdf.fullName}
                            </h3>
                            <button onClick={() => setViewingPdf(null)} className="text-slate-500 hover:text-slate-800"><XCircle className="w-6 h-6" /></button>
                        </div>
                        <div className="p-4 flex flex-col items-center justify-center text-center space-y-6">
                            {viewingPdf.verificationPdf ? (
                                <div className="w-full h-[500px] border rounded-xl overflow-hidden bg-slate-50">
                                    {viewingPdf.verificationPdf.startsWith('data:application/pdf') || viewingPdf.verificationPdf.toLowerCase().includes('.pdf') ? (
                                        <iframe 
                                            src={viewingPdf.verificationPdf.startsWith('data:') ? viewingPdf.verificationPdf : `/api/files/${viewingPdf.verificationPdf}`} 
                                            className="w-full h-full" 
                                            title="License PDF" 
                                        />
                                    ) : (
                                        <img 
                                            src={viewingPdf.verificationPdf.startsWith('data:') ? viewingPdf.verificationPdf : `/api/files/${viewingPdf.verificationPdf}`} 
                                            alt="License" 
                                            className="w-full h-full object-contain" 
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="w-full h-80 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                                    <FileText className="w-20 h-20 mb-4 opacity-20" />
                                    <p className="font-medium uppercase tracking-widest text-xs">No Certificate Uploaded</p>
                                    <p className="text-sm mt-2">The doctor has not uploaded a verification document yet.</p>
                                </div>
                            )}
                            <div className="flex gap-4 w-full">
                                <button onClick={() => { handleAction(viewingPdf.id, 'approve'); setViewingPdf(null); }} className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all">Approve Doctor</button>
                                <button onClick={() => setViewingPdf(null)} className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
