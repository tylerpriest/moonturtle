import { strict as assert } from 'node:assert';
import { computeNatal, computeSky } from '../src/domain/astronomy.js';
import { rankSignals } from '../src/domain/signals.js';
import { generateReading } from '../src/reading/generate.js';
import { LOCAL_ENGINE_ID } from '../src/reading/localEngine.js';
import { normalizeReadingShape, PROMPT_VERSION, validateReadingProse } from '../src/reading/validation.js';
import { ali } from '../src/seed/ali.js';

const TEST_USER = {
  displayName: 'Nova',
  birthHash: 'test-birth-hash',
  birth: {
    date: '1990-01-05',
    time: '08:20',
    timeZone: 'Pacific/Auckland',
    timeKnown: true,
    place: {
      name: 'Dunedin, Otago, New Zealand',
      lat: -45.8795,
      lon: 170.5006,
    },
  },
};

const CURRENT_PLACE = {
  name: 'Perth, Western Australia, Australia',
  lat: -31.9523,
  lon: 115.8613,
};

const TYLER_USER = {
  displayName: 'Tyler',
  birthHash: 'tyler-test-birth-hash',
  birth: {
    date: '1989-04-13',
    time: '13:55',
    timeZone: 'Pacific/Auckland',
    timeKnown: true,
    place: {
      name: 'Tauranga, Bay of Plenty, New Zealand',
      lat: -37.6878,
      lon: 176.1651,
    },
  },
};

const ALI_USER = {
  displayName: 'Ali',
  birthHash: 'ali-test-birth-hash',
  birth: {
    date: ali.user.birth.date,
    time: ali.user.birth.time,
    timeZone: ali.user.birth.tz,
    timeKnown: true,
    place: ali.user.birth.place,
  },
};

function buildInput(settings, {
  user = TEST_USER,
  timestamp = '2026-05-12T09:00:00+08:00',
  place = CURRENT_PLACE,
  timeZone = 'Australia/Perth',
  signalsOverride = null,
} = {}) {
  const natalChart = computeNatal(user);
  const currentSky = computeSky({
    timestamp,
    place,
    timeZone,
  });
  const signals = signalsOverride ?? rankSignals(natalChart, currentSky);
  return {
    user,
    natalChart,
    currentSky,
    signals,
    settings,
  };
}

function assertReadingContract(reading, label) {
  const validation = validateReadingProse(reading);
  assert.equal(validation.ok, true, `${label} should pass reading validation: ${validation.errors.join(' ')}`);
  assert.equal(reading.promptVersion, PROMPT_VERSION, `${label} should include promptVersion.`);
  assert.ok(reading.chartHash, `${label} should include chartHash.`);
  assert.ok(reading.skyHash, `${label} should include skyHash.`);
  assert.ok(reading.signalsHash, `${label} should include signalsHash.`);
  assert.ok(reading.activations.length >= 1 && reading.activations.length <= 3, `${label} should expose one to three activations.`);
  assert.equal(reading.primary.headline, reading.headline, `${label} should mirror primary.headline.`);
  assert.equal(reading.primary.body, reading.body, `${label} should mirror primary.body.`);
  for (const activation of reading.activations) {
    assert.ok(activation.reading, `${label} activation should expose canonical reading text.`);
    assert.ok(activation.theme, `${label} activation should expose UI theme text.`);
  }
}

function wordCount(value) {
  return String(value ?? '').trim().split(/\s+/).filter(Boolean).length;
}

function paragraphCount(value) {
  return String(value ?? '').trim().split(/\n{2,}/).filter(Boolean).length;
}

function assertActivationsFollowSignals(reading, signals) {
  const firstSignal = signals.topSignals[0] ?? signals.activationSignals[0];
  if (!firstSignal) return;
  assert.equal(
    reading.activations[0].title,
    firstSignal.title,
    'The first activation should come from the top ranked signal.',
  );
}

