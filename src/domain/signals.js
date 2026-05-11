const BODY_WEIGHT = {
  Moon: 55,
  Sun: 55,
  Mercury: 40,
  Venus: 45,
  Mars: 45,
  Jupiter: 50,
  Saturn: 65,
  Uranus: 60,
  Neptune: 60,
  Pluto: 65,
  'North Node': 55,
  'South Node': 55,
};

function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

function angularDistance(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return diff > 180 ? 360 - diff : diff;
}

const TARGET_WEIGHT = {
  Ascendant: 35,
  Descendant: 35,
  Midheaven: 35,
  IC: 35,
  Sun: 30,
  Moon: 30,
  Mercury: 18,
  Venus: 22,
  Mars: 22,
  'North Node': 20,
  'South Node': 20,
};

const ASPECTS = [
  { name: 'conjunct', angle: 0, weight: 25 },
  { name: 'opposing', angle: 180, weight: 22 },
  { name: 'squaring', angle: 90, weight: 20 },
  { name: 'trining', angle: 120, weight: 14 },
  { name: 'sextiling', angle: 60, weight: 8 },
];

function orbScore(orb) {
  if (orb <= 0.5) return 35;
  if (orb <= 1) return 25;
  if (orb <= 2) return 15;
  if (orb <= 3) return 8;
  return 0;
}

function maxOrb(body) {
  if (body === 'Moon') return 3;
  if (['Sun', 'Mercury', 'Venus', 'Mars'].includes(body)) return 4;
  if (['Jupiter', 'Saturn'].includes(body)) return 5;
  return 3;
}

function closestAspect(current, natal, transitingBody) {
  const separation = angularDistance(current, natal);
  const limit = maxOrb(transitingBody);
  let best = null;
  for (const aspect of ASPECTS) {
    const orb = Math.abs(separation - aspect.angle);
    if (orb <= limit && (!best || orb < best.orb)) {
      best = { ...aspect, orb, separation };
    }
  }
  return best;
}

function targetLabel(target) {
  return target.angle || target.body;
}

function targetWeight(target, chartRuler) {
  const label = targetLabel(target);
  let weight = TARGET_WEIGHT[label] ?? 8;
  if (label === chartRuler || target.chartRuler) weight += 28;
  return weight;
}

export function rankSignals(natalChart, currentSky) {
  const natalTargets = [
    ...natalChart.bodies,
    ...(natalChart.birthTimeKnown ? natalChart.angles.map((a) => ({ ...a, body: a.angle })) : []),
  ];
  const signals = [];
  for (const transiting of currentSky.bodies) {
    for (const natal of natalTargets) {
      const aspect = closestAspect(transiting.longitude, natal.longitude, transiting.body);
      if (!aspect) continue;
      const base = BODY_WEIGHT[transiting.body] ?? 25;
      const target = targetWeight(natal, natalChart.chartRuler);
      const tight = orbScore(aspect.orb);
      const exactToday = aspect.orb <= 1 ? 10 : 0;
      const score = Math.round(base + target + aspect.weight + tight + exactToday);
      const natalName = targetLabel(natal);
      signals.push({
        id: `${transiting.body}-${aspect.name}-${natalName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'transit_to_natal',
        transitingBody: transiting.body,
        transitingSign: transiting.sign,
        natalTarget: natalName,
        natalSign: natal.sign,
        aspect: aspect.name,
        orb: Number(aspect.orb.toFixed(2)),
        score,
        title: `${transiting.body} in ${transiting.sign} ${aspect.name} natal ${natalName}`,
        activates: `natal ${natalName}${natal.sign ? ` in ${natal.sign}` : ''}${natal.house ? ` / ${ordinal(natal.house)} house` : ''}`,
        theme: signalTheme(transiting.body, natalName, aspect.name),
        reasons: [
          `${transiting.body} signal`,
          `natal ${natalName}`,
          `${aspect.orb.toFixed(2)}° orb`,
          aspect.name,
        ],
      });
    }
  }
  const sorted = signals.sort((a, b) => b.score - a.score);
  const deduped = [];
  const seen = new Set();
  for (const signal of sorted) {
    const key = `${signal.transitingBody}:${signal.natalTarget}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(signal);
  }
  return {
    topSignals: deduped.filter((signal) => signal.score >= 95).slice(0, 3),
    activationSignals: deduped.slice(0, 5),
    supportingSignals: deduped.slice(5, 12),
    omittedBecauseQuiet: deduped.slice(12),
  };
}

export function ordinal(n) {
  if (n === 1) return '1st';
  if (n === 2) return '2nd';
  if (n === 3) return '3rd';
  return `${n}th`;
}

function signalTheme(body, target, aspect) {
  const bodyText = {
    Moon: 'Daily feeling, body rhythm, memory, and mood.',
    Sun: 'Visibility, vitality, identity, and the larger chapter.',
    Mercury: 'Language, naming, questions, and the nervous system.',
    Venus: 'Value, affection, beauty, pleasure, and relational ease.',
    Mars: 'Action, heat, desire, friction, and courage.',
    Jupiter: 'Expansion, faith, teaching, and a wider frame.',
    Saturn: 'Structure, pressure, maturity, limits, and commitment.',
    Uranus: 'Disruption, freedom, awakening, and new pattern.',
    Neptune: 'Sensitivity, longing, imagination, and dissolving certainty.',
    Pluto: 'Depth, intensity, truth, and transformation.',
  }[body] ?? 'A current sky movement';
  const aspectText = aspect === 'conjunct' ? 'meeting' : aspect;
  return `${bodyText} ${body} is ${aspectText} ${target}, so this signal is worth noticing without turning it into a command.`;
}
