import Link from "next/link";
import { site } from "@/data/content";

export const metadata = {
  title: `Payment — ${site.brand}`,
  robots: { index: false, follow: false },
};

// Purely a friendly landing page for the redirect back from Stripe
// Checkout — it does NOT mark anything as paid. That's the webhook's job
// exclusively (src/app/api/stripe-webhook/route.ts), since a guest could
// otherwise reach this URL without ever actually paying.
export default async function PaymentCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ result?: string }>;
}) {
  const { result } = await searchParams;
  const success = result === "success";

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <p className="text-[11px] uppercase tracking-[0.16em] text-brass">
        {site.brand} — Test payment
      </p>
      <h1 className="mt-4 font-display text-3xl text-ink">
        {success ? "Payment received" : "Payment not completed"}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-stone">
        {success
          ? "Thank you — this test payment has gone through. We'll be in touch with your arrival details."
          : "No charge was made. If this wasn't intentional, you can request a new payment link from us."}
      </p>
      <p className="mt-6 text-[12px] text-stone">
        This is a demo site — no real payment was ever collected, in test or live mode.
      </p>
      <Link
        href="/"
        className="mt-8 text-[12px] uppercase tracking-[0.1em] text-ink underline underline-offset-4 transition-colors hover:text-brass"
      >
        Back to the site
      </Link>
    </div>
  );
}
