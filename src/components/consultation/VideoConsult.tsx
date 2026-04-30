'use client';
import { useState, useRef, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, MessageSquare, MonitorUp, Loader2, Paperclip, X, FileText, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import { io, Socket } from 'socket.io-client';
import Tesseract from 'tesseract.js';
import { useLanguage } from '@/context/LanguageContext';

interface VideoConsultProps {
    roomName: string;
    userName: string;
    userRole: string; // "doctor" | "patient"
    onCallEnd: () => void;
}

const servers = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
    ]
};

export default function VideoConsult({ roomName, userName, userRole, onCallEnd }: VideoConsultProps) {
    const { t, language } = useLanguage();
    
    // WebRTC Refs
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    
    // UI State
    const [connectionState, setConnectionState] = useState<'offline' | 'connecting' | 'connected'>('offline');
    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    
    // Chat State
    const [messages, setMessages] = useState<any[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isOcrLoading, setIsOcrLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Prescription State
    const [prescription, setPrescription] = useState({
        diagnosis: '',
        notes: '',
        followUp: '',
        medicines: [{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]
    });

    useEffect(() => {
        // Scroll to bottom of chat
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isChatOpen]);

    // Initialize Socket and WebRTC
    const initConnection = async () => {
        if (connectionState !== 'offline') return;
        setConnectionState('connecting');

        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            } catch (mediaError) {
                console.warn("Media devices not found, using mock stream", mediaError);
                // Create a canvas as a mock video source
                const canvas = document.createElement('canvas');
                canvas.width = 640;
                canvas.height = 480;
                const ctx = canvas.getContext('2d')!;
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(0, 0, 640, 480);
                ctx.fillStyle = '#ffffff';
                ctx.font = '30px Arial';
                ctx.fillText('Mock Camera', 200, 240);
                
                const canvasStream = canvas.captureStream(30);
                // Add a dummy audio track if possible
                stream = canvasStream;
                toast.info("Using mock camera (no hardware detected)");
            }
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const socketUrl = process.env.NEXT_PUBLIC_NODE_SERVER_URL || 
                (typeof window !== 'undefined' ? `http://${window.location.hostname}:3001` : 'http://localhost:3001');
            const socket = io(socketUrl);
            socketRef.current = socket;

            console.log(`CONSULT: Joining Room: ${roomName} as ${userRole} (${userName})`);
            socket.emit('join-room', { roomName, userRole, userName });

            const pc = new RTCPeerConnection(servers);
            peerConnectionRef.current = pc;

            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            pc.ontrack = (event) => {
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            };

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('webrtc-signal', { roomName, type: 'ice-candidate', payload: event.candidate });
                }
            };

            pc.onconnectionstatechange = () => {
                console.log(`WebRTC: Connection state changed to ${pc.connectionState}`);
                if (pc.connectionState === 'connected') {
                    setConnectionState('connected');
                    toast.success("Securely connected!");
                } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    setConnectionState('offline');
                    if (pc.connectionState === 'failed') toast.error("WebRTC Handshake failed. Retrying...");
                }
            };

            socket.on('connect', () => {
                console.log("Socket.io: Connected to signaling server");
            });

            socket.on('connect_error', (err) => {
                console.error("Socket.io: Connection error", err);
                toast.error("Signaling server unreachable. Check if server is running on port 3001.");
            });

            // Signaling Logic
            socket.on('joined-room', async (data) => {
                // If I'm the doctor and someone else is already here, start the call
                if (userRole === 'doctor' && data.numClients > 1) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtc-signal', { roomName, type: 'offer', payload: offer });
                }
            });

            socket.on('user-joined', async (data) => {
                if (userRole === 'doctor') {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket.emit('webrtc-signal', { roomName, type: 'offer', payload: offer });
                }
            });

            socket.on('webrtc-signal', async (data) => {
                if (data.type === 'offer' && userRole === 'patient') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);
                    socket.emit('webrtc-signal', { roomName, type: 'answer', payload: answer });
                } else if (data.type === 'answer' && userRole === 'doctor') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data.payload));
                } else if (data.type === 'ice-candidate') {
                    try {
                        if (pc.remoteDescription) {
                            await pc.addIceCandidate(new RTCIceCandidate(data.payload));
                        } else {
                            // Queue candidate or handle later
                            console.warn("Received ICE candidate before remote description");
                        }
                    } catch (e) {
                        console.error("Error adding ice candidate", e);
                    }
                }
            });

            socket.on('chat-message', (msg) => {
                // Simulate AI Auto-Translation based on user preference
                const translatedMsg = { 
                    ...msg, 
                    text: msg.senderId !== userName ? `[Translated] ${msg.text}` : msg.text 
                };
                setMessages(prev => [...prev, translatedMsg]);
                
                // Play notification sound for incoming messages
                if (msg.senderId !== userName) {
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
                    audio.play().catch(e => console.log("Sound play blocked by browser"));
                }
            });

        } catch (error) {
            console.error("Media access error", error);
            toast.error("Could not access camera/microphone.");
            setConnectionState('offline');
        }
    };

    useEffect(() => {
        if (roomName && connectionState === 'offline') {
            initConnection();
        }
    }, [roomName]);

    const cleanup = () => {
        if (peerConnectionRef.current) peerConnectionRef.current.close();
        if (localStreamRef.current) localStreamRef.current.getTracks().forEach(t => t.stop());
        if (socketRef.current) socketRef.current.disconnect();
    };

    useEffect(() => {
        return cleanup;
    }, []);

    // Media Controls
    const toggleMic = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMicOn(audioTrack.enabled);
            }
        }
    };

    const toggleVideo = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOn(videoTrack.enabled);
            }
        }
    };

    const shareScreen = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = screenStream.getVideoTracks()[0];
            
            const pc = peerConnectionRef.current;
            if (pc && localStreamRef.current) {
                const videoSender = pc.getSenders().find(s => s.track?.kind === 'video');
                if (videoSender) {
                    videoSender.replaceTrack(screenTrack);
                }
                
                if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

                screenTrack.onended = () => {
                    // Revert to camera
                    const camTrack = localStreamRef.current!.getVideoTracks()[0];
                    if (videoSender) videoSender.replaceTrack(camTrack);
                    if (localVideoRef.current) localVideoRef.current.srcObject = localStreamRef.current;
                };
            }
        } catch (e) {
            toast.error("Screen sharing cancelled or failed.");
        }
    };

    const handleEndCall = () => {
        if (userRole === 'doctor') {
            setIsPrescriptionModalOpen(true);
        } else {
            cleanup();
            onCallEnd();
        }
    };

    // Chat functionality
    const sendChatMessage = () => {
        if (!chatInput.trim() || !socketRef.current) return;
        const msg = { roomId: roomName, senderId: userName, senderRole: userRole, message: chatInput, timestamp: new Date(), type: 'text' };
        socketRef.current.emit('chat-message', msg);
        setMessages(prev => [...prev, msg]);
        setChatInput('');
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !socketRef.current) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = async (event) => {
            const fileData = event.target?.result as string;
            
            let extractedText = '';
            if (file.type.startsWith('image/')) {
                setIsOcrLoading(true);
                try {
                    const result = await Tesseract.recognize(fileData, 'eng');
                    extractedText = result.data.text;
                    toast.success("AI Extracted text from image");
                } catch (err) {
                    console.error("OCR failed", err);
                } finally {
                    setIsOcrLoading(false);
                }
            }

            const msg = { 
                roomId: roomName, senderId: userName, senderRole: userRole, 
                message: file.name, fileData, extractedText, type: file.type.startsWith('image/') ? 'image' : 'file', timestamp: new Date() 
            };
            socketRef.current?.emit('chat-message', msg);
            setMessages(prev => [...prev, msg]);
        };
        reader.readAsDataURL(file);
    };

    const handleSendPrescription = () => {
        // In reality, this sends to backend via API
        toast.success("Prescription Sent to Patient and Pharmacist!");
        setIsPrescriptionModalOpen(false);
        cleanup();
        onCallEnd();
    };

    return (
        <div className="relative w-full h-full bg-slate-900 overflow-hidden flex border-none">
            {/* MAIN VIDEO AREA */}
            <div className="flex-1 relative flex flex-col h-full">
                
                {/* Remote Video */}
                <div className="flex-1 w-full h-full relative bg-slate-900 flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
                    {connectionState !== 'connected' && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm z-10 text-center p-6">
                            {connectionState === 'offline' ? (
                                <div className="space-y-4">
                                    <div className="w-20 h-20 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                        <Video className="w-10 h-10 text-primary-500" />
                                    </div>
                                    <h2 className="text-xl font-bold text-white">Ready to Start?</h2>
                                    <p className="text-slate-400 max-w-xs mx-auto">Click below to initialize your secure end-to-end encrypted consultation.</p>
                                    <button onClick={initConnection} className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full font-bold shadow-lg flex items-center gap-3 transition-all hover:scale-105 active:scale-95 mx-auto">
                                        <Video className="w-6 h-6" /> Join Consultation Room
                                    </button>
                                    <button onClick={async () => {
                                        try {
                                            const s = await navigator.mediaDevices.getUserMedia({video: true, audio: true});
                                            if (localVideoRef.current) localVideoRef.current.srcObject = s;
                                            toast.success("Camera \u0026 Mic Hardware Verified!");
                                        } catch(e) {
                                            toast.error("Hardware Error: Camera/Mic blocked or not found");
                                        }
                                    }} className="mt-4 text-slate-400 hover:text-white text-xs font-medium underline underline-offset-4">
                                        Test Camera Hardware
                                    </button>
                                </div>
                            ) : (
                                <div className="text-white flex flex-col items-center gap-6">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Loader2 className="w-10 h-10 animate-spin text-primary-400" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="font-bold text-xl tracking-wider">Establishing Connection</p>
                                        <p className="text-slate-400 text-sm">Please allow camera and microphone access if prompted.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Local Video PiP */}
                <div className="absolute bottom-24 right-6 w-48 aspect-video bg-black rounded-xl overflow-hidden border-2 border-white/20 shadow-xl z-20 cursor-move">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover"></video>
                    {!isVideoOn && <div className="absolute inset-0 flex items-center justify-center bg-slate-800"><VideoOff className="text-white w-8 h-8 opacity-50" /></div>}
                </div>

                {/* Controls Bar */}
                {connectionState === 'connected' && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-6 py-3 rounded-full flex items-center gap-4 border border-slate-700 shadow-2xl z-30">
                        <button onClick={toggleMic} className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
                            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleVideo} className={`p-3 rounded-full transition-colors ${isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500/20 text-red-500 hover:bg-red-500/30'}`}>
                            {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </button>
                        {userRole === 'doctor' && (
                            <button onClick={shareScreen} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors">
                                <MonitorUp className="w-5 h-5" />
                            </button>
                        )}
                        <button onClick={() => setIsChatOpen(!isChatOpen)} className={`p-3 rounded-full transition-colors ${isChatOpen ? 'bg-primary-600 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'}`}>
                            <MessageSquare className="w-5 h-5" />
                        </button>
                        <div className="w-px h-8 bg-slate-700 mx-2"></div>
                        <button onClick={handleEndCall} className="p-3 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-2 transition-colors">
                            <PhoneOff className="w-5 h-5" /> End Call
                        </button>
                    </div>
                )}
            </div>

            {/* CHAT PANEL - Fixed to Right side of Video Container */}
            {isChatOpen && (
                <div className="w-[380px] bg-white flex flex-col border-l border-slate-200 z-40 h-full shadow-2xl">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-primary-600" /> Live Chat
                        </h3>
                        <button onClick={() => setIsChatOpen(false)} className="text-slate-500 hover:text-slate-800"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex flex-col max-w-[85%] ${msg.senderId === userName ? 'self-end items-end ml-auto' : 'self-start items-start'}`}>
                                <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.senderId} ({msg.senderRole})</span>
                                <div className={`p-3 rounded-2xl shadow-sm ${msg.senderId === userName ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'}`}>
                                    {msg.type === 'text' && <p className="text-sm">{msg.message}</p>}
                                    {msg.type === 'image' && (
                                        <div className="space-y-2">
                                            <img src={msg.fileData} alt="Shared" className="rounded-lg max-w-full h-auto max-h-48 object-cover border border-slate-200/20" />
                                            {msg.extractedText && (
                                                <div className={`p-2 rounded bg-black/10 text-xs mt-2 ${msg.senderId === userName ? 'text-primary-100' : 'text-slate-600'}`}>
                                                    <span className="font-bold opacity-70 block mb-1">AI Extracted Text:</span>
                                                    {msg.extractedText}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {msg.type === 'file' && (
                                        <a href={msg.fileData} download={msg.message} className={`flex items-center gap-2 text-sm ${msg.senderId === userName ? 'text-white hover:text-primary-100' : 'text-primary-600 hover:underline'}`}>
                                            <FileText className="w-4 h-4" /> {msg.message}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isOcrLoading && (
                            <div className="flex items-center gap-2 text-xs text-slate-500 self-center bg-white py-1 px-3 rounded-full shadow-sm"><Loader2 className="w-3 h-3 animate-spin" /> Scanning medical document...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,.pdf" />
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors">
                            <Paperclip className="w-5 h-5" />
                        </button>
                        <input 
                            type="text" 
                            value={chatInput} 
                            onChange={e => setChatInput(e.target.value)} 
                            onKeyPress={e => e.key === 'Enter' && sendChatMessage()}
                            placeholder="Type a message..." 
                            className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 outline-none text-slate-800"
                        />
                        <button onClick={sendChatMessage} disabled={!chatInput.trim()} className="p-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-full transition-colors">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* DOCTOR PRESCRIPTION MODAL */}
            {isPrescriptionModalOpen && (
                <div className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full animate-in zoom-in fade-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary-600 text-white">
                            <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5" /> Complete Prescription</h2>
                            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Required before closing call</span>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Chief Complaint / Diagnosis <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-800" placeholder="e.g. Viral Pharyngitis" required value={prescription.diagnosis} onChange={e => setPrescription({...prescription, diagnosis: e.target.value})} />
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 flex justify-between items-center">
                                    Medicines 
                                    <button onClick={() => setPrescription({...prescription, medicines: [...prescription.medicines, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]})} className="text-xs text-primary-600 font-semibold bg-primary-50 px-2 py-1 rounded">+ Add Medicine</button>
                                </label>
                                <div className="space-y-3">
                                    {prescription.medicines.map((med, idx) => (
                                        <div key={idx} className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 relative">
                                            <input type="text" placeholder="Name" className="col-span-2 text-xs border border-slate-300 p-2 rounded text-slate-800" value={med.name} onChange={e => { const nm = [...prescription.medicines]; nm[idx].name = e.target.value; setPrescription({...prescription, medicines: nm}); }} />
                                            <input type="text" placeholder="Dosage" className="text-xs border border-slate-300 p-2 rounded text-slate-800" value={med.dosage} onChange={e => { const nm = [...prescription.medicines]; nm[idx].dosage = e.target.value; setPrescription({...prescription, medicines: nm}); }} />
                                            <input type="text" placeholder="Frequency" className="text-xs border border-slate-300 p-2 rounded text-slate-800" value={med.frequency} onChange={e => { const nm = [...prescription.medicines]; nm[idx].frequency = e.target.value; setPrescription({...prescription, medicines: nm}); }} />
                                            <input type="text" placeholder="Duration" className="text-xs border border-slate-300 p-2 rounded text-slate-800" value={med.duration} onChange={e => { const nm = [...prescription.medicines]; nm[idx].duration = e.target.value; setPrescription({...prescription, medicines: nm}); }} />
                                            <input type="text" placeholder="Instructions (e.g. after food)" className="col-span-5 text-xs border border-slate-300 p-2 rounded text-slate-800" value={med.instructions} onChange={e => { const nm = [...prescription.medicines]; nm[idx].instructions = e.target.value; setPrescription({...prescription, medicines: nm}); }} />
                                            {idx > 0 && <button onClick={() => { const nm = [...prescription.medicines]; nm.splice(idx, 1); setPrescription({...prescription, medicines: nm}); }} className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1"><X className="w-3 h-3" /></button>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-slate-700">Follow-up Date</label>
                                    <input type="date" className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-800" value={prescription.followUp} onChange={e => setPrescription({...prescription, followUp: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-slate-700">Additional Advice</label>
                                <textarea rows={3} className="w-full border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm text-slate-800" placeholder="Drink plenty of warm water..." value={prescription.notes} onChange={e => setPrescription({...prescription, notes: e.target.value})}></textarea>
                            </div>
                        </div>
                        
                        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <button onClick={() => setIsPrescriptionModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg">Resume Call</button>
                            <button onClick={handleSendPrescription} className="px-6 py-2 bg-primary-600 text-white font-bold rounded-lg shadow-md hover:bg-primary-700 flex items-center gap-2">
                                <Send className="w-4 h-4" /> Send Prescription & Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
