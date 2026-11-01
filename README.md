# Glider

A private remake prototype of Glider for Windows: fly a paper plane through a house on floor vents. It keeps the original look in a small framed window at a whole-number zoom, and plays all 63 rooms of the original house, from "Welcome..." to the window in "Goodbye...".

## Run

```bash
npm install
npm run import-assets
npm run dev -- --port 5273
```

Open http://localhost:5273. Arrow keys fly, Space fires rubber bands, Enter uses battery power for a boost, F toggles fullscreen, R restarts.

Add `?room=12` to start in a room, or open `?sounds` to audition the original sounds.

`import-assets` reads the local Glider install in `~/Games/Prefixes/GLIDER` and writes `public/assets`. Those graphics and rooms are copyrighted placeholders (© 1994 Casady & Greene, John Calhoun), so don't publish them.
