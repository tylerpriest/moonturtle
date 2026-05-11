export async function searchPlaces(query, { signal } = {}) {
  const q = query.trim();
  if (q.length < 3) return [];
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error('Place search failed');
  const results = await response.json();
  return results.map((item) => ({
    id: item.place_id,
    name: item.display_name,
    lat: Number(item.lat),
    lon: Number(item.lon),
  })).filter((place) => Number.isFinite(place.lat) && Number.isFinite(place.lon));
}

export async function reversePlaceName(lat, lon) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  try {
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Reverse geocoding failed');
    const result = await response.json();
    return result.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  } catch {
    return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
  }
}
