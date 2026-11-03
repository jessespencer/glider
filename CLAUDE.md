# Glider

Retro remake of Glider for Windows. TypeScript and Canvas, no framework, on purpose: this is a game loop, not a React app.

- This is a public, credited tribute to Glider for Windows (Glider 4.0). `public/assets` holds the original game's art, sounds and rooms: it's gitignored, rebuilt by `npm run import-assets` from the Wine install in `~/Games/Prefixes/GLIDER`, and only ever published in the built `gh-pages` branch by `npm run deploy`. Never commit it to `main`. Keep the credits in `src/about.ts` and the README; replacing the art and name is the long-term plan.
- The look stays retro: the original side panels and scoreboard stay in the frame, which fills the window's width at a zoom of whole device pixels (half steps on Retina), never cropped or stretched. Motion is deliberately chunky (30 ticks a second, whole-pixel positions).
- The plane faces right and tilts back to reverse; steering never flips it. Only a fan's wind rotates it to face the other way, and it turns back once the wind's push is spent.
- A browser tab that's hidden pauses `requestAnimationFrame`, so test rules by stepping `src/sim.ts` directly in Node.
- Room and object layout is in `read_house` in `tools/import_assets.py`. Sprite positions are in `src/render.ts`.
- The original files don't name their sounds or enemies. The comment on `SOUND_FOR_EVENT` in `src/sound.ts` says which sounds are confirmed; the `ENEMY_*` kinds in `src/sim.ts` are still guesses.
- Commits carry no Co-Authored-By trailer for Claude: the owner doesn't want Claude listed as a contributor.
- Notes on running the original game: `~/Games/CLAUDE.md`.
