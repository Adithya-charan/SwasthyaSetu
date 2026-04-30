import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const { text, targetLang } = await req.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_oq46s4rw_pxWWbZkAIhdJdNUnTlnnIn0m';

        // Mapping simple codes to Sarvam BCP-47 codes
        const langMap: Record<string, string> = {
            'en': 'en-IN', 'hi': 'hi-IN', 'te': 'te-IN', 
            'ta': 'ta-IN', 'kn': 'kn-IN', 'ml': 'ml-IN',
            'mr': 'mr-IN', 'gu': 'gu-IN', 'pa': 'pa-IN',
            'bn': 'bn-IN', 'or': 'od-IN', 'as': 'as-IN'
        };

        const targetCode = langMap[targetLang] || 'hi-IN';

        console.log(`[Sarvam AI] Translating to ${targetCode}: "${text.substring(0, 30)}..."`);

        const response = await fetch('https://api.sarvam.ai/translate', {
            method: 'POST',
            headers: {
                'api-subscription-key': SARVAM_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: text,
                source_language_code: 'en-IN',
                target_language_code: targetCode,
                model: 'sarvam-translate:v1',
                mode: 'formal'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('[Sarvam AI] Error:', error);
            throw new Error(`Sarvam API error: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json({ translatedText: data.translated_text });

    } catch (error: any) {
        console.error('[API Translate] Failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