function assertLocalEngineQuality(reading, label) {
  assertReadingContract(reading, label);
  assert.equal(reading.engine.provider, 'local', `${label} should use the local engine.`);
  assert.equal(reading.engine.modelId, LOCAL_ENGINE_ID, `${label} should expose the local engine id.`);
  assert.equal(reading.engineLabel, 'Local MoonTurtle engine', `${label} should use the honest local engine label.`);
  assert.equal(reading.sourceDetail.label, 'MoonTurtle local synthesis', `${label} should expose local synthesis metadata.`);
  assert.ok(wordCount(reading.fullReading) > wordCount(reading.body) * 1.5, `${label} fullReading should be meaningfully longer than body.`);
  assert.ok(paragraphCount(reading.fullReading) >= 4, `${label} fullReading should have multiple paragraphs.`);
}

async function checkLocalFallback() {
  const input = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  });
  const reading = await generateReading(input);
  assert.equal(reading.isFallback, true, 'Local mode should be marked as fallback.');
  assertLocalEngineQuality(reading, 'Local reading');
  assertActivationsFollowSignals(reading, input.signals);
  return { input, reading };
}

async function checkSeedLocalReading(user, label, options = {}) {
  const input = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  }, {
    user,
    timestamp: options.timestamp ?? '2026-05-12T09:00:00+10:00',
    place: options.place ?? {
      name: 'Sydney, NSW, Australia',
      lat: -33.8688,
      lon: 151.2093,
    },
    timeZone: options.timeZone ?? 'Australia/Sydney',
  });
  const reading = await generateReading(input);
  assertLocalEngineQuality(reading, label);
  assertActivationsFollowSignals(reading, input.signals);
}

function emptySignals() {
  return {
    topSignals: [],
    activationSignals: [],
    supportingSignals: [],
    omittedBecauseQuiet: [],
  };
}

function syntheticSignal({ natalChart, currentSky, transitingBody, natalTarget, aspect, orb, score }) {
  const natal = [
    ...(natalChart.bodies ?? []),
    ...(natalChart.angles ?? []).map((angle) => ({ ...angle, body: angle.angle })),
  ].find((entry) => entry.body === natalTarget || entry.angle === natalTarget);
  const current = currentSky.bodies?.find((entry) => entry.body === transitingBody);
  return {
    id: `${transitingBody}-${aspect}-${natalTarget}-fixture`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    type: 'transit_to_natal',
    transitingBody,
    transitingSign: current?.sign ?? currentSky.lunar.moonSign,
    natalTarget,
    natalSign: natal?.sign ?? 'Gemini',
    natalHouse: natal?.house ?? null,
    aspect,
    orb,
    score,
    title: `${transitingBody} in ${current?.sign ?? currentSky.lunar.moonSign} ${aspect} natal ${natalTarget}`,
    activates: `natal ${natalTarget}${natal?.sign ? ` in ${natal.sign}` : ''}${natal?.house ? ` / ${natal.house} house` : ''}`,
    reasons: [
      `${transitingBody} fixture`,
      `natal ${natalTarget}`,
      `${orb}° orb`,
      aspect,
    ],
  };
}

async function checkQuietDay() {
  const input = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  }, {
    signalsOverride: emptySignals(),
  });
  const reading = await generateReading(input);
  assertLocalEngineQuality(reading, 'Quiet local reading');
  const text = `${reading.body} ${reading.fullReading}`.toLowerCase();
  for (const forbidden of ['crisis', 'fate', 'destiny', 'emergency']) {
    assert.equal(text.includes(forbidden), false, `Quiet day should not use melodramatic word: ${forbidden}.`);
  }
}

async function checkUnknownBirthTime() {
  const unknownUser = {
    ...TEST_USER,
    birthHash: 'unknown-time-test-birth-hash',
    birth: {
      ...TEST_USER.birth,
      timeKnown: false,
      time: '',
    },
  };
  const input = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  }, { user: unknownUser });
  assert.equal(input.natalChart.birthTimeKnown, false, 'Fixture should have unknown birth time.');
  const reading = await generateReading(input);
  assertLocalEngineQuality(reading, 'Unknown-time local reading');
  const text = `${reading.body} ${reading.fullReading}`;
  assert.equal(/\bAscendant\b/.test(text), false, 'Unknown-time reading should not fabricate Ascendant language.');
  assert.equal(/\bMidheaven\b/.test(text), false, 'Unknown-time reading should not fabricate Midheaven language.');
}

