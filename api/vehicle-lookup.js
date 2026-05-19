import {
  isPlausibleUkReg,
  normalizeReg,
  performDvlaLookup
} from "../lib/dvla-lookup.js";
import { parseRequestBody } from "../lib/parse-request-body.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.DVLA_API_KEY;
  if (!apiKey) {
    console.error("[dvla] DVLA_API_KEY missing");
    return res.status(503).json({
      error: "Vehicle lookup is temporarily unavailable."
    });
  }

  const registrationNumber = normalizeReg(parseRequestBody(req).registrationNumber);
  if (!isPlausibleUkReg(registrationNumber)) {
    return res.status(400).json({ error: "Invalid registration number." });
  }

  try {
    const result = await performDvlaLookup(registrationNumber, apiKey);
    if (!result.ok) {
      return res.status(result.status).json(result.body);
    }
    return res.status(200).json(result.data);
  } catch (err) {
    console.error("[dvla] error", err?.message || err);
    return res.status(502).json({
      error: "DVLA lookup unavailable.",
      details: err?.message || String(err)
    });
  }
}
