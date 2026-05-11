import { useEffect, useMemo, useState } from 'react';
import { getJournal } from './cache.js';
import { appendJournalEntry, getCachedReading, setCachedReading } from './cache.js';
import { aiMode, generateReading } from './generate.js';
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
    dateKey: sky.localDateKey,
    localDate: sky.localDate,
    headline: reading.headline,
    phase: sky.lunar.phase,
    illumination: sky.lunar.illumination,
    waxing: sky.lunar.waxing,
    moonSign: sky.lunar.moonSign,
    source: reading.source,
    birthHash: user.birthHash,
  };
}

function cachedReadingIsCurrent(reading) {
  return reading?.sourceDetail?.metadataVersion === SOURCE_METADATA_VERSION;
}

function loadingState(step, startedAt) {
  const stages = {
    sky: {
      index: 1,
      title: 'Calculating the sky',
      detail: 'Finding today’s Moon, phase, illumination, and local sky.',
    },
    natal: {
      index: 2,
      title: 'Checking your natal chart',
      detail: 'Mapping the chart into MoonTurtle’s true-sky framework.',
    },
    signals: {
      index: 3,
      title: 'Choosing the loudest signals',
      detail: 'Ranking today’s strongest contacts to your chart.',
    },
    cache: {
      index: 4,
      title: 'Checking today’s reading',
      detail: 'Looking for a saved reading for this mode.',
    },
    writing: {
      index: 5,
      title: 'Writing the reading',
      detail: 'Composing the reading from the sky receipts.',
    },
  };

  return {
    step,
    total: 5,
    startedAt,
    ...stages[step],
  };
}

export function useReading(user, settings) {
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
        setState((prev) => ({
          ...prev,
          status: 'calculating',
          error: null,
          loading: loadingState(step, startedAt),
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
        setLoading('cache');
        const cached = getCachedReading(user.birthHash, sky.localDateKey, cacheMode);

        if (cached && cachedReadingIsCurrent(cached)) {
          if (!alive) return;
          setState({
            status: 'ready',
            error: null,
            natal,
            sky,
            signals,
            reading: cached,
            fromCache: true,
            journal,
            loading: null,
          });
          return;
        }

        setLoading('writing');
        const reading = await generateReading({ user, natalChart: natal, currentSky: sky, signals, settings });
        setCachedReading(user.birthHash, sky.localDateKey, reading, cacheMode);
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
        });
      } catch (error) {
        if (!alive) return;
        setState((prev) => ({
          ...prev,
          status: 'error',
          error,
          loading: null,
        }));
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [computeInput, user]);

  return state;
}
