import nodemailer from "nodemailer";
import {
  buildIntakeAttachments,
  formatIntakeEmail,
  sanitizeFormDataForTransport
} from "./intake-email.js";

export function getIntakeRecipient(env = process.env) {
  const garage = (env.GARAGE_EMAIL ?? "").toString().trim();
  const user = (env.EMAIL_USER ?? "").toString().trim();
  return garage || user;
}

export function getRecipientSource(env = process.env) {
  const garage = (env.GARAGE_EMAIL ?? "").toString().trim();
  return garage ? "GARAGE_EMAIL" : "EMAIL_USER";
}

export function isEmailConfigured(env = process.env) {
  const user = (env.EMAIL_USER ?? "").toString().trim();
  const pass = env.EMAIL_PASS;
  const hasSmtp =
    Boolean(user) && Boolean(pass) && pass !== "YOUR_APP_PASSWORD";
  return hasSmtp && Boolean(getIntakeRecipient(env));
}

export async function sendIntakeEmail(formData, env = process.env) {
  const user = (env.EMAIL_USER ?? "").toString().trim();
  const pass = env.EMAIL_PASS;
  const to = getIntakeRecipient(env);
  const recipientSource = getRecipientSource(env);

  if (!user || !pass || pass === "YOUR_APP_PASSWORD") {
    throw new Error("SMTP credentials not configured (EMAIL_USER and EMAIL_PASS).");
  }

  if (!to) {
    throw new Error("Recipient not configured (set GARAGE_EMAIL or EMAIL_USER).");
  }

  const safeForm = sanitizeFormDataForTransport(formData);
  const { text, subjectReg, hasSignature } = formatIntakeEmail(safeForm);
  const attachments = buildIntakeAttachments(safeForm);
  const subject = `New Intake - ${subjectReg}`;

  const attachmentBytes = attachments.reduce(
    (sum, a) => sum + (a.content?.length ?? 0),
    0
  );

  console.log("[email] sending via Gmail SMTP", {
    registration: subjectReg,
    recipientSource,
    textBytes: Buffer.byteLength(text, "utf8"),
    attachmentCount: attachments.length,
    attachmentBytes,
    signatureAttached: hasSignature && attachments.length > 0
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass }
  });

  const info = await transporter.sendMail({
    from: `"ISMintakeforms" <${user}>`,
    to,
    subject,
    text,
    attachments
  });

  console.log("[email] sent successfully", {
    registration: subjectReg,
    messageId: info.messageId || "(unknown)"
  });

  return info;
}
