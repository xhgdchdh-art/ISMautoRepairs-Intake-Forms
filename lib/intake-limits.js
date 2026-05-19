/** Max total JSON body size for POST /api/send-intake */
export const MAX_PAYLOAD_BYTES = 450_000;

/** Max signature data URL size in the submitted JSON */
export const MAX_SIGNATURE_DATA_URL_BYTES = 120_000;

/** Max signature attachment sent via email */
export const MAX_SIGNATURE_ATTACHMENT_BYTES = 80_000;

/** Max length for long text fields in the email body */
export const MAX_EMAIL_TEXT_FIELD_CHARS = 600;
