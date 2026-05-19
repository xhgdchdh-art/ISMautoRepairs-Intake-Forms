export default function ReviewSubmitStep({ formData, onBack, onSave, onClearSaved, toast }) {
  return (
    <div>
      <div className="placeholder" style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Review & Submit (placeholder)</div>
        This is where you’ll show a final summary, capture signature if needed, and submit to your backend.
      </div>

      <div className="placeholder">
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Current form payload</div>
        <pre className="mono" style={{ margin: 0, whiteSpace: "pre-wrap" }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      <div className="footerBar">
        <div className="footerLeft">
          <button type="button" className="btn btnGhost" onClick={onSave}>
            Save progress
          </button>
          <button type="button" className="btn btnDanger" onClick={onClearSaved}>
            Clear saved
          </button>
          {toast ? <span className="toast">{toast}</span> : null}
        </div>
        <div className="actions">
          <button type="button" className="btn btnGhost" onClick={onBack}>
            Back
          </button>
          <button type="button" className="btn btnPrimary" disabled>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

