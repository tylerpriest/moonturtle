// Ali Sunflowers — second seed user / voice-calibration exemplar.
// Astronomy regression test must reproduce these placements within tolerance.
// See docs/seed-users.md for verification source and docs/exemplars/ for voice exemplars.

export const ali = {
  user: {
    name: "Ali",
    displayName: "Ali Sunflowers",
    birth: {
      date: "1983-06-23",
      time: "17:58",
      tz: "Australia/Melbourne", // AEST UTC+10 in June 1983; no DST in Vic in winter
      place: {
        name: "Melbourne, Victoria, Australia",
        lat: -37.8136,
        lon: 144.9631,
      },
    },
    now: {
      place: {
        name: "Sydney, NSW, Australia",
        lat: -33.8688,
        lon: 151.2093,
      },
    },
  },

  // Framework: MoonTurtle true-sky sidereal via IAU boundaries, Placidus houses.
  // NOT Lahiri ayanamsa with equal 30° signs.
  expectedPlacements: {
    bodies: [
      { body: "Sun",        sign: "Gemini",      house: 6,  sym: "☉" },
      { body: "Moon",       sign: "Ophiuchus",   house: 11, sym: "☽" },
      { body: "Mercury",    sign: "Taurus",      house: 6,  sym: "☿" },
      { body: "Venus",      sign: "Cancer",      house: 8,  sym: "♀" },
      { body: "Mars",       sign: "Taurus",      house: 6,  sym: "♂" },
      { body: "Jupiter",    sign: "Scorpio",     house: 11, sym: "♃", retrograde: true, chartRuler: true },
      { body: "Saturn",     sign: "Virgo",       house: 10, sym: "♄" },
      { body: "Uranus",     sign: "Scorpio",     house: 11, sym: "♅" },
      { body: "Neptune",    sign: "Sagittarius", house: 12, sym: "♆" },
      { body: "Pluto",      sign: "Virgo",       house: 10, sym: "♇" },
      { body: "North Node", sign: "Taurus",      house: 6,  sym: "☊" },
      { body: "South Node", sign: "Ophiuchus",   house: 12, sym: "☋" },
    ],
    angles: [
      { angle: "Ascendant",  sign: "Sagittarius" },
      { angle: "Descendant", sign: "Gemini"      },
      { angle: "Midheaven",  sign: "Virgo"       },
      { angle: "IC",         sign: "Pisces"      },
    ],
  },

  // Voice exemplars live in docs/exemplars/. Pulled into the prompt cache in
  // src/reading/prompt/05-exemplars.md as the second exemplar block in Phase 2,
  // after the curated 5-section version has been hand-edited from the long-form.
  exemplars: {
    daily: "docs/exemplars/ali-daily-2026-05-09.md",
  },
};
