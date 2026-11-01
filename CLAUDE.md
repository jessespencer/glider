# Glider

Retro remake of Glider for Windows. TypeScript and Canvas, no framework, on purpose: this is a game loop, not a React app.

- `public/assets` is gitignored and rebuilt by `npm run import-assets` from the Wine install in `~/Games/Prefixes/GLIDER`. It's copyrighted placeholder art: never commit or publish it. Going public needs new art, new levels and a new name.
- The look stays retro: small frame with the original side panels and scoreboard, whole-number zoom, no big fill-the-screen layout. Motion is deliberately chunky (30 ticks a second, whole-pixel positions).
- The plane always faces right and tilts back to reverse; it never flips.
- A browser tab that's hidden pauses `requestAnimationFrame`, so test rules by stepping `src/sim.ts` directly in Node.
- Room and object layout is in `read_house` in `tools/import_assets.py`. Sprite positions are in `src/render.ts`.
- Notes on running the original game: `~/Games/CLAUDE.md`.
