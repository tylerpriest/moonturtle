export const PROMPT_VERSION = 'reading-prompt-v1';

const REQUIRED_TOP_LEVEL = ['headline', 'body', 'lunarAxis', 'activations', 'notice', 'avoid'];

const FORBIDDEN_PATTERNS = [
  { label: 'energy', pattern: /\benergy\b/i },
  { label: 'vibes', pattern: /\bvibes?\b/i },
  { label: 'alignment', pattern: /\balign(?:ment|ed|ing)?\b/i },
  { label: 'manifestation', pattern: /\bmanifest(?:ation|ing|ed|s)?\b/i },
  { label: 'the universe as agent', pattern: /\bthe universe\b/i },
  { label: 'abundance', pattern: /\babundance\b/i },
  { label: 'blessed', pattern: /\bbless(?:ed|ings?)\b/i },
  { label: 'high vibration', pattern: /\bhigh vibration\b/i },
  { label: 'low vibration', pattern: /\blow vibration\b/i },
  { label: 'raise your frequency', pattern: /\braise your frequency\b/i },
  { label: 'divine feminine', pattern: /\bdivine feminine\b/i },
  { label: 'divine masculine', pattern: /\bdivine masculine\b/i },
];

const EXEMPLAR_BLEED_TERMS = [
  'Tyler',
  'Ali',
  'Tauranga',
  'Melbourne',
  'Manly',
  'Sydney',
];

