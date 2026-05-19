import { useMemo } from "react";

const EMPTY_SERVICE = {
  authorisation: "",
  spendingLimit: "",
  requestedServices: [],
  urgency: "",
  notes: ""
};

function Section({ title, subtitle, children }) {
  return (
    <div className="diagPanel">
      <div className="diagHeader">
        <div className="diagTitle">{title}</div>
        {subtitle ? <div className="diagSub">{subtitle}</div> : null}
      </div>
      <div className="diagBody">{children}</div>
    </div>
  );
}

function Pills({ value, options, onChange, multi = false }) {
  const selected = useMemo(() => {
    if (multi) return new Set(Array.isArray(value) ? value : []);
    return new Set(value ? [value] : []);
  }, [value, multi]);

  const toggle = (opt) => {
    if (!multi) {
      onChange(opt);
      return;
    }
    const next = new Set(selected);
    if (next.has(opt)) next.delete(opt);
    else next.add(opt);
    onChange(Array.from(next));
  };

  return (
    <div className="pillGrid" role={multi ? "group" : "radiogroup"}>
      {options.map((opt) => {
        const isOn = selected.has(opt);
        return (
          <button
            key={opt}
            type="button"
            className={["pill", isOn ? "isActive" : ""].join(" ")}
            onClick={() => toggle(opt)}
            role={multi ? "button" : "radio"}
            aria-checked={multi ? undefined : isOn}
            aria-pressed={multi ? isOn : undefined}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="assureIcon"
      aria-hidden="true"
    >
      <path
        d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12.2l2.1 2.1 4.9-5.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ServiceRequirementsStep({ formData, setFormData, onNext, onBack, onSave, toast }) {
  const service = useMemo(() => ({ ...EMPTY_SERVICE, ...(formData?.service ?? {}) }), [formData]);

  const setServiceField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      service: {
        ...EMPTY_SERVICE,
        ...(prev.service ?? {}),
        [field]: value
      }
    }));
  };

  const authoriseOptions = ["Diagnostic only", "Diagnostic + quote", "Proceed with agreed repairs"];
  const quickLimits = [50, 100, 200, 500];
  const requested = ["MOT", "Full service", "Diagnostics", "Repairs", "Parts supply", "Inspection"];
  const urgency = ["ASAP", "Within 1–2 days", "This week", "Flexible"];

  return (
    <div>
      <div className="diagPageTitle">
        <div className="diagPageH1">Work Authorisation</div>
        <div className="diagPageP">
          Please confirm what work we are authorised to carry out on your vehicle.
        </div>
      </div>

      <Section title="Authorisation options" subtitle="Authorise us to:">
        <Pills
          value={service.authorisation}
          options={authoriseOptions}
          onChange={(v) => setServiceField("authorisation", v)}
        />
      </Section>

      <Section
        title="Spending approval limit"
        subtitle="Contact me if the final cost exceeds the agreed amount by more than:"
      >
        <div className="moneyRow">
          <div className="moneyInputWrap">
            <span className="moneyPrefix">£</span>
            <input
              className="moneyInput"
              value={service.spendingLimit}
              onChange={(e) =>
                setServiceField("spendingLimit", e.target.value.replace(/[^\d]/g, "").slice(0, 6))
              }
              placeholder="0"
              inputMode="numeric"
              aria-label="Spending approval limit"
            />
          </div>
          <div className="quickMoney">
            {quickLimits.map((amt) => (
              <button
                key={amt}
                type="button"
                className={["pill", service.spendingLimit === String(amt) ? "isActive" : ""].join(
                  " "
                )}
                onClick={() => setServiceField("spendingLimit", String(amt))}
              >
                £{amt}
              </button>
            ))}
          </div>
        </div>

        <div className="assureBox">
          <ShieldIcon />
          <div className="assureText">
            <div className="assureTitle">Our promise</div>
            <div className="assureBody">
              We will never carry out work beyond your authorised limit without your explicit
              approval.
            </div>
          </div>
        </div>
      </Section>

      <Section title="Requested services (optional)">
        <Pills
          value={service.requestedServices}
          options={requested}
          onChange={(v) => setServiceField("requestedServices", v)}
          multi
        />
      </Section>

      <Section title="Urgency / timing" subtitle="When do you need the vehicle ready?">
        <Pills value={service.urgency} options={urgency} onChange={(v) => setServiceField("urgency", v)} />
      </Section>

      <Section title="Notes">
        <label className="diagLabel" htmlFor="serviceNotes">
          Additional notes
        </label>
        <textarea
          id="serviceNotes"
          className="diagTextarea"
          value={service.notes}
          onChange={(e) => setServiceField("notes", e.target.value)}
          placeholder="Any specific instructions, budget concerns, or priorities…"
          rows={4}
        />
      </Section>

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
          <button type="button" className="btn btnPrimary" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

