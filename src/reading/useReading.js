import { useEffect, useMemo, useState } from 'react';
import { getJournal } from './cache.js';
import { appendJournalEntry, getCachedReading, setArchivedReading, setCachedReading } from './cache.js';
import { aiMode, engineForSettings, formatEngineLabel, generateReading } from './generate.js';
import { SOURCE_METADATA_VERSION } from './lexicon/index.js';

function placeFor(user) {
  return user.currentPlace?.place ?? user.birth.place;
}

function timeZoneFor(user) {
  return user.currentPlace?.timeZone ?? user.birth.timeZone;
}

function cacheModeFor(settings) {
  const mode = aiMode(settings);
  if (mode !== 'api-key') return mode;
  return settings?.apiKey?.trim()
    ? `api-key:${settings.apiProvider ?? 'anthropic'}:configured`
    : `api-key:${settings.apiProvider ?? 'anthropic'}:empty`;
}

function buildJournalEntry(user, sky, reading) {
  return {
    readingId: reading.readingId,
    dateKey: sky.localDateKey,
    localDate: sky.localDate,
    headline: reading.headline,
    phase: sky.lunar.phase,
    illumination: sky.lunar.illumination,
    waxing: sky.lunar.waxing,
    moonSign: sky.lunar.moonSign,
    source: reading.source,
    sourceLabel: reading.sourceDetail?.label,
    readingMode: reading.readingMode ?? 'quick-glance',
    modeLabel: reading.modeLabel ?? 'Quick glance',
    engine: reading.engine,
    engineLabel: reading.engineLabel,
    modelLabel: reading.modelLabel,
    isFallback: Boolean(reading.isFallback),
    preferred: !reading.isFallback,
    fallbackReason: reading.fallbackReason,
    aiAttempt: reading.aiAttempt,
    generatedAt: reading.generatedAt,
    archived: true,
    birthHash: user.birthHash,
  };
}

function cachedReadingIsCurrent(reading) {
  return (
    reading?.sourceDetail?.metadataVersion === SOURCE_METADATA_VERSION
    && Boolean(reading?.readingId)
    && Boolean(reading?.engine)
    && typeof reading?.isFallback === 'boolean'
  );
}

function loadingState(step, startedAt, settings) {
  const engine = engineForSettings(settings);
  const modelLabel = engine.modelLabel ?? 'GPT-5.5';
  const stages = {
    sky: {
      index: 1,
      statusLabel: 'Calculating locally',
      title: 'Calculating the sky',
      detail: 'Finding today’s Moon, phase, illumination, and local sky.',
    },
    natal: {
      index: 2,
      statusLabel: 'Calculating locally',
      title: 'Checking your natal chart',
      detail: 'Mapping the chart into MoonTurtle’s true-sky framework.',
    },
    signals: {
      index: 3,
      statusLabel: 'Calculating locally',
      title: 'Choosing the loudest signals',
      detail: 'Ranking today’s strongest contacts to your chart.',
    },
    receipts: {
      index: 4,
      statusLabel: 'Receipts ready',
      title: 'Receipts ready',
      detail: 'The sky, natal chart, houses, and loudest signals are ready.',
    },
    interpretation: {
      index: 5,
      statusLabel: engine.isAi ? `Waiting for ${modelLabel}` : 'Fallback shown',
      title: engine.isAi ? `${modelLabel} is thinking` : 'Preparing local fallback',
      detail: engine.isAi
        ? `${modelLabel} is writing from your chart receipts.`
        : 'AI is off, so MoonTurtle is using the rough local interpretation.',
    },
    validating: {
      index: 6,
      statusLabel: 'Validating response',
      title: 'Validating the reading',
      detail: 'Checking the response shape, source metadata, and fallback status.',
    },
    saving: {
      index: 7,
      statusLabel: 'Saved',
      title: 'Saving the reading',
      detail: 'Storing this reading variant in the journal.',
    },
  };

  return {
    step,
    total: 7,
    startedAt,
    engine,
    engineLabel: formatEngineLabel(engine),
    ...stages[step],
  };
}

