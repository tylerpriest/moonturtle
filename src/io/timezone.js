import tzlookup from 'tz-lookup';

export function lookupTimeZone(lat, lon) {
  return tzlookup(lat, lon);
}

export function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]));
  return values;
}

export function getOffsetHours(timeZone, date = new Date()) {
  const parts = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second);
  return (asUtc - date.getTime()) / 3600000;
}

export function zonedTimeToUtc({ date, time = '12:00', timeZone }) {
  const [year, month, day] = date.split('-').map(Number);
  const [hour = 12, minute = 0] = time.split(':').map(Number);
  let utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  for (let i = 0; i < 3; i += 1) {
    const offset = getOffsetHours(timeZone, utc);
    utc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0) - offset * 3600000);
  }
  return utc;
}

export function browserTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
