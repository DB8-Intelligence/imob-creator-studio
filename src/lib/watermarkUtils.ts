/**
 * Watermark utilities — Canvas-based image watermarking.
 * Trial users: mandatory watermark.
 * Paid users: optional (default on, can disable).
 */

export interface WatermarkOptions {
  text?: string;
  position?: "bottom-right" | "bottom-left" | "bottom-center";
  opacity?: number;   // 0–1, default 0.82
  fontSize?: number;  // px, default 13
}

const DEFAULT_TEXT    = "Criado com NexoImob AI";
const DEFAULT_OPACITY = 0.82;
const DEFAULT_SIZE    = 13;
const PADDING_X       = 12;
const PADDING_Y       = 8;
const CORNER_RADIUS   = 6;
const MARGIN          = 14;

/**
 * Loads an image from a URL into an HTMLImageElement.
 * Handles cross-origin by setting crossOrigin = "anonymous".
 */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Applies a watermark pill to a canvas context.
 * Pill is a semi-transparent dark rounded rectangle with white text inside.
 */
function drawWatermarkPill(
  ctx: CanvasRenderingContext2D,
  canvasW: number,
  canvasH: number,
  opts: Required<WatermarkOptions>,
): void {
  ctx.save();
  ctx.globalAlpha = opts.opacity;

  const font = `600 ${opts.fontSize}px Inter, -apple-system, sans-serif`;
  ctx.font = font;
  const metrics   = ctx.measureText(opts.text);
  const textW     = metrics.width;
  const pillW     = textW + PADDING_X * 2;
  const pillH     = opts.fontSize + PADDING_Y * 2;

  // Compute pill X
  let pillX: number;
  if (opts.position === "bottom-left") {
    pillX = MARGIN;
  } else if (opts.position === "bottom-center") {
    pillX = (canvasW - pillW) / 2;
  } else {
    pillX = canvasW - pillW - MARGIN;
  }
  const pillY = canvasH - pillH - MARGIN;

  // Draw pill background
  ctx.beginPath();
  ctx.roundRect(pillX, pillY, pillW, pillH, CORNER_RADIUS);
  ctx.fillStyle = "rgba(10, 14, 26, 0.72)";
  ctx.fill();

  // Draw border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.lineWidth   = 0.75;
  ctx.stroke();

  // Draw text
  ctx.globalAlpha  = opts.opacity;
  ctx.fillStyle    = "rgba(255, 255, 255, 0.92)";
  ctx.font         = font;
  ctx.textBaseline = "middle";
  ctx.textAlign    = "left";
  ctx.fillText(opts.text, pillX + PADDING_X, pillY + pillH / 2);

  ctx.restore();
}

/**
 * Stamps a watermark onto an image URL and returns the result as a Blob.
 * If `apply` is false, the original image is fetched and returned as-is.
 */
export async function applyWatermark(
  imageUrl: string,
  apply: boolean,
  opts: WatermarkOptions = {},
): Promise<Blob> {
  const img = await loadImage(imageUrl);

  const canvas    = document.createElement("canvas");
  canvas.width    = img.naturalWidth  || img.width;
  canvas.height   = img.naturalHeight || img.height;
  const ctx       = canvas.getContext("2d")!;

  ctx.drawImage(img, 0, 0);

  if (apply) {
    const resolved: Required<WatermarkOptions> = {
      text:     opts.text     ?? DEFAULT_TEXT,
      position: opts.position ?? "bottom-right",
      opacity:  opts.opacity  ?? DEFAULT_OPACITY,
      fontSize: opts.fontSize ?? DEFAULT_SIZE,
    };
    drawWatermarkPill(ctx, canvas.width, canvas.height, resolved);
  }

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Canvas toBlob failed"))),
      "image/jpeg",
      0.92,
    );
  });
}

/**
 * Convenience: builds a data URL from the watermarked canvas.
 * Useful for <img> previews inside the SharePanel.
 */
export async function buildWatermarkPreview(
  imageUrl: string,
  apply: boolean,
  opts: WatermarkOptions = {},
): Promise<string> {
  const blob = await applyWatermark(imageUrl, apply, opts);
  return URL.createObjectURL(blob);
}
