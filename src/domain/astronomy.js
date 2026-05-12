import * as Astronomy from 'astronomy-engine';
import { calculateChart } from 'celestine';
import boundaries from './zodiac-boundaries.json' with { type: 'json' };
import { BODY_SYMBOLS, FRAMEWORK, HOUSE_SYSTEM, NODE_TYPE, TRADITIONAL_RULERS } from './schema.js';
import { getOffsetHours, getZonedParts, zonedTimeToUtc } from '../io/timezone.js';

const LUNATION_DAYS = 29.530588853;
const AU_KM = 149597870.7;
const NATAL_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'Chiron'];
const SKY_PLANETS = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
const ASTRONOMY_BODIES = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mercury: Astronomy.Body.Mercury,
  Venus: Astronomy.Body.Venus,
  Mars: Astronomy.Body.Mars,
  Jupiter: Astronomy.Body.Jupiter,
  Saturn: Astronomy.Body.Saturn,
  Uranus: Astronomy.Body.Uranus,
  Neptune: Astronomy.Body.Neptune,
  Pluto: Astronomy.Body.Pluto,
};
const IAU_ZODIAC_SIGNS = {
  Ari: 'Aries',
  Tau: 'Taurus',
  Gem: 'Gemini',
  Cnc: 'Cancer',
  Leo: 'Leo',
  Vir: 'Virgo',
  Lib: 'Libra',
  Sco: 'Scorpio',
  Oph: 'Ophiuchus',
  Sgr: 'Sagittarius',
  Cap: 'Capricorn',
  Aqr: 'Aquarius',
  Psc: 'Pisces',
};

export function normalizeDegrees(value) {
  return ((value % 360) + 360) % 360;
}

export function angularDistance(a, b) {
  const diff = Math.abs(normalizeDegrees(a) - normalizeDegrees(b));
  return diff > 180 ? 360 - diff : diff;
}

export function trueSkySign(longitude) {
  const lon = normalizeDegrees(longitude);
  let sign = boundaries[boundaries.length - 1].sign;
  for (const boundary of boundaries) {
    if (lon >= boundary.startDeg) sign = boundary.sign;
    else break;
  }
  return sign;
}

export function signDegree(longitude) {
  const lon = normalizeDegrees(longitude);
  const sign = trueSkySign(lon);
  const current = boundaries.find((b) => b.sign === sign);
  return normalizeDegrees(lon - current.startDeg);
}

export function formatZodiacPosition(longitude) {
  const degree = signDegree(longitude);
  return `${Math.floor(degree)}° ${trueSkySign(longitude)}`;
}

function round(value, places = 6) {
  return Number(value.toFixed(places));
}

function observationFromBirth({ date, time, timeZone, place, timeKnown = true }) {
  const [hour = 12, minute = 0] = timeKnown && time ? time.split(':').map(Number) : [12, 0];
  const utcDate = zonedTimeToUtc({ date, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, timeZone });
  return {
    date: utcDate,
    observer: new Astronomy.Observer(place.lat, place.lon, place.alt ?? 0),
    place,
  };
}

export function actualSkyPosition(bodyName, observation) {
  const body = ASTRONOMY_BODIES[bodyName];
  if (!body || !observation?.date || !observation?.observer) return null;

  const equatorial = Astronomy.Equator(body, observation.date, observation.observer, false, true);
  const ecliptic = Astronomy.Ecliptic(equatorial.vec);
  const constellation = Astronomy.Constellation(equatorial.ra, equatorial.dec);
  const sign = IAU_ZODIAC_SIGNS[constellation.symbol] ?? null;

  return {
    method: 'actual-sky-topocentric-iau',
    origin: 'observer',
    constellation: constellation.name,
    constellationSymbol: constellation.symbol,
    sign,
    rightAscension: round(equatorial.ra),
    declination: round(equatorial.dec),
    longitude: round(normalizeDegrees(ecliptic.elon)),
    latitude: round(ecliptic.elat),
    distanceAu: round(equatorial.dist, 9),
    distanceKm: Math.round(equatorial.dist * AU_KM),
  };
}