export function stableHash(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function cleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeActivation(activation = {}) {
  const reading = cleanString(activation.reading) || cleanString(activation.theme);
  return {
    ...activation,
    title: cleanString(activation.title),
    reading,
    theme: cleanString(activation.theme) || reading,
    activates: cleanString(activation.activates) || 'the loudest daily signal',
    question: cleanString(activation.question),
    insight: cleanString(activation.insight),
  };
}

function normalizeLunarAxis(lunarAxis = {}) {
  const natal = lunarAxis.natal ?? {};
  const current = lunarAxis.current ?? {};
  const natalSign = cleanString(lunarAxis.natalSign) || cleanString(natal.sign);
  const currentSign = cleanString(lunarAxis.currentSign) || cleanString(current.sign);

  return {
    ...lunarAxis,
    natalSign,
    currentSign,
    natal: {
      ...natal,
      sign: natalSign || 'Unknown',
      house: cleanString(natal.house) || 'house unknown',
      words: Array.isArray(natal.words) ? natal.words.map(cleanString).filter(Boolean) : [],
    },
    current: {
      ...current,
      sign: currentSign || 'Unknown',
      words: Array.isArray(current.words) ? current.words.map(cleanString).filter(Boolean) : [],
    },
    reading: cleanString(lunarAxis.reading),
  };
}

export function normalizeReadingShape(reading = {}) {
  const primary = reading.primary ?? {};
  const headline = cleanString(reading.headline) || cleanString(primary.headline);
  const body = cleanString(reading.body) || cleanString(primary.body);

  return {
    ...reading,
    primary: {
      ...primary,
      headline,
      body,
    },
    headline,
    body,
    lunarAxis: normalizeLunarAxis(reading.lunarAxis),
    activations: Array.isArray(reading.activations)
      ? reading.activations.map(normalizeActivation)
      : [],
    notice: Array.isArray(reading.notice) ? reading.notice.map(cleanString).filter(Boolean) : [],
    avoid: Array.isArray(reading.avoid) ? reading.avoid.map(cleanString).filter(Boolean) : [],
  };
}

function collectProseStrings(reading = {}) {
  const strings = [
    reading.headline,
    reading.body,
    reading.lunarAxis?.reading,
    ...(reading.activations ?? []).flatMap((activation) => [
      activation.title,
      activation.reading,
      activation.theme,
      activation.question,
      activation.insight,
    ]),
    ...(reading.notice ?? []),
    ...(reading.avoid ?? []),
  ];
  return strings.filter((value) => typeof value === 'string' && value.trim());
}

function hasHtmlOrMarkdown(value) {
  return /<[^>]+>/.test(value) || /(^|\s)(#{1,6}\s|\*\*|__|```|\[[^\]]+\]\([^)]+\))/.test(value);
}

export function validateReadingProse(reading, {
  checkForbidden = true,
  checkExemplarBleed = true,
} = {}) {
  const normalized = normalizeReadingShape(reading);
  const errors = [];

  for (const key of REQUIRED_TOP_LEVEL) {
    if (!(key in normalized)) errors.push(`Missing top-level key: ${key}.`);
  }
  if (!normalized.headline) errors.push('Missing primary headline.');
  if (!normalized.body) errors.push('Missing primary body.');
  if (!normalized.lunarAxis?.natalSign) errors.push('Missing lunarAxis natal sign.');
  if (!normalized.lunarAxis?.currentSign) errors.push('Missing lunarAxis current sign.');
  if (!normalized.lunarAxis?.reading) errors.push('Missing lunarAxis reading.');
  if (normalized.activations.length !== 5) {
    errors.push(`Expected exactly 5 activations, received ${normalized.activations.length}.`);
  }
  normalized.activations.forEach((activation, index) => {
    if (!activation.title) errors.push(`Activation ${index + 1} is missing title.`);
    if (!activation.reading) errors.push(`Activation ${index + 1} is missing reading.`);
  });
  if (normalized.notice.length !== 4) {
    errors.push(`Expected exactly 4 notice items, received ${normalized.notice.length}.`);
  }
  if (normalized.avoid.length !== 4) {
    errors.push(`Expected exactly 4 avoid items, received ${normalized.avoid.length}.`);
  }

  const prose = collectProseStrings(normalized);
  for (const item of prose) {
    if (hasHtmlOrMarkdown(item)) errors.push(`Plain-text violation: ${item.slice(0, 48)}.`);
  }

  if (checkForbidden) {
    for (const item of prose) {
      for (const { label, pattern } of FORBIDDEN_PATTERNS) {
        if (pattern.test(item)) errors.push(`Forbidden phrase "${label}" appears in: ${item.slice(0, 64)}.`);
      }
    }
  }

  if (checkExemplarBleed) {
    for (const item of prose) {
      for (const term of EXEMPLAR_BLEED_TERMS) {
        const pattern = new RegExp(`\\b${term}\\b`, 'i');
        if (pattern.test(item)) errors.push(`Possible exemplar bleed "${term}" appears in: ${item.slice(0, 64)}.`);
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    normalized,
  };
}

export function readingHashes({ natalChart, currentSky, signals }) {
  const bodySnapshot = (body) => ({
    body: body.body,
    sign: body.sign,
    longitude: Number(body.longitude?.toFixed?.(3) ?? body.longitude),
    latitude: Number(body.latitude?.toFixed?.(3) ?? body.latitude ?? 0),
    house: body.house ?? null,
    retrograde: Boolean(body.retrograde),
    chartRuler: Boolean(body.chartRuler),
    signMethod: body.signMethod ?? null,
    constellation: body.constellation ?? null,
  });
  const angleSnapshot = (angle) => ({
    angle: angle.angle,
    sign: angle.sign,
    longitude: Number(angle.longitude?.toFixed?.(3) ?? angle.longitude),
    signMethod: angle.signMethod ?? null,
  });
  const skyBodySnapshot = (body) => ({
    body: body.body,
    sign: body.sign,
    longitude: Number(body.longitude?.toFixed?.(2) ?? body.longitude),
    latitude: Number(body.latitude?.toFixed?.(2) ?? body.latitude ?? 0),
    retrograde: Boolean(body.retrograde),
    signMethod: body.signMethod ?? null,
    constellation: body.constellation ?? null,
  });
  const signalSnapshot = (signal) => ({
    id: signal.id,
    transitingBody: signal.transitingBody,
    transitingSign: signal.transitingSign,
    natalTarget: signal.natalTarget,
    natalSign: signal.natalSign,
    aspect: signal.aspect,
    orb: signal.orb,
    score: signal.score,
  });

  return {
    promptVersion: PROMPT_VERSION,
    chartHash: stableHash({
      framework: natalChart.framework,
      houseSystem: natalChart.houseSystem,
      birthTimeKnown: natalChart.birthTimeKnown,
      chartRuler: natalChart.chartRuler,
      bodies: natalChart.bodies?.map(bodySnapshot),
      angles: natalChart.angles?.map(angleSnapshot),
    }),
    skyHash: stableHash({
      framework: currentSky.framework,
      localDateKey: currentSky.localDateKey,
      place: currentSky.place?.name,
      timeZone: currentSky.timeZone,
      lunar: currentSky.lunar,
      bodies: currentSky.bodies?.map(skyBodySnapshot),
    }),
    signalsHash: stableHash({
      topSignals: signals.topSignals?.map(signalSnapshot),
      activationSignals: signals.activationSignals?.map(signalSnapshot),
    }),
  };
}
