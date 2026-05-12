import { useEffect, useState } from 'react';
import { SYMBOLIC_LEXICON } from '../../reading/lexicon/index.js';
import { engineForSettings, formatEngineLabel } from '../../reading/generate.js';

function MethodSection({ num, title, body }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'40px 1fr', gap:16, marginBottom:22}}>
      <div style={{fontFamily:'var(--serif-sc)', fontSize:14, color:'var(--terracotta)', letterSpacing:'0.16em', paddingTop:3}}>
        {num}
      </div>
      <div>
        <div className="h-card" style={{marginBottom:6}}>{title}</div>
        <p className="body-prose" style={{fontSize:15}}>{body}</p>
      </div>
    </div>
  );
}

function SymbolicSources() {
  const systems = Object.values(SYMBOLIC_LEXICON.systems);
  return (
    <div className="card" style={{padding:'20px 20px 18px'}}>
      <div className="section-label">Interpretive Sources</div>
      <h2 className="h-card" style={{fontSize:19, marginBottom:6}}>The lexicon is named.</h2>
      <p className="body-prose" style={{fontSize:15, marginBottom:14}}>
        Local readings use MoonTurtle's built-in symbolic lexicon. The sky positions are calculated; the meanings are authored from the systems below, and the app names them instead of treating them as objective fact.
      </p>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {systems.map((system) => (
          <div key={system.label} style={{borderTop:'1px solid var(--hairline)', paddingTop:10}}>
            <div className="h-card" style={{fontSize:16}}>{system.label}</div>
            <p className="meta" style={{marginTop:3, lineHeight:1.45, letterSpacing:'0.03em'}}>
              {system.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const AI_OPTIONS = [
  {
    id: 'auto',
    label: 'Auto',
    title: 'Codex first',
    body: 'Uses your local Codex login first. The quality selector below controls which Codex model and reasoning level are used.',
  },
  {
    id: 'codex',
    label: 'Codex',
    title: 'Codex only',
    body: 'Use your logged-in Codex CLI for localhost readings. The quality selector below controls model and reasoning.',
  },
  {
    id: 'claude',
    label: 'Claude',
    title: 'Claude only',
    body: 'Use your logged-in Claude Code CLI for localhost readings.',
  },
  {
    id: 'api-key',
    label: 'API key',
    title: 'Saved API key',
    body: 'Use the selected saved API key for readings only when this engine is chosen.',
  },
  {
    id: 'local',
    label: 'Local',
    title: 'No AI',
    body: 'Use the built-in symbolic engine only. This is clearly marked as a rough local fallback.',
  },
];

const CODEX_QUALITY_OPTIONS = [
  {
    id: 'best',
    label: 'Best',
    title: 'GPT-5.5 · xhigh',
    model: 'gpt-5.5',
    reasoningEffort: 'xhigh',
    body: 'Slowest, closest to the intended MoonTurtle voice.',
  },
  {
    id: 'strong',
    label: 'Strong',
    title: 'GPT-5.5 · high',
    model: 'gpt-5.5',
    reasoningEffort: 'high',
    body: 'Same model, less reasoning time. Good first reliability test.',
  },
  {
    id: 'steady',
    label: 'Steady',
    title: 'GPT-5.4 · high',
    model: 'gpt-5.4',
    reasoningEffort: 'high',
    body: 'Often a better speed/quality balance if 5.5 times out.',
  },
  {
    id: 'fast',
    label: 'Fast',
    title: 'GPT-5.4 mini · low',
    model: 'gpt-5.4-mini',
    reasoningEffort: 'low',
    body: 'Fastest working test path. Useful for debugging and quick drafts.',
  },
];

function selectedCodexQuality(settings = {}) {
  const model = settings.model ?? 'gpt-5.5';
  const reasoningEffort = settings.reasoningEffort ?? 'xhigh';
  return CODEX_QUALITY_OPTIONS.find((option) => (
    option.model === model && option.reasoningEffort === reasoningEffort
  ))?.id ?? 'custom';
}

function CodexQualityChoice({ settings, onSettingsChange }) {
  const selectedId = selectedCodexQuality(settings);
  return (
    <div style={{marginTop:16, padding:'14px', border:'1px solid var(--hairline)', background:'rgba(253,248,236,0.68)'}}>
      <div className="eyebrow">Codex quality</div>
      <p className="meta" style={{marginTop:6, marginBottom:12, lineHeight:1.45}}>
        Changes model and reasoning only. It does not change the selected engine, so you can test why one setting times out and another finishes.
      </p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
        {CODEX_QUALITY_OPTIONS.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSettingsChange({ model: option.model, reasoningEffort: option.reasoningEffort })}
              style={{
                border:selected ? '1px solid var(--terracotta)' : '1px solid var(--hairline)',
                background:selected ? 'rgba(176,74,38,0.08)' : 'var(--paper)',
                color:'var(--ink)',
                padding:'10px 10px',
                minHeight:96,
                textAlign:'left',
                cursor:'pointer',
              }}
            >
              <span className="eyebrow" style={{color:selected ? 'var(--terracotta)' : 'var(--ink-mute)'}}>{option.label}</span>
              <span style={{display:'block', fontFamily:'var(--serif)', fontSize:15, fontStyle:'italic', color:'var(--ink)', marginTop:4}}>
                {option.title}
              </span>
              <span className="meta" style={{display:'block', marginTop:6, lineHeight:1.35, letterSpacing:'0.03em'}}>
                {option.body}
              </span>
            </button>
          );
        })}
      </div>
      {selectedId === 'custom' && (
        <p className="meta" style={{marginTop:10, lineHeight:1.45}}>
          Custom setting in use: {settings?.model ?? 'gpt-5.5'} · {settings?.reasoningEffort ?? 'xhigh'} reasoning.
        </p>
      )}
    </div>
  );
}

function sourceLabel(reading) {
  const source = reading?.source;
  const providerAttempted = reading?.providerAttempted;
  if (reading?.isFallback) return 'Rough local fallback';
  if (source === 'local-codex-subscription') return 'Codex subscription';
  if (source === 'local-claude-subscription') return 'Claude subscription';
  if (source === 'user-openai-key') return 'Your OpenAI API key';
  if (source === 'user-anthropic-key') return 'Your Anthropic API key';
  if (source === 'anthropic-provider') return 'Hosted Claude API';
  if (providerAttempted) return 'Local symbolic fallback';
  return 'Local symbolic engine';
}

function useElapsedSeconds(startedAt, active) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, startedAt]);

  if (!active || !startedAt) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${Math.round(ms / 1000)}s`;
}

function failureStage(code) {
  if (code === 'local_provider_timeout') return 'Codex bridge';
  if (code === 'provider_timeout') return 'Browser wait';
  if (code === 'provider_invalid_schema') return 'Schema validation';
  if (code === 'provider_not_attempted') return 'Provider selection';
  if (code === 'api_key_provider_error') return 'API provider';
  if (String(code ?? '').startsWith('provider_http_')) return 'Provider HTTP response';
  return 'AI interpretation';
}

function EngineStatus({ settings, state }) {
  const loading = state?.loading;
  const configuredEngine = engineForSettings(settings);
  const reading = state?.reading;
  const activeEngine = loading?.engine ?? reading?.engine ?? configuredEngine;
  const elapsed = useElapsedSeconds(loading?.startedAt, Boolean(loading));
  const statusLabel = loading?.statusLabel
    ?? state?.interpretationStatus?.statusLabel
    ?? (reading?.isFallback ? 'Fallback shown' : 'Saved');
  const detail = loading?.detail
    ?? state?.interpretationStatus?.detail
    ?? reading?.aiAttempt?.message
    ?? 'The next reading will use the selected engine after local receipts are ready.';
  const failedAttempt = !loading && reading?.aiAttempt?.status === 'failed' ? reading.aiAttempt : null;
  const failedDuration = formatDuration(failedAttempt?.durationMs);

  return (
    <div className={`status-surface ${!loading && reading?.isFallback ? 'is-fallback' : ''}`} style={{marginTop:16}}>
      <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start'}}>
        <div>
          <div className="eyebrow">Interpretation status</div>
          <div className="status-title">{statusLabel}</div>
        </div>
        <div className="status-pill">{loading ? `${elapsed}s` : (state?.fromCache ? 'Saved' : 'Current')}</div>
      </div>
      <div style={{marginTop:10}}>
        <div className="eyebrow">{loading ? 'Currently writing with' : (reading ? 'Last reading used' : 'Next reading will use')}</div>
        <div className="status-engine">{formatEngineLabel(activeEngine)}</div>
      </div>
      {(reading || loading) && (
        <div style={{marginTop:10, paddingTop:10, borderTop:'1px solid var(--hairline)'}}>
          <div className="eyebrow">Next reading will use</div>
          <div className="status-engine">{formatEngineLabel(configuredEngine)}</div>
        </div>
      )}
      <p className="meta" style={{marginTop:8, lineHeight:1.45, letterSpacing:'0.03em'}}>
        {detail}
      </p>
      {reading?.aiAttempt?.detail?.length > 0 && (
        <p className="meta" style={{marginTop:8, lineHeight:1.45, letterSpacing:'0.03em'}}>
          Last provider detail: {reading.aiAttempt.detail.join(' | ')}
        </p>
      )}
      {failedAttempt && (
        <div style={{marginTop:10, paddingTop:10, borderTop:'1px solid rgba(176,74,38,0.28)'}}>
          <div className="eyebrow" style={{color:'var(--terracotta)'}}>Failure point</div>
          <p className="meta" style={{marginTop:6, lineHeight:1.45, letterSpacing:'0.03em'}}>
            Stage: {failureStage(failedAttempt.code)} · Code: {failedAttempt.code ?? 'unknown'}{failedDuration ? ` · Waited ${failedDuration}` : ''}
          </p>
        </div>
      )}
    </div>
  );
}

const PROVIDER_KEYS = [
  {
    id: 'openai',
    label: 'OpenAI API key',
    placeholder: 'sk-proj-...',
  },
  {
    id: 'anthropic',
    label: 'Anthropic API key',
    placeholder: 'sk-ant-...',
  },
];

function apiKeysFor(settings = {}) {
  return {
    openai: '',
    anthropic: '',
    ...(settings.apiKeys ?? {}),
  };
}

function ProviderKeys({ settings, onSettingsChange }) {
  const keys = apiKeysFor(settings);

  function updateKey(provider, value) {
    onSettingsChange({
      apiKeys: {
        ...keys,
        [provider]: value,
      },
    });
  }

  return (
    <div style={{marginTop:16, padding:'14px', border:'1px solid var(--hairline)', background:'rgba(253,248,236,0.68)'}}>
      <div className="eyebrow">Provider keys</div>
      <p className="meta" style={{marginTop:6, marginBottom:12, lineHeight:1.45}}>
        Saved on this device. Adding or clearing a key does not change the engine in use.
      </p>
      <div style={{display:'flex', flexDirection:'column', gap:12}}>
        {PROVIDER_KEYS.map((provider) => {
          const value = keys[provider.id] ?? '';
          return (
            <label key={provider.id} style={{display:'block'}}>
              <span className="eyebrow">{provider.label}</span>
              <input
                type="password"
                value={value}
                onChange={(event) => updateKey(provider.id, event.target.value)}
                placeholder={provider.placeholder}
                autoComplete="off"
                style={{
                  width:'100%',
                  marginTop:6,
                  fontFamily:'var(--sans)',
                  fontSize:13,
                  color:'var(--ink)',
                  background:'var(--paper)',
                  border:'1px solid var(--hairline-strong)',
                  padding:'11px 12px',
                }}
              />
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, marginTop:7}}>
                <span className="meta">{value ? 'Key stored locally' : 'No key stored'}</span>
                {value && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => updateKey(provider.id, '')}
                    style={{width:'auto', padding:'7px 10px', fontSize:9}}
                  >
                    Clear
                  </button>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function ApiProviderChoice({ settings, onSettingsChange }) {
  return (
    <div style={{marginTop:16, padding:'14px', border:'1px solid var(--hairline)', background:'rgba(253,248,236,0.68)'}}>
      <label style={{display:'block'}}>
        <span className="eyebrow">API engine provider</span>
        <select
          value={settings?.apiProvider ?? 'openai'}
          onChange={(event) => onSettingsChange({ apiProvider: event.target.value })}
          style={{
            width:'100%',
            marginTop:6,
            fontFamily:'var(--serif)',
            fontSize:17,
            color:'var(--ink)',
            background:'var(--paper)',
            border:'1px solid var(--hairline-strong)',
            padding:'10px 12px',
          }}
        >
          <option value="openai">OpenAI API</option>
          <option value="anthropic">Anthropic / Claude API</option>
        </select>
      </label>
      <p className="meta" style={{marginTop:10, lineHeight:1.45}}>
        This only matters when the selected reading engine is API key.
      </p>
    </div>
  );
}

function LocalDataControls({ onResetLocalData }) {
  const [armed, setArmed] = useState(false);
  return (
    <div className="card" style={{padding:'20px 20px 18px'}}>
      <div className="section-label">Local Data</div>
      <h2 className="h-card" style={{fontSize:19, marginBottom:6}}>Start fresh on this device.</h2>
      <p className="body-prose" style={{fontSize:15}}>
        Clears MoonTurtle's saved birth profile, settings, provider keys, readings, archives, and journal history from this browser only.
      </p>
      <button
        type="button"
        className={armed ? 'btn btn-primary' : 'btn btn-ghost'}
        onClick={() => {
          if (!armed) {
            setArmed(true);
            return;
          }
          onResetLocalData?.();
        }}
        style={{marginTop:14}}
      >
        {armed ? 'Confirm clear local data' : 'Clear local data'}
      </button>
      {armed && (
        <p className="meta" style={{marginTop:10, lineHeight:1.45}}>
          Click again to clear MoonTurtle data and return to setup.
        </p>
      )}
    </div>
  );
}

function AISettings({ settings, state, onSettingsChange }) {
  const active = settings?.aiMode ?? 'auto';
  const reading = state?.reading;
  return (
    <div className="card warm" style={{padding:'20px 20px 18px'}}>
      <div className="section-label">AI Settings</div>
      <h2 className="h-card" style={{fontSize:19, marginBottom:6}}>Reading engine</h2>
      <p className="body-prose" style={{fontSize:15, marginBottom:14}}>
        Localhost can use the subscriptions already logged in on this Mac. Hosted deploys use the configured app provider.
      </p>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
        {AI_OPTIONS.map((option) => {
          const selected = option.id === active;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSettingsChange({ aiMode: option.id })}
              style={{
                border:selected ? '1px solid var(--terracotta)' : '1px solid var(--hairline)',
                background:selected ? 'rgba(176,74,38,0.08)' : 'var(--paper)',
                color:'var(--ink)',
                padding:'12px 12px',
                minHeight:108,
                textAlign:'left',
                cursor:'pointer',
              }}
            >
              <span className="eyebrow" style={{color:selected ? 'var(--terracotta)' : 'var(--ink-mute)'}}>{option.label}</span>
              <span style={{display:'block', fontFamily:'var(--serif)', fontSize:17, fontStyle:'italic', color:'var(--ink)', marginTop:4}}>
                {option.title}
              </span>
              <span className="meta" style={{display:'block', marginTop:6, lineHeight:1.35, letterSpacing:'0.03em'}}>
                {option.body}
              </span>
            </button>
          );
        })}
      </div>

      <EngineStatus settings={settings} state={state}/>

      {(active === 'auto' || active === 'codex' || (active === 'api-key' && (settings?.apiProvider ?? 'openai') === 'openai')) && (
        <CodexQualityChoice settings={settings} onSettingsChange={onSettingsChange}/>
      )}

      <ProviderKeys settings={settings} onSettingsChange={onSettingsChange}/>

      {active === 'api-key' && <ApiProviderChoice settings={settings} onSettingsChange={onSettingsChange}/>}

      <div style={{marginTop:16, paddingTop:14, borderTop:'1px solid var(--hairline)'}}>
        <div className="eyebrow">Current status</div>
        <div style={{fontFamily:'var(--serif)', fontSize:17, color:'var(--ink)', marginTop:4}}>
          {state?.status === 'calculating' ? 'Writing today’s reading...' : `Last reading: ${sourceLabel(reading)}`}
        </div>
        <p className="meta" style={{marginTop:6, lineHeight:1.45}}>
          Switches apply immediately and use a separate daily cache for each mode. Failed AI attempts are kept as fallback metadata, not successful AI readings.
        </p>
      </div>
    </div>
  );
}

export function MethodScreen({ settings, state, onSettingsChange, onResetLocalData }) {
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">Settings &amp; Transparency</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>How this app thinks.</h1>

      <div style={{height:22}}/>

      <AISettings settings={settings} state={state} onSettingsChange={onSettingsChange}/>

      <div style={{height:24}}/>

      <LocalDataControls onResetLocalData={onResetLocalData}/>

      <div style={{height:24}}/>

      <SymbolicSources/>

      <div style={{height:24}}/>

      <MethodSection
        num="01"
        title="This is not fatalism."
        body="Nothing in the sky decides what you do. The chart is a metaphor language — a map of patterns. You are the one walking the map."
      />
      <MethodSection
        num="02"
        title="Astronomy and interpretation are separate."
        body="The numbers (positions, phases, illumination) are calculated with open-source astronomy tools. The reading on top is symbolic interpretation, not proof or prediction."
      />
      <MethodSection
        num="03"
        title="Your current sky is calculated automatically."
        body="Where and when you are now is handled by your device. The app computes the body's observer-sky position, then checks which IAU constellation region contains it. Ecliptic points like nodes, angles, and houses use the documented boundary fallback."
      />
      <MethodSection
        num="04"
        title="Interpretation comes from named systems."
        body={"When the app says \"Mars in Pisces wants devotional action,\" it is drawing from Western astrology, lunar-cycle practice, somatic reflection, and MoonTurtle's editorial lexicon. Those systems are interpretive lenses, not astronomy itself."}
      />
      <MethodSection
        num="05"
        title="Your agency comes first."
        body="If a reading lands as instructive, contemplate it. If it feels off, set it down. You are not under obligation to the sky."
      />

      <div style={{height:24}}/>

      <div style={{padding:'18px 20px', textAlign:'center', border:'1px solid var(--hairline-strong)', background:'var(--paper)'}}>
        <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color:'var(--ink)', textWrap:'pretty'}}>
          Meaningful enough to contemplate.<br/>Never absolute enough to obey.
        </div>
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
