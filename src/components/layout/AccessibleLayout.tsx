'use client';

import React from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { Language, translations } from '@/data/translations';
import Link from 'next/link';

import { languageNames } from '@/data/translations';

export default function AccessibleLayout({ children }: { children: React.ReactNode }) {
    const { language, setLanguage, accessibilityMode, setAccessibilityMode, isTranslating } = useAccessibility();
    
    const t = (key: string) => {
        const trans = (translations as any)[language] || translations.en;
        return trans[key] || (translations.en as any)[key] || key;
    };

    return (
        <div className={`min-h-screen ${accessibilityMode ? 'bg-white' : 'bg-slate-50'}`}>
            {/* Header */}
            <header className="bg-white border-b-4 border-blue-600 px-6 py-4 sticky top-0 z-40 shadow-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/simplified" className="text-3xl font-bold text-blue-700 flex items-center gap-2">
                            <span className="text-4xl">🏥</span>
                            <span data-key="navigation.home">Swasthya Setu</span>
                        </Link>
                    </div>

                    <div className="flex-1 max-w-xl w-full">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Search"
                                data-key="common.search"
                                className="w-full px-6 py-3 text-xl border-2 border-blue-200 rounded-full focus:border-blue-500 outline-none shadow-sm"
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Improved Multi-language Switcher */}
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 font-bold rounded-lg border-2 border-blue-200 hover:bg-blue-200 transition-all">
                                <span>🌐 {(languageNames as any)[language]}</span>
                                <span className="text-xs">▼</span>
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-white border-2 border-blue-100 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50 max-h-[400px] overflow-y-auto p-2 grid grid-cols-1 gap-1">
                                {(Object.entries(languageNames)).map(([code, name]) => (
                                    <button
                                        key={code}
                                        onClick={() => setLanguage(code)}
                                        className={`w-full text-left px-4 py-3 text-lg font-bold rounded-lg transition-all ${
                                            language === code ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-blue-50'
                                        }`}
                                    >
                                        {name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Accessibility Toggle */}
                        <button
                            onClick={() => setAccessibilityMode(!accessibilityMode)}
                            className={`p-3 rounded-full border-2 transition-all ${
                                accessibilityMode ? 'bg-yellow-400 border-yellow-600 shadow-inner' : 'bg-slate-100 border-slate-300'
                            }`}
                            title="Accessibility Mode"
                        >
                            <span className="text-2xl">{accessibilityMode ? '👁️' : '🕶️'}</span>
                        </button>
                    </div>
                </div>
                {isTranslating && (
                    <div className="absolute bottom-0 left-0 h-1 bg-blue-500 animate-pulse w-full"></div>
                )}
            </header>

            {/* Breadcrumbs */}
            <nav className="bg-white px-6 py-3 border-b-2 border-blue-50">
                <div className="max-w-7xl mx-auto flex items-center gap-2 text-xl font-medium text-slate-500">
                    <Link href="/simplified" className="hover:text-blue-600" data-key="navigation.home">Home</Link>
                    <span>/</span>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {children}
            </main>

            {/* Quick Access Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-blue-600 p-4 shadow-lg md:hidden">
                <div className="flex justify-around items-center">
                    <Link href="/simplified/hospitals" className="flex flex-col items-center gap-1 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">🏥</span>
                        <span className="text-xs font-bold uppercase">{t('hospitals')}</span>
                    </Link>
                    <Link href="/simplified/doctors" className="flex flex-col items-center gap-1 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">👨‍⚕️</span>
                        <span className="text-xs font-bold uppercase">{t('doctors')}</span>
                    </Link>
                    <Link href="/simplified/health-card" className="flex flex-col items-center gap-1 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">💳</span>
                        <span className="text-xs font-bold uppercase">Card</span>
                    </Link>
                    <Link href="/simplified/help" className="flex flex-col items-center gap-1 group">
                        <span className="text-3xl group-hover:scale-110 transition-transform">❓</span>
                        <span className="text-xs font-bold uppercase">{t('help')}</span>
                    </Link>
                </div>
            </footer>
        </div>
    );
}
