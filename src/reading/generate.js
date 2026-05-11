const WORDS_BY_SIGN = {
  Aries: ['heat', 'beginning', 'courage'],
  Taurus: ['body', 'value', 'steadiness'],
  Gemini: ['language', 'translation', 'nerves'],
  Cancer: ['memory', 'belonging', 'protection'],
  Leo: ['heart', 'visibility', 'play'],
  Virgo: ['craft', 'discernment', 'repair'],
  Libra: ['balance', 'agreement', 'beauty'],
  Scorpio: ['truth', 'depth', 'release'],
  Ophiuchus: ['medicine', 'threshold', 'integration'],
  Sagittarius: ['meaning', 'faith', 'horizon'],
  Capricorn: ['structure', 'devotion', 'responsibility'],
  Aquarius: ['pattern', 'future', 'community'],
  Pisces: ['dream', 'mercy', 'surrender'],
};

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

const BODY_ACTIONS = {
  Moon: 'feel',
  Sun: 'express',
  Mercury: 'name',
  Venus: 'soften toward',
  Mars: 'act on',
  Jupiter: 'make room for',
  Saturn: 'give structure to',
  Uranus: 'let change',
  Neptune: 'listen beneath',
  Pluto: 'tell the truth about',
  'North Node': 'lean toward',
  'South Node': 'release the old reflex around',
};

function wordsFor(sign) {
  return WORDS_BY_SIGN[sign] ?? ['attention', 'pattern', 'presence'];
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
    return `${loud[0].transitingBody} is making today specific.`;
  }
  return `A ${currentSky.lunar.phase.toLowerCase()} in ${currentSky.lunar.moonSign} day.`;
}

function makeBody({ natalChart, currentSky, signals }) {
  const moon = findBody(natalChart, 'Moon');
  const loud = topSignals(signals);
  const opening = `The Moon is in ${currentSky.lunar.moonSign} and ${currentSky.lunar.illumination}% lit, so the day has a ${currentSky.lunar.phase.toLowerCase()} tone: notice what is already in motion before forcing a new shape.`;
  if (!loud.length) {
    return `${opening} Your natal Moon in ${moon?.sign ?? 'your chart'} is the easiest place to begin: let the body tell you what the mind has been trying to over-explain.`;
  }
  const signalText = loud.map((signal) => signal.title.toLowerCase()).join('; ');
  return `${opening} The loudest natal contact is ${signalText}. Treat that as a weather report, not an order: feel the pressure, choose the response, and make one honest adjustment.`;
}

function makeLunarAxis(natalChart, currentSky) {
  const natalMoon = findBody(natalChart, 'Moon');
  const natalWords = wordsFor(natalMoon?.sign);
  const currentWords = wordsFor(currentSky.lunar.moonSign);
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
    reading: `Let ${currentWords[0]} speak to ${natalWords[0]}. The current Moon is not asking you to become someone else; it is asking your familiar emotional pattern to move in today's language.`,
  };
}

function makeActivations(signals) {
  return topSignals(signals).map((signal) => {
    const action = BODY_ACTIONS[signal.transitingBody] ?? 'notice';
    return {
      title: signal.title,
      activates: signal.activates,
      theme: signal.theme,
      question: `What would it mean to ${action} this without making it absolute?`,
      insight: `${signal.reasons.join(' · ')}.`,
      score: signal.score,
    };
  });
}

function makeNotice({ natalChart, currentSky, signals }) {
  const loud = topSignals(signals);
  const mercury = findBody(natalChart, 'Mercury');
  return [
    `The body tone of a ${currentSky.lunar.phase.toLowerCase()}: finish, refine, compost, or clarify before beginning again.`,
    loud[0] ? `Where ${loud[0].transitingBody} touches natal ${loud[0].natalTarget}, the day may feel more charged than usual.` : `The Moon in ${currentSky.lunar.moonSign} may make ${wordsFor(currentSky.lunar.moonSign).join(', ')} feel louder.`,
    mercury ? `Your chart ruler Mercury in ${mercury.sign} wants the day to become legible, not perfect.` : 'Notice the first honest sentence before polishing it.',
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
      providerAttempted: true,
      dateKey: local.dateKey,
    };
  } catch {
    return { ...local, providerAttempted: true };
  }
}
