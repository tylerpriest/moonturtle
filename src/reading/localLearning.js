import { readingHashes, stableHash, validateReadingProse } from './validation.js';

const PREFIX = 'mt:v1:';
const MAX_CALIBRATION_EXAMPLES = 40;

function canStore() {
  return typeof window !== 'undefined' && window.localStorage;
}

function readJson(key, fallback = null) {
  if (!canStore()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!canStore()) return value;
  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

function calibrationKey(birthHash) {
  return `${PREFIX}ai-calibration:${birthHash ?? 'unknown'}`;
}

function wordCount(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function paragraphCount(value) {
  return String(value ?? '').trim().split(/\n{2,}/).filter(Boolean).length;
}

function compactPhrases(reading = {}) {
  return [
    reading.headline,
    reading.summaryLine,
    reading.release,
    reading.act,
  ].filter(Boolean).slice(0, 4);
}

function signalSnapshot(signals = {}) {
  return (signals.topSignals?.length ? signals.topSignals : signals.activationSignals ?? [])
    .slice(0, 3)
    .map((signal) => ({
      id: signal.id,
      title: signal.title,
      transitingBody: signal.transitingBody,
      natalTarget: signal.natalTarget,
      aspect: signal.aspect,
      orb: signal.orb,
      score: signal.score,
    }));
}

export function recordAiCalibration({ input, reading, engine } = {}) {
  if (!canStore() || !input?.user?.birthHash || !reading || reading.isFallback) return null;
  const validation = validateReadingProse(reading);
  const hashes = readingHashes(input);
  const example = {
    schemaVersion: 1,
    id: stableHash({
      readingId: reading.readingId,
      generatedAt: reading.generatedAt,
      chartHash: hashes.chartHash,
      skyHash: hashes.skyHash,
      signalsHash: hashes.signalsHash,
    }),
    capturedAt: new Date().toISOString(),
    promptVersion: reading.promptVersion,
    chartHash: hashes.chartHash,
    skyHash: hashes.skyHash,
    signalsHash: hashes.signalsHash,
    engine: {
      provider: engine?.provider,
      modelId: engine?.modelId,
      reasoningEffort: engine?.reasoningEffort ?? null,
    },
    dominantSignals: signalSnapshot(input.signals),
    qualityMarkers: {
      validationOk: validation.ok,
      headlineWords: wordCount(reading.headline),
      bodyWords: wordCount(reading.body),
      fullReadingWords: wordCount(reading.fullReading),
      fullReadingParagraphs: paragraphCount(reading.fullReading),
      activationCount: reading.activations?.length ?? 0,
      noticeCount: reading.notice?.length ?? 0,
      avoidCount: reading.avoid?.length ?? 0,
    },
    phrasePatterns: compactPhrases(reading),
  };

  const key = calibrationKey(input.user.birthHash);
  const stored = readJson(key, { schemaVersion: 1, examples: [], validationEvents: [] });
  const examples = [example, ...(stored.examples ?? []).filter((item) => item.id !== example.id)]
    .slice(0, MAX_CALIBRATION_EXAMPLES);
  return writeJson(key, {
    schemaVersion: 1,
    examples,
    validationEvents: stored.validationEvents ?? [],
    updatedAt: new Date().toISOString(),
  });
}

export function recordReadingValidationEvent({ input, code, errors = [] } = {}) {
  if (!canStore() || !input?.user?.birthHash) return null;
  const hashes = readingHashes(input);
  const key = calibrationKey(input.user.birthHash);
  const stored = readJson(key, { schemaVersion: 1, examples: [], validationEvents: [] });
  const event = {
    schemaVersion: 1,
    id: stableHash({
      code,
      errors,
      chartHash: hashes.chartHash,
      skyHash: hashes.skyHash,
      signalsHash: hashes.signalsHash,
      at: Date.now(),
    }),
    capturedAt: new Date().toISOString(),
    code,
    errors: errors.slice(0, 8),
    chartHash: hashes.chartHash,
    skyHash: hashes.skyHash,
    signalsHash: hashes.signalsHash,
    dominantSignals: signalSnapshot(input.signals),
  };
  return writeJson(key, {
    schemaVersion: 1,
    examples: stored.examples ?? [],
    validationEvents: [event, ...(stored.validationEvents ?? [])].slice(0, MAX_CALIBRATION_EXAMPLES),
    updatedAt: new Date().toISOString(),
  });
}
