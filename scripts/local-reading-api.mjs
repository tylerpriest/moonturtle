import { execFile, spawn } from 'node:child_process';
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
      minItems: 3,
      maxItems: 5,
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

Target:
- The answer should feel like a compact version of the master MoonTurtle reading, not a generic horoscope.
- The source model is receiving calculated receipts. Do not re-calculate or argue with them.
- The UI will separately show the sky and natal tables. Your job is synthesis: sky data -> natal pattern -> current activation -> personal meaning -> medicine.

Voice rules:
- Second person, contemplative, emotionally intelligent, precise.
- Image first. A useful sentence should feel hand-written for this chart and this day.
- Use "may", "can", "asks", "invites", "presses", "opens"; avoid prediction and command language.
- Do not use: energy, vibes, alignment, manifestation, the universe, abundance, high vibration.
- Avoid generic positivity, fear, doom, and mechanical planet lists.

Content rules:
- Use the provided true-sky sidereal / IAU-boundary data as receipts.
- Choose only the loudest one to three signals, then return 3 to 5 activation cards that explore those signals without padding.
- Preserve agency: no fatalism, no prediction language, no commands disguised as cosmic certainty.
- Do not mention birth date, birth time, exact coordinates, providers, APIs, or implementation details.
- Match this exact JSON shape: headline, body, lunarAxis, activations, notice, avoid.

Quality bar:
- headline: 6-12 words, specific and memorable.
- body: 3-5 sentences. Name today's central sky/natal interaction and what it asks the person to notice, release, express, or carry more cleanly.
- lunarAxis.reading: 2-4 sentences connecting natal Moon, current Moon, phase, and today's emotional lesson.
- activation themes: living dynamics, not textbook definitions.
- notice/avoid: short, concrete, reflective, not commands.

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

function execFileWithInput(command, args, input, { timeout, maxBuffer = 1024 * 1024 * 4 } = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let settled = false;
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      callback();
    };
    const fail = (error) => finish(() => reject(Object.assign(error, { stdout, stderr })));
    const timer = timeout ? setTimeout(() => {
      child.kill('SIGTERM');
      const error = new Error(`Command timed out after ${timeout}ms.`);
      error.killed = true;
      error.code = 'ETIMEDOUT';
      fail(error);
    }, timeout) : null;

    function append(chunk, streamName) {
      const next = chunk.toString();
      if (stdout.length + stderr.length + next.length > maxBuffer) {
        child.kill('SIGTERM');
        const error = new Error(`${streamName} exceeded maxBuffer.`);
        error.code = 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER';
        fail(error);
        return '';
      }
      return next;
    }

    child.stdout.on('data', (chunk) => {
      if (!settled) stdout += append(chunk, 'stdout');
    });
    child.stderr.on('data', (chunk) => {
      if (!settled) stderr += append(chunk, 'stderr');
    });
    child.on('error', fail);
    child.on('close', (code, signal) => {
      finish(() => {
        if (code === 0) {
          resolve({ stdout, stderr });
          return;
        }
        const error = new Error(stderr.trim() || `${command} exited with code ${code}${signal ? ` (${signal})` : ''}.`);
        error.code = code;
        error.signal = signal;
        reject(Object.assign(error, { stdout, stderr }));
      });
    });
    child.stdin.on('error', () => {});
    child.stdin.end(input);
  });
}

function extractCodexJsonl(stdout, stderr = '') {
  const messages = [];
  const events = [];
  for (const line of stdout.split('\n')) {
    if (!line.trim()) continue;
    try {
      const event = JSON.parse(line);
      events.push([
        event.type,
        event.item?.type,
        event.error?.message ?? event.message,
      ].filter(Boolean).join(':'));
      if (event.type === 'item.completed' && event.item?.type === 'agent_message' && typeof event.item.text === 'string') {
        messages.push(event.item.text);
      }
      if (event.type === 'agent_message' && typeof event.text === 'string') {
        messages.push(event.text);
      }
      if (event.type === 'turn.completed' && typeof event.final_message === 'string') {
        messages.push(event.final_message);
      }
    } catch {
      // Ignore non-JSON noise. Codex writes warnings to stderr in normal cases,
      // but this keeps the bridge resilient across CLI versions.
    }
  }
  const last = messages.at(-1);
  if (!last) {
    const stderrTail = stderr.trim().split('\n').slice(-3).join(' | ');
    const tail = events.slice(-6).join(' | ') || stderrTail || 'no JSONL events';
    throw new Error(`Codex did not write a final agent message. Last events: ${tail}`);
  }
  return extractJson(last);
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
  const modelId = process.env.MT_ANTHROPIC_MODEL || 'claude-opus-4-7';
  return {
    provider: 'anthropic',
    providerSurface: 'Anthropic API',
    modelId,
    modelLabel: 'Claude',
    reasoningEffort: null,
    displayName: `Anthropic API · ${modelId}`,
  };
}

