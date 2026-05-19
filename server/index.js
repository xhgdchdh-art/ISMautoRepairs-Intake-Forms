import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import {
  isPlausibleUkReg,
  normalizeReg,
  performDvlaLookup
} from "../lib/dvla-lookup.js";
import { validateIntakePayload } from "../lib/intake-payload.js";
import { isEmailConfigured, sendIntakeEmail } from "../lib/send-intake-email.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
app.use(express.json({ limit: "2mb" }));

console.log("[env] EMAIL_USER set:", process.env.EMAIL_USER ? "yes" : "no");
console.log("[env] EMAIL_PASS set:", process.env.EMAIL_PASS ? "yes" : "no");
console.log("[env] GARAGE_EMAIL set:", process.env.GARAGE_EMAIL ? "yes" : "no");

app.post("/api/vehicle-lookup", async (req, res) => {
  const apiKey = process.env.DVLA_API_KEY;
  if (!apiKey) {
    console.error("[dvla] DVLA_API_KEY missing");
    return res.status(503).json({
      error: "Vehicle lookup is temporarily unavailable."
    });
  }

  const registrationNumber = normalizeReg(req.body?.registrationNumber);
  if (!isPlausibleUkReg(registrationNumber)) {
    return res.status(400).json({ error: "Invalid registration number." });
  }

  try {
    const result = await performDvlaLookup(registrationNumber, apiKey);
    if (!result.ok) {
      return res.status(result.status).json(result.body);
    }
    return res.json(result.data);
  } catch (err) {
    console.error("[dvla] error", err?.message || err);
    return res.status(502).json({
      error: "DVLA lookup unavailable.",
      details: err?.message || String(err)
    });
  }
});

app.post("/api/send-intake", async (req, res) => {
  console.log("[send-intake] API HIT");

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

  const formData = req.body;
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

  try {
    await sendIntakeEmail(formData);
    return res.json({ ok: true });
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
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5181;
app.listen(PORT, () => {
  console.log(
    `API listening on http://localhost:${PORT} (DVLA key: ${process.env.DVLA_API_KEY ? "loaded" : "missing"})`
  );
});
