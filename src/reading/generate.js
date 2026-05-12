import {
  aspectEntry,
  bodyEntry,
  houseEntry,
  keywordsForSign,
  moonPhaseEntry,
  readingSourceMetadata,
  SOURCE_METADATA_VERSION,
  signEntry,
} from './lexicon/index.js';

export const DAILY_PROMPT_VERSION = 'daily-v2-2026-05-12';
export const PROFILE_PROMPT_VERSION = 'profile-v1-2026-05-12';

function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function wordsFor(sign) {
  return keywordsForSign(sign);
}

function findBody(chart, name) {
  return chart?.bodies?.find((body) => body.body === name);
}

function primarySignals(signals) {
  const loud = signals?.topSignals?.length ? signals.topSignals : signals?.activationSignals;
  return (loud ?? []).slice(0, 3);
}

function selectedSignals(signals, count = 5) {
  const pool = [
    ...(signals?.topSignals ?? []),
    ...(signals?.activationSignals ?? []),
    ...(signals?.supportingSignals ?? []),
  ];
  const selected = [];
  const seen = new Set();
  for (const signal of pool) {
    if (!signal?.id || seen.has(signal.id)) continue;
    seen.add(signal.id);
    selected.push(signal);
    if (selected.length === count) break;
  }
  return selected;
}

const BODY_FORCES = {
  Moon: 'body memory, mood, need, and instinct',
  Sun: 'vitality, identity, visibility, and the larger chapter',
  Mercury: 'language, naming, questions, and nervous-system tempo',
  Venus: 'value, affection, pleasure, and receptivity',
  Mars: 'heat, desire, courage, and the need for clean movement',
  Jupiter: 'scale, faith, teaching, and permission to widen',
  Saturn: 'structure, pressure, maturity, and consequence',
  Uranus: 'disruption, freedom, surprise, and pattern-break',
  Neptune: 'longing, imagination, sensitivity, and softened edges',
  Pluto: 'depth, pressure, truth, and what refuses to stay hidden',
  'North Node': 'growth appetite, stretch, and the unfamiliar future',
  'South Node': 'old reflex, residue, and what has become too familiar',
};

const TARGET_FIELDS = {
  Moon: 'your body-memory and emotional baseline',
  Sun: 'your vitality and sense of self',
  Mercury: 'the part of you that names, explains, and translates',
  Venus: 'your value system, affection, and receiving pattern',
  Mars: 'your wanting, anger, courage, and capacity to act',
  Jupiter: 'your faith, scale, teachers, and permission to grow',
  Saturn: 'your inner structure, limits, and relationship with time',
  Uranus: 'your pattern-breaker and need for freedom',
  Neptune: 'your sensitivity, longing, dream life, and porous places',
  Pluto: 'your depth instinct and contact with buried truth',
  'North Node': 'your future-facing growth edge',
  'South Node': 'your familiar reflex and inherited ease',
  Ascendant: 'the way you meet life through the body and first impression',
  Descendant: 'the mirror of partnership, agreement, and encounter',
  Midheaven: 'your visible path, vocation, and public direction',
  IC: 'your roots, private ground, family pattern, and inner base',
};

const ASPECT_LANGUAGE = {
  conjunct: {
    verb: 'meets',
    feel: 'fusion, emphasis, and immediacy',
    work: 'the symbols are in the same room, so proportion matters more than volume',
    risk: 'fusion turning into certainty',
    question: 'What becomes clearer when these parts stop pretending they are separate?',
  },
  opposing: {
    verb: 'faces',
    feel: 'polarity, mirroring, and relational tension',
    work: 'the work is to keep both sides visible without collapsing into either one',
    risk: 'making one side wrong so the other can feel clean',
    question: 'Where could both sides of the mirror be allowed to stay visible?',
  },
  squaring: {
    verb: 'presses against',
    feel: 'friction, effort, and creative pressure',
    work: 'pressure can become movement if it does not have to become urgency',
    risk: 'mistaking pressure for an emergency',
    question: 'What kind of movement is possible without forcing a whole answer?',
  },
  trining: {
    verb: 'flows toward',
    feel: 'support, fluency, and quieter permission',
    work: 'ease is available, but it still becomes real through attention',
    risk: 'letting ease become passivity',
    question: 'What support is already present but easy to overlook?',
  },
  sextiling: {
    verb: 'opens a small door toward',
    feel: 'opportunity, cooperation, and a modest opening',
    work: 'the opening is useful if it receives one small act of participation',
    risk: 'waiting for a small opening to announce itself loudly',
    question: 'What small opening is asking for a little participation?',
  },
};

const BODY_QUESTIONS = {
  Moon: 'What feeling can be felt without becoming the whole weather?',
  Sun: 'What wants to be seen without being forced into performance?',
  Mercury: 'What sentence would make this legible without making it final?',
  Venus: 'What value is asking to be felt before it is negotiated?',
  Mars: 'Where can heat become one clean movement instead of an emergency?',
  Jupiter: 'What can widen without becoming inflated?',
  Saturn: 'What structure would steady this without hardening it?',
  Uranus: 'What pattern can change without burning down the whole room?',
  Neptune: 'What softness is real, and what is only fog?',
  Pluto: 'What truth can be named without turning intensity into control?',
  'North Node': 'What unfamiliar direction can be touched lightly?',
  'South Node': 'What old reflex can loosen without being rejected?',
};

const TARGET_QUESTIONS = {
  Moon: 'What feeling can move without becoming the whole weather?',
  Sun: 'What part of identity wants daylight without performance?',
  Mercury: 'What sentence would make this legible without making it final?',
  Venus: 'Where do desire and receptivity need cleaner terms?',
  Mars: 'What wants action, and what only wants heat?',
  Jupiter: 'What can grow without becoming too large to hold?',
  Saturn: 'What limit would make this feel more trustworthy?',
  Ascendant: 'What is the body saying before the story arrives?',
  Descendant: 'What mirror is useful without becoming a verdict?',
  Midheaven: 'What sentence belongs in public, and what can stay private?',
  IC: 'What private truth wants language before it meets the world?',
};

function cleanBasis(entry, fallback = 'the symbol asks for careful attention') {
  return (entry?.interpretiveBasis ?? fallback).replace(/^[^:]+:\s*/, '');
}

