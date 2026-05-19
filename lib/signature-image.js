import { MAX_SIGNATURE_ATTACHMENT_BYTES } from "./intake-limits.js";

const DATA_URL_RE = /^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i;

/**
 * @param {string} dataUrl
 * @returns {{ buffer: Buffer, contentType: string, ext: string } | null}
 */
export function parseSignatureDataUrl(dataUrl) {
  const m = DATA_URL_RE.exec((dataUrl ?? "").toString());
  if (!m) return null;
  try {
    const buffer = Buffer.from(m[2], "base64");
    const subtype = m[1].split("/")[1].toLowerCase();
    const ext = subtype === "jpeg" || subtype === "jpg" ? "jpg" : subtype;
    const contentType = subtype === "jpg" ? "image/jpeg" : `image/${subtype}`;
    return { buffer, contentType, ext };
  } catch {
    return null;
  }
}

/**
 * @param {string} [dataUrl]
 * @returns {import("nodemailer/lib/mailer/mail-options.js").Attachment[]}
 */
export function buildSignatureAttachment(dataUrl) {
  const parsed = parseSignatureDataUrl(dataUrl);
  if (!parsed) return [];

  if (parsed.buffer.length > MAX_SIGNATURE_ATTACHMENT_BYTES) {
    console.warn("[email] signature attachment skipped (too large)", {
      bytes: parsed.buffer.length,
      maxBytes: MAX_SIGNATURE_ATTACHMENT_BYTES
    });
    return [];
  }

  return [
    {
      filename: `signature.${parsed.ext}`,
      content: parsed.buffer,
      contentType: parsed.contentType
    }
  ];
}
