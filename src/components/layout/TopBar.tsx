'use client';
import { useAuth } from '@/context/AuthContext';
import { Menu, LogOut, Bell, Globe, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import NotificationPanel from '../shared/NotificationPanel';
import { useLanguage } from '@/context/LanguageContext';
import { languageNames } from '@/data/translations';

interface TopBarProps {
    onMenuClick: () => void;
}

export default function TopBar({ onMenuClick }: TopBarProps) {
    const { user, logout } = useAuth();
    const { language, setLanguage } = useLanguage();

    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20">
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-lg lg:hidden text-slate-600 transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-6">
                <div id="google_translate_element" className="mt-2 hidden sm:block"></div>
                <NotificationPanel />

                {/* Custom Language Switcher */}
                <div className="relative group hidden sm:block">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all text-sm font-bold text-slate-700">
                        <Globe className="w-4 h-4 text-primary-600" />
                        {languageNames[language]}
                    </button>
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] grid grid-cols-1 max-h-[300px] overflow-y-auto">
                        {Object.entries(languageNames).map(([code, name]) => (
                            <button
                                key={code}
                                onClick={() => setLanguage(code as any)}
                                className={`px-4 py-2 text-left text-sm hover:bg-primary-50 transition-colors flex justify-between items-center ${language === code ? 'text-primary-600 font-bold bg-primary-50/50' : 'text-slate-600'}`}
                            >
                                {name}
                                {language === code && <div className="w-1.5 h-1.5 rounded-full bg-primary-500"></div>}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-sm font-semibold text-slate-900">{user?.name || 'User'}</span>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 capitalize">
                            {user?.role || 'patient'}
                        </span>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium">
                        <User className="w-6 h-6 text-slate-500" />
                    </div>
                    <button
                        onClick={logout}
                        className="text-slate-500 hover:text-red-600 p-2 rounded-lg transition-colors ml-2"
                        title="Logout"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
