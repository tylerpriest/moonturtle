// ── Today / Daily Reading (the main screen) ──
function TodayScreen({ onTab, fixed }) {
  const d = window.MT_DATA;
  return (
    <Phone withTabBar activeTab="today" onTab={onTab} fixed={fixed}>
      <div style={{padding:'24px 26px 36px', position:'relative'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div className="eyebrow">{d.user.now.date}</div>
            <div style={{fontFamily:'var(--serif)', fontSize:22, fontStyle:'italic', marginTop:4, color:'var(--ink)'}}>
              Good morning, {d.user.name}.
            </div>
          </div>
          <Wordmark small/>
        </div>

        <div style={{height: 22}}/>

        {/* Primary synthesis card */}
        <div className="card warm" style={{padding:'26px 24px 24px', position:'relative', overflow:'hidden'}}>
          <div style={{position:'absolute', top:-8, right:-8}}><Sprig size={70} flip opacity={0.18}/></div>

          <div className="section-label">Today's Reading</div>

          <div style={{display:'flex', alignItems:'center', gap:14, margin:'4px 0 18px'}}>
            <div style={{flexShrink:0}}><MoonGlyph size={42} illumPct={d.lunar.illumination}/></div>
            <div style={{minWidth:0, flex:1}}>
              <div className="eyebrow">Waning Gibbous · Sagittarius</div>
              <div className="meta" style={{marginTop:2, color:'var(--ink-soft)'}}>{d.lunar.illumination}% lit · day {d.lunar.age} of cycle</div>
            </div>
          </div>

          <h1 className="h-display" style={{fontSize:26, marginBottom:14, clear:'both'}}>
            {d.primary.headline}
          </h1>

          <p className="body-prose">{d.primary.body}</p>
        </div>

        <OrnamentDiv/>

        {/* What the Moon is asking */}
        <div className="section-label">What the Moon Is Asking</div>
        <div className="card" style={{padding:'22px 22px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:14, alignItems:'center'}}>
            <AxisCol label="Natal Moon" sign={d.lunarAxis.natal.sign} sub="12th house" words={d.lunarAxis.natal.words}/>
            <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:6}}>
              <svg width="14" height="44" viewBox="0 0 14 44">
                <line x1="7" y1="2" x2="7" y2="42" stroke="var(--hairline-strong)" strokeWidth="0.8" strokeDasharray="2 3"/>
                <circle cx="7" cy="22" r="3" fill="var(--terracotta)"/>
              </svg>
              <div style={{fontFamily:'var(--serif-sc)', fontSize:9, letterSpacing:'0.18em', color:'var(--ink-mute)'}}>AXIS</div>
            </div>
            <AxisCol label="Sky Moon" sign={d.lunarAxis.current.sign} sub="now" words={d.lunarAxis.current.words} right/>
          </div>
          <div style={{height:18}}/>
          <p className="body-prose" style={{fontSize:15, fontStyle:'italic', borderLeft:'2px solid var(--terracotta)', paddingLeft:14, color:'var(--ink-soft)'}}>
            {d.lunarAxis.reading}
          </p>
        </div>

        <OrnamentDiv/>

        {/* What today activates */}
        <div className="section-label">What Today Activates</div>
        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {d.activations.map((a, i) => (
            <ActivationCard key={i} a={a} index={i+1}/>
          ))}
        </div>

        <OrnamentDiv/>

        {/* Notice / Avoid */}
        <div style={{display:'grid', gridTemplateColumns:'1fr', gap:14}}>
          <div className="card" style={{borderTop:'2px solid var(--moss)'}}>
            <div className="section-label" style={{color:'var(--moss)'}}>What to Notice</div>
            <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
              {d.notice.map((n,i) => (
                <li key={i} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <span style={{
                    flexShrink:0, marginTop:7,
                    width:6, height:6, borderRadius:'50%', background:'var(--moss)'
                  }}/>
                  <span className="body-prose" style={{fontSize:15}}>{n}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card" style={{borderTop:'2px solid var(--plum)'}}>
            <div className="section-label" style={{color:'var(--plum)'}}>What to Avoid Overdoing</div>
            <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
              {d.avoid.map((n,i) => (
                <li key={i} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
                  <span style={{
                    flexShrink:0, marginTop:8,
                    width:8, height:1, background:'var(--plum)'
                  }}/>
                  <span className="body-prose" style={{fontSize:15}}>{n}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <OrnamentDiv/>

        {/* Receipts CTA */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          padding:'18px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)',
          cursor:'pointer'
        }} onClick={()=>onTab&&onTab('sky')}>
          <div>
            <div className="eyebrow">View receipts</div>
            <div style={{fontFamily:'var(--serif)', fontSize:18, fontStyle:'italic', marginTop:2}}>
              See exactly what was used to say this.
            </div>
          </div>
          <div style={{fontFamily:'var(--serif)', fontSize:24, color:'var(--ink-mute)'}}>→</div>
        </div>

        <div style={{height:14}}/>
        <p className="meta" style={{
          textAlign:'center', fontFamily:'var(--serif)', fontStyle:'italic',
          fontSize:13, color:'var(--ink-mute)', maxWidth:280, margin:'0 auto'
        }}>
          Meaningful enough to contemplate. Never absolute enough to obey.
        </p>
      </div>
    </Phone>
  );
}

function AxisCol({ label, sign, sub, words, right }) {
  return (
    <div style={{textAlign: right ? 'right' : 'left'}}>
      <div className="eyebrow" style={{color:'var(--ink-mute)'}}>{label}</div>
      <div style={{fontFamily:'var(--serif)', fontSize:19, fontStyle:'italic', margin:'2px 0', color:'var(--terracotta)'}}>{sign}</div>
      <div className="meta" style={{marginBottom:8}}>{sub}</div>
      <div style={{display:'flex', flexDirection:'column', gap:3}}>
        {words.map(w => (
          <div key={w} style={{
            fontFamily:'var(--serif)', fontSize:13, color:'var(--ink-soft)',
            fontStyle:'italic', lineHeight:1.4
          }}>{w}</div>
        ))}
      </div>
    </div>
  );
}

function ActivationCard({ a, index }) {
  return (
    <div className="card" style={{padding:'18px 20px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6}}>
        <div className="h-card">{a.title}</div>
        <div style={{
          fontFamily:'var(--serif-sc)', fontSize:10, color:'var(--ink-mute)',
          letterSpacing:'0.16em', marginTop:3
        }}>{String(index).padStart(2,'0')}</div>
      </div>
      <div className="meta" style={{marginBottom:10, fontStyle:'italic', fontFamily:'var(--serif)', fontSize:13}}>
        Activates {a.activates}
      </div>
      <p className="body-prose" style={{fontSize:15, marginBottom: (a.question||a.insight)?12:0}}>{a.theme}</p>
      {a.question && (
        <div style={{
          fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15,
          color:'var(--ink)', borderLeft:'2px solid var(--ochre)', paddingLeft:12
        }}>“{a.question}”</div>
      )}
      {a.insight && (
        <div style={{
          fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15,
          color:'var(--ink)', borderLeft:'2px solid var(--terracotta)', paddingLeft:12
        }}>{a.insight}</div>
      )}
    </div>
  );
}

Object.assign(window, { TodayScreen, AxisCol, ActivationCard });
