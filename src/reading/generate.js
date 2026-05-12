import { SOURCE_METADATA_VERSION } from './lexicon/index.js';
import {
  PROMPT_VERSION,
  normalizeReadingShape,
  readingHashes,
  stableHash,
  validateReadingProse,
} from './validation.js';
import {
  generateLocalReading,
  localEngineMeta,
  localEngineSourceMetadata,
  LOCAL_ENGINE_ID,
  LOCAL_ENGINE_LABEL,
} from './localEngine.js';
import { recordAiCalibration, recordReadingValidationEvent } from './localLearning.js';

export const DAILY_PROMPT_VERSION = PROMPT_VERSION;
export const PROFILE_PROMPT_VERSION = 'profile-v1-2026-05-12';

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function findBody(chart, name) {
  return chart?.bodies?.find((body) => body.body === name);
}

function providerPayload({ natalChart, currentSky, signals }) {
  const hashes = readingHashes({ natalChart, currentSky, signals });
  return {
    requestKind: 'daily',
    schemaVersion: 2,
    promptVersion: DAILY_PROMPT_VERSION,
    chartHash: hashes.chartHash,
    skyHash: hashes.skyHash,
    signalsHash: hashes.signalsHash,
    framework: currentSky.framework,
    dateKey: currentSky.localDateKey,
    localDate: currentSky.localDate,
    localTime: currentSky.localTime,
    lunar: currentSky.lunar,
    natal: {
      bodies: natalChart.bodies,
      angles: natalChart.angles,
      houses: natalChart.houses,
      chartRuler: natalChart.chartRuler,
      framework: natalChart.framework,
      houseSystem: natalChart.houseSystem,
      birthTimeKnown: natalChart.birthTimeKnown,
    },
    signals: {
      topSignals: signals.topSignals,
      activationSignals: signals.activationSignals,
      supportingSignals: signals.supportingSignals.slice(0, 4),
    },
  };
}

function providerSourceMetadata(mode) {
  return {
    label: mode === 'api-key' ? 'AI interpretation with your provider key' : 'AI interpretation',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'The astronomy and ranked signals are calculated locally first, then an AI provider writes fuller prose from those receipts.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'Lunar cycle practice',
      'Solar cycle practice',
      'Somatic reflective practice',
      'MoonTurtle editorial synthesis',
      'AI language synthesis',
    ],
    caveat: 'The provider writes the prose; it does not make the astronomy more objective or more authoritative.',
  };
}

