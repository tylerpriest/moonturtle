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

const AI_OPTIONS = [
  {
    id: 'auto',
    label: 'Auto',
    title: 'Codex first',
    body: 'Uses your local Codex login first, then Claude if Codex is unavailable.',
  },
  {
    id: 'codex',
    label: 'Codex',
    title: 'Codex only',
    body: 'Use your logged-in Codex CLI for localhost readings.',
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
    title: 'Your key',
    body: 'Use a saved provider API key for readings.',
  },
  {
    id: 'local',
    label: 'Local',
    title: 'No AI',
    body: 'Use the built-in symbolic engine only.',
  },
];

function sourceLabel(source, providerAttempted) {
  if (source === 'local-codex-subscription') return 'Codex subscription';
  if (source === 'local-claude-subscription') return 'Claude subscription';
  if (source === 'user-anthropic-key') return 'Your Anthropic API key';
  if (source === 'anthropic-provider') return 'Hosted Claude API';
  if (providerAttempted) return 'Local symbolic fallback';
  return 'Local symbolic engine';
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

      {active === 'api-key' && (
        <div style={{marginTop:16, padding:'14px', border:'1px solid var(--hairline)', background:'rgba(253,248,236,0.68)'}}>
          <label style={{display:'block'}}>
            <span className="eyebrow">Provider</span>
            <select
              value={settings?.apiProvider ?? 'anthropic'}
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
              <option value="anthropic">Anthropic / Claude API</option>
            </select>
          </label>
          <label style={{display:'block', marginTop:12}}>
            <span className="eyebrow">API key</span>
            <input
              type="password"
              value={settings?.apiKey ?? ''}
              onChange={(event) => onSettingsChange({ apiKey: event.target.value })}
              placeholder="sk-ant-..."
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
          </label>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => onSettingsChange({ apiKey: '' })}
            style={{marginTop:10, padding:'10px 14px', fontSize:11}}
          >
            Clear Key
          </button>
          <p className="meta" style={{marginTop:10, lineHeight:1.45}}>
            Saved on this device. In API-key mode, the key is sent only to the reading endpoint to write the reading.
          </p>
        </div>
      )}

      <div style={{marginTop:16, paddingTop:14, borderTop:'1px solid var(--hairline)'}}>
        <div className="eyebrow">Current status</div>
        <div style={{fontFamily:'var(--serif)', fontSize:17, color:'var(--ink)', marginTop:4}}>
          {state?.status === 'calculating' ? 'Writing today’s reading...' : `Last reading: ${sourceLabel(reading?.source, reading?.providerAttempted)}`}
        </div>
        <p className="meta" style={{marginTop:6, lineHeight:1.45}}>
          Switches apply immediately and use a separate daily cache for each mode.
        </p>
      </div>
    </div>
  );
}

export function MethodScreen({ settings, state, onSettingsChange }) {
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">Settings &amp; Transparency</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>How this app thinks.</h1>

      <div style={{height:22}}/>

      <AISettings settings={settings} state={state} onSettingsChange={onSettingsChange}/>

      <div style={{height:24}}/>

      <MethodSection
        num="01"
        title="This is not fatalism."
        body="Nothing in the sky decides what you do. The chart is a metaphor language — a map of patterns. You are the one walking the map."
      />
      <MethodSection
        num="02"
        title="Astronomy and interpretation are separate."
        body="The numbers (positions, phases, illumination) are calculated with open-source astronomy tools. The reading on top of those numbers is a symbolic layer — a way of speaking, not a prediction."
      />
      <MethodSection
        num="03"
        title="Your current sky is calculated automatically."
        body="Where and when you are now — handled by your device. The app reads the sky through IAU constellation boundaries projected onto the ecliptic, using unequal true-sky signs, not the calendar zodiac."
      />
      <MethodSection
        num="04"
        title="Interpretation comes from symbolic grammar, not objective fact."
        body={"When the app says \"Mars in Pisces wants devotional action,\" it's drawing from a long symbolic vocabulary. Treat it as poetry with structure, not data with destiny."}
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
