import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioBlob = formData.get('file') as Blob;
        const sourceLang = formData.get('sourceLang') as string;
        const targetLang = formData.get('targetLang') as string;

        if (!audioBlob || audioBlob.size === 0) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // 1. Convert Blob to File format expected by OpenAI SDK using toFile
        const mimeType = audioBlob.type || 'audio/webm';
        const extension = mimeType.split('/')[1]?.split(';')[0] || 'webm';
        
        const buffer = Buffer.from(await audioBlob.arrayBuffer());
        const file = await toFile(buffer, `audio.${extension}`, { type: mimeType });

        console.log(`[API Transcribe] Received ${audioBlob.size} bytes (${mimeType}). Language: ${sourceLang} -> ${targetLang}`);

        // 2. Transcribe using Groq Whisper-large-v3
        // Mapping full language names to ISO codes for Whisper
        const langMap: Record<string, string> = {
            'English': 'en',
            'Hindi': 'hi',
            'Telugu': 'te',
            'Tamil': 'ta',
            'Marathi': 'mr',
            'Bengali': 'bn',
            'Gujarati': 'gu',
            'Kannada': 'kn',
            'Malayalam': 'ml',
            'Urdu': 'ur',
            'Punjabi': 'pa'
        };
        const whisperLang = langMap[sourceLang] || 'hi';

        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3',
            language: whisperLang,
            response_format: 'text',
        });

        const transcribedText = transcription as unknown as string;
        console.log(`[API Transcribe] Result:`, transcribedText);

        // 3. (Optional) If target is different, use Llama 3 for medical-grade translation
        let translatedText = transcribedText;
        if (sourceLang !== targetLang && transcribedText.trim() !== '' && transcribedText.length > 2) {
            try {
                const translationResponse = await groq.chat.completions.create({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { 
                            role: 'system', 
                            content: `You are a medical translator. Translate the following patient-doctor conversation snippet from ${sourceLang} to ${targetLang}. 
                            Maintain medical terminology accuracy. Only return the translated text. Do not include any notes, explanations, or conversational filler.` 
                        },
                        { role: 'user', content: transcribedText }
                    ],
                    temperature: 0.3,
                });
                const aiTranslation = translationResponse.choices[0]?.message?.content?.trim();
                if (aiTranslation) {
                    translatedText = aiTranslation;
                    console.log(`[API Transcribe] Translation Success:`, translatedText);
                }
            } catch (transErr) {
                console.error('[API Transcribe] Translation step failed, falling back to original:', transErr);
            }
        }

        return NextResponse.json({
            originalText: transcribedText,
            translatedText: translatedText,
        });

    } catch (error: any) {
        console.error('[API Transcribe] Groq error:', error);
        if (error.response) {
            console.error('[API Transcribe] Error Response Data:', await error.response.json().catch(() => ({})).then(JSON.stringify));
        }
        return NextResponse.json({ 
            error: 'AI Processing Failed', 
            details: error.message || 'Unknown Groq error',
            originalText: '(Error processing speech)', 
            translatedText: '' 
        }, { status: 500 });
    }
}
