import type { Room } from "./sim";

const ROOMS_PER_COLUMN = 21;
const ICON_W = 33;
const ICON_H = 13;

export interface MenuActions {
  newGame(): void;
  showAbout(): void;
  goToRoom(roomIndex: number): void;
  toggleSound(): boolean;
  toggleBassBeat(): boolean;
  toggleFullscreen(): void;
}

export interface Menu {
  isOpen(): boolean;
  setCurrentRoom(roomIndex: number): void;
}

const STYLE = `
  #menu-bar {
    position: relative;
    z-index: 10;
    display: flex;
    align-items: center;
    height: 24px;
    box-sizing: border-box;
    padding: 0 8px;
    background: #fff;
    border-bottom: 1px solid #000;
    color: #000;
    font: 13px Tahoma, "MS Sans Serif", Geneva, sans-serif;
    -webkit-font-smoothing: none;
    user-select: none;
  }
  #menu-bar canvas { width: 33px; height: 13px; margin-right: 6px; image-rendering: pixelated; }
  .menu { position: relative; }
  .menu-title { padding: 3px 8px; cursor: default; }
  .menu.open .menu-title { background: #000; color: #fff; }
  .menu-list {
    display: none;
    position: absolute;
    top: 23px;
    left: 0;
    min-width: 160px;
    background: #fff;
    border: 1px solid #000;
    box-shadow: 2px 2px 0 #000;
  }
  .menu.open .menu-list { display: block; }
  .menu-item { padding: 3px 12px; white-space: nowrap; cursor: default; }
  .menu-item:hover { background: #000; color: #fff; }
  .menu-item.current { font-weight: bold; }
  .menu-list.rooms {
    grid-auto-flow: column;
    grid-template-rows: repeat(${ROOMS_PER_COLUMN}, auto);
  }
  .menu.open .menu-list.rooms { display: grid; }
`;

/** Underlines the first letter, the way the original's Windows menus marked their shortcut keys. */
function menuTitle(text: string): HTMLElement {
  const title = document.createElement("div");
  title.className = "menu-title";
  const first = document.createElement("u");
  first.textContent = text[0];
  title.append(first, text.slice(1));
  return title;
}

function menuItem(text: string, onChoose: () => void): HTMLElement {
  const item = document.createElement("div");
  item.className = "menu-item";
  item.textContent = text;
  item.addEventListener("click", onChoose);
  return item;
}

function planeIcon(sprites: HTMLImageElement): HTMLCanvasElement {
  const icon = document.createElement("canvas");
  icon.width = ICON_W;
  icon.height = ICON_H;
  icon.getContext("2d")!.drawImage(sprites, 1, 319, ICON_W, ICON_H, 0, 0, ICON_W, ICON_H);
  return icon;
}

export function createMenu(rooms: Room[], sprites: HTMLImageElement, actions: MenuActions): Menu {
  const style = document.createElement("style");
  style.textContent = STYLE;
  document.head.append(style);

  const bar = document.querySelector<HTMLElement>("#menu-bar")!;
  bar.append(planeIcon(sprites));

  const menus: HTMLElement[] = [];
  const closeAll = (): void => menus.forEach((menu) => menu.classList.remove("open"));

  const addMenu = (name: string, items: HTMLElement[], listClass = ""): void => {
    const menu = document.createElement("div");
    menu.className = "menu";
    const list = document.createElement("div");
    list.className = `menu-list ${listClass}`;
    list.append(...items);
    list.addEventListener("click", closeAll);
    const title = menuTitle(name);
    title.addEventListener("click", (event) => {
      event.stopPropagation();
      const wasOpen = menu.classList.contains("open");
      closeAll();
      if (!wasOpen) menu.classList.add("open");
    });
    title.addEventListener("mouseenter", () => {
      if (menus.some((other) => other.classList.contains("open"))) {
        closeAll();
        menu.classList.add("open");
      }
    });
    menu.append(title, list);
    bar.append(menu);
    menus.push(menu);
  };

  const roomItems = rooms.map((room, index) => menuItem(`${index + 1}  ${room.name}`, () => actions.goToRoom(index)));

  const soundItem = menuItem("Sound: on", () => {
    soundItem.textContent = actions.toggleSound() ? "Sound: on" : "Sound: off";
  });

  const bassBeatItem = menuItem("Bass Beat: off", () => {
    bassBeatItem.textContent = actions.toggleBassBeat() ? "Bass Beat: on" : "Bass Beat: off";
  });

  addMenu("Game", [menuItem("New Game", actions.newGame), menuItem("About This Tribute...", actions.showAbout)]);
  addMenu("Rooms", roomItems, "rooms");
  addMenu("Options", [soundItem, bassBeatItem, menuItem("Fullscreen", actions.toggleFullscreen)]);

  window.addEventListener("click", closeAll);

  return {
    isOpen: () => menus.some((menu) => menu.classList.contains("open")),
    setCurrentRoom(roomIndex) {
      roomItems.forEach((item, index) => item.classList.toggle("current", index === roomIndex));
    },
  };
}