function phraseList(items = [], limit = 3) {
  const clean = items.filter(Boolean).slice(0, limit);
  if (clean.length <= 1) return clean[0] ?? '';
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`;
}

function pair(items = []) {
  const clean = items.filter(Boolean).slice(0, 2);
  if (clean.length <= 1) return clean[0] ?? 'attention';
  return `${clean[0]} and ${clean[1]}`;
}

function bodyForce(body) {
  return BODY_FORCES[body] ?? phraseList(bodyEntry(body).keywords, 4);
}

function bodyNoun(body) {
  return {
    Moon: 'the feeling-body',
    Sun: 'the visible self',
    Mercury: 'the sentence',
    Venus: 'the value question',
    Mars: 'the heat',
    Jupiter: 'the widening',
    Saturn: 'the structure',
    Uranus: 'the interruption',
    Neptune: 'the soft place',
    Pluto: 'the pressure point',
    'North Node': 'the growth edge',
    'South Node': 'the familiar reflex',
  }[body] ?? `${body} thread`;
}

function targetNoun(target) {
  return {
    Moon: 'emotional baseline',
    Sun: 'sense of self',
    Mercury: 'inner language',
    Venus: 'love and value pattern',
    Mars: 'wanting and courage',
    Jupiter: 'faith and permission',
    Saturn: 'inner structure',
    Uranus: 'need for freedom',
    Neptune: 'sensitivity',
    Pluto: 'depth instinct',
    'North Node': 'growth edge',
    'South Node': 'old reflex',
    Ascendant: 'body and first response',
    Descendant: 'relationship mirror',
    Midheaven: 'public path',
    IC: 'private ground',
  }[target] ?? targetField(target);
}

function aspectMood(aspect) {
  return {
    conjunct: 'in the foreground',
    opposing: 'across a mirror',
    squaring: 'under creative pressure',
    trining: 'with a steadier current',
    sextiling: 'through a small opening',
  }[aspect] ?? 'in contact';
}

function targetField(target) {
  return TARGET_FIELDS[target] ?? `${target?.toLowerCase?.() ?? 'this'} pattern`;
}

function aspectLanguage(aspect) {
  return ASPECT_LANGUAGE[aspect] ?? {
    verb: aspect ?? 'touches',
    feel: aspect ?? 'contact',
    work: 'the symbol is worth noticing without turning it into a command',
    risk: 'over-reading the signal',
    question: 'What is being shown without needing to become a rule?',
  };
}

function orbPhrase(orb) {
  if (orb <= 0.5) return 'very tight';
  if (orb <= 1) return 'close';
  if (orb <= 2) return 'noticeable';
  return 'wide but present';
}

function houseTopic(house) {
  if (!house) return null;
  const entry = houseEntry(house);
  return `the ${ordinal(house)} house field of ${pair(entry.keywords)}`;
}

function signTone(sign) {
  return phraseList(signEntry(sign).keywords, 3);
}

function signTexture(sign) {
  const entry = signEntry(sign);
  return `${sign}'s ${pair(entry.keywords)}`;
}

function signalContext(signal) {
  const transit = bodyEntry(signal.transitingBody);
  const skySign = signEntry(signal.transitingSign);
  const natalSign = signEntry(signal.natalSign);
  const aspect = aspectEntry(signal.aspect);
  const aspectText = aspectLanguage(signal.aspect);
  const house = signal.natalHouse ? houseEntry(signal.natalHouse) : null;
  return { transit, skySign, natalSign, aspect, aspectText, house };
}

function conciseSignal(signal) {
  return `${signal.transitingBody} ${signal.aspect} natal ${signal.natalTarget}`;
}

function targetPhrase(signal) {
  const house = houseTopic(signal.natalHouse);
  const sign = signal.natalSign ? ` in ${signal.natalSign}` : '';
  return `${targetField(signal.natalTarget)}${sign}${house ? `, inside ${house}` : ''}`;
}

function interpretSignal(signal, { includeReceipt = false } = {}) {
  const { skySign, natalSign, aspectText } = signalContext(signal);
  const receipt = includeReceipt ? ` The receipt is ${signal.title}, ${orbPhrase(signal.orb)} at ${signal.orb} degrees.` : '';

  return `Current ${signal.transitingBody} is in ${signal.transitingSign}, carrying ${bodyForce(signal.transitingBody)} in ${signTexture(signal.transitingSign)}. It ${aspectText.verb} ${targetPhrase(signal)}. This can feel like ${pair(skySign.keywords)} meeting ${pair(natalSign.keywords)}; ${aspectText.work}.${receipt}`;
}

function questionForSignal(signal) {
  if (TARGET_QUESTIONS[signal.natalTarget]) return TARGET_QUESTIONS[signal.natalTarget];
  return BODY_QUESTIONS[signal.transitingBody] ?? aspectLanguage(signal.aspect).question;
}

function makeHeadline(currentSky, signals) {
  const [top] = primarySignals(signals);
  if (!top) {
    return `${currentSky.lunar.moonSign} Moon, one honest thread at a time.`;
  }
  return `${bodyNoun(top.transitingBody)} meets your ${targetNoun(top.natalTarget)}.`;
}

function makeBody({ natalChart, currentSky, signals }) {
  const moon = findBody(natalChart, 'Moon');
  const loud = primarySignals(signals);
  const phase = moonPhaseEntry(currentSky.lunar.phase);
  const moonKeywords = phraseList(wordsFor(currentSky.lunar.moonSign), 3);
  const sunKeywords = phraseList(wordsFor(currentSky.lunar.sunSign), 2);
  const phaseBasis = cleanBasis(phase, 'the lunar cycle asks for care with what is ending and beginning.');
  const lunarSentence = `Today is a ${currentSky.lunar.phase.toLowerCase()} Moon in ${currentSky.lunar.moonSign} day: ${moonKeywords}, with ${currentSky.lunar.illumination}% light and a lunar task of ${pair(phase.keywords)}. The Sun in ${currentSky.lunar.sunSign} keeps the larger chapter around ${sunKeywords}.`;

  if (!loud.length) {
    const natalMoon = signEntry(moon?.sign);
    return `${lunarSentence} Your natal Moon in ${moon?.sign ?? 'your chart'} gives the reading its anchor: ${pair(natalMoon.keywords)} before performance, body signal before theory. ${phaseBasis}`;
  }

  const [top] = loud;
  const topAspect = aspectLanguage(top.aspect);
  const main = `The loudest receipt is ${conciseSignal(top)}, ${aspectMood(top.aspect)}. In plain language, ${bodyNoun(top.transitingBody)} is touching your ${targetNoun(top.natalTarget)}; ${topAspect.work}.`;
  const secondary = loud[1]
    ? `A second thread, ${conciseSignal(loud[1])}, keeps your ${targetNoun(loud[1].natalTarget)} in the room; it matters, but it does not need to become the whole story.`
    : phaseBasis;

  return `${lunarSentence} ${main} ${secondary} The useful move is not more interpretation; it is one cleaner relationship between what you feel, what you name, and what you actually carry today.`;
}

