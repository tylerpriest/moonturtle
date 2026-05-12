import { useEffect, useState } from 'react';

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function houseLabel(n) {
  return n ? `${ordinal(n)} house` : 'house unknown';
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

function useElapsedSeconds(startedAt, active) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!active) return undefined;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, startedAt]);

  if (!active || !startedAt) return 0;
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}

function ProfileLoading({ loading }) {
  const elapsed = useElapsedSeconds(loading?.startedAt, Boolean(loading));
  return (
    <div className="card warm" style={{padding:'24px 22px'}}>
      <div className="section-label">Profile</div>
      <h1 className="h-display" style={{fontSize:26}}>Writing your baseline.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        MoonTurtle is calculating the natal receipts first, then asking the selected AI to write the stable comprehensive profile.
      </p>
      <div className="status-surface" style={{marginTop:16}}>
        <div style={{display:'flex', justifyContent:'space-between', gap:12}}>
          <div>
            <div className="eyebrow">{loading?.statusLabel ?? 'Profile'}</div>
            <div className="status-title">{loading?.detail ?? 'Preparing profile'}</div>
          </div>
          <div className="status-pill">{elapsed}s</div>
        </div>
        <div className="thinking-line" style={{marginTop:12}}/>
      </div>
    </div>
  );
}

function ProfileSection({ title, children }) {
  if (!children) return null;
  return (
    <div className="card" style={{padding:'18px 20px'}}>
      <div className="section-label">{title}</div>
      {typeof children === 'string'
        ? <p className="body-prose" style={{fontSize:15}}>{children}</p>
        : children}
    </div>
  );
}

function BulletList({ title, items = [], color = 'var(--moss)' }) {
  if (!items?.length) return null;
  return (
    <div className="card" style={{borderTop:`2px solid ${color}`}}>
      <div className="section-label" style={{color}}>{title}</div>
      <ul style={{listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
        {items.map((item, index) => (
          <li key={`${title}-${index}`} style={{display:'flex', gap:10, alignItems:'flex-start'}}>
            <span style={{width:6, height:6, borderRadius:'50%', background:color, flexShrink:0, marginTop:7}}/>
            <span className="body-prose" style={{fontSize:15}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FallbackBanner({ profile, onRetry }) {
  if (!profile?.isFallback) return null;
  return (
    <div className="fallback-banner">
      <div className="eyebrow" style={{color:'var(--terracotta)'}}>Rough local profile</div>
      <p className="body-prose" style={{fontSize:15, marginTop:5}}>
        The comprehensive AI profile did not complete. This is a local fallback from natal receipts.
      </p>
      {profile.fallbackReason && (
        <p className="meta" style={{marginTop:7, lineHeight:1.4}}>{profile.fallbackReason}</p>
      )}
      {onRetry && profile.providerAttempted && (
        <button type="button" className="btn btn-ghost" onClick={onRetry} style={{marginTop:12, padding:'10px 14px', fontSize:11}}>
          Retry AI Profile
        </button>
      )}
    </div>
  );
}

export function ProfileScreen({ state, profileState, user }) {
  const natal = profileState?.natal ?? state?.natal;
  const profile = profileState?.profile;
  const birth = user?.birth;
  const isLoading = profileState?.status === 'loading' || (profileState?.status === 'idle' && !profile);

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">
        {birth ? `${birth.date} · ${birth.timeKnown ? birth.time : 'time unknown'} · ${birth.place.name}` : 'Profile'}
      </div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>Your profile.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        The stable natal operating manual. Today changes; this is the baseline Today reads through.
      </p>

      <div style={{height:22}}/>

      {isLoading && <ProfileLoading loading={profileState?.loading}/>}

      {profileState?.status === 'error' && (
        <div className="fallback-banner">
          <div className="eyebrow" style={{color:'var(--terracotta)'}}>Profile error</div>
          <p className="body-prose" style={{fontSize:15, marginTop:5}}>
            MoonTurtle could not prepare the profile. The natal receipts below are still available.
          </p>
        </div>
      )}

      {profile && (
        <>
          <div className={`card warm ${profile.isFallback ? 'is-fallback' : ''}`} style={{padding:'24px 22px'}}>
            <div className="section-label">Comprehensive Profile</div>
            <FallbackBanner profile={profile} onRetry={profileState?.refresh}/>
            <h2 className="h-display" style={{fontSize:25, marginBottom:12}}>
              Comprehensive natal profile
            </h2>
            <p className="body-prose" style={{marginBottom:12}}>{profile.profileSummary}</p>
            <p className="body-prose">{profile.corePattern}</p>
            <div style={{marginTop:14, paddingTop:12, borderTop:'1px solid var(--hairline)'}}>
              <div className="meta">Engine: {profile.engineLabel ?? 'Reading engine'}</div>
              {profile.aiAttempt?.message && (
                <div className="meta" style={{marginTop:5, lineHeight:1.4}}>{profile.aiAttempt.message}</div>
              )}
              {profile.sourceDetail?.caveat && (
                <details style={{marginTop:8}}>
                  <summary className="meta" style={{cursor:'pointer', color:'var(--terracotta)'}}>Why this profile?</summary>
                  <p className="meta" style={{marginTop:8, lineHeight:1.45}}>{profile.sourceDetail.caveat}</p>
                </details>
              )}
            </div>
          </div>

          <div style={{height:14}}/>
          <ProfileSection title="Angles">{profile.angles}</ProfileSection>
          <div style={{height:12}}/>
          <ProfileSection title="Chart Ruler">{profile.chartRuler}</ProfileSection>
          <div style={{height:12}}/>
          <ProfileSection title="Natal Moon">{profile.natalMoon}</ProfileSection>
          <div style={{height:12}}/>
          <ProfileSection title="Major Clusters">{profile.majorClusters}</ProfileSection>
          <div style={{height:12}}/>
          <BulletList title="Strengths" items={profile.strengths} color="var(--moss)"/>
          <div style={{height:12}}/>
          <BulletList title="Shadows" items={profile.shadows} color="var(--plum)"/>
          <div style={{height:12}}/>
          <ProfileSection title="How to Use Today">{profile.howToUseDailyReadings}</ProfileSection>
        </>
      )}

      <div style={{height:22}}/>
      <div className="section-label">Natal Receipts</div>
      {natal?.angles?.length > 0 && (
        <>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:18}}>
            {natal.angles.map((angle) => (
              <div key={angle.angle} className="card" style={{padding:'14px 16px'}}>
                <div className="eyebrow">{angle.angle}</div>
                <div style={{fontFamily:'var(--serif)', fontSize:20, fontStyle:'italic', marginTop:2, color:'var(--terracotta)'}}>{angle.degree}° {angle.sign}</div>
              </div>
            ))}
          </div>
        </>
      )}
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
