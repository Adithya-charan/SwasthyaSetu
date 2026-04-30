'use client';
import { useState, useEffect } from 'react';
import { Search, Activity } from 'lucide-react';
import StatusBadge from '@/components/shared/StatusBadge';
import { toast } from 'react-toastify';
import { authFetch } from '@/lib/api';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadUsers();
    }, [filter]);

    const loadUsers = async () => {
        setIsLoading(true);
        try {
            const roleParam = filter === 'All' ? '' : `&role=${filter.toUpperCase().replace(/S$/, '')}`;
            const data = await authFetch(`/api/admin/users?page=0&size=100${roleParam}`);
            if (data.success) {
                setUsers(data.data.content);
            }
        } catch (error) {
            console.error("Error loading users", error);
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
            const data = await authFetch(`/api/admin/users/${id}/status?status=${newStatus}`, {
                method: 'PUT'
            });
            if (data.success) {
                toast.success(`User status changed to ${newStatus}`);
                loadUsers();
            }
        } catch (error) {
            console.error("Error updating status", error);
            toast.error("Failed to update status");
        }
    };

    const filtered = users.filter(u => {
        if (search && !u.fullName.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>

            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg w-full max-w-md overflow-x-auto shrink-0">
                    {['All', 'Patient', 'Doctor', 'Pharmacist'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`flex-1 min-w-[80px] py-1.5 px-3 text-sm font-medium rounded-md transition-all ${
                                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {f === 'All' ? 'All Users' : f + 's'}
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
                            <th className="p-4">Joined Date</th>
                            <th className="p-4 pr-6 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr><td colSpan={6} className="p-12 text-center text-slate-500 animate-pulse">Loading users...</td></tr>
                        ) : filtered.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 pl-6">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${user.accountStatus === 'ACTIVE' ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                                        <span className="font-bold text-slate-900">{user.fullName}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{user.email}</td>
                                <td className="p-4">
                                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded text-xs font-semibold capitalize">{user.role.toLowerCase()}</span>
                                </td>
                                <td className="p-4"><StatusBadge status={user.accountStatus} /></td>
                                <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td className="p-4 pr-6 text-right">
                                    <button 
                                        onClick={() => handleToggleStatus(user.id, user.accountStatus)}
                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                            user.accountStatus === 'ACTIVE' 
                                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' 
                                                : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                                        }`}
                                    >
                                        {user.accountStatus === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && filtered.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-12 text-center text-slate-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