function makeReadingId(dateKey) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${dateKey}:${random}`;
}

function readingContentSignature(reading) {
  return stableHash({
    source: reading.source,
    headline: reading.headline,
    body: reading.body,
    summaryLine: reading.summaryLine,
    glanceItems: reading.glanceItems,
    loudestSignals: reading.loudestSignals,
    fullReading: reading.fullReading,
    release: reading.release,
    act: reading.act,
    lunarAxis: reading.lunarAxis,
    activations: reading.activations,
    receipts: reading.receipts,
    notice: reading.notice,
    avoid: reading.avoid,
  });
}

function makeDeterministicReadingId(dateKey, mode, contentSignature) {
  return `${dateKey}:local:${mode}:${contentSignature}`;
}

export function aiMode(settings = {}) {
  return settings.aiMode ?? 'auto';
}

function modelFromSettings(settings = {}) {
  return settings.model?.trim() || 'gpt-5.5';
}

function reasoningFromSettings(settings = {}) {
  return settings.reasoningEffort?.trim() || 'xhigh';
}

function providerKey(settings = {}) {
  const provider = settings.apiProvider ?? 'openai';
  const keyed = settings.apiKeys?.[provider]?.trim();
  if (keyed) return keyed;
  if (settings.apiKey?.trim()) return settings.apiKey.trim();
  return '';
}

export function formatEngineLabel(engine = {}) {
  if (engine.displayName) return engine.displayName;
  const parts = [engine.providerSurface, engine.modelId].filter(Boolean);
  if (engine.reasoningEffort) parts.push(`${engine.reasoningEffort} reasoning`);
  return parts.join(' · ') || 'Local deterministic fallback';
}

export function engineForSettings(settings = {}) {
  const mode = aiMode(settings);
  if (mode === 'local') {
    return {
      mode,
      provider: 'local',
      providerSurface: LOCAL_ENGINE_LABEL,
      modelId: LOCAL_ENGINE_ID,
      modelLabel: LOCAL_ENGINE_LABEL,
      reasoningEffort: null,
      displayName: LOCAL_ENGINE_LABEL,
      isLocal: true,
      isAi: false,
    };
  }

  if (mode === 'claude') {
    return {
      mode,
      provider: 'claude',
      providerSurface: 'Claude Code local subscription',
      modelId: 'subscription-default',
      modelLabel: 'Claude',
      reasoningEffort: null,
      displayName: 'Claude Code local subscription · Claude',
      isLocalSubscription: true,
      isAi: true,
    };
  }

  if (mode === 'api-key') {
    const provider = settings.apiProvider ?? 'openai';
    if (provider === 'openai') {
      const modelId = modelFromSettings(settings);
      const reasoningEffort = reasoningFromSettings(settings);
      return {
        mode,
        provider,
        providerSurface: 'OpenAI API',
        modelId,
        modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
        reasoningEffort,
        displayName: `OpenAI API · ${modelId} · ${reasoningEffort} reasoning`,
        isAi: true,
      };
    }
    const modelId = settings.model?.trim() && !settings.model.includes('gpt')
      ? settings.model.trim()
      : 'claude-opus-4-7';
    return {
      mode,
      provider,
      providerSurface: 'Anthropic API',
      modelId,
      modelLabel: 'Claude',
      reasoningEffort: null,
      displayName: `Anthropic API · ${modelId}`,
      isAi: true,
    };
  }

  const modelId = modelFromSettings(settings);
  const reasoningEffort = reasoningFromSettings(settings);
  return {
    mode,
    provider: 'codex',
    providerSurface: 'Codex local subscription',
    modelId,
    modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
    reasoningEffort,
    displayName: `Codex local subscription · ${modelId} · ${reasoningEffort} reasoning`,
    isLocalSubscription: true,
    isAi: true,
  };
}

function engineFromRemote(remote, settings) {
  if (remote?.providerMeta) {
    return {
      ...engineForSettings(settings),
      ...remote.providerMeta,
      displayName: formatEngineLabel(remote.providerMeta),
      isAi: true,
    };
  }
  return engineForSettings(settings);
}

function isLocalhost() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export function shouldAttemptProvider(settings = {}) {
  const mode = aiMode(settings);
  if (mode === 'local') return false;
  if (mode === 'codex' || mode === 'claude') return isLocalhost();
  if (mode === 'api-key') return Boolean(providerKey(settings));
  const setting = import.meta.env?.VITE_MOONTURTLE_USE_PROVIDER ?? 'auto';
  if (setting === 'true') return true;
  if (setting === 'false' || setting === 'off') return false;
  return isLocalhost();
}

function providerTimeoutMs(mode) {
  // The local Vite bridge has its own model timeout. The browser waits longer so
  // MoonTurtle can receive the bridge's structured failure reason instead of a
  // generic AbortError.
  const fallback = mode === 'api-key' ? 140000 : 155000;
  const configured = Number(import.meta.env?.VITE_MOONTURTLE_PROVIDER_TIMEOUT_MS ?? fallback);
  return Number.isFinite(configured) && configured > 0 ? configured : fallback;
}

function aiAttempt({ status, engine, startedAt, code, message, detail } = {}) {
  const completedAt = new Date().toISOString();
  return {
    status,
    engine,
    startedAt,
    completedAt,
    durationMs: startedAt ? Date.now() - Date.parse(startedAt) : null,
    code,
    message,
    detail,
  };
}

function finalizeReading(reading, input, overrides = {}) {
  const dateKey = input.currentSky.localDateKey;
  const engine = overrides.engine ?? engineForSettings(input.settings);
  const isFallback = Boolean(overrides.isFallback);
  const mode = input.settings?.readingMode ?? 'quick-glance';
  const modeLabel = mode === 'full' ? 'Full reading' : 'Quick glance';
  const normalized = normalizeReadingShape(reading);
  const validation = validateReadingProse(normalized);
  if (!validation.ok) {
    throw new Error(`Reading validation failed: ${validation.errors.join(' ')}`);
  }
  const hashes = readingHashes(input);
  const contentSignature = normalized.contentSignature ?? readingContentSignature(normalized);
  const isDeterministicLocal = isFallback || engine.provider === 'local';
  return {
    ...normalized,
    schemaVersion: normalized.schemaVersion ?? 2,
    readingId: normalized.readingId ?? (
      isDeterministicLocal
        ? makeDeterministicReadingId(dateKey, mode, contentSignature)
        : makeReadingId(dateKey)
    ),
    contentSignature,
    dateKey,
    promptVersion: hashes.promptVersion,
    chartHash: hashes.chartHash,
    skyHash: hashes.skyHash,
    signalsHash: hashes.signalsHash,
    generatedAt: normalized.generatedAt ?? new Date().toISOString(),
    readingMode: mode,
    modeLabel,
    engine,
    providerMeta: isFallback ? null : engine,
    isFallback,
    fallbackReason: overrides.fallbackReason ?? null,
    providerAttempted: overrides.providerAttempted ?? false,
    aiAttempt: overrides.aiAttempt ?? null,
    sourceDetail: overrides.sourceDetail ?? normalized.sourceDetail,
    engineLabel: isFallback && engine.provider === 'local' ? formatEngineLabel(engine) : (isFallback ? 'Local deterministic fallback' : formatEngineLabel(engine)),
    modelLabel: isFallback && engine.provider === 'local' ? engine.modelLabel : (isFallback ? 'Local deterministic' : engine.modelLabel),
  };
}

function fallbackReading(local, input, { startedAt, code, message, detail, providerAttempted = true } = {}) {
  const engine = engineForSettings(input.settings);
  const reason = message ?? (providerAttempted ? 'AI interpretation did not complete.' : 'AI interpretation is disabled in Settings.');
  return finalizeReading(local, input, {
    isFallback: true,
    fallbackReason: reason,
    providerAttempted,
    engine: localEngineMeta(engine),
    aiAttempt: aiAttempt({
      status: providerAttempted ? 'failed' : 'skipped',
      engine,
      startedAt,
      code,
      message: reason,
      detail,
    }),
    sourceDetail: localEngineSourceMetadata({
      currentSky: input.currentSky,
      signals: input.signals,
      reason,
    }),
  });
}

function natalSummary(natalChart = {}) {
  const sun = findBody(natalChart, 'Sun');
  const moon = findBody(natalChart, 'Moon');
  const mercury = findBody(natalChart, 'Mercury');
  const venus = findBody(natalChart, 'Venus');
  const mars = findBody(natalChart, 'Mars');
  const asc = natalChart.angles?.find((angle) => angle.angle === 'Ascendant');
  const mc = natalChart.angles?.find((angle) => angle.angle === 'Midheaven');
  return {
    sun,
    moon,
    mercury,
    venus,
    mars,
    asc,
    mc,
    chartRuler: natalChart.chartRuler,
    bodies: natalChart.bodies,
    angles: natalChart.angles,
    houses: natalChart.houses,
    framework: natalChart.framework,
    houseSystem: natalChart.houseSystem,
    birthTimeKnown: natalChart.birthTimeKnown,
  };
}

function localProfileReading({ natalChart, user }) {
  const natal = natalSummary(natalChart);
  const name = user?.displayName || natalChart?.user?.name || 'you';
  const sun = natal.sun;
  const moon = natal.moon;
  const asc = natal.asc;
  const chartRuler = natal.chartRuler ? findBody(natalChart, natal.chartRuler) : null;
  const profileSummary = natal.asc
    ? `${name} meets life through ${asc.sign} rising, with a ${sun?.sign ?? 'unknown'} Sun and ${moon?.sign ?? 'unknown'} Moon. This is the stable natal baseline MoonTurtle uses before it reads any daily sky.`
    : `${name}'s birth time is not known, so MoonTurtle keeps this profile to planets and signs without fabricated angles or houses.`;
  const moonHouse = moon?.house ? `${ordinal(moon.house)} house` : 'house unknown';
  return {
    schemaVersion: 1,
    promptVersion: PROFILE_PROMPT_VERSION,
    source: 'local-profile-fallback',
    generatedAt: new Date().toISOString(),
    profileSummary,
    corePattern: `This rough local profile sees the chart through ${sun?.sign ?? 'the Sun'}, ${moon?.sign ?? 'the Moon'}, and ${asc?.sign ?? 'the available natal placements'}. It can name the receipts, but it is not the comprehensive AI-written operating manual yet.`,
    angles: natal.asc
      ? `Ascendant ${asc.sign}; Midheaven ${natal.mc?.sign ?? 'unknown'}. These are the body doorway and public direction in this true-sky framework.`
      : 'Angles are unavailable because the birth time is unknown.',
    chartRuler: chartRuler
      ? `${natal.chartRuler} in ${chartRuler.sign}${chartRuler.house ? `, ${ordinal(chartRuler.house)} house` : ''}: this becomes one of the profile's recurring translators.`
      : 'Chart ruler is unavailable without a known Ascendant.',
    natalMoon: `Natal Moon in ${moon?.sign ?? 'unknown'}${moon?.house ? `, ${moonHouse}` : ''}: the emotional baseline is one of the main anchors for daily readings.`,
    majorClusters: selectedProfileClusters(natalChart),
    strengths: [
      `${sun?.sign ?? 'Sun'} identity and ${moon?.sign ?? 'Moon'} feeling give the profile its first axis.`,
      chartRuler ? `${natal.chartRuler} gives the chart a recurring way of translating experience.` : 'The planet placements can still be read without inventing angles.',
      'Daily readings should return to this baseline instead of rewriting it each day.',
    ],
    shadows: [
      'A rough local profile can sound schematic compared with the intended AI reading.',
      'Do not treat house or angle language as available if birth time is unknown.',
      'Daily weather should not replace the stable natal pattern.',
    ],
    howToUseDailyReadings: `Read Today as weather moving through this profile, not as a new identity each morning.`,
    chartReceipts: profileReceipts(natalChart),
  };
}

