import { MAX_EMAIL_TEXT_FIELD_CHARS } from "./intake-limits.js";
import { buildSignatureAttachment } from "./signature-image.js";

function safeText(value) {
  return (value ?? "").toString().trim();
}

function clip(value, max = MAX_EMAIL_TEXT_FIELD_CHARS) {
  const s = safeText(value);
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function joinList(value) {
  const arr = Array.isArray(value) ? value.filter(Boolean) : [];
  return arr.length ? arr.join(", ") : "";
}

/** Strip base64 and other heavy fields before logging or serialising. */
export function sanitizeFormDataForTransport(formData) {
  const consent = formData?.consent ?? {};
  return {
    customer: formData?.customer ?? {},
    vehicle: formData?.vehicle ?? {},
    fault: formData?.fault ?? {},
    service: formData?.service ?? {},
    consent: {
      acceptedTerms: Boolean(consent.acceptedTerms),
      marketingConsent: Boolean(consent.marketingConsent),
      signatureDataUrl: consent.signatureDataUrl || ""
    },
    submittedAt: formData?.submittedAt ?? ""
  };
}

export function formatIntakeEmail(formData) {
  const customer = formData?.customer ?? {};
  const vehicle = formData?.vehicle ?? {};
  const fault = formData?.fault ?? {};
  const service = formData?.service ?? {};
  const consent = formData?.consent ?? {};
  const submittedAt = safeText(formData?.submittedAt);
  const hasSignature = Boolean(consent?.signatureDataUrl);

  const subjectReg = safeText(vehicle.registration) || "No Reg";

  const lines = [
    `NEW INTAKE — ${subjectReg}`,
    submittedAt ? `Submitted: ${submittedAt}` : "",
    "",
    "CUSTOMER",
    `Name: ${safeText(customer.fullName) || "—"}`,
    `Phone: ${safeText(customer.phone) || "—"}`,
    `Email: ${safeText(customer.email) || "—"}`,
    "",
    "VEHICLE",
    `Reg: ${subjectReg}`,
    `Make/Model: ${[safeText(vehicle.make), safeText(vehicle.model)].filter(Boolean).join(" ") || "—"}`,
    `Year: ${safeText(vehicle.year) || "—"}`,
    "",
    "PROBLEM",
    clip(fault.description) || "—",
    fault.whenOccurs?.length ? `When: ${joinList(fault.whenOccurs)}` : "",
    safeText(fault.warningLights) ? `Warning lights: ${safeText(fault.warningLights)}` : "",
    "",
    "WORK",
    `Authorisation: ${safeText(service.authorisation) || "—"}`,
    `Spending limit: £${safeText(service.spendingLimit) || "0"}`,
    service.requestedServices?.length
      ? `Services: ${joinList(service.requestedServices)}`
      : "",
    safeText(service.urgency) ? `Timing: ${safeText(service.urgency)}` : "",
    safeText(service.notes) ? `Notes: ${clip(service.notes, 300)}` : "",
    "",
    "CONSENT",
    `Terms accepted: ${consent.acceptedTerms ? "Yes" : "No"}`,
    `Marketing: ${consent.marketingConsent ? "Yes" : "No"}`,
    `Signature: ${hasSignature ? "attached" : "not provided"}`
  ].filter(Boolean);

  return { text: lines.join("\n"), subjectReg, hasSignature };
}

export function buildIntakeAttachments(formData) {
  return buildSignatureAttachment(formData?.consent?.signatureDataUrl);
}
