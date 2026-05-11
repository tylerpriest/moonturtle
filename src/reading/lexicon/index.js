import lexicon from './symbolic-lexicon.json' with { type: 'json' };

const DEFAULT_ENTRY = {
  keywords: ['attention', 'pattern', 'presence'],
  shadow: ['over-identification'],
  body: ['body'],
  systems: ['moonturtle-editorial'],
  interpretiveBasis: 'MoonTurtle editorial symbolism: use this as reflective language, not objective fact.',
};

export const SYMBOLIC_LEXICON = lexicon;
export const SOURCE_METADATA_VERSION = 'local-synthesis-v3';

export function systemLabels(ids = []) {
  return [...new Set(ids)]
    .map((id) => lexicon.systems[id]?.label)
    .filter(Boolean);
}

export function signEntry(sign) {
  return lexicon.signs[sign] ?? DEFAULT_ENTRY;
}

export function bodyEntry(body) {
  return lexicon.bodies[body] ?? DEFAULT_ENTRY;
}

export function aspectEntry(aspect) {
  return lexicon.aspects[aspect] ?? DEFAULT_ENTRY;
}

export function houseEntry(house) {
  return lexicon.houses[String(house)] ?? DEFAULT_ENTRY;
}

export function moonPhaseEntry(phase) {
  return lexicon.moonPhases[phase] ?? DEFAULT_ENTRY;
}

export function keywordsForSign(sign) {
  return signEntry(sign).keywords ?? DEFAULT_ENTRY.keywords;
}

export function actionForBody(body) {
  return bodyEntry(body).localAction ?? 'notice';
}

export function readingSourceMetadata({ currentSky, signals } = {}) {
  const ids = new Set([
    'true-sky-sidereal-astronomy',
    'modern-western-astrology',
    'traditional-western-astrology',
    'lunar-cycle-practice',
    'somatic-reflective-practice',
    'moonturtle-editorial',
  ]);

  const addSystems = (entry) => entry?.systems?.forEach((id) => ids.add(id));
  addSystems(moonPhaseEntry(currentSky?.lunar?.phase));
  addSystems(signEntry(currentSky?.lunar?.moonSign));
  for (const signal of signals?.topSignals ?? signals?.activationSignals ?? []) {
    addSystems(bodyEntry(signal.transitingBody));
    addSystems(signEntry(signal.transitingSign));
    addSystems(signEntry(signal.natalSign));
    addSystems(aspectEntry(signal.aspect));
  }

  return {
    label: 'Local symbolic lexicon',
    metadataVersion: SOURCE_METADATA_VERSION,
    lexiconVersion: lexicon.schemaVersion,
    summary: lexicon.summary,
    systems: systemLabels([...ids]),
    caveat: 'The astronomy is calculated; the meanings are authored symbolic interpretations from the named systems.',
  };
}
