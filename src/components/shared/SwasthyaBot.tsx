'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon, Sparkles, Mic, MicOff, Globe, ArrowRight, Loader2, Activity, Trash2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { AUTOCOMPLETE_SUGGESTIONS, detectLanguage } from '@/lib/swasthyasetu-prompt';
import { motion, AnimatePresence } from 'framer-motion';

export default function SwasthyaBot() {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const pathname = usePathname();
    const router = useRouter();
    const chatContainerRef = useRef<HTMLDivElement>(null);
    
    const [detectedLang, setDetectedLang] = useState('en');
    const [messages, setMessages] = useState<any[]>([
        { id: '1', role: 'assistant', content: 'Namaste! I am your SwasthyaSetu AI. I can help with bookings, records, or health questions. How can I assist you?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isConfirmingClear, setIsConfirmingClear] = useState(false);

    const clearChat = () => {
        setMessages([{ id: Date.now().toString(), role: 'assistant', content: 'Chat history cleared. How else can I help you today?' }]);
        setIsConfirmingClear(false);
    };

    // VOICE RECOGNITION (Web Speech API)
    const startListening = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Voice recognition not supported in this browser.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = detectedLang === 'hi' ? 'hi-IN' : detectedLang === 'te' ? 'te-IN' : 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            sendMessage(transcript);
        };
        recognition.start();
    };

    // ACTION PARSER: Look for [ACTION:REDIRECT:path]
    const handleActions = (text: string) => {
        const actionMatch = text.match(/\[ACTION:REDIRECT:(.*?)\]/i);
        if (actionMatch && actionMatch[1]) {
            const path = actionMatch[1].trim();
            console.log("Navigating to:", path);
            setIsRedirecting(true);
            setTimeout(() => {
                router.push(path);
                setIsRedirecting(false);
                setIsOpen(false);
            }, 600); // Faster redirect like Comet
            return text.replace(/\[ACTION:REDIRECT:.*?\]/gi, '').trim();
        }
        return text;
    };

    const handleLocalCommands = (text: string): boolean => {
        // Password input command for login page
        if (pathname === '/login') {
            const pwdMatch = text.toLowerCase().match(/my password is\s+(.+)/i) || 
                             text.toLowerCase().match(/mera password\s+(.+)\s+hai/i); // Hindi support
            
            if (pwdMatch && pwdMatch[1]) {
                const extractedPassword = pwdMatch[1].trim();
                document.dispatchEvent(new CustomEvent('fill-password', { detail: extractedPassword }));
                
                const sysMsg = { id: Date.now().toString(), role: 'assistant', content: 'I have filled in your password securely.' };
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: 'My password is ●●●●●●' }, sysMsg]);
                setInput('');
                return true; // Command handled locally
            }
        }
        return false;
    };

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;
        
        // Check for local commands first (like voice password)
        if (handleLocalCommands(content)) return;
        
        const lang = detectLanguage(content);
        if (lang !== detectedLang) setDetectedLang(lang);

        const userMsg = { id: Date.now().toString(), role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMsg],
                    pathname: pathname || '/',
                    userRole: user?.role || 'guest',
                    patientLang: detectedLang
                })
            });

            if (!response.ok) throw new Error('API Error');

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No reader');

            const assistantId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

            let accumulated = '';
            const decoder = new TextDecoder();
            let buffer = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('0:')) {
                        try {
                            const trimmedLine = line.substring(2).trim();
                            if (!trimmedLine) continue;
                            const text = JSON.parse(trimmedLine);
                            accumulated += text;
                            setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: accumulated } : m));
                        } catch(e) {}
                    }
                }
            }
            
            handleActions(accumulated);

        } catch (err) {
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: 'Connection issue. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : (user?.role === 'doctor' ? 'Dr' : 'U');
    };

    const getLangLabel = (code: string) => {
        const map: any = { te: 'తెలుగు', hi: 'हिन्दी', en: 'English', ja: 'JP', bn: 'BN' };
        return map[code] || 'EN-IN';
    };

    return (
        <div className="fixed bottom-8 right-8 z-[99999] flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 30 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-200/50 w-[400px] h-[680px] mb-6 flex flex-col overflow-hidden pointer-events-auto relative ring-1 ring-black/5"
                    >
                        {/* REDIRECTING OVERLAY */}
                        <AnimatePresence>
                            {isRedirecting && (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white/90 backdrop-blur-xl z-[100] flex flex-col items-center justify-center text-center p-10"
                                >
                                    <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary-200 animate-pulse">
                                        <Loader2 className="w-12 h-12 animate-spin-slow" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">Synchronizing...</h3>
                                    <p className="text-slate-500 font-medium">Preparing your destination</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* HEADER - MODERN GRADIENT MESH */}
                        <div className="relative shrink-0 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-primary-600 to-indigo-700 opacity-95"></div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
                            <div className="relative px-8 py-8 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl group transition-all">
                                            <Activity className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
                                        </div>
                                        <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-4 border-indigo-600 rounded-full shadow-lg"></span>
                                    </div>
                                    <div>
                                        <h3 className="font-black text-white text-xl tracking-tight leading-none mb-1.5 flex items-center gap-2">
                                            Swasthya AI
                                            <span className="px-1.5 py-0.5 bg-white/20 rounded text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm border border-white/10">Gen-3</span>
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                                            <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest leading-none">Ready to Assist</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {isConfirmingClear ? (
                                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/10">
                                            <button 
                                                onClick={clearChat} 
                                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase rounded-lg shadow-lg"
                                            >
                                                Confirm
                                            </button>
                                            <button 
                                                onClick={() => setIsConfirmingClear(false)} 
                                                className="p-1.5 text-white/70 hover:text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setIsConfirmingClear(true)} 
                                            className="p-2 text-white/50 hover:bg-white/10 hover:text-white rounded-xl transition-all border border-white/5" 
                                            title="Clear History"
                                        >
                                            <Trash2 className="w-4.5 h-4.5" />
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="p-2.5 text-white/70 hover:bg-white/10 hover:text-white rounded-2xl transition-all border border-white/5">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES - STAGGERED FLOW */}
                        <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/10 custom-scrollbar">
                            {messages.map((m, idx) => {
                                const cleanContent = m.content.replace(/\[ACTION:REDIRECT:.*?\]/gi, '').trim();
                                if (!cleanContent && m.role === 'assistant') return null;

                                return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: 0.1 }}
                                    key={m.id} 
                                    className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black shrink-0 shadow-sm ${
                                        m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-100 text-primary-600'
                                    }`}>
                                        {m.role === 'user' ? getInitials(user?.name || '') : <Activity className="w-5 h-5" />}
                                    </div>
                                    <div className={`max-w-[82%] p-4 rounded-2xl text-sm leading-relaxed font-medium transition-all ${
                                        m.role === 'user' 
                                        ? 'bg-indigo-600 text-white rounded-tr-none shadow-lg shadow-indigo-200/50' 
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm'
                                    }`}>
                                        <div className="whitespace-pre-wrap">
                                            {cleanContent === 'Connection issue. Please try again.' ? (
                                                <div className="flex items-center gap-2 text-red-500">
                                                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                                                    Groq API connection timeout. Please check your credentials or try again later.
                                                </div>
                                            ) : cleanContent}
                                        </div>
                                        {m.content.includes('[ACTION:REDIRECT:') && (
                                            <div className="mt-4 flex items-center gap-3 text-[9px] font-black text-emerald-600 bg-emerald-50/80 py-2.5 px-4 rounded-xl border border-emerald-100/50 uppercase tracking-widest">
                                                <Sparkles className="w-4 h-4 animate-pulse" /> Routing you to Destination...
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                                );
                            })}
                            
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                                        <Activity className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div className="px-6 py-4 bg-white rounded-2xl rounded-tl-none flex gap-2 items-center shadow-sm border border-slate-100">
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                        <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        {/* INPUT - ULTRA CLEAN */}
                        <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                            {messages.length < 5 && (
                                <div className="flex pb-4 gap-2 overflow-x-auto no-scrollbar shrink-0">
                                    {AUTOCOMPLETE_SUGGESTIONS.slice(0, 4).map((s, i) => (
                                        <button key={i} onClick={() => handleSuggestionClick(s)} className="text-[9px] font-black uppercase tracking-widest px-4 py-2.5 bg-slate-50 hover:bg-indigo-600 text-slate-500 hover:text-white rounded-xl border border-slate-100 transition-all whitespace-nowrap">
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="relative flex-1 group">
                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                        <MessageCircle className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                                        placeholder={isListening ? "Listening natively..." : "Type your request..."}
                                        className="w-full bg-slate-50 focus:bg-white border-2 border-slate-100 focus:border-indigo-600/30 rounded-2xl pl-11 pr-12 py-4 text-sm outline-none transition-all text-slate-900 placeholder:text-slate-400 font-semibold"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={startListening}
                                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                                            isListening ? 'bg-red-500 text-white shadow-lg' : 'text-slate-300 hover:text-indigo-600'
                                        }`}
                                    >
                                        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                    </button>
                                </div>
                                <button 
                                    onClick={() => sendMessage(input)}
                                    disabled={!input.trim() || isLoading}
                                    className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-30 shrink-0"
                                >
                                    <Send className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FLOATING LOGO TRIGGER - PULSING ORB */}
            <motion.button
                layout
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className={`w-20 h-20 rounded-[2.2rem] shadow-[0_25px_50px_-12px_rgba(30,41,59,0.4)] flex items-center justify-center transition-all duration-500 pointer-events-auto border-[6px] relative group overflow-hidden ${
                    isOpen 
                    ? 'bg-slate-900 border-slate-800 text-white' 
                    : 'bg-white border-white text-indigo-600 shadow-indigo-100'
                }`}
            >
                <div className={`absolute inset-0 transition-opacity duration-500 ${isOpen ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-indigo-600/10 animate-pulse"></div>
                </div>

                {isOpen ? (
                    <X className="w-8 h-8 relative z-10" />
                ) : (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* THE "INSIDE LOGO" TRIGGER */}
                        <div className="w-14 h-14 bg-gradient-to-br from-white to-primary-50 rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 relative z-10 overflow-hidden group-hover:shadow-indigo-100">
                             <Activity className="w-9 h-9 text-indigo-600 group-hover:scale-110 transition-transform duration-500" />
                             <div className="absolute inset-0 bg-primary-600/0 group-hover:bg-primary-600/5 transition-colors"></div>
                        </div>
                        
                        <div className="absolute inset-0 border-2 border-indigo-100/50 rounded-[2rem] animate-ping-slow"></div>
                    </div>
                )}

                {!isOpen && (
                    <span className="absolute top-3 right-3 flex h-3.5 w-3.5 z-20">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-indigo-600 border-2 border-white"></span>
                    </span>
                )}
            </motion.button>
            
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                @keyframes ping-slow {
                    0% { transform: scale(0.95); opacity: 0.8; }
                    50% { transform: scale(1.1); opacity: 0.3; }
                    100% { transform: scale(0.95); opacity: 0.8; }
                }
                .animate-ping-slow { animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
            `}</style>
        </div>
    );
}