function toCelestineBirth({ date, time, timeZone, place, timeKnown = true }) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour = 12, minute = 0] = timeKnown && time ? time.split(':').map(Number) : [12, 0];
  const utcDate = zonedTimeToUtc({ date, time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`, timeZone });
  return {
    year,
    month,
    day,
    hour,
    minute,
    second: 0,
    timezone: getOffsetHours(timeZone, utcDate),
    latitude: place.lat,
    longitude: place.lon,
  };
}

function safeCalculateChart(input) {
  return calculateChart(input, {
    houseSystem: 'placidus',
    includeAsteroids: false,
    includeChiron: true,
    includeLilith: false,
    includeLots: false,
    includeNodes: 'true',
    includePatterns: true,
  });
}

function positionReceipt({ method, longitude, latitude = null }) {
  return {
    method,
    longitude: round(normalizeDegrees(longitude)),
    latitude: latitude == null ? null : round(latitude),
  };
}

function mapPlanet(planet, houseAllowed = true, observation = null) {
  const skyPosition = actualSkyPosition(planet.name, observation);
  const longitude = skyPosition?.longitude ?? normalizeDegrees(planet.longitude);
  const latitude = skyPosition?.latitude ?? planet.latitude ?? 0;
  const sign = skyPosition?.sign ?? trueSkySign(longitude);
  return {
    body: planet.name,
    sign,
    longitude,
    latitude,
    degree: Number(signDegree(longitude).toFixed(2)),
    house: houseAllowed ? planet.house ?? null : null,
    retrograde: Boolean(planet.isRetrograde),
    speed: planet.longitudeSpeed ?? null,
    sym: BODY_SYMBOLS[planet.name] ?? '•',
    constellation: skyPosition?.constellation ?? sign,
    signMethod: skyPosition?.sign ? 'actual-sky-topocentric-iau' : 'ecliptic-boundary-fallback',
    position: skyPosition ?? positionReceipt({
      method: 'ecliptic-boundary-fallback',
      longitude,
      latitude,
    }),
  };
}

function mapNode(node, houseAllowed = true) {
  const longitude = normalizeDegrees(node.longitude);
  return {
    body: node.name,
    sign: trueSkySign(longitude),
    longitude,
    degree: Number(signDegree(longitude).toFixed(2)),
    house: houseAllowed ? node.house ?? null : null,
    retrograde: true,
    speed: null,
    sym: BODY_SYMBOLS[node.name] ?? '•',
    constellation: null,
    signMethod: 'ecliptic-point-boundary',
    position: positionReceipt({
      method: 'ecliptic-point-boundary',
      longitude,
    }),
  };
}

function mapAngle(name, angle) {
  const longitude = normalizeDegrees(angle.longitude);
  return {
    angle: name,
    sign: trueSkySign(longitude),
    longitude,
    degree: Number(signDegree(longitude).toFixed(2)),
    signMethod: 'ecliptic-horizon-point-boundary',
  };
}

export function computeNatal(user) {
  const birth = user.birth;
  const birthTimeKnown = birth.timeKnown !== false;
  const observation = observationFromBirth(birth);
  const chart = safeCalculateChart(toCelestineBirth(birth));
  const planets = chart.planets.filter((planet) => NATAL_PLANETS.includes(planet.name));
  const nodes = chart.nodes.filter((node) => node.type === 'True');
  const bodies = [...planets.map((p) => mapPlanet(p, birthTimeKnown, observation)), ...nodes.map((n) => mapNode(n, birthTimeKnown))];
  const ascSign = birthTimeKnown ? trueSkySign(chart.angles.ascendant.longitude) : null;
  const chartRuler = ascSign ? TRADITIONAL_RULERS[ascSign] : null;
  for (const body of bodies) {
    body.chartRuler = body.body === chartRuler;
  }

  return {
    user: {
      name: user.displayName || user.name || 'You',
      birth: {
        date: birth.date,
        time: birth.time,
        timeZone: birth.timeZone,
        timeKnown: birthTimeKnown,
        place: birth.place,
      },
    },
    bodies,
    angles: birthTimeKnown ? [
      mapAngle('Ascendant', chart.angles.ascendant),
      mapAngle('Descendant', chart.angles.descendant),
      mapAngle('Midheaven', chart.angles.midheaven),
      mapAngle('IC', chart.angles.imumCoeli),
    ] : [],
    houses: birthTimeKnown ? chart.houses.cusps.map((cusp) => ({
      house: cusp.house,
      sign: trueSkySign(cusp.longitude),
      longitude: normalizeDegrees(cusp.longitude),
      degree: Number(signDegree(cusp.longitude).toFixed(2)),
      signMethod: 'ecliptic-house-cusp-boundary',
    })) : [],
    birthTimeKnown,
    chartRuler,
    framework: FRAMEWORK,
    houseSystem: birthTimeKnown ? HOUSE_SYSTEM : null,
    nodeType: NODE_TYPE,
  };
}

function phaseName(phase) {
  const p = normalizeDegrees(phase);
  if (p < 8 || p >= 352) return 'New Moon';
  if (p < 82) return 'Waxing Crescent';
  if (p < 98) return 'First Quarter';
  if (p < 172) return 'Waxing Gibbous';
  if (p < 188) return 'Full Moon';
  if (p < 262) return 'Waning Gibbous';
  if (p < 278) return 'Last Quarter';
  return 'Waning Crescent';
}

function formatInZone(date, timeZone, options) {
  return new Intl.DateTimeFormat('en-AU', { timeZone, ...options }).format(date);
}

function moonQuarterDates(timestamp, timeZone) {
  let quarter = Astronomy.SearchMoonQuarter(new Date(new Date(timestamp).getTime() - 20 * 86400000));
  const found = [];
  for (let i = 0; i < 12; i += 1) {
    found.push(quarter);
    quarter = Astronomy.NextMoonQuarter(quarter);
  }
  const current = new Date(timestamp).getTime();
  const previous = [...found].reverse().find((q) => q.time.date.getTime() <= current);
  const next = found.find((q) => q.time.date.getTime() > current);
  const nextNew = found.find((q) => q.quarter === 0 && q.time.date.getTime() > current);
  const labels = ['New Moon', 'First Quarter', 'Full Moon', 'Last Quarter'];
  return {
    previous: previous ? `${labels[previous.quarter]} ${formatInZone(previous.time.date, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : null,
    next: next ? `${labels[next.quarter]} ${formatInZone(next.time.date, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}` : null,
    nextNewMoon: nextNew ? formatInZone(nextNew.time.date, timeZone, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : null,
  };
}

function riseSet(body, observer, timestamp, timeZone) {
  const date = new Date(timestamp);
  const parts = getZonedParts(date, timeZone);
  const midnight = zonedTimeToUtc({ date: `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`, time: '00:00', timeZone });
  const rise = Astronomy.SearchRiseSet(body, observer, +1, midnight, 2);
  const set = Astronomy.SearchRiseSet(body, observer, -1, midnight, 2);
  const fmt = { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' };
  return {
    rise: rise ? formatInZone(rise.date, timeZone, fmt) : '—',
    set: set ? formatInZone(set.date, timeZone, fmt) : '—',
  };
}

export function computeSky({ timestamp = new Date().toISOString(), place, timeZone }) {
  const date = new Date(timestamp);
  const observation = {
    date,
    observer: new Astronomy.Observer(place.lat, place.lon, place.alt ?? 0),
    place,
  };
  const parts = getZonedParts(date, timeZone);
  const localInput = {
    date: `${parts.year}-${String(parts.month).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`,
    time: `${String(parts.hour).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`,
    timeZone,
    timeKnown: true,
    place,
  };
  const chart = safeCalculateChart(toCelestineBirth(localInput));
  const bodies = [
    ...chart.planets.filter((planet) => SKY_PLANETS.includes(planet.name)).map((p) => mapPlanet(p, false, observation)),
    ...chart.nodes.filter((node) => node.type === 'True').map((n) => mapNode(n, false)),
  ];
  const bodyByName = Object.fromEntries(bodies.map((body) => [body.body, body]));
  const moonPhase = Astronomy.MoonPhase(date);
  const illumination = Astronomy.Illumination(Astronomy.Body.Moon, date).phase_fraction * 100;
  const observer = new Astronomy.Observer(place.lat, place.lon, 0);
  const moonTimes = riseSet(Astronomy.Body.Moon, observer, timestamp, timeZone);
  const quarterDates = moonQuarterDates(timestamp, timeZone);

  return {
    timestamp: date.toISOString(),
    localDateKey: localInput.date,
    localDate: formatInZone(date, timeZone, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    localTime: formatInZone(date, timeZone, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }),
    place,
    timeZone,
    bodies,
    bodyByName,
    lunar: {
      phase: phaseName(moonPhase),
      illumination: Number(illumination.toFixed(1)),
      age: Number((normalizeDegrees(moonPhase) / 360 * LUNATION_DAYS).toFixed(2)),
      cyclePct: Number((normalizeDegrees(moonPhase) / 360 * 100).toFixed(1)),
      waxing: moonPhase < 180,
      moonSign: bodyByName.Moon?.sign,
      sunSign: bodyByName.Sun?.sign,
      moonrise: moonTimes.rise,
      moonset: moonTimes.set,
      previousQuarter: quarterDates.previous,
      nextQuarter: quarterDates.next,
      nextNewMoon: quarterDates.nextNewMoon,
    },
    framework: FRAMEWORK,
  };
}