export function useReading(user, settings) {
  const [runRequest, setRunRequest] = useState({ id: 0, bypassCache: false });
  const [state, setState] = useState({
    status: user ? 'calculating' : 'idle',
    error: null,
    natal: null,
    sky: null,
    signals: null,
    reading: null,
    fromCache: false,
    journal: [],
    loading: null,
    interpretationStatus: null,
  });

  const computeInput = useMemo(() => {
    if (!user) return null;
    return {
      birthHash: user.birthHash,
      place: placeFor(user),
      timeZone: timeZoneFor(user),
      aiMode: cacheModeFor(settings),
    };
  }, [settings, user]);

  useEffect(() => {
    let alive = true;
    if (!user || !computeInput) {
      setState((prev) => ({ ...prev, status: 'idle' }));
      return undefined;
    }

    async function run() {
      const startedAt = Date.now();
      const setLoading = (step) => {
        if (!alive) return;
        const loading = loadingState(step, startedAt, settings);
        setState((prev) => ({
          ...prev,
          status: 'calculating',
          error: null,
          loading,
          interpretationStatus: loading,
        }));
      };

      setLoading('sky');
      try {
        const [{ computeNatal, computeSky }, { rankSignals }] = await Promise.all([
          import('../domain/astronomy.js'),
          import('../domain/signals.js'),
        ]);
        setLoading('natal');
        const natal = computeNatal(user);
        const sky = computeSky({ place: computeInput.place, timeZone: computeInput.timeZone });
        setLoading('signals');
        const signals = rankSignals(natal, sky);
        const journal = getJournal(user.birthHash);
        const cacheMode = computeInput.aiMode;
        setLoading('receipts');
        const cached = getCachedReading(user.birthHash, sky.localDateKey, cacheMode);

        if (!runRequest.bypassCache && cached && cachedReadingIsCurrent(cached)) {
          if (!alive) return;
          const interpretationStatus = cached.isFallback
            ? {
                statusLabel: 'Fallback shown',
                detail: cached.fallbackReason ?? 'Local deterministic fallback is being shown.',
                engine: cached.engine,
                engineLabel: cached.engineLabel,
              }
            : {
                statusLabel: 'Saved',
                detail: 'Reading loaded from today’s saved variant.',
                engine: cached.engine,
                engineLabel: cached.engineLabel,
              };
          setState({
            status: 'ready',
            error: null,
            natal,
            sky,
            signals,
            reading: cached,
            fromCache: true,
            journal: journal.map((entry) => (
              entry.readingId === cached.readingId ? { ...entry, archived: true } : entry
            )),
            loading: null,
            interpretationStatus,
          });
          setArchivedReading(user.birthHash, cached);
          return;
        }

        setLoading('interpretation');
        const reading = await generateReading({ user, natalChart: natal, currentSky: sky, signals, settings });
        setLoading('validating');
        if (!reading.isFallback || cacheMode === 'local') {
          setCachedReading(user.birthHash, sky.localDateKey, reading, cacheMode);
        }
        setArchivedReading(user.birthHash, reading);
        setLoading('saving');
        const nextJournal = appendJournalEntry(user.birthHash, buildJournalEntry(user, sky, reading));

        if (!alive) return;
        setState({
          status: 'ready',
          error: null,
          natal,
          sky,
          signals,
          reading,
          fromCache: false,
          journal: nextJournal,
          loading: null,
          interpretationStatus: reading.isFallback
            ? {
                statusLabel: 'Fallback shown',
                detail: reading.fallbackReason ?? 'AI interpretation did not complete. Local fallback is displayed.',
                engine: reading.engine,
                engineLabel: reading.engineLabel,
              }
            : {
                statusLabel: 'Saved',
                detail: 'AI reading completed, validated, and saved to the journal.',
                engine: reading.engine,
                engineLabel: reading.engineLabel,
              },
        });
      } catch (error) {
        if (!alive) return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          error,
          loading: null,
          interpretationStatus: {
            statusLabel: 'Fallback shown',
            detail: error?.message ?? 'The reading pipeline stopped before a fallback could be built.',
            engine: engineForSettings(settings),
            engineLabel: formatEngineLabel(engineForSettings(settings)),
          },
        }));
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [computeInput, runRequest, settings, user]);

  function refresh() {
    setRunRequest((prev) => ({ id: prev.id + 1, bypassCache: true }));
  }

  return { ...state, refresh };
}
