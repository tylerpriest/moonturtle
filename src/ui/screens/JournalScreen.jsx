import { useState } from 'react';
import { getArchivedReading } from '../../reading/cache.js';
import { buildReadingSharePayload } from '../../reading/share.js';
import { MoonGlyph } from '../components/Primitives.jsx';
import { ShareButton } from '../components/ShareButton.jsx';

function groupJournal(journal) {
  const groups = [];
  const byDate = new Map();
  for (const entry of journal ?? []) {
    const key = entry.dateKey ?? entry.localDate ?? 'unknown';
    if (!byDate.has(key)) {
      const group = {
        dateKey: key,
        localDate: entry.localDate ?? key,
        phase: entry.phase,
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

function orderEntries(entries = [], currentReadingId) {
  return [...entries].sort((a, b) => {
    const aCurrent = a.readingId === currentReadingId;
    const bCurrent = b.readingId === currentReadingId;
    if (aCurrent !== bCurrent) return aCurrent ? -1 : 1;
    if (Boolean(a.preferred) !== Boolean(b.preferred)) return a.preferred ? -1 : 1;
    return 0;
  });
}

function ribbonFromGroups(groups) {
  return groups.slice(0, 14).reverse();
}

function compactDateLabel(group) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(group?.dateKey ?? '');
  if (match) {
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][Number(match[2]) - 1];
    return `${Number(match[3])} ${month}`;
  }
  const label = String(group?.localDate ?? group?.dateKey ?? '').replace(/^\w+\s+/, '').replace(/\s+\d{4}$/, '');
  return label || 'Date';
}

function modeBadge(entry) {
  if (entry.isFallback) return 'Local engine · MoonTurtle';
  return `${entry.modeLabel ?? 'Quick glance'} · ${entry.modelLabel ?? 'GPT-5.5'}`;
}

function engineLabel(entry, reading) {
  return reading?.engineLabel ?? entry?.engineLabel ?? entry?.sourceLabel ?? 'Reading engine';
}

function formatDuration(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${Math.round(ms / 1000)}s`;
}

function failureStage(code) {
  if (code === 'local_provider_timeout') return 'Codex bridge';
  if (code === 'provider_timeout') return 'Browser wait';
  if (code === 'provider_invalid_schema') return 'Schema validation';
  if (code === 'provider_not_attempted') return 'Provider selection';
  if (code === 'api_key_provider_error') return 'API provider';
  if (String(code ?? '').startsWith('provider_http_')) return 'Provider HTTP response';
  return 'AI interpretation';
}

function FailureDetails({ reading }) {
  const attempt = reading?.aiAttempt;
  if (!attempt || attempt.status === 'completed' || attempt.status === 'skipped') return null;
  const duration = formatDuration(attempt.durationMs);
  return (
    <div style={{marginTop:10, paddingTop:10, borderTop:'1px solid rgba(176,74,38,0.28)'}}>
      <div className="eyebrow" style={{color:'var(--terracotta)'}}>Where it failed</div>
      <div className="meta" style={{marginTop:6, lineHeight:1.45, letterSpacing:'0.03em'}}>
        Stage: {failureStage(attempt.code)}{duration ? ` · Waited ${duration}` : ''}
      </div>
      {attempt.code && (
        <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
          Code: {attempt.code}
        </div>
      )}
      {attempt.detail?.length > 0 && (
        <div className="meta" style={{marginTop:5, lineHeight:1.45, letterSpacing:'0.03em'}}>
          Detail: {attempt.detail.join(' | ')}
        </div>
      )}
    </div>
  );
}

function DetailList({ title, items = [], color }) {
  if (!items.length) return null;
  return (
    <div className="card" style={{borderTop:`2px solid ${color}`}}>
      <div className="section-label" style={{color}}>{title}</div>
      <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <span style={{
              flexShrink:0,
              marginTop:7,
              width:6,
              height:6,
              borderRadius:'50%',
              background:color,
              display:'block',
            }}/>
            <span className="body-prose" style={{fontSize:15}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailActivation({ activation, index }) {
  return (
    <div className="card" style={{padding:'16px 18px'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12}}>
        <div className="h-card">{activation.title}</div>
        <div className="meta">{String(index).padStart(2, '0')}</div>
      </div>
      <div className="meta" style={{marginTop:4, marginBottom:9, fontStyle:'italic', fontFamily:'var(--serif)', fontSize:13}}>
        Activates {activation.activates}
      </div>
      <p className="body-prose" style={{fontSize:15}}>{activation.theme}</p>
      {activation.question && (
        <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:15, color:'var(--ink)', borderLeft:'2px solid var(--ochre)', paddingLeft:12, marginTop:10}}>
          "{activation.question}"
        </div>
      )}
      {activation.insight && (
        <div className="meta" style={{marginTop:10, lineHeight:1.45, letterSpacing:'0.03em'}}>
          {activation.insight}
        </div>
      )}
    </div>
  );
}

function ReadingDetail({ selected, onBack }) {
  const { entry, reading } = selected;
  const unavailable = !reading;
  const sharePayload = unavailable
    ? null
    : buildReadingSharePayload({ reading, entry });
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <button type="button" className="journal-back-button" onClick={onBack}>
        Back to journal
      </button>

      <div style={{height:16}}/>
      <div className="eyebrow">{entry.localDate ?? entry.dateKey}</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>{entry.headline ?? reading?.headline ?? 'Past reading'}</h1>
      <div style={{display:'flex', gap:7, flexWrap:'wrap', marginTop:12}}>
        <span className="chip" style={{
          color: entry.isFallback ? 'var(--terracotta)' : 'var(--ink-soft)',
          borderColor: entry.isFallback ? 'rgba(176,74,38,0.45)' : 'var(--hairline-strong)',
        }}>
          {modeBadge(entry)}
        </span>
        {entry.preferred && <span className="chip">Preferred</span>}
      </div>
      {!unavailable && (
        <div className="reading-actions is-compact">
          <ShareButton payload={sharePayload}/>
        </div>
      )}

      <div style={{height:18}}/>
      <div className={`card warm ${entry.isFallback ? 'is-fallback' : ''}`} style={{padding:'22px 20px'}}>
        <div style={{display:'flex', alignItems:'center', gap:13, marginBottom:14}}>
          <MoonGlyph size={38} illumPct={entry.illumination} waxing={entry.waxing}/>
          <div>
            <div className="eyebrow">{entry.phase} · {entry.moonSign}</div>
            <div className="meta" style={{marginTop:2}}>{entry.illumination}% lit</div>
          </div>
        </div>

        {unavailable ? (
          <>
            <div className="section-label">Snapshot unavailable</div>
            <p className="body-prose">
              This older journal card was saved before MoonTurtle began archiving full reading snapshots. New readings will open here with the complete text.
            </p>
          </>
        ) : (
          <>
            {reading.isFallback && (
              <div className="fallback-banner" style={{marginTop:0}}>
                <div className="eyebrow" style={{color:'var(--terracotta)'}}>Local engine shown</div>
                <p className="body-prose" style={{fontSize:15, marginTop:5}}>
                  This reading is MoonTurtle local synthesis from calculated receipts.
                </p>
                <FailureDetails reading={reading}/>
              </div>
            )}
            <p className="body-prose">{reading.summaryLine ?? reading.body}</p>
            <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--hairline)'}}>
              <div className="meta">Engine: {engineLabel(entry, reading)}</div>
              {reading.aiAttempt?.message && (
                <div className="meta" style={{marginTop:5, lineHeight:1.4}}>
                  {reading.aiAttempt.message}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!unavailable && reading.glanceItems?.length > 0 && (
        <>
          <div style={{height:18}}/>
          <DetailList title="Quick Glance" color="var(--terracotta)" items={reading.glanceItems}/>
        </>
      )}

      {!unavailable && (reading.fullReading || reading.body) && (
        <>
          <div style={{height:18}}/>
          <div className="section-label">Full Reading</div>
          <div className="card warm" style={{padding:'20px'}}>
            <p className="body-prose">{reading.fullReading ?? reading.body}</p>
          </div>
        </>
      )}

      {!unavailable && reading.lunarAxis && (
        <>
          <div style={{height:18}}/>
          <div className="section-label">Moon axis</div>
          <div className="card">
            <div style={{display:'flex', justifyContent:'space-between', gap:16, marginBottom:12}}>
              <div>
                <div className="eyebrow">Natal Moon</div>
                <div className="h-card">{reading.lunarAxis.natal.sign}</div>
                <div className="meta">{reading.lunarAxis.natal.house}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div className="eyebrow">Sky Moon</div>
                <div className="h-card">{reading.lunarAxis.current.sign}</div>
                <div className="meta">now</div>
              </div>
            </div>
            <p className="body-prose" style={{fontSize:15, fontStyle:'italic'}}>
              {reading.lunarAxis.reading}
            </p>
          </div>
        </>
      )}

      {!unavailable && reading.activations?.length > 0 && (
        <>
          <div style={{height:18}}/>
          <div className="section-label">Activations</div>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {reading.activations.map((activation, index) => (
              <DetailActivation key={`${activation.title}-${index}`} activation={activation} index={index + 1}/>
            ))}
          </div>
        </>
      )}

      {!unavailable && (
        <>
          <div style={{height:18}}/>
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            <DetailList title="What to Notice" color="var(--moss)" items={reading.notice}/>
            <DetailList title="What to Avoid Overdoing" color="var(--plum)" items={reading.avoid}/>
          </div>
        </>
      )}

      <div style={{height:20}}/>
    </div>
  );
}

export function JournalScreen({ state }) {
  const [selected, setSelected] = useState(null);
  const [expandedDates, setExpandedDates] = useState({});
  const journal = state?.journal ?? [];
  const groups = groupJournal(journal);
  const ribbon = ribbonFromGroups(groups);
  const currentReadingId = state?.reading?.readingId;

  function openEntry(entry) {
    const archived = getArchivedReading(entry.birthHash, entry.readingId);
    const current = state?.reading?.readingId === entry.readingId ? state.reading : null;
    setSelected({ entry, reading: archived ?? current });
  }

  function toggleDate(dateKey) {
    setExpandedDates((prev) => ({ ...prev, [dateKey]: !prev[dateKey] }));
  }

  if (selected) {
    return <ReadingDetail selected={selected} onBack={() => setSelected(null)}/>;
  }

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">{state?.sky?.localDate ?? 'Journal'}</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>The pattern of your days.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        Past readings, held lightly. No streaks. No pressure.
      </p>

      <div style={{height:22}}/>

      {ribbon.length > 0 && (
        <div style={{
          display:'flex',
          gap:6,
          justifyContent:ribbon.length < 8 ? 'space-between' : 'flex-start',
          overflowX:'auto',
          marginBottom:22,
          padding:'14px 0',
          borderTop:'1px solid var(--hairline)',
          borderBottom:'1px solid var(--hairline)',
        }}>
          {ribbon.map((group) => (
            <div
              key={group.dateKey}
              title={`${group.localDate}: ${group.phase ?? 'Moon'} in ${group.moonSign ?? 'the sky'}, ${group.illumination}% lit`}
              aria-label={`${group.localDate}: ${group.phase ?? 'Moon'} in ${group.moonSign ?? 'the sky'}, ${group.illumination}% lit`}
              style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4, minWidth:34}}
            >
              <MoonGlyph size={16} illumPct={group.illumination} waxing={group.waxing}/>
              <div className="journal-ribbon-date">{compactDateLabel(group)}</div>
            </div>
          ))}
        </div>
      )}

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
                  {group.entries.length > 1 && <div className="chip" style={{padding:'2px 7px', fontSize:9}}>{group.entries.length} readings</div>}
                </div>
              </div>
              <div className="meta" style={{marginBottom:10}}>Moon in {group.moonSign} · {group.illumination}% lit</div>
              <div style={{display:'flex', flexDirection:'column', gap:10}}>
                {orderEntries(group.entries, currentReadingId)
                  .slice(0, expandedDates[group.dateKey] ? undefined : 1)
                  .map((entry, variantIndex) => (
                  <button
                    type="button"
                    key={entry.readingId ?? `${entry.dateKey}-${variantIndex}`}
                    className="journal-entry-button"
                    onClick={() => openEntry(entry)}
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
                    <div style={{display:'flex', justifyContent:'space-between', gap:10, alignItems:'center'}}>
                      <div className="meta" style={{lineHeight:1.4, letterSpacing:'0.03em'}}>
                        {entry.engineLabel ?? entry.sourceLabel ?? 'Reading engine'}
                      </div>
                      <div className="meta" style={{color:'var(--terracotta)', whiteSpace:'nowrap'}}>
                        Open
                      </div>
                    </div>
                  </button>
                ))}
                {group.entries.length > 1 && (
                  <button
                    type="button"
                    className="journal-toggle-button"
                    onClick={() => toggleDate(group.dateKey)}
                  >
                    {expandedDates[group.dateKey] ? 'Hide other readings' : `Show ${group.entries.length - 1} other reading${group.entries.length === 2 ? '' : 's'}`}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
