// Reusable visual primitives

export function TurtleMark({ size = 26, color = "currentColor", decorative = false }) {
  return (
    <svg
      width={size}
      height={size * (56/72)}
      viewBox="0 0 72 56"
      fill="none"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'MoonTurtle mark'}
      aria-hidden={decorative ? 'true' : undefined}
      focusable="false"
      style={{display:'block'}}
    >
      <path
        d="M16.5 29.4 C16.5 18.6 26.2 10.2 40.2 10.2 C53.4 10.2 62.5 18 62.5 28.1 C62.5 38.8 53 46.1 39.8 46.1 C26 46.1 16.5 39.2 16.5 29.4 Z"
        fill={color}
      />
      <path
        d="M59.8 27.6 C62.4 22.4 66.9 21.6 69.2 25.2 C71.5 28.8 69.2 34 64.3 35.3 C62 35.9 59.9 34.8 58.6 32.7"
        fill={color}
      />
      <path
        d="M17.7 30.6 C12.5 32.3 8 35.5 5.8 40.3"
        stroke={color}
        strokeWidth="3.8"
        strokeLinecap="round"
      />
      <ellipse cx="23.9" cy="45.3" rx="6.3" ry="3.5" fill={color} transform="rotate(-24 23.9 45.3)"/>
      <ellipse cx="49.2" cy="45" rx="6.1" ry="3.4" fill={color} transform="rotate(24 49.2 45)"/>
      <ellipse cx="24.4" cy="10.8" rx="6.3" ry="3.5" fill={color} transform="rotate(24 24.4 10.8)"/>
      <ellipse cx="50" cy="11.1" rx="6.1" ry="3.4" fill={color} transform="rotate(-24 50 11.1)"/>
      <circle cx="66.4" cy="26.7" r="1.15" fill="var(--paper)" opacity="0.86"/>
      <path
        d="M41.1 15.5 C35.3 17.5 31.3 22.5 31.3 28.2 C31.3 34 35.2 38.8 41 40.6 C36.7 41.2 28 38.3 28 28.2 C28 18.5 36.6 14.6 41.1 15.5 Z"
        fill="var(--paper)"
        opacity="0.74"
      />
      <path
        d="M38.5 14.8 C49 17.1 56 22.2 57.8 29.2 M21.5 29.3 C24.3 20.8 31.1 15.9 40.3 14.4 M22.5 33.1 C28.7 40.2 38.6 43.1 51 39.6"
        stroke="var(--paper)"
        strokeWidth="0.95"
        strokeLinecap="round"
        opacity="0.54"
      />
      <path
        d="M36.7 15.1 C34 21.3 34.1 34.7 37 42.1 M47 17.5 C43.7 23.1 43.1 34.1 46.1 40.7"
        stroke="var(--paper)"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.46"
      />
      {[
        [33.2, 18.7], [39.4, 18], [45.8, 20],
        [28.7, 24.1], [36.2, 25.1], [43.7, 25.2], [51, 27.1],
        [29.6, 33.1], [36.9, 31.6], [44.8, 32.4],
        [34.1, 38.2], [40.4, 38.9], [47.8, 37.1],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.9" fill="var(--paper)" opacity="0.68"/>
      ))}
    </svg>
  );
}

export function Wordmark({ small }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap:8}}>
      <span style={{color:'var(--terracotta)'}}><TurtleMark size={small?23:27} decorative/></span>
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
    { id: 'profile', label: 'Profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <circle cx="10" cy="10" r="4" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="0.6"/>
          <line x1="10" y1="2" x2="10" y2="18" stroke="currentColor" strokeWidth="0.6"/>
        </svg>
      )},
    { id: 'ask',     label: 'Ask',
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="0.8"/>
          <path d="M6.2 8.1 C6.8 5.9 9.1 4.9 11.2 5.5 C13.2 6.1 14 7.9 13.3 9.5 C12.7 11 11.2 11.5 10.2 12.4 C9.6 12.9 9.4 13.4 9.4 14.1" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/>
          <circle cx="9.4" cy="16" r="0.8" fill="currentColor"/>
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
  ];
  return (
    <nav className="tab-bar" aria-label="Primary">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          className={`tab${active===t.id?' active':''}`}
          onClick={() => onTab(t.id)}
          aria-current={active === t.id ? 'page' : undefined}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