function makeLunarAxis(natalChart, currentSky) {
  const natalMoon = findBody(natalChart, 'Moon');
  const natalWords = wordsFor(natalMoon?.sign);
  const currentWords = wordsFor(currentSky.lunar.moonSign);
  const currentSign = signEntry(currentSky.lunar.moonSign);
  const natalSign = signEntry(natalMoon?.sign);
  const sameElement = currentSign.element && currentSign.element === natalSign.element;
  const house = natalMoon?.house ? ` through the ${ordinal(natalMoon.house)} house` : '';
  const relation = sameElement
    ? `${currentSign.element.toLowerCase()} recognizing itself in two different dialects`
    : `${currentSign.element?.toLowerCase() ?? 'today'} meeting ${natalSign.element?.toLowerCase() ?? 'your natal pattern'}`;
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
    reading: `The current Moon speaks in ${currentSky.lunar.moonSign}'s ${phraseList(currentWords)}, while your natal Moon remembers ${natalMoon?.sign ?? 'its own'} ${phraseList(natalWords)}${house}. This is ${relation}: the day may ask feeling to become legible before it becomes public. The axis is not a verdict; it is a translation problem between today's sky and your oldest emotional habits.`,
  };
}

function fallbackActivation(currentSky, kind) {
  const moon = moonPhaseEntry(currentSky.lunar.phase);
  const sunSign = signEntry(currentSky.lunar.sunSign);
  if (kind === 'sun') {
    return {
      title: `Sun in ${currentSky.lunar.sunSign}`,
      activates: 'the larger solar chapter',
      theme: `The Sun in ${currentSky.lunar.sunSign} keeps the background chapter in ${phraseList(sunSign.keywords)}. It is not the loudest contact, but it colors what the day is trying to make visible over time.`,
      question: 'What is becoming visible slowly rather than urgently?',
      insight: `Receipts: current Sun in ${currentSky.lunar.sunSign}.`,
      score: 0,
    };
  }
  return {
    title: `${currentSky.lunar.phase} Moon in ${currentSky.lunar.moonSign}`,
    activates: 'the daily body rhythm',
    theme: `The Moon is ${currentSky.lunar.illumination}% lit in ${currentSky.lunar.moonSign}. ${cleanBasis(moon)} This gives the reading its pulse even when the transit field is quiet.`,
    question: 'What feeling is asking for proportion rather than proof?',
    insight: `Receipts: Moon in ${currentSky.lunar.moonSign}, ${currentSky.lunar.phase.toLowerCase()}, day ${currentSky.lunar.age} of the lunation.`,
    score: 0,
  };
}

function makeActivations(signals, currentSky) {
  const cards = selectedSignals(signals, 5).map((signal) => {
    const { aspectText } = signalContext(signal);
    return {
      title: signal.title,
      activates: signal.activates,
      theme: interpretSignal(signal, { includeReceipt: false }),
      question: questionForSignal(signal),
      insight: `This is a ${orbPhrase(signal.orb)} ${signal.aspect} contact: ${aspectText.feel}. The shadow to watch is ${aspectText.risk}.`,
      score: signal.score,
    };
  });

  if (cards.length < 5) cards.push(fallbackActivation(currentSky, 'moon'));
  if (cards.length < 5) cards.push(fallbackActivation(currentSky, 'sun'));
  return cards.slice(0, 5);
}

