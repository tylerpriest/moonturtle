import { MoonGlyph } from '../components/Primitives.jsx';
import { MT_DATA as d } from '../data.js';

export function SkyScreen() {
  return (
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
            <span>New</span><span>First Qtr</span><span>Full</span><span>Last Qtr</span><span>New</span>
          </div>
          <div style={{position:'relative', height:6, background:'var(--hairline)', borderRadius:3}}>
            <div style={{
              position:'absolute', left:`${d.lunar.cyclePct}%`, top:'50%',
              transform:'translate(-50%,-50%)', width:12, height:12, borderRadius:'50%',
              background:'var(--terracotta)', boxShadow:'0 0 0 4px rgba(176,74,38,0.18)'
            }}/>
          </div>
          <div className="meta" style={{marginTop:6, textAlign:'right'}}>
            {d.lunar.cyclePct}% through cycle · day {d.lunar.age}
          </div>
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
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="var(--ink-mute)" strokeWidth="0.8"/>
          <path d="M10 4 L10 10 L14 12" stroke="var(--ink-mute)" strokeWidth="1" fill="none" strokeLinecap="round"/>
        </svg>
        <div>
          <div className="eyebrow">Calculated</div>
          <div style={{fontFamily:'var(--serif)', fontSize:14, color:'var(--ink-soft)'}}>
            True Sky Sidereal · Swiss Ephemeris · 7 May 2026, 09:41 AEST
          </div>
        </div>
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
