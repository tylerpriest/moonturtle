import { journalKey, readJson, readingArchiveKey, readingCacheKey, writeJson } from '../io/storage.js';

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

export function getArchivedReading(birthHash, readingId) {
  if (!birthHash || !readingId) return null;
  return readJson(readingArchiveKey(birthHash, readingId));
}

export function setArchivedReading(birthHash, reading) {
  if (!birthHash || !reading?.readingId) return reading;
  return writeJson(readingArchiveKey(birthHash, reading.readingId), {
    ...reading,
    archivedAt: new Date().toISOString(),
  });
}

export function appendJournalEntry(birthHash, entry) {
  const existing = getJournal(birthHash);
  const readingId = entry.readingId ?? `${entry.dateKey}:${Date.now()}`;
  const next = [
    {
      ...entry,
      readingId,
      savedAt: new Date().toISOString(),
    },
    ...existing.filter((item) => (item.readingId ?? item.dateKey) !== readingId),
  ].slice(0, 90);
  return writeJson(journalKey(birthHash), next);
}
