import { MoonGlyph, Sprig, Wordmark, OrnamentDiv } from '../components/Primitives.jsx';

function LoadingCard({ title = 'Calculating the sky.' }) {
  return (
    <div className="card warm" style={{padding:'26px 24px'}}>
      <div className="section-label">MoonTurtle</div>
      <h1 className="h-display" style={{fontSize:26, marginBottom:12}}>{title}</h1>
      <p className="body-prose">Pulling the current sky, checking your natal chart, and choosing the loudest signals.</p>
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
  if (reading?.sourceDetail?.label) return reading.sourceDetail.label;
  if (reading?.source === 'local-symbolic-engine') return 'Local symbolic engine';
  if (reading?.providerAttempted) return 'AI synthesis';
  return 'Reading engine';
}

function ReadingSource({ reading, fromCache }) {
  const detail = reading?.sourceDetail;
  const systems = detail?.systems ?? [];
  return (
    <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--hairline)'}}>
      <div className="meta">
        {fromCache ? 'Saved for today' : 'Written for today'} · {sourceLabel(reading)}
      </div>
      {detail && (
        <details style={{marginTop:8}}>
          <summary className="meta" style={{cursor:'pointer', color:'var(--terracotta)'}}>
            Why this reading?
          </summary>
          <p className="meta" style={{marginTop:8, lineHeight:1.45, letterSpacing:'0.03em'}}>
            {detail.caveat}
          </p>
          {systems.length > 0 && (
            <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:9}}>
              {systems.map((system) => (
                <span key={system} className="chip" style={{fontSize:9, padding:'4px 7px'}}>
                  {system}
                </span>
              ))}
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

      {!isReady && <LoadingCard title={state?.status === 'error' ? 'The sky did not calculate cleanly.' : 'Calculating the sky.'}/>}

      {isReady && (
        <>
          <div className="card warm" style={{padding:'26px 24px 24px', position:'relative', overflow:'hidden'}}>
            <div style={{position:'absolute', top:-8, right:-8}}><Sprig size={70} flip opacity={0.18}/></div>

            <div className="section-label">Today's Reading</div>

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
            <p className="body-prose">{state.reading.body}</p>
            <ReadingSource reading={state.reading} fromCache={state.fromCache}/>
          </div>

          <OrnamentDiv/>

          <div className="section-label">What the Moon Is Asking</div>
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

          <div className="section-label">What Today Activates</div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {state.reading.activations.map((activation, index) => (
              <ActivationCard key={activation.title} activation={activation} index={index + 1}/>
            ))}
          </div>

          <OrnamentDiv/>

          <div style={{display:'grid', gridTemplateColumns:'1fr', gap:14}}>
            <ListCard title="What to Notice" color="var(--moss)" items={state.reading.notice}/>
            <ListCard title="What to Avoid Overdoing" color="var(--plum)" items={state.reading.avoid} marker="line"/>
          </div>

          <OrnamentDiv/>
        </>
      )}

      <div
        style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)', cursor:'pointer'}}
        onClick={() => onTab('sky')}
      >
        <div>
          <div className="eyebrow">View receipts</div>
          <div style={{fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', marginTop:2}}>
            See exactly what was used to say this.
          </div>
        </div>
        <div style={{fontFamily:'var(--serif)', fontSize:24, color:'var(--ink-mute)'}}>→</div>
      </div>

      <div style={{height:14}}/>
      <p className="meta" style={{textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--ink-mute)', maxWidth:280, margin:'0 auto'}}>
        Meaningful enough to contemplate. Never absolute enough to obey.
      </p>
      <div style={{height:20}}/>
    </div>
  );
}
