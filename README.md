# Glider

A private remake prototype of Glider for Windows: fly a paper plane through a house on floor vents. It keeps the original look in a small framed window at a whole-number zoom. So far it's the one original room, "Welcome...".

## Run

```bash
npm install
npm run import-assets
npm run dev -- --port 5273
```

Open http://localhost:5273. Arrow keys fly, F toggles fullscreen, R restarts.

`import-assets` reads the local Glider install in `~/Games/Prefixes/GLIDER` and writes `public/assets`. Those graphics and rooms are copyrighted placeholders (© 1994 Casady & Greene, John Calhoun), so don't publish them.
