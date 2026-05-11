import { MoonGlyph } from '../components/Primitives.jsx';

const ITEMS = [
  { date: "Thu 7 May",  phase: 74.6, w:false, sign:'Sagittarius', headline:'A "make meaning from the map" day.', tag:'Today' },
  { date: "Wed 6 May",  phase: 81,   w:false, sign:'Sagittarius', headline:'Daily rhythm is asking to match philosophy.' },
  { date: "Tue 5 May",  phase: 88,   w:false, sign:'Scorpio',     headline:'Quiet attention to what is being named.' },
  { date: "Mon 4 May",  phase: 94,   w:false, sign:'Scorpio',     headline:'A devotional research kind of morning.' },
  { date: "Sun 3 May",  phase: 99,   w:false, sign:'Libra',       headline:'The Full Moon held the shape of agreements.', tag:'Full Moon' },
  { date: "Sat 2 May",  phase: 96,   w:true,  sign:'Libra',       headline:'A relational rebalancing.' },
  { date: "Fri 1 May",  phase: 88,   w:true,  sign:'Virgo',       headline:'A useful, honest, hands-on day.' },
];

const RIBBON = [3,12,28,45,62,78,90,98,94,82,68,52,36,20];

export function JournalScreen() {
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">May 2026</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>The pattern of your days.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        Past readings, held lightly. No streaks. No score.
      </p>

      <div style={{height:22}}/>

      {/* Moon ribbon */}
      <div style={{
        display:'flex', gap:6, justifyContent:'space-between', marginBottom:22,
        padding:'14px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)'
      }}>
        {RIBBON.map((p,i) => (
          <div key={i} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
            <MoonGlyph size={16} illumPct={p} waxing={i<7}/>
            <div style={{fontFamily:'var(--sans)', fontSize:9, color:'var(--ink-mute)'}}>{i+1}</div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {ITEMS.map((it, i) => (
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
              <div style={{fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', color:'var(--ink)', marginBottom:3}}>
                {it.headline}
              </div>
              <div className="meta">Moon in {it.sign} · {it.phase}% lit</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
