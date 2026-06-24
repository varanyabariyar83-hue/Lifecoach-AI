/**
 * LifeCoach AI — Cloudflare Worker API Proxy
 * 
 * Deploy at: https://dash.cloudflare.com → Workers → Create
 * Set secret: wrangler secret put GROQ_API_KEY  (or ANTHROPIC_API_KEY)
 * 
 * In the PWA Settings page, set endpoint to:
 *   https://your-worker-name.your-subdomain.workers.dev/api
 */

const ALLOWED_ORIGIN = '*'; // Lock this to your Cloudflare Pages domain in production
                              // e.g. 'https://lifecoach.pages.dev'

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const url = new URL(request.url);

    // ── OPTION A: Groq (free, fast — recommended for production) ──
    if (env.GROQ_API_KEY) {
      const body = await request.json();
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1000,
          messages: [
            { role: 'system', content: body.system },
            ...body.messages
          ]
        })
      });
      const groqData = await groqRes.json();
      // Translate Groq response to Anthropic format for the PWA
      const text = groqData.choices?.[0]?.message?.content || '';
      return new Response(JSON.stringify({
        content: [{ type: 'text', text }]
      }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN
        }
      });
    }

    // ── OPTION B: Anthropic Claude (if you have an API key) ──
    if (env.ANTHROPIC_API_KEY) {
      const body = await request.text();
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body
      });
      const data = await anthropicRes.text();
      return new Response(data, {
        status: anthropicRes.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': ALLOWED_ORIGIN
        }
      });
    }

    return new Response(JSON.stringify({ error: 'No API key configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY as a Worker secret.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': ALLOWED_ORIGIN }
    });
  }
};
