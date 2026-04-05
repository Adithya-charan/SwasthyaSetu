'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Mic, MicOff } from 'lucide-react';

interface AvatarProps {
    isSpeaking: boolean;
    isListening: boolean;
    isThinking?: boolean;
    volume?: number;
}

export const Avatar = ({ isSpeaking, isListening, isThinking = false, volume = 0 }: AvatarProps) => {
    return (
        <div className="relative flex flex-col items-center justify-center gap-6">
            {/* Ambient Background Glow */}
            <div className={`absolute inset-0 blur-[80px] rounded-full transition-all duration-700 opacity-40 ${isSpeaking ? 'bg-primary-500' : isListening ? 'bg-emerald-500' : isThinking ? 'bg-purple-500' : 'bg-slate-700'
                }`} />

            {/* Avatar Container */}
            <div className="relative w-48 h-48 rounded-full flex items-center justify-center z-10">
                {/* Outer Rings */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className={`absolute inset-0 rounded-full border-2 ${isSpeaking ? 'border-primary-400/30' : 'border-slate-600/30'
                            }`}
                        animate={isSpeaking ? {
                            scale: [1, 1.2 + (i * 0.1), 1],
                            opacity: [0.3, 0.1, 0.3],
                        } : {}}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                        }}
                    />
                ))}

                {/* Main Avatar Surface */}
                <div className={`w-40 h-40 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-700 shadow-2xl flex items-center justify-center relative overflow-hidden`}>
                    {/* Pulsing Core */}
                    <AnimatePresence>
                        {(isSpeaking || isListening || isThinking) && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className={`absolute inset-0 opacity-20 bg-gradient-to-t ${isSpeaking ? 'from-primary-500' : isListening ? 'from-emerald-500' : 'from-purple-500'
                                    } to-transparent`}
                            />
                        )}
                    </AnimatePresence>

                    {/* Icon */}
                    <Bot className={`w-20 h-20 transition-colors duration-500 ${isSpeaking ? 'text-primary-400' : isListening ? 'text-emerald-400' : isThinking ? 'text-purple-400' : 'text-slate-500'
                        }`} />

                    {/* Visualizer Lines */}
                    <div className="absolute bottom-8 flex gap-1 h-8 items-center">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-1 rounded-full ${isSpeaking ? 'bg-primary-400' : 'bg-slate-600'}`}
                                animate={{
                                    height: isSpeaking ? [4, 8 + (volume * (15 + i * 5)), 4] : 4
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: isSpeaking ? Infinity : 0,
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Status Indicator */}
                <div className={`absolute -bottom-2 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border z-20 ${isSpeaking
                    ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/20'
                    : isListening
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
                        : isThinking
                            ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-500/20'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                    {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isThinking ? 'Thinking' : 'Standby'}
                </div>
            </div>

            {/* Voice Prompt Text */}
            <div className="text-center z-10">
                <p className="text-slate-400 text-sm font-medium">
                    {isListening ? 'Please speak now...' : isThinking ? 'Sahayak is thinking...' : 'Say "Hey Sahayak" to start'}
                </p>
            </div>
        </div>
    );
};
