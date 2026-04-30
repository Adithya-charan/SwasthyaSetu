/**
 * Swasthya Setu Global Language Loader
 * CDN-compatible modular translation script
 */

(function(window, document) {
    'use strict';

    const translationsCache = {};
    let currentLang = 'en';
    let currentTranslations = {};

    /**
     * Helper to get values from nested JSON (e.g., "navigation.home")
     */
    function getNestedValue(obj, key) {
        return key.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    }

    /**
     * Applies translations to all elements with data-key attribute
     */
    function applyTranslations() {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(function(el) {
            const key = el.getAttribute('data-key');
            if (!key) return;

            const translation = getNestedValue(currentTranslations, key);
            if (translation) {
                // Update based on element type
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else if (el.tagName === 'OPTION') {
                    el.text = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });

        // Trigger custom event for dynamic components to re-run
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
        console.log(`[LanguageLoader] Applied translations for: ${currentLang}`);
    }

    /**
     * Loads a translation file and updates the UI
     * @param {string} langCode - The ISO code for the language (e.g., 'hi', 'en')
     */
    window.loadLanguage = async function(langCode) {
        if (!langCode) return;
        
        try {
            // Check cache first
            if (translationsCache[langCode]) {
                currentTranslations = translationsCache[langCode];
            } else {
                const response = await fetch(`/translations/${langCode}.json`);
                if (!response.ok) throw new Error(`Could not load ${langCode}.json`);
                currentTranslations = await response.json();
                translationsCache[langCode] = currentTranslations; // Cache it
            }

            currentLang = langCode;
            localStorage.setItem('user-language', langCode);
            
            // Update HTML lang attribute for accessibility
            document.documentElement.lang = langCode;
            
            applyTranslations();
            return true;
        } catch (error) {
            console.error(`[LanguageLoader] Error loading language "${langCode}":`, error);
            if (langCode !== 'en') {
                console.log('[LanguageLoader] Falling back to English...');
                return window.loadLanguage('en');
            }
            return false;
        }
    };

    /**
     * Auto-initialization on DOMContentLoaded
     */
    document.addEventListener('DOMContentLoaded', function() {
        const savedLang = localStorage.getItem('user-language');
        const browserLang = navigator.language.split('-')[0];
        
        // Define supported languages
        const supported = ['en', 'hi', 'te', 'ta', 'kn', 'ml', 'mr', 'gu', 'bn', 'pa', 'or', 'as'];
        
        let initialLang = 'en';
        if (savedLang && supported.includes(savedLang)) {
            initialLang = savedLang;
        } else if (browserLang && supported.includes(browserLang)) {
            initialLang = browserLang;
        }

        window.loadLanguage(initialLang);
    });

})(window, document);
