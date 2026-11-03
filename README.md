# Glider: a Glider 4.0 tribute

An unofficial fan remake of **Glider for Windows** (Glider/WIN 4.01, 1994), the Windows port of John Calhoun's Glider 4.0. Fly a paper plane through all 63 rooms of "The House", riding floor vents from "Welcome..." to the open window in "Goodbye...". It keeps the original look and side panels, zoomed as large as the window allows while staying pixel-crisp.

**Play it:** https://jessedestroys.com/glider/

Arrow keys fly, Space fires rubber bands, Enter burns battery power to zoom forward, F toggles fullscreen, R restarts. The Rooms menu jumps straight to any room.

## What's different

It aims to feel like the original, with some small improvements:

- **Sharper, bigger picture:** the game fills the window at a pixel-perfect zoom, keeping the original side panels and scoreboard.
- **Clearer air:** vent and fan air draws in front of paintings, mirrors and furniture, and fans show their own wind stream.
- **More physical:** fans blast you with real momentum and turn the plane to face the wind, the kettle's steam throws you, rising air slams you into furniture above it, and you can land and slide on spilled grease.
- **Livelier rooms:** mirrors reflect the plane, windows flash with lightning, the shredder actually shreds, the final window is open, and dark rooms still show flames, enemies and switches.
- **Kinder restarts:** a crash restarts you at the top of the room, on the side you last reached.
- **Extras:** a time bonus for each room, a counting score ticker, a new title screen with a how-to-play box, a Rooms menu, and an optional bass pulse.

Some details are best guesses where the original files don't say, like which enemies each room uses and a few sounds.

## Credits

- **Glider** by John Calhoun: programming, art, sounds and concept. Glider 4.0 was published by Casady & Greene, Inc. in 1991; the rights went back to John Calhoun after Casady & Greene closed in 2003.
- **Glider for Windows**: Windows programming by Gregg Bieser, Brass Ring Software. Published by Casady & Greene and Powerhouse Entertainment.
- The graphics, sounds and rooms come from Glider for Windows and belong to their creators. The scoreboard lettering uses Wine's copy of the Windows bitmap fonts.

This tribute isn't affiliated with or endorsed by John Calhoun or Soft Dorothy LLC. Play the real thing: [Glider for Mac](https://apps.apple.com/us/app/glider/id482536700?mt=12), or Glider Classic for iPhone and iPad. Calhoun's own [Glider 4.0 source](https://github.com/softdorothy/Glider4) is under the MIT License.

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
