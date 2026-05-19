const DVLA_URL =
  "https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles";

export function normalizeReg(value) {
  return (value ?? "").toString().toUpperCase().replace(/\s+/g, "").trim();
}

export function isPlausibleUkReg(value) {
  const v = normalizeReg(value);
  if (!v) return false;
  if (v.length < 5 || v.length > 8) return false;
  return /^[A-Z0-9]+$/.test(v);
}

/**
 * @param {string} registrationNumber
 * @param {string} apiKey
 * @returns {Promise<
 *   | { ok: true; data: Record<string, unknown> }
 *   | { ok: false; status: number; body: Record<string, unknown> }
 * >}
 */
export async function performDvlaLookup(registrationNumber, apiKey) {
  const dvlaRes = await fetch(DVLA_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: JSON.stringify({ registrationNumber })
  });

  const rawBody = await dvlaRes.text().catch(() => "");
  let parsed = null;
  try {
    parsed = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    parsed = rawBody;
  }

  if (dvlaRes.status === 404) {
    return { ok: false, status: 404, body: { error: "Vehicle not found." } };
  }

  if (dvlaRes.status === 401 || dvlaRes.status === 403) {
    return {
      ok: false,
      status: dvlaRes.status,
      body: {
        error: "DVLA API key rejected.",
        status: dvlaRes.status,
        details:
          typeof parsed === "string"
            ? parsed.slice(0, 1500)
            : parsed
              ? JSON.stringify(parsed).slice(0, 1500)
              : undefined
      }
    };
  }

  if (!dvlaRes.ok) {
    return {
      ok: false,
      status: 502,
      body: {
        error: "DVLA lookup failed.",
        status: dvlaRes.status,
        details: rawBody ? rawBody.slice(0, 1500) : undefined
      }
    };
  }

  const json = typeof parsed === "object" && parsed ? parsed : {};
  return {
    ok: true,
    data: {
      registrationNumber: json.registrationNumber ?? registrationNumber,
      make: json.make ?? null,
      colour: json.colour ?? null,
      fuelType: json.fuelType ?? null,
      yearOfManufacture: json.yearOfManufacture ?? null,
      engineCapacity: json.engineCapacity ?? null,
      motStatus: json.motStatus ?? null,
      taxStatus: json.taxStatus ?? null,
      co2Emissions: json.co2Emissions ?? null,
      markedForExport: json.markedForExport ?? null
    }
  };
}
