import { readFile } from 'node:fs/promises';
import { strict as assert } from 'node:assert';
import { computeNatal } from '../src/domain/astronomy.js';
import { rankSignals } from '../src/domain/signals.js';
import boundaries from '../src/domain/zodiac-boundaries.json' with { type: 'json' };

const TYLER_USER = {
  displayName: 'Tyler',
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
  displayName: 'Ali Sunflowers',
  birth: {
    date: '1983-06-23',
    time: '17:58',
    timeZone: 'Australia/Melbourne',
    timeKnown: true,
    place: {
      name: 'Melbourne, Victoria, Australia',
      lat: -37.8136,
      lon: 144.9631,
    },
  },
};

function bodySign(chart, bodyName) {
  return chart.bodies.find((body) => body.body === bodyName)?.sign;
}

function angleSign(chart, angleName) {
  return chart.angles.find((angle) => angle.angle === angleName)?.sign;
}

function checkBoundaryTable() {
  const signs = boundaries.map((boundary) => boundary.sign);
  assert.equal(signs.length, 13, 'Boundary table should contain exactly 13 true-sky signs.');
  assert.equal(new Set(signs).size, 13, 'Boundary table signs should be unique.');
  assert.ok(signs.includes('Ophiuchus'), 'Boundary table should include Ophiuchus.');
}

function checkSeedUserCharts() {
  const tyler = computeNatal(TYLER_USER);
  assert.equal(bodySign(tyler, 'Sun'), 'Pisces', 'Tyler Sun should remain Pisces.');
  assert.equal(bodySign(tyler, 'Moon'), 'Gemini', 'Tyler Moon should remain Gemini.');
  assert.equal(angleSign(tyler, 'Ascendant'), 'Gemini', 'Tyler Ascendant should remain Gemini.');
  assert.equal(angleSign(tyler, 'Midheaven'), 'Aries', 'Tyler Midheaven should remain Aries.');
  assert.notEqual(bodySign(tyler, 'Sun'), 'Aries', 'Tyler Sun must not leak tropical Aries.');

  const ali = computeNatal(ALI_USER);
  assert.equal(bodySign(ali, 'Sun'), 'Gemini', 'Ali Sun should remain Gemini.');
  assert.equal(bodySign(ali, 'Moon'), 'Ophiuchus', 'Ali Moon should remain Ophiuchus under actual-sky IAU lookup.');
  assert.equal(ali.bodies.find((body) => body.body === 'Moon')?.signMethod, 'actual-sky-topocentric-iau', 'Ali Moon should be labelled from actual observer-sky constellation lookup.');
  assert.equal(ali.bodies.find((body) => body.body === 'Venus')?.sign, 'Cancer', 'Ali Venus should remain Cancer under actual-sky IAU lookup.');
  assert.equal(angleSign(ali, 'Ascendant'), 'Sagittarius', 'Ali Ascendant should remain Sagittarius.');
  assert.equal(ali.chartRuler, 'Jupiter', 'Ali chart ruler should be Jupiter with Sagittarius rising.');
  assert.equal(ali.bodies.find((body) => body.body === 'Jupiter')?.chartRuler, true, 'Ali Jupiter should be marked as chart ruler.');
}

function checkUnknownBirthTime() {
  const unknownTime = computeNatal({
    ...TYLER_USER,
    birth: {
      ...TYLER_USER.birth,
      timeKnown: false,
    },
  });

  assert.equal(unknownTime.birthTimeKnown, false, 'Unknown time chart should be marked birthTimeKnown=false.');
  assert.equal(unknownTime.angles.length, 0, 'Unknown time should omit angles.');
  assert.equal(unknownTime.houses.length, 0, 'Unknown time should omit houses.');
  assert.equal(unknownTime.chartRuler, null, 'Unknown time should omit chart ruler.');
  assert.equal(unknownTime.bodies.some((body) => body.house !== null), false, 'Unknown time should omit body houses.');
  assert.equal(unknownTime.bodies.some((body) => body.chartRuler), false, 'Unknown time should not mark any chart ruler body.');
}

function checkSignalShape() {
  const natal = computeNatal(TYLER_USER);
  const signals = rankSignals(natal, {
    bodies: natal.bodies.map((body) => ({
      ...body,
      sign: body.sign,
      longitude: body.longitude,
    })),
  });

  assert.ok(signals.topSignals.length <= 3, 'Top signals should never exceed 3.');
  for (const signal of signals.activationSignals) {
    assert.ok(Number.isFinite(signal.score), `Signal ${signal.id} should have a numeric score.`);
    assert.ok(Array.isArray(signal.reasons) && signal.reasons.length > 0, `Signal ${signal.id} should explain its reasons.`);
  }
}

async function checkRuntimeTropicalLeak() {
  const files = [
    'src/domain/astronomy.js',
    'src/domain/signals.js',
    'src/reading/generate.js',
    'src/reading/useReading.js',
    'src/ui/screens/TodayScreen.jsx',
    'src/ui/screens/SkyScreen.jsx',
    'src/ui/screens/NatalScreen.jsx',
    'src/ui/screens/MethodScreen.jsx',
  ];
  const hits = [];
  for (const file of files) {
    const text = await readFile(new URL(`../${file}`, import.meta.url), 'utf8');
    if (/\btropical\b/i.test(text)) hits.push(file);
  }
  assert.deepEqual(hits, [], `Runtime files should not contain tropical fallback labels: ${hits.join(', ')}`);
}

try {
  checkBoundaryTable();
  checkSeedUserCharts();
  checkUnknownBirthTime();
  checkSignalShape();
  await checkRuntimeTropicalLeak();
  console.log('Astronomy regression checks passed.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
