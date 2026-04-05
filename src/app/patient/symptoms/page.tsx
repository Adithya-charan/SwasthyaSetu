'use client';
import { useState } from 'react';
import { Activity, Plus, Frown, Meh, Smile, Target, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { toast } from 'react-toastify';

export default function PatientSymptomsPage() {
    const [symptoms, setSymptoms] = useState([
        { date: 'Oct 20', headache: 3, energy: 6, pain: 2, note: 'Slept well' },
        { date: 'Oct 21', headache: 5, energy: 4, pain: 4, note: 'Stressful day' },
        { date: 'Oct 22', headache: 2, energy: 7, pain: 2, note: 'Feeling better' },
        { date: 'Oct 23', headache: 1, energy: 8, pain: 1, note: 'Almost normal' },
        { date: 'Oct 24', headache: 1, energy: 9, pain: 0, note: 'Great energy' },
    ]);
    
    // Scale 1 to 10
    const [newLog, setNewLog] = useState({ headache: 5, energy: 5, pain: 5, note: '' });

    const handleSave = () => {
        if (!newLog.note) {
            toast.error("Please add a short note.");
            return;
        }
        
        const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Don't add if today already exists, replace it
        setSymptoms(prev => {
            const filtered = prev.filter(p => p.date !== today);
            return [...filtered, { date: today, ...newLog }];
        });
        
        toast.success("Symptoms logged for today!");
    };

    const customTooltipStyle = { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Symptom Tracker</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Log form */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-primary-500" /> Log Today's Status
                    </h3>
                    
                    <div className="space-y-6">
                        {/* Energy Level */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-slate-700">Energy Level</label>
                                <span className="text-xs font-bold bg-primary-50 text-primary-700 px-2 py-0.5 rounded">{newLog.energy} / 10</span>
                            </div>
                            <input type="range" min="1" max="10" value={newLog.energy} onChange={e => setNewLog({...newLog, energy: parseInt(e.target.value)})} className="w-full accent-primary-600" />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span><Frown className="w-4 h-4 text-slate-300"/> Exhausted</span>
                                <span><Smile className="w-4 h-4 text-green-400"/> Energetic</span>
                            </div>
                        </div>

                        {/* Headache */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-slate-700">Headache Severity</label>
                                <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded">{newLog.headache} / 10</span>
                            </div>
                            <input type="range" min="0" max="10" value={newLog.headache} onChange={e => setNewLog({...newLog, headache: parseInt(e.target.value)})} className="w-full accent-red-500" />
                            <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>None</span>
                                <span>Severe</span>
                            </div>
                        </div>

                        {/* Pain */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-semibold text-slate-700">Body Pain</label>
                                <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded">{newLog.pain} / 10</span>
                            </div>
                            <input type="range" min="0" max="10" value={newLog.pain} onChange={e => setNewLog({...newLog, pain: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                             <div className="flex justify-between text-xs text-slate-400 mt-1">
                                <span>None</span>
                                <span>Severe</span>
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Notes</label>
                            <textarea 
                                rows={2}
                                value={newLog.note} 
                                onChange={e => setNewLog({...newLog, note: e.target.value})} 
                                className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm resize-none" 
                                placeholder="How are you feeling overall?" 
                            />
                        </div>

                        <button onClick={handleSave} className="w-full py-3 bg-primary-600 hover:bg-primary-700 transition-colors text-white font-bold rounded-xl shadow-md shadow-primary-600/20">
                            Save Entry
                        </button>
                    </div>
                </div>

                {/* Graph & History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-green-500" /> Symptom Trends
                        </h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={symptoms} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} />
                                    <Tooltip contentStyle={customTooltipStyle} />
                                    <Line type="monotone" name="Energy" dataKey="energy" stroke="#10b981" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Headache" dataKey="headache" stroke="#ef4444" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                    <Line type="monotone" name="Pain" dataKey="pain" stroke="#f97316" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs font-semibold text-slate-600">
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-500 rounded-full"></div> Energy</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-500 rounded-full"></div> Headache</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded-full"></div> Pain</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" /> Recent History
                        </h3>
                        <div className="space-y-3">
                            {symptoms.slice().reverse().map((s, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm mb-0.5">{s.date}</p>
                                        <p className="text-xs text-slate-500 italic">"{s.note}"</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="text-center bg-green-100/50 px-2 py-1 rounded">
                                            <div className="text-[10px] text-green-700 font-bold uppercase">Energy</div>
                                            <div className="text-sm font-bold text-slate-800">{s.energy}</div>
                                        </div>
                                        <div className="text-center bg-red-100/50 px-2 py-1 rounded">
                                            <div className="text-[10px] text-red-700 font-bold uppercase">Headache</div>
                                            <div className="text-sm font-bold text-slate-800">{s.headache}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
