'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    LiveKitRoom,
    useVoiceAssistant,
    useRoomContext,
    useLocalParticipant,
    useTrackVolume,
    RoomAudioRenderer
} from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, MessageSquare, Mic, MicOff, Volume2 } from 'lucide-react';
import { Avatar } from '@/components/consultation/Avatar';
import '@livekit/components-styles';

// --- Types & Constants ---
const SERVER_URL = 'wss://swasthyasati-2tfw3qnh.livekit.cloud';

interface SahayakAgentProps {
    roomName?: string;
}

// --- Inner Component that needs Room Context ---
const AgentInternal = ({
    onStateChange,
    onVolumeChange,
    onTranscript
}: {
    onStateChange: (state: string) => void,
    onVolumeChange: (vol: number) => void,
    onTranscript: (text: string) => void
}) => {
    const { state, audioTrack } = useVoiceAssistant();
    const { localParticipant } = useLocalParticipant();
    const room = useRoomContext();
    const volume = useTrackVolume(audioTrack);

    useEffect(() => {
        onVolumeChange(volume);
    }, [volume, onVolumeChange]);

    useEffect(() => {
        console.log("Sahayak Agent State Changed:", state);
        if (state) onStateChange(state);
    }, [state, onStateChange]);

    useEffect(() => {
        if (localParticipant) {
            console.log("Enabling mic for Sahayak...");
            localParticipant.setMicrophoneEnabled(true).then(() => {
                console.log("Mic enabled for Sahayak");
            }).catch((err: any) => {
                console.error("Failed to enable mic:", err);
            });
        }
    }, [localParticipant]);

    useEffect(() => {
        const handleMessage = (payload: Uint8Array) => {
            const decoder = new TextDecoder();
            const text = decoder.decode(payload);
            try {
                const data = JSON.parse(text);
                console.log("Data from Sahayak:", data);
                if (data.type === 'transcript') onTranscript(data.text);
                if (data.type === 'agent_state') onStateChange(data.state);
            } catch (e) { }
        };

        room.on(RoomEvent.DataReceived, handleMessage);
        return () => { room.off(RoomEvent.DataReceived, handleMessage); };
    }, [room, onTranscript, onStateChange]);

    return null;
};

