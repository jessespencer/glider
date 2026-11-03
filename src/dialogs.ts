const STYLE = `
  .dialog {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
  }
  .dialog.open { display: flex; }
  .dialog .window {
    width: min(460px, calc(100vw - 32px));
    max-height: calc(100vh - 64px);
    overflow: auto;
    background: #fff;
    color: #000;
    border: 1px solid #000;
    box-shadow: 3px 3px 0 #000;
    font: 13px Tahoma, "MS Sans Serif", Geneva, sans-serif;
    -webkit-font-smoothing: none;
  }
  .dialog .title { padding: 4px 8px; background: #000; color: #fff; font-weight: bold; }
  .dialog .body { padding: 14px 18px 4px; line-height: 1.45; }
  .dialog h2 { margin: 0 0 6px; font-size: 15px; }
  .dialog h3 { margin: 14px 0 2px; font-size: 13px; }
  .dialog p { margin: 0 0 6px; }
  .dialog .keys { border-collapse: collapse; margin-bottom: 6px; }
  .dialog .keys td { padding: 2px 10px 2px 0; vertical-align: top; }
  .dialog .keys td:first-child { white-space: nowrap; font-weight: bold; }
  .dialog a { color: #00a; }
  .dialog .actions { padding: 6px 18px 14px; text-align: right; }
  .dialog button { font: inherit; padding: 3px 18px; background: #fff; border: 1px solid #000; box-shadow: 1px 1px 0 #000; }
`;

const ABOUT = `
    <h2>Glider: a tribute to Glider 4.0</h2>
    <p>An unofficial fan remake, made for fun and free to play. It isn't affiliated with or endorsed by
      John Calhoun or Soft Dorothy LLC.</p>

    <h3>The original</h3>
    <p><b>Glider</b> by John Calhoun: programming, art, sounds and concept. Glider 4.0 was first published
      by Casady &amp; Greene, Inc. in 1991, and after Casady &amp; Greene closed in 2003 the rights went back to
      John Calhoun.</p>
    <p><b>Glider for Windows</b> (Glider/WIN 4.01, 1994), the version this tribute recreates: Windows
      programming by Gregg Bieser, Brass Ring Software. Published by Casady &amp; Greene and Powerhouse
      Entertainment. Special thanks, from its credits: Jeffrey Robbin, Marjorie Bieser, Brett Bieser and
      Ernest Palmer.</p>
    <p>The graphics, sounds and rooms of "The House" are from Glider for Windows and belong to their
      creators. The scoreboard lettering is Wine's copy of the Windows bitmap fonts.</p>

    <h3>Play the real thing</h3>
    <p>John Calhoun still makes Glider: get it for the
      <a href="https://apps.apple.com/us/app/glider/id482536700?mt=12" target="_blank" rel="noopener">Mac</a>,
      or <i>Glider Classic</i> for iPhone and iPad. His own
      <a href="https://github.com/softdorothy/Glider4" target="_blank" rel="noopener">Glider 4.0 source</a>
      is open under the MIT License.</p>

    <h3>This tribute</h3>
    <p>Built by <a href="https://jessedestroys.com/" target="_blank" rel="noopener">Jesse Destroys</a>.
      <a href="https://github.com/jessespencer/glider" target="_blank" rel="noopener">Source on GitHub</a>.</p>
`;

const HOW_TO_PLAY = `
    <h2>Fly the paper plane out of the house</h2>
    <p>Your plane always glides down. Ride the air from floor vents to stay up, grab clocks and other prizes
      for points, and find your way through every room to the open window at the end.</p>

    <h3>Keys</h3>
    <table class="keys">
      <tr><td>Left / Right arrows</td><td>Fly. Right goes forward; left tilts back to slow or reverse.</td></tr>
      <tr><td>Space</td><td>Fire a rubber band, once you've picked some up.</td></tr>
      <tr><td>Enter</td><td>Burn battery power to zoom forward, once you've picked a battery up.</td></tr>
      <tr><td>F</td><td>Fullscreen on or off.</td></tr>
      <tr><td>R</td><td>Start a new game.</td></tr>
    </table>

    <h3>Watch out for</h3>
    <p>Floors, furniture, flames, sparks, drips, toast and anything flying at you. Crashing costs a plane
      and restarts the room. The Rooms menu jumps straight to any room.</p>
`;

export interface Dialog {
  open(): void;
  isOpen(): boolean;
}

let styleAdded = false;

/** A Windows 3.1-style message box over the game, closed with OK, Escape, Enter or a click outside. */
function createDialog(title: string, body: string): Dialog {
  if (!styleAdded) {
    const style = document.createElement("style");
    style.textContent = STYLE;
    document.head.append(style);
    styleAdded = true;
  }

  const overlay = document.createElement("div");
  overlay.className = "dialog";
  const dialog = document.createElement("div");
  dialog.className = "window";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", title);
  const titleBar = document.createElement("div");
  titleBar.className = "title";
  titleBar.textContent = title;
  const content = document.createElement("div");
  content.className = "body";
  content.innerHTML = body;
  const actions = document.createElement("div");
  actions.className = "actions";
  const ok = document.createElement("button");
  ok.type = "button";
  ok.textContent = "OK";
  actions.append(ok);
  dialog.append(titleBar, content, actions);
  overlay.append(dialog);
  document.body.append(overlay);

  const isOpen = (): boolean => overlay.classList.contains("open");
  const close = (): void => overlay.classList.remove("open");
  ok.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (isOpen() && (event.code === "Escape" || event.code === "Enter")) close();
  });

  return {
    open() {
      overlay.classList.add("open");
      ok.focus();
    },
    isOpen,
  };
}

export function createAbout(): Dialog {
  return createDialog("About This Tribute", ABOUT);
}

export function createHowToPlay(): Dialog {
  return createDialog("How to Play", HOW_TO_PLAY);
}
