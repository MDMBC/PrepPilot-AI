import nodemailer from "nodemailer";

function requireSmtpConfig() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_HOST, SMTP_USER, and SMTP_PASS are required for real email sending.");
  }

  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  };
}

function createTransporter() {
  return nodemailer.createTransport(requireSmtpConfig());
}

export async function sendVerificationEmail(email: string, code: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/verify-email?token=${encodeURIComponent(code)}`;

  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "PrepPilot AI <no-reply@preppilot.local>",
    to: email,
    subject: "Verify your PrepPilot AI account",
    text: `Your PrepPilot AI verification code is ${code}. Enter this code to verify your registered email address. You can also verify here: ${url}`,
    html: `
      <p>Your PrepPilot AI verification code is:</p>
      <p style="font-size:24px;font-weight:700;letter-spacing:4px">${code}</p>
      <p>Enter this code to verify your registered email address.</p>
      <p>You can also verify with this link: <a href="${url}">${url}</a></p>
    `
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const url = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  const transporter = createTransporter();

  await transporter.sendMail({
    from: process.env.SMTP_FROM ?? "PrepPilot AI <no-reply@preppilot.local>",
    to: email,
    subject: "Reset your PrepPilot AI password",
    text: `Click this secure link to change your PrepPilot AI password: ${url}. This link expires in 1 hour.`,
    html: `
      <p>Click the button below to change your PrepPilot AI password.</p>
      <p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#20d6bf;color:#041016;text-decoration:none;font-weight:700;border-radius:8px">Change password</a></p>
      <p>Or copy and paste this link into your browser: <a href="${url}">${url}</a></p>
      <p>This link expires in 1 hour. If you did not request it, you can ignore this email.</p>
    `
  });
}
