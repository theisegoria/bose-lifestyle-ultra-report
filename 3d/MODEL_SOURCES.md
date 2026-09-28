# Speaker model references and limits

Research and reconstruction date: 12 September 2026.

The public site was fetched and compared with the local project before work. The base was `deab74b1e0f460a77bef6d2d5c10ef5e2920032c` in `theisegoria/bose-lifestyle-ultra-report`. Its reports and 2D explainer remain available. This folder adds a static Three.js companion without changing the site's build system.

## Reference register

| Reference | Observed / used | Reconstruction limit |
| --- | --- | --- |
| [Apple specifications](https://www.apple.com/homepod-2nd-generation/specs/) | HomePod envelope: 168 mm tall, 142 mm wide; nominal 4-inch woofer, five tweeters, internal bass-calibration microphone | Nominal driver size does not specify basket diameter. Exact mesh and diaphragm dimensions are not supplied. |
| [Apple official HomePod cutaway](https://www.apple.com/newsroom/images/product/homepod/lifestyle/Apple-HomePod-internals-230118_inline.jpg.large_2x.jpg) | Visually inspected: upper control assembly, woofer and substantial motor, lower electronics, tilted lower driver backs | A presentation rendering, not CAD or a measured section. Finer geometry and microphone marker position are approximate. |
| [Apple introduction](https://www.apple.com/newsroom/2023/01/apple-introduces-the-new-homepod-with-breakthrough-sound-and-intelligence/) | Room sensing, direct/ambient rendering and bass correction | Does not establish the proprietary filter topology, coefficients or a radiation pattern. |
| [iFixit HomePod 2 teardown](https://www.ifixit.com/News/71957/the-homepod-2-teardown-small-changes-make-a-big-difference) and [chip identification](https://www.ifixit.com/Guide/HomePod+2+Chip+ID/157778) | Production teardown corroborates stacked boards, woofer and amplifier heat-management structure | Approximate electronics region only. The displayed components are not a reproduction of the PCB layout. |
| [Apple patent US12192698B2](https://patents.google.com/patent/US12192698B2/en) | Related disclosure: tilted transducers and curved horn exits near the supporting surface | Related engineering evidence, not confirmation of a particular HomePod production angle or horn profile. No specific patent angle is asserted as a product measurement. |
| [Bose product page](https://www.bose.com/p/sale/bose-lifestyle-ultra-speaker/LSULT-SPEAKERWIRELESS.html) | Photographs, product configuration and placement guidance | Standalone use is distinguished from soundbar surround use. |
| [Bose three-quarter photograph](https://assets.bosecreative.com/transform/c0045c82-cc87-425d-9f37-9fc6cc9a193d/LSUS-NueBlack_ThreeQuarter_Left?format=png) | Visually inspected: front fabric, capsule cross-section, top and base transitions | Curves were fitted by eye, not photogrammetry. |
| [Bose front photograph](https://assets.bosecreative.com/transform/7d7db98d-1bc2-439a-b8f5-1fa5b2b51335/LSUS-NueBlack_SF_PDP_E-Comm_Gallery_3_1500x1120?format=png) | Visually inspected: grille height, rounded lower plinth, badge placement | Badge is a typographic approximation. |
| [Bose top photograph](https://assets.bosecreative.com/transform/3b20b927-c715-4da4-9a92-403906ae37ca/LSUS-NueBlack_SF_PDP_E-Comm_Gallery_4_1500x1120?format=png) | Visually inspected: racetrack-like outline, front circular perforated grille and rear control recess | Hole pitch and symbols are illustrative; instanced holes bound rendering cost. |
| [Bose rear photograph](https://assets.bosecreative.com/transform/ab22a38a-3a97-4e6a-ba49-b0870727b400/LSUS-NueBlack_SF_PDP_E-Comm_Gallery_5_1500x1120?format=png) | Visually inspected: fabric termination, rectangular port, lower auxiliary and power connectors | Opening sizes were proportioned from the photograph. No functional connector model. |
| [Bose official cutaway](https://assets.bosecreative.com/transform/d15df9bf-27f2-4b2e-bf1a-ab26528072c1/LSUS-NueBlack_SF_PDP_Desktop_Carousel-Image1_2720x1420?format=png) | Visually inspected: woofer under front tweeter; separate upward driver; tall curved duct at rear | Duct centreline follows the image approximately. Cross-section, volume, port tuning and internal bracing remain unknown. |
| [Bose technical introduction](https://www.bose.com/pressroom/bose-lifestyle-collection) | Driver count and broad CleanBass / TrueSpatial roles | No invented phase relationship, crossover, excursion limit or amplifier power. |
| [SoundGuys firsthand review](https://www.soundguys.com/bose-lifestyle-ultra-speaker-review-better-than-sonos-157251/) | Approximate Bose envelope, reported as 184 × 121 × 167 mm | Treated as reported dimensions rather than manufacturer metrology. |
| [Bose FCC exhibit listing](https://fccid.io/A94443508/Test-Report/Test-Report-1-9301897) | Internal-photo metadata lists availability as 11 November 2026 for model 443508 / A94443508 | The internal-photo file was not available or inspected. The public marketing cutaway is used instead. |

## Rebuilt in 3D, 28 September 2026

The stylised primitive models were replaced by two generic speakers built parametrically in Blender (`3d/blender/build_homepod.py`, `3d/blender/build_bose.py`, helpers in `bl_helpers.py` and `speaker_common.py`) and exported as glTF (`3d/assets/*.glb`, with a `-meta.json` beside each listing every part, its component group and its explode vector). The cabinets keep the published envelopes; everything inside is a first-principles reconstruction of how a speaker of this kind is built (cone, surround, spider, voice coil on its former, top plate, ring magnet, back plate and pole piece; horn passages; a rectangular port duct; generic boards). It is not either manufacturer's design, and no interior dimension is a measurement. The Bose model now carries a generic amplifier board, so that the cabinet does not read as empty; it is not a claim about the real layout.

The companion runs on the site's lab kit (`/assets/lab-kit/lab-kit.js`, three.js r186, WebGPU with WebGL 2 fallback). The Japanese page in the main repository loads this repository's `app.js`; the copy is chosen from `<html lang>`.

## Calibration pass, 28 September 2026

Both interiors were then proportioned against the official renderings at the published scale. HomePod (Apple newsroom cutaway, 1306 px for 168 mm, 5.83 px/mm): near-cylindrical shell 61 / 68.5 / 63.5 mm radius foot / mid / top with ~12 mm rounds; 15 mm top cap with a 94 mm touch surface; woofer surround 108 mm, flange 117 mm at 146 mm, shallow cone with a ~50 mm domed dust cap, cast basket tapering from r 57 to r 47 at 104 mm, motor 93 mm across from 70 to 104 mm; bass microphone on a bent tube from the basket wall on the left; board ring at the deck around 65 mm; tweeter mouths (24 mm perforated discs) 29 mm from the axis and 27 mm above the table, with the tweeters inboard and higher; tweeter diaphragm plane 40 degrees from horizontal and the mouth's lower edge about 10 mm off the surface, inside the ranges of US12192698B2 (37.5 to 42.5 degrees; 8 to 13 mm). Bose (headphonecheck: 184.7 x 121.1 x 167.5 mm H x W x D; front, top and rear photographs at 4.19 px/mm; marketing cutaway): egg footprint, 19 mm plinth, 69 mm grille 41 mm behind the front edge, 49 mm control disc 41 mm ahead of the rear edge, rear port 63 x 21 mm centred 56 mm up; forward woofer ~85 mm frame at 72 mm, slightly left; 24 mm tweeter upper left at 141 mm; up-firing driver under the grille; duct rising up the rear wall from the port and hooking over at the top. The dimensions earlier reported by SoundGuys (184 x 121 x 167) were the same numbers in a different order.

## Computed acoustics

`3d/acoustics.js` is pure and tested in Node (`node 3d/acoustics.test.mjs`, 36 checks). It provides monopole sums, delay-and-sum tweeter-ring beamforming, Allen and Berkley image sources (first and second order), an echogram, a fourth-order Linkwitz-Riley crossover and a two-way response map. The Field chapter renders `fieldOnPlane` (sound pressure level relative to the 99.5th percentile on the plane, 40 dB range) or `waveOnPlane` (instantaneous pressure) as a texture; the Room chapter draws the image-source paths and the echogram at the listener. Directivity is a simple cardioid weighting; diffraction, absorption spectra, room modes and manufacturer processing are outside the model.

## Geometry and animation (superseded notes kept for the record)

- The product scene uses decimetres: 1 scene unit = 100 mm. The room scene uses metres and scales the product by 0.1. Exterior dimensions are represented approximately; small lips and manufacturing tolerances are not measurement tools.
- HomePod's lower drivers are deliberately distinct from Bose's forward drivers. Their circular backs face outward/upward while simplified horn paths turn toward the base. The visual fit is supported by the official image, with related patent context; exact production angles are not claimed.
- The HomePod internal microphone is a functional marker with an explicitly unverified position. Bose electronics are omitted rather than given an invented PCB layout.
- Opening the cabinet removes the front shell for inspection. Separating components is a nonphysical presentation state.
- Bass motion is one periodic, deterministic, exaggerated diaphragm cycle. The motor stays fixed. The phase slider is the source of truth for playback and scrubbing. No audio is played.
- No animated port airflow is asserted: its actual phase relative to the diaphragm is frequency dependent and cannot be derived from public material here.

## Room model

The room is 3.6 m wide, with a floor, a rear wall, a left wall, a ceiling outline and a fixed listener. Ceiling height is 2.2–3.8 m. The source and listener positions are schematic points close to their corresponding objects. The speaker rests on a table 0.8 m high.

For a ceiling reflection, mirror the listener vertically across the ceiling, intersect the line from source to mirrored listener with the ceiling, and use that point as the bounce. The HomePod ambient example instead reflects across the left wall. These constructions satisfy equal incidence and reflection angles for the ideal plane.

`extra distance = reflected path length − direct path length`

`extra delay in ms = 1000 × extra distance / 343`

A shelf truncates the Bose ceiling ray at its underside. The readout becomes “Blocked”; it does not claim the entire sound field vanishes. Room modes, diffraction, absorptive materials, head-related filtering, polar response, near-field behaviour, DSP and psychoacoustic perception are outside this model. Moving markers show progression along each path over the same display cycle, not physical wavefront travel at 343 m/s. The delay readout is the actual geometric calculation.

## Assets and portability

All model geometry, weave, interface symbols and shadows are generated in code. Reference photographs are linked to their original Apple and Bose hosts and remain the owners' media; no third-party 3D asset or photo is redistributed.

Three.js 0.180.0, OrbitControls and RoomEnvironment are vendored from the official npm `three` package. Their MIT license is in `vendor/THREE-LICENSE.txt`. No build step or external rendering CDN is needed. The companion uses the existing site's shared navigation stylesheet and script over HTTPS.

The renderer uses bounded pixel ratio (maximum 1.75), instanced grille holes, demand rendering, visibility suspension and disposal of replaced models and room geometry. These are implementation controls, not a claim of measured performance on all devices.
