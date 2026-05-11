function MethodSection({ num, title, body }) {
  return (
    <div style={{display:'grid', gridTemplateColumns:'40px 1fr', gap:16, marginBottom:22}}>
      <div style={{fontFamily:'var(--serif-sc)', fontSize:14, color:'var(--terracotta)', letterSpacing:'0.16em', paddingTop:3}}>
        {num}
      </div>
      <div>
        <div className="h-card" style={{marginBottom:6}}>{title}</div>
        <p className="body-prose" style={{fontSize:15}}>{body}</p>
      </div>
    </div>
  );
}

export function MethodScreen() {
  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">Trust &amp; Transparency</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>How this app thinks.</h1>

      <div style={{height:22}}/>

      <MethodSection
        num="01"
        title="This is not fatalism."
        body="Nothing in the sky decides what you do. The chart is a metaphor language — a map of patterns. You are the one walking the map."
      />
      <MethodSection
        num="02"
        title="Astronomy and interpretation are separate."
        body="The numbers (positions, phases, illumination) are calculated from astronomical data. The reading on top of those numbers is a symbolic layer — a way of speaking, not a prediction."
      />
      <MethodSection
        num="03"
        title="Your current sky is calculated automatically."
        body="Where and when you are now — handled by your device. The app reads the sky as it actually is from where you stand, using True Sky Sidereal positions. Not the calendar zodiac."
      />
      <MethodSection
        num="04"
        title="Interpretation comes from symbolic grammar, not objective fact."
        body={"When the app says \"Mars in Pisces wants devotional action,\" it's drawing from a long symbolic vocabulary. Treat it as poetry with structure, not data with destiny."}
      />
      <MethodSection
        num="05"
        title="Your agency comes first."
        body="If a reading lands as instructive, contemplate it. If it feels off, set it down. You are not under obligation to the sky."
      />

      <div style={{height:24}}/>

      <div style={{padding:'18px 20px', textAlign:'center', border:'1px solid var(--hairline-strong)', background:'var(--paper)'}}>
        <div style={{fontFamily:'var(--serif)', fontStyle:'italic', fontSize:18, color:'var(--ink)', textWrap:'pretty'}}>
          Meaningful enough to contemplate.<br/>Never absolute enough to obey.
        </div>
      </div>

      <div style={{height:20}}/>
    </div>
  );
}
