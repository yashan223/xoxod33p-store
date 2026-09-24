const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// Resend returns the useful part (e.g. an unverified sender domain) in the body, not the status.
async function resendFailure(response: Response) {
  const detail = await response.text().catch(() => "");
  return new Error(
    `Resend request failed with status ${response.status}${detail ? `: ${detail.slice(0, 300)}` : "."}`,
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function sendVerificationEmail(input: {
  email: string;
  firstName?: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL are required.");

  const verificationUrl = `${appUrl}/api/auth/verify?token=${encodeURIComponent(input.token)}`;
  const greeting = input.firstName ? `Hi ${escapeHtml(input.firstName)},` : "Hi there,";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Verify your xoxod33p store email",
      html: `<p>${greeting}</p><p>Verify your xoxod33p store account by clicking the link below:</p><p><a href="${verificationUrl}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw await resendFailure(response);
}

export async function sendPasswordResetEmail(input: {
  email: string;
  firstName?: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("RESEND_API_KEY and RESEND_FROM_EMAIL are required.");

  const resetUrl = `${appUrl}/reset-password?token=${encodeURIComponent(input.token)}`;
  const greeting = input.firstName ? `Hi ${escapeHtml(input.firstName)},` : "Hi there,";
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: "Reset your xoxod33p store password",
      html: `<p>${greeting}</p><p>Reset your xoxod33p store password using the link below:</p><p><a href="${resetUrl}">Reset my password</a></p><p>This link expires in 1 hour.</p>`,
    }),
    cache: "no-store",
  });

  if (!response.ok) throw await resendFailure(response);
}
