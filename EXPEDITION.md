# Voorbij de stilte — eerste expeditie

Implemented: **De stilte onder het ijs**, an authored Saturn / Enceladus expedition.
The original free-flight cosmos lives at `explore.html`, and the 2D catalogue remains at `atlas.html`.

## Separation of concerns

- `src/expedition-data.js`: curated evidence, source links, semantic stages, bounded local journal serialization.
- `src/expedition-scene.js`: local render coordinates, authored cameras, ring particle illustration and qualitative plume lighting. No claim of real-time ephemerides.
- `src/expedition.js`: accessible HTML controls, optional local storage, export, opt-in synthesized ambience.
- Existing `src/ephemeris.js` and `src/explorer.js`: independent astronomical clock and free navigation, preserved.

All five stages are available immediately. No score, forced finale, fake spectra, life probability, invented biosignature, or paid AI service. No personal journal is sent to a server. Storage is opt-in and has an export fallback.

## Scientific limits

The global Enceladus map is a real Cassini enhanced-color mosaic with baked lighting, not a heightmap or a true-color live image. The plume is an illustrative point model, not a measured 3D reconstruction. The light slider changes an authored illumination direction; it is not a calibrated instrument. Ring fragments have stable seeded but invented positions and dimensions. The local ruler is a model-unit reference only. The Saturn overview uses physical radius ratios for the planet and small Enceladus, but an authored moon phase. HYG directions are a fixed J2000 reference, not the sky of a specific Cassini observation.

The app distinguishes measurement, inference, reconstruction, illustration and thought experiment in text, not solely in colors. Every evidence card includes its limit. Mission photos have separate labels and exact credits in `dist/assets/expedition-credits.json`.

## Experience and fallback

- Orbit by mouse/touch; zoom by scroll/pinch or explicit buttons; fixed-view navigation works without spatial interaction.
- Respect `prefers-reduced-motion` initially; calm mode removes automatic camera interpolation and plume motion without removing content.
- Hide interface for undistracted viewing; exit by visible button or Escape.
- No WebGL: evidence, photography, journal and all text still work.
- Context loss and asset failure have visible recovery messages.
- Audio begins only after a user gesture and is suspended when hidden. Ship/musical layers are synthetic ambient sound, never called real space audio or data sonification.
- Auto mode limits narrow-screen drawing to approximately 30fps; low mode reduces points and disables shadows. These are resource controls, not measured device-performance guarantees.

## Verification boundary

Automated checks cover ephemerides, sprite/label geometry, stage data, source presence, journal bounds/export/deduplication, deterministic illustrative sampling, local page references and exact image hashes. Build validates the ES-module graph. These do not replace real-device GPU, touch, motion-comfort, audio-listening or browser visual testing.

GitHub deployment publishes static app assets atomically. Shared proxy configuration and KiDo are not modified. Public release verification includes the new route/bundle/imagery and neighboring service health.

## Later phases, not implemented by this release

Received-light/time journey, coherent exoplanet alternatives, fictional first-contact scenario, future archive, speculative impossible journeys, WebGPU comparison, deeper physical rendering and named-device performance qualification.
