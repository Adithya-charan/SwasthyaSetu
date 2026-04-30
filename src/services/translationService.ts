/**
 * Translation Service for SwasthyaSetu
 * Integrates with Sarvam AI via backend proxy
 * Handles local caching to optimize performance
 */

const CACHE_NAME = 'swasthyasetu-translations';

export const translationService = {
    /**
     * Translates a piece of text to the target language
     */
    async translate(text: string, targetLang: string): Promise<string> {
        if (targetLang === 'en') return text;

        const cacheKey = `${targetLang}:${text}`;
        
        // 1. Check local cache
        const cached = this.getFromCache(cacheKey);
        if (cached) return cached;

        try {
            // 2. Call backend proxy
            const response = await fetch('/api/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, targetLang })
            });

            if (!response.ok) throw new Error('Translation failed');

            const data = await response.json();
            const translated = data.translatedText;

            // 3. Save to cache
            if (translated) {
                this.saveToCache(cacheKey, translated);
                return translated;
            }

            return text; // Fallback
        } catch (error) {
            console.error('[TranslationService] Error:', error);
            return text; // Fallback to English
        }
    },

    /**
     * Translates multiple strings at once (simulated via Promise.all)
     */
    async translateBatch(texts: string[], targetLang: string): Promise<string[]> {
        return Promise.all(texts.map(t => this.translate(t, targetLang)));
    },

    getFromCache(key: string): string | null {
        if (typeof window === 'undefined') return null;
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_NAME) || '{}');
            return cache[key] || null;
        } catch {
            return null;
        }
    },

    saveToCache(key: string, value: string) {
        if (typeof window === 'undefined') return;
        try {
            const cache = JSON.parse(localStorage.getItem(CACHE_NAME) || '{}');
            cache[key] = value;
            // Limit cache size to 500 entries to avoid bloating localStorage
            const keys = Object.keys(cache);
            if (keys.length > 500) {
                delete cache[keys[0]];
            }
            localStorage.setItem(CACHE_NAME, JSON.stringify(cache));
        } catch (e) {
            console.log('[Cache] Save failed', e);
        }
    }
};
