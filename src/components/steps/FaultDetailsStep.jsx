import { useMemo } from "react";

const EMPTY_FAULT = {
  description: "",
  whenOccurs: [],
  duration: "",
  warningLights: "",
  lightsReset: "",
  lastService: "",
  damageNotes: "",
  recentWork: ""
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

function Field({ id, label, children }) {
  return (
    <div className="diagField">
      <label className="diagLabel" htmlFor={id}>
        {label}
      </label>
      {children}
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

export default function FaultDetailsStep({ formData, setFormData, onNext, onBack, onSave, toast }) {
  const fault = useMemo(() => ({ ...EMPTY_FAULT, ...(formData?.fault ?? {}) }), [formData]);

  const setFaultField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      fault: {
        ...EMPTY_FAULT,
        ...(prev.fault ?? {}),
        [field]: value
      }
    }));
  };

  const whenOptions = [
    "Cold start",
    "Hot engine",
    "While braking",
    "While accelerating",
    "At low speed",
    "At motorway speed",
    "Turning",
    "Intermittent / random"
  ];

  const durationOptions = ["Today", "Few days", "Few weeks", "Several months", "Not sure"];

  const warningOptions = [
    "No lights",
    "Yellow / amber light",
    "Red light",
    "Multiple lights",
    "Not sure"
  ];

  const yesNoOptions = ["Yes", "No", "Not sure"];

  const serviceOptions = [
    "Within last year",
    "1–2 years ago",
    "Over 2 years ago",
    "Never / unknown"
  ];

  const recentWorkOptions = ["No", "Yes — another garage", "Yes — DIY", "Yes — ISM previously"];

  return (
    <div>
      <div className="diagPageTitle">
        <div className="diagPageH1">Fault / Issue Details</div>
        <div className="diagPageP">
          Help us understand the issue clearly so we can diagnose accurately.
        </div>
      </div>

      <Section title="Problem description">
        <Field id="faultDescription" label="Describe the problem">
          <textarea
            id="faultDescription"
            className="diagTextarea"
            value={fault.description}
            onChange={(e) => setFaultField("description", e.target.value)}
            placeholder="Tell us what you’ve noticed — noises, vibrations, warning lights, smells, or anything unusual."
            rows={5}
          />
        </Field>
      </Section>

      <Section title="When does it happen?" subtitle="Select all that apply.">
        <Pills
          value={fault.whenOccurs}
          options={whenOptions}
          onChange={(v) => setFaultField("whenOccurs", v)}
          multi
        />
      </Section>

      <Section title="How long has this been happening?">
        <Pills
          value={fault.duration}
          options={durationOptions}
          onChange={(v) => setFaultField("duration", v)}
        />
      </Section>

      <Section title="Warning lights">
        <Field id="warningLights" label="Are any warning lights currently on?">
          <Pills
            value={fault.warningLights}
            options={warningOptions}
            onChange={(v) => setFaultField("warningLights", v)}
          />
        </Field>
        <div className="divider" />
        <Field id="lightsReset" label="Have any warning lights been cleared recently?">
          <Pills
            value={fault.lightsReset}
            options={yesNoOptions}
            onChange={(v) => setFaultField("lightsReset", v)}
          />
        </Field>
      </Section>

      <Section title="Service history">
        <Field id="lastService" label="When was the vehicle last serviced?">
          <Pills
            value={fault.lastService}
            options={serviceOptions}
            onChange={(v) => setFaultField("lastService", v)}
          />
        </Field>
      </Section>

      <Section title="Condition notes">
        <Field id="damageNotes" label="Any known existing damage?">
          <textarea
            id="damageNotes"
            className="diagTextarea"
            value={fault.damageNotes}
            onChange={(e) => setFaultField("damageNotes", e.target.value)}
            placeholder="e.g. scratches, dents, previous accident damage, or write ‘None’"
            rows={3}
          />
        </Field>
      </Section>

      <Section title="Recent work">
        <Field id="recentWork" label="Has any work been carried out recently?">
          <Pills
            value={fault.recentWork}
            options={recentWorkOptions}
            onChange={(v) => setFaultField("recentWork", v)}
          />
        </Field>
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

