// Reusable visual primitives

export function TurtleMark({ size = 26, color = "currentColor" }) {
  return (
    <svg width={size} height={size * (52/60)} viewBox="0 0 60 52" fill="none" style={{display:'block'}}>
      <ellipse cx="27" cy="27" rx="16" ry="13" fill={color}/>
      <ellipse cx="27" cy="19.5" rx="5.5" ry="3.8" fill="none" stroke="var(--bg)" strokeWidth="0.9" opacity="0.6"/>
      <ellipse cx="27" cy="27"   rx="6"   ry="4.3" fill="none" stroke="var(--bg)" strokeWidth="0.9" opacity="0.6"/>
      <ellipse cx="27" cy="34.5" rx="5.5" ry="3.8" fill="none" stroke="var(--bg)" strokeWidth="0.9" opacity="0.6"/>
      <path d="M21.5 19.5 Q16 23 16 27 Q16 31 21.5 34.5" stroke="var(--bg)" strokeWidth="0.8" fill="none" opacity="0.55"/>
      <path d="M32.5 19.5 Q39 23 39 27 Q39 31 32.5 34.5" stroke="var(--bg)" strokeWidth="0.8" fill="none" opacity="0.55"/>
      <ellipse cx="46.5" cy="25" rx="6.5" ry="5.5" fill={color}/>
      <circle cx="49" cy="22.5" r="1.3" fill="var(--bg)" opacity="0.7"/>
      <path d="M11 29 Q5 33.5 7.5 38.5" stroke={color} strokeWidth="3" strokeLinecap="round"/>
      <ellipse cx="18" cy="39" rx="5.5" ry="3" fill={color} transform="rotate(-28 18 39)"/>
      <ellipse cx="36" cy="39" rx="5.5" ry="3" fill={color} transform="rotate(28 36 39)"/>
      <ellipse cx="18" cy="15" rx="5.5" ry="3" fill={color} transform="rotate(28 18 15)"/>
      <ellipse cx="36" cy="15" rx="5.5" ry="3" fill={color} transform="rotate(-28 36 15)"/>
    </svg>
  );
}

export function Wordmark({ small }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{color:'var(--terracotta)'}}><TurtleMark size={small?20:24}/></span>
      <span style={{
        fontFamily:'var(--serif-sc)',
        fontSize: small? 13:15,
        letterSpacing:'0.18em',
        color:'var(--ink)',
        fontWeight:500
      }}>MoonTurtle</span>
    </div>
  );
}

export function MoonGlyph({ size = 40, illumPct = 74.6, waxing = false }) {
  const r = size / 2 - 1;
  const cx = size / 2, cy = size / 2;
  const phaseFrac = waxing ? illumPct / 200 : 1 - illumPct / 200;
  const isNew  = illumPct < 3;
  const isFull = illumPct > 97;

  if (isNew) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="#1a0e05" stroke="var(--ink-soft)" strokeWidth="0.5" opacity="0.8"/>
    </svg>
  );
  if (isFull) return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="#f6ecd6" stroke="var(--ink-soft)" strokeWidth="0.4"/>
    </svg>
  );
  const w = phaseFrac <= 0.5;
  const rx = Math.abs(r * Math.cos(2 * Math.PI * phaseFrac));
  const isGibbous = (w && phaseFrac > 0.25) || (!w && phaseFrac < 0.75);
  let path;
  if (w) {
    const s = isGibbous ? 0 : 1;
    path = `M${cx} ${cy-r} A${r} ${r} 0 0 1 ${cx} ${cy+r} A${Math.max(0.5,rx)} ${r} 0 0 ${s} ${cx} ${cy-r}`;
  } else {
    const s = isGibbous ? 1 : 0;
    path = `M${cx} ${cy-r} A${r} ${r} 0 0 0 ${cx} ${cy+r} A${Math.max(0.5,rx)} ${r} 0 0 ${s} ${cx} ${cy-r}`;
  }
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="#1a0e05" opacity="0.85"/>
      <path d={path} fill="#f6ecd6"/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--ink-soft)" strokeWidth="0.4" opacity="0.5"/>
    </svg>
  );
}

export function Sprig({ size = 70, flip = false, opacity = 0.35 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" fill="none"
      style={{transform: flip?'scaleX(-1)':'none', opacity}}>
      <path d="M10 60 Q22 42 38 32 Q28 22 12 12" stroke="var(--terracotta)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <ellipse cx="36" cy="32" rx="7" ry="4" fill="var(--terracotta)" transform="rotate(-32 36 32)" opacity="0.7"/>
      <ellipse cx="25" cy="42" rx="5.5" ry="3.4" fill="var(--terracotta)" transform="rotate(-18 25 42)" opacity="0.55"/>
      <ellipse cx="16" cy="52" rx="5" ry="3" fill="var(--terracotta)" transform="rotate(-8 16 52)" opacity="0.4"/>
    </svg>
  );
}

export function SunGlyph({ size = 24 }) {
  const cx = size/2, cy = size/2;
  return (
    <svg width={size} height={size}>
      <circle cx={cx} cy={cy} r={size/4} fill="none" stroke="var(--terracotta)" strokeWidth="1.2"/>
      <circle cx={cx} cy={cy} r="1.2" fill="var(--terracotta)"/>
      {[...Array(8)].map((_,i)=>{
        const a = (i*Math.PI)/4;
        const r1 = size/4+2, r2=size/2-1;
        const x1=cx+Math.cos(a)*r1, y1=cy+Math.sin(a)*r1;
        const x2=cx+Math.cos(a)*r2, y2=cy+Math.sin(a)*r2;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--terracotta)" strokeWidth="1" strokeLinecap="round"/>;
      })}
    </svg>
  );
}

export function OrnamentDiv() {
  return (
    <div className="divider-ornament">
      <svg width="14" height="14" viewBox="0 0 14 14">
        <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
        <circle cx="7" cy="7" r="5" fill="none" stroke="currentColor" strokeWidth="0.5"/>
      </svg>
    </div>
  );
}

export function TabBar({ active, onTab }) {
  const tabs = [
    { id: 'today',   label: 'Today',
      icon: <SunGlyph size={20}/> },
    { id: 'sky',     label: 'Sky',
      icon: <MoonGlyph size={18} illumPct={74.6}/> },
    { id: 'natal',   label: 'Natal',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="0.6"/>
        </svg>
      )},
    { id: 'journal', label: 'Journal',
      icon: (
        <svg width="18" height="20" viewBox="0 0 18 20">
          <rect x="1" y="1" width="16" height="18" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <line x1="4" y1="6"  x2="14" y2="6"  stroke="currentColor" strokeWidth="0.6"/>
          <line x1="4" y1="10" x2="14" y2="10" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="4" y1="14" x2="11" y2="14" stroke="currentColor" strokeWidth="0.6"/>
        </svg>
      )},
    { id: 'method',  label: 'Method',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <text x="10" y="14" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic" fill="currentColor">i</text>
        </svg>
      )},
  ];
  return (
    <div className="tab-bar">
      {tabs.map(t => (
        <div key={t.id} className={`tab${active===t.id?' active':''}`} onClick={()=>onTab(t.id)}>
          {t.icon}
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
