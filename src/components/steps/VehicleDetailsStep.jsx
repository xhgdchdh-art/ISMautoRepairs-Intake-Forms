import { useEffect, useMemo, useState } from "react";

function normalizeReg(value) {
  return (value ?? "").toUpperCase().replace(/\s+/g, "").trim();
}

function isPlausibleUkReg(value) {
  const v = normalizeReg(value);
  if (!v) return false;
  if (v.length < 5 || v.length > 8) return false;
  return /^[A-Z0-9]+$/.test(v);
}

function Field({ id, label, error, children }) {
  return (
    <div className="field">
      <div className="labelRow">
        <label htmlFor={id}>{label}</label>
      </div>
      {children}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

function Icon({ name }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className: "vehIcon",
    "aria-hidden": "true"
  };

  switch (name) {
    case "make":
      return (
        <svg {...common}>
          <path
            d="M7 16.5V14a5 5 0 0 1 5-5h0a5 5 0 0 1 5 5v2.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5 19h14"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 9V7.8a2.2 2.2 0 0 1 4.4 0V9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "colour":
      return (
        <svg {...common}>
          <path
            d="M12 3a9 9 0 1 0 9 9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M21 12a9 9 0 0 0-9-9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 12l6.3-6.3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "fuel":
      return (
        <svg {...common}>
          <path
            d="M6 20V5a2 2 0 0 1 2-2h7v7H8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15 10h2.5a1.5 1.5 0 0 1 1.5 1.5V20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M19 20a2 2 0 0 1-4 0"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "year":
      return (
        <svg {...common}>
          <path
            d="M8 3v3M16 3v3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M4 8h16"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M6 5h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "engine":
      return (
        <svg {...common}>
          <path
            d="M6 13h2l2-3h4l2 3h2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 16h10a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 10H6a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "mot":
      return (
        <svg {...common}>
          <path
            d="M9 12l2 2 4-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 3h10v4l-2 2H9L7 7V3Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M7 9v12h10V9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "tax":
      return (
        <svg {...common}>
          <path
            d="M7 7h10v14H7V7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M10 12h4M10 16h4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "co2":
      return (
        <svg {...common}>
          <path
            d="M12 3v18"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M7 8a5 5 0 0 1 10 0c0 3-5 4-5 7"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M12 19h.01"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function Detail({ icon, label, value }) {
  return (
    <div className="vehRow">
      <Icon name={icon} />
      <div className="vehText">
        <div className="vehLabel">{label}</div>
        <div className="vehValue">{value}</div>
      </div>
    </div>
  );
}

const EMPTY_VEHICLE = {
  make: "",
  model: "",
  year: "",
  fuel: "",
  engine: "",
  registration: "",
  vin: ""
};

function titleCaseFuel(value) {
  const v = (value ?? "").toString().trim().toUpperCase();
  if (!v) return "";
  if (v === "PETROL") return "Petrol";
  if (v === "DIESEL") return "Diesel";
  if (v === "ELECTRICITY" || v === "ELECTRIC") return "Electric";
  if (v === "HYBRID ELECTRIC" || v === "HYBRID") return "Hybrid";
  return v.charAt(0) + v.slice(1).toLowerCase();
}

function validateVehicle(v) {
  const errors = {};
  const make = (v.make ?? "").trim();
  const model = (v.model ?? "").trim();
  const yearStr = (v.year ?? "").toString().trim();
  const yearNum = Number(yearStr);

  if (!make) errors.make = "Make is required.";
  if (!model) errors.model = "Model is required.";
  if (!yearStr) errors.year = "Year is required.";
  else if (!Number.isFinite(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
    errors.year = "Enter a valid year.";
  }

  return errors;
}

export default function VehicleDetailsStep({ formData, setFormData, onNext, onBack, onSave, toast }) {
  const [mode, setMode] = useState("lookup");
  const [reg, setReg] = useState("");
  const [dvlaVehicle, setDvlaVehicle] = useState(null);
  const [lookupState, setLookupState] = useState({ loading: false, error: "" });
  const [manualErrors, setManualErrors] = useState({});
  const [showManualSuggestion, setShowManualSuggestion] = useState(false);

  const prettyReg = useMemo(() => {
    const v = normalizeReg(reg);
    if (v.length <= 3) return v;
    return `${v.slice(0, 3)} ${v.slice(3)}`;
  }, [reg]);

  const vehicle = useMemo(() => {
    const v = formData?.vehicle ?? {};
    return { ...EMPTY_VEHICLE, ...v };
  }, [formData]);

  const setVehicleField = (field, value) => {
    setFormData((prev) => {
      const prevVeh = prev.vehicle ?? {};
      return {
        ...prev,
        vehicle: {
          ...EMPTY_VEHICLE,
          ...prevVeh,
          [field]: value
        }
      };
    });
  };

  const canConfirm = useMemo(() => {
    const e = validateVehicle(vehicle);
    return Object.keys(e).length === 0;
  }, [vehicle]);

  useEffect(() => {
    if (mode === "manual") {
      setLookupState((s) => ({ ...s, error: "" }));
      setShowManualSuggestion(false);
    }
  }, [mode]);

  const handleLookup = async () => {
    const normalized = reg.replace(/\s/g, "").toUpperCase();
    setLookupState({ loading: false, error: "" });
    setShowManualSuggestion(false);

    if (!isPlausibleUkReg(normalized)) {
      setDvlaVehicle(null);
      setLookupState({ loading: false, error: "Enter a valid UK registration." });
      setShowManualSuggestion(true);
      return;
    }

    setLookupState({ loading: true, error: "" });
    setDvlaVehicle(null);

    try {
      const response = await fetch("/api/vehicle-lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          registrationNumber: normalized
        })
      });

      if (!response.ok) {
        let msg = "";
        try {
          const payload = await response.json();
          const details = payload?.cause
            ? `${payload.details || ""}${payload.details ? " — " : ""}${payload.cause}`
            : payload?.details;
          msg = details
            ? `${payload.error || "DVLA lookup failed."} (${details})`
            : payload?.error || "";
        } catch {
          msg = "";
        }

        if (response.status === 404) {
          setLookupState({
            loading: false,
            error: msg || "Vehicle not found. Please check the registration."
          });
          setShowManualSuggestion(true);
          return;
        }

        if (response.status === 401 || response.status === 403) {
          setLookupState({
            loading: false,
            error: msg || "DVLA API key rejected."
          });
          setShowManualSuggestion(true);
          return;
        }

        if (response.status === 400) {
          setLookupState({ loading: false, error: msg || "Invalid registration number." });
          setShowManualSuggestion(true);
          return;
        }

        if (response.status === 503) {
          setLookupState({
            loading: false,
            error: msg || "Vehicle lookup is temporarily unavailable."
          });
          setShowManualSuggestion(true);
          return;
        }

        setLookupState({
          loading: false,
          error: msg || "DVLA lookup failed. Please try again."
        });
        setShowManualSuggestion(true);
        return;
      }

      const data = await response.json();
      setDvlaVehicle(data);
      setLookupState({ loading: false, error: "" });

      setVehicleField("registration", data.registrationNumber ?? normalized);
      if (data.make) setVehicleField("make", data.make);
      if (data.yearOfManufacture != null) setVehicleField("year", String(data.yearOfManufacture));
      if (data.fuelType) setVehicleField("fuel", titleCaseFuel(data.fuelType));
      if (data.engineCapacity != null) setVehicleField("engine", String(data.engineCapacity));

      setManualErrors((prev) => {
        const merged = { ...prev };
        delete merged.make;
        delete merged.year;
        return merged;
      });
    } catch {
      setLookupState({ loading: false, error: "Backend server is not running." });
      setShowManualSuggestion(true);
    }
  };

  const handleChangeVehicle = () => {
    setDvlaVehicle(null);
    setLookupState({ loading: false, error: "" });
    setShowManualSuggestion(false);
  };

  const fuelOptions = useMemo(() => ["", "Petrol", "Diesel", "Hybrid", "Electric"], []);

  const confirmVehicle = () => {
    const e = validateVehicle(vehicle);
    setManualErrors(e);
    if (Object.keys(e).length) return;
    onNext();
  };

  return (
    <div>
      <div className="vehModeTabs" role="tablist" aria-label="Vehicle entry method">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "lookup"}
          className={["vehTab", mode === "lookup" ? "isActive" : ""].join(" ")}
          onClick={() => setMode("lookup")}
        >
          Lookup by Registration
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "manual"}
          className={["vehTab", mode === "manual" ? "isActive" : ""].join(" ")}
          onClick={() => setMode("manual")}
        >
          Enter Vehicle Manually
        </button>
      </div>

      <div className={["vehPanel", mode === "lookup" ? "isActive" : ""].join(" ")}>
        {mode === "lookup" ? (
          <>
            <div className="reg-lookup">
              <label htmlFor="regLookupInput">Enter Registration Number</label>

              <div className="reg-input-group">
                <input
                  id="regLookupInput"
                  type="text"
                  placeholder="e.g. YA17NXC"
                  value={prettyReg}
                  onChange={(e) => setReg(e.target.value.toUpperCase())}
                  inputMode="text"
                  autoComplete="off"
                  aria-invalid={lookupState.error ? "true" : "false"}
                />
                <button type="button" onClick={handleLookup} disabled={lookupState.loading}>
                  {lookupState.loading ? "Checking DVLA…" : "Lookup"}
                </button>
              </div>

              {lookupState.error ? <div className="error">{lookupState.error}</div> : null}
              {showManualSuggestion ? (
                <div className="vehSuggest">
                  <div className="vehSuggestText">
                    Prefer? You can enter the vehicle manually.
                  </div>
                  <button
                    type="button"
                    className="btn btnVeh"
                    onClick={() => {
                      setVehicleField("registration", normalizeReg(reg));
                      setMode("manual");
                    }}
                  >
                    Switch to manual entry
                  </button>
                </div>
              ) : null}
            </div>

            {dvlaVehicle ? (
              <div className="vehicle-card">
                <div className="vehicle-reg">
                  {dvlaVehicle.registrationNumber ?? normalizeReg(reg)}
                </div>

                <div className="vehicle-grid">
                  <Detail icon="make" label="Make" value={dvlaVehicle.make ?? "—"} />
                  <Detail icon="colour" label="Colour" value={dvlaVehicle.colour ?? "—"} />
                  <Detail icon="fuel" label="Fuel" value={titleCaseFuel(dvlaVehicle.fuelType) || "—"} />
                  <Detail icon="year" label="Year" value={dvlaVehicle.yearOfManufacture ?? "—"} />
                  <Detail
                    icon="engine"
                    label="Engine"
                    value={dvlaVehicle.engineCapacity ? `${dvlaVehicle.engineCapacity} cc` : "—"}
                  />
                  <Detail icon="mot" label="MOT" value={dvlaVehicle.motStatus ?? "—"} />
                  <Detail icon="tax" label="Tax" value={dvlaVehicle.taxStatus ?? "—"} />
                  <Detail
                    icon="co2"
                    label="CO2"
                    value={dvlaVehicle.co2Emissions ? `${dvlaVehicle.co2Emissions} g/km` : "—"}
                  />
                </div>

                <div className="vehicle-actions">
                  <button type="button" className="btn btnVeh" onClick={handleChangeVehicle}>
                    Clear DVLA result
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className={["vehPanel", mode === "manual" ? "isActive" : ""].join(" ")}>
        {mode === "manual" ? (
          <div className="vehManualCard">
            <div className="vehManualTitle">Vehicle details</div>
            <div className="grid" style={{ marginTop: 12 }}>
              <div className="col6">
                <Field id="vehMake" label="Make" error={manualErrors.make}>
                  <input
                    id="vehMake"
                    className={["input", manualErrors.make ? "isInvalid" : ""].join(" ")}
                    value={vehicle.make}
                    onChange={(e) => setVehicleField("make", e.target.value)}
                    placeholder="e.g. Vauxhall"
                  />
                </Field>
              </div>

              <div className="col6">
                <Field id="vehModel" label="Model" error={manualErrors.model}>
                  <input
                    id="vehModel"
                    className={["input", manualErrors.model ? "isInvalid" : ""].join(" ")}
                    value={vehicle.model}
                    onChange={(e) => setVehicleField("model", e.target.value)}
                    placeholder="e.g. Astra"
                  />
                </Field>
              </div>

              <div className="col6">
                <Field id="vehYear" label="Year" error={manualErrors.year}>
                  <input
                    id="vehYear"
                    className={["input", manualErrors.year ? "isInvalid" : ""].join(" ")}
                    value={vehicle.year}
                    onChange={(e) => setVehicleField("year", e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                    placeholder="e.g. 2017"
                    inputMode="numeric"
                  />
                </Field>
              </div>

              <div className="col6">
                <Field id="vehEngine" label="Engine size">
                  <input
                    id="vehEngine"
                    className="input"
                    value={vehicle.engine}
                    onChange={(e) => setVehicleField("engine", e.target.value)}
                    placeholder="e.g. 1364 (cc) or 1.4"
                  />
                </Field>
              </div>

              <div className="col6">
                <Field id="vehFuel" label="Fuel type">
                  <select
                    id="vehFuel"
                    className="input"
                    value={vehicle.fuel}
                    onChange={(e) => setVehicleField("fuel", e.target.value)}
                  >
                    {fuelOptions.map((opt) => (
                      <option key={opt || "blank"} value={opt}>
                        {opt ? opt : "Select fuel type…"}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="col6">
                <Field id="vehReg" label="Registration (optional)">
                  <input
                    id="vehReg"
                    className="input"
                    value={vehicle.registration}
                    onChange={(e) => setVehicleField("registration", e.target.value.toUpperCase())}
                    placeholder="e.g. YA17NXC"
                  />
                </Field>
              </div>

              <div className="col12">
                <Field id="vehVin" label="VIN (optional)">
                  <input
                    id="vehVin"
                    className="input"
                    value={vehicle.vin}
                    onChange={(e) => setVehicleField("vin", e.target.value.toUpperCase())}
                    placeholder="e.g. W0L0... (17 characters)"
                  />
                </Field>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="footerBar">
        <div className="footerLeft">
          <button type="button" className="btn btnGhost" onClick={onSave}>
            Save progress
          </button>
          {toast ? <span className="toast">{toast}</span> : null}
        </div>
        <div className="actions">
          <button type="button" className="btn btnGhost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btnPrimary" onClick={confirmVehicle} disabled={!canConfirm}>
            Confirm Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