async function checkTightMoonContact() {
  const base = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  });
  const signal = syntheticSignal({
    natalChart: base.natalChart,
    currentSky: base.currentSky,
    transitingBody: 'Moon',
    natalTarget: 'Moon',
    aspect: 'conjunct',
    orb: 0.12,
    score: 148,
  });
  const input = { ...base, signals: { ...emptySignals(), topSignals: [signal], activationSignals: [signal] } };
  const reading = await generateReading(input);
  assertLocalEngineQuality(reading, 'Tight Moon local reading');
  assertActivationsFollowSignals(reading, input.signals);
  assert.ok(reading.body.includes('tight') || reading.fullReading.includes('tight'), 'Tight Moon contact should name tightness.');
}

async function checkOuterPlanetContact() {
  const base = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  }, { user: TYLER_USER });
  const signal = syntheticSignal({
    natalChart: base.natalChart,
    currentSky: base.currentSky,
    transitingBody: 'Pluto',
    natalTarget: 'Sun',
    aspect: 'squaring',
    orb: 0.42,
    score: 152,
  });
  const input = { ...base, signals: { ...emptySignals(), topSignals: [signal], activationSignals: [signal] } };
  const reading = await generateReading(input);
  assertLocalEngineQuality(reading, 'Outer planet local reading');
  assertActivationsFollowSignals(reading, input.signals);
  const text = `${reading.body} ${reading.fullReading}`.toLowerCase();
  assert.ok(text.includes('pressure') || text.includes('intensity'), 'Outer-planet contact should name pressure or intensity.');
  assert.equal(/fated|destined|will happen/.test(text), false, 'Outer-planet contact should avoid fatalism.');
}

async function checkProviderPayloadPrivacy(remoteFixture) {
  const input = buildInput({
    aiMode: 'api-key',
    apiProvider: 'openai',
    apiKeys: { openai: 'test-key', anthropic: '' },
    model: 'gpt-5.5',
    reasoningEffort: 'xhigh',
    readingMode: 'quick-glance',
  });
  let capturedBody = '';
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options = {}) => {
    capturedBody = String(options.body ?? '');
    return {
      ok: true,
      json: async () => ({
        ...remoteFixture,
        source: 'test-provider',
        providerMeta: {
          provider: 'openai',
          providerSurface: 'OpenAI API',
          modelId: 'gpt-5.5',
          modelLabel: 'GPT-5.5',
          reasoningEffort: 'xhigh',
        },
      }),
    };
  };

  try {
    const reading = await generateReading(input);
    assert.equal(reading.isFallback, false, 'Valid provider fixture should not be fallback.');
    assertReadingContract(reading, 'Provider reading');
    assert.ok(capturedBody, 'Provider request body should be captured.');
    assert.equal(capturedBody.includes(TEST_USER.birth.date), false, 'Provider payload must not include raw birth date.');
    assert.equal(capturedBody.includes(TEST_USER.birth.time), false, 'Provider payload must not include raw birth time.');
    assert.equal(capturedBody.includes(TEST_USER.birth.place.name), false, 'Provider payload must not include raw birthplace text.');
    assert.equal(capturedBody.includes(CURRENT_PLACE.name), false, 'Provider payload must not include raw current-place text.');
    assert.equal(capturedBody.includes('test-key'), false, 'Provider payload must not include API key.');
  } finally {
    globalThis.fetch = previousFetch;
  }
}