function makeNotice({ natalChart, currentSky, signals }) {
  const [top, second] = primarySignals(signals);
  const mercury = findBody(natalChart, 'Mercury');
  const phase = moonPhaseEntry(currentSky.lunar.phase);
  const moonSign = signEntry(currentSky.lunar.moonSign);
  const house = houseTopic(top?.natalHouse);
  return [
    `${pair(phase.keywords)} before adding a new demand.`,
    top ? `${top.transitingBody} on ${top.natalTarget}: ${targetField(top.natalTarget)} may speak first.` : `${currentSky.lunar.moonSign} Moon: ${pair(moonSign.keywords)} may speak first.`,
    house ? `${house} is the practical doorway.` : mercury ? `Mercury in ${mercury.sign}: language before certainty.` : 'The first honest sentence before polish.',
    second ? `${conciseSignal(second)} stays secondary, not total.` : `${currentSky.lunar.moonSign} body metaphor: ${pair(moonSign.body)}.`,
  ].map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

function makeAvoid(signals) {
  const [top] = primarySignals(signals);
  const aspectText = top ? aspectLanguage(top.aspect) : null;
  return [
    'Turning a symbol into a rule.',
    top ? `${top.transitingBody} pressure becoming a whole-life verdict.` : 'Quiet sky filled with borrowed urgency.',
    aspectText ? `${aspectText.risk}.` : 'A small signal being inflated into certainty.',
    'Body metaphor treated as diagnosis.',
  ].map((item) => item.charAt(0).toUpperCase() + item.slice(1));
}

function makeReceipts(currentSky, signals) {
  return [
    `${currentSky.lunar.phase} Moon in ${currentSky.lunar.moonSign}, ${currentSky.lunar.illumination}% lit`,
    ...selectedSignals(signals, 3).map((signal) => `${signal.title}, ${signal.orb} degree orb`),
  ];
}

function makeLoudestSignals(signals) {
  return selectedSignals(signals, 3).map((signal) => ({
    title: signal.title,
    activates: signal.activates,
    score: signal.score,
    orb: signal.orb,
    reason: signal.reasons?.join(' · ') ?? `${signal.aspect} contact`,
  }));
}

function makeSummaryLine(currentSky, signals) {
  const [top] = primarySignals(signals);
  if (!top) {
    return `Today is a ${currentSky.lunar.phase.toLowerCase()} ${currentSky.lunar.moonSign} Moon day: keep the reading small, embodied, and honest.`;
  }
  return `Today is led by ${top.transitingBody} in ${top.transitingSign} ${top.aspect} your natal ${top.natalTarget}: ${aspectLanguage(top.aspect).work}.`;
}

function makeGlanceItems(input) {
  const { currentSky, signals } = input;
  const [top, second, third] = selectedSignals(signals, 3);
  const phase = moonPhaseEntry(currentSky.lunar.phase);
  const items = [
    top
      ? `${top.transitingBody} is the loudest signal; it touches ${top.activates.replace(/^natal\s+/i, '')}.`
      : `The ${currentSky.lunar.phase} Moon in ${currentSky.lunar.moonSign} sets a quieter daily tone.`,
    `The Moon is ${currentSky.lunar.illumination}% lit, so ${pair(phase.keywords)} belongs near the center.`,
  ];
  if (second) items.push(`${second.transitingBody} adds a secondary thread around ${targetNoun(second.natalTarget)}.`);
  if (third) items.push(`${third.transitingBody} is present, but it should not crowd the main signal.`);
  items.push('One useful move is enough; the app is not asking for a life overhaul.');
  return items.slice(0, 5);
}

function makeRelease(signals) {
  const [top] = primarySignals(signals);
  if (!top) return 'Release the pressure to make a quiet day more dramatic than it is.';
  return `Release ${aspectLanguage(top.aspect).risk} around ${targetNoun(top.natalTarget)}.`;
}

function makeAct(signals) {
  const [top] = primarySignals(signals);
  if (!top) return 'Choose one small action that makes the body feel more settled.';
  return `Make one clean move that lets ${bodyNoun(top.transitingBody)} speak without taking over the whole day.`;
}

function localReading(input) {
  const { natalChart, currentSky, signals } = input;
  const activations = makeActivations(signals, currentSky);
  const body = makeBody(input);
  return {
    schemaVersion: 2,
    promptVersion: DAILY_PROMPT_VERSION,
    source: 'local-symbolic-engine',
    sourceDetail: readingSourceMetadata({ currentSky, signals }),
    generatedAt: new Date().toISOString(),
    dateKey: currentSky.localDateKey,
    headline: makeHeadline(currentSky, signals),
    body,
    summaryLine: makeSummaryLine(currentSky, signals),
    glanceItems: makeGlanceItems(input),
    loudestSignals: makeLoudestSignals(signals),
    fullReading: body,
    release: makeRelease(signals),
    act: makeAct(signals),
    lunarAxis: makeLunarAxis(natalChart, currentSky),
    activations,
    receipts: makeReceipts(currentSky, signals),
    notice: makeNotice(input),
    avoid: makeAvoid(signals),
  };
}

function providerPayload({ natalChart, currentSky, signals }) {
  return {
    requestKind: 'daily',
    schemaVersion: 2,
    promptVersion: DAILY_PROMPT_VERSION,
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
    label: mode === 'api-key' ? 'AI interpretation with your provider key' : 'AI interpretation',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'The astronomy and ranked signals are calculated locally first, then an AI provider writes fuller prose from those receipts.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'Lunar cycle practice',
      'Solar cycle practice',
      'Somatic reflective practice',
      'MoonTurtle editorial synthesis',
      'AI language synthesis',
    ],
    caveat: 'The provider writes the prose; it does not make the astronomy more objective or more authoritative.',
  };
}

function fallbackSourceMetadata(reason = 'AI interpretation did not complete.') {
  return {
    label: 'Rough local interpretation',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'This is generated on device from calculated chart receipts. It is a fallback, not the full model-written interpretation.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'Lunar cycle practice',
      'Solar cycle practice',
      'Somatic reflective practice',
      'MoonTurtle local fallback',
    ],
    caveat: `${reason} MoonTurtle is showing the local deterministic fallback so the receipts are still useful.`,
  };
}

