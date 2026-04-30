/**
 * Language Loader Module for SwasthyaSetu
 * Handles dynamic fetching and application of JSON translation files
 */

export const languageLoader = {
    currentLanguage: 'en',
    translations: {} as any,

    /**
     * Initializes the language based on browser settings or localStorage
     */
    async init(): Promise<void> {
        const savedLang = localStorage.getItem('user-language');
        const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] : 'en';
        const defaultLang = savedLang || browserLang || 'en';
        
        await this.setLanguage(defaultLang);
    },

    /**
     * Loads a translation JSON file and applies it to the UI
     */
    async setLanguage(lang: string): Promise<boolean> {
        try {
            const response = await fetch(`/translations/${lang}.json`);
            if (!response.ok) throw new Error('Translation file not found');
            
            this.translations = await response.json();
            this.currentLanguage = lang;
            localStorage.setItem('user-language', lang);
            
            this.applyTranslations();
            return true;
        } catch (error) {
            console.error('[LanguageLoader] Failed to load language:', lang, error);
            if (lang !== 'en') {
                return this.setLanguage('en'); // Fallback
            }
            return false;
        }
    },

    /**
     * Scans the DOM for elements with data-key and updates their content
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach((el: any) => {
            const key = el.getAttribute('data-key');
            if (!key) return;

            const translation = this.getNestedValue(this.translations, key);
            if (translation) {
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    el.textContent = translation;
                }
            }
        });
    },

    /**
     * Helper to get values from nested JSON (e.g., "navigation.home")
     */
    getNestedValue(obj: any, key: string) {
        return key.split('.').reduce((prev, curr) => prev && prev[curr], obj);
    }
};
