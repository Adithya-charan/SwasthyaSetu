'use client';
import { useState, useRef, useEffect } from 'react';
import { Video, Check, Loader2, Languages } from 'lucide-react';
import { toast } from 'react-toastify';
import { translationService } from '@/services/voiceTranslationService';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

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
    const channelRef = useRef<Client | null>(null);
    const iceCandidateQueueRef = useRef<any[]>([]);
    const hasSentOffer = useRef(false);
    
    // AI Translation Pipeline References
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const [isMediaActive, setIsMediaActive] = useState(false);
    const [connectionState, setConnectionState] = useState<'offline' | 'connecting' | 'connected'>('offline');
    
    const [myLanguageState, setMyLanguageState] = useState(userRole === 'doctor' ? 'English' : 'Hindi');
    const myLanguageRef = useRef(myLanguageState);
    
    // ALLOW DYNAMIC PEER LANGUAGE SELECTION AS REQUESTED
    const [peerLanguageState, setPeerLanguageState] = useState(userRole === 'doctor' ? 'Hindi' : 'English');
    const peerLanguageRef = useRef(peerLanguageState);
    
    const translationModeRef = useRef(myLanguageState !== peerLanguageState);
    
    const setMyLanguage = (lang: string) => {
        setMyLanguageState(lang);
        myLanguageRef.current = lang;
        translationModeRef.current = lang !== peerLanguageRef.current;
    };

    const setPeerLanguage = (lang: string) => {
        setPeerLanguageState(lang);
        peerLanguageRef.current = lang;
        translationModeRef.current = lang !== myLanguageRef.current;
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
        const isBrowser = typeof window !== 'undefined';
        const isVercel = isBrowser && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('swasthyasetu'));
        
        let wsBase = process.env.NEXT_PUBLIC_WS_URL;
        if (!wsBase) {
            if (isVercel) {
                wsBase = `${window.location.protocol}//${window.location.hostname}`;
            } else {
                wsBase = `${window.location.protocol}//${window.location.hostname}:8080`;
            }
        }
        
        console.log("WEBRTC: Initializing signaling at:", wsBase);
        const socket = new SockJS(`${wsBase}/ws/webrtc`);
        const stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
                if ((window as any).videoDebug) console.log("STOMP DEBUG:", str);
            },
            onConnect: () => {
                console.log('WEBRTC: Connected to signaling server');
                stompClient.subscribe(`/topic/signal/${roomName}`, async (message) => {
                    try {
                        const data = JSON.parse(message.body);
                        const { type, role, payload, original, translated, senderName } = data;
                        
                        console.log(`WEBRTC: Received signal [${type}] from [${role}]`);
                        
                        // Handle peer connectivity first
                        if (type === 'ready') {
                            if (userRole === 'doctor' && role === 'patient') {
                                console.log("WEBRTC: Patient is ready, doctor initiating offer...");
                                const pc = peerConnectionRef.current;
                                if (!pc || hasSentOffer.current) return;
                                
                                hasSentOffer.current = true;
                                try {
                                    const offer = await pc.createOffer();
                                    await pc.setLocalDescription(offer);
                                    stompClient.publish({ 
                                        destination: `/app/signal/${roomName}`, 
                                        body: JSON.stringify({ type: 'offer', role: userRole, payload: offer }) 
                                    });
                                } catch (e) {
                                    console.error("WEBRTC: Offer creation failed", e);
                                }
                            } else if (userRole === 'patient' && role === 'doctor') {
                                console.log("WEBRTC: Doctor is ready, acknowledging as patient...");
                                stompClient.publish({ 
                                    destination: `/app/signal/${roomName}`, 
                                    body: JSON.stringify({ type: 'ready', role: 'patient' }) 
                                });
                            }
                            return;
                        }

                        if (type === 'translation') {
                            // ONLY act if the translation came from the OTHER person
                            if (senderName !== userName) {
                                setCurrentSubtitle(translated);
                                if (onTranscript) onTranscript(senderName, original, translated);
                                
                                // VOICE CHANGING / TTS DISABLED AS REQUESTED
                                // Only text-based translations will be displayed now
                                
                                setTimeout(() => setCurrentSubtitle(''), 5000);
                            }
                            return;
                        }

                        const pc = peerConnectionRef.current;
                        if (!pc) {
                            console.warn(`WEBRTC: Received ${type} signal but PeerConnection not initialized yet. Skipping.`);
                            return;
                        }

                        if (type === 'offer' && userRole === 'patient') {
                            console.log("WEBRTC: Received offer, creating answer...");
                            try {
                                await pc.setRemoteDescription(new RTCSessionDescription(payload));
                                await processIceQueue(pc);
                                const answer = await pc.createAnswer();
                                await pc.setLocalDescription(answer);
                                stompClient.publish({ 
                                    destination: `/app/signal/${roomName}`, 
                                    body: JSON.stringify({ type: 'answer', role: userRole, payload: answer }) 
                                });
                            } catch (e) {
                                console.error("WEBRTC: Answer creation failed", e);
                            }
                        } else if (type === 'answer' && userRole === 'doctor') {
                            console.log("WEBRTC: Received answer, finishing handshake...");
                            try {
                                if (pc.signalingState !== 'stable') {
                                     await pc.setRemoteDescription(new RTCSessionDescription(payload));
                                     await processIceQueue(pc);
                                }
                            } catch (e) {
                                console.error("WEBRTC: Setting remote description failed", e);
                            }
                        } else if (type === 'ice-candidate') {
                            try {
                                if (pc.remoteDescription) {
                                    await pc.addIceCandidate(new RTCIceCandidate(payload));
                                } else {
                                    iceCandidateQueueRef.current.push(payload);
                                }
                            } catch (e) {}
                        }
                    } catch (err) {
                        console.error("WEBRTC: Signal processing error", err);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP ERROR: ' + frame.headers['message']);
            },
            onWebSocketClose: () => {
                console.log('WEBRTC: Signaling connection closed');
            }
        });

        channelRef.current = stompClient;
        stompClient.activate();

        return () => {
            if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
            if (channelRef.current) channelRef.current.deactivate();
            if (peerConnectionRef.current) peerConnectionRef.current.close();
            if (localVideoRef.current?.srcObject) {
                (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
            }
        };
    }, [roomName, userRole, onTranscript]);

    const initTranslationPipeline = (stream: MediaStream) => {
        try {
            console.log("WEBRTC: Initializing voice capture pipeline...");
            
            // CRITICAL FIX: Only pass the AUDIO tracks to the MediaRecorder. 
            // Encoding both Video + Audio for translation is what causes the NotSupportedError.
            const audioOnlyStream = new MediaStream(stream.getAudioTracks());
            
            let options: MediaRecorderOptions = {};
            if (MediaRecorder.isTypeSupported('audio/webm')) { options = { mimeType: 'audio/webm' }; }
            else if (MediaRecorder.isTypeSupported('audio/ogg')) { options = { mimeType: 'audio/ogg' }; }
            else if (MediaRecorder.isTypeSupported('audio/mp4')) { options = { mimeType: 'audio/mp4' }; }
            
            const recorder = new MediaRecorder(audioOnlyStream, options);
            mediaRecorderRef.current = recorder;
            
            // Chunk stream pipeline (Vosk STT capture route)
            recorder.ondataavailable = async (e) => {
                if (!translationModeRef.current) return;
                
                // Allow broadcasting translations as long as we are connected to the signaling server,
                // even if WebRTC peer-to-peer is still negotiating.
                const isSignalingConnected = channelRef.current?.connected;
                
                if (e.data.size > 0 && isSignalingConnected) {
                    try {
                        console.log("WEBRTC: Processing audio chunk of size", e.data.size);
                        // Send chunk to python backend offline AI service wrapper (currently mocked)
                        const response = await translationService.processAudioChunk(e.data, myLanguageRef.current, peerLanguageRef.current);
                        
                        if (response.translatedText && response.translatedText !== '') {
                            // Display MY local original transcript even if offline for testing visibility
                            console.log("WEBRTC: Local transcript ready:", response.originalText);
                            if (onTranscript) onTranscript(userName, response.originalText, response.translatedText);
                            
                            // Broadcast translations to the other peer over the signaling topic
                            channelRef.current?.publish({ 
                                destination: `/app/signal/${roomName}`, 
                                body: JSON.stringify({ 
                                    type: 'translation', 
                                    role: userRole,
                                    original: response.originalText,
                                    translated: response.translatedText,
                                    senderName: userName
                                }) 
                            });
                        }
                    } catch (err) {
                        console.error("WEBRTC: Translation chunk processing error", err);
                    }
                }
            };
            
            // Tuned for Groq Whisper: 3000ms is the optimal window for accuracy
            recorder.start(3000); 
        } catch (err) {
            console.error("WEBRTC: Microphone translation setup failed", err);
        }
    };

    // Keep the forceFakeChunk for debug testing if native mic fails
    const forceFakeChunk = async () => {
        const isSignalingConnected = channelRef.current?.connected;
        const fakeBlob = new Blob([''], { type: 'audio/webm' });
        const response = await translationService.processAudioChunk(fakeBlob, myLanguageRef.current, peerLanguageRef.current);
                        
        if (response.translatedText !== '' && isSignalingConnected) {
            if (onTranscript) onTranscript(userName, response.originalText, '');
            channelRef.current?.publish({ 
                destination: `/app/signal/${roomName}`, 
                body: JSON.stringify({ 
                    type: 'translation', 
                    role: userRole,
                    original: response.originalText,
                    translated: response.translatedText,
                    senderName: userName
                }) 
            });
        }
    };



    const initConnection = async () => {
        try {
            console.log("WEBRTC: Requesting media permissions...");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            setIsMediaActive(true);
            
            initTranslationPipeline(stream);

            const pc = new RTCPeerConnection(servers);
            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                console.log("WEBRTC: Received remote track");
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate && channelRef.current?.connected) {
                    channelRef.current.publish({ 
                        destination: `/app/signal/${roomName}`, 
                        body: JSON.stringify({ type: 'ice-candidate', role: userRole, payload: event.candidate.toJSON() }) 
                    });
                }
            };

            pc.onconnectionstatechange = () => {
                console.log("WEBRTC: Connection state changed to:", pc.connectionState);
                if (pc.connectionState === 'connected') {
                    setConnectionState('connected');
                    toast.success("Securely connected!");
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    setConnectionState('offline');
                }
            };

            setConnectionState('connecting');
            
            // Wait a brief moment for PC set up then signal readiness
            setTimeout(() => {
                if (channelRef.current?.connected) {
                    console.log("WEBRTC: Signaling readiness as", userRole);
                    channelRef.current.publish({ 
                        destination: `/app/signal/${roomName}`, 
                        body: JSON.stringify({ type: 'ready', role: userRole }) 
                    });
                } else {
                    toast.error("Signaling server not connected. Please refresh.");
                }
            }, 500);

        } catch (error) {
            console.error("WEBRTC: Media access error", error);
            toast.error("Please allow camera/microphone permissions.");
        }
    };

    return (
        <div className="flex flex-col h-full absolute inset-0 overflow-hidden w-full rounded-2xl md:rounded-none">
            {/* Hidden E2E Headless Trigger Button */}
            <button id="e2e-force-chunk" onClick={forceFakeChunk} className="fixed top-0 right-0 w-2 h-2 opacity-0 z-[9999]" aria-hidden="true"></button>
            
            {/* Translation Status UI Indicator - REPOSITIONED TO RIGHT AS REQUESTED */}
            {isMediaActive && (
                <div className="absolute top-4 right-4 z-40 bg-black/70 backdrop-blur-xl rounded-2xl px-6 py-5 flex flex-col gap-4 border border-white/20 shadow-[-10px_10px_40px_rgba(0,0,0,0.5)] group transition-all hover:bg-black/80 ring-1 ring-white/10">
                    <div className="flex items-center justify-between gap-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Languages className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <span className="block text-white text-[10px] font-black tracking-widest uppercase mb-0.5">AI Engine</span>
                                <span className={`block text-[10px] font-black uppercase ${translationModeRef.current ? 'text-green-400' : 'text-slate-400'}`}>{translationModeRef.current ? 'Linked & Translating' : 'Direct Feed Only'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-4 pt-4 border-t border-white/10">
                        {/* SELF LANGUAGE - NOW STATIC */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">My Pipeline:</span>
                            <div className="bg-slate-800/50 text-indigo-400 border border-indigo-500/20 rounded-xl px-3 py-2 text-xs font-black tracking-wide shadow-inner">
                                {myLanguageState.toUpperCase()} {'·'} SOURCE
                            </div>
                        </div>

                        {/* PEER LANGUAGE - NOW STATIC/AUTO-MAPPED */}
                        <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Peer's Pipeline ({userRole === 'doctor' ? 'Patient' : 'Doctor'}):</span>
                            <div className="bg-emerald-900/20 text-emerald-400 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs font-black tracking-wide shadow-inner">
                                {peerLanguageState.toUpperCase()} {'·'} TARGET
                            </div>
                        </div>
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
                        
                        {/* THE AI TRANSLATION SUBTITLE OVERLAY - REPOSITIONED TO RIGHT */}
                        {currentSubtitle && (
                            <div className="absolute bottom-10 right-10 max-w-[85%] z-50 text-right animate-in fade-in slide-in-from-right-8 duration-700">
                                <div className="inline-block bg-indigo-600/90 backdrop-blur-2xl border border-white/20 px-8 py-5 rounded-[2.5rem] rounded-tr-md shadow-[0_30px_70px_rgba(0,0,0,0.5)] text-white font-bold text-2xl leading-snug tracking-tight">
                                    <div className="flex items-center gap-3 justify-end mb-2 opacity-60">
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">{userRole === 'doctor' ? 'PATIENT' : 'DOCTOR'}</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                    </div>
                                    {currentSubtitle}
                                    <div className="mt-2 flex items-center justify-end gap-2 opacity-50">
                                        <Languages className="w-4 h-4" />
                                        <span className="text-[10px] font-bold">LIVE {peerLanguageState.toUpperCase()} {'->'} {myLanguageState.toUpperCase()}</span>
                                    </div>
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
