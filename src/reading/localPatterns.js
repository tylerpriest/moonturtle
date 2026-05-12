import {
  aspectEntry,
  bodyEntry,
  houseEntry,
  keywordsForSign,
  moonPhaseEntry,
  signEntry,
} from './lexicon/index.js';

export function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

export function phraseList(items = [], limit = 3) {
  const clean = items.filter(Boolean).slice(0, limit);
  if (clean.length <= 1) return clean[0] ?? '';
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(', ')}, and ${clean[clean.length - 1]}`;
}

export function pair(items = []) {
  const clean = items.filter(Boolean).slice(0, 2);
  if (clean.length <= 1) return clean[0] ?? 'attention';
  return `${clean[0]} and ${clean[1]}`;
}

export function cleanBasis(entry, fallback = 'the symbol asks for careful attention') {
  return (entry?.interpretiveBasis ?? fallback).replace(/^[^:]+:\s*/, '');
}

export function findBody(chart, name) {
  return chart?.bodies?.find((body) => body.body === name);
}

export function wordsFor(sign) {
  return keywordsForSign(sign);
}

export function selectSignals(signals, count = 3) {
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

const BODY_MOTIVES = {
  Moon: {
    noun: 'feeling-body',
    motive: 'body memory, mood, need, and instinct',
    safeMove: 'let the feeling become specific before it becomes a story',
    shadow: 'one mood becoming the whole truth',
    question: 'What feeling can be felt without becoming the whole weather?',
  },
  Sun: {
    noun: 'visible self',
    motive: 'vitality, identity, visibility, and the larger chapter',
    safeMove: 'let one true thing be seen without turning it into performance',
    shadow: 'visibility becoming performance',
    question: 'What wants daylight without having to perform?',
  },
  Mercury: {
    noun: 'sentence',
    motive: 'language, naming, questions, and nervous-system tempo',
    safeMove: 'name the pattern in one clean sentence',
    shadow: 'explaining before listening',
    question: 'What sentence would make this legible without making it final?',
  },
  Venus: {
    noun: 'value question',
    motive: 'value, affection, pleasure, beauty, and receptivity',
    safeMove: 'notice what feels honest to receive',
    shadow: 'pleasing instead of choosing',
    question: 'What value is asking to be felt before it is negotiated?',
  },
  Mars: {
    noun: 'heat',
    motive: 'desire, courage, friction, and clean movement',
    safeMove: 'give the heat one useful direction',
    shadow: 'heat being mistaken for emergency',
    question: 'Where can heat become one clean movement?',
  },
  Jupiter: {
    noun: 'widening',
    motive: 'scale, faith, teaching, confidence, and a wider frame',
    safeMove: 'make room without making the story too large',
    shadow: 'inflating the meaning before it has roots',
    question: 'What can widen without becoming inflated?',
  },
  Saturn: {
    noun: 'structure',
    motive: 'limits, pressure, maturity, consequence, and time',
    safeMove: 'give the pressure one trustworthy boundary',
    shadow: 'pressure being confused with worth',
    question: 'What structure would steady this without hardening it?',
  },
  Uranus: {
    noun: 'pattern-breaker',
    motive: 'change, freedom, surprise, and pattern-break',
    safeMove: 'let one stale pattern change without making a spectacle of it',
    shadow: 'change becoming rupture for its own sake',
    question: 'What pattern can change without burning down the whole room?',
  },
  Neptune: {
    noun: 'soft place',
    motive: 'sensitivity, longing, imagination, and softened edges',
    safeMove: 'separate real tenderness from fog',
    shadow: 'softness becoming avoidance',
    question: 'What softness is real, and what is only fog?',
  },
  Pluto: {
    noun: 'pressure point',
    motive: 'depth, intensity, truth, and what refuses to stay hidden',
    safeMove: 'tell the truth in the smallest honest measure',
    shadow: 'intensity becoming control',
    question: 'What truth can be named without turning intensity into control?',
  },
  'North Node': {
    noun: 'growth edge',
    motive: 'stretch, appetite, and the unfamiliar future',
    safeMove: 'touch the unfamiliar direction lightly',
    shadow: 'turning growth into a command',
    question: 'What unfamiliar direction can be touched lightly?',
  },
  'South Node': {
    noun: 'old reflex',
    motive: 'old competence, residue, and what has become too familiar',
    safeMove: 'loosen the old reflex without rejecting the old skill',
    shadow: 'comfort becoming repetition',
    question: 'What old reflex can loosen without being rejected?',
  },
};

const TARGET_FIELDS = {
  Moon: 'body-memory and emotional baseline',
  Sun: 'vitality and sense of self',
  Mercury: 'language, thought, and translation pattern',
  Venus: 'value system, affection, and receiving pattern',
  Mars: 'wanting, anger, courage, and capacity to act',
  Jupiter: 'faith, scale, teachers, and permission to grow',
  Saturn: 'inner structure, limits, and relationship with time',
  Uranus: 'need for freedom and pattern change',
  Neptune: 'sensitivity, longing, dream life, and porous places',
  Pluto: 'depth instinct and contact with buried truth',
  'North Node': 'future-facing growth edge',
  'South Node': 'familiar reflex and inherited ease',
  Ascendant: 'body, arrival, and first response',
  Descendant: 'relationship mirror and agreements',
  Midheaven: 'visible path, vocation, and public direction',
  IC: 'roots, private ground, family pattern, and inner base',
};

const TARGET_NOUNS = {
  Moon: 'emotional baseline',
  Sun: 'sense of self',
  Mercury: 'inner language',
  Venus: 'love and value pattern',
  Mars: 'wanting and courage',
  Jupiter: 'faith and scale',
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
};

const ASPECT_DYNAMICS = {
  conjunct: {
    verb: 'meets',
    feel: 'fusion, emphasis, and immediacy',
    work: 'the symbols are in the same room, so proportion matters more than volume',
    medicine: 'let the contact be direct without letting it become total',
    risk: 'fusion turning into certainty',
  },
  opposing: {
    verb: 'faces',
    feel: 'polarity, mirroring, and relational tension',
    work: 'the work is to keep both sides visible without collapsing into either one',
    medicine: 'let the mirror teach proportion before it asks for a conclusion',
    risk: 'making one side wrong so the other can feel clean',
  },
  squaring: {
    verb: 'presses against',
    feel: 'friction, effort, and creative pressure',
    work: 'pressure can become movement if it does not have to become urgency',
    medicine: 'use the friction as a hinge, not a verdict',
    risk: 'mistaking pressure for an emergency',
  },
  trining: {
    verb: 'flows toward',
    feel: 'support, fluency, and quieter permission',
    work: 'ease is available, but it still becomes real through attention',
    medicine: 'receive the support and give it a simple form',
    risk: 'letting ease become passivity',
  },
  sextiling: {
    verb: 'opens a small door toward',
    feel: 'opportunity, cooperation, and a modest opening',
    work: 'the opening is useful if it receives one small act of participation',
    medicine: 'meet the opening with a small, real gesture',
    risk: 'waiting for a small opening to announce itself loudly',
  },
};

export function bodyMotive(body) {
  const entry = bodyEntry(body);
  return BODY_MOTIVES[body] ?? {
    noun: `${body ?? 'sky'} thread`,
    motive: phraseList(entry.keywords, 4),
    safeMove: 'notice the pattern without turning it into a rule',
    shadow: 'over-reading the signal',
    question: 'What is being shown without needing to become a rule?',
  };
}

export function targetField(target) {
  return TARGET_FIELDS[target] ?? `${target?.toLowerCase?.() ?? 'this'} pattern`;
}

export function targetNoun(target) {
  return TARGET_NOUNS[target] ?? targetField(target);
}

export function aspectDynamic(aspect) {
  return ASPECT_DYNAMICS[aspect] ?? {
    verb: aspect ?? 'touches',
    feel: aspectEntry(aspect)?.tone ?? 'contact',
    work: 'the symbol is worth noticing without turning it into a command',
    medicine: 'keep the reading close to the receipt',
    risk: 'over-reading the signal',
  };
}

export function orbPhrase(orb) {
  if (orb <= 0.5) return 'very tight';
  if (orb <= 1) return 'close';
  if (orb <= 2) return 'noticeable';
  return 'wide but present';
}

export function housePhrase(house) {
  if (!house) return null;
  const entry = houseEntry(house);
  return `the ${ordinal(house)} house field of ${pair(entry.keywords)}`;
}

export function signTexture(sign) {
  const entry = signEntry(sign);
  return `${sign}'s ${phraseList(entry.keywords, 3)}`;
}