function selectedProfileClusters(natalChart = {}) {
  const bySign = new Map();
  for (const body of natalChart.bodies ?? []) {
    const key = body.sign ?? 'Unknown';
    bySign.set(key, [...(bySign.get(key) ?? []), body.body]);
  }
  const clusters = [...bySign.entries()]
    .filter(([, bodies]) => bodies.length >= 2)
    .map(([sign, bodies]) => `${bodies.join(', ')} in ${sign}`);
  return clusters.length
    ? clusters.join('; ')
    : 'No single sign cluster dominates the basic receipt table.';
}

function profileReceipts(natalChart = {}) {
  return [
    `Framework: ${natalChart.framework ?? 'true-sky sidereal'}`,
    natalChart.birthTimeKnown ? `House system: ${natalChart.houseSystem ?? 'unknown'}` : 'Birth time unknown: angles and houses are not interpreted',
    ...['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].map((name) => {
      const body = findBody(natalChart, name);
      return body ? `${name}: ${body.degree} degree ${body.sign}${body.house ? `, ${ordinal(body.house)} house` : ''}` : null;
    }).filter(Boolean),
  ];
}

function profileProviderPayload({ natalChart, user }) {
  return {
    requestKind: 'profile',
    schemaVersion: 1,
    promptVersion: PROFILE_PROMPT_VERSION,
    user: {
      displayName: user?.displayName || natalChart?.user?.name || 'you',
    },
    natal: natalSummary(natalChart),
  };
}

