import { useEffect, useMemo, useState } from "react";
import CustomerDetailsStep from "./steps/CustomerDetailsStep.jsx";
import VehicleDetailsStep from "./steps/VehicleDetailsStep.jsx";
import FaultDetailsStep from "./steps/FaultDetailsStep.jsx";
import ServiceRequirementsStep from "./steps/ServiceRequirementsStep.jsx";
import ConsentStep from "./steps/ConsentStep.jsx";
import ThankYouScreen from "./ThankYouScreen.jsx";
import { validateIntakePayload } from "../../lib/intake-payload.js";

const STORAGE_KEY = "ism_intake_form_v1";

function safeParse(json) {
  try {
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const emptyForm = {
  customer: {
    firstName: "",
    surname: "",
    fullName: "",
    phone: "",
    email: "",
    address: "",
    heardAbout: ""
  },
  vehicle: {},
  fault: {},
  service: {},
  consent: {}
};

function validateCustomer(customer) {
  const errors = {};
  const firstName = (customer.firstName ?? "").trim();
  const surname = (customer.surname ?? "").trim();
  const fullName = (customer.fullName ?? "").trim();
  const phone = (customer.phone ?? "").trim();
  const email = (customer.email ?? "").trim();
  const address = (customer.address ?? "").trim();

  if (!firstName) errors.firstName = "First name is required.";
  if (!surname) errors.surname = "Surname is required.";
  if (!fullName) errors.fullName = "Full name is required.";
  if (!phone) errors.phone = "Phone number is required.";
  if (!address) errors.address = "Home address is required.";

  if (email) {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!ok) errors.email = "Enter a valid email address.";
  } else {
    errors.email = "Email address is required.";
  }

  return errors;
}

function validateVehicle(vehicle) {
  const v = vehicle ?? {};
  const errors = {};
  if (!(v.make ?? "").toString().trim()) errors.make = "Make is required.";
  if (!(v.model ?? "").toString().trim()) errors.model = "Model is required.";
  if (!(v.year ?? "").toString().trim()) errors.year = "Year is required.";
  return errors;
}

export default function IntakeForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState("");
  const [errors, setErrors] = useState({});
  const [submission, setSubmission] = useState(null);
  const [sendState, setSendState] = useState({ loading: false, error: "" });

  const [formData, setFormData] = useState(() => {
    const saved = safeParse(localStorage.getItem(STORAGE_KEY) ?? "");
    if (!saved || typeof saved !== "object") return emptyForm;
    return {
      ...emptyForm,
      ...saved,
      customer: { ...emptyForm.customer, ...(saved.customer ?? {}) }
    };
  });

  const steps = useMemo(
    () => [
      { key: "customer", label: "Customer Details" },
      { key: "vehicle", label: "Vehicle Details" },
      { key: "fault", label: "Fault / Issue Details" },
      { key: "service", label: "Service Requirements" },
      { key: "consent", label: "Review & Sign" }
    ],
    []
  );

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  function saveProgress() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    setToast("Progress saved to this device.");
  }

  function clearSaved() {
    localStorage.removeItem(STORAGE_KEY);
    setToast("Saved progress cleared.");
  }

  function setCustomerField(field, value) {
    setFormData((prev) => {
      const prevCustomer = prev.customer ?? emptyForm.customer;
      const prevAuto = `${(prevCustomer.firstName ?? "").trim()} ${(prevCustomer.surname ?? "").trim()}`.trim();
      const nextCustomer = { ...prevCustomer, [field]: value };

      if (field === "firstName" || field === "surname") {
        const nextAuto = `${(nextCustomer.firstName ?? "").trim()} ${(nextCustomer.surname ?? "").trim()}`.trim();
        const fullNameNow = (prevCustomer.fullName ?? "").trim();
        const fullNameWasAuto = !fullNameNow || fullNameNow === prevAuto;
        if (fullNameWasAuto) nextCustomer.fullName = nextAuto;
      }

      return { ...prev, customer: nextCustomer };
    });
  }

  function goBack() {
    setErrors({});
    setCurrentStep((s) => Math.max(0, s - 1));
  }

  function goNext() {
    setErrors({});

    if (currentStep === 0) {
      const e = validateCustomer(formData.customer);
      if (Object.keys(e).length) {
        setErrors(e);
        setToast("Fix the highlighted fields to continue.");
        return;
      }
    }

    setCurrentStep((s) => Math.min(steps.length - 1, s + 1));
  }

  async function handleFinalSubmit() {
    setErrors({});
    setSendState({ loading: false, error: "" });
    const e1 = validateCustomer(formData.customer);
    const e2 = validateVehicle(formData.vehicle);
    if (Object.keys(e1).length || Object.keys(e2).length) {
      setErrors({ ...e1, ...e2 });
      setToast("Please review your details before submitting.");
      return;
    }

    const submittedAt = new Date().toISOString();
    const reg = (formData.vehicle?.registration ?? "").toString().trim();
    setSendState({ loading: true, error: "" });

    const payload = { ...formData, submittedAt };
    const payloadCheck = validateIntakePayload(payload);
    if (!payloadCheck.ok) {
      setSendState({ loading: false, error: payloadCheck.error });
      return;
    }

    try {
      const response = await fetch("/api/send-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        let msg = "Failed to send. Please try again.";
        try {
          const body = await response.json();
          msg = body?.error || msg;
          if (body?.details) msg = `${msg} (${body.details})`;
        } catch {
          // ignore
        }
        setSendState({ loading: false, error: msg });
        return;
      }

      saveProgress();
      setSendState({ loading: false, error: "" });
      setSubmission({ submittedAt, registration: reg });
    } catch {
      setSendState({ loading: false, error: "Failed to send. Please try again." });
    }
  }

  const stepLabel = steps[currentStep]?.label ?? "Intake";

  if (submission) {
    return (
      <ThankYouScreen
        registration={submission.registration}
        submittedAt={submission.submittedAt}
      />
    );
  }

  return (
    <div className="page">
      <div className="shell">
        <div className="brandRow">
          <div className="brand">
            <div className="brandTitle">ISMintakeforms</div>
            <div className="brandSub">Garage intake &amp; inspection platform</div>
          </div>
          <div className="chip">
            Step {currentStep + 1} / {steps.length}
          </div>
        </div>

        <div className="card">
          <div className="cardInner">
            <div className="stepHeader">
              <div className="stepTitle">
                <h1>{stepLabel}</h1>
                <p>Complete each step, then review and submit.</p>
              </div>

              <div className="steps" aria-label="Step indicator">
                {steps.map((s, idx) => (
                  <div
                    key={s.key}
                    className={[
                      "stepPill",
                      idx === currentStep ? "isActive" : "",
                      idx < currentStep ? "isDone" : ""
                    ].join(" ")}
                    title={s.label}
                  >
                    <span className="stepDot" aria-hidden="true" />
                    <span>{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {currentStep === 0 && (
              <CustomerDetailsStep
                data={formData.customer}
                errors={errors}
                onFieldChange={setCustomerField}
                onNext={goNext}
                onBack={null}
                onSave={saveProgress}
                toast={toast}
              />
            )}

            {currentStep === 1 && (
              <VehicleDetailsStep
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onBack={goBack}
                onSave={saveProgress}
                toast={toast}
              />
            )}

            {currentStep === 2 && (
              <FaultDetailsStep
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onBack={goBack}
                onSave={saveProgress}
                toast={toast}
              />
            )}

            {currentStep === 3 && (
              <ServiceRequirementsStep
                formData={formData}
                setFormData={setFormData}
                onNext={goNext}
                onBack={goBack}
                onSave={saveProgress}
                toast={toast}
              />
            )}

            {currentStep === 4 && (
              <ConsentStep
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleFinalSubmit}
                onBack={goBack}
                onSave={saveProgress}
                toast={toast}
                sendState={sendState}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

