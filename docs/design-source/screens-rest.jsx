// Receipts (Sky), Natal, Method, Journal screens

// ── Sky / Receipts ──
function SkyScreen({ onTab, fixed }) {
  const d = window.MT_DATA;
  return (
    <Phone withTabBar activeTab="sky" onTab={onTab} fixed={fixed}>
      <div style={{padding:'24px 26px 36px'}}>
        <div className="eyebrow">Receipts</div>
        <div style={{height:6}}/>
        <h1 className="h-display" style={{fontSize:26}}>The sky, calculated.</h1>
        <p className="body-prose" style={{fontSize:15, marginTop:8}}>
          Astronomy first. The interpretation in <em>Today</em> rests on these numbers.
        </p>

        <div style={{height:22}}/>

        {/* Lunar block */}
        <div className="card">
          <div className="section-label">Current Lunar Cycle</div>
          <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
            <MoonGlyph size={62} illumPct={d.lunar.illumination}/>
            <div>
              <div style={{fontFamily:'var(--serif)', fontSize:22, fontStyle:'italic'}}>{d.lunar.phase}</div>
              <div className="meta" style={{marginTop:2}}>Moon in {d.lunar.moonSign}</div>
            </div>
          </div>

          {/* cycle progress */}
          <div style={{marginBottom:14}}>
            <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--serif-sc)', fontSize:10, letterSpacing:'0.16em', color:'var(--ink-mute)', marginBottom:6}}>
              <span>NEW</span><span>FIRST QTR</span><span>FULL</span><span>LAST QTR</span><span>NEW</span>
            </div>
            <div style={{position:'relative', height:6, background:'var(--hairline)', borderRadius:3}}>
              <div style={{position:'absolute', left:`${d.lunar.cyclePct}%`, top:'50%', transform:'translate(-50%,-50%)', width:12, height:12, borderRadius:'50%', background:'var(--terracotta)', boxShadow:'0 0 0 4px rgba(176,74,38,0.18)'}}/>
            </div>
            <div className="meta" style={{marginTop:6, textAlign:'right'}}>{d.lunar.cyclePct}% through cycle · day {d.lunar.age}</div>
          </div>

          <table className="receipt">
            <tbody>
              <tr><td>Illumination</td><td>{d.lunar.illumination}%</td></tr>
              <tr><td>Moon age</td><td>{d.lunar.age} days into lunation</td></tr>
              <tr><td>Moonrise (Manly)</td><td>{d.lunar.moonrise}</td></tr>
              <tr><td>Moonset (Manly)</td><td>{d.lunar.moonset}</td></tr>
              <tr><td>Last Quarter</td><td>{d.lunar.lastQuarter}</td></tr>
              <tr><td>Next New Moon</td><td>{d.lunar.nextNewMoon}</td></tr>
              <tr><td>Sun in</td><td>{d.lunar.sunSign}</td></tr>
            </tbody>
          </table>
        </div>

        <div style={{height:18}}/>

        {/* Source */}
        <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
          <svg width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" fill="none" stroke="var(--ink-mute)" strokeWidth="0.8"/><path d="M10 4 L10 10 L14 12" stroke="var(--ink-mute)" strokeWidth="1" fill="none" strokeLinecap="round"/></svg>
          <div>
            <div className="eyebrow">Calculated</div>
            <div style={{fontFamily:'var(--serif)', fontSize:14, color:'var(--ink-soft)'}}>True Sky Sidereal · Swiss Ephemeris · 7 May 2026, 09:41 AEST</div>
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ── Natal screen ──
function NatalScreen({ onTab, fixed }) {
  const d = window.MT_DATA;
  return (
    <Phone withTabBar activeTab="natal" onTab={onTab} fixed={fixed}>
      <div style={{padding:'24px 26px 36px'}}>
        <div className="eyebrow">{d.user.birth.date} · {d.user.birth.time} · {d.user.birth.place}</div>
        <div style={{height:6}}/>
        <h1 className="h-display" style={{fontSize:26}}>Your natal pattern.</h1>
        <p className="body-prose" style={{fontSize:15, marginTop:8}}>
          The baseline. What the sky was doing the moment you began.
        </p>

        <div style={{height:22}}/>

        {/* Synthesis */}
        <div className="card warm" style={{padding:'22px'}}>
          <div className="section-label">Pattern Reading</div>
          <p className="body-prose" style={{fontSize:16}}>
            A <em>Gemini</em> rising, <em>Pisces</em> Sun, <em>Gemini</em> Moon native — built to translate the subtle and devotional into the legible. A 6th-house Sagittarius stack (Saturn, Uranus, Neptune) anchors a daily life that has to match a philosophy. Taurus 11th brings the practical community. Aquarius North Node points the work outward.
          </p>
        </div>

        <div style={{height:18}}/>

        {/* Angles */}
        <div className="section-label">Angles</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18}}>
          {d.angles.map(a => (
            <div key={a.angle} className="card" style={{padding:'14px 16px'}}>
              <div className="eyebrow">{a.angle}</div>
              <div style={{fontFamily:'var(--serif)', fontSize:20, fontStyle:'italic', marginTop:2, color:'var(--terracotta)'}}>{a.sign}</div>
            </div>
          ))}
        </div>

        {/* Placements */}
        <div className="section-label">Placements</div>
        <div className="card" style={{padding:'4px 18px'}}>
          <table className="receipt" style={{fontSize:13}}>
            <tbody>
              {d.natal.map(p => (
                <tr key={p.body}>
                  <td style={{width:30, color:'var(--terracotta)', fontSize:14}}>{p.sym}</td>
                  <td style={{color:'var(--ink)', fontFamily:'var(--serif)', fontSize:15}}>{p.body}</td>
                  <td style={{color:'var(--ink-soft)', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15}}>{p.sign}</td>
                  <td>{p.house === 4 ? '4th' : p.house+'th'} house</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{height:18}}/>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)'}}>
          <div className="eyebrow">View chart wheel</div>
          <div style={{fontFamily:'var(--serif)', fontSize:22, color:'var(--ink-mute)'}}>→</div>
        </div>
      </div>
    </Phone>
  );
}