function makeReadingId(dateKey) {
  const random = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${dateKey}:${random}`;
}

function stableHash(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function readingContentSignature(reading) {
  return stableHash({
    source: reading.source,
    headline: reading.headline,
    body: reading.body,
    summaryLine: reading.summaryLine,
    glanceItems: reading.glanceItems,
    loudestSignals: reading.loudestSignals,
    fullReading: reading.fullReading,
    release: reading.release,
    act: reading.act,
    lunarAxis: reading.lunarAxis,
    activations: reading.activations,
    receipts: reading.receipts,
    notice: reading.notice,
    avoid: reading.avoid,
  });
}

function makeDeterministicReadingId(dateKey, mode, contentSignature) {
  return `${dateKey}:local:${mode}:${contentSignature}`;
}

export function aiMode(settings = {}) {
  return settings.aiMode ?? 'auto';
}

function modelFromSettings(settings = {}) {
  return settings.model?.trim() || 'gpt-5.5';
}

function reasoningFromSettings(settings = {}) {
  return settings.reasoningEffort?.trim() || 'xhigh';
}

function providerKey(settings = {}) {
  const provider = settings.apiProvider ?? 'openai';
  const keyed = settings.apiKeys?.[provider]?.trim();
  if (keyed) return keyed;
  if (settings.apiKey?.trim()) return settings.apiKey.trim();
  return '';
}

export function formatEngineLabel(engine = {}) {
  if (engine.displayName) return engine.displayName;
  const parts = [engine.providerSurface, engine.modelId].filter(Boolean);
  if (engine.reasoningEffort) parts.push(`${engine.reasoningEffort} reasoning`);
  return parts.join(' · ') || 'Local deterministic fallback';
}

export function engineForSettings(settings = {}) {
  const mode = aiMode(settings);
  if (mode === 'local') {
    return {
      mode,
      provider: 'local',
      providerSurface: 'Local deterministic fallback',
      modelId: 'local-symbolic-engine',
      modelLabel: 'Local deterministic',
      reasoningEffort: null,
      displayName: 'Local deterministic fallback',
      isLocal: true,
      isAi: false,
    };
  }

  if (mode === 'claude') {
    return {
      mode,
      provider: 'claude',
      providerSurface: 'Claude Code local subscription',
      modelId: 'subscription-default',
      modelLabel: 'Claude',
      reasoningEffort: null,
      displayName: 'Claude Code local subscription · Claude',
      isLocalSubscription: true,
      isAi: true,
    };
  }

  if (mode === 'api-key') {
    const provider = settings.apiProvider ?? 'openai';
    if (provider === 'openai') {
      const modelId = modelFromSettings(settings);
      const reasoningEffort = reasoningFromSettings(settings);
      return {
        mode,
        provider,
        providerSurface: 'OpenAI API',
        modelId,
        modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
        reasoningEffort,
        displayName: `OpenAI API · ${modelId} · ${reasoningEffort} reasoning`,
        isAi: true,
      };
    }
    const modelId = settings.model?.trim() && !settings.model.includes('gpt')
      ? settings.model.trim()
      : 'claude-opus-4-7';
    return {
      mode,
      provider,
      providerSurface: 'Anthropic API',
      modelId,
      modelLabel: 'Claude',
      reasoningEffort: null,
      displayName: `Anthropic API · ${modelId}`,
      isAi: true,
    };
  }

  const modelId = modelFromSettings(settings);
  const reasoningEffort = reasoningFromSettings(settings);
  return {
    mode,
    provider: 'codex',
    providerSurface: 'Codex local subscription',
    modelId,
    modelLabel: modelId.toLowerCase().includes('gpt') ? modelId.toUpperCase() : modelId,
    reasoningEffort,
    displayName: `Codex local subscription · ${modelId} · ${reasoningEffort} reasoning`,
    isLocalSubscription: true,
    isAi: true,
  };
}

function engineFromRemote(remote, settings) {
  if (remote?.providerMeta) {
    return {
      ...engineForSettings(settings),
      ...remote.providerMeta,
      displayName: formatEngineLabel(remote.providerMeta),
      isAi: true,
    };
  }
  return engineForSettings(settings);
}

function isLocalhost() {
  return typeof window !== 'undefined' && ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);
}

export function shouldAttemptProvider(settings = {}) {
  const mode = aiMode(settings);
  if (mode === 'local') return false;
  if (mode === 'codex' || mode === 'claude') return isLocalhost();
  if (mode === 'api-key') return Boolean(providerKey(settings));
  const setting = import.meta.env.VITE_MOONTURTLE_USE_PROVIDER ?? 'auto';
  if (setting === 'true') return true;
  if (setting === 'false' || setting === 'off') return false;
  return isLocalhost();
}

function providerTimeoutMs(mode) {
  // The local Vite bridge has its own model timeout. The browser waits longer so
  // MoonTurtle can receive the bridge's structured failure reason instead of a
  // generic AbortError.
  const fallback = mode === 'api-key' ? 140000 : 155000;
  const configured = Number(import.meta.env.VITE_MOONTURTLE_PROVIDER_TIMEOUT_MS ?? fallback);
  return Number.isFinite(configured) && configured > 0 ? configured : fallback;
}

function aiAttempt({ status, engine, startedAt, code, message, detail } = {}) {
  const completedAt = new Date().toISOString();
  return {
    status,
    engine,
    startedAt,
    completedAt,
    durationMs: startedAt ? Date.now() - Date.parse(startedAt) : null,
    code,
    message,
    detail,
  };
}

function finalizeReading(reading, input, overrides = {}) {
  const dateKey = input.currentSky.localDateKey;
  const engine = overrides.engine ?? engineForSettings(input.settings);
  const isFallback = Boolean(overrides.isFallback);
  const mode = input.settings?.readingMode ?? 'quick-glance';
  const modeLabel = mode === 'full' ? 'Full reading' : 'Quick glance';
  const contentSignature = reading.contentSignature ?? readingContentSignature(reading);
  const isDeterministicLocal = isFallback || engine.provider === 'local';
  return {
    ...reading,
    readingId: reading.readingId ?? (
      isDeterministicLocal
        ? makeDeterministicReadingId(dateKey, mode, contentSignature)
        : makeReadingId(dateKey)
    ),
    contentSignature,
    dateKey,
    generatedAt: reading.generatedAt ?? new Date().toISOString(),
    readingMode: mode,
    modeLabel,
    engine,
    engineLabel: isFallback ? 'Local deterministic fallback' : formatEngineLabel(engine),
    modelLabel: isFallback ? 'Local deterministic' : engine.modelLabel,
    isFallback,
    fallbackReason: overrides.fallbackReason ?? null,
    providerAttempted: overrides.providerAttempted ?? false,
    aiAttempt: overrides.aiAttempt ?? null,
    sourceDetail: overrides.sourceDetail ?? reading.sourceDetail,
  };
}

function fallbackReading(local, input, { startedAt, code, message, detail, providerAttempted = true } = {}) {
  const engine = engineForSettings(input.settings);
  const reason = message ?? (providerAttempted ? 'AI interpretation did not complete.' : 'AI interpretation is disabled in Settings.');
  return finalizeReading(local, input, {
    isFallback: true,
    fallbackReason: reason,
    providerAttempted,
    engine: {
      mode: 'local',
      provider: 'local',
      providerSurface: 'Local deterministic fallback',
      modelId: 'local-symbolic-engine',
      modelLabel: 'Local deterministic',
      reasoningEffort: null,
      displayName: 'Local deterministic fallback',
      attemptedEngine: engine,
      isLocal: true,
      isAi: false,
    },
    aiAttempt: aiAttempt({
      status: providerAttempted ? 'failed' : 'skipped',
      engine,
      startedAt,
      code,
      message: reason,
      detail,
    }),
    sourceDetail: fallbackSourceMetadata(reason),
  });
}

function natalSummary(natalChart = {}) {
  const sun = findBody(natalChart, 'Sun');
  const moon = findBody(natalChart, 'Moon');
  const mercury = findBody(natalChart, 'Mercury');
  const venus = findBody(natalChart, 'Venus');
  const mars = findBody(natalChart, 'Mars');
  const asc = natalChart.angles?.find((angle) => angle.angle === 'Ascendant');
  const mc = natalChart.angles?.find((angle) => angle.angle === 'Midheaven');
  return {
    sun,
    moon,
    mercury,
    venus,
    mars,
    asc,
    mc,
    chartRuler: natalChart.chartRuler,
    bodies: natalChart.bodies,
    angles: natalChart.angles,
    houses: natalChart.houses,
    framework: natalChart.framework,
    houseSystem: natalChart.houseSystem,
    birthTimeKnown: natalChart.birthTimeKnown,
  };
}

function localProfileReading({ natalChart, user }) {
  const natal = natalSummary(natalChart);
  const name = user?.displayName || natalChart?.user?.name || 'you';
  const sun = natal.sun;
  const moon = natal.moon;
  const asc = natal.asc;
  const chartRuler = natal.chartRuler ? findBody(natalChart, natal.chartRuler) : null;
  const profileSummary = natal.asc
    ? `${name} meets life through ${asc.sign} rising, with a ${sun?.sign ?? 'unknown'} Sun and ${moon?.sign ?? 'unknown'} Moon. This is the stable natal baseline MoonTurtle uses before it reads any daily sky.`
    : `${name}'s birth time is not known, so MoonTurtle keeps this profile to planets and signs without fabricated angles or houses.`;
  const moonHouse = moon?.house ? `${ordinal(moon.house)} house` : 'house unknown';
  return {
    schemaVersion: 1,
    promptVersion: PROFILE_PROMPT_VERSION,
    source: 'local-profile-fallback',
    generatedAt: new Date().toISOString(),
    profileSummary,
    corePattern: `This rough local profile sees the chart through ${sun?.sign ?? 'the Sun'}, ${moon?.sign ?? 'the Moon'}, and ${asc?.sign ?? 'the available natal placements'}. It can name the receipts, but it is not the comprehensive AI-written operating manual yet.`,
    angles: natal.asc
      ? `Ascendant ${asc.sign}; Midheaven ${natal.mc?.sign ?? 'unknown'}. These are the body doorway and public direction in this true-sky framework.`
      : 'Angles are unavailable because the birth time is unknown.',
    chartRuler: chartRuler
      ? `${natal.chartRuler} in ${chartRuler.sign}${chartRuler.house ? `, ${ordinal(chartRuler.house)} house` : ''}: this becomes one of the profile's recurring translators.`
      : 'Chart ruler is unavailable without a known Ascendant.',
    natalMoon: `Natal Moon in ${moon?.sign ?? 'unknown'}${moon?.house ? `, ${moonHouse}` : ''}: the emotional baseline is one of the main anchors for daily readings.`,
    majorClusters: selectedProfileClusters(natalChart),
    strengths: [
      `${sun?.sign ?? 'Sun'} identity and ${moon?.sign ?? 'Moon'} feeling give the profile its first axis.`,
      chartRuler ? `${natal.chartRuler} gives the chart a recurring way of translating experience.` : 'The planet placements can still be read without inventing angles.',
      'Daily readings should return to this baseline instead of rewriting it each day.',
    ],
    shadows: [
      'A rough local profile can sound schematic compared with the intended AI reading.',
      'Do not treat house or angle language as available if birth time is unknown.',
      'Daily weather should not replace the stable natal pattern.',
    ],
    howToUseDailyReadings: `Read Today as weather moving through this profile, not as a new identity each morning.`,
    chartReceipts: profileReceipts(natalChart),
  };
}

