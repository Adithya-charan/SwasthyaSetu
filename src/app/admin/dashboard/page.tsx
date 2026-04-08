'use client';
import { useState, useEffect } from 'react';
import StatCard from '@/components/shared/StatCard';
import { Users, UserCheck, Calendar, Pill, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from 'recharts';

export default function AdminDashboard() {
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => { setIsMounted(true); }, []);

    if (!isMounted) return <div className="min-h-screen bg-slate-50 animate-pulse" />;
    // Mock Chart Data
    const barData = [
        { name: 'Mon', appointments: 12 },
        { name: 'Tue', appointments: 8 },
        { name: 'Wed', appointments: 15 },
        { name: 'Thu', appointments: 6 },
        { name: 'Fri', appointments: 20 },
        { name: 'Sat', appointments: 5 },
        { name: 'Sun', appointments: 3 },
    ];

    const pieData = [
        { name: 'Completed', value: 45, color: '#10b981' }, // green-500
        { name: 'Pending', value: 25, color: '#f59e0b' },   // yellow-500
        { name: 'Cancelled', value: 10, color: '#ef4444' }, // red-500
        { name: 'In Progress', value: 20, color: '#3b82f6' }, // blue-500
    ];

    const usageData = [
        { time: '12am', users: 150 },
        { time: '4am', users: 50 },
        { time: '8am', users: 800 },
        { time: '12pm', users: 1500 },
        { time: '4pm', users: 1200 },
        { time: '8pm', users: 1800 },
        { time: '11pm', users: 600 },
    ];

    // Tooltip styles for recharts
    const customTooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Platform Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users className="w-6 h-6" />} value="10,240" label="Total Patients" accentColor="primary" />
                <StatCard icon={<UserCheck className="w-6 h-6" />} value="85" label="Registered Doctors" accentColor="blue" />
                <StatCard icon={<Calendar className="w-6 h-6" />} value="4,500" label="Total Appointments" accentColor="purple" />
                <StatCard icon={<Pill className="w-6 h-6" />} value="8,900" label="Total Prescriptions" accentColor="green" />
            </div>

            {/* CHARTS ROW 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary-500" />
                        Appointments This Week
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip contentStyle={customTooltipStyle} cursor={{fill: '#f8fafc'}} />
                                <Bar dataKey="appointments" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-purple-500" />
                        Status Breakdown
                    </h3>
                    <div className="h-[220px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={customTooltipStyle} itemStyle={{color: '#0f172a', fontWeight: '500'}} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-bold text-slate-900">100</span>
                            <span className="text-xs text-slate-500 font-medium">%</span>
                        </div>
                    </div>
                    {/* Pie Legend */}
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        {pieData.map(item => (
                            <div key={item.name} className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                <span className="text-xs text-slate-600 font-medium">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CHARTS ROW 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-indigo-500" />
                        Platform Usage (Peak Hours)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={usageData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip contentStyle={customTooltipStyle} />
                                <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" activeDot={{r: 6, fill: '#6366f1', stroke: '#fff'}} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm overflow-hidden h-full">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">Recent System Activity</h3>
                    <div className="space-y-4">
                        {[
                            { text: 'New doctor Dr. Emily Chen onboarded', time: '2 mins ago', icon: <UserCheck className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-50' },
                            { text: 'Appointment booked by Alice Walker', time: '15 mins ago', icon: <Calendar className="w-4 h-4 text-primary-500" />, bg: 'bg-primary-50' },
                            { text: 'Prescription PR-1001 dispensed', time: '1 hour ago', icon: <Pill className="w-4 h-4 text-green-500" />, bg: 'bg-green-50' },
                            { text: 'New patient John Doe registered', time: '3 hours ago', icon: <Users className="w-4 h-4 text-yellow-500" />, bg: 'bg-yellow-50' },
                            { text: 'System backup completed successfully', time: '5 hours ago', icon: <Activity className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-50' },
                        ].map((activity, idx) => (
                            <div key={idx} className="flex gap-3 items-start">
                                <div className={`w-8 h-8 rounded-full ${activity.bg} flex-shrink-0 flex items-center justify-center`}>
                                    {activity.icon}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-700 font-medium">{activity.text}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    );
}
