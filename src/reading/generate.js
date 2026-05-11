import {
  actionForBody,
  aspectEntry,
  bodyEntry,
  houseEntry,
  keywordsForSign,
  moonPhaseEntry,
  readingSourceMetadata,
  signEntry,
} from './lexicon/index.js';

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function wordsFor(sign) {
  return keywordsForSign(sign);
}

function housePhrase(house) {
  return house ? `${ordinal(house)} house` : 'chart';
}

function findBody(chart, name) {
  return chart?.bodies?.find((body) => body.body === name);
}

function topSignals(signals) {
  const loud = signals?.topSignals?.length ? signals.topSignals : signals?.activationSignals;
  return (loud ?? []).slice(0, 3);
}

function makeHeadline(currentSky, signals) {
  const loud = topSignals(signals);
  if (loud[0]) {
    const planet = bodyEntry(loud[0].transitingBody).keywords?.[0] ?? loud[0].transitingBody;
    return `${loud[0].transitingBody} is bringing ${planet} into focus.`;
  }
  return `A ${currentSky.lunar.phase.toLowerCase()} in ${currentSky.lunar.moonSign} day.`;
}

function makeBody({ natalChart, currentSky, signals }) {
  const moon = findBody(natalChart, 'Moon');
  const loud = topSignals(signals);
  const phase = moonPhaseEntry(currentSky.lunar.phase);
  const moonSign = signEntry(currentSky.lunar.moonSign);
  const moonKeywords = (moonSign.keywords ?? wordsFor(currentSky.lunar.moonSign)).slice(0, 3).join(', ');
  const phaseKeywords = (phase.keywords ?? []).slice(0, 2).join(' and ');
  const opening = `The Moon is in ${currentSky.lunar.moonSign} and ${currentSky.lunar.illumination}% lit, so the day carries ${moonKeywords}. In the ${currentSky.lunar.phase.toLowerCase()} phase, the lunar cycle leans toward ${phaseKeywords || 'attention'}: ${phase.interpretiveBasis}`;
  if (!loud.length) {
    const natalMoon = signEntry(moon?.sign);
    return `${opening} Your natal Moon in ${moon?.sign ?? 'your chart'} is the easiest place to begin: let ${natalMoon.keywords?.[0] ?? 'the body'} speak before the mind turns the day into a theory.`;
  }
  const signalText = loud.map((signal) => {
    const aspect = aspectEntry(signal.aspect);
    return `${signal.title.toLowerCase()} (${aspect.keywords?.[0] ?? signal.aspect})`;
  }).join('; ');
  return `${opening} The loudest natal contact is ${signalText}. Treat that as symbolic weather, not an order: feel the pressure, choose the response, and make one honest adjustment.`;
}

function makeLunarAxis(natalChart, currentSky) {
  const natalMoon = findBody(natalChart, 'Moon');
  const natalWords = wordsFor(natalMoon?.sign);
  const currentWords = wordsFor(currentSky.lunar.moonSign);
  const currentSign = signEntry(currentSky.lunar.moonSign);
  const natalSign = signEntry(natalMoon?.sign);
  return {
    natal: {
      sign: natalMoon?.sign ?? 'Unknown',
      house: natalMoon?.house ? `${ordinal(natalMoon.house)} house` : 'house unknown',
      words: natalWords,
    },
    current: {
      sign: currentSky.lunar.moonSign,
      words: currentWords,
    },
    reading: `Let ${currentWords[0]} speak to ${natalWords[0]}. The current Moon is carrying ${currentSign.element ? `${currentSign.element.toLowerCase()} ` : ''}${currentWords[1] ?? 'weather'}, while your natal Moon remembers ${natalWords[1] ?? natalSign.element?.toLowerCase() ?? 'its own rhythm'}. The work is translation, not obedience: let today's sky give your familiar emotional pattern a temporary language.`,
  };
}

function makeActivations(signals) {
  return topSignals(signals).map((signal) => {
    const action = actionForBody(signal.transitingBody);
    const planet = bodyEntry(signal.transitingBody);
    const skySign = signEntry(signal.transitingSign);
    const natalSign = signEntry(signal.natalSign);
    const aspect = aspectEntry(signal.aspect);
    const house = signal.natalHouse ? houseEntry(signal.natalHouse) : null;
    const houseText = house ? ` The house layer adds ${house.keywords?.slice(0, 2).join(' and ')}.` : '';
    return {
      title: signal.title,
      activates: signal.activates,
      theme: `${signal.transitingBody} brings ${planet.keywords?.slice(0, 2).join(' and ') || 'attention'} through ${signal.transitingSign}'s ${skySign.keywords?.join(', ') || 'symbolic field'}. Because it is ${signal.aspect} natal ${signal.natalTarget}${signal.natalSign ? ` in ${signal.natalSign}` : ''}, the tone is ${aspect.keywords?.slice(0, 2).join(' and ') || signal.aspect}: ${aspect.tone ?? signal.theme}${houseText}`,
      question: `What would it mean to ${action} this without making it absolute?`,
      insight: `${signal.reasons.join(' · ')}. Interpreted through ${planet.systems?.includes('traditional-western-astrology') ? 'traditional and modern Western astrology' : 'modern Western astrology'}${natalSign.systems?.includes('true-sky-sidereal-astronomy') ? ', with the true-sky constellation layer named separately' : ''}.`,
      score: signal.score,
    };
  });
}

