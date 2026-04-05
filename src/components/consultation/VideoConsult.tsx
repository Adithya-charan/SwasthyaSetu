'use client';
import { useState, useRef, useEffect } from 'react';
import { Video, Check, Loader2, Languages } from 'lucide-react';
import { toast } from 'react-toastify';
import { translationService } from '@/services/voiceTranslationService';

interface VideoConsultProps {
    roomName: string;
    userName: string;
    userRole: string; // "doctor" | "patient"
    onCallEnd: () => void;
    // Callback to pipe live translations to the parent layout
    onTranscript?: (sender: string, original: string, translated: string) => void;
}

const servers = { iceServers: [{ urls: ['stun:stun.l.google.com:19302'] }] };

export default function VideoConsult({ roomName, userName, userRole, onCallEnd, onTranscript }: VideoConsultProps) {
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);
    const iceCandidateQueueRef = useRef<any[]>([]);
    const hasSentOffer = useRef(false);
    
    // AI Translation Pipeline References
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const [isMediaActive, setIsMediaActive] = useState(false);
    const [connectionState, setConnectionState] = useState<'offline' | 'connecting' | 'connected'>('offline');
    
    const [myLanguageState, setMyLanguageState] = useState(userRole === 'doctor' ? 'English' : 'Hindi');
    const myLanguageRef = useRef(myLanguageState);
    const peerLanguage = userRole === 'doctor' ? 'Hindi' : 'English';
    const translationModeRef = useRef(myLanguageState !== peerLanguage);
    
    const setMyLanguage = (lang: string) => {
        setMyLanguageState(lang);
        myLanguageRef.current = lang;
        translationModeRef.current = lang !== peerLanguage;
    };

    const [currentSubtitle, setCurrentSubtitle] = useState('');
    const INDIAN_LANGUAGES = ['English', 'Hindi', 'Telugu', 'Tamil', 'Marathi', 'Bengali', 'Gujarati', 'Kannada', 'Malayalam'];

    const getTTSLangCode = (lang: string) => {
        const map: Record<string, string> = {
            'Hindi': 'hi-IN', 'Telugu': 'te-IN', 'Tamil': 'ta-IN', 
            'Marathi': 'mr-IN', 'Gujarati': 'gu-IN', 'Kannada': 'kn-IN', 
            'Malayalam': 'ml-IN', 'Bengali': 'bn-IN'
        };
        return map[lang] || 'en-US';
    };

    const processIceQueue = async (pc: RTCPeerConnection) => {
        while (iceCandidateQueueRef.current.length > 0) {
            const candidate = iceCandidateQueueRef.current.shift();
            try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch (e) { }
        }
    };

    useEffect(() => {
        const bc = new BroadcastChannel(`webrtc_${roomName}`);
        channelRef.current = bc;

        bc.onmessage = async (event) => {
            const { type, role, payload, original, translated, senderName } = event.data;
            const pc = peerConnectionRef.current;

            if (type === 'ready') {
                if (!pc) return;
                if (userRole === 'doctor' && role === 'patient') {
                    if (hasSentOffer.current) return;
                    hasSentOffer.current = true;
                    try {
                        const offer = await pc.createOffer();
                        await pc.setLocalDescription(offer);
                        bc.postMessage({ type: 'offer', payload: offer });
                    } catch (e) { }
                } else if (userRole === 'patient' && role === 'doctor') {
                    bc.postMessage({ type: 'ready', role: 'patient' });
                }
                return;
            }

            if (type === 'translation') {
                // Incoming Voice Translation over WebRTC Signal!
                setCurrentSubtitle(translated);
                if (onTranscript) onTranscript(senderName, original, translated);
                
                // Mute remote video natively so we only hear the translated output!
                if (remoteVideoRef.current && translationModeRef.current) {
                    remoteVideoRef.current.muted = true; 
                    
                    // Mock Coqui TTS audio playback securely in-browser receiver
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(translated);
                        utterance.lang = getTTSLangCode(myLanguageRef.current);
                        utterance.rate = 1.0;
                        window.speechSynthesis.speak(utterance);
                    }
                }
                
                // Auto-clear subtitle
                setTimeout(() => setCurrentSubtitle(''), 5000);
            }

            if (!pc) return;

            if (type === 'offer' && userRole === 'patient') {
                try {
                    await pc.setRemoteDescription(new RTCSessionDescription(payload));
                    await processIceQueue(pc);
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    bc.postMessage({ type: 'answer', payload: answer });
                } catch (e) {}
            } else if (type === 'answer' && userRole === 'doctor') {
                try {
                    if (!pc.currentRemoteDescription) {
                         await pc.setRemoteDescription(new RTCSessionDescription(payload));
                         await processIceQueue(pc);
                    }
                } catch (e) {}
            } else if (type === 'ice-candidate') {
                try {
                    if (pc.remoteDescription) await pc.addIceCandidate(new RTCIceCandidate(payload));
                    else iceCandidateQueueRef.current.push(payload);
                } catch (e) {}
            }
        };

        return () => {
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            bc.close();
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (localVideoRef.current?.srcObject) {
                (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [roomName, userRole, onTranscript]);

    const initTranslationPipeline = (stream: MediaStream) => {
        try {
            // Flexible MIME type to ensure it doesn't crash on Windows/Safari
            let options: MediaRecorderOptions = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) { options = { mimeType: 'audio/webm' }; }
            else if (MediaRecorder.isTypeSupported('audio/mp4')) { options = { mimeType: 'audio/mp4' }; }
            
            const recorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = recorder;
            
            // Chunk stream pipeline (Vosk STT capture route)
            recorder.ondataavailable = async (e) => {
                if (!translationModeRef.current) return;
                
                // FIXED: Use direct PeerConnection state to avoid stale React closures
                const isPeerConnected = peerConnectionRef.current?.connectionState === 'connected';
                
                if (e.data.size > 0 && channelRef.current) {
                    // Send chunk to python backend offline AI service wrapper
                    const response = await translationService.processAudioChunk(e.data, myLanguageRef.current, peerLanguage);
                    
                    if (response.translatedText !== '') {
                        // Display my local original transcript even if offline for testing visibility
                        if (onTranscript) onTranscript(userName, response.originalText, '');
                        
                        // Only broadcast translations over WebRTC if a peer is legitimately connected
                        if (isPeerConnected) {
                            channelRef.current.postMessage({ 
                                type: 'translation', 
                                original: response.originalText,
                                translated: response.translatedText,
                                senderName: userName
                            });
                        }
                    }
                }
            };
            
            // Sample rate latency setup: Send chunk every ~3 seconds
            recorder.start(3000); 
        } catch (err) {
            console.error("Microphone translation processing isolated due to hardware failure", err);
        }
    };

    // E2E Testing Module: Headless Browser bypass for simulate live voice.
    const forceFakeChunk = async () => {
        const isPeerConnected = peerConnectionRef.current?.connectionState === 'connected';
        const fakeBlob = new Blob([''], { type: 'audio/webm' });
        const response = await translationService.processAudioChunk(fakeBlob, myLanguageRef.current, peerLanguage);
                        
        if (response.translatedText !== '') {
            if (onTranscript) onTranscript(userName, response.originalText, '');
            if (isPeerConnected && channelRef.current) {
                 channelRef.current.postMessage({ 
                     type: 'translation', 
                     original: response.originalText,
                     translated: response.translatedText,
                     senderName: userName
                 });
            }
        }
    };



    const initConnection = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            setIsMediaActive(true);
            
            // Bridge our local microphone to the Translation Engine immediately
            initTranslationPipeline(stream);

            const pc = new RTCPeerConnection(servers);
            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    if (!remoteVideoRef.current.srcObject) remoteVideoRef.current.srcObject = new MediaStream();
                    const remoteStream = remoteVideoRef.current.srcObject as MediaStream;
                    event.streams[0].getTracks().forEach(track => {
                        if (!remoteStream.getTracks().find(t => t.id === track.id)) remoteStream.addTrack(track);
                    });
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && channelRef.current) channelRef.current.postMessage({ type: 'ice-candidate', payload: event.candidate.toJSON() });
            };

            pc.onconnectionstatechange = () => {
                if (pc.connectionState === 'connected') {
                    setConnectionState('connected');
                    toast.success("Securely connected!");
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    setConnectionState('offline');
                }
            };

            setConnectionState('connecting');
            if (channelRef.current) channelRef.current.postMessage({ type: 'ready', role: userRole });

        } catch (error) {
            toast.error("Please allow camera/microphone permissions.");
        }
    };

    return (
        <div className="flex flex-col h-full absolute inset-0 overflow-hidden w-full rounded-2xl md:rounded-none">
            {/* Hidden E2E Headless Trigger Button */}
            <button id="e2e-force-chunk" onClick={forceFakeChunk} className="fixed top-0 right-0 w-2 h-2 opacity-0 z-[9999]" aria-hidden="true"></button>
            
            {/* Translation Status UI Indicator */}
            {isMediaActive && (
                <div className="absolute top-4 left-4 z-40 bg-black/60 backdrop-blur-md rounded-xl px-4 py-2 flex flex-col gap-2 border border-white/10 shadow-lg group">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Languages className="w-4 h-4 text-white" />
                            <span className="text-white text-xs font-bold tracking-widest uppercase">AI Voice Translation</span>
                        </div>
                        <div className="flex items-center gap-2 border-l border-white/20 pl-4">
                            <div className={`w-2.5 h-2.5 rounded-full ${translationModeRef.current ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]' : 'bg-slate-500'}`}></div>
                            <span className={`text-xs font-black uppercase ${translationModeRef.current ? 'text-green-400' : 'text-slate-400'}`}>{translationModeRef.current ? 'Active' : 'Off'}</span>
                        </div>
                    </div>
                    
                    {/* Dynamic Language Selection To verify pipeline universally works */}
                    <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-300 font-medium">
                        <span>My Speech:</span>
                        <select 
                            className="bg-slate-800 text-white border border-slate-600 rounded px-2 py-0.5 outline-none cursor-pointer"
                            value={myLanguageState}
                            onChange={(e) => setMyLanguage(e.target.value)}
                        >
                            {INDIAN_LANGUAGES.map(lang => <option key={lang}>{lang}</option>)}
                        </select>
                    </div>
                </div>
            )}

            <div className="flex-1 flex flex-col p-4 w-full h-full relative z-0">
                {/* Clean Video Panel Setup */}
                <div className="flex flex-col xl:flex-row gap-4 shrink-0 h-full w-full">
                    {/* Local Video */}
                    <div className="w-full xl:w-1/2 bg-black rounded-3xl relative overflow-hidden flex shadow-2xl border border-white/10 order-2 xl:order-1 min-h-[250px]">
                        <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-105"></video>
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none"></div>
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg border border-white/10 z-10">
                            <div className={`w-2.5 h-2.5 rounded-full ${isMediaActive ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-slate-500'}`}></div>
                            Local Video ({userName})
                        </div>
                    </div>
                    
                    {/* Remote Patient/Doctor Video */}
                    <div className="w-full xl:w-1/2 bg-slate-900 rounded-3xl relative overflow-hidden flex shadow-2xl border border-white/10 order-1 xl:order-2 min-h-[250px]">
                        <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-10"></div>
                        <div className="absolute bottom-5 left-5 bg-black/70 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg border border-white/10 z-10">
                            <div className={`w-2.5 h-2.5 rounded-full ${connectionState === 'connected' ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]' : 'bg-orange-500 animate-pulse'}`}></div>
                            Remote Video ({userRole === 'doctor' ? 'Patient' : 'Doctor'}) {connectionState === 'connected' ? '' : '(Connecting)'}
                        </div>
                        {connectionState !== 'connected' && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 z-0 border border-slate-700/50 backdrop-blur-md">
                                <div className="text-slate-400 flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center shadow-inner border border-white/5">
                                        {connectionState === 'connecting' ? <Loader2 className="w-10 h-10 animate-spin text-primary-400" /> : <Video className="w-10 h-10 opacity-40 text-slate-500" />}
                                    </div>
                                    <span className="text-sm font-semibold tracking-wide uppercase text-slate-500">{connectionState === 'connecting' ? 'Signaling Peer...' : 'Camera Offline'}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* THE AI TRANSLATION SUBTITLE OVERLAY */}
                        {currentSubtitle && (
                            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[90%] z-50 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="inline-block bg-black/85 backdrop-blur-lg border border-white/10 px-6 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] text-white font-bold text-lg leading-relaxed">
                                    <Languages className="w-4 h-4 inline-block mr-2 text-primary-400 relative -top-0.5" />
                                    {currentSubtitle}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Automation Panel / Join Buttons */}
                {!isMediaActive ? (
                    <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-xl flex flex-col items-center justify-center p-6">
                        <div className="bg-slate-800/80 w-full max-w-xl p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.5)] border border-slate-700/50 text-center animate-in fade-in zoom-in-95">
                            <div className="w-20 h-20 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/30 shadow-inner">
                                <Video className="w-10 h-10 text-primary-400" />
                            </div>
                            <h3 className="text-white font-bold text-2xl mb-3 tracking-tight">Join Secure Medical Feed</h3>
                            <p className="text-slate-400 text-sm mb-10 mx-auto max-w-sm leading-relaxed">Activate your secure camera. Language differences will be automatically mapped through your local medical profile settings using AI translation.</p>
                            <button 
                                onClick={initConnection} 
                                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-12 py-4 rounded-2xl font-bold text-base transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] hover:shadow-[0_0_50px_rgba(37,99,235,0.5)] flex items-center justify-center gap-3 mx-auto hover:-translate-y-1 active:translate-y-0"
                            >
                                <Video className="w-6 h-6" /> Let's Begin Session
                            </button>
                        </div>
                    </div>
                ) : connectionState === 'connected' ? (
                    <div className="absolute top-4 right-4 z-40 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <span className="font-bold text-xs uppercase tracking-wider">Secure E2EE</span>
                    </div>
                ) : (
                    <div className="absolute top-4 right-4 z-40 bg-slate-800/80 border border-slate-700 text-slate-300 px-4 py-2 rounded-xl flex items-center gap-3 backdrop-blur-md shadow-lg animate-in fade-in slide-in-from-top-2">
                        <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                        <span className="font-bold text-xs uppercase tracking-wider">Waiting on {userRole === 'patient' ? 'Doctor' : 'Patient'}...</span>
                    </div>
                )}
            </div>
        </div>
    );
}
