import { Resend } from "resend";

let resend: Resend | null = null;

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "hello@pragmatech.ai";
const FROM_EMAIL = process.env.FROM_EMAIL || "PRAGMA <onboarding@resend.dev>";

export async function sendContactNotification(data: {
  name: string;
  email: string;
  company: string;
  message: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn("RESEND_API_KEY not set — skipping email notification");
    return;
  }

  await client.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New lead: ${data.name}${data.company ? ` (${data.company})` : ""}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ff; background: #0a0a0a; padding: 20px; border-radius: 8px 8px 0 0; margin: 0;">
          New Contact Form Submission
        </h2>
        <div style="padding: 20px; background: #111; border-radius: 0 0 8px 8px;">
          <p><strong>Name:</strong> ${escapeHtml(data.name)}</p>
          <p><strong>Email:</strong> <a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></p>
          ${data.company ? `<p><strong>Company:</strong> ${escapeHtml(data.company)}</p>` : ""}
          <hr style="border: 1px solid #333; margin: 16px 0;" />
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${escapeHtml(data.message)}</p>
        </div>
      </div>
    `,
  });
}

export async function sendQuoteToClient(data: {
  clientEmail: string;
  clientName: string;
  quoteTitle: string;
  quoteUrl: string;
}) {
  const client = getResend();
  if (!client) {
    console.warn("RESEND_API_KEY not set — skipping quote email");
    return;
  }

  await client.emails.send({
    from: FROM_EMAIL,
    to: data.clientEmail,
    subject: `Your quote from PRAGMA: ${data.quoteTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ff; background: #0a0a0a; padding: 20px; border-radius: 8px 8px 0 0; margin: 0;">
          PRAGMA
        </h2>
        <div style="padding: 20px; background: #111; border-radius: 0 0 8px 8px; color: #ccc;">
          <p>Hi ${escapeHtml(data.clientName)},</p>
          <p>Your quote <strong>"${escapeHtml(data.quoteTitle)}"</strong> is ready for review.</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${escapeHtml(data.quoteUrl)}"
               style="display: inline-block; background: #0ff; color: #000; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              View Quote
            </a>
          </div>
          <p style="color: #888; font-size: 14px;">If you have any questions, reply to this email or contact us directly.</p>
          <hr style="border: 1px solid #333; margin: 16px 0;" />
          <p style="color: #666; font-size: 12px;">PRAGMA | Pragmatic AI Solutions</p>
        </div>
      </div>
    `,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
