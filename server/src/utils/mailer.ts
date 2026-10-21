// server/src/utils/mailer.ts
//
// All outgoing email goes through here. SMTP settings come from EMAIL_* env
// vars (Brevo by default); links point at CLIENT_URL.
import nodemailer from "nodemailer";

function createTransporter() {
  const port = Number(process.env.EMAIL_PORT || 587);

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp-relay.brevo.com",
    port,
    secure: port === 465,
    // Fail fast instead of hanging the request (and the serverless function)
    // when the SMTP relay is unreachable or slow.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

function clientUrl(): string {
  return (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(paragraphs: string[], action?: { url: string; label: string }) {
  const button = action
    ? `
        <p>
          <a href="${action.url}" style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
            ${action.label}
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p><a href="${action.url}">${action.url}</a></p>`
    : "";

  return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222;">
        ${paragraphs.map((p) => `<p>${p}</p>`).join("\n        ")}
        ${button}
      </div>
    `;
}

async function send(to: string, subject: string, html: string) {
  await createTransporter().sendMail({
    from: `"${process.env.EMAIL_FROM_NAME || "CARPATH"}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  userId: string
) {
  const url = `${clientUrl()}/verify-email?token=${token}&id=${userId}`;
  await send(
    email,
    "Verify your email",
    layout(
      [
        "Hi,",
        "Thank you for registering. Please click the button below to verify your email:"
      ],
      { url, label: "Verify Email" }
    ) + "<p>This link will expire in 24 hours.</p>"
  );
}

export async function sendAdminSetupEmail(
  email: string,
  token: string,
  userId: string
) {
  const url = `${clientUrl()}/admin/setup-password?token=${token}&id=${userId}`;
  await send(
    email,
    "Set up your admin account password",
    layout(
      [
        "Hello,",
        "An administrator account has been created for you in CAREER PATH.",
        "Please click the button below to set your password:"
      ],
      { url, label: "Set Password" }
    ) + "<p>This link will expire in 24 hours.</p>"
  );
}

// Used for "forgot password" and for student accounts created by an admin.
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  userId: string,
  reason: "reset" | "new-account"
) {
  const url = `${clientUrl()}/reset-password?token=${token}&id=${userId}`;
  const isNew = reason === "new-account";
  await send(
    email,
    isNew ? "Your CAREER PATH student account" : "Reset your CAREER PATH password",
    layout(
      isNew
        ? [
            "Hello,",
            "Your school created a CAREER PATH student account for you.",
            "Please click the button below to choose your password:"
          ]
        : [
            "Hello,",
            "We received a request to reset your CAREER PATH password.",
            "If you did not ask for this, you can ignore this email."
          ],
      { url, label: isNew ? "Choose Password" : "Reset Password" }
    ) + `<p>This link will expire in ${isNew ? "24 hours" : "1 hour"}.</p>`
  );
}

export async function sendQueryAnsweredEmail(email: string, subject: string) {
  await send(
    email,
    "Your counselor answered your question",
    layout(
      [
        "Hello,",
        `A counselor has replied to your question: <strong>${escapeHtml(subject)}</strong>.`,
        "Log in to CAREER PATH and open My Queries to read the answer."
      ],
      { url: `${clientUrl()}/student/queries`, label: "Open My Queries" }
    )
  );
}
