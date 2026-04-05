'use client';
import { useState, useEffect } from 'react';
import { Pill, Clock, BellRing, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function PatientRemindersPage() {
    const [reminders, setReminders] = useState([
        { id: 1, medicine: 'Metformin', dosage: '500mg', time: '08:00', period: 'Morning', taken: false },
        { id: 2, medicine: 'Lisinopril', dosage: '10mg', time: '13:00', period: 'Afternoon', taken: false },
        { id: 3, medicine: 'Atorvastatin', dosage: '20mg', time: '20:00', period: 'Night', taken: false }
    ]);
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newMed, setNewMed] = useState({ medicine: '', dosage: '', time: '' });

    useEffect(() => {
        setCurrentTime(new Date());
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const markTaken = (id: number) => {
        setReminders(reminders.map(r => r.id === id ? { ...r, taken: true } : r));
        toast.success("Medicine marked as taken. Great job!");
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMed.medicine || !newMed.dosage || !newMed.time) {
            toast.error("Please fill all fields");
            return;
        }
        
        let hours = parseInt(newMed.time.split(':')[0]);
        let period = 'Morning';
        if (hours >= 12 && hours < 17) period = 'Afternoon';
        else if (hours >= 17) period = 'Night';

        setReminders([...reminders, {
            id: Date.now(),
            medicine: newMed.medicine,
            dosage: newMed.dosage,
            time: newMed.time,
            period,
            taken: false
        }].sort((a, b) => a.time.localeCompare(b.time)));
        
        setNewMed({ medicine: '', dosage: '', time: '' });
        setShowAdd(false);
        toast.success("Reminder added successfully!");
    };

    const getUpcomingReminder = () => {
        if (!currentTime) return null;
        const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
        
        const upcoming = reminders
            .filter(r => !r.taken)
            .map(r => {
                const [h, m] = r.time.split(':').map(Number);
                const rMinutes = h * 60 + m;
                let diff = rMinutes - nowMinutes;
                if (diff < 0) diff += 24 * 60; // next day
                return { ...r, diff };
            })
            .sort((a, b) => a.diff - b.diff)[0];

        if (!upcoming || upcoming.diff > 2 * 60) return null; // Only show if within 2 hours
        
        return upcoming;
    };

    const upcoming = getUpcomingReminder();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-2xl font-bold text-slate-900">Medicine Reminders</h1>
                <button 
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-all shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> Add Reminder
                </button>
            </div>

            {upcoming && (
                <div className="bg-yellow-50 border-2 border-yellow-400 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shrink-0 shadow-inner">
                        <BellRing className="w-8 h-8 text-yellow-900 animate-pulse" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h2 className="text-yellow-900 font-bold text-xl mb-1">Upcoming Dose in {upcoming.diff} minutes</h2>
                        <p className="text-yellow-800 text-lg">Take <span className="font-bold">{upcoming.medicine} {upcoming.dosage}</span> at {upcoming.time}</p>
                    </div>
                    <button 
                        onClick={() => markTaken(upcoming.id)}
                        className="w-full md:w-auto px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2"
                    >
                        <CheckCircle2 className="w-5 h-5"/> I Took It
                    </button>
                </div>
            )}

            {showAdd && (
                <form onSubmit={handleAdd} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6 animate-in fade-in relative">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Add New Reminder</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Medicine Name</label>
                            <input type="text" value={newMed.medicine} onChange={e => setNewMed({...newMed, medicine: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. Amoxicillin" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Dosage</label>
                            <input type="text" value={newMed.dosage} onChange={e => setNewMed({...newMed, dosage: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="e.g. 250mg" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Time</label>
                            <input type="time" value={newMed.time} onChange={e => setNewMed({...newMed, time: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end gap-3">
                        <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg font-medium hover:bg-slate-50">Cancel</button>
                        <button type="submit" className="px-6 py-2 bg-primary-600 focus:ring-2 focus:ring-primary-500 text-white rounded-lg font-medium hover:bg-primary-700">Save Reminder</button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-primary-500" /> Today's Schedule
                    </h3>
                </div>
                <div className="divide-y divide-slate-100">
                    {reminders.map(reminder => (
                        <div key={reminder.id} className={`p-4 sm:p-6 flex items-center justify-between transition-colors ${reminder.taken ? 'bg-slate-50/50' : 'hover:bg-slate-50'}`}>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center shrink-0 border-2 ${reminder.taken ? 'bg-green-100 border-green-200 text-green-600' : 'bg-primary-50 border-primary-100 text-primary-600'}`}>
                                    {reminder.taken ? <CheckCircle2 className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className={`font-bold text-lg ${reminder.taken ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{reminder.medicine}</h4>
                                        <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-semibold">{reminder.dosage}</span>
                                    </div>
                                    <p className="text-slate-500 text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {reminder.time} • {reminder.period}</p>
                                </div>
                            </div>
                            <div>
                                {!reminder.taken ? (
                                    <button onClick={() => markTaken(reminder.id)} className="px-4 py-2 bg-slate-100 hover:bg-green-100 hover:text-green-700 text-slate-600 font-medium rounded-lg transition-colors border border-transparent hover:border-green-200 text-sm flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4"/> Mark Taken
                                    </button>
                                ) : (
                                    <span className="text-green-500 font-medium flex items-center gap-1.5 text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">
                                        Taken Successfully
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
