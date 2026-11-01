export interface FontMetrics {
  cell: number;
  height: number;
  columns: number;
  first: number;
  widths: number[];
}

const MISSING_CHAR_WIDTH = 8;

/** Draws Windows' bitmap System font at room scale, so text stays as blocky as the original. */
export class PixelFont {
  private readonly tinted = new Map<string, HTMLCanvasElement>();

  constructor(
    private readonly atlas: HTMLImageElement,
    private readonly metrics: FontMetrics,
  ) {}

  private atlasFor(color: string): HTMLCanvasElement {
    const cached = this.tinted.get(color);
    if (cached) return cached;
    const canvas = document.createElement("canvas");
    canvas.width = this.atlas.width;
    canvas.height = this.atlas.height;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(this.atlas, 0, 0);
    ctx.globalCompositeOperation = "source-in";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this.tinted.set(color, canvas);
    return canvas;
  }

  measure(text: string): number {
    let width = 0;
    for (const char of text) {
      width += this.metrics.widths[char.charCodeAt(0) - this.metrics.first] ?? MISSING_CHAR_WIDTH;
    }
    return width;
  }

  draw(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string): void {
    const { cell, height, columns, first, widths } = this.metrics;
    const source = this.atlasFor(color);
    let penX = x;
    for (const char of text) {
      const index = char.charCodeAt(0) - first;
      const width = widths[index] ?? MISSING_CHAR_WIDTH;
      if (widths[index] !== undefined) {
        const sx = (index % columns) * cell;
        const sy = Math.floor(index / columns) * height;
        ctx.drawImage(source, sx, sy, width, height, penX, y, width, height);
      }
      penX += width;
    }
  }
}
