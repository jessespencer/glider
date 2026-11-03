const STYLE = `
  #about {
    position: fixed;
    inset: 0;
    z-index: 20;
    display: none;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.55);
  }
  #about.open { display: flex; }
  #about .window {
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
  #about .title { padding: 4px 8px; background: #000; color: #fff; font-weight: bold; }
  #about .body { padding: 14px 18px 4px; line-height: 1.45; }
  #about h2 { margin: 0 0 6px; font-size: 15px; }
  #about h3 { margin: 14px 0 2px; font-size: 13px; }
  #about p { margin: 0 0 6px; }
  #about a { color: #00a; }
  #about .actions { padding: 6px 18px 14px; text-align: right; }
  #about button { font: inherit; padding: 3px 18px; background: #fff; border: 1px solid #000; box-shadow: 1px 1px 0 #000; }
`;

const CONTENT = `
  <div class="title">About This Tribute</div>
  <div class="body">
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
      or <i>Glider Classic</i> for iPhone and iPad. His
      <a href="https://github.com/softdorothy/Glider4" target="_blank" rel="noopener">Glider 4.0 source</a>
      is open under the MIT License.</p>

    <h3>This tribute</h3>
    <p>Rebuilt in TypeScript by Jesse Spencer, with Claude.
      <a href="https://github.com/jessespencer/glider" target="_blank" rel="noopener">Source on GitHub</a>.</p>
  </div>
  <div class="actions"><button type="button">OK</button></div>
`;

export interface About {
  open(): void;
  isOpen(): boolean;
}

export function createAbout(): About {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.append(style);

  const overlay = document.createElement("div");
  overlay.id = "about";
  const dialog = document.createElement("div");
  dialog.className = "window";
  dialog.setAttribute("role", "dialog");
  dialog.setAttribute("aria-label", "About This Tribute");
  dialog.innerHTML = CONTENT;
  overlay.append(dialog);
  document.body.append(overlay);

  const close = (): void => overlay.classList.remove("open");
  dialog.querySelector("button")!.addEventListener("click", close);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) close();
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Escape" || event.code === "Enter") close();
  });

  return {
    open() {
      overlay.classList.add("open");
      dialog.querySelector("button")!.focus();
    },
    isOpen: () => overlay.classList.contains("open"),
  };
}
