import { normalizeReadingShape, validateReadingProse } from '../../src/reading/validation.js';

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

function promptFor(payload, retryNote = '') {
  return `Write one MoonTurtle daily reading as strict JSON only.

Rules:
- Use the provided true-sky sidereal / actual-sky IAU constellation data as receipts.
- Choose only the loudest one to three signals.
- Return exactly five activations, four notice items, and four avoid items.
- Preserve agency: no fatalism, no predictions, no commands disguised as cosmic certainty.
- Use warm, grounded, poetic language.
- Do not use forbidden filler: energy, vibes, alignment, manifestation, the universe, abundance.
- Do not mention birth date, birth time, or exact coordinates.

Required JSON keys:
headline, body, lunarAxis, activations, notice, avoid.
${retryNote ? `\nPrevious response failed validation:\n${retryNote}\n` : ''}

Input:
${JSON.stringify(payload, null, 2)}`;
}

async function requestReading({ apiKey, env, payload, retryNote }) {
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
          content: promptFor(payload, retryNote),
        },
      ],
    }),
  });

  if (!providerResponse.ok) {
    const error = new Error(`Provider returned ${providerResponse.status}.`);
    error.code = 'provider_error';
    error.status = providerResponse.status;
    throw error;
  }

  const data = await providerResponse.json();
  const text = data.content?.map((part) => part.text ?? '').join('\n') ?? '';
  return normalizeReadingShape(extractJson(text));
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

  let retryNote = '';
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const reading = await requestReading({ apiKey, env, payload, retryNote });
      const validation = validateReadingProse(reading);
      if (validation.ok) {
        return json({
          ...validation.normalized,
          source: request.headers.get('X-User-Provider-Key') ? 'user-anthropic-key' : 'anthropic-provider',
          providerMeta: {
            provider: 'anthropic',
            providerSurface: request.headers.get('X-User-Provider-Key') ? 'Anthropic API' : 'Hosted Claude API',
            modelId: env.MT_MODEL || 'claude-opus-4-7',
            modelLabel: 'Claude',
            reasoningEffort: null,
          },
          generatedAt: new Date().toISOString(),
        });
      }
      retryNote = validation.errors.slice(0, 8).join('\n');
    }

    return json({
      error: {
        code: retryNote.includes('Forbidden phrase') ? 'voice_validation_failed' : 'reading_schema_invalid',
        message: 'Provider response failed MoonTurtle reading validation.',
        detail: retryNote ? retryNote.split('\n') : [],
      },
    }, 502);
  } catch (error) {
    return json({
      error: {
        code: error.code ?? 'provider_parse_error',
        message: error.message,
      },
    }, 502);
  }
}
