import {
  MAX_PAYLOAD_BYTES,
  MAX_SIGNATURE_DATA_URL_BYTES
} from "./intake-limits.js";

const DATA_URL_RE = /^data:image\/[a-z+]+;base64,/i;

export function getJsonByteSize(value) {
  const json = JSON.stringify(value);
  if (typeof Buffer !== "undefined") {
    return Buffer.byteLength(json, "utf8");
  }
  return new TextEncoder().encode(json).length;
}

export function estimateDataUrlBytes(dataUrl) {
  if (!dataUrl || typeof dataUrl !== "string") return 0;
  const comma = dataUrl.indexOf(",");
  if (comma < 0) return dataUrl.length;
  const base64 = dataUrl.slice(comma + 1);
  return Math.ceil((base64.length * 3) / 4);
}

export function findDisallowedEmbeddedImages(value, depth = 0, parentKey = "") {
  if (depth > 10) return [];
  const found = [];
  if (typeof value === "string" && DATA_URL_RE.test(value)) {
    if (parentKey !== "signatureDataUrl") {
      found.push(parentKey || "embedded image");
    }
    return found;
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      found.push(...findDisallowedEmbeddedImages(item, depth + 1, parentKey));
    }
    return found;
  }
  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key === "signatureDataUrl") continue;
      if (/photo|image|upload|attachment/i.test(key)) {
        const v = value[key];
        if (v && (typeof v === "string" || Array.isArray(v) || typeof v === "object")) {
          found.push(key);
        }
      }
      found.push(...findDisallowedEmbeddedImages(value[key], depth + 1, key));
    }
  }
  return found;
}

/**
 * @param {object} formData
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function validateIntakePayload(formData) {
  const payloadBytes = getJsonByteSize(formData);
  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    const kb = Math.round(payloadBytes / 1024);
    const maxKb = Math.round(MAX_PAYLOAD_BYTES / 1024);
    return {
      ok: false,
      error: `Form is too large to send (${kb}KB). Maximum is ${maxKb}KB. Remove photos or sign again with a smaller signature.`
    };
  }

  const sigUrl = formData?.consent?.signatureDataUrl;
  if (sigUrl) {
    const sigBytes = estimateDataUrlBytes(sigUrl);
    if (sigBytes > MAX_SIGNATURE_DATA_URL_BYTES) {
      return {
        ok: false,
        error: "Signature is too large. Please clear it and sign again."
      };
    }
  }

  const photoFields = findDisallowedEmbeddedImages(formData);
  if (photoFields.length > 0) {
    return {
      ok: false,
      error: "Photo uploads are not supported yet. Please remove photos before submitting."
    };
  }

  return { ok: true };
}
