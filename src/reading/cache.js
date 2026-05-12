import { journalKey, profileReadingCacheKey, readJson, readingArchiveKey, readingCacheKey, writeJson } from '../io/storage.js';

function normalizedText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function isDeterministicJournalEntry(entry = {}) {
  return Boolean(
    entry.isFallback
    || entry.source === 'local-symbolic-engine'
    || entry.engine?.provider === 'local'
    || entry.modelLabel === 'Local deterministic'
    || String(entry.readingId ?? '').includes(':local:'),
  );
}

function journalDuplicateKey(entry = {}) {
  if (!isDeterministicJournalEntry(entry)) return null;
  const contentKey = normalizedText(entry.headline) || entry.contentSignature || normalizedText(entry.sourceLabel);
  return [
    entry.dateKey ?? entry.localDate ?? 'unknown-date',
    entry.readingMode ?? entry.modeLabel ?? 'quick-glance',
    entry.source ?? entry.engine?.provider ?? 'local',
    contentKey,
  ].join('|');
}

function normalizeJournal(journal = []) {
  const entries = Array.isArray(journal) ? journal : [];
  const seen = new Set();
  const deduped = entries.filter((entry) => {
    const duplicateKey = journalDuplicateKey(entry);
    if (!duplicateKey) return true;
    if (seen.has(duplicateKey)) return false;
    seen.add(duplicateKey);
    return true;
  });
  const preferredDates = new Set();
  return deduped.map((entry) => {
    if (!entry.preferred) return entry;
    const key = entry.dateKey ?? entry.localDate ?? 'unknown-date';
    if (preferredDates.has(key)) return { ...entry, preferred: false };
    preferredDates.add(key);
    return entry;
  });
}

export function getCachedReading(birthHash, dateKey, aiMode = 'auto') {
  return readJson(readingCacheKey(birthHash, dateKey, aiMode));
}

export function setCachedReading(birthHash, dateKey, reading, aiMode = 'auto') {
  return writeJson(readingCacheKey(birthHash, dateKey, aiMode), {
    ...reading,
    cachedAt: new Date().toISOString(),
  });
}

export function getCachedProfileReading(birthHash, promptVersion, aiMode = 'auto') {
  return readJson(profileReadingCacheKey(birthHash, promptVersion, aiMode));
}

export function setCachedProfileReading(birthHash, promptVersion, profile, aiMode = 'auto') {
  return writeJson(profileReadingCacheKey(birthHash, promptVersion, aiMode), {
    ...profile,
    cachedAt: new Date().toISOString(),
  });
}

export function getJournal(birthHash) {
  const stored = readJson(journalKey(birthHash), []);
  const normalized = normalizeJournal(stored);
  if (!Array.isArray(stored) || normalized.length !== stored.length) {
    writeJson(journalKey(birthHash), normalized);
  }
  return normalized;
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
  const duplicateKey = journalDuplicateKey({ ...entry, readingId });
  const savedEntry = {
    ...entry,
    readingId,
    savedAt: new Date().toISOString(),
  };
  const next = [
    savedEntry,
    ...existing.filter((item) => {
      if ((item.readingId ?? item.dateKey) === readingId) return false;
      return !duplicateKey || journalDuplicateKey(item) !== duplicateKey;
    }).map((item) => (
      savedEntry.preferred && item.dateKey === savedEntry.dateKey
        ? { ...item, preferred: false }
        : item
    )),
  ].slice(0, 90);
  return writeJson(journalKey(birthHash), next);
}