function selectedProfileClusters(natalChart = {}) {
  const bySign = new Map();
  for (const body of natalChart.bodies ?? []) {
    const key = body.sign ?? 'Unknown';
    bySign.set(key, [...(bySign.get(key) ?? []), body.body]);
  }
  const clusters = [...bySign.entries()]
    .filter(([, bodies]) => bodies.length >= 2)
    .map(([sign, bodies]) => `${bodies.join(', ')} in ${sign}`);
  return clusters.length
    ? clusters.join('; ')
    : 'No single sign cluster dominates the basic receipt table.';
}

function profileReceipts(natalChart = {}) {
  return [
    `Framework: ${natalChart.framework ?? 'true-sky sidereal'}`,
    natalChart.birthTimeKnown ? `House system: ${natalChart.houseSystem ?? 'unknown'}` : 'Birth time unknown: angles and houses are not interpreted',
    ...['Sun', 'Moon', 'Mercury', 'Venus', 'Mars'].map((name) => {
      const body = findBody(natalChart, name);
      return body ? `${name}: ${body.degree} degree ${body.sign}${body.house ? `, ${ordinal(body.house)} house` : ''}` : null;
    }).filter(Boolean),
  ];
}

function profileProviderPayload({ natalChart, user }) {
  return {
    requestKind: 'profile',
    schemaVersion: 1,
    promptVersion: PROFILE_PROMPT_VERSION,
    user: {
      displayName: user?.displayName || natalChart?.user?.name || 'you',
    },
    natal: natalSummary(natalChart),
  };
}

function profileSourceMetadata(mode) {
  return {
    label: mode === 'api-key' ? 'AI-written profile with your provider key' : 'AI-written profile',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'The natal chart is calculated locally first, then an AI provider writes the stable comprehensive profile from those receipts.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'Traditional Western astrology',
      'MoonTurtle editorial synthesis',
      'AI language synthesis',
    ],
    caveat: 'This profile is interpretive and stable. It should not be regenerated just because the daily sky changed.',
  };
}

function profileFallbackSourceMetadata(reason = 'AI profile did not complete.') {
  return {
    label: 'Rough local profile fallback',
    metadataVersion: SOURCE_METADATA_VERSION,
    summary: 'This is a local fallback from natal chart receipts, not the full model-written profile.',
    systems: [
      'True-sky sidereal astronomy',
      'Modern Western astrology',
      'MoonTurtle local fallback',
    ],
    caveat: `${reason} MoonTurtle is showing a rough local profile so the natal receipts remain useful.`,
  };
}

function profileContentSignature(profile) {
  return stableHash({
    source: profile.source,
    profileSummary: profile.profileSummary,
    corePattern: profile.corePattern,
    natalMoon: profile.natalMoon,
    majorClusters: profile.majorClusters,
    chartReceipts: profile.chartReceipts,
  });
}

