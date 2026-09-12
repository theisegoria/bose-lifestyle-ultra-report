# Computational Acoustics: HomePod 2 vs Bose Lifestyle Ultra

A patent-led visual investigation of how Apple HomePod 2 and Bose Lifestyle Ultra create controlled bass, room-aware playback, and spatial scale.

- [Published site](https://theisegoria.github.io/bose-lifestyle-ultra-report/)
- `combined-technical-report.pdf`: both illustrated reports in one volume
- `homepod-vs-bose-report.pdf`: HomePod architecture and comparison report
- `bose-report.pdf`: original Bose Lifestyle Ultra report
- `comparison-explainer.html`: interactive product and placement comparison

This is independent technical analysis. Product and technology names are trademarks of their respective owners.

## Interactive 3D companion

`3d/` adds reference-informed product models, cutaways, exploded inspection, component selection, bass motion and a geometric room-path lab. Direct entries: `3d/?speaker=homepod` and `3d/?speaker=bose`. See `3d/MODEL_SOURCES.md` for the evidence and model boundaries.

Serve the repository with a local HTTP server and open `3d/`; ES modules require HTTP. No build step. Three.js 0.180.0 is vendored with its MIT license. The GitHub Pages route is `/bose-lifestyle-ultra-report/3d/`.
