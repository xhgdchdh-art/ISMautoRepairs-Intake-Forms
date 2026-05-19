import { validateIntakePayload } from "../lib/intake-payload.js";
import { parseRequestBody } from "../lib/parse-request-body.js";
import {
  getRecipientSource,
  isEmailConfigured,
  sendIntakeEmail
} from "../lib/send-intake-email.js";

export default async function handler(req, res) {
  console.log("[send-intake] API HIT", { method: req.method });

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  if (!isEmailConfigured()) {
    console.error("[send-intake] email not configured", {
      emailUserSet: Boolean(process.env.EMAIL_USER),
      emailPassSet: Boolean(process.env.EMAIL_PASS),
      garageEmailSet: Boolean(process.env.GARAGE_EMAIL)
    });
    return res.status(503).json({
      error: "Email service is not configured."
    });
  }

  const formData = parseRequestBody(req);
  if (!formData || typeof formData !== "object" || !formData.customer) {
    console.warn("[send-intake] invalid payload");
    return res.status(400).json({ error: "Invalid intake payload." });
  }

  const payloadCheck = validateIntakePayload(formData);
  if (!payloadCheck.ok) {
    console.warn("[send-intake] payload rejected", { reason: payloadCheck.error });
    return res.status(413).json({ error: payloadCheck.error });
  }

  const registration =
    (formData.vehicle?.registration ?? "").toString().trim() || "No Reg";

  console.log("[send-intake] processing", {
    registration,
    recipientSource: getRecipientSource()
  });

  try {
    await sendIntakeEmail(formData);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[send-intake] send failed", {
      registration,
      message: err?.message || String(err)
    });
    return res.status(502).json({
      error: "Failed to send email.",
      details: err?.message || String(err)
    });
  }
}
