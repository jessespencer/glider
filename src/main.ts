import { createAbout, createHowToPlay } from "./dialogs";
import { createMenu } from "./menu";
import { PixelFont } from "./pixelFont";
import type { FontMetrics } from "./pixelFont";
import { computeView, render } from "./render";
import type { Art, View } from "./render";
import { createSounds, showSoundBoard } from "./sound";
import { beginFlight, createGame, step } from "./sim";
import { createTitle, showsTitle } from "./title";
import type { GameState, Input, Room } from "./sim";

// A low tick rate, drawn with no in-between frames, gives the original's slightly chunky motion.
const STEP_SECONDS = 1 / 30;
const MAX_FRAME_SECONDS = 0.1;

const canvas = document.querySelector<HTMLCanvasElement>("#game")!;
const ctx = canvas.getContext("2d")!;

const input: Input = { left: false, right: false, turbo: false, fire: false };
const startRoom = Number(new URLSearchParams(location.search).get("room") ?? 1) - 1;
let house: Room[] = [];
let game: GameState;
let ratio = window.devicePixelRatio;
let view: View = computeView(canvas.clientWidth, canvas.clientHeight, ratio);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Couldn't load ${src}. Run npm run import-assets first.`));
    image.src = src;
  });
}

async function loadFont(name: string): Promise<PixelFont> {
  const [atlas, metrics] = await Promise.all([
    loadImage(`assets/${name}.png`),
    fetch(`assets/${name}.json`).then((response) => response.json() as Promise<FontMetrics>),
  ]);
  return new PixelFont(atlas, metrics);
}

function resize(): void {
  ratio = window.devicePixelRatio;
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  view = computeView(canvas.clientWidth, canvas.clientHeight, ratio);
}

function toggleFullscreen(): void {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen();
}

function handleKey(event: KeyboardEvent, down: boolean): void {
  const steering = event.code === "ArrowLeft" || event.code === "ArrowRight";
  if (event.code === "ArrowLeft") input.left = down;
  if (event.code === "ArrowRight") input.right = down;
  if (event.code === "Enter") input.turbo = down;
  if (event.code === "Space") input.fire = down;
  if (!down) return;

  const onTitle = showsTitle(game) && event.code !== "KeyF" && !event.metaKey;
  if (steering || onTitle || event.code === "Space" || event.code === "Enter") {
    event.preventDefault();
    beginFlight(game);
  }
  if (event.code === "KeyR") game = createGame(house, startRoom);
  if (event.code === "KeyF") toggleFullscreen();
}

const BACKGROUND_IDS = [200, 201, 202, 203, 204, 205, 206, 207, 208, 209];

async function start(): Promise<void> {
  const [sprites, spritesOpaque, titleScene, stairsUp, stairsDown, airUp, airSide, panelLeft, panelRight, font, smallFont, rooms, backgrounds] =
    await Promise.all([
      loadImage("assets/sprites.png"),
      loadImage("assets/sprites-opaque.png"),
      loadImage("assets/title-scene.png"),
      loadImage("assets/stairs-up.png"),
      loadImage("assets/stairs-down.png"),
      loadImage("assets/air-up.png"),
      loadImage("assets/air-side.png"),
      loadImage("assets/panel-left.png"),
      loadImage("assets/panel-right.png"),
      loadFont("font"),
      loadFont("font-small"),
      fetch("assets/house.json").then((response) => response.json() as Promise<Room[]>),
      Promise.all(BACKGROUND_IDS.map((id) => loadImage(`assets/back-${id}.png`))),
    ]);
  const art: Art = {
    sprites,
    spritesOpaque,
    titleScene,
    stairsUp,
    stairsDown,
    airUp,
    airSide,
    panelLeft,
    panelRight,
    font,
    smallFont,
    backgrounds: new Map(BACKGROUND_IDS.map((id, index) => [id, backgrounds[index]])),
  };
  house = rooms;
  game = createGame(house, startRoom, true);
  const sounds = createSounds();
  const title = createTitle(art);
  const about = createAbout();
  const howToPlay = createHowToPlay();
  const isDialogOpen = (): boolean => about.isOpen() || howToPlay.isOpen();
  const menu = createMenu(house, sprites, {
    newGame() {
      sounds.unlock();
      game = createGame(house, 0);
      beginFlight(game);
    },
    goToRoom(roomIndex) {
      sounds.unlock();
      game = createGame(house, roomIndex);
      beginFlight(game);
    },
    showAbout: () => about.open(),
    showHowToPlay: () => howToPlay.open(),
    toggleSound: () => sounds.toggle(),
    toggleBassBeat() {
      sounds.unlock();
      return sounds.toggleBassBeat();
    },
    toggleFullscreen,
  });

  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", (event) => {
    sounds.unlock();
    if (isDialogOpen()) return;
    handleKey(event, true);
  });
  window.addEventListener("keyup", (event) => handleKey(event, false));
  canvas.addEventListener("pointerdown", () => {
    sounds.unlock();
    if (showsTitle(game)) beginFlight(game);
  });
  window.addEventListener("blur", () => {
    input.left = false;
    input.right = false;
    input.turbo = false;
    input.fire = false;
  });

  if (import.meta.env.DEV) {
    Object.assign(window, {
      glider: {
        menu,
        get game() {
          return game;
        },
        house,
        input,
        art,
        step: () => step(game, house, input, STEP_SECONDS),
        draw: (target: CanvasRenderingContext2D, state: GameState, frameView: View) => {
          render(target, art, house, state, frameView, 1);
          if (showsTitle(state)) title.draw(target, state, frameView, 1);
        },
        createGame: (room: number, opensWithFade = false) => createGame(house, room, opensWithFade),
      },
    });
  }

  let last = performance.now();
  let pending = 0;
  const frame = (now: number): void => {
    pending += Math.min(MAX_FRAME_SECONDS, (now - last) / 1000);
    last = now;
    if (menu.isOpen() || isDialogOpen()) pending = 0;
    while (pending >= STEP_SECONDS) {
      step(game, house, input, STEP_SECONDS);
      pending -= STEP_SECONDS;
    }
    menu.setCurrentRoom(game.roomIndex);
    for (const sound of game.sounds.splice(0)) sounds.play(sound);
    render(ctx, art, house, game, view, ratio);
    if (showsTitle(game)) title.draw(ctx, game, view, ratio);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

if (location.search.includes("sounds")) showSoundBoard();
else void start();
