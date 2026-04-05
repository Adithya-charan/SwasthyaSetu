'use client';
import { useState, useEffect } from 'react';
import { StickyNote, X, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function QuickNotesWidget() {
    const { user } = useAuth();
    // Only show for doctors
    if (user?.role !== 'doctor') return null;

    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('doctor_quick_notes');
        if (saved) setNotes(saved);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(e.target.value);
        localStorage.setItem('doctor_quick_notes', e.target.value);
    };

    if (!isOpen) {
        return (
            <button 
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-primary-600 text-white p-4 rounded-full shadow-xl hover:bg-primary-700 hover:scale-105 transition-all outline-none"
                title="Quick Notes Scratchpad"
            >
                <StickyNote className="w-6 h-6" />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 z-50 bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${isExpanded ? 'w-[400px] h-[500px]' : 'w-[300px] h-[350px]'} animate-in slide-in-from-bottom-5`}>
            {/* Header */}
            <div className="bg-slate-900 px-4 py-3 flex items-center justify-between text-white border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <StickyNote className="w-4 h-4 text-primary-400" />
                    <span className="font-bold text-sm tracking-wide">Scratchpad</span>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors text-slate-300 hover:text-white">
                        {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors text-slate-300">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {/* Body */}
            <div className="flex-1 bg-yellow-50 relative">
                <textarea
                    value={notes}
                    onChange={handleChange}
                    className="w-full h-full p-4 bg-transparent resize-none outline-none text-slate-800 text-sm leading-relaxed"
                    placeholder="Jot down quick thoughts... (saves automatically)"
                    style={{ backgroundImage: 'linear-gradient(transparent, transparent 27px, #fdb0e322 28px)', backgroundSize: '100% 28px' }}
                />
            </div>
            {/* Footer */}
            <div className="bg-white border-t border-slate-200 p-2 text-center text-xs text-slate-400 font-medium">
                Saved continuously to locally
            </div>
        </div>
    );
}