function finalizeProfileReading(profile, input, overrides = {}) {
  const engine = overrides.engine ?? engineForSettings(input.settings);
  const isFallback = Boolean(overrides.isFallback);
  const contentSignature = profile.contentSignature ?? profileContentSignature(profile);
  return {
    ...profile,
    profileId: profile.profileId ?? `profile:${input.user?.birthHash ?? 'unknown'}:${PROFILE_PROMPT_VERSION}:${contentSignature}`,
    contentSignature,
    promptVersion: profile.promptVersion ?? PROFILE_PROMPT_VERSION,
    generatedAt: profile.generatedAt ?? new Date().toISOString(),
    engine,
    engineLabel: isFallback ? 'Local deterministic fallback' : formatEngineLabel(engine),
    modelLabel: isFallback ? 'Local deterministic' : engine.modelLabel,
    isFallback,
    fallbackReason: overrides.fallbackReason ?? null,
    providerAttempted: overrides.providerAttempted ?? false,
    aiAttempt: overrides.aiAttempt ?? null,
    sourceDetail: overrides.sourceDetail ?? profile.sourceDetail,
  };
}

function fallbackProfileReading(local, input, { startedAt, code, message, detail, providerAttempted = true } = {}) {
  const engine = engineForSettings(input.settings);
  const reason = message ?? (providerAttempted ? 'AI profile did not complete.' : 'AI interpretation is disabled in Settings.');
  return finalizeProfileReading(local, input, {
    isFallback: true,
    fallbackReason: reason,
    providerAttempted,
    engine: {
      mode: 'local',
      provider: 'local',
      providerSurface: 'Local deterministic fallback',
      modelId: 'local-profile-engine',
      modelLabel: 'Local deterministic',
      reasoningEffort: null,
      displayName: 'Local deterministic fallback',
      attemptedEngine: engine,
      isLocal: true,
      isAi: false,
    },
    aiAttempt: aiAttempt({
      status: providerAttempted ? 'failed' : 'skipped',
      engine,
      startedAt,
      code,
      message: reason,
      detail,
    }),
    sourceDetail: profileFallbackSourceMetadata(reason),
  });
}

async function fetchAiPayload(payload, settings = {}, mode = aiMode(settings)) {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), providerTimeoutMs(mode));
  const headers = { 'Content-Type': 'application/json' };
  const key = providerKey(settings);
  if (settings?.aiMode === 'api-key' && key) {
    headers['X-User-Provider-Key'] = key;
    headers['X-MoonTurtle-Provider'] = settings.apiProvider ?? 'openai';
  }
  try {
    const response = await fetch('/api/reading', {
      method: 'POST',
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        providerPreference: mode,
        providerOrder: mode === 'auto' ? ['codex'] : (settings?.localProviderOrder ?? ['codex']),
        requestedModel: settings?.model ?? 'gpt-5.5',
        reasoningEffort: settings?.reasoningEffort ?? 'xhigh',
      }),
    });
    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
      const error = errorPayload?.error ?? {};
      return {
        error: {
          code: error.code ?? `provider_http_${response.status}`,
          message: error.message ?? `AI provider returned ${response.status}.`,
          detail: error.detail,
        },
      };
    }
    return { remote: await response.json() };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function generateProfileReading(input) {
  const local = localProfileReading(input);
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  if (!shouldAttemptProvider(input.settings)) {
    return fallbackProfileReading(local, input, {
      startedAt,
      code: 'provider_not_attempted',
      message: mode === 'local' ? 'AI interpretation is disabled in Settings.' : 'No configured AI provider is available here.',
      providerAttempted: false,
    });
  }

  try {
    const { remote, error } = await fetchAiPayload(profileProviderPayload(input), input.settings, mode);
    if (error) {
      return fallbackProfileReading(local, input, {
        startedAt,
        code: error.code,
        message: error.message,
        detail: error.detail,
      });
    }
    if (!remote?.profileSummary || !remote?.corePattern) {
      return fallbackProfileReading(local, input, {
        startedAt,
        code: 'provider_invalid_schema',
        message: 'AI response did not match the profile schema.',
      });
    }
    const engine = engineFromRemote(remote, input.settings);
    return finalizeProfileReading({
      ...local,
      ...remote,
      source: remote.source ?? 'provider',
      sourceDetail: profileSourceMetadata(mode),
    }, input, {
      isFallback: false,
      providerAttempted: true,
      engine,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine,
        startedAt,
        code: 'provider_completed',
        message: 'AI profile completed and passed schema validation.',
      }),
    });
  } catch (error) {
    return fallbackProfileReading(local, input, {
      startedAt,
      code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
      message: error?.name === 'AbortError'
        ? 'The app stopped waiting before the AI bridge returned a profile.'
        : (error?.message ?? 'AI profile did not complete.'),
    });
  }
}

function askContext({ question, reading, profile, sky, signals, journal }) {
  return {
    requestKind: 'ask',
    schemaVersion: 1,
    question,
    today: reading ? {
      headline: reading.headline,
      summaryLine: reading.summaryLine,
      glanceItems: reading.glanceItems,
      fullReading: reading.fullReading ?? reading.body,
      loudestSignals: reading.loudestSignals,
      notice: reading.notice,
      release: reading.release,
      act: reading.act,
      engineLabel: reading.engineLabel,
      isFallback: reading.isFallback,
    } : null,
    profile: profile ? {
      profileSummary: profile.profileSummary,
      corePattern: profile.corePattern,
      natalMoon: profile.natalMoon,
      chartRuler: profile.chartRuler,
      majorClusters: profile.majorClusters,
      engineLabel: profile.engineLabel,
      isFallback: profile.isFallback,
    } : null,
    sky: sky ? {
      localDate: sky.localDate,
      lunar: sky.lunar,
      place: sky.place?.name,
      framework: sky.framework,
    } : null,
    signals: {
      topSignals: signals?.topSignals ?? [],
      activationSignals: signals?.activationSignals?.slice(0, 5) ?? [],
    },
    journal: (journal ?? []).slice(0, 8).map((entry) => ({
      dateKey: entry.dateKey,
      headline: entry.headline,
      phase: entry.phase,
      moonSign: entry.moonSign,
      isFallback: entry.isFallback,
      engineLabel: entry.engineLabel,
    })),
  };
}

