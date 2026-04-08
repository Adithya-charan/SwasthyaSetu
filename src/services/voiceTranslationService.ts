export interface TranslationResponse {
    originalText: string;
    translatedText: string;
    translatedAudioOutput: Blob | null;
}

/**
 * Service to handle audio chunk routing for REAL AI processing
 * (Groq Whisper-large-v3 -> Llama-3.3-70b-versatile)
 */
class VoiceTranslationService {
    
    async processAudioChunk(
        audioChunk: Blob, 
        sourceLang: string, 
        targetLang: string
    ): Promise<TranslationResponse> {
        
        console.log(`[voiceTranslationService] Sending ${audioChunk.size} bytes chunk for LIVE transcription...`);

        try {
            // Encode the Blob into a FormData object for our API
            const formData = new FormData();
            formData.append('file', audioChunk);
            formData.append('sourceLang', sourceLang);
            formData.append('targetLang', targetLang);

            // POST to our internal proxy which then talks to Groq
            const response = await fetch('/api/transcribe', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Transcription service responded with an error');
            }

            const data = await response.json();

            // Handle very short/silent chunks (Whisper often returns "Thank you." for silence)
            if (!data.originalText || data.originalText.trim() === '' || data.originalText.includes('Thank you')) {
                return {
                    originalText: '',
                    translatedText: '',
                    translatedAudioOutput: null
                };
            }

            return {
                originalText: data.originalText,
                translatedText: data.translatedText,
                translatedAudioOutput: null // Audio Synthesis happens locally in browser via TTS
            };

        } catch (error) {
            console.error('[voiceTranslationService] Pipeline Error:', error);
            return {
                originalText: '',
                translatedText: '',
                translatedAudioOutput: null
            };
        }
    }
}

export const translationService = new VoiceTranslationService();
