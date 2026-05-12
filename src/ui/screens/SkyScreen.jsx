import { MoonGlyph } from '../components/Primitives.jsx';

function BodyRow({ body }) {
  return (
    <tr>
      <td style={{width:28, color:'var(--terracotta)', fontSize:14}}>{body.sym}</td>
      <td style={{fontFamily:'var(--serif)', color:'var(--ink)', fontSize:15}}>{body.body}</td>
      <td style={{fontFamily:'var(--serif)', fontStyle:'italic', color:'var(--ink-soft)', fontSize:15}}>
        {body.degree}° {body.sign}
      </td>
      <td>{body.retrograde ? 'Rx' : 'direct'}</td>
    </tr>
  );
}

export function SkyScreen({ state }) {
  const sky = state?.sky;
  const ready = state?.status === 'ready' && sky;

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">Receipts</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>The sky, calculated.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        Astronomy first. The interpretation in <em>Today</em> rests on these numbers.
      </p>

      <div style={{height:22}}/>

      {!ready && (
        <div className="card warm">
          <div className="section-label">Calculating</div>
          <p className="body-prose">MoonTurtle is calculating local sky positions and natal contacts.</p>
        </div>
      )}

      {ready && (
        <>
          <div className="card">
            <div className="section-label">Current Lunar Cycle</div>
            <div style={{display:'flex', alignItems:'center', gap:16, marginBottom:16}}>
              <MoonGlyph size={62} illumPct={sky.lunar.illumination} waxing={sky.lunar.waxing}/>
              <div>
                <div style={{fontFamily:'var(--serif)', fontSize:22, fontStyle:'italic'}}>{sky.lunar.phase}</div>
                <div className="meta" style={{marginTop:2}}>Moon in {sky.lunar.moonSign}</div>
              </div>
            </div>

            <div style={{marginBottom:14}}>
              <div style={{display:'flex', justifyContent:'space-between', fontFamily:'var(--serif-sc)', fontSize:10, letterSpacing:'0.14em', color:'var(--ink-mute)', marginBottom:6}}>
                <span>New</span><span>First Qtr</span><span>Full</span><span>Last Qtr</span><span>New</span>
              </div>
              <div style={{position:'relative', height:6, background:'var(--hairline)', borderRadius:3}}>
                <div style={{
                  position:'absolute',
                  left:`${sky.lunar.cyclePct}%`,
                  top:'50%',
                  transform:'translate(-50%,-50%)',
                  width:12,
                  height:12,
                  borderRadius:'50%',
                  background:'var(--terracotta)',
                  boxShadow:'0 0 0 4px rgba(176,74,38,0.18)',
                }}/>
              </div>
              <div className="meta" style={{marginTop:6, textAlign:'right'}}>
                {sky.lunar.cyclePct}% through cycle · day {sky.lunar.age}
              </div>
            </div>

            <table className="receipt">
              <tbody>
                <tr><td>Illumination</td><td>{sky.lunar.illumination}%</td></tr>
                <tr><td>Moon age</td><td>{sky.lunar.age} days into lunation</td></tr>
                <tr><td>Moonrise</td><td>{sky.lunar.moonrise}</td></tr>
                <tr><td>Moonset</td><td>{sky.lunar.moonset}</td></tr>
                <tr><td>Last Quarter</td><td>{sky.lunar.previousQuarter}</td></tr>
                <tr><td>Next New Moon</td><td>{sky.lunar.nextNewMoon}</td></tr>
                <tr><td>Sun in</td><td>{sky.lunar.sunSign}</td></tr>
              </tbody>
            </table>
          </div>

          <div style={{height:18}}/>

          <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <circle cx="10" cy="10" r="8" fill="none" stroke="var(--ink-mute)" strokeWidth="0.8"/>
              <path d="M10 4 L10 10 L14 12" stroke="var(--ink-mute)" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
            <div>
              <div className="eyebrow">Calculated</div>
              <div style={{fontFamily:'var(--serif)', fontSize:14, color:'var(--ink-soft)', lineHeight:1.35}}>
                Observer sky · IAU constellation regions · {sky.localDate}, {sky.localTime}
              </div>
              <div className="meta" style={{marginTop:2}}>{sky.place.name}</div>
            </div>
          </div>

          <div style={{height:18}}/>

          <div className="section-label">Current Bodies</div>
          <div className="card" style={{padding:'4px 18px'}}>
            <table className="receipt" style={{fontSize:13}}>
              <tbody>
                {sky.bodies.map((body) => <BodyRow key={body.body} body={body}/>)}
              </tbody>
            </table>
          </div>

          <div className="meta" style={{marginTop:8, textAlign:'right'}}>
            Framework: {sky.framework}
          </div>
        </>
      )}

      <div style={{height:20}}/>
    </div>
  );
}
