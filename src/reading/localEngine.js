import { normalizeReadingShape } from './validation.js';
import { readingSourceMetadata, SOURCE_METADATA_VERSION } from './lexicon/index.js';
import {
  buildAct,
  buildActivations,
  buildAvoid,
  buildBody,
  buildFullReading,
  buildGlanceItems,
  buildHeadline,
  buildLoudestSignals,
  buildLunarAxis,
  buildNotice,
  buildReceipts,
  buildRelease,
  buildSummaryLine,
} from './localVoice.js';

export const LOCAL_ENGINE_ID = 'moonturtle-local-engine-v1';
export const LOCAL_ENGINE_LABEL = 'Local MoonTurtle engine';
export const LOCAL_ENGINE_SOURCE = 'local-moonturtle-engine';

export function localEngineMeta(attemptedEngine = null) {
  return {
    mode: 'local',
    provider: 'local',
    providerSurface: LOCAL_ENGINE_LABEL,
    modelId: LOCAL_ENGINE_ID,
    modelLabel: LOCAL_ENGINE_LABEL,
    reasoningEffort: null,
    displayName: LOCAL_ENGINE_LABEL,
    attemptedEngine,
    isLocal: true,
    isAi: false,
  };
}

export function localEngineSourceMetadata({ currentSky, signals, reason } = {}) {
  const base = readingSourceMetadata({ currentSky, signals });
  return {
    ...base,
    label: 'MoonTurtle local synthesis',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'A deterministic MoonTurtle reading assembled on device from calculated chart receipts, ranked signals, authored symbolic rules, and local prose blueprints.',
    systems: [
      ...new Set([
        ...(base.systems ?? []),
        'MoonTurtle local synthesis',
      ]),
    ],
    caveat: reason
      ? `${reason} The local engine is useful interpretation from calculated receipts, not a replacement for the fuller AI reading.`
      : 'The local engine is useful interpretation from calculated receipts. The fuller AI reading remains the primary writer when available.',
  };
}

export function generateLocalReading(input) {
  const { currentSky, signals } = input;
  return normalizeReadingShape({
    schemaVersion: 2,
    source: LOCAL_ENGINE_SOURCE,
    sourceDetail: localEngineSourceMetadata({ currentSky, signals }),
    generatedAt: new Date().toISOString(),
    dateKey: currentSky.localDateKey,
    headline: buildHeadline(input),
    body: buildBody(input),
    summaryLine: buildSummaryLine(input),
    glanceItems: buildGlanceItems(input),
    loudestSignals: buildLoudestSignals(signals),
    fullReading: buildFullReading(input),
    release: buildRelease(input),
    act: buildAct(input),
    lunarAxis: buildLunarAxis(input),
    activations: buildActivations(input),
    receipts: buildReceipts(input),
    notice: buildNotice(input),
    avoid: buildAvoid(input),
  });
}
