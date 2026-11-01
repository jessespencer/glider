# Glider

Retro remake of Glider for Windows. TypeScript and Canvas, no framework, on purpose: this is a game loop, not a React app.

- `public/assets` is gitignored and rebuilt by `npm run import-assets` from the Wine install in `~/Games/Prefixes/GLIDER`. It's copyrighted placeholder art: never commit or publish it. Going public needs new art, new levels and a new name.
- The look stays retro: the original side panels and scoreboard stay in the frame, which fills the window's width at a zoom of whole device pixels (half steps on Retina), never cropped or stretched. Motion is deliberately chunky (30 ticks a second, whole-pixel positions).
- The plane always faces right and tilts back to reverse; it never flips.
- A browser tab that's hidden pauses `requestAnimationFrame`, so test rules by stepping `src/sim.ts` directly in Node.
- Room and object layout is in `read_house` in `tools/import_assets.py`. Sprite positions are in `src/render.ts`.
- The original files don't name their sounds or enemies. The comment on `SOUND_FOR_EVENT` in `src/sound.ts` says which sounds are confirmed; the `ENEMY_*` kinds in `src/sim.ts` are still guesses.
- Notes on running the original game: `~/Games/CLAUDE.md`.
