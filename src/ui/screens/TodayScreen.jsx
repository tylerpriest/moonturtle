import { useEffect, useState } from 'react';
import { buildReadingSharePayload } from '../../reading/share.js';
import { MoonGlyph, Sprig, Wordmark, OrnamentDiv } from '../components/Primitives.jsx';
import { ShareButton } from '../components/ShareButton.jsx';

const LOADING_STEPS = [
  ['sky', 'Sky'],
  ['natal', 'Natal'],
  ['signals', 'Signals'],
  ['receipts', 'Receipts'],
  ['interpretation', 'AI'],
  ['validating', 'Check'],
  ['saving', 'Saved'],
];

const THINKING_DETAILS = [
  'Reading the top chart receipts.',
  'Keeping only the loudest one to three signals.',
  'Checking the Moon against natal anchors.',
  'Turning the receipts into plain language.',
  'Keeping agency and uncertainty intact.',
];

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

function LoadingCard({ title = 'Calculating the sky.', loading, isError = false }) {
  const elapsed = useElapsedSeconds(loading?.startedAt, !isError);
  const activeIndex = loading?.index ?? 1;
  const total = loading?.total ?? LOADING_STEPS.length;
  const progress = Math.max(12, Math.min(96, (activeIndex / total) * 100));
  const isThinking = loading?.step === 'interpretation' || loading?.step === 'validating';
  const stillWorking = elapsed >= 8 && isThinking;
  const thinkingDetail = THINKING_DETAILS[elapsed % THINKING_DETAILS.length];

  return (
    <div className="card warm" style={{padding:'26px 24px', overflow:'hidden'}} aria-live="polite">
      <div style={{position:'absolute', top:-10, right:-8, opacity:0.12}}><Sprig size={72} flip/></div>
      <div className="section-label">MoonTurtle</div>
      <h1 className="h-display" style={{fontSize:26, marginBottom:12}}>
        {isError ? title : loading?.title ?? title}
      </h1>
      <p className="body-prose">
        {isError ? 'Something interrupted the calculation. Try changing tabs and coming back, or update the reading settings.' : loading?.detail ?? 'Pulling the current sky, checking your natal chart, and choosing the loudest signals.'}
      </p>

      {!isError && (
        <>
          <div className="status-surface" style={{marginTop:18}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
              <div>
                <div className="eyebrow">{loading?.statusLabel ?? 'Calculating locally'}</div>
                <div className="status-engine">{loading?.engineLabel ?? 'Local calculation'}</div>
              </div>
              <div className="status-pill">{elapsed}s</div>
            </div>
            {isThinking && (
              <div style={{marginTop:12}}>
                <div className="thinking-line" aria-hidden="true"/>
                <p className="meta" style={{marginTop:10, lineHeight:1.45, letterSpacing:'0.03em'}}>
                  {thinkingDetail}
                </p>
              </div>
            )}
          </div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginTop:18}}>
            <div className="meta">Step {activeIndex} of {total}</div>
            <div className="meta">{elapsed}s elapsed</div>
          </div>
          <div className="loading-track" aria-hidden="true" style={{marginTop:8}}>
            <div className="loading-fill" style={{width:`${progress}%`}}/>
          </div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:5, marginTop:12}}>
            {LOADING_STEPS.map(([id, label], index) => {
              const complete = index + 1 <= activeIndex;
              return (
                <div key={id} className="meta" style={{
                  textAlign:'center',
                  color: complete ? 'var(--terracotta)' : 'var(--ink-mute)',
                  opacity: complete ? 1 : 0.62,
                  letterSpacing:'0.01em',
                  fontSize:9,
                }}>
                  {label}
                </div>
              );
            })}
          </div>
          {stillWorking && (
            <p className="meta" style={{marginTop:14, lineHeight:1.45, letterSpacing:'0.03em'}}>
              Still writing. MoonTurtle will keep waiting clearly here; if the AI cannot finish, the local reading will be marked as a rough fallback.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function AxisCol({ label, sign, sub, words = [], right }) {
  return (
    <div style={{textAlign: right ? 'right' : 'left'}}>
      <div className="eyebrow" style={{color:'var(--ink-mute)'}}>{label}</div>
      <div style={{fontFamily:'var(--serif)', fontSize:19, fontStyle:'italic', margin:'2px 0', color:'var(--terracotta)'}}>{sign}</div>
      <div className="meta" style={{marginBottom:8}}>{sub}</div>
      <div style={{display:'flex', flexDirection:'column', gap:3}}>
        {words.map((word) => (
          <div key={word} style={{fontFamily:'var(--serif)', fontSize:13, color:'var(--ink-soft)', fontStyle:'italic', lineHeight:1.4}}>{word}</div>
        ))}
      </div>
    </div>
  );
}

function ActivationCard({ activation, index }) {
  return (
    <div className="card" style={{padding:'18px 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6, gap:12}}>
        <div className="h-card">{activation.title}</div>
        <div style={{fontFamily:'var(--serif-sc)', fontSize:10, color:'var(--ink-mute)', letterSpacing:'0.16em', marginTop:3}}>
          {String(index).padStart(2,'0')}
        </div>
      </div>
      <div className="meta" style={{marginBottom:10, fontStyle:'italic', fontFamily:'var(--serif)', fontSize:13}}>
        Activates {activation.activates}
      </div>
      <p className="body-prose" style={{fontSize:15, marginBottom:(activation.question || activation.insight) ? 12 : 0}}>
        {activation.theme}
      </p>
      {activation.question && (
        <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--ink)', borderLeft:'2px solid var(--ochre)', paddingLeft:12}}>
          "{activation.question}"
        </div>
      )}
      {activation.insight && (
        <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--ink)', borderLeft:'2px solid var(--terracotta)', paddingLeft:12, marginTop:activation.question ? 10 : 0}}>
          {activation.insight}
        </div>
      )}
    </div>
  );
}

function ListCard({ title, color, items, marker = 'dot' }) {
  return (
    <div className="card" style={{borderTop:`2px solid ${color}`}}>
      <div className="section-label" style={{color}}>{title}</div>
      <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
        {items.map((item, index) => (
          <li key={`${item}-${index}`} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <span style={{
              flexShrink:0,
              marginTop: marker === 'dot' ? 7 : 8,
              width: marker === 'dot' ? 6 : 8,
              height: marker === 'dot' ? 6 : 1,
              borderRadius: marker === 'dot' ? '50%' : 0,
              background: color,
              display:'block',
            }}/>
            <span className="body-prose" style={{fontSize:15}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sourceLabel(reading) {
  if (reading?.isFallback) return reading?.sourceDetail?.label ?? 'MoonTurtle local synthesis';
  if (reading?.sourceDetail?.label) return reading.sourceDetail.label;
  if (reading?.source === 'local-moonturtle-engine') return 'MoonTurtle local synthesis';
  if (reading?.source === 'local-symbolic-engine') return 'Local symbolic engine';
  if (reading?.providerAttempted) return 'AI synthesis';
  return 'Reading engine';
}

function engineDisplay(readingOrStatus) {
  return readingOrStatus?.engineLabel
    ?? readingOrStatus?.engine?.displayName
    ?? 'Local MoonTurtle engine';
}

function attemptMessage(reading) {
  const attempt = reading?.aiAttempt;
  if (!attempt) return null;
  if (attempt.status === 'completed') return 'AI response completed and passed schema validation.';
  if (attempt.status === 'skipped') return attempt.message ?? 'AI interpretation was skipped.';
  return attempt.message ?? 'AI interpretation did not complete.';
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${Math.round(ms / 1000)}s`;
}

function attemptedEngineLabel(attempt = {}) {
  return attempt.engine?.displayName
    ?? attempt.engine?.attemptedEngine?.displayName
    ?? 'AI provider';
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

function FailureDetails({ reading }) {
  const attempt = reading?.aiAttempt;
  if (!attempt || attempt.status === 'completed' || attempt.status === 'skipped') return null;
  const duration = formatDuration(attempt.durationMs);
  return (
    <div style={{marginTop:12, paddingTop:11, borderTop:'1px solid rgba(176,74,38,0.28)'}}>
      <div className="eyebrow" style={{color:'var(--terracotta)'}}>Where it failed</div>
      <div className="meta" style={{marginTop:6, lineHeight:1.45, letterSpacing:'0.03em'}}>
        Stage: {failureStage(attempt.code)} · Engine: {attemptedEngineLabel(attempt)}{duration ? ` · Waited ${duration}` : ''}
      </div>
      {attempt.code && (
        <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
          Code: {attempt.code}
        </div>
      )}
      {attempt.detail?.length > 0 && (
        <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
          Detail: {attempt.detail.join(' | ')}
        </div>
      )}
    </div>
  );
}

function InterpretationStatus({ state }) {
  const loading = state?.loading;
  const status = loading ?? state?.interpretationStatus;
  const elapsed = useElapsedSeconds(loading?.startedAt, Boolean(loading));
  const reading = state?.reading;
  const label = status?.statusLabel ?? (reading?.isFallback ? 'Local engine shown' : 'Saved');
  const detail = status?.detail ?? attemptMessage(reading) ?? 'Reading status will appear here.';
  const engine = status?.engineLabel ?? engineDisplay(reading);

  return (
    <div className={`status-surface ${!loading && reading?.isFallback ? 'is-fallback' : ''}`} style={{marginBottom:14}} aria-live="polite">
      <div style={{display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start'}}>
        <div>
          <div className="eyebrow">Interpretation status</div>
          <div className="status-title">{label}</div>
        </div>
        {loading ? <div className="status-pill">{elapsed}s</div> : <div className="status-pill">{state?.fromCache ? 'Saved' : 'Now'}</div>}
      </div>
      <div className="status-engine" style={{marginTop:8}}>{engine}</div>
      <p className="meta" style={{marginTop:7, lineHeight:1.45, letterSpacing:'0.03em'}}>
        {detail}
      </p>
    </div>
  );
}

function FallbackNotice({ reading, onRetry }) {
  if (!reading?.isFallback) return null;
  const skipped = reading.aiAttempt?.status === 'skipped';
  const hasDetails = reading.fallbackReason || (reading.aiAttempt && reading.aiAttempt.status !== 'completed' && reading.aiAttempt.status !== 'skipped');
  return (
    <div className="fallback-banner">
      <div className="eyebrow" style={{color:'var(--terracotta)'}}>Local engine shown</div>
      <p className="body-prose" style={{fontSize:15, marginTop:5}}>
        {skipped
          ? 'AI interpretation is off. Showing MoonTurtle local synthesis from calculated receipts.'
          : 'AI interpretation did not complete. Showing MoonTurtle local synthesis from calculated receipts.'}
      </p>
      {hasDetails && (
        <details style={{marginTop:8}}>
          <summary className="meta" style={{cursor:'pointer', color:'var(--terracotta)'}}>
            What happened?
          </summary>
          {reading.fallbackReason && (
            <p className="meta" style={{marginTop:7, lineHeight:1.4}}>
              {reading.fallbackReason}
            </p>
          )}
          <FailureDetails reading={reading}/>
        </details>
      )}
      {onRetry && reading.providerAttempted && (
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onRetry}
          style={{marginTop:12, padding:'10px 14px', fontSize:11}}
        >
          Retry AI Interpretation
        </button>
      )}
    </div>
  );
}

function DailyGlance({ reading }) {
  const items = reading?.glanceItems?.length ? reading.glanceItems : reading?.notice ?? [];
  if (!items.length) return null;
  return (
    <div className="card" style={{padding:'18px 20px', borderTop:'2px solid var(--terracotta)'}}>
      <div className="section-label">Quick Glance</div>
      <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
        {items.slice(0, 5).map((item, index) => (
          <li key={`${item}-${index}`} style={{display:'grid', gridTemplateColumns:'22px 1fr', gap:9, alignItems:'start'}}>
            <span className="meta" style={{color:'var(--terracotta)', fontFamily:'var(--serif-sc)', fontSize:10}}>
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="body-prose" style={{fontSize:15}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LoudestSignals({ reading }) {
  const signals = reading?.loudestSignals ?? [];
  if (!signals.length) return null;
  return (
    <div className="card" style={{padding:'16px 18px'}}>
      <div className="section-label">Why these signals</div>
      <div style={{display:'flex', flexDirection:'column', gap:10}}>
        {signals.slice(0, 3).map((signal, index) => (
          <div key={`${signal.title}-${index}`} style={{borderTop:index ? '1px solid var(--hairline)' : 'none', paddingTop:index ? 10 : 0}}>
            <div className="h-card" style={{fontSize:16}}>{signal.title}</div>
            <p className="meta" style={{marginTop:4, lineHeight:1.45}}>
              {signal.activates} · score {signal.score}{Number.isFinite(signal.orb) ? ` · ${signal.orb}° orb` : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function DailyPractice({ reading }) {
  const notice = reading?.notice ?? [];
  const avoid = reading?.avoid ?? [];
  if (!notice.length && !avoid.length && !reading?.release && !reading?.act) return null;
  return (
    <div className="card warm" style={{padding:'22px'}}>
      <div className="section-label">Make Today Good</div>
      <div style={{display:'flex', flexDirection:'column', gap:16}}>
        {notice.length > 0 && (
          <div>
            <div className="eyebrow" style={{color:'var(--moss)'}}>Feel / notice</div>
            <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
              {notice.map((item, index) => (
                <li key={`${item}-${index}`} style={{display:'flex', gap:9, alignItems:'flex-start'}}>
                  <span style={{flexShrink:0, marginTop:8, width:5, height:5, borderRadius:'50%', background:'var(--moss)', display:'block'}}/>
                  <span className="body-prose" style={{fontSize:15}}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {(reading?.release || avoid.length > 0) && (
          <div style={{paddingTop:14, borderTop:'1px solid var(--hairline)'}}>
            <div className="eyebrow" style={{color:'var(--plum)'}}>Release / avoid overdoing</div>
            {reading?.release && (
              <p className="body-prose" style={{fontSize:15, marginTop:7}}>{reading.release}</p>
            )}
            {avoid.length > 0 && (
              <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:8, marginTop:8}}>
                {avoid.map((item, index) => (
                  <li key={`${item}-${index}`} style={{display:'flex', gap:9, alignItems:'flex-start'}}>
                    <span style={{flexShrink:0, marginTop:9, width:8, height:1, background:'var(--plum)', display:'block'}}/>
                    <span className="body-prose" style={{fontSize:15}}>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {reading?.act && (
          <div style={{paddingTop:14, borderTop:'1px solid var(--hairline)'}}>
            <div className="eyebrow" style={{color:'var(--terracotta)'}}>Express / act</div>
            <p className="body-prose" style={{fontSize:15, marginTop:7}}>{reading.act}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingSource({ reading, fromCache }) {
  const detail = reading?.sourceDetail;
  const systems = detail?.systems ?? [];
  const receipts = reading?.receipts ?? [];
  return (
    <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--hairline)'}}>
      <div className="meta">
        Calculated locally: sky, chart, and ranked signals.
      </div>
      <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
        Written interpretively: {fromCache ? 'saved for today' : sourceLabel(reading)}.
      </div>
      {(detail || attemptMessage(reading) || reading?.engineLabel) && (
        <details style={{marginTop:8}}>
          <summary className="meta" style={{cursor:'pointer', color:'var(--terracotta)'}}>
            Why this reading?
          </summary>
          <div className="meta" style={{marginTop:8, lineHeight:1.45, letterSpacing:'0.03em'}}>
            Engine: {reading?.engineLabel ?? engineDisplay(reading)}
          </div>
          {attemptMessage(reading) && (
            <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
              {attemptMessage(reading)}
            </div>
          )}
          {detail?.caveat && (
            <p className="meta" style={{marginTop:8, lineHeight:1.45, letterSpacing:'0.03em'}}>
              {detail.caveat}
            </p>
          )}
          {systems.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:9}}>
              {systems.map((system) => (
                <span key={system} className="chip" style={{fontSize:9, padding:'4px 7px'}}>
                  {system}
                </span>
              ))}
            </div>
          )}
          {receipts.length > 0 && (
            <div style={{marginTop:12, paddingTop:10, borderTop:'1px solid var(--hairline)'}}>
              <div className="eyebrow" style={{fontSize:9, letterSpacing:'0.16em'}}>Based on</div>
              <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:5, marginTop:7}}>
                {receipts.map((receipt) => (
                  <li key={receipt} className="meta" style={{lineHeight:1.4, letterSpacing:'0.03em'}}>
                    {receipt}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </details>
      )}
    </div>
  );
}

export function TodayScreen({ state, user, onTab }) {
  const isReady = state?.status === 'ready' && state.sky && state.reading;
  const name = user?.displayName || state?.natal?.user?.name || 'there';
  const sharePayload = isReady
    ? buildReadingSharePayload({ reading: state.reading, sky: state.sky })
    : null;
  const showTopStatus = Boolean(state?.loading || state?.status === 'error');

  return (
    <div style={{padding:'24px 26px 36px', position:'relative'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16}}>
        <div>
          <div className="eyebrow">{state?.sky?.localDate ?? 'Today'}</div>
          <div style={{fontFamily:'var(--serif)', fontSize:22, fontStyle:'italic', marginTop:4, color:'var(--ink)'}}>
            Good day, {name}.
          </div>
        </div>
        <Wordmark small/>
      </div>

      <div style={{height:22}}/>

      {showTopStatus && (
        <InterpretationStatus state={state}/>
      )}

      {!isReady && (
        <LoadingCard
          title={state?.status === 'error' ? 'The sky did not calculate cleanly.' : 'Calculating the sky.'}
          loading={state?.loading}
          isError={state?.status === 'error'}
        />
      )}

      {isReady && (
        <>
          <div className="card warm" style={{padding:'26px 24px 24px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:-8, right:-8}}><Sprig size={70} flip opacity={0.18}/></div>

            <div className="section-label">Daily Basic</div>
            <FallbackNotice reading={state.reading} onRetry={state.refresh}/>

            <div style={{display:'flex', alignItems:'center', gap:14, margin:'4px 0 18px'}}>
              <div style={{flexShrink:0}}><MoonGlyph size={42} illumPct={state.sky.lunar.illumination} waxing={state.sky.lunar.waxing}/></div>
              <div style={{minWidth:0, flex:1}}>
                <div className="eyebrow">{state.sky.lunar.phase} · {state.sky.lunar.moonSign}</div>
                <div className="meta" style={{marginTop:2, color:'var(--ink-soft)'}}>{state.sky.lunar.illumination}% lit · day {state.sky.lunar.age} of cycle</div>
              </div>
            </div>

            <h1 className="h-display" style={{fontSize:26, marginBottom:14}}>
              {state.reading.headline}
            </h1>
            <p className="body-prose">
              {state.reading.body}
            </p>
            <ReadingSource reading={state.reading} fromCache={state.fromCache}/>
            <div className="reading-actions">
              <ShareButton payload={sharePayload}/>
              {!state.reading.isFallback && state.refresh && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={state.refresh}
                >
                  Create Another Variant
                </button>
              )}
            </div>
          </div>

          <OrnamentDiv/>

          <div className="section-label">The Loudest Signals</div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {state.reading.activations.slice(0, 3).map((activation, index) => (
              <ActivationCard key={`${activation.title}-${index}`} activation={activation} index={index + 1}/>
            ))}
          </div>

          <OrnamentDiv/>

          <div className="section-label">Moon Axis</div>
          <div className="card" style={{padding:'22px'}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:14, alignItems:'center'}}>
              <AxisCol
                label="Natal Moon"
                sign={state.reading.lunarAxis.natal.sign}
                sub={state.reading.lunarAxis.natal.house}
                words={state.reading.lunarAxis.natal.words}
              />
              <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
                <svg width="14" height="44" viewBox="0 0 14 44">
                  <line x1="7" y1="2" x2="7" y2="42" stroke="var(--hairline-strong)" strokeWidth="0.8" strokeDasharray="2 3"/>
                  <circle cx="7" cy="22" r="3" fill="var(--terracotta)"/>
                </svg>
                <div style={{fontFamily:'var(--serif-sc)', fontSize:9, letterSpacing:'0.18em', color:'var(--ink-mute)'}}>AXIS</div>
              </div>
              <AxisCol
                label="Sky Moon"
                sign={state.reading.lunarAxis.current.sign}
                sub="now"
                words={state.reading.lunarAxis.current.words}
                right
              />
            </div>
            <div style={{height:18}}/>
            <p className="body-prose" style={{fontSize:15, fontStyle:'italic', borderLeft:'2px solid var(--terracotta)', paddingLeft:14, color:'var(--ink-soft)'}}>
              {state.reading.lunarAxis.reading}
            </p>
          </div>

          <OrnamentDiv/>

          <DailyPractice reading={state.reading}/>

          <OrnamentDiv/>
        </>
      )}

      <button
        type="button"
        className="receipt-cta"
        onClick={() => onTab('sky')}
      >
        <div>
          <div className="eyebrow">View receipts</div>
          <div style={{fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', marginTop:2}}>
            See exactly what was used to say this.
          </div>
        </div>
        <div style={{fontFamily:'var(--serif)', fontSize:24, color:'var(--ink-mute)'}}>→</div>
      </button>

      <div style={{height:14}}/>
      <p className="meta" style={{textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--ink-mute)', maxWidth:280, margin:'0 auto'}}>
        Meaningful enough to contemplate. Never absolute enough to obey.
      </p>
      <div style={{height:20}}/>
    </div>
  );
}
