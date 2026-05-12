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

function requestKind(payload = {}) {
  return payload.requestKind === 'profile' || payload.requestKind === 'ask' ? payload.requestKind : 'daily';
}

function dailyPrompt(payload, retryNote = '') {
  return `Write one MoonTurtle daily basic reading as strict JSON only.

Rules:
- Use the provided true-sky sidereal / actual-sky IAU constellation data as receipts.
- Each day, consider Moon phase, Moon constellation, Moon house transit, Sun constellation, solar house transit, major aspects, Mercury/Venus/Mars/Jupiter/Saturn transits, Nodes/eclipses, retrogrades, visible planets, elemental balance, body/nervous-system tone, love/connection themes, dreams/symbols, and local sky visibility.
- Do not include everything. Choose only the loudest one to three signals that interact with the natal chart, especially the Sun, Moon, Ascendant, Midheaven, chart ruler, Mercury, Venus, Mars, Nodes, and major natal clusters.
- Explain how today's signals interact with the chart, what they ask the person to feel, notice, release, express, or act on, and how the day can be met well.
- Return one to three activations, four notice items, and four avoid items.
- Preserve agency: no fatalism, no predictions, no commands disguised as cosmic certainty.
- Use warm, grounded, poetic language.
- Do not use forbidden filler: energy, vibes, alignment, manifestation, the universe, abundance.
- Do not mention birth date, birth time, or exact coordinates.

Required JSON keys:
headline, body, summaryLine, glanceItems, loudestSignals, fullReading, release, act, lunarAxis, activations, notice, avoid.
${retryNote ? `\nPrevious response failed validation:\n${retryNote}\n` : ''}

Input:
${JSON.stringify(payload, null, 2)}`;
}

function profilePrompt(payload) {
  return `Write MoonTurtle's comprehensive Profile reading as strict JSON only.

Rules:
- This is the stable natal operating manual, not a daily transit.
- Use only the provided true-sky sidereal natal receipts.
- Do not recalculate, switch frameworks, or mention implementation details.
- Preserve agency: no fatalism, predictions, or medical claims.

Required JSON keys:
profileSummary, corePattern, angles, chartRuler, natalMoon, majorClusters, strengths, shadows, howToUseDailyReadings, chartReceipts.

Input:
${JSON.stringify(payload, null, 2)}`;
}

function askPrompt(payload) {
  return `Answer the user's MoonTurtle question as strict JSON only.

Rules:
- Use only the provided Profile, Today, Sky, signals, and Journal context.
- If a source is missing, say so rather than inventing it.
- Preserve agency and avoid fatalism.

Required JSON keys:
answer, sourceChips, followUps.

Input:
${JSON.stringify(payload, null, 2)}`;
}

function promptFor(payload, retryNote = '') {
  const kind = requestKind(payload);
  if (kind === 'profile') return profilePrompt(payload);
  if (kind === 'ask') return askPrompt(payload);
  return dailyPrompt(payload, retryNote);
}

function providerMeta({ request, env }) {
  return {
    provider: 'anthropic',
    providerSurface: request.headers.get('X-User-Provider-Key') ? 'Anthropic API' : 'Hosted Claude API',
    modelId: env.MT_MODEL || 'claude-opus-4-7',
    modelLabel: 'Claude',
    reasoningEffort: null,
  };
}

async function requestProvider({ apiKey, env, payload, retryNote }) {
  const providerResponse = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: env.MT_MODEL || 'claude-opus-4-7',
      max_tokens: requestKind(payload) === 'profile' ? 2600 : 1600,
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
  return extractJson(text);
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

  const meta = providerMeta({ request, env });
  const source = request.headers.get('X-User-Provider-Key') ? 'user-anthropic-key' : 'anthropic-provider';

  try {
    if (requestKind(payload) !== 'daily') {
      const result = await requestProvider({ apiKey, env, payload, retryNote: '' });
      return json({
        ...result,
        source,
        providerMeta: meta,
        generatedAt: new Date().toISOString(),
      });
    }

    let retryNote = '';
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const reading = normalizeReadingShape(await requestProvider({ apiKey, env, payload, retryNote }));
      const validation = validateReadingProse(reading);
      if (validation.ok) {
        return json({
          ...validation.normalized,
          source,
          providerMeta: meta,
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
