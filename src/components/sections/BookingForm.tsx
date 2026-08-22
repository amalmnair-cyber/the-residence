"use client";

import { useMemo, useState, type FormEvent } from "react";
import FormField from "../ui/FormField";
import MagneticButton from "../ui/MagneticButton";
import Calendar from "../ui/Calendar";
import { countries } from "@/data/countries";
import { booking, type DateRange } from "@/data/booking";
import { formatDate, nightsBetween } from "@/lib/date";
import { emailPattern, phonePattern } from "@/lib/validation";
import { submitBooking } from "@/lib/actions/bookings";

interface FormValues {
  name: string;
  email: string;
  phone: string;
  country: string;
  message: string;
}

const initialValues: FormValues = {
  name: "",
  email: "",
  phone: "",
  country: "",
  message: "",
};

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!emailPattern.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!phonePattern.test(values.phone.trim()))
    errors.phone = "Please enter a valid phone number.";
  if (!values.country) errors.country = "Please select your country.";
  return errors;
}

export default function BookingForm({
  unavailableRanges,
}: {
  unavailableRanges: DateRange[];
}) {
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [guests, setGuests] = useState(2);
  const [values, setValues] = useState<FormValues>(initialValues);
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [dateError, setDateError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const subtotal = nights * booking.nightlyRate;
  const total = nights > 0 ? subtotal + booking.cleaningFee : 0;

  const summary = useMemo(() => {
    if (!checkIn) return "Select your dates";
    if (!checkOut) return `${formatDate(checkIn)} — select check-out`;
    return `${formatDate(checkIn)} — ${formatDate(checkOut)}`;
  }, [checkIn, checkOut]);

  function setField(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!checkIn || !checkOut) {
      setDateError("Please select your check-in and check-out dates.");
      return;
    }
    if (nights < booking.minNights) {
      setDateError(`Minimum stay is ${booking.minNights} nights.`);
      return;
    }
    setDateError(null);

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    const result = await submitBooking({
      checkIn,
      checkOut,
      guests,
      name: values.name,
      email: values.email,
      phone: values.phone,
      country: values.country,
      message: values.message || undefined,
      website,
    });
    setSubmitting(false);

    if (!result.ok) {
      setFormError(result.message ?? "Something went wrong. Please try again.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted && checkIn && checkOut) {
    return (
      <div className="flex animate-[panel-in_0.5s_ease-out] flex-col items-center py-16 text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full border border-brass"
          style={{ animation: "lightbox-in 0.5s 0.15s both ease-out" }}
        >
          <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
            <path
              d="M1 8L8 15L21 1"
              stroke="var(--color-brass)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="mt-8 font-display text-2xl text-ink">
          Request received, {values.name.split(" ")[0]}.
        </p>
        <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-stone">
          {formatDate(checkIn)} — {formatDate(checkOut)} · {nights} nights · {guests}{" "}
          {guests === 1 ? "guest" : "guests"}
        </p>
        <p className="mt-1 text-[15px] text-ink">
          Estimated total {booking.currency}
          {total.toLocaleString("en-GB")}
        </p>
        <p className="mt-6 max-w-sm text-[13px] leading-relaxed text-stone">
          A member of our reservations team will confirm availability and
          payment details with you directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-10">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="grid gap-10 sm:grid-cols-[auto_1fr] sm:gap-12">
        <Calendar
          checkIn={checkIn}
          checkOut={checkOut}
          onChange={(a, b) => {
            setCheckIn(a);
            setCheckOut(b);
            setDateError(null);
          }}
          unavailableRanges={unavailableRanges}
          minNights={booking.minNights}
        />

        <div className="flex flex-col justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone">Your dates</p>
            <p className="mt-2 font-display text-xl text-ink">{summary}</p>

            <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone">Guests</p>
                <p className="mt-1 text-sm text-ink">Up to {booking.maxGuests}</p>
              </div>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  aria-label="Decrease guests"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
                >
                  −
                </button>
                <span className="w-4 text-center font-display text-lg text-ink">{guests}</span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.min(booking.maxGuests, g + 1))}
                  aria-label="Increase guests"
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-line text-ink transition-colors hover:border-ink"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2 border-t border-line pt-6 text-sm">
            <div className="flex items-center justify-between text-stone">
              <span>
                {booking.currency}
                {booking.nightlyRate.toLocaleString("en-GB")} × {nights || 0}{" "}
                {nights === 1 ? "night" : "nights"}
              </span>
              <span>
                {booking.currency}
                {subtotal.toLocaleString("en-GB")}
              </span>
            </div>
            <div className="flex items-center justify-between text-stone">
              <span>Cleaning fee</span>
              <span>
                {nights > 0
                  ? `${booking.currency}${booking.cleaningFee.toLocaleString("en-GB")}`
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 font-display text-lg text-ink">
              <span>Total</span>
              <span>
                {booking.currency}
                {total.toLocaleString("en-GB")}
              </span>
            </div>
            {dateError && (
              <p className="animate-[panel-in_0.25s_ease-out] pt-2 text-[12px] text-red-600">
                {dateError}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-7 border-t border-line pt-10 sm:grid-cols-2">
        <FormField
          label="Full Name"
          name="name"
          required
          value={values.name}
          onChange={(v) => setField("name", v)}
          error={errors.name}
        />
        <FormField
          label="Email"
          name="email"
          type="email"
          required
          value={values.email}
          onChange={(v) => setField("email", v)}
          error={errors.email}
        />
        <FormField
          label="Phone"
          name="phone"
          type="tel"
          required
          value={values.phone}
          onChange={(v) => setField("phone", v)}
          error={errors.phone}
        />
        <FormField
          label="Country"
          name="country"
          as="select"
          options={countries}
          required
          value={values.country}
          onChange={(v) => setField("country", v)}
          error={errors.country}
        />
        <div className="sm:col-span-2">
          <FormField
            label="Message (optional)"
            name="message"
            as="textarea"
            value={values.message}
            onChange={(v) => setField("message", v)}
          />
        </div>

        <div className="flex flex-col items-center gap-3 sm:col-span-2">
          <MagneticButton type="submit" disabled={submitting} className="min-w-[240px]">
            {submitting ? "Sending" : "Request to Book"}
          </MagneticButton>
          {formError && (
            <p className="animate-[panel-in_0.25s_ease-out] text-[12px] text-red-600">
              {formError}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