function profileSourceMetadata(mode) {
  return {
    label: mode === 'api-key' ? 'AI-written profile with your provider key' : 'AI-written profile',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'The natal chart is calculated locally first, then an AI provider writes the stable comprehensive profile from those receipts.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'MoonTurtle editorial synthesis',
      'AI language synthesis',
    ],
    caveat: 'This profile is interpretive and stable. It should not be regenerated just because the daily sky changed.',
  };
}

function profileFallbackSourceMetadata(reason = 'AI profile did not complete.') {
  return {
    label: 'Rough local profile fallback',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'This is a local fallback from natal chart receipts, not the full model-written profile.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'MoonTurtle local fallback',
    ],
    caveat: `${reason} MoonTurtle is showing a rough local profile so the natal receipts remain useful.`,
  };
}

function profileContentSignature(profile) {
  return stableHash({
    source: profile.source,
    profileSummary: profile.profileSummary,
    corePattern: profile.corePattern,
    natalMoon: profile.natalMoon,
    majorClusters: profile.majorClusters,
    chartReceipts: profile.chartReceipts,
  });
}

function finalizeProfileReading(profile, input, overrides = {}) {
  const engine = overrides.engine ?? engineForSettings(input.settings);
  const isFallback = Boolean(overrides.isFallback);
  const contentSignature = profile.contentSignature ?? profileContentSignature(profile);
  return {
    ...profile,
    profileId: profile.profileId ?? `profile:${input.user?.birthHash ?? 'unknown'}:${PROFILE_PROMPT_VERSION}:${contentSignature}`,
    contentSignature,
    promptVersion: profile.promptVersion ?? PROFILE_PROMPT_VERSION,
    generatedAt: profile.generatedAt ?? new Date().toISOString(),
    engine,
    engineLabel: isFallback ? 'Local deterministic fallback' : formatEngineLabel(engine),
    modelLabel: isFallback ? 'Local deterministic' : engine.modelLabel,
    isFallback,
    fallbackReason: overrides.fallbackReason ?? null,
    providerAttempted: overrides.providerAttempted ?? false,
    aiAttempt: overrides.aiAttempt ?? null,
    sourceDetail: overrides.sourceDetail ?? profile.sourceDetail,
  };
}

