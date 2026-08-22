import "server-only";
import { Resend } from "resend";
import { site } from "@/data/content";
import { formatDate } from "@/lib/date";

interface BookingNotificationInput {
  bookingId: string;
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

export async function sendBookingNotification(input: BookingNotificationInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ADMIN_NOTIFICATION_EMAIL;
  if (!apiKey || !to) {
    throw new Error("RESEND_API_KEY or ADMIN_NOTIFICATION_EMAIL is not configured.");
  }

  const resend = new Resend(apiKey);
  const dates = `${formatDate(input.checkIn)} – ${formatDate(input.checkOut)}`;

  const html = `
    <div style="font-family: Georgia, serif; max-width: 480px; margin: 0 auto; color: #14130f;">
      <p style="text-transform: uppercase; letter-spacing: 0.15em; font-size: 11px; color: #a9895f;">${site.brand}</p>
      <h1 style="font-size: 22px; margin: 8px 0 20px;">New booking request — ${site.propertyName}</h1>
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
    </div>
  `;

  await resend.emails.send({
    from: `${site.brand} <onboarding@resend.dev>`,
    to,
    subject: `[${site.brand}] New booking request: ${input.name}, ${dates}`,
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
