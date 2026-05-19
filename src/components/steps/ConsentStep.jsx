import { useEffect, useMemo, useRef, useState } from "react";
import { exportSignatureFromCanvas } from "../../lib/signature-export.js";

const EMPTY_CONSENT = {
  acceptedTerms: false,
  marketingConsent: false,
  signatureDataUrl: ""
};

function Section({ title, children }) {
  return (
    <div className="reviewCard">
      <div className="reviewCardTitle">{title}</div>
      <div className="reviewCardBody">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="reviewRow">
      <div className="reviewLabel">{label}</div>
      <div className="reviewValue">{value || "—"}</div>
    </div>
  );
}

function joinList(value) {
  const arr = Array.isArray(value) ? value.filter(Boolean) : [];
  return arr.length ? arr.join(", ") : "—";
}

export default function ConsentStep({
  formData,
  setFormData,
  onSubmit,
  onBack,
  onSave,
  toast,
  sendState
}) {
  const consent = useMemo(
    () => ({ ...EMPTY_CONSENT, ...(formData?.consent ?? {}) }),
    [formData]
  );

  const setConsentField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      consent: {
        ...EMPTY_CONSENT,
        ...(prev.consent ?? {}),
        [field]: value
      }
    }));
  };

  const [error, setError] = useState("");

  const canvasRef = useRef(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef({ x: 0, y: 0 });

  const signatureIsEmpty = !consent.signatureDataUrl;

  const customer = formData?.customer ?? {};
  const vehicle = formData?.vehicle ?? {};
  const fault = formData?.fault ?? {};

  const ensureCanvasDpi = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const targetW = Math.round(rect.width * dpr);
    const targetH = Math.round(rect.height * dpr);
    if (canvas.width === targetW && canvas.height === targetH) return;

    const ctx = canvas.getContext("2d");
    const prev = consent.signatureDataUrl;

    canvas.width = targetW;
    canvas.height = targetH;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "rgba(255,255,255,0.92)";

    if (prev) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, rect.width, rect.height);
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
      };
      img.src = prev;
    }
  };

  useEffect(() => {
    ensureCanvasDpi();
    const onResize = () => ensureCanvasDpi();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPoint = (ev) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
  };

  const begin = (ev) => {
    setError("");
    ensureCanvasDpi();
    drawingRef.current = true;
    lastPointRef.current = getPoint(ev);
  };

  const move = (ev) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = getPoint(ev);
    const last = lastPointRef.current;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    lastPointRef.current = p;
  };

  const end = () => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    const dataUrl = exportSignatureFromCanvas(canvas);
    setConsentField("signatureDataUrl", dataUrl);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setConsentField("signatureDataUrl", "");
    setError("");
  };

  const validateAndSubmit = () => {
    if (!consent.acceptedTerms) {
      setError("Please accept the Terms & Conditions to continue.");
      return;
    }
    if (signatureIsEmpty) {
      setError("Signature is required to continue.");
      return;
    }
    setError("");
    onSubmit();
  };

  return (
    <div>
      <div className="diagPageTitle">
        <div className="diagPageH1">Review & Sign</div>
        <div className="diagPageP">Please review your details and sign to authorise the work.</div>
      </div>

      <div className="reviewGrid">
        <Section title="Customer Details">
          <Row label="Full name" value={customer.fullName} />
          <Row label="Phone" value={customer.phone} />
          <Row label="Email" value={customer.email} />
          <Row label="Address" value={customer.address} />
          <Row label="Heard about us" value={customer.heardAbout} />
        </Section>

        <Section title="Vehicle Details">
          <Row label="Registration" value={vehicle.registration} />
          <Row label="Make" value={vehicle.make} />
          <Row label="Model" value={vehicle.model} />
          <Row label="Year" value={vehicle.year} />
          <Row label="Fuel" value={vehicle.fuel} />
          <Row label="Engine" value={vehicle.engine} />
          <Row label="VIN" value={vehicle.vin} />
        </Section>

        <Section title="Reported Problem">
          <Row label="Description" value={fault.description} />
          <Row label="When it occurs" value={joinList(fault.whenOccurs)} />
          <Row label="Duration" value={fault.duration} />
          <Row label="Warning lights" value={fault.warningLights} />
        </Section>

        <Section title="Customer Signature">
          <div className="sigWrap">
            <div className="sigTop">
              <div className="sigHelp">Sign above using your finger, mouse, or stylus</div>
              <button type="button" className="btn btnVeh" onClick={clearSignature}>
                Clear
              </button>
            </div>
            <div className={["sigBox", error && signatureIsEmpty ? "isInvalid" : ""].join(" ")}>
              <canvas
                ref={canvasRef}
                className="sigCanvas"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  begin(e);
                }}
                onPointerMove={move}
                onPointerUp={end}
                onPointerCancel={end}
              />
            </div>
          </div>

          <div className="checkStack">
            <label className={["checkRow", error && !consent.acceptedTerms ? "isInvalid" : ""].join(" ")}>
              <input
                type="checkbox"
                checked={!!consent.acceptedTerms}
                onChange={(e) => setConsentField("acceptedTerms", e.target.checked)}
              />
              <span>
                I confirm I have read and accept the{" "}
                <a className="termsLink" href="#" onClick={(e) => e.preventDefault()}>
                  Terms &amp; Conditions
                </a>{" "}
                of ISM Auto Repairs
              </span>
            </label>
            <div className="checkNote">A copy of this form will be sent to your email.</div>

            <label className="checkRow">
              <input
                type="checkbox"
                checked={!!consent.marketingConsent}
                onChange={(e) => setConsentField("marketingConsent", e.target.checked)}
              />
              <span>I’m happy to receive updates and offers from ISM Auto Repairs</span>
            </label>
            <div className="checkNote">Optional. You can unsubscribe at any time.</div>
          </div>

          {error ? <div className="formError">{error}</div> : null}
          {sendState?.error ? <div className="formError">{sendState.error}</div> : null}
        </Section>
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
          <button
            type="button"
            className="btn btnPrimary"
            onClick={validateAndSubmit}
            disabled={!!sendState?.loading}
          >
            {sendState?.loading ? "Sending…" : "Submit / Finish"}
          </button>
        </div>
      </div>
    </div>
  );
}

