# Glider: a Glider 4.0 tribute

An unofficial fan remake of **Glider for Windows** (Glider/WIN 4.01, 1994), the Windows port of John Calhoun's Glider 4.0. Fly a paper plane through all 63 rooms of "The House", riding floor vents from "Welcome..." to the open window in "Goodbye...". It keeps the original look and side panels, zoomed as large as the window allows while staying pixel-crisp.

**Play it:** https://jessedestroys.com/glider/

Arrow keys fly, Space fires rubber bands, Enter burns battery power to zoom forward, F toggles fullscreen, R restarts. The Rooms menu jumps straight to any room.

## Credits

- **Glider** by John Calhoun: programming, art, sounds and concept. Glider 4.0 was published by Casady & Greene, Inc. in 1991; the rights went back to John Calhoun after Casady & Greene closed in 2003.
- **Glider for Windows**: Windows programming by Gregg Bieser, Brass Ring Software. Published by Casady & Greene and Powerhouse Entertainment.
- The graphics, sounds and rooms come from Glider for Windows and belong to their creators. The scoreboard lettering uses Wine's copy of the Windows bitmap fonts.

This tribute isn't affiliated with or endorsed by John Calhoun or Soft Dorothy LLC. Play the real thing: [Glider for Mac](https://apps.apple.com/us/app/glider/id482536700?mt=12), or Glider Classic for iPhone and iPad.

Built by [Jesse Destroys](https://jessedestroys.com/).

## Run it locally

```bash
npm install
npm run import-assets
npm run dev -- --port 5273
```

Open http://localhost:5273. Add `?room=12` to start in a room, or open `?sounds` to audition the original sounds.

`import-assets` reads a local Glider for Windows install in `~/Games/Prefixes/GLIDER` and writes `public/assets`. Those files aren't kept in this branch.

## Deploy

```bash
npm run deploy
```

Builds the game, assets included, and publishes it to the `gh-pages` branch, which GitHub Pages serves.