function fallbackProfileReading(local, input, { startedAt, code, message, detail, providerAttempted = true } = {}) {
  const engine = engineForSettings(input.settings);
  const reason = message ?? (providerAttempted ? 'AI profile did not complete.' : 'AI interpretation is disabled in Settings.');
  return finalizeProfileReading(local, input, {
    isFallback: true,
    fallbackReason: reason,
    providerAttempted,
    engine: {
      mode: 'local',
      provider: 'local',
      providerSurface: 'Local deterministic fallback',
      modelId: 'local-profile-engine',
      modelLabel: 'Local deterministic',
      reasoningEffort: null,
      displayName: 'Local deterministic fallback',
      attemptedEngine: engine,
      isLocal: true,
      isAi: false,
    },
    aiAttempt: aiAttempt({
      status: providerAttempted ? 'failed' : 'skipped',
      engine,
      startedAt,
      code,
      message: reason,
      detail,
    }),
    sourceDetail: profileFallbackSourceMetadata(reason),
  });
}

async function fetchAiPayload(payload, settings = {}, mode = aiMode(settings)) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), providerTimeoutMs(mode));
  const headers = { 'Content-Type': 'application/json' };
  const key = providerKey(settings);
  if (settings?.aiMode === 'api-key' && key) {
    headers['X-User-Provider-Key'] = key;
    headers['X-MoonTurtle-Provider'] = settings.apiProvider ?? 'openai';
  }
  try {
    const response = await fetch('/api/reading', {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        providerPreference: mode,
        providerOrder: mode === 'auto' ? ['codex'] : (settings?.localProviderOrder ?? ['codex']),
        requestedModel: settings?.model ?? 'gpt-5.5',
        reasoningEffort: settings?.reasoningEffort ?? 'xhigh',
      }),
    });
    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
      const error = errorPayload?.error ?? {};
      return {
        error: {
          code: error.code ?? `provider_http_${response.status}`,
          message: error.message ?? `AI provider returned ${response.status}.`,
          detail: error.detail,
        },
      };
    }
    return { remote: await response.json() };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function generateProfileReading(input) {
  const local = localProfileReading(input);
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  if (!shouldAttemptProvider(input.settings)) {
    return fallbackProfileReading(local, input, {
      startedAt,
      code: 'provider_not_attempted',
      message: mode === 'local' ? 'AI interpretation is disabled in Settings.' : 'No configured AI provider is available here.',
      providerAttempted: false,
    });
  }

  try {
    const { remote, error } = await fetchAiPayload(profileProviderPayload(input), input.settings, mode);
    if (error) {
      return fallbackProfileReading(local, input, {
        startedAt,
        code: error.code,
        message: error.message,
        detail: error.detail,
      });
    }
    if (!remote?.profileSummary || !remote?.corePattern) {
      return fallbackProfileReading(local, input, {
        startedAt,
        code: 'provider_invalid_schema',
        message: 'AI response did not match the profile schema.',
      });
    }
    const engine = engineFromRemote(remote, input.settings);
    return finalizeProfileReading({
      ...local,
      ...remote,
      source: remote.source ?? 'provider',
      sourceDetail: profileSourceMetadata(mode),
    }, input, {
      isFallback: false,
      providerAttempted: true,
      engine,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine,
        startedAt,
        code: 'provider_completed',
        message: 'AI profile completed and passed schema validation.',
      }),
    });
  } catch (error) {
    return fallbackProfileReading(local, input, {
      startedAt,
      code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
      message: error?.name === 'AbortError'
        ? 'The app stopped waiting before the AI bridge returned a profile.'
        : (error?.message ?? 'AI profile did not complete.'),
    });
  }
}