function openAiModel(payload = {}) {
  return process.env.MT_OPENAI_MODEL || process.env.MT_MODEL || payload.requestedModel || 'gpt-5.5';
}

function openAiReasoning(payload = {}) {
  return process.env.MT_OPENAI_REASONING_EFFORT || process.env.MT_REASONING_EFFORT || payload.reasoningEffort || 'xhigh';
}

function openAiMeta(payload = {}) {
  const modelId = openAiModel(payload);
  const reasoningEffort = openAiReasoning(payload);
  return {
    provider: 'openai',
    providerSurface: 'OpenAI API',
    modelId,
    modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
    reasoningEffort,
    displayName: `OpenAI API · ${modelId} · ${reasoningEffort} reasoning`,
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
    const reading = await execFileWithInput('codex', [
      'exec',
      '--json',
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
      '-',
    ], prompt, {
      timeout: modelTimeoutMs(),
      maxBuffer: 1024 * 1024 * 4,
    }).then(async ({ stdout, stderr }) => {
      try {
        return extractJson(await readFile(outputPath, 'utf8'));
      } catch {
        return extractCodexJsonl(stdout, stderr);
      }
    });
    return normaliseReading(reading, 'local-codex-subscription', codexMeta(payload));
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
      model: process.env.MT_ANTHROPIC_MODEL || 'claude-opus-4-7',
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

function outputTextFromOpenAi(data) {
  if (typeof data.output_text === 'string') return data.output_text;
  const parts = [];
  for (const item of data.output ?? []) {
    for (const content of item.content ?? []) {
      if (typeof content.text === 'string') parts.push(content.text);
    }
  }
  return parts.join('\n');
}

async function runOpenAiApi(prompt, apiKey, payload = {}) {
  const meta = openAiMeta(payload);
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: meta.modelId,
      input: prompt,
      max_output_tokens: 2200,
      reasoning: {
        effort: meta.reasoningEffort,
      },
      text: {
        format: {
          type: 'json_schema',
          name: 'moonturtle_reading',
          strict: true,
          schema: READING_SCHEMA,
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}.`);
  const data = await response.json();
  return normaliseReading(extractJson(outputTextFromOpenAi(data)), 'user-openai-key', meta);
}

async function generateReading(payload, { apiKey, apiProvider = 'openai' } = {}) {
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
    try {
      if (apiProvider === 'openai') return await runOpenAiApi(prompt, apiKey, payload);
      if (apiProvider !== 'anthropic') {
        return {
          error: {
            code: 'api_provider_unsupported',
            message: `${apiProvider} API-key mode is not wired in this local bridge yet.`,
          },
        };
      }
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
    const startedAt = Date.now();
    try {
      return await runner(prompt);
    } catch (error) {
      const timeout = isTimeoutError(error);
      const elapsed = Date.now() - startedAt;
      errors.push(`${name}: ${timeout ? `timed out after ${Math.round(modelTimeoutMs() / 1000)}s` : error.message} (${Math.round(elapsed / 1000)}s elapsed)`);
      if (timeout) break;
    }
  }

  const timedOut = errors.some((entry) => entry.includes('timed out'));
  return {
    error: {
      code: timedOut ? 'local_provider_timeout' : 'local_provider_unavailable',
      message: timedOut
        ? `The local ${order[0] ?? 'AI'} subscription did not return a reading before the bridge timeout.`
        : 'No local subscription provider was available to write the reading.',
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
        const result = await generateReading(payload, { apiKey, apiProvider: apiProvider ?? 'openai' });
        if (result.error) {
          json(res, result, 503);
          return;
        }
        json(res, result);
      });
    },
  };
}
