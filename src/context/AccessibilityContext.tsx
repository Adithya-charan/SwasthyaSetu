'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { languageNames, Language } from '@/data/translations';

interface AccessibilityContextType {
    language: string;
    setLanguage: (lang: string) => void;
    accessibilityMode: boolean;
    setAccessibilityMode: (mode: boolean) => void;
    isTranslating: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [language, setLang] = useState('en');
    const [accessibilityMode, setAccessibilityMode] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);

    useEffect(() => {
        // The global script handles initial load, we just sync the state
        const savedLang = localStorage.getItem('user-language') || 'en';
        setLang(savedLang);

        const savedMode = localStorage.getItem('accessibility-mode') === 'true';
        setAccessibilityMode(savedMode);
    }, []);

    const setLanguage = async (lang: string) => {
        setIsTranslating(true);
        if ((window as any).loadLanguage) {
            const success = await (window as any).loadLanguage(lang);
            if (success) setLang(lang);
        } else {
            console.warn("[AccessibilityContext] Global loadLanguage script not ready yet.");
            setLang(lang);
        }
        setIsTranslating(false);
    };

    const handleAccessibilityModeChange = (mode: boolean) => {
        setAccessibilityMode(mode);
        localStorage.setItem('accessibility-mode', mode.toString());
    };

    return (
        <AccessibilityContext.Provider value={{ 
            language, 
            setLanguage, 
            accessibilityMode, 
            setAccessibilityMode: handleAccessibilityModeChange,
            isTranslating
        }}>
            <div className={`${accessibilityMode ? 'accessibility-mode' : ''}`}>
                {children}
            </div>
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
};