// ── Method ──
function MethodScreen({ onTab, fixed }) {
  return (
    <Phone withTabBar activeTab="method" onTab={onTab} fixed={fixed}>
      <div style={{padding:'24px 26px 36px'}}>
        <div className="eyebrow">Trust & Transparency</div>
        <div style={{height:6}}/>
        <h1 className="h-display" style={{fontSize:26}}>How this app thinks.</h1>

        <div style={{height: 22}}/>

        <MethodSection num="01" title="This is not fatalism."
          body="Nothing in the sky decides what you do. The chart is a metaphor language — a map of patterns. You are the one walking the map."/>

        <MethodSection num="02" title="Astronomy and interpretation are separate."
          body="The numbers (positions, phases, illumination) are calculated from astronomical data. The reading on top of those numbers is a symbolic layer — a way of speaking, not a prediction."/>

        <MethodSection num="03" title="Your current sky is calculated automatically."
          body="Where and when you are now — handled by your device. The app reads the sky as it actually is from where you stand, using True Sky Sidereal positions. Not the calendar zodiac."/>

        <MethodSection num="04" title="Interpretation comes from symbolic grammar, not objective fact."
          body="When the app says “Mars in Pisces wants devotional action,” it's drawing from a long symbolic vocabulary. Treat it as poetry with structure, not data with destiny."/>

        <MethodSection num="05" title="Your agency comes first."
          body="If a reading lands as instructive, contemplate it. If it feels off, set it down. You are not under obligation to the sky."/>

        <div style={{height:24}}/>

        <div style={{
          padding:'18px 20px', textAlign:'center',
          border:'1px solid var(--hairline-strong)',
          background:'var(--paper)'
        }}>
          <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color:'var(--ink)', textWrap:'pretty'}}>
            Meaningful enough to contemplate.<br/>Never absolute enough to obey.
          </div>
        </div>
      </div>
    </Phone>
  );
}

function MethodSection({ num, title, body }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'40px 1fr', gap:16, marginBottom: 22}}>
      <div style={{
        fontFamily:'var(--serif-sc)', fontSize:14, color:'var(--terracotta)',
        letterSpacing:'0.16em', paddingTop:3
      }}>{num}</div>
      <div>
        <div className="h-card" style={{marginBottom:6}}>{title}</div>
        <p className="body-prose" style={{fontSize:15}}>{body}</p>
      </div>
    </div>
  );
}

// ── Journal / saved readings ──
function JournalScreen({ onTab, fixed }) {
  const items = [
    { date: "Thu 7 May",  phase: 74.6, w:false, sign:'Sagittarius', headline:'A "make meaning from the map" day.', tag:'Today' },
    { date: "Wed 6 May",  phase: 81,   w:false, sign:'Sagittarius', headline:'Daily rhythm is asking to match philosophy.' },
    { date: "Tue 5 May",  phase: 88,   w:false, sign:'Scorpio',     headline:'Quiet attention to what is being named.' },
    { date: "Mon 4 May",  phase: 94,   w:false, sign:'Scorpio',     headline:'A devotional research kind of morning.' },
    { date: "Sun 3 May",  phase: 99,   w:false, sign:'Libra',       headline:'The Full Moon held the shape of agreements.', tag:'Full Moon' },
    { date: "Sat 2 May",  phase: 96,   w:true,  sign:'Libra',       headline:'A relational rebalancing.' },
    { date: "Fri 1 May",  phase: 88,   w:true,  sign:'Virgo',       headline:'A useful, honest, hands-on day.' },
  ];
  return (
    <Phone withTabBar activeTab="journal" onTab={onTab} fixed={fixed}>
      <div style={{padding:'24px 26px 36px'}}>
        <div className="eyebrow">May 2026</div>
        <div style={{height:6}}/>
        <h1 className="h-display" style={{fontSize:26}}>The pattern of your days.</h1>
        <p className="body-prose" style={{fontSize:15, marginTop:8}}>
          Past readings, held lightly. No streaks. No score.
        </p>

        <div style={{height:22}}/>

        {/* moon ribbon */}
        <div style={{display:'flex', gap:6, justifyContent:'space-between', marginBottom:22, padding:'14px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)'}}>
          {[3,12,28,45,62,78,90,98,94,82,68,52,36,20].map((p,i)=>(
            <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
              <MoonGlyph size={16} illumPct={p} waxing={i<7}/>
              <div style={{fontFamily:'var(--sans)', fontSize:9, color:'var(--ink-mute)'}}>{i+1}</div>
            </div>
          ))}
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:14}}>
          {items.map((it, i) => (
            <div key={i} className={i===0 ? 'card warm' : 'card'} style={{padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start'}}>
              <div style={{flexShrink:0, paddingTop:3}}>
                <MoonGlyph size={32} illumPct={it.phase} waxing={it.w}/>
              </div>
              <div style={{flex:1}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:3}}>
                  <div className="eyebrow">{it.date}</div>
                  {it.tag && (
                    <div className="chip" style={{padding:'2px 7px', fontSize:9}}>{it.tag}</div>
                  )}
                </div>
                <div style={{fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', color:'var(--ink)', marginBottom:3}}>{it.headline}</div>
                <div className="meta">Moon in {it.sign} · {it.phase}% lit</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Phone>
  );
}

Object.assign(window, { SkyScreen, NatalScreen, MethodScreen, JournalScreen, MethodSection });
