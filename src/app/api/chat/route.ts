import { buildMasterPrompt } from "@/lib/swasthyasetu-prompt";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, pathname, userRole, patientLang } = await req.json();

    if (!process.env.GROQ_API_KEY) {
      return new Response(JSON.stringify({ error: "API key missing" }), { status: 500 });
    }

    const systemPrompt = buildMasterPrompt({ 
      pathname: pathname || "/", 
      userRole: userRole || "patient", 
      patientLang: patientLang || "Telugu" 
    });

    // Direct fetch to Groq API to bypass corrupted SDK imports
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map((m: any) => ({ role: m.role, content: m.content }))
        ],
        stream: true,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API Error Response:", err);
      if (response.status === 401) {
        return new Response(JSON.stringify({ error: "Invalid API Key. Please check your .env file." }), { status: 401 });
      }
      return new Response(JSON.stringify({ error: `Groq error: ${response.status}` }), { status: response.status });
    }

    if (!response.body) {
      return new Response(JSON.stringify({ error: "Empty response from AI" }), { status: 500 });
    }

    // Convert OpenAI/Groq stream format to Vercel AI SDK compatible stream format (prefix with 0:)
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const json = JSON.parse(data);
                const text = json.choices[0]?.delta?.content;
                if (text) {
                  // Vercel AI SDK v3 protocol: 0:"text content"\n
                  controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(text)}\n`));
                }
              } catch (e) {}
            }
          }
        }
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (error: any) {
    console.error("Chat API Detailed Error:", error?.message || error);
    return new Response(JSON.stringify({ error: "Service unavailable" }), { status: 500 });
  }
}
