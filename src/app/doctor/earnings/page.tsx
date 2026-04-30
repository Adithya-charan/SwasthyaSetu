'use client';
import { useState } from 'react';
import { Wallet, IndianRupee, TrendingUp, Filter, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function DoctorEarningsPage() {
    const [period, setPeriod] = useState('This Week');
    
    // Mock Data
    const earningsData = [
        { date: 'Mon', amount: 4500, label: '₹4.5k' },
        { date: 'Tue', amount: 3200, label: '₹3.2k' },
        { date: 'Wed', amount: 5600, label: '₹5.6k' },
        { date: 'Thu', amount: 4800, label: '₹4.8k' },
        { date: 'Fri', amount: 7200, label: '₹7.2k' },
        { date: 'Sat', amount: 8500, label: '₹8.5k' },
        { date: 'Sun', amount: 2000, label: '₹2.0k' },
    ];

    const todayEarnings = 5600;
    const completedConsults = 14;

    const customTooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Earnings & summary</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-colors">
                        <Filter className="w-4 h-4"/> {period}
                    </button>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg font-medium hover:bg-primary-100 transition-colors">
                        <Download className="w-4 h-4"/> Statement
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 border border-green-200">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide text-sm mb-1 uppercase">Today's Earnings</p>
                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                        ₹{todayEarnings.toLocaleString()}
                        <span className="text-sm font-semibold text-green-500 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12%</span>
                    </h2>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 border border-blue-200">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <p className="text-slate-500 font-medium tracking-wide text-sm mb-1 uppercase">Today's Consultations</p>
                    <h2 className="text-3xl font-bold text-slate-900 border-b border-transparent">{completedConsults} <span className="text-lg text-slate-400 font-medium">patients</span></h2>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg text-white md:col-span-2 lg:col-span-1 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                    <div>
                        <p className="text-slate-300 font-medium tracking-wide text-sm mb-1 flex items-center gap-2"><Wallet className="w-4 h-4"/> Next Payout (Friday)</p>
                        <h2 className="text-4xl font-black text-white mb-2 tracking-tight">₹35,800</h2>
                        <p className="text-slate-400 text-sm">Processing 42 consultations</p>
                    </div>
                    <button className="w-full mt-6 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors border border-white/10">View Details</button>
                </div>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm min-h-[400px]">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary-500" /> Revenue Timeline
                </h3>
                <div className="h-[300px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={earningsData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, fontWeight: 500}} dy={15} />
                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={customTooltipStyle} formatter={(value: any) => `₹${Number(value).toLocaleString()}`} />
                            <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={50}>
                                {earningsData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.amount === Math.max(...earningsData.map(d=>d.amount)) ? '#0ea5e9' : '#38bdf8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
