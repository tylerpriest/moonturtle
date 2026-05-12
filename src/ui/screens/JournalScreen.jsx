import { MoonGlyph } from '../components/Primitives.jsx';

function ribbonFromJournal(journal) {
  if (!journal?.length) return [3, 12, 28, 45, 62, 78, 90, 98, 94, 82, 68, 52, 36, 20];
  return journal.slice(0, 14).reverse().map((entry) => entry.illumination);
}

function groupJournal(journal) {
  const groups = [];
  const byDate = new Map();
  for (const entry of journal ?? []) {
    const key = entry.dateKey ?? entry.localDate ?? 'unknown';
    if (!byDate.has(key)) {
      const group = {
        dateKey: key,
        localDate: entry.localDate ?? key,
        illumination: entry.illumination,
        waxing: entry.waxing,
        moonSign: entry.moonSign,
        entries: [],
      };
      byDate.set(key, group);
      groups.push(group);
    }
    byDate.get(key).entries.push(entry);
  }
  return groups;
}

function modeBadge(entry) {
  if (entry.isFallback) return 'Fallback · Local deterministic';
  return `${entry.modeLabel ?? 'Quick glance'} · ${entry.modelLabel ?? 'GPT-5.5'}`;
}

export function JournalScreen({ state }) {
  const journal = state?.journal ?? [];
  const ribbon = ribbonFromJournal(journal);
  const groups = groupJournal(journal);

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">{state?.sky?.localDate ?? 'Journal'}</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>The pattern of your days.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        Past readings, held lightly. No streaks. No score.
      </p>

      <div style={{height:22}}/>

      <div style={{
        display:'flex',
        gap:6,
        justifyContent:'space-between',
        marginBottom:22,
        padding:'14px 0',
        borderTop:'1px solid var(--hairline)',
        borderBottom:'1px solid var(--hairline)',
      }}>
        {ribbon.map((illumination, index) => (
          <div key={`${illumination}-${index}`} style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
            <MoonGlyph size={16} illumPct={illumination} waxing={index < ribbon.length / 2}/>
            <div style={{fontFamily:'var(--sans)', fontSize:9, color:'var(--ink-mute)'}}>{index + 1}</div>
          </div>
        ))}
      </div>

      {!journal.length && (
        <div className="card warm">
          <div className="section-label">First entry</div>
          <p className="body-prose">Today’s reading will appear here after the first calculation finishes.</p>
        </div>
      )}

      <div style={{display:'flex', flexDirection:'column', gap:14}}>
        {groups.map((group, index) => (
          <div key={group.dateKey} className={index === 0 ? 'card warm' : 'card'} style={{padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start'}}>
            <div style={{flexShrink:0, paddingTop:3}}>
              <MoonGlyph size={32} illumPct={group.illumination} waxing={group.waxing}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:10, marginBottom:3}}>
                <div className="eyebrow">{group.localDate}</div>
                <div style={{display:'flex', gap:6, flexWrap:'wrap', justifyContent:'flex-end'}}>
                  {group.dateKey === state?.sky?.localDateKey && <div className="chip" style={{padding:'2px 7px', fontSize:9}}>Today</div>}
                  {group.entries.length > 1 && <div className="chip" style={{padding:'2px 7px', fontSize:9}}>{group.entries.length} variants</div>}
                </div>
              </div>
              <div className="meta" style={{marginBottom:10}}>Moon in {group.moonSign} · {group.illumination}% lit</div>
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {group.entries.map((entry, variantIndex) => (
                  <div
                    key={entry.readingId ?? `${entry.dateKey}-${variantIndex}`}
                    style={{
                      paddingTop: variantIndex === 0 ? 0 : 10,
                      borderTop: variantIndex === 0 ? 'none' : '1px solid var(--hairline)',
                    }}
                  >
                    <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap', marginBottom:4}}>
                      <span className="chip" style={{
                        padding:'2px 7px',
                        fontSize:9,
                        color: entry.isFallback ? 'var(--terracotta)' : 'var(--ink-soft)',
                        borderColor: entry.isFallback ? 'rgba(176,74,38,0.45)' : 'var(--hairline-strong)',
                      }}>
                        {modeBadge(entry)}
                      </span>
                      {entry.preferred && <span className="chip" style={{padding:'2px 7px', fontSize:9}}>Preferred</span>}
                    </div>
                    <div style={{fontFamily:'var(--serif)', fontSize:16, fontStyle:'italic', color:'var(--ink)', marginBottom:3}}>
                      {entry.headline}
                    </div>
                    <div className="meta" style={{lineHeight:1.4, letterSpacing:'0.03em'}}>
                      {entry.engineLabel ?? entry.sourceLabel ?? 'Reading engine'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
