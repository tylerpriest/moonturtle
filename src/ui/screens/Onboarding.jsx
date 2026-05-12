import { useState } from 'react';
import { Wordmark, Sprig, MoonGlyph } from '../components/Primitives.jsx';
import { searchPlaces, reversePlaceName } from '../../io/geocoding.js';
import { lookupTimeZone } from '../../io/timezone.js';
import { DEMO_USER } from '../../io/storage.js';

function InputField({ label, hint, ...props }) {
  return (
    <label className="onboard-field">
      <span className="eyebrow">{label}</span>
      <input
        {...props}
      />
      {hint && (
        <span className="meta onboard-field-hint">{hint}</span>
      )}
    </label>
  );
}

function placeFromResult(result) {
  return {
    name: result.name,
    lat: result.lat,
    lon: result.lon,
  };
}

function ManualPlaceButton({ place, onClick, children }) {
  return (
    <button
      type="button"
      className="btn btn-ghost"
      onClick={onClick}
      style={{textAlign:'left', letterSpacing:'0.08em', lineHeight:1.35, marginTop:8, padding:'11px 14px', fontSize:11}}
    >
      {children ?? place.name}
    </button>
  );
}

export function BirthSetup({ onNext }) {
  const [displayName, setDisplayName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [birthPlaceQuery, setBirthPlaceQuery] = useState('');
  const [birthPlace, setBirthPlace] = useState(null);
  const [birthTimeZone, setBirthTimeZone] = useState('');
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('');

  async function handleSearch() {
    if (!birthPlaceQuery.trim()) {
      setStatus('Enter a city, region, or country first.');
      return;
    }
    setStatus('Searching places...');
    const found = await searchPlaces(birthPlaceQuery.trim());
    setResults(found);
    setStatus(found.length ? 'Choose the birthplace that matches.' : 'No matches found. Try city, region, country.');
  }

  function choosePlace(result) {
    const place = placeFromResult(result);
    setBirthPlace(place);
    setBirthPlaceQuery(place.name);
    setBirthTimeZone(lookupTimeZone(place.lat, place.lon));
    setResults([]);
    setStatus(`Using ${place.name}.`);
  }

  function useDevProfile() {
    setDisplayName(DEMO_USER.displayName);
    setBirthDate(DEMO_USER.birth.date);
    setBirthTime(DEMO_USER.birth.time);
    setBirthPlace(DEMO_USER.birth.place);
    setBirthPlaceQuery(DEMO_USER.birth.place.name);
    setBirthTimeZone(DEMO_USER.birth.timeZone);
    setResults([]);
    setStatus('Tyler dev profile added. Continue when you want to test with seed details.');
  }

  function continueWithBirth() {
    if (!birthDate) {
      setStatus('Add a birth date before continuing.');
      return;
    }
    if (!birthPlace) {
      setStatus('Find and choose a birthplace before continuing.');
      return;
    }
    const place = birthPlace;
    onNext({
      schemaVersion: 1,
      displayName: displayName.trim() || 'You',
      birth: {
        date: birthDate,
        time: birthTime,
        timeZone: birthTimeZone || lookupTimeZone(place.lat, place.lon),
        timeKnown: Boolean(birthTime),
        place,
      },
    });
  }

  return (
    <div className="onboard-shell">
      <div className="onboard-panel onboard-panel-birth">
        <div style={{position:'absolute', top:42, right:14}}>
          <Sprig size={70} flip opacity={0.28}/>
        </div>

        <Wordmark/>
        <div className="onboard-word-gap"/>

        <div className="eyebrow">Step 1 of 2</div>
        <div style={{height:6}}/>
        <h1 className="h-display">Tell the app where and when you began.</h1>
        <div style={{height:10}}/>
        <p className="body-prose" style={{fontSize:15}}>
          Your birth details stay on this device. They are used to calculate the natal chart that today's sky activates.
        </p>

        <div className="onboard-form-gap"/>

        <InputField label="Name" value={displayName} onChange={(event) => setDisplayName(event.target.value)} autoComplete="name"/>
        <InputField label="Birth date" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)}/>
        <InputField label="Exact birth time" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} hint="Leave blank only if the time is unknown."/>
        <InputField
          label="Birthplace"
          value={birthPlaceQuery}
          onChange={(event) => {
            setBirthPlaceQuery(event.target.value);
            setBirthPlace(null);
          }}
        />

        <button className="btn btn-ghost onboard-find-button" type="button" onClick={handleSearch}>Find Birthplace</button>

        {status && <p className="meta" style={{marginTop:10}}>{status}</p>}

        {results.length > 0 && (
          <div style={{display:'flex', flexDirection:'column', gap:8, marginTop:12}}>
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                className="card"
                onClick={() => choosePlace(result)}
                style={{textAlign:'left', padding:'12px 14px', cursor:'pointer'}}
              >
                <span style={{fontFamily:'var(--serif)', fontSize:15, color:'var(--ink)'}}>{result.name}</span>
              </button>
            ))}
          </div>
        )}

        <ManualPlaceButton place={DEMO_USER.birth.place} onClick={useDevProfile}>
          Quick add Tyler dev profile
        </ManualPlaceButton>

        <div style={{height:16}}/>

        <button className="btn" onClick={continueWithBirth}>Continue</button>
        <p className="meta onboard-fineprint">
          The app stores a birth hash for caching, not a remote profile.
        </p>
      </div>
    </div>
  );
}

