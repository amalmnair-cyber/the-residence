import "server-only";
import { Resend } from "resend";
import { site } from "@/data/content";
import { formatDate } from "@/lib/date";

interface BookingEmailInput {
  bookingId: string;
  propertyName: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  message?: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  totalAmount: number;
  currency: string;
}

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");
  return new Resend(apiKey);
}

function emailShell(bodyHtml: string) {
  return `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #14130f;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #a9895f;">${site.brand}</p>
      ${bodyHtml}
    </div>
  `;
}

function detailsTable(input: BookingEmailInput) {
  const dates = `${formatDate(input.checkIn)} – ${formatDate(input.checkOut)}`;
  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Dates</td><td style="padding: 6px 0;">${dates} (${input.nights} nights)</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Guests</td><td style="padding: 6px 0;">${input.guests}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Total</td><td style="padding: 6px 0;">${input.currency}${input.totalAmount.toLocaleString("en-GB")} (payable on arrival)</td></tr>
    </table>
  `;
}

export async function sendBookingNotification(input: BookingEmailInput) {
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!to) throw new Error("ADMIN_NOTIFICATION_EMAIL is not configured.");

  const dates = `${formatDate(input.checkIn)} – ${formatDate(input.checkOut)}`;
  const html = emailShell(`
    <h1 style="font-size: 22px; margin: 8px 0 20px;">New booking request — ${escapeHtml(input.propertyName)}</h1>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Guest</td><td style="padding: 6px 0;">${escapeHtml(input.name)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Dates</td><td style="padding: 6px 0;">${dates} (${input.nights} nights)</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Guests</td><td style="padding: 6px 0;">${input.guests}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Total</td><td style="padding: 6px 0;">${input.currency}${input.totalAmount.toLocaleString("en-GB")}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Email</td><td style="padding: 6px 0;">${escapeHtml(input.email)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Phone</td><td style="padding: 6px 0;">${escapeHtml(input.phone)}</td></tr>
      <tr><td style="padding: 6px 0; color: #6f6a5e;">Country</td><td style="padding: 6px 0;">${escapeHtml(input.country)}</td></tr>
      ${input.message ? `<tr><td style="padding: 6px 0; color: #6f6a5e;">Message</td><td style="padding: 6px 0;">${escapeHtml(input.message)}</td></tr>` : ""}
    </table>
    <p style="margin-top: 24px; font-size: 13px;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/admin/bookings" style="color: #a9895f;">Review in the admin dashboard →</a>
    </p>
  `);

  await getClient().emails.send({
    from: `${site.brand} <onboarding@resend.dev>`,
    to,
    subject: `[${site.brand}] New booking request: ${input.name}, ${dates}`,
    html,
  });
}

export async function sendGuestReceivedEmail(input: BookingEmailInput) {
  const html = emailShell(`
    <h1 style="font-size: 22px; margin: 8px 0 20px;">Request received, ${escapeHtml(input.name.split(" ")[0])}.</h1>
    <p style="font-size: 14px; line-height: 1.6;">
      Thank you for requesting to book ${escapeHtml(input.propertyName)}. A member of our reservations
      team will confirm availability and be in touch shortly.
    </p>
    ${detailsTable(input)}
    <p style="margin-top: 20px; font-size: 12px; color: #6f6a5e;">
      This confirms we've received your request — it is not yet a confirmed booking.
      We'll email you again once it's reviewed.
    </p>
  `);

  await getClient().emails.send({
    from: `${site.brand} <onboarding@resend.dev>`,
    to: input.email,
    subject: `[${site.brand}] We've received your booking request`,
    html,
  });
}

export async function sendGuestStatusEmail(
  input: BookingEmailInput,
  status: "confirmed" | "declined",
  paymentUrl?: string,
) {
  const html =
    status === "confirmed"
      ? emailShell(`
          <h1 style="font-size: 22px; margin: 8px 0 20px;">Your stay is confirmed, ${escapeHtml(input.name.split(" ")[0])}.</h1>
          <p style="font-size: 14px; line-height: 1.6;">
            We're delighted to confirm your stay at ${escapeHtml(input.propertyName)}.
          </p>
          ${detailsTable(input)}
          ${
            paymentUrl
              ? `<p style="margin-top: 20px; font-size: 13px; line-height: 1.6;">
                   Full payment is due on arrival by default — but if you'd like to pay online now instead, you can:
                 </p>
                 <p style="margin-top: 14px;">
                   <a href="${paymentUrl}" style="display: inline-block; background: #14130f; color: #f5f2ec; padding: 10px 20px; border-radius: 999px; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em;">Pay online (test mode)</a>
                 </p>
                 <p style="margin-top: 12px; font-size: 11px; color: #6f6a5e;">
                   This is a demo site running Stripe's test mode — no real card is charged, whatever you enter.
                 </p>`
              : ""
          }
          <p style="margin-top: 20px; font-size: 13px; line-height: 1.6;">
            Full property and arrival details will follow closer to your stay. If anything
            about your dates or party size changes, just reply to this email.
          </p>
        `)
      : emailShell(`
          <h1 style="font-size: 22px; margin: 8px 0 20px;">About your request, ${escapeHtml(input.name.split(" ")[0])}</h1>
          <p style="font-size: 14px; line-height: 1.6;">
            Thank you for your interest in ${escapeHtml(input.propertyName)}. Unfortunately we're unable
            to accommodate this request for ${formatDate(input.checkIn)} – ${formatDate(input.checkOut)}.
          </p>
          <p style="margin-top: 16px; font-size: 13px; line-height: 1.6;">
            We'd be glad to help you find alternative dates — just reply to this email.
          </p>
        `);

  await getClient().emails.send({
    from: `${site.brand} <onboarding@resend.dev>`,
    to: input.email,
    subject:
      status === "confirmed"
        ? `[${site.brand}] Your stay is confirmed`
        : `[${site.brand}] About your booking request`,
    html,
  });
}

export async function sendPasswordResetCode(email: string, code: string) {
  const html = emailShell(`
    <h1 style="font-size: 22px; margin: 8px 0 20px;">Reset your admin password</h1>
    <p style="font-size: 14px; line-height: 1.6;">Use this code to reset your password:</p>
    <p style="font-size: 32px; font-weight: bold; letter-spacing: 0.1em; margin: 20px 0;">${code}</p>
    <p style="font-size: 12px; color: #6f6a5e;">
      If you didn't request this, you can safely ignore this email.
    </p>
  `);

  await getClient().emails.send({
    from: `${site.brand} <onboarding@resend.dev>`,
    to: email,
    subject: `[${site.brand}] Your password reset code`,
    html,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
