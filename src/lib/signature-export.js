/** Export a compact JPEG signature from the drawing canvas. */
export function exportSignatureFromCanvas(canvas) {
  const rect = canvas.getBoundingClientRect();
  const maxW = 360;
  const maxH = 100;
  const scale = Math.min(1, maxW / Math.max(rect.width, 1), maxH / Math.max(rect.height, 1));
  const w = Math.max(1, Math.round(rect.width * scale));
  const h = Math.max(1, Math.round(rect.height * scale));

  const off = document.createElement("canvas");
  off.width = w;
  off.height = h;
  const ctx = off.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(canvas, 0, 0, w, h);
  return off.toDataURL("image/jpeg", 0.72);
}
