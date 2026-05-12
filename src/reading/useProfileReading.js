import { useEffect, useMemo, useState } from 'react';
import { getCachedProfileReading, setCachedProfileReading } from './cache.js';
import { aiMode, generateProfileReading, PROFILE_PROMPT_VERSION } from './generate.js';
import { SOURCE_METADATA_VERSION } from './lexicon/index.js';

function cacheModeFor(settings) {
  const mode = aiMode(settings);
  const model = settings.model?.trim() || 'gpt-5.5';
  const reasoning = settings.reasoningEffort?.trim() || 'xhigh';
  if (mode === 'auto' || mode === 'codex') return `${mode}:${model}:${reasoning}`;
  if (mode === 'claude') return mode;
  if (mode !== 'api-key') return mode;
  const provider = settings.apiProvider ?? 'openai';
  const key = settings.apiKeys?.[provider]?.trim() || settings.apiKey?.trim();
  return key
    ? `api-key:${provider}:${model}:${reasoning}:configured`
    : `api-key:${provider}:${model}:${reasoning}:empty`;
}

function cachedProfileIsCurrent(profile) {
  return (
    profile?.promptVersion === PROFILE_PROMPT_VERSION
    && profile?.sourceDetail?.metadataVersion === SOURCE_METADATA_VERSION
    && Boolean(profile?.profileId)
    && typeof profile?.isFallback === 'boolean'
  );
}

function loadingStatus(step) {
  const copy = {
    natal: ['Calculating locally', 'Reading natal receipts'],
    cache: ['Receipts ready', 'Checking saved profile'],
    interpretation: ['Waiting for AI profile', 'Writing the comprehensive profile from natal receipts'],
    validating: ['Validating response', 'Checking profile schema and source metadata'],
    saved: ['Saved', 'Profile saved on this device'],
  }[step] ?? ['Profile', 'Preparing profile'];
  return {
    step,
    statusLabel: copy[0],
    detail: copy[1],
    startedAt: Date.now(),
  };
}

export function useProfileReading(user, settings, enabled = false) {
  const [runRequest, setRunRequest] = useState({ id: 0, bypassCache: false });
  const [state, setState] = useState({
    status: enabled ? 'loading' : 'idle',
    error: null,
    natal: null,
    profile: null,
    fromCache: false,
    loading: null,
  });

  const key = useMemo(() => {
    if (!user?.birthHash) return null;
    return {
      birthHash: user.birthHash,
      cacheMode: cacheModeFor(settings),
    };
  }, [settings, user]);

  useEffect(() => {
    let alive = true;
    if (!enabled || !user || !key) {
      setState((prev) => ({ ...prev, status: enabled ? 'idle' : prev.status, loading: null }));
      return undefined;
    }

    async function run() {
      const setLoading = (step) => {
        if (!alive) return;
        setState((prev) => ({
          ...prev,
          status: 'loading',
          error: null,
          loading: loadingStatus(step),
        }));
      };

      try {
        setLoading('natal');
        const { computeNatal } = await import('../domain/astronomy.js');
        const natal = computeNatal(user);

        setLoading('cache');
        const cached = getCachedProfileReading(key.birthHash, PROFILE_PROMPT_VERSION, key.cacheMode);
        if (!runRequest.bypassCache && cachedProfileIsCurrent(cached)) {
          if (!alive) return;
          setState({
            status: 'ready',
            error: null,
            natal,
            profile: cached,
            fromCache: true,
            loading: null,
          });
          return;
        }

        setLoading('interpretation');
        const profile = await generateProfileReading({ user, natalChart: natal, settings });
        setLoading('validating');
        if (!profile.isFallback || key.cacheMode === 'local') {
          setCachedProfileReading(key.birthHash, PROFILE_PROMPT_VERSION, profile, key.cacheMode);
        }
        setLoading('saved');

        if (!alive) return;
        setState({
          status: 'ready',
          error: null,
          natal,
          profile,
          fromCache: false,
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
  }, [enabled, key, runRequest, settings, user]);

  return {
    ...state,
    refresh: () => setRunRequest((prev) => ({ id: prev.id + 1, bypassCache: true })),
  };
}