function localAskAnswer(input, reason = 'AI chat is unavailable.') {
  const sources = [
    input.profile ? 'Profile' : null,
    input.reading ? 'Today' : null,
    input.sky ? 'Sky' : null,
    input.journal?.length ? 'Journal' : null,
  ].filter(Boolean);
  const top = input.reading?.summaryLine ?? input.reading?.headline;
  const profileLine = input.profile?.profileSummary;
  return {
    schemaVersion: 1,
    source: 'local-ask-fallback',
    generatedAt: new Date().toISOString(),
    answer: [
      `${reason} I can still answer from the saved MoonTurtle context, but this is a rough grounded fallback.`,
      top ? `Today: ${top}` : null,
      profileLine ? `Profile: ${profileLine}` : null,
      `For your question, the honest next step is to read the saved sources above and ask for the AI answer again when the engine is available.`,
    ].filter(Boolean).join(' '),
    sourceChips: sources.length ? sources : ['Local fallback'],
    followUps: [
      'Explain the loudest signal in plainer language.',
      'Compare today to my profile baseline.',
      'Show the receipts behind that answer.',
    ],
    isFallback: true,
    fallbackReason: reason,
  };
}

export async function generateAskAnswer(input) {
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  const engine = engineForSettings(input.settings);
  if (!input.question?.trim()) {
    return localAskAnswer(input, 'Ask needs a question first.');
  }
  if (!shouldAttemptProvider(input.settings)) {
    return {
      ...localAskAnswer(input, mode === 'local' ? 'AI chat is disabled in Settings.' : 'No configured AI provider is available here.'),
      engine,
      engineLabel: 'Local deterministic fallback',
      aiAttempt: aiAttempt({
        status: 'skipped',
        engine,
        startedAt,
        code: 'provider_not_attempted',
        message: mode === 'local' ? 'AI chat is disabled in Settings.' : 'No configured AI provider is available here.',
      }),
    };
  }
  try {
    const { remote, error } = await fetchAiPayload(askContext(input), input.settings, mode);
    if (error) {
      return {
        ...localAskAnswer(input, error.message),
        engine: {
          mode: 'local',
          provider: 'local',
          providerSurface: 'Local deterministic fallback',
          modelId: 'local-ask-engine',
          modelLabel: 'Local deterministic',
          displayName: 'Local deterministic fallback',
          attemptedEngine: engine,
          isAi: false,
        },
        engineLabel: 'Local deterministic fallback',
        aiAttempt: aiAttempt({
          status: 'failed',
          engine,
          startedAt,
          code: error.code,
          message: error.message,
          detail: error.detail,
        }),
      };
    }
    if (!remote?.answer) {
      return localAskAnswer(input, 'AI response did not match the Ask schema.');
    }
    const remoteEngine = engineFromRemote(remote, input.settings);
    return {
      ...remote,
      source: remote.source ?? 'provider',
      generatedAt: remote.generatedAt ?? new Date().toISOString(),
      sourceChips: remote.sourceChips?.length ? remote.sourceChips : ['Profile', 'Today', 'Sky'].filter((chip) => (
        chip !== 'Profile' || input.profile
      )),
      engine: remoteEngine,
      engineLabel: formatEngineLabel(remoteEngine),
      isFallback: false,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine: remoteEngine,
        startedAt,
        code: 'provider_completed',
        message: 'AI answer completed from grounded MoonTurtle context.',
      }),
    };
  } catch (error) {
    return {
      ...localAskAnswer(input, error?.name === 'AbortError' ? 'The AI bridge timed out before Ask returned.' : (error?.message ?? 'AI chat did not complete.')),
      engineLabel: 'Local deterministic fallback',
      aiAttempt: aiAttempt({
        status: 'failed',
        engine,
        startedAt,
        code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
        message: error?.name === 'AbortError' ? 'The AI bridge timed out before Ask returned.' : (error?.message ?? 'AI chat did not complete.'),
      }),
    };
  }
}

export async function generateReading(input) {
  const local = localReading(input);
  const mode = aiMode(input.settings);
  const startedAt = new Date().toISOString();
  if (!shouldAttemptProvider(input.settings)) {
    return fallbackReading(local, input, {
      startedAt,
      code: 'provider_not_attempted',
      message: mode === 'local' ? 'AI interpretation is disabled in Settings.' : 'No configured AI provider is available here.',
      providerAttempted: false,
    });
  }

  try {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), providerTimeoutMs(mode));
    const headers = { 'Content-Type': 'application/json' };
    const key = providerKey(input.settings);
    if (input.settings?.aiMode === 'api-key' && key) {
      headers['X-User-Provider-Key'] = key;
      headers['X-MoonTurtle-Provider'] = input.settings.apiProvider ?? 'openai';
    }

    let response;
    try {
      response = await fetch('/api/reading', {
        method: 'POST',
        headers,
        signal: controller.signal,
        body: JSON.stringify({
          ...providerPayload(input),
          providerPreference: mode,
          providerOrder: mode === 'auto' ? ['codex'] : (input.settings?.localProviderOrder ?? ['codex']),
          requestedModel: input.settings?.model ?? 'gpt-5.5',
          reasoningEffort: input.settings?.reasoningEffort ?? 'xhigh',
        }),
      });
    } finally {
      globalThis.clearTimeout(timeout);
    }
    if (!response.ok) {
      let errorPayload = null;
      try {
        errorPayload = await response.json();
      } catch {
        errorPayload = null;
      }
      const error = errorPayload?.error ?? {};
      return fallbackReading(local, input, {
        startedAt,
        code: error.code ?? `provider_http_${response.status}`,
        message: error.message ?? `AI provider returned ${response.status}.`,
        detail: error.detail,
      });
    }
    const remote = await response.json();
    if (!remote?.headline || !remote?.body) {
      return fallbackReading(local, input, {
        startedAt,
        code: 'provider_invalid_schema',
        message: 'AI response did not match the reading schema.',
      });
    }
    const engine = engineFromRemote(remote, input.settings);
    return finalizeReading({
      ...local,
      ...remote,
      source: remote.source ?? 'provider',
      sourceDetail: providerSourceMetadata(mode),
    }, input, {
      isFallback: false,
      providerAttempted: true,
      engine,
      aiAttempt: aiAttempt({
        status: 'completed',
        engine,
        startedAt,
        code: 'provider_completed',
        message: 'AI interpretation completed and passed schema validation.',
      }),
    });
  } catch (error) {
    return fallbackReading(local, input, {
      startedAt,
      code: error?.name === 'AbortError' ? 'provider_timeout' : 'provider_error',
      message: error?.name === 'AbortError'
        ? 'The app stopped waiting before the AI bridge returned a reading.'
        : (error?.message ?? 'AI interpretation did not complete.'),
    });
  }
}
