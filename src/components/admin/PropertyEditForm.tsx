"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateProperty } from "@/lib/actions/properties";
import FormField from "@/components/ui/FormField";
import MagneticButton from "@/components/ui/MagneticButton";
import type { Property } from "@/lib/queries/properties";

export default function PropertyEditForm({ property }: { property: Property }) {
  const [fields, setFields] = useState({
    name: property.name,
    tagline: property.tagline,
    location: property.location,
    description: property.description,
    nightly_rate: String(property.nightly_rate),
    cleaning_fee: String(property.cleaning_fee),
    min_nights: String(property.min_nights),
    max_guests: String(property.max_guests),
    bedrooms: String(property.bedrooms),
    bathrooms: String(property.bathrooms),
    square_feet: String(property.square_feet),
    floors: String(property.floors),
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  function set(key: keyof typeof fields) {
    return (value: string) => setFields((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateProperty(property.id, formData);
      setMessage(
        result.ok
          ? { type: "success", text: "Saved." }
          : { type: "error", text: result.message ?? "Could not save changes." },
      );
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <FormField label="Name" name="name" value={fields.name} onChange={set("name")} required />
      <FormField
        label="Tagline"
        name="tagline"
        value={fields.tagline}
        onChange={set("tagline")}
        required
      />
      <FormField
        label="Location"
        name="location"
        value={fields.location}
        onChange={set("location")}
        required
      />
      <FormField
        label="Description"
        name="description"
        as="textarea"
        value={fields.description}
        onChange={set("description")}
        required
      />

      <div className="grid gap-x-6 gap-y-7 sm:grid-cols-2">
        <FormField
          label="Nightly rate"
          name="nightly_rate"
          type="number"
          value={fields.nightly_rate}
          onChange={set("nightly_rate")}
          required
        />
        <FormField
          label="Cleaning fee"
          name="cleaning_fee"
          type="number"
          value={fields.cleaning_fee}
          onChange={set("cleaning_fee")}
          required
        />
        <FormField
          label="Minimum nights"
          name="min_nights"
          type="number"
          value={fields.min_nights}
          onChange={set("min_nights")}
          required
        />
        <FormField
          label="Max guests"
          name="max_guests"
          type="number"
          value={fields.max_guests}
          onChange={set("max_guests")}
          required
        />
        <FormField
          label="Bedrooms"
          name="bedrooms"
          type="number"
          value={fields.bedrooms}
          onChange={set("bedrooms")}
          required
        />
        <FormField
          label="Bathrooms"
          name="bathrooms"
          type="number"
          value={fields.bathrooms}
          onChange={set("bathrooms")}
          required
        />
        <FormField
          label="Square feet"
          name="square_feet"
          type="number"
          value={fields.square_feet}
          onChange={set("square_feet")}
          required
        />
        <FormField
          label="Floors"
          name="floors"
          type="number"
          value={fields.floors}
          onChange={set("floors")}
          required
        />
      </div>

      {message && (
        <p
          className={`animate-[panel-in_0.25s_ease-out] text-[13px] ${
            message.type === "success" ? "text-brass" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}

      <MagneticButton type="submit" disabled={isPending}>
        {isPending ? "Saving" : "Save changes"}
      </MagneticButton>
    </form>
  );
}