function askContext({ question, reading, profile, sky, signals, journal }) {
  return {
    requestKind: 'ask',
    schemaVersion: 1,
    question,
    today: reading ? {
      headline: reading.headline,
      summaryLine: reading.summaryLine,
      glanceItems: reading.glanceItems,
      fullReading: reading.fullReading ?? reading.body,
      loudestSignals: reading.loudestSignals,
      notice: reading.notice,
      release: reading.release,
      act: reading.act,
      engineLabel: reading.engineLabel,
      isFallback: reading.isFallback,
    } : null,
    profile: profile ? {
      profileSummary: profile.profileSummary,
      corePattern: profile.corePattern,
      natalMoon: profile.natalMoon,
      chartRuler: profile.chartRuler,
      majorClusters: profile.majorClusters,
      engineLabel: profile.engineLabel,
      isFallback: profile.isFallback,
    } : null,
    sky: sky ? {
      localDate: sky.localDate,
      lunar: sky.lunar,
      place: sky.place?.name,
      framework: sky.framework,
    } : null,
    signals: {
      topSignals: signals?.topSignals ?? [],
      activationSignals: signals?.activationSignals?.slice(0, 5) ?? [],
    },
    journal: (journal ?? []).slice(0, 8).map((entry) => ({
      dateKey: entry.dateKey,
      headline: entry.headline,
      phase: entry.phase,
      moonSign: entry.moonSign,
      isFallback: entry.isFallback,
      engineLabel: entry.engineLabel,
    })),
  };
}

function localAskAnswer(input, reason = 'AI chat is unavailable.') {
  const sources = [
    input.profile ? 'Profile' : null,
    input.reading ? 'Today' : null,
    input.sky ? 'Sky' : null,
    input.journal?.length ? 'Journal' : null,
  ].filter(Boolean);
  const top = input.reading?.summaryLine ?? input.reading?.headline;
  const profileLine = input.profile?.profileSummary;
  return {
    schemaVersion: 1,
    source: 'local-ask-fallback',
    generatedAt: new Date().toISOString(),
    answer: [
      `${reason} I can still answer from the saved MoonTurtle context, but this is a rough grounded fallback.`,
      top ? `Today: ${top}` : null,
      profileLine ? `Profile: ${profileLine}` : null,
      `For your question, the honest next step is to read the saved sources above and ask for the AI answer again when the engine is available.`,
    ].filter(Boolean).join(' '),
    sourceChips: sources.length ? sources : ['Local fallback'],
    followUps: [
      'Explain the loudest signal in plainer language.',
      'Compare today to my profile baseline.',
      'Show the receipts behind that answer.',
    ],
    isFallback: true,
    fallbackReason: reason,
  };
}

export async function generateAskAnswer(input) {
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  const engine = engineForSettings(input.settings);
  if (!input.question?.trim()) {
    return localAskAnswer(input, 'Ask needs a question first.');
  }
  if (!shouldAttemptProvider(input.settings)) {
    return {
      ...localAskAnswer(input, mode === 'local' ? 'AI chat is disabled in Settings.' : 'No configured AI provider is available here.'),
      engine,
      engineLabel: 'Local deterministic fallback',
      aiAttempt: aiAttempt({
        status: 'skipped',
        engine,
        startedAt,
        code: 'provider_not_attempted',
        message: mode === 'local' ? 'AI chat is disabled in Settings.' : 'No configured AI provider is available here.',
      }),
    };
  }
  try {
    const { remote, error } = await fetchAiPayload(askContext(input), input.settings, mode);
    if (error) {
      return {
        ...localAskAnswer(input, error.message),
        engine: {
          mode: 'local',
          provider: 'local',
          providerSurface: 'Local deterministic fallback',
          modelId: 'local-ask-engine',
          modelLabel: 'Local deterministic',
          displayName: 'Local deterministic fallback',
          attemptedEngine: engine,
          isAi: false,
        },
        engineLabel: 'Local deterministic fallback',
        aiAttempt: aiAttempt({
          status: 'failed',
          engine,
          startedAt,
          code: error.code,
          message: error.message,
          detail: error.detail,
        }),
      };
    }
    if (!remote?.answer) {
      return localAskAnswer(input, 'AI response did not match the Ask schema.');
    }
    const remoteEngine = engineFromRemote(remote, input.settings);
    return {
      ...remote,
      source: remote.source ?? 'provider',
      generatedAt: remote.generatedAt ?? new Date().toISOString(),
      sourceChips: remote.sourceChips?.length ? remote.sourceChips : ['Profile', 'Today', 'Sky'].filter((chip) => (
        chip !== 'Profile' || input.profile
      )),
      engine: remoteEngine,
      engineLabel: formatEngineLabel(remoteEngine),
      isFallback: false,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine: remoteEngine,
        startedAt,
        code: 'provider_completed',
        message: 'AI answer completed from grounded MoonTurtle context.',
      }),
    };
  } catch (error) {
    return {
      ...localAskAnswer(input, error?.name === 'AbortError' ? 'The AI bridge timed out before Ask returned.' : (error?.message ?? 'AI chat did not complete.')),
      engineLabel: 'Local deterministic fallback',
      aiAttempt: aiAttempt({
        status: 'failed',
        engine,
        startedAt,
        code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
        message: error?.name === 'AbortError' ? 'The AI bridge timed out before Ask returned.' : (error?.message ?? 'AI chat did not complete.'),
      }),
    };
  }
}

