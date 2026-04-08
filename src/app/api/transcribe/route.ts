import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY || '',
    baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const audioFile = formData.get('file') as Blob;
        const sourceLang = formData.get('sourceLang') as string;
        const targetLang = formData.get('targetLang') as string;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // 1. Convert Blob to File (Groq SDK expects a file object)
        const file = new File([audioFile], 'audio.webm', { type: 'audio/webm' });

        console.log(`[API Transcribe] Received ${audioFile.size} bytes. Language: ${sourceLang} -> ${targetLang}`);

        // 2. Transcribe using Groq Whisper-large-v3
        const transcription = await groq.audio.transcriptions.create({
            file: file,
            model: 'whisper-large-v3',
            language: sourceLang.toLowerCase().includes('english') ? 'en' : 'hi', // Simplified lang mapping
            response_format: 'text',
        });

        const transcribedText = transcription as unknown as string;
        console.log(`[API Transcribe] Result:`, transcribedText);

        // 3. (Optional) If target is different, use Llama 3 for quick translation
        let translatedText = transcribedText;
        if (sourceLang !== targetLang && transcribedText.trim() !== '') {
            const translationResponse = await groq.chat.completions.create({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    { 
                        role: 'system', 
                        content: `Translate the following medical consultation snippet from ${sourceLang} to ${targetLang}. Only return the translation. No explanations.` 
                    },
                    { role: 'user', content: transcribedText }
                ]
            });
            translatedText = translationResponse.choices[0]?.message?.content || transcribedText;
            console.log(`[API Transcribe] Translation:`, translatedText);
        }

        return NextResponse.json({
            originalText: transcribedText,
            translatedText: translatedText,
        });

    } catch (error: any) {
        console.error('[API Transcribe] Groq error:', error);
        return NextResponse.json({ 
            error: 'AI Processing Failed', 
            details: error.message,
            originalText: '(Error processing speech)', 
            translatedText: '' 
        }, { status: 500 });
    }
}
