// Screens: Birth Setup, Permission, Today (primary), Receipts, Method, Journal

// ── 1. Birth Setup ──
function BirthSetup() {
  return (
    <Phone>
      <div style={{padding:'40px 30px 30px', position:'relative', minHeight:'100%'}}>
        <Sprig size={70} flip
          style={{position:'absolute', top:34, right:14}}/>
        <div style={{position:'absolute', top:34, right:14}}><Sprig size={70} flip opacity={0.28}/></div>

        <Wordmark/>
        <div style={{height: 70}}/>

        <div className="eyebrow">Step 1 of 2</div>
        <div style={{height: 8}}/>
        <h1 className="h-display">Tell the app where and when you began.</h1>
        <div style={{height: 14}}/>
        <p className="body-prose" style={{fontSize:15}}>
          You enter this once. From here, the app uses where and when you are <em>now</em> — automatically — to read the sky for you.
        </p>

        <div style={{height: 32}}/>

        <FormField label="Birth date" value="13 April 1989"/>
        <FormField label="Exact birth time" value="1:55 PM" hint="If you're unsure, see method →"/>
        <FormField label="Birthplace" value="Tauranga, Bay of Plenty, NZ"/>

        <div style={{height: 28}}/>

        <button className="btn">Continue</button>
        <div style={{height: 14}}/>
        <p className="meta" style={{textAlign:'center', fontStyle:'italic', fontFamily:'var(--serif)', fontSize:13, color:'var(--ink-mute)'}}>
          Your birth details stay on your device.
        </p>
      </div>
    </Phone>
  );
}

function FormField({ label, value, hint }) {
  return (
    <div style={{marginBottom: 22}}>
      <div className="eyebrow" style={{marginBottom:6}}>{label}</div>
      <div style={{
        fontFamily:'var(--serif)', fontSize:20, color:'var(--ink)',
        borderBottom:'1px solid var(--hairline-strong)', paddingBottom:8,
        fontStyle: value ? 'normal' : 'italic',
      }}>{value || '—'}</div>
      {hint && <div className="meta" style={{marginTop:6, fontFamily:'var(--serif)', fontStyle:'italic', fontSize:13, color:'var(--ink-mute)'}}>{hint}</div>}
    </div>
  );
}

// ── 2. Permission / Location ──
function Permission() {
  return (
    <Phone>
      <div style={{padding:'40px 30px 30px', position:'relative', minHeight:'100%', display:'flex', flexDirection:'column'}}>
        <Wordmark/>
        <div style={{height: 60}}/>
        <div className="eyebrow">Step 2 of 2</div>
        <div style={{height: 8}}/>
        <h1 className="h-display">May we use your current location?</h1>
        <div style={{height:30}}/>

        {/* central illustration */}
        <div style={{display:'flex', justifyContent:'center', margin:'10px 0 20px'}}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* horizon */}
            <ellipse cx="90" cy="135" rx="78" ry="14" fill="none" stroke="var(--terracotta)" strokeWidth="0.6" opacity="0.4"/>
            {/* sky arc */}
            <path d="M12 135 Q90 -10 168 135" fill="none" stroke="var(--ink)" strokeWidth="0.7" opacity="0.45"/>
            {/* moon */}
            <g transform="translate(58, 50)"><MoonGlyph size={36} illumPct={74.6}/></g>
            {/* stars */}
            {[[40,80],[120,90],[140,60],[30,110],[150,110],[100,40]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="0.9" fill="var(--ink)" opacity="0.5"/>
            ))}
            {/* pin */}
            <g transform="translate(90,124)">
              <path d="M0 -16 C-7 -16 -10 -10 -10 -5 C-10 0 -3 8 0 16 C3 8 10 0 10 -5 C10 -10 7 -16 0 -16 Z"
                fill="var(--terracotta)"/>
              <circle r="3.2" fill="var(--bg)"/>
            </g>
            {/* ground line */}
            <line x1="20" y1="160" x2="160" y2="160" stroke="var(--ink)" strokeWidth="0.5" opacity="0.3"/>
          </svg>
        </div>

        <p className="body-prose" style={{fontSize:15}}>
          Your current location helps calculate moonrise, moonset, local sky visibility, and what the sky is actually doing where <em>you</em> are.
        </p>

        <div style={{height: 22}}/>

        <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
          <div style={{
            width:8, height:8, borderRadius:'50%',
            background:'var(--moss)', boxShadow:'0 0 0 4px rgba(106,123,63,0.15)'
          }}/>
          <div>
            <div className="eyebrow" style={{color:'var(--moss)'}}>Detected</div>
            <div style={{fontFamily:'var(--serif)', fontSize:18}}>Manly, Sydney</div>
          </div>
          <div style={{marginLeft:'auto', fontFamily:'var(--serif)', fontStyle:'italic', fontSize:14, color:'var(--ink-mute)', cursor:'pointer'}}>Change</div>
        </div>

        <div style={{flex:1, minHeight:24}}/>

        <button className="btn">Allow & Continue</button>
        <div style={{height: 10}}/>
        <button className="btn btn-ghost">Set location manually</button>
      </div>
    </Phone>
  );
}

Object.assign(window, { BirthSetup, Permission, FormField });