export function Permission({ draftUser, onDone }) {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  function finish(place, mode = 'manual') {
    const timeZone = lookupTimeZone(place.lat, place.lon);
    onDone({
      ...(draftUser ?? DEMO_USER),
      currentPlace: {
        mode,
        timeZone,
        place,
      },
    });
  }

  async function allowLocation() {
    if (!navigator.geolocation) {
      setStatus('This browser does not expose location. Use manual location for now.');
      return;
    }
    setBusy(true);
    setStatus('Waiting for location permission...');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const place = {
          name: await reversePlaceName(coords.latitude, coords.longitude),
          lat: coords.latitude,
          lon: coords.longitude,
        };
        finish(place, 'device');
      },
      () => {
        setBusy(false);
        setStatus('Location permission was not granted. Manual location works just as well.');
      },
      { enableHighAccuracy: false, maximumAge: 900000, timeout: 10000 },
    );
  }

  return (
    <div className="onboard-shell">
      <div style={{padding:'46px 30px 34px', flex:1, display:'flex', flexDirection:'column'}}>
        <Wordmark/>
        <div style={{height:42}}/>
        <div className="eyebrow">Step 2 of 2</div>
        <div style={{height:8}}/>
        <h1 className="h-display">May we use your current location?</h1>
        <div style={{height:22}}/>

        <div style={{display:'flex', justifyContent:'center', margin:'8px 0 18px'}}>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <ellipse cx="90" cy="135" rx="78" ry="14" fill="none" stroke="var(--terracotta)" strokeWidth="0.6" opacity="0.4"/>
            <path d="M12 135 Q90 -10 168 135" fill="none" stroke="var(--ink)" strokeWidth="0.7" opacity="0.45"/>
            <g transform="translate(58, 50)"><MoonGlyph size={36} illumPct={74.6}/></g>
            {[[40,80],[120,90],[140,60],[30,110],[150,110],[100,40]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="0.9" fill="var(--ink)" opacity="0.5"/>
            ))}
            <g transform="translate(90,124)">
              <path d="M0 -16 C-7 -16 -10 -10 -10 -5 C-10 0 -3 8 0 16 C3 8 10 0 10 -5 C10 -10 7 -16 0 -16 Z" fill="var(--terracotta)"/>
              <circle r="3.2" fill="var(--bg)"/>
            </g>
            <line x1="20" y1="160" x2="160" y2="160" stroke="var(--ink)" strokeWidth="0.5" opacity="0.3"/>
          </svg>
        </div>

        <p className="body-prose" style={{fontSize:15}}>
          Current location lets the app calculate local moonrise, moonset, visibility, houses for today's transits, and the sky as it is where you stand.
        </p>

        <div style={{height:22}}/>

        <div className="card" style={{padding:'14px 18px', display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:8, height:8, borderRadius:'50%', background:'var(--moss)', boxShadow:'0 0 0 4px rgba(106,123,63,0.15)'}}/>
          <div>
            <div className="eyebrow" style={{color:'var(--moss)'}}>Current sky</div>
            <div style={{fontFamily:'var(--serif)', fontSize:18}}>Detected from your browser or set manually.</div>
          </div>
        </div>

        {status && <p className="meta" style={{marginTop:12}}>{status}</p>}

        <div style={{flex:1, minHeight:24}}/>

        <button className="btn" onClick={allowLocation} disabled={busy}>{busy ? 'Locating...' : 'Allow & Continue'}</button>
        <div style={{height:10}}/>
        <button className="btn btn-ghost" onClick={() => finish(DEMO_USER.currentPlace.place, 'manual')}>Use Tyler dev location: Manly, Sydney</button>
        <div style={{height:40}}/>
      </div>
    </div>
  );
}