export function signalStory(signal) {
  const transit = bodyMotive(signal.transitingBody);
  const aspect = aspectDynamic(signal.aspect);
  const house = housePhrase(signal.natalHouse);
  const skySign = signEntry(signal.transitingSign);
  const natalSign = signEntry(signal.natalSign);
  return {
    signal,
    transit,
    aspect,
    house,
    skyWords: skySign.keywords ?? [],
    natalWords: natalSign.keywords ?? [],
    intensity: signal.score >= 125 || signal.orb <= 0.5
      ? 'high'
      : signal.score >= 105 || signal.orb <= 1
        ? 'focused'
        : 'moderate',
    targetField: targetField(signal.natalTarget),
    targetNoun: targetNoun(signal.natalTarget),
  };
}

export function classifyDay({ currentSky, signals }) {
  const selected = selectSignals(signals, 3);
  const top = selected[0];
  const maxScore = top?.score ?? 0;
  const tightestOrb = selected.reduce((min, signal) => Math.min(min, signal.orb ?? 99), 99);
  const signalBodies = selected.map((signal) => signal.transitingBody);
  const signalTargets = selected.map((signal) => signal.natalTarget);
  const phase = currentSky?.lunar?.phase ?? '';
  const illumination = Number(currentSky?.lunar?.illumination ?? 0);
  const tags = [];

  if (!selected.length || maxScore < 85) tags.push('quiet');
  else if (maxScore >= 125 || tightestOrb <= 0.5) tags.push('high-intensity');
  else tags.push('moderate');

  if (/new moon|full moon|quarter/i.test(phase) || illumination <= 8 || illumination >= 92) {
    tags.push('lunar-pivot');
  }
  if (selected.some((signal) => ['Uranus', 'Neptune', 'Pluto', 'Saturn'].includes(signal.transitingBody))) {
    tags.push('outer-planet-heavy');
  }
  if (
    selected.some((signal) => (
      signal.transitingBody === 'Venus'
      || signal.natalTarget === 'Venus'
      || signal.natalTarget === 'Descendant'
      || signal.natalHouse === 7
    ))
  ) {
    tags.push('relationship-heavy');
  }
  if (
    signalBodies.includes('Moon')
    || signalTargets.includes('Moon')
    || selected.some((signal) => signal.natalHouse === 6 || signal.natalHouse === 12)
  ) {
    tags.push('body-rhythm-heavy');
  }

  const tone = tags.includes('quiet')
    ? 'quiet'
    : tags.includes('high-intensity')
      ? 'high-intensity'
      : 'moderate';

  return {
    tags,
    tone,
    topScore: maxScore,
    tightestOrb: tightestOrb === 99 ? null : tightestOrb,
    selectedSignals: selected,
  };
}

export function lunarPhaseBasis(phase) {
  return cleanBasis(moonPhaseEntry(phase), 'the lunar cycle asks for care with what is ending and beginning.');
}
