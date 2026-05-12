const PREFIX = 'mt:v1:';
const USER_KEY = `${PREFIX}user`;
const SETTINGS_KEY = `${PREFIX}settings`;

export const DEMO_USER = {
  schemaVersion: 1,
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
  currentPlace: {
    mode: 'manual',
    timeZone: 'Australia/Sydney',
    place: {
      name: 'Manly, Sydney, Australia',
      lat: -33.7969,
      lon: 151.2840,
    },
  },
};

function canStore() {
  return typeof window !== 'undefined' && window.localStorage;
}

export function stableHash(value) {
  const input = typeof value === 'string' ? value : JSON.stringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function withBirthHash(user) {
  return {
    ...user,
    birthHash: stableHash({
      date: user.birth.date,
      time: user.birth.timeKnown === false ? null : user.birth.time,
      timeZone: user.birth.timeZone,
      place: user.birth.place,
    }),
  };
}

export function readJson(key, fallback = null) {
  if (!canStore()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  if (!canStore()) return value;
  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function getUser() {
  const user = readJson(USER_KEY);
  return user ? withBirthHash(user) : null;
}

export function saveUser(user) {
  return writeJson(USER_KEY, withBirthHash({ schemaVersion: 1, ...user }));
}

export function getSettings() {
  return readJson(SETTINGS_KEY, {
    schemaVersion: 1,
    aiMode: 'auto',
    localProviderOrder: ['codex'],
    model: 'gpt-5.5',
    reasoningEffort: 'xhigh',
    readingMode: 'quick-glance',
    apiProvider: 'anthropic',
    apiKey: '',
  });
}

export function saveSettings(settings) {
  return writeJson(SETTINGS_KEY, { schemaVersion: 1, ...settings });
}

export function readingCacheKey(birthHash, date, aiMode = 'auto') {
  return `${PREFIX}reading:${birthHash}:${date}:${aiMode}`;
}

export function readingArchiveKey(birthHash, readingId) {
  return `${PREFIX}reading-archive:${birthHash}:${readingId}`;
}

export function journalKey(birthHash) {
  return `${PREFIX}journal:${birthHash}`;
}

export function clearAllMoonTurtleData() {
  if (!canStore()) return;
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith(PREFIX)) window.localStorage.removeItem(key);
  }
}
