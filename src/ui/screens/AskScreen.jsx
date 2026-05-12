import { useMemo, useState } from 'react';
import { generateAskAnswer } from '../../reading/generate.js';

const STARTERS = [
  'What is the one thing to pay attention to today?',
  'How does today interact with my profile?',
  'Explain the loudest signal in plain language.',
];

function SourceChips({ chips = [] }) {
  if (!chips.length) return null;
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:6, marginTop:10}}>
      {chips.map((chip) => (
        <span key={chip} className="chip" style={{fontSize:9, padding:'4px 7px'}}>
          {chip}
        </span>
      ))}
    </div>
  );
}

function AskMessage({ message }) {
  const isUser = message.role === 'user';
  return (
    <div style={{
      alignSelf:isUser ? 'flex-end' : 'stretch',
      maxWidth:isUser ? '88%' : '100%',
      border:isUser ? '1px solid rgba(176,74,38,0.28)' : '1px solid var(--hairline)',
      background:isUser ? 'rgba(176,74,38,0.07)' : 'var(--paper)',
      padding:isUser ? '12px 14px' : '16px 18px',
    }}>
      {!isUser && <div className="section-label" style={{marginBottom:8}}>MoonTurtle Ask</div>}
      <p className="body-prose" style={{fontSize:15, whiteSpace:'pre-wrap'}}>
        {message.text}
      </p>
      {!isUser && (
        <>
          <SourceChips chips={message.sourceChips}/>
          {message.engineLabel && (
            <p className="meta" style={{marginTop:9, lineHeight:1.4}}>
              Engine: {message.engineLabel}
            </p>
          )}
          {message.fallbackReason && (
            <p className="meta" style={{marginTop:6, lineHeight:1.4, color:'var(--terracotta)'}}>
              {message.fallbackReason}
            </p>
          )}
        </>
      )}
    </div>
  );
}

export function AskScreen({ state, profileState, settings }) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [pending, setPending] = useState(false);
  const profile = profileState?.profile;
  const contextStatus = useMemo(() => {
    const chips = [];
    if (profile) chips.push(profile.isFallback ? 'Profile fallback' : 'Profile');
    if (state?.reading) chips.push(state.reading.isFallback ? 'Today fallback' : 'Today');
    if (state?.sky) chips.push('Sky');
    if (state?.journal?.length) chips.push('Journal');
    return chips;
  }, [profile, state]);

  async function ask(nextQuestion = question) {
    const clean = nextQuestion.trim();
    if (!clean || pending) return;
    setQuestion('');
    setMessages((prev) => [...prev, { role: 'user', text: clean }]);
    setPending(true);
    const answer = await generateAskAnswer({
      question: clean,
      reading: state?.reading,
      profile,
      sky: state?.sky,
      signals: state?.signals,
      journal: state?.journal,
      settings,
    });
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: answer.answer,
        sourceChips: answer.sourceChips,
        engineLabel: answer.engineLabel,
        fallbackReason: answer.isFallback ? answer.fallbackReason : null,
      },
    ]);
    setPending(false);
  }

  return (
    <div style={{padding:'24px 26px 36px'}}>
      <div className="eyebrow">Grounded Ask</div>
      <div style={{height:6}}/>
      <h1 className="h-display" style={{fontSize:26}}>Ask from your chart.</h1>
      <p className="body-prose" style={{fontSize:15, marginTop:8}}>
        Chat over your Profile, Today reading, Sky receipts, and Journal. MoonTurtle should show what it is using.
      </p>

      <div style={{height:16}}/>
      <div className="status-surface">
        <div className="eyebrow">Using sources</div>
        <SourceChips chips={contextStatus.length ? contextStatus : ['Waiting for receipts']}/>
        {profileState?.status === 'loading' && (
          <p className="meta" style={{marginTop:9, lineHeight:1.45}}>
            Profile is still being prepared. Ask can use Today and Sky now, then include Profile once it is ready.
          </p>
        )}
      </div>

      <div style={{height:18}}/>
      {messages.length === 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:9}}>
          {STARTERS.map((starter) => (
            <button
              key={starter}
              type="button"
              className="btn btn-ghost"
              onClick={() => ask(starter)}
              style={{padding:'12px 14px', fontSize:10, textAlign:'left'}}
            >
              {starter}
            </button>
          ))}
        </div>
      )}

      {messages.length > 0 && (
        <div style={{display:'flex', flexDirection:'column', gap:12}}>
          {messages.map((message, index) => (
            <AskMessage key={`${message.role}-${index}`} message={message}/>
          ))}
          {pending && (
            <div className="card warm" style={{padding:'16px 18px'}}>
              <div className="section-label">Thinking</div>
              <p className="body-prose" style={{fontSize:15}}>
                The selected AI is writing from saved MoonTurtle context.
              </p>
              <div className="thinking-line" style={{marginTop:12}}/>
            </div>
          )}
        </div>
      )}

      <div style={{height:18}}/>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          ask();
        }}
        style={{display:'flex', flexDirection:'column', gap:10}}
      >
        <label>
          <span className="eyebrow">Question</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about today, your profile, or a past reading..."
            rows={4}
            style={{
              width:'100%',
              marginTop:6,
              resize:'vertical',
              fontFamily:'var(--serif)',
              fontSize:16,
              color:'var(--ink)',
              background:'var(--paper)',
              border:'1px solid var(--hairline-strong)',
              padding:'12px',
              lineHeight:1.45,
            }}
          />
        </label>
        <button type="submit" className="btn" disabled={pending || !question.trim()}>
          {pending ? 'Waiting for AI' : 'Ask MoonTurtle'}
        </button>
      </form>
    </div>
  );
}
