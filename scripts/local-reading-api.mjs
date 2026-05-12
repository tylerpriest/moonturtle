import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const DEFAULT_MODEL_TIMEOUT_MS = 65000;

const READING_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'body', 'lunarAxis', 'activations', 'notice', 'avoid'],
  properties: {
    headline: { type: 'string' },
    body: { type: 'string' },
    lunarAxis: {
      type: 'object',
      additionalProperties: false,
      required: ['natal', 'current', 'reading'],
      properties: {
        natal: {
          type: 'object',
          additionalProperties: false,
          required: ['sign', 'house', 'words'],
          properties: {
            sign: { type: 'string' },
            house: { type: 'string' },
            words: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
          },
        },
        current: {
          type: 'object',
          additionalProperties: false,
          required: ['sign', 'words'],
          properties: {
            sign: { type: 'string' },
            words: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 4 },
          },
        },
        reading: { type: 'string' },
      },
    },
    activations: {
      type: 'array',
      minItems: 1,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['title', 'activates', 'theme', 'question', 'insight'],
        properties: {
          title: { type: 'string' },
          activates: { type: 'string' },
          theme: { type: 'string' },
          question: { type: 'string' },
          insight: { type: 'string' },
        },
      },
    },
    notice: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
    avoid: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 4 },
  },
};

function json(res, body, statusCode = 200) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.setEncoding('utf8');
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function extractJson(text) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Empty model response.');
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.result && typeof parsed.result === 'string') return extractJson(parsed.result);
    if (parsed.final_answer && typeof parsed.final_answer === 'string') return extractJson(parsed.final_answer);
    if (parsed.message && typeof parsed.message === 'string') return extractJson(parsed.message);
    return parsed;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) throw new Error('Model response did not contain JSON.');
    return JSON.parse(match[0]);
  }
}

function promptFor(payload) {
  return `Write one MoonTurtle daily reading as strict JSON only.

Rules:
- Use the provided true-sky sidereal / IAU-boundary data as receipts.
- Choose only the loudest one to three signals.
- Preserve agency: no fatalism, no prediction language, no commands disguised as cosmic certainty.
- Use warm, grounded, image-rich language.
- Do not mention birth date, birth time, exact coordinates, providers, APIs, or implementation details.
- Match this exact JSON shape: headline, body, lunarAxis, activations, notice, avoid.

Input:
${JSON.stringify(payload, null, 2)}`;
}

function normaliseReading(reading, source, providerMeta) {
  return {
    ...reading,
    source,
    providerMeta,
    generatedAt: new Date().toISOString(),
  };
}

async function commandExists(command) {
  try {
    await execFileAsync('zsh', ['-lc', `command -v ${command}`], { timeout: 2500 });
    return true;
  } catch {
    return false;
  }
}

function modelTimeoutMs() {
  const value = Number(process.env.MOONTURTLE_MODEL_TIMEOUT_MS ?? DEFAULT_MODEL_TIMEOUT_MS);
  return Number.isFinite(value) && value > 0 ? value : DEFAULT_MODEL_TIMEOUT_MS;
}

function codexModel(payload = {}) {
  return process.env.MT_MODEL || process.env.MOONTURTLE_CODEX_MODEL || payload.requestedModel || 'gpt-5.5';
}

function codexReasoning(payload = {}) {
  return process.env.MT_REASONING_EFFORT || process.env.MOONTURTLE_CODEX_REASONING || payload.reasoningEffort || 'xhigh';
}

function codexMeta(payload = {}) {
  const modelId = codexModel(payload);
  const reasoningEffort = codexReasoning(payload);
  return {
    provider: 'codex',
    providerSurface: 'Codex local subscription',
    modelId,
    modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
    reasoningEffort,
    displayName: `Codex local subscription · ${modelId} · ${reasoningEffort} reasoning`,
    isLocalSubscription: true,
  };
}

function claudeMeta() {
  return {
    provider: 'claude',
    providerSurface: 'Claude Code local subscription',
    modelId: process.env.CLAUDE_MODEL || 'subscription-default',
    modelLabel: 'Claude',
    reasoningEffort: null,
    displayName: 'Claude Code local subscription · Claude',
    isLocalSubscription: true,
  };
}

function anthropicMeta() {
  const modelId = process.env.MT_MODEL || 'claude-opus-4-7';
  return {
    provider: 'anthropic',
    providerSurface: 'Anthropic API',
    modelId,
    modelLabel: 'Claude',
    reasoningEffort: null,
    displayName: `Anthropic API · ${modelId}`,
  };
}

function isTimeoutError(error) {
  return error?.killed || error?.code === 'ETIMEDOUT' || /timed out/i.test(error?.message ?? '');
}

function providerOrder(payload, mode, runners) {
  if (mode !== 'auto') return [mode];
  const requested = Array.isArray(payload.providerOrder) ? payload.providerOrder : [];
  const clean = requested.filter((name, index) => (
    runners[name] && requested.indexOf(name) === index
  ));
  return clean.length ? clean : ['codex'];
}

