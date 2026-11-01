# Glider

A private remake prototype of Glider for Windows: fly a paper plane through a house on floor vents. It keeps the original look and side panels, zoomed as large as the window allows while staying pixel-crisp, and plays all 63 rooms of the original house, from "Welcome..." to the window in "Goodbye...".

## Run

```bash
npm install
npm run import-assets
npm run dev -- --port 5273
```

Open http://localhost:5273. Arrow keys fly, Space fires rubber bands, Enter burns battery power to zoom forward, F toggles fullscreen, R restarts.

The Rooms menu jumps straight to any room. Add `?room=12` to start in a room, or open `?sounds` to audition the original sounds.

`import-assets` reads the local Glider install in `~/Games/Prefixes/GLIDER` and writes `public/assets`. Those graphics and rooms are copyrighted placeholders (© 1994 Casady & Greene, John Calhoun), so don't publish them.
