import "server-only";
import { getStripeClient } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

// Stripe calls this directly (no browser involved), so it needs the raw
// request body for signature verification — never trust an unsigned
// request here, and never mark a booking paid from the success_url
// redirect alone (a guest could just navigate there without paying).
// This webhook is the only thing allowed to set payment_status = 'paid'.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return new Response("Webhook not configured.", { status: 500 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("stripe webhook signature verification failed", err);
    return new Response("Invalid signature.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;

    if (bookingId) {
      const supabase = createAdminClient();
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      if (error) {
        console.error("failed to mark booking paid", bookingId, error);
        // Still 200 — Stripe would otherwise retry indefinitely for an
        // error that a retry won't fix (the row/column issue isn't
        // transient). Logged above for manual follow-up.
      }
    }
  }

  return new Response("ok", { status: 200 });
}
