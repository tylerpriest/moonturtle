const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-User-Provider-Key, X-MoonTurtle-Provider',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return JSON.parse(trimmed);
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Provider response did not contain JSON.');
  return JSON.parse(match[0]);
}

function promptFor(payload) {
  return `Write one MoonTurtle daily reading as strict JSON only.

Rules:
- Use the provided true-sky sidereal / IAU-boundary data as receipts.
- Choose only the loudest one to three signals.
- Preserve agency: no fatalism, no predictions, no commands disguised as cosmic certainty.
- Use warm, grounded, poetic language.
- Do not mention birth date, birth time, or exact coordinates.

Required JSON keys:
headline, body, lunarAxis, activations, notice, avoid.

Input:
${JSON.stringify(payload, null, 2)}`;
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: { code: 'invalid_json', message: 'Expected a JSON request body.' } }, 400);
  }

  const apiKey = request.headers.get('X-User-Provider-Key') || env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return json({
      error: {
        code: 'provider_unavailable',
        message: 'No provider key is configured. The client can use the local symbolic engine.',
      },
    }, 503);
  }

  const providerResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.MT_MODEL || 'claude-opus-4-7',
      max_tokens: 1400,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: promptFor(payload),
        },
      ],
    }),
  });

  if (!providerResponse.ok) {
    return json({
      error: {
        code: 'provider_error',
        message: `Provider returned ${providerResponse.status}.`,
      },
    }, 502);
  }

  const data = await providerResponse.json();
  const text = data.content?.map((part) => part.text ?? '').join('\n') ?? '';

  try {
    return json({
      ...extractJson(text),
      source: request.headers.get('X-User-Provider-Key') ? 'user-anthropic-key' : 'anthropic-provider',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return json({
      error: {
        code: 'provider_parse_error',
        message: error.message,
      },
    }, 502);
  }
}