async function runClaude(prompt) {
  if (!(await commandExists('claude'))) throw new Error('Claude CLI is not installed.');
  const schema = JSON.stringify(READING_SCHEMA);
  const { stdout } = await execFileAsync('claude', [
    '-p',
    prompt,
    '--output-format',
    'json',
    '--json-schema',
    schema,
    '--tools',
    '',
    '--no-session-persistence',
  ], {
    timeout: modelTimeoutMs(),
    maxBuffer: 1024 * 1024 * 4,
  });
  return normaliseReading(extractJson(stdout), 'local-claude-subscription', claudeMeta());
}

async function runCodex(prompt, payload = {}) {
  if (!(await commandExists('codex'))) throw new Error('Codex CLI is not installed.');
  const dir = await mkdtemp(join(tmpdir(), 'moonturtle-codex-'));
  const schemaPath = join(dir, 'reading.schema.json');
  const outputPath = join(dir, 'reading.json');
  const modelId = codexModel(payload);
  const reasoningEffort = codexReasoning(payload);
  try {
    await writeFile(schemaPath, JSON.stringify(READING_SCHEMA));
    await execFileAsync('codex', [
      'exec',
      '--skip-git-repo-check',
      '--sandbox',
      'read-only',
      '--model',
      modelId,
      '-c',
      `model_reasoning_effort="${reasoningEffort}"`,
      '--output-schema',
      schemaPath,
      '--output-last-message',
      outputPath,
      '--ephemeral',
      prompt,
    ], {
      timeout: modelTimeoutMs(),
      maxBuffer: 1024 * 1024 * 4,
    });
    return normaliseReading(extractJson(await readFile(outputPath, 'utf8')), 'local-codex-subscription', codexMeta(payload));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

async function runAnthropicApi(prompt, apiKey) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: process.env.MT_MODEL || 'claude-opus-4-7',
      max_tokens: 1400,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!response.ok) throw new Error(`Anthropic returned ${response.status}.`);
  const data = await response.json();
  const text = data.content?.map((part) => part.text ?? '').join('\n') ?? '';
  return normaliseReading(extractJson(text), 'user-anthropic-key', anthropicMeta());
}

async function generateReading(payload, { apiKey, apiProvider = 'anthropic' } = {}) {
  const prompt = promptFor(payload);
  const mode = payload.providerPreference ?? process.env.MOONTURTLE_LOCAL_PROVIDER ?? 'auto';
  const errors = [];

  if (mode === 'api-key') {
    if (!apiKey) {
      return {
        error: {
          code: 'api_key_missing',
          message: 'API key mode needs a saved key.',
        },
      };
    }
    if (apiProvider !== 'anthropic') {
      return {
        error: {
          code: 'api_provider_unsupported',
          message: `${apiProvider} API-key mode is not wired in this local bridge yet.`,
        },
      };
    }
    try {
      return await runAnthropicApi(prompt, apiKey);
    } catch (error) {
      return {
        error: {
          code: 'api_key_provider_error',
          message: error.message,
        },
      };
    }
  }

  const runners = {
    claude: () => runClaude(prompt),
    codex: () => runCodex(prompt, payload),
  };
  const order = providerOrder(payload, mode, runners);

  for (const name of order) {
    const runner = runners[name];
    if (!runner) continue;
    try {
      return await runner(prompt);
    } catch (error) {
      const timeout = isTimeoutError(error);
      errors.push(`${name}: ${timeout ? `timed out after ${modelTimeoutMs()}ms` : error.message}`);
      if (timeout) break;
    }
  }

  return {
    error: {
      code: errors.some((entry) => entry.includes('timed out')) ? 'local_provider_timeout' : 'local_provider_unavailable',
      message: 'No local subscription provider completed quickly enough. The client can use the local symbolic reading.',
      detail: errors,
    },
  };
}

export function localReadingApiPlugin() {
  return {
    name: 'moonturtle-local-reading-api',
    configureServer(server) {
      server.middlewares.use('/api/reading', async (req, res) => {
        if (req.method !== 'POST') {
          json(res, { error: { code: 'method_not_allowed', message: 'Use POST.' } }, 405);
          return;
        }

        let payload;
        try {
          payload = JSON.parse(await readBody(req));
        } catch {
          json(res, { error: { code: 'invalid_json', message: 'Expected JSON.' } }, 400);
          return;
        }

        const rawApiKey = req.headers['x-user-provider-key'];
        const apiKey = Array.isArray(rawApiKey) ? rawApiKey[0] : rawApiKey;
        const rawProvider = req.headers['x-moonturtle-provider'];
        const apiProvider = Array.isArray(rawProvider) ? rawProvider[0] : rawProvider;
        const result = await generateReading(payload, { apiKey, apiProvider: apiProvider ?? 'anthropic' });
        if (result.error) {
          json(res, result, 503);
          return;
        }
        json(res, result);
      });
    },
  };
}
