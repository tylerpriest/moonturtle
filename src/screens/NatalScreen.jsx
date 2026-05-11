import { MT_DATA as d } from '../data.js';

function houseLabel(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function NatalScreen() {
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">{d.user.birth.date} · {d.user.birth.time} · {d.user.birth.place}</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>Your natal pattern.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        The baseline. What the sky was doing the moment you began.
      </p>

      <div style={{height:22}}/>

      {/* Pattern reading */}
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
                <td>{houseLabel(p.house)} house</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{height:18}}/>

      <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid var(--hairline)', borderBottom:'1px solid var(--hairline)', cursor:'pointer'}}>
        <div className="eyebrow">View chart wheel</div>
        <div style={{fontFamily:'var(--serif)', fontSize:22, color:'var(--ink-mute)'}}>→</div>
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
