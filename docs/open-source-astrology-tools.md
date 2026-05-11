# Open-source astrology and astronomy tools

Survey date: 11 May 2026. Re-check before adding a dependency; this space is active, licensing varies, and a small package can look better than it is until it meets the seed-user tests.

## Current recommendation

Use `astronomy-engine` as the v1 sky engine, keep MoonTurtle's true-sky zodiac boundary table custom, and evaluate `celestine` for houses/aspects/transits before falling back to `circular-natal-horoscope-js`.

Why this mix:

- MoonTurtle needs real astronomy first: Moon phase, illumination, rise/set, current sky, ecliptic positions, and IAU constellation lookup.
- MoonTurtle also needs astrology-shaped math: Placidus houses, angles, aspects, retrogrades, transits, and a deterministic loudness ranking.
- No package found during this survey provides MoonTurtle's exact true-sky zodiac convention. The IAU boundary projection remains our owned layer.

## Recommended stack

### `astronomy-engine`

Source: https://github.com/cosinekitty/astronomy

Role: primary astronomical engine.

Use for:

- Sun, Moon, planet, and Pluto positions
- Moon phases, lunar events, rise/set, local sky visibility
- coordinate transforms
- IAU constellation lookup via `Constellation`

Why: MIT, JavaScript/browser support, no external dependencies, compact enough for PWA use, and validated against NOVAS / JPL Horizons. It directly supports the IAU constellation step MoonTurtle needs.

Risk: it is astronomy-first, not astrology-first. Houses, aspects, and interpretive chart conveniences must be built or supplied separately.

### MoonTurtle IAU boundary table

Source: `src/domain/zodiac-boundaries.md`

Role: true-sky sign assignment.

Use for:

- mapping ecliptic longitudes to 13 visible zodiac constellations
- documenting MoonTurtle's first-crossing convention
- keeping the zodiac reproducible and non-proprietary

Why: the master prompt asks for true-sky visible constellations, not copied MTZ data. A build-time table from open IAU boundaries is explicit and testable.

Risk: first-crossing is a convention. If practitioners strongly prefer a different convention, swap the boundary builder and rebuild the table.

### `celestine`

Source: https://github.com/Anonyfox/celestine

Role: candidate astrology math layer.

Use for, after verification:

- Placidus and other house cusps
- aspects, applying/separating state, transits, retrogrades
- deterministic signal ranking inputs

Why it is a better option than the original house-library plan: MIT, TypeScript, zero runtime dependencies, active as of early 2026, and built around reusable modules instead of a monolithic chart object.

Hard boundary: do not use its tropical zodiac labels as MoonTurtle sign truth. Feed its longitudes/cusps into our own IAU sign lookup.

Risk: young package. Require seed-user regression and a cross-check against a known chart engine before adopting.

## Fallbacks and precision options

### `circular-natal-horoscope-js`

Source: https://github.com/0xStarcat/CircularNatalHoroscopeJS

Role: fallback astrology chart library.

Pros: mature enough to have meaningful community signal, Unlicense, supports Placidus/Koch/Topocentric/Regiomontanus/Campanus/Whole Sign/Equal, angles, planets, nodes, retrograde flags, and aspects.

Cons: older npm release, bundles Moment/Moment Timezone, and its sidereal mode is not MoonTurtle's true-sky convention.

### `@fusionstrings/swiss-eph`

Source: https://github.com/fusionstrings/swiss-eph

Role: precision fallback or server/Worker experiment.

Pros: Swiss Ephemeris compiled to WASM, works in Cloudflare Workers, Node, Deno, Bun, and browsers.

Cons: AGPL-3.0, heavier operational story, and not necessary for v1 if `astronomy-engine` passes the seed-user and current-sky tests.

### `astro-sweph`

Source: https://github.com/astroahava/astro-sweph

Role: browser Swiss Ephemeris fallback.

Pros: single-file embedded WebAssembly build with Swiss Ephemeris data and comprehensive house support.

Cons: AGPL-3.0, very small project footprint as of this survey, and larger bundle than the current v1 target.

### `Kerykeion`

Source: https://github.com/g-battaglia/kerykeion

Role: Python/service inspiration, not the PWA default.

Pros: mature astrology feature surface, SVG charts, aspects, transits, fixed stars, moon phase details, AI-ready context.

Cons: Python and AGPL-3.0. Useful as a reference or external service pattern, but not a direct fit for a browser-first local-data app.

### `VedAstro` and `Vedaksha`

Sources:

- https://github.com/VedAstro/VedAstro
- https://github.com/arthiqlabs/vedaksha

Role: Vedic / MCP inspiration.

Pros: both are relevant to future multi-system profile work and AI tool integration.

Cons: neither should define MoonTurtle's true-sky daily reading. VedAstro is Vedic/Raman/Swiss-Ephemeris oriented. Vedaksha is technically interesting but has a BSL/commercial license path and very small GitHub footprint as of this survey.

## Adoption rule

Before adding any math library:

1. Confirm license and browser/Cloudflare compatibility.
2. Run Tyler and Ali seed-user regressions.
3. Cross-check current Moon phase, illumination, moonrise/moonset against a public sky source.
4. Confirm the library's zodiac labels are never used as MoonTurtle true-sky signs unless they come from our IAU table.
5. Document the choice in this file and `docs/plan.md`.
