export interface CropArea { x: number; y: number; width: number; height: number }

function loadImage(source: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = image.onerror = null;
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      image.removeAttribute("src");
      reject(new DOMException("Cancelled", "AbortError"));
    };
    if (signal.aborted) { abort(); return; }
    image.onload = () => { cleanup(); resolve(image); };
    image.onerror = () => { cleanup(); reject(new Error("resume-avatar: image load failed")); };
    signal.addEventListener("abort", abort, { once: true });
    image.src = source;
  });
}

export async function cropAvatar(source: string, area: CropArea, signal: AbortSignal): Promise<string> {
  if (!Object.values(area).every(Number.isFinite) || area.width <= 0 || area.height <= 0 || area.x < 0 || area.y < 0) throw new Error("resume-avatar: invalid crop area");
  const image = await loadImage(source, signal);
  if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
  if (!image.naturalWidth || !image.naturalHeight || area.x + area.width > image.naturalWidth + 1 || area.y + area.height > image.naturalHeight + 1) throw new Error("resume-avatar: crop outside image");
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(area.width));
  canvas.height = Math.max(1, Math.round(area.height));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("resume-avatar: canvas unavailable");
  context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, canvas.width, canvas.height);
  const result = canvas.toDataURL("image/png");
  if (!result.startsWith("data:image/png;base64,")) throw new Error("resume-avatar: image encoding failed");
  return result;
}
