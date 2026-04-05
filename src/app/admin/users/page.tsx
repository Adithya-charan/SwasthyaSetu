'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'react-toastify';

const MOCK_USERS = [
    { id: 1, name: 'Alice Walker', email: 'alice@example.com', role: 'patient', status: 'ACTIVE' as const, joined: 'Jan 15, 2024', isOnline: false, lastSeen: '2 hours ago', totalSessions: 14 },
    { id: 2, name: 'Dr. Sarah Smith', email: 'sarah.s@hospital.com', role: 'doctor', status: 'ACTIVE' as const, joined: 'Feb 20, 2024', isOnline: true, lastSeen: 'Online now', totalSessions: 120 },
    { id: 3, name: 'John Doe', email: 'john@example.com', role: 'patient', status: 'INACTIVE' as const, joined: 'Mar 10, 2024', isOnline: false, lastSeen: '1 month ago', totalSessions: 2 },
    { id: 4, name: 'Rx Pharm', email: 'pharmacy1@example.com', role: 'pharmacist', status: 'ACTIVE' as const, joined: 'Apr 05, 2024', isOnline: true, lastSeen: 'Online now', totalSessions: 45 },
    { id: 5, name: 'Dr. Emily Chen', email: 'echen@hospital.com', role: 'doctor', status: 'ACTIVE' as const, joined: 'Jan 10, 2024', isOnline: false, lastSeen: 'Yesterday', totalSessions: 300 },
];

export default function AdminUsersPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    const handleToggleStatus = (id: number) => {
        setUsers(users.map(u => {
            if (u.id === id) {
                const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
                toast.success(`User status changed to ${newStatus}`);
                return { ...u, status: newStatus as any };
            }
            return u;
        }));
    };

    const filtered = users.filter(u => {
        if (filter !== 'All' && u.role.toLowerCase() !== filter.toLowerCase().replace(/s$/, '')) return false;
        if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-full max-w-md overflow-x-auto shrink-0">
                    {['All', 'Patients', 'Doctors', 'Pharmacists'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 min-w-[80px] py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left min-w-[900px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase tracking-wider text-slate-500 font-semibold">
                            <th className="p-4 pl-6">Name</th>
                            <th className="p-4">Email</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Joined</th>
                            <th className="p-4">Last Seen</th>
                            <th className="p-4">Total Sessions</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtered.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${user.isOnline ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        <span className="font-bold text-slate-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{user.email}</td>
                                <td className="p-4">
                                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold capitalize">{user.role}</span>
                                </td>
                                <td className="p-4"><StatusBadge status={user.status} /></td>
                                <td className="p-4 text-sm text-slate-500">{user.joined}</td>
                                <td className="p-4">
                                    <span className={`text-sm font-medium ${user.isOnline ? 'text-green-600' : 'text-slate-500'}`}>{user.lastSeen}</span>
                                </td>
                                <td className="p-4 text-sm text-slate-600 font-semibold text-center">{user.totalSessions}</td>
                                <td className="p-4 pr-6 text-right">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                            user.status === 'ACTIVE' 
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                        }`}
                                    >
                                        {user.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={8} className="p-12 text-center text-slate-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