async function checkProviderInvalidSchemaFallsBack() {
  const input = buildInput({
    aiMode: 'api-key',
    apiProvider: 'openai',
    apiKeys: { openai: 'test-key', anthropic: '' },
    model: 'gpt-5.5',
    reasoningEffort: 'xhigh',
    readingMode: 'quick-glance',
  });
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      headline: 'Too many signals.',
      body: 'This response should be rejected because it does not honor the daily basic contract.',
      lunarAxis: {
        natalSign: 'Gemini',
        currentSign: 'Capricorn',
        reading: 'The Moon axis is present, but the activation count is wrong.',
      },
      activations: [1, 2, 3, 4].map((index) => ({
        title: `Signal ${index}`,
        reading: 'A rejected provider card.',
      })),
      notice: ['One', 'Two', 'Three', 'Four'],
      avoid: ['One', 'Two', 'Three', 'Four'],
    }),
  });

  try {
    const reading = await generateReading(input);
    assert.equal(reading.isFallback, true, 'Invalid provider schema should fall back.');
    assert.equal(reading.aiAttempt.code, 'reading_schema_invalid', 'Invalid provider schema should name the schema failure.');
    assertReadingContract(reading, 'Invalid-schema fallback');
  } finally {
    globalThis.fetch = previousFetch;
  }
}

async function checkProviderForbiddenVoiceFallsBack() {
  const input = buildInput({
    aiMode: 'api-key',
    apiProvider: 'openai',
    apiKeys: { openai: 'test-key', anthropic: '' },
    model: 'gpt-5.5',
    reasoningEffort: 'xhigh',
    readingMode: 'quick-glance',
  });
  const previousFetch = globalThis.fetch;
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      headline: 'A forbidden phrase appears.',
      body: 'Today has energy that should be rejected by validation.',
      lunarAxis: {
        natalSign: 'Gemini',
        currentSign: 'Capricorn',
        reading: 'The Moon axis reading is otherwise shaped correctly.',
      },
      activations: [{
        title: 'Moon touching natal Mercury',
        reading: 'This card is shaped correctly but the body has a forbidden word.',
      }],
      notice: ['One clear thread', 'A steady breath', 'The useful sentence', 'A small repair'],
      avoid: ['Inflating the symbol', 'Borrowed urgency', 'Certainty theater', 'Body metaphor as diagnosis'],
    }),
  });

  try {
    const reading = await generateReading(input);
    assert.equal(reading.isFallback, true, 'Forbidden provider voice should fall back.');
    assert.equal(reading.aiAttempt.code, 'voice_validation_failed', 'Forbidden provider voice should name the voice failure.');
    assertReadingContract(reading, 'Forbidden-voice fallback');
  } finally {
    globalThis.fetch = previousFetch;
  }
}

function checkCanonicalShapeNormalization(localReading) {
  const canonical = normalizeReadingShape({
    primary: {
      headline: localReading.headline,
      body: localReading.body,
    },
    lunarAxis: {
      natalSign: localReading.lunarAxis.natal.sign,
      currentSign: localReading.lunarAxis.current.sign,
      reading: localReading.lunarAxis.reading,
    },
    activations: localReading.activations.map((activation) => ({
      title: activation.title,
      reading: activation.reading,
    })),
    notice: localReading.notice,
    avoid: localReading.avoid,
  });

  const validation = validateReadingProse(canonical);
  assert.equal(validation.ok, true, `Canonical shape should normalize cleanly: ${validation.errors.join(' ')}`);
}

try {
  const { reading } = await checkLocalFallback();
  checkCanonicalShapeNormalization(reading);
  await checkSeedLocalReading(TYLER_USER, 'Tyler local reading');
  await checkSeedLocalReading(ALI_USER, 'Ali local reading');
  await checkUnknownBirthTime();
  await checkQuietDay();
  await checkTightMoonContact();
  await checkOuterPlanetContact();
  await checkProviderPayloadPrivacy({
    headline: reading.headline,
    body: reading.body,
    lunarAxis: reading.lunarAxis,
    activations: reading.activations,
    notice: reading.notice,
    avoid: reading.avoid,
  });
  await checkProviderInvalidSchemaFallsBack();
  await checkProviderForbiddenVoiceFallsBack();
  console.log('Reading validation checks passed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
