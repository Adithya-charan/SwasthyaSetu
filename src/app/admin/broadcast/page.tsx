'use client';
import { useState } from 'react';
import { Send, Users, AlertCircle, Megaphone } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminBroadcastPage() {
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('All Users');
    const [isUrgent, setIsUrgent] = useState(false);

    const handleSend = () => {
        if (!message) {
            toast.error("Message cannot be empty.");
            return;
        }

        // Mock sending
        toast.success(`Broadcast message sent to ${targetRole} users!`);
        setMessage('');
        setIsUrgent(false);
        setTargetRole('All Users');
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-lg shadow-primary-500/10">
                    <Megaphone className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Broadcast Message</h1>
                <p className="text-slate-500">Send instant system-wide notifications to specific user groups.</p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" /> Target Audience
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {['All Users', 'Patients', 'Doctors', 'Pharmacists'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setTargetRole(role)}
                                    className={`py-3 px-2 rounded-xl border-2 font-semibold text-sm transition-all text-center ${targetRole === role ? 'border-primary-500 bg-primary-50 text-primary-700 shadow-sm' : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300 hover:bg-slate-50'}`}
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="block text-sm font-bold text-slate-700">Message Content</label>
                            <span className={`text-xs font-semibold ${message.length > 200 ? 'text-orange-500' : 'text-slate-400'}`}>{message.length} / 250</span>
                        </div>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, 250))}
                            placeholder="Type your broadcast message here..."
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none transition-colors"
                        />
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex gap-3 items-center">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isUrgent ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-500'}`}>
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm mb-0.5">High Priority Alert</h4>
                                <p className="text-xs text-slate-500 font-medium">Message will trigger a loud ping and red badge.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsUrgent(!isUrgent)}
                            className={`w-14 h-8 rounded-full transition-colors relative shadow-inner flex items-center px-1 ${isUrgent ? 'bg-red-500' : 'bg-slate-300'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button 
                            onClick={handleSend}
                            className={`w-full py-4 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-xl hover:scale-[1.01] active:scale-[0.99] ${isUrgent ? 'bg-red-600 hover:bg-red-500 shadow-red-600/20' : 'bg-primary-600 hover:bg-primary-500 shadow-primary-600/20'}`}
                        >
                            <Send className="w-5 h-5" /> Send Broadcast
                        </button>
                        <p className="text-center text-xs text-slate-400 font-medium mt-4 bg-slate-50 py-2 rounded-lg border border-slate-100">
                            By sending, this message will instantly appear in the notification panel for all selected users.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