// --- Main Exported Component ---
export default function SahayakAgent({ roomName = 'landing-page-room' }: SahayakAgentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [tavusUrl, setTavusUrl] = useState<string | null>(null);
    const [agentState, setAgentState] = useState<string>('idle');
    const [agentVolume, setAgentVolume] = useState(0);
    const [transcript, setTranscript] = useState("");
    const [isListeningForWakeWord, setIsListeningForWakeWord] = useState(true);

    const recognitionRef = useRef<any>(null);

    // Create Tavus Video Conversation
    const startTavusSession = useCallback(async () => {
        try {
            setIsOpen(true);
            console.log("Creating Tavus Video Conversation...");
            const tokenServer = process.env.NEXT_PUBLIC_TOKEN_SERVER_URL || `http://${window.location.hostname}:5001`;
            const resp = await fetch(`${tokenServer}/create-tavus-conversation`, { 
                method: 'POST' 
            });
            const data = await resp.json();
            
            if (data.conversation_url) {
                console.log("Tavus Session Ready:", data.conversation_url);
                setTavusUrl(data.conversation_url);
            } else {
                console.error("Tavus failed to provide URL:", data);
                // Fallback to LiveKit if Tavus fails
                fetchToken();
            }
        } catch (e) {
            console.error("Failed to start Tavus session:", e);
            fetchToken();
        }
    }, []);

    // Fetch token for LiveKit (Legacy/Fallback)
    const fetchToken = useCallback(async () => {
        try {
            const participantName = `User_${Math.floor(Math.random() * 1000)}`;
            const tokenServer = process.env.NEXT_PUBLIC_TOKEN_SERVER_URL || `http://${window.location.hostname}:5001`;
            const resp = await fetch(`${tokenServer}/get-token?roomName=${roomName}&participantName=${participantName}`);
            const data = await resp.json();
            setToken(data.token);
            setIsOpen(true);
        } catch (e) {
            console.error("Failed to fetch token:", e);
        }
    }, [roomName]);

    // Wake word detection using Web Speech API
    useEffect(() => {
        if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: any) => {
                const current = event.resultIndex;
                const transcriptResult = event.results[current][0].transcript.toLowerCase();

                // Detection logic: check for 'hey sahayak' or just 'sahayak'
                if (transcriptResult.includes('hey sahayak') || transcriptResult.includes('hey saique') || transcriptResult.includes('sahayak')) {
                    if (!isOpen) {
                        startTavusSession();
                    }
                }
            };

            recognition.onend = () => {
                if (isListeningForWakeWord && !isOpen) {
                    try {
                        recognition.start();
                    } catch (e) { }
                }
            };

            recognitionRef.current = recognition;
            try {
                recognition.start();
            } catch (e) { }

            return () => {
                recognition.stop();
            };
        }
    }, [isOpen, isListeningForWakeWord, startTavusSession]);

    // Auto-hide transcript after 5 seconds
    useEffect(() => {
        if (transcript) {
            const timer = setTimeout(() => setTranscript(""), 5000);
            return () => clearTimeout(timer);
        }
    }, [transcript]);

    const toggleAgent = () => {
        if (isOpen) {
            setIsOpen(false);
            setToken(null);
            setTavusUrl(null);
        } else {
            startTavusSession();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-[350px] md:w-[400px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-800/50 flex justify-between items-center border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-lg">
                                    <Bot className="w-5 h-5 text-primary-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">Sahayak AI</h3>
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${token ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'}`}></span>
                                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                                            {token ? 'Connected' : 'Connecting...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setToken(null);
                                    setTavusUrl(null);
                                }}
                                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Agent Body */}
                        <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] relative bg-slate-900">
                            {tavusUrl ? (
                                <div className="w-full h-full relative">
                                    <iframe 
                                        src={tavusUrl}
                                        allow="microphone; camera; autoplay; display-capture; encrypted-media; fullscreen; picture-in-picture"
                                        className="w-full h-[350px] border-0 rounded-b-3xl"
                                        title="Sahayak Video Assistant"
                                    />
                                    <button 
                                        onClick={() => setTavusUrl(null)}
                                        className="absolute top-2 right-2 bg-slate-800/80 p-1.5 rounded-lg text-slate-400 hover:text-white text-[10px] font-bold"
                                    >
                                        Reload Video
                                    </button>
                                </div>
                            ) : token ? (
                                <LiveKitRoom
                                    serverUrl={SERVER_URL}
                                    token={token}
                                    audio={true}
                                    video={false}
                                    onDisconnected={() => {
                                        console.log("Disconnected from LiveKit");
                                        setToken(null);
                                        setIsOpen(false);
                                    }}
                                >
                                    <AgentInternal 
                                        onStateChange={setAgentState} 
                                        onVolumeChange={setAgentVolume}
                                        onTranscript={setTranscript}
                                    />
                                    <div className="p-8 flex flex-col items-center">
                                        <div className="scale-75">
                                            <Avatar 
                                                isSpeaking={agentState === 'speaking'}
                                                isListening={agentState === 'listening'}
                                                isThinking={agentState === 'thinking'}
                                                volume={agentVolume}
                                            />
                                        </div>
                                        <div className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest animate-pulse">
                                            {agentState === 'idle' ? 'Ready to help' : agentState}
                                        </div>
                                    </div>
                                    <RoomAudioRenderer />
                                </LiveKitRoom>
                            ) : (
                                <div className="p-8 flex flex-col items-center gap-4">
                                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-slate-400 text-sm animate-pulse">Joining SwasthyaSetu Network...</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Initializing Tavus Video Replica</p>
                                </div>
                            )}

                            {/* Transcript Overlay */}
                            <AnimatePresence>
                                {transcript && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute bottom-4 left-4 right-4 bg-slate-800/90 backdrop-blur-xl p-4 rounded-2xl border border-primary-500/30 shadow-xl overflow-hidden"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                            <span className="text-[8px] font-bold text-primary-400 uppercase tracking-tighter">Live Caption</span>
                                        </div>
                                        <p className="text-xs text-white leading-relaxed font-medium">"{transcript}"</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Controls/Footer */}
                        <div className="p-4 bg-slate-800/30 flex justify-between items-center px-6">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <Volume2 className="w-3 h-3" />
                                <span>Voice active</span>
                            </div>
                            <button 
                                onClick={() => {
                                    setTavusUrl(null);
                                    fetchToken();
                                }}
                                className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded-full transition-all"
                            >
                                Switch to Voice-Only
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Trigger Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAgent}
                className={`w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                    ? 'bg-slate-800 text-slate-400 rotate-90'
                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/40 border-2 border-primary-400'
                    }`}
            >
                {isOpen ? <X className="w-8 h-8" /> : <Bot className="w-8 h-8" />}

                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-primary-600 border-2 border-white"></span>
                    </span>
                )}

                {!isOpen && (
                    <div className="absolute right-20 bg-white text-slate-900 px-4 py-2 rounded-xl text-xs font-bold shadow-xl border border-slate-100 whitespace-nowrap animate-bounce-horizontal">
                        Say "Hey Sahayak"
                    </div>
                )}
            </motion.button>

            <style jsx global>{`
                @keyframes bounce-horizontal {
                    0%, 100% { transform: translateX(0); }
                    50% { transform: translateX(-10px); }
                }
                .animate-bounce-horizontal {
                    animation: bounce-horizontal 2s infinite;
                }
            `}</style>
        </div>
    );
}
