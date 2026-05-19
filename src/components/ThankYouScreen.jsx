export default function ThankYouScreen({ registration, submittedAt }) {
  const dt = submittedAt ? new Date(submittedAt) : null;
  const dateText = dt && Number.isFinite(dt.getTime()) ? dt.toLocaleString() : null;

  const canClose = typeof window !== "undefined" && typeof window.close === "function";

  return (
    <div className="page">
      <div className="shell">
        <div className="thankYouWrap">
          <div className="thankYouCard">
            <div className="thankYouTitle">Thank You for Choosing ISM Auto Repairs</div>
            <div className="thankYouMsg">
              <div>Your request has been successfully submitted.</div>
              <div>You may now close this window.</div>
              <div>We will contact you as soon as possible.</div>
            </div>

            {(registration || dateText) ? (
              <div className="thankYouMeta">
                {registration ? (
                  <div className="thankYouMetaRow">
                    <div className="thankYouMetaLabel">Vehicle</div>
                    <div className="thankYouMetaValue">{registration}</div>
                  </div>
                ) : null}
                {dateText ? (
                  <div className="thankYouMetaRow">
                    <div className="thankYouMetaLabel">Submitted</div>
                    <div className="thankYouMetaValue">{dateText}</div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="thankYouActions">
              {canClose ? (
                <button
                  type="button"
                  className="btn btnPrimary"
                  onClick={() => window.close()}
                >
                  Close Window
                </button>
              ) : (
                <div className="thankYouHint">You can safely close this tab.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