export async function generateReading(input) {
  const local = generateLocalReading(input);
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  if (!shouldAttemptProvider(input.settings)) {
    return fallbackReading(local, input, {
      startedAt,
      code: 'provider_not_attempted',
      message: mode === 'local' ? 'AI interpretation is disabled in Settings.' : 'No configured AI provider is available here.',
      providerAttempted: false,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), providerTimeoutMs(mode));
    const headers = { 'Content-Type': 'application/json' };
    const key = providerKey(input.settings);
    if (input.settings?.aiMode === 'api-key' && key) {
      headers['X-User-Provider-Key'] = key;
      headers['X-MoonTurtle-Provider'] = input.settings.apiProvider ?? 'openai';
    }

    let response;
    try {
      response = await fetch('/api/reading', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          ...providerPayload(input),
          providerPreference: mode,
          providerOrder: mode === 'auto' ? ['codex'] : (input.settings?.localProviderOrder ?? ['codex']),
          requestedModel: input.settings?.model ?? 'gpt-5.5',
          reasoningEffort: input.settings?.reasoningEffort ?? 'xhigh',
        }),
      });
    } finally {
      globalThis.clearTimeout(timeout);
    }
    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
      const error = errorPayload?.error ?? {};
      return fallbackReading(local, input, {
        startedAt,
        code: error.code ?? `provider_http_${response.status}`,
        message: error.message ?? `AI provider returned ${response.status}.`,
        detail: error.detail,
      });
    }
    const remote = normalizeReadingShape(await response.json());
    const validation = validateReadingProse(remote);
    if (!validation.ok) {
      recordReadingValidationEvent({
        input,
        code: validation.errors.some((error) => error.includes('Forbidden phrase'))
          ? 'voice_validation_failed'
          : 'reading_schema_invalid',
        errors: validation.errors,
      });
      return fallbackReading(local, input, {
        startedAt,
        code: validation.errors.some((error) => error.includes('Forbidden phrase'))
          ? 'voice_validation_failed'
          : 'reading_schema_invalid',
        message: 'AI response did not match the MoonTurtle reading contract.',
        detail: validation.errors,
      });
    }
    const engine = engineFromRemote(validation.normalized, input.settings);
    const finalized = finalizeReading({
      ...local,
      ...validation.normalized,
      source: validation.normalized.source ?? 'provider',
      sourceDetail: providerSourceMetadata(mode),
    }, input, {
      isFallback: false,
      providerAttempted: true,
      engine,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine,
        startedAt,
        code: 'provider_completed',
        message: 'AI interpretation completed and passed schema validation.',
      }),
    });
    recordAiCalibration({ input, reading: finalized, engine });
    return finalized;
  } catch (error) {
    return fallbackReading(local, input, {
      startedAt,
      code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
      message: error?.name === 'AbortError'
        ? 'The app stopped waiting before the AI bridge returned a reading.'
        : (error?.message ?? 'AI interpretation did not complete.'),
    });
  }
}
