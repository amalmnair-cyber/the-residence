"use client";

import { useState, type FormEvent } from "react";
import RevealText from "../ui/RevealText";
import FormField from "../ui/FormField";
import MagneticButton from "../ui/MagneticButton";
import { countries } from "@/data/countries";

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

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d][\d\s()-]{6,18}$/;

function validate(values: FormValues) {
  const errors: Partial<Record<keyof FormValues, string>> = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your full name.";
  if (!emailPattern.test(values.email)) errors.email = "Please enter a valid email address.";
  if (!phonePattern.test(values.phone.trim()))
    errors.phone = "Please enter a valid phone number.";
  if (!values.country) errors.country = "Please select your country.";
  return errors;
}

export default function Enquiry() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function setField(field: keyof FormValues, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <section id="enquiry" className="bg-paper py-28 sm:py-36 lg:py-44">
      <div className="mx-auto max-w-3xl px-6 sm:px-10">
        <div className="text-center">
          <RevealText as="p" className="text-[11px] uppercase tracking-[0.22em] text-brass">
            Private Viewing
          </RevealText>
          <RevealText
            as="h2"
            className="mx-auto mt-6 max-w-xl text-[clamp(2.25rem,5.4vw,4.25rem)] font-display leading-[1.05] text-ink"
          >
            Arrange a private viewing
          </RevealText>
          <RevealText
            as="p"
            className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-stone"
          >
            Viewings of The Residence are strictly by private appointment. Share
            your details and a member of Atelier North will be in touch.
          </RevealText>
        </div>

        <div className="relative mt-16">
          {submitted ? (
            <div
              key="success"
              className="flex animate-[panel-in_0.5s_ease-out] flex-col items-center py-16 text-center"
            >
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
                Thank you, {values.name.split(" ")[0]}.
              </p>
              <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-stone">
                Your request has been received. A member of our team will
                contact you shortly to arrange your private viewing.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="grid grid-cols-1 gap-x-8 gap-y-7 sm:grid-cols-2"
            >
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

              <div className="mt-4 flex justify-center sm:col-span-2">
                <MagneticButton type="submit" disabled={submitting} className="min-w-[240px]">
                  {submitting ? "Sending" : "Request Private Viewing"}
                </MagneticButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
