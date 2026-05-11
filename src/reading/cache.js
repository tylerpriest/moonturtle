import { journalKey, readJson, readingCacheKey, writeJson } from '../io/storage.js';

export function getCachedReading(birthHash, dateKey, aiMode = 'auto') {
  return readJson(readingCacheKey(birthHash, dateKey, aiMode));
}

export function setCachedReading(birthHash, dateKey, reading, aiMode = 'auto') {
  return writeJson(readingCacheKey(birthHash, dateKey, aiMode), {
    ...reading,
    cachedAt: new Date().toISOString(),
  });
}

export function getJournal(birthHash) {
  return readJson(journalKey(birthHash), []);
}

export function appendJournalEntry(birthHash, entry) {
  const existing = getJournal(birthHash);
  const next = [
    {
      ...entry,
      savedAt: new Date().toISOString(),
    },
    ...existing.filter((item) => item.dateKey !== entry.dateKey),
  ].slice(0, 60);
  return writeJson(journalKey(birthHash), next);
}
