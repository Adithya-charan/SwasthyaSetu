'use client';
import { useState, useEffect } from 'react';
import { Activity, Users, Video, Clock, Filter, Search, Power } from 'lucide-react';
import { MOCK_ACTIVITY_LOGS, MOCK_ONLINE_USERS } from '@/data/mockActivityData';
import { toast } from 'react-toastify';

export default function AdminActivityDashboard() {
    const [lastUpdate, setLastUpdate] = useState('just now');
    const [onlineUsers, setOnlineUsers] = useState(MOCK_ONLINE_USERS);
    const [logs, setLogs] = useState(MOCK_ACTIVITY_LOGS);

    // Filters
    const [roleFilter, setRoleFilter] = useState('All Roles');
    const [statusFilter, setStatusFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    // Last update ticker
    useEffect(() => {
        let seconds = 0;
        const interval = setInterval(() => {
            seconds += 1;
            if (seconds < 10) setLastUpdate('just now');
            else if (seconds < 60) setLastUpdate(`${seconds} seconds ago`);
            else setLastUpdate(`${Math.floor(seconds/60)} minute${Math.floor(seconds/60)>1?'s':''} ago`);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Simulated real-time stat refresh every 30s
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            setLastUpdate('just now');
            // Mock refreshing data here by slightly altering times or adding dummy logs if it was an API
            toast.info("Activity data refreshed", { autoClose: 1000, hideProgressBar: true, position: 'bottom-right' });
        }, 30000);
        return () => clearInterval(refreshInterval);
    }, []);

    const patientCount = onlineUsers.filter(u => u.role === 'Patient').length;
    const doctorCount = onlineUsers.filter(u => u.role === 'Doctor').length;
    const pharmacistCount = onlineUsers.filter(u => u.role === 'Pharmacist').length;
    const consultationCount = onlineUsers.filter(u => u.status === 'In Consultation').length;

    const handleForceLogout = (id: string, name: string) => {
        if (confirm(`Are you sure you want to force logout ${name}?`)) {
            setOnlineUsers(onlineUsers.filter(u => u.id !== id));
            toast.success(`${name} has been logged out.`);
        }
    };

    const StatusBadge = ({ s }: { s: string }) => {
        if (s === 'Online') return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500"></span>{s}</span>;
        if (s === 'In Consultation') return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-500"></span>{s}</span>;
        if (s === 'Idle') return <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-yellow-400"></span>{s}</span>;
        return <span>{s}</span>;
    };

    const LogStatus = ({ s }: { s: string }) => {
        if (s === 'Completed') return <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">Completed</span>;
        if (s === 'Active') return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Active</span>;
        if (s === 'Force Logged Out') return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-semibold">Force Logged Out</span>;
        return null;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="w-6 h-6 text-primary-600" />
                    Real-time Activity
                </h1>
                <p className="text-sm text-slate-500 font-medium">Last updated: <span className="text-slate-800">{lastUpdate}</span></p>
            </div>

            {/* SECTION A - Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Patients Online</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{patientCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Doctors Online</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{doctorCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></span>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Pharmacies</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{pharmacistCount}</p>
                </div>
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Calls</h3>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{consultationCount}</p>
                </div>
            </div>

            {/* SECTION B - Online Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                    <h2 className="text-lg font-bold text-slate-900">Currently Online Users</h2>
                </div>
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold bg-white">
                            <th className="p-4 pl-6">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Login Time</th>
                            <th className="p-4">Current Activity</th>
                            <th className="p-4">Session Duration</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {onlineUsers.map(u => (
                            <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${u.role==='Doctor'?'bg-blue-100 text-blue-700':u.role==='Patient'?'bg-green-100 text-green-700':'bg-purple-100 text-purple-700'}`}>{u.avatar}</div>
                                        <span className="font-bold text-slate-900">{u.name}</span>
                                    </div>
                                </td>
                                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-semibold">{u.role}</span></td>
                                <td className="p-4 font-medium text-slate-700"><StatusBadge s={u.status} /></td>
                                <td className="p-4 text-slate-500 text-sm">{u.loginTime}</td>
                                <td className="p-4 text-slate-600 font-medium text-sm">{u.activity}</td>
                                <td className="p-4 text-slate-500 text-sm font-medium">{u.duration}</td>
                                <td className="p-4 pr-6 text-right">
                                    <button onClick={() => handleForceLogout(u.id, u.name)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-semibold transition-colors border border-red-200 ml-auto">
                                        <Power className="w-3.5 h-3.5" /> Force Logout
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {onlineUsers.length === 0 && <tr><td colSpan={7} className="p-12 text-center text-slate-500">No users online.</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* SECTION C - History Logs */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <h2 className="text-lg font-bold text-slate-900">Session History Logs</h2>
                    <div className="flex flex-wrap gap-2 w-full md:w-auto">
                        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} className="p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                            <option>All Roles</option><option>Patient</option><option>Doctor</option><option>Pharmacist</option>
                        </select>
                        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="p-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500">
                            <option>All</option><option>Active</option><option>Completed</option><option>Force Logged Out</option>
                        </select>
                        <div className="relative flex-1 md:w-48">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input type="text" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500" />
                        </div>
                    </div>
                </div>
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold bg-white">
                            <th className="p-4 pl-6">User</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Login</th>
                            <th className="p-4">Logout</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Device</th>
                            <th className="p-4 pr-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {logs.filter(l => 
                            (roleFilter === 'All Roles' || l.role === roleFilter) && 
                            (statusFilter === 'All' || l.status === statusFilter) &&
                            (searchQuery === '' || l.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        ).map(l => (
                            <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6 font-bold text-slate-900">{l.name}</td>
                                <td className="p-4"><span className="text-slate-600 text-sm font-medium">{l.role}</span></td>
                                <td className="p-4 text-slate-500 text-sm font-medium">{l.loginTime}</td>
                                <td className="p-4 text-slate-500 text-sm">{l.logoutTime}</td>
                                <td className="p-4 text-slate-600 text-sm">{l.duration}</td>
                                <td className="p-4 text-slate-500 text-sm">{l.device}</td>
                                <td className="p-4 pr-6"><LogStatus s={l.status} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
