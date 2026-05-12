import { strict as assert } from 'node:assert';
import { computeNatal, computeSky } from '../src/domain/astronomy.js';
import { rankSignals } from '../src/domain/signals.js';
import { generateReading } from '../src/reading/generate.js';
import { normalizeReadingShape, PROMPT_VERSION, validateReadingProse } from '../src/reading/validation.js';

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

function buildInput(settings) {
  const natalChart = computeNatal(TEST_USER);
  const currentSky = computeSky({
    timestamp: '2026-05-12T09:00:00+08:00',
    place: CURRENT_PLACE,
    timeZone: 'Australia/Perth',
  });
  const signals = rankSignals(natalChart, currentSky);
  return {
    user: TEST_USER,
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
  assert.equal(reading.primary.headline, reading.headline, `${label} should mirror primary.headline.`);
  assert.equal(reading.primary.body, reading.body, `${label} should mirror primary.body.`);
  for (const activation of reading.activations) {
    assert.ok(activation.reading, `${label} activation should expose canonical reading text.`);
    assert.ok(activation.theme, `${label} activation should expose UI theme text.`);
  }
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

async function checkLocalFallback() {
  const input = buildInput({
    aiMode: 'local',
    readingMode: 'quick-glance',
  });
  const reading = await generateReading(input);
  assert.equal(reading.isFallback, true, 'Local mode should be marked as fallback.');
  assert.equal(reading.engine.provider, 'local', 'Local mode should use the local engine.');
  assertReadingContract(reading, 'Local reading');
  assertActivationsFollowSignals(reading, input.signals);
  return { input, reading };
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
    assert.equal(capturedBody.includes('test-key'), false, 'Provider payload must not include API key.');
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
  await checkProviderPayloadPrivacy({
    headline: reading.headline,
    body: reading.body,
    lunarAxis: reading.lunarAxis,
    activations: reading.activations,
    notice: reading.notice,
    avoid: reading.avoid,
  });
  console.log('Reading validation checks passed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
