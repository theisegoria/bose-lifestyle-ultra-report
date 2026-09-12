# Verification record

Checked locally on 12 September 2026. This records observed behavior, not a deployment or a physical-device performance benchmark.

- Opened and visually inspected both speakers in the Codex in-app browser at 1280 × 720 and 390 × 844. Checked material variants, cutaways, component selection, camera presets, zoom, keyboard rotation, reset, playback, cycle scrubbing and exploded-view endpoints. Adjusted maximum explosion framing for the narrow layout. No horizontal overflow was observed.
- Exercised room placement and ceiling endpoints. Checked 18 product/placement/height combinations numerically for path lengths, delay, equal incidence/reflection angles and shelf intersection. At a 2.7 m ceiling, the open Bose example adds 1.77949256 m, or 5.18802497 ms, displayed as 1.78 m and 5.2 ms.
- Repeated speaker changes returned the HomePod exterior to 9 geometries, 3 textures and 16,646 rendered triangles. Its frame counter remained unchanged while idle. Sustained playback and scrubbing produced no observed application errors. These are bounded local observations, not an FPS claim.
- Checked the JavaScript reduced-motion branch with a temporary matchMedia fixture: camera preset changes completed without tweening, playback remained paused and the frame count stayed at 4 while idle. This does not substitute for physical-device or operating-system accessibility testing.
- Checked a temporary no-WebGL fixture: explanatory chapters, component text and room calculations remained available; unavailable graphics controls were disabled. Both fixtures were removed afterwards.
- Final normal-page console had no captured warnings or errors. JavaScript syntax checks and git whitespace checks passed; new local page and module references resolved. Existing report downloads and the original 2D explainer were preserved.

Remaining limits: no physical iOS/Android GPU test, no photogrammetric or manufacturer-CAD comparison, and no validation against measured sound fields. See MODEL_SOURCES.md for reconstruction assumptions and source provenance.
