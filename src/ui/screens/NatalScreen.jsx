function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function houseLabel(n) {
  return n ? `${ordinal(n)} house` : 'house unknown';
}

function findBody(natal, name) {
  return natal?.bodies?.find((body) => body.body === name);
}

function patternReading(natal) {
  const sun = findBody(natal, 'Sun');
  const moon = findBody(natal, 'Moon');
  const mercury = findBody(natal, 'Mercury');
  const asc = natal?.angles?.find((angle) => angle.angle === 'Ascendant');
  if (!natal) return 'Your natal chart is still calculating.';
  return `A ${asc?.sign ?? 'time-unknown'} rising, ${sun?.sign ?? 'unknown'} Sun, ${moon?.sign ?? 'unknown'} Moon chart: the baseline pattern is how identity, body, and attention learn to cooperate. Mercury ${mercury ? `in ${mercury.sign}` : 'as chart ruler'} shows the nervous-system doorway: name what is true before trying to make it beautiful.`;
}

function BodyRow({ body }) {
  return (
    <tr>
      <td style={{width:30, color:'var(--terracotta)', fontSize:14}}>{body.sym}</td>
      <td style={{color:'var(--ink)', fontFamily:'var(--serif)', fontSize:15}}>{body.body}</td>
      <td style={{color:'var(--ink-soft)', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15}}>{body.degree}° {body.sign}</td>
      <td>{houseLabel(body.house)}</td>
    </tr>
  );
}

export function NatalScreen({ state, user }) {
  const natal = state?.natal;
  const birth = user?.birth;

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">
        {birth ? `${birth.date} · ${birth.timeKnown ? birth.time : 'time unknown'} · ${birth.place.name}` : 'Natal chart'}
      </div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>Your natal pattern.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        The baseline. The sky you entered through, calculated from where and when you began.
      </p>

      <div style={{height:22}}/>

      <div className="card warm" style={{padding:'22px'}}>
        <div className="section-label">Pattern Reading</div>
        <p className="body-prose" style={{fontSize:16}}>
          {patternReading(natal)}
        </p>
      </div>

      <div style={{height:18}}/>

      <div className="section-label">Angles</div>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18}}>
        {(natal?.angles ?? []).map((angle) => (
          <div key={angle.angle} className="card" style={{padding:'14px 16px'}}>
            <div className="eyebrow">{angle.angle}</div>
            <div style={{fontFamily:'var(--serif)', fontSize:20, fontStyle:'italic', marginTop:2, color:'var(--terracotta)'}}>{angle.degree}° {angle.sign}</div>
          </div>
        ))}
      </div>

      <div className="section-label">Placements</div>
      <div className="card" style={{padding:'4px 18px'}}>
        <table className="receipt" style={{fontSize:13}}>
          <tbody>
            {(natal?.bodies ?? []).map((body) => <BodyRow key={body.body} body={body}/>)}
          </tbody>
        </table>
      </div>

      <div style={{height:18}}/>

      <div className="card" style={{padding:'14px 18px'}}>
        <div className="eyebrow">Method</div>
        <div style={{fontFamily:'var(--serif)', fontSize:15, color:'var(--ink-soft)', marginTop:4}}>
          {natal?.framework ?? 'True-sky sidereal'} · {natal?.houseSystem ?? 'houses unavailable'} · {natal?.nodeType ?? 'true'} nodes
        </div>
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
