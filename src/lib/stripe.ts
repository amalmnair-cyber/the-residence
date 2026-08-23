import "server-only";
import Stripe from "stripe";

// Test mode only — see docs/LEARNING_GUIDE.md. STRIPE_SECRET_KEY is a
// sk_test_... key; no real charge is ever possible with it regardless of
// what a guest enters at checkout.
export function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return new Stripe(secretKey);
}

const CURRENCY_CODES: Record<string, string> = {
  "£": "gbp",
  $: "usd",
  "€": "eur",
};

export function toStripeCurrency(currencySymbol: string): string {
  return CURRENCY_CODES[currencySymbol] ?? "gbp";
}
