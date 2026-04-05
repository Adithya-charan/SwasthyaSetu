'use client';
import { useState } from 'react';
import { Users, FileText, Calendar, Search, Pill, Activity, AlertCircle } from 'lucide-react';

const MOCK_PATIENTS = [
    { 
        id: 1, name: 'Alice Walker', lastVisit: 'Oct 20, 2024', visits: 5, dob: '14 May 1985', bloodGroup: 'O+',
        history: [
            { date: 'Oct 20, 2024', type: 'Consultation', note: 'Routine checkup. Blood pressure normal.' },
            { date: 'Jul 12, 2024', type: 'Prescription', note: 'Prescribed Amoxicillin 500mg for 5 days.' }
        ]
    },
    { 
        id: 2, name: 'Bob Smith', lastVisit: 'Sep 15, 2024', visits: 2, dob: '22 Aug 1990', bloodGroup: 'A-',
        history: [
            { date: 'Sep 15, 2024', type: 'Consultation', note: 'Complained of chronic back pain.' },
            { date: 'Sep 20, 2024', type: 'Lab', note: 'MRI scan results uploaded.' }
        ]
    },
    { 
        id: 3, name: 'Emily Chen', lastVisit: 'Aug 05, 2024', visits: 8, dob: '03 Nov 1978', bloodGroup: 'AB+',
        history: [
            { date: 'Aug 05, 2024', type: 'Consultation', note: 'Follow-up for diabetes management.' },
            { date: 'Jul 01, 2024', type: 'Prescription', note: 'Metformin dosage adjusted to 1000mg/day.' },
            { date: 'Jun 15, 2024', type: 'Lab', note: 'HbA1c level: 6.8%' }
        ]
    },
];

export default function DoctorPatientsList() {
    const [search, setSearch] = useState('');
    const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

    const filtered = MOCK_PATIENTS.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

    const getIcon = (type: string) => {
        if (type === 'Prescription') return <Pill className="w-4 h-4 text-green-500" />;
        if (type === 'Lab') return <Activity className="w-4 h-4 text-purple-500" />;
        return <FileText className="w-4 h-4 text-blue-500" />;
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>

            <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Type a name to search patient history instantly..."
                    className="w-full pl-12 pr-4 py-4 border border-slate-300 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500 shadow-sm transition-all font-medium text-slate-800"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="bg-slate-50 border-b border-slate-200 p-4">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5" /> Patient List</h3>
                    </div>
                    <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                        {filtered.length > 0 ? filtered.map(p => (
                            <button 
                                key={p.id} 
                                onClick={() => setSelectedPatient(p.id)}
                                className={`w-full text-left p-4 transition-all hover:bg-slate-50 flex items-center gap-3 ${selectedPatient === p.id ? 'bg-primary-50/50 border-l-4 border-l-primary-500' : 'border-l-4 border-l-transparent'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${selectedPatient === p.id ? 'bg-primary-600 text-white' : 'bg-primary-100 text-primary-700'}`}>
                                    {p.name.charAt(0)}
                                </div>
                                <div>
                                    <p className={`font-bold ${selectedPatient === p.id ? 'text-primary-900' : 'text-slate-800'}`}>{p.name}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Last visit: {p.lastVisit}</p>
                                </div>
                            </button>
                        )) : (
                            <div className="p-8 text-center text-slate-500 text-sm flex flex-col items-center">
                                <AlertCircle className="w-8 h-8 text-slate-300 mb-2"/>
                                No patients found matching "{search}"
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2">
                    {selectedPatient ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                            {MOCK_PATIENTS.filter(p => p.id === selectedPatient).map(patient => (
                                <div key={patient.id}>
                                    <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl"></div>
                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-3xl font-black border border-white/20 shadow-inner">
                                                {patient.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold mb-1">{patient.name}</h2>
                                                <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-300 font-medium">
                                                    <span>DOB: {patient.dob}</span>
                                                    <span>Blood: <span className="text-red-400 font-bold">{patient.bloodGroup}</span></span>
                                                    <span>Total Visits: {patient.visits}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
                                            <FileText className="w-5 h-5 text-primary-500" /> Medical Timeline
                                        </h3>
                                        
                                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                                            {patient.history.map((record, index) => (
                                                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-slate-100 text-slate-500 group-[.is-active]:bg-white group-[.is-active]:text-primary-600 group-[.is-active]:border-primary-100 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
                                                        {getIcon(record.type)}
                                                    </div>
                                                    
                                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-bold text-sm text-slate-900">{record.type}</span>
                                                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{record.date}</span>
                                                        </div>
                                                        <p className="text-sm text-slate-600 leading-relaxed text-left">{record.note}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed h-full min-h-[400px] flex flex-col items-center justify-center text-slate-400 p-8">
                            <Users className="w-16 h-16 mb-4 text-slate-300" />
                            <h3 className="text-lg font-bold text-slate-600 mb-1">Select a Patient</h3>
                            <p className="text-center text-sm">Choose a patient from the list or use the search bar to instantly pull up their full medical timeline.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