function makeNotice({ natalChart, currentSky, signals }) {
  const loud = topSignals(signals);
  const mercury = findBody(natalChart, 'Mercury');
  const phase = moonPhaseEntry(currentSky.lunar.phase);
  const moonSign = signEntry(currentSky.lunar.moonSign);
  return [
    `The body tone of a ${currentSky.lunar.phase.toLowerCase()}: ${phase.keywords?.join(', ') || 'notice the cycle'} without turning the symbol into a command.`,
    loud[0] ? `Where ${loud[0].transitingBody} touches natal ${loud[0].natalTarget}, the day may feel more charged than usual.` : `The Moon in ${currentSky.lunar.moonSign} may make ${wordsFor(currentSky.lunar.moonSign).join(', ')} feel louder.`,
    mercury ? `Your Mercury in ${mercury.sign} wants the day to become legible, not perfect.` : 'Notice the first honest sentence before polishing it.',
    moonSign.body?.length ? `Somatically, ${currentSky.lunar.moonSign} can be watched through ${moonSign.body.join(', ')} as metaphor, not diagnosis.` : 'Watch the body as a metaphor layer, not as a diagnosis.',
  ];
}

function makeAvoid(signals) {
  const loud = topSignals(signals);
  return [
    'Turning a symbolic signal into a rule you have to obey.',
    loud[0] ? `Over-identifying with ${loud[0].transitingBody} pressure before it has finished telling you what it is.` : 'Filling quiet sky with unnecessary urgency.',
    'Skipping the small practical act that would let the insight land in the body.',
  ];
}

function localReading(input) {
  const { natalChart, currentSky, signals } = input;
  const activations = makeActivations(signals);
  return {
    schemaVersion: 1,
    source: 'local-symbolic-engine',
    sourceDetail: readingSourceMetadata({ currentSky, signals }),
    generatedAt: new Date().toISOString(),
    dateKey: currentSky.localDateKey,
    headline: makeHeadline(currentSky, signals),
    body: makeBody(input),
    lunarAxis: makeLunarAxis(natalChart, currentSky),
    activations: activations.length ? activations : [{
      title: `Moon in ${currentSky.lunar.moonSign}`,
      activates: 'the body, mood, and daily rhythm',
      theme: `The Moon is the clearest signal today: ${currentSky.lunar.phase.toLowerCase()}, ${currentSky.lunar.illumination}% lit, moving through ${currentSky.lunar.moonSign}.`,
      question: 'What does the body know before the story arrives?',
      insight: 'Quiet day · lunar signal · local sky.',
      score: 0,
    }],
    notice: makeNotice(input),
    avoid: makeAvoid(signals),
  };
}

function providerPayload({ natalChart, currentSky, signals }) {
  return {
    schemaVersion: 1,
    framework: currentSky.framework,
    dateKey: currentSky.localDateKey,
    localDate: currentSky.localDate,
    localTime: currentSky.localTime,
    place: currentSky.place?.name,
    lunar: currentSky.lunar,
    natal: {
      bodies: natalChart.bodies,
      angles: natalChart.angles,
      houses: natalChart.houses,
      chartRuler: natalChart.chartRuler,
      framework: natalChart.framework,
      houseSystem: natalChart.houseSystem,
      birthTimeKnown: natalChart.birthTimeKnown,
    },
    signals: {
      topSignals: signals.topSignals,
      activationSignals: signals.activationSignals,
      supportingSignals: signals.supportingSignals.slice(0, 4),
    },
  };
}

function providerSourceMetadata(mode) {
  return {
    label: mode === 'api-key' ? 'AI synthesis with your provider key' : 'AI synthesis',
    summary: 'The astronomy and ranked signals are calculated locally first, then an AI provider writes fuller prose from those receipts.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'Lunar cycle practice',
      'Somatic reflective practice',
      'MoonTurtle editorial synthesis',
      'AI language synthesis',
    ],
    caveat: 'The provider writes the prose; it does not make the astronomy more objective or more authoritative.',
  };
}

export function aiMode(settings = {}) {
  return settings.aiMode ?? 'auto';
}

function isLocalhost() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export function shouldAttemptProvider(settings = {}) {
  const mode = aiMode(settings);
  if (mode === 'local') return false;
  if (mode === 'codex' || mode === 'claude') return isLocalhost();
  if (mode === 'api-key') return Boolean(settings.apiKey?.trim());
  const setting = import.meta.env.VITE_MOONTURTLE_USE_PROVIDER ?? 'auto';
  if (setting === 'true') return true;
  if (setting === 'false' || setting === 'off') return false;
  return isLocalhost();
}

export async function generateReading(input) {
  const local = localReading(input);
  if (!shouldAttemptProvider(input.settings)) return local;

  try {
    const headers = { 'Content-Type': 'application/json' };
    if (input.settings?.aiMode === 'api-key' && input.settings?.apiKey?.trim()) {
      headers['X-User-Provider-Key'] = input.settings.apiKey.trim();
      headers['X-MoonTurtle-Provider'] = input.settings.apiProvider ?? 'anthropic';
    }

    const response = await fetch('/api/reading', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        ...providerPayload(input),
        providerPreference: aiMode(input.settings),
      }),
    });
    if (!response.ok) return { ...local, providerAttempted: true };
    const remote = await response.json();
    if (!remote?.headline || !remote?.body) return { ...local, providerAttempted: true };
    return {
      ...local,
      ...remote,
      source: remote.source ?? 'provider',
      sourceDetail: providerSourceMetadata(aiMode(input.settings)),
      providerAttempted: true,
      dateKey: local.dateKey,
    };
  } catch {
    return { ...local, providerAttempted: true };
  }
}
