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

## Geometry and animation

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
