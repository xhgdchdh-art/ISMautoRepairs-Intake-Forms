const HEARD_OPTIONS = [
  "Google",
  "Facebook",
  "Instagram",
  "Friend / Family",
  "Returning customer",
  "Passing by",
  "Other"
];

function Field({
  id,
  label,
  hint,
  error,
  children
}) {
  return (
    <div className="field">
      <div className="labelRow">
        <label htmlFor={id}>{label}</label>
        {hint ? <span className="hint">{hint}</span> : null}
      </div>
      {children}
      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}

export default function CustomerDetailsStep({
  data,
  errors,
  onFieldChange,
  onNext,
  onBack,
  onSave,
  toast
}) {
  const d = data ?? {};
  const e = errors ?? {};

  return (
    <div>
      <div className="grid">
        <div className="col6">
          <Field id="firstName" label="First name" error={e.firstName} hint="Required">
            <input
              id="firstName"
              className={["input", e.firstName ? "isInvalid" : ""].join(" ")}
              value={d.firstName ?? ""}
              onChange={(ev) => onFieldChange("firstName", ev.target.value)}
              placeholder="e.g. Ahmed"
              autoComplete="given-name"
            />
          </Field>
        </div>

        <div className="col6">
          <Field id="surname" label="Surname" error={e.surname} hint="Required">
            <input
              id="surname"
              className={["input", e.surname ? "isInvalid" : ""].join(" ")}
              value={d.surname ?? ""}
              onChange={(ev) => onFieldChange("surname", ev.target.value)}
              placeholder="e.g. Khan"
              autoComplete="family-name"
            />
          </Field>
        </div>

        <div className="col12">
          <Field id="fullName" label="Full name" error={e.fullName} hint="Required">
            <input
              id="fullName"
              className={["input", e.fullName ? "isInvalid" : ""].join(" ")}
              value={d.fullName ?? ""}
              onChange={(ev) => onFieldChange("fullName", ev.target.value)}
              placeholder="e.g. Ahmed Khan"
              autoComplete="name"
            />
          </Field>
        </div>

        <div className="col6">
          <Field id="phone" label="Phone number" error={e.phone} hint="Required">
            <input
              id="phone"
              className={["input", e.phone ? "isInvalid" : ""].join(" ")}
              value={d.phone ?? ""}
              onChange={(ev) => onFieldChange("phone", ev.target.value)}
              placeholder="e.g. 07xxx xxxxxx"
              autoComplete="tel"
              inputMode="tel"
            />
          </Field>
        </div>

        <div className="col6">
          <Field id="email" label="Email address" error={e.email} hint="Required">
            <input
              id="email"
              className={["input", e.email ? "isInvalid" : ""].join(" ")}
              value={d.email ?? ""}
              onChange={(ev) => onFieldChange("email", ev.target.value)}
              placeholder="e.g. name@email.com"
              autoComplete="email"
              inputMode="email"
            />
          </Field>
        </div>

        <div className="col12">
          <Field id="address" label="Home address" error={e.address} hint="Required">
            <input
              id="address"
              className={["input", e.address ? "isInvalid" : ""].join(" ")}
              value={d.address ?? ""}
              onChange={(ev) => onFieldChange("address", ev.target.value)}
              placeholder="Street, city, postcode"
              autoComplete="street-address"
            />
          </Field>
        </div>

        <div className="col12">
          <Field
            id="heardAbout"
            label="Where did you hear about us?"
            hint="Optional"
            error={e.heardAbout}
          >
            <select
              id="heardAbout"
              className={["input", e.heardAbout ? "isInvalid" : ""].join(" ")}
              value={d.heardAbout ?? ""}
              onChange={(ev) => onFieldChange("heardAbout", ev.target.value)}
            >
              <option value="" disabled>
                Select an option…
              </option>
              {HEARD_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </div>

      <div className="footerBar">
        <div className="footerLeft">
          <button type="button" className="btn btnGhost" onClick={onSave}>
            Save progress
          </button>
          <span className="saveNote">Saved locally on this device.</span>
          {toast ? <span className="toast">{toast}</span> : null}
        </div>

        <div className="actions">
          {onBack ? (
            <button type="button" className="btn btnGhost" onClick={onBack}>
              Back
            </button>
          ) : null}
          <button type="button" className="btn btnPrimary" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

