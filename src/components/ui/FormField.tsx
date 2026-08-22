"use client";

import { useId, useState } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  as?: "input" | "textarea" | "select";
  options?: string[];
  required?: boolean;
}

export default function FormField({
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  as = "input",
  options,
  required,
}: FormFieldProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  const baseClasses = `peer w-full border-b bg-transparent pb-2.5 pt-6 text-[15px] text-ink outline-none transition-colors focus:border-ink ${
    error ? "border-red-400" : "border-line"
  }`;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-0 text-stone transition-all duration-200 ${
          floated ? "top-1 text-[11px] tracking-[0.08em] uppercase" : "top-6 text-[15px]"
        }`}
      >
        {label}
        {required && <span className="text-brass"> *</span>}
      </label>

      {as === "textarea" ? (
        <textarea
          id={id}
          name={name}
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseClasses} resize-none`}
        />
      ) : as === "select" ? (
        <select
          id={id}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`${baseClasses} cursor-pointer appearance-none`}
        >
          <option value="" disabled hidden />
          {options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={baseClasses}
        />
      )}

      {error && (
        <p className="mt-1.5 animate-[panel-in_0.25s_ease-out] text-[12px] text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
