"use server";

import { requireAdmin } from "@/lib/supabase/dal";

export interface SuggestCopyResult {
  ok: boolean;
  suggestion?: string;
  message?: string;
}

const FIELD_GUIDANCE: Record<"tagline" | "description", string> = {
  tagline:
    "Write ONE short, evocative tagline (under 12 words) for this luxury property's listing page.",
  description:
    "Write a short paragraph (2-3 sentences, under 60 words) describing this luxury property for its listing page. Elegant, restrained tone — no marketing clichés, no exclamation points.",
};

// Free tier (aistudio.google.com), not Anthropic — see docs/LEARNING_GUIDE.md
// for why. Admin-only feature (requireAdmin gates it), used narrowly to draft
// a starting point for one field at a time — the admin still reviews and
// explicitly applies the suggestion, never auto-saved.
//
// Model: gemini-3.5-flash-lite, not gemini-3.6-flash — measured directly
// (not assumed): flash-lite responded in ~0.8s consistently across
// repeated calls, while 3.6-flash ranged from 1.4s to a 38s outlier for
// an identical prompt. Flash-lite is explicitly built for short,
// low-latency tasks like this one.
export async function suggestPropertyCopy(
  field: "tagline" | "description",
  context: { name: string; location: string; currentValue: string },
): Promise<SuggestCopyResult> {
  await requireAdmin();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: "AI suggestions aren't configured." };
  }

  const prompt = `${FIELD_GUIDANCE[field]}

Property name: ${context.name}
Location: ${context.location}
Current ${field}: "${context.currentValue}"

Respond with ONLY the suggested ${field} text, nothing else — no preamble, no quotes around it.`;

  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // "minimal": this is a short copy-suggestion task, not something
          // that benefits from extended reasoning — cuts latency and token
          // use noticeably (verified: ~200 thinking tokens at the default
          // level vs. none at minimal, for an identical prompt).
          generationConfig: { thinkingConfig: { thinkingLevel: "minimal" } },
        }),
      },
    );

    if (!res.ok) {
      console.error("gemini request failed", res.status, await res.text());
      return { ok: false, message: "Could not get a suggestion. Please try again." };
    }

    const data = await res.json();
    const suggestion = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!suggestion) {
      return { ok: false, message: "Could not get a suggestion. Please try again." };
    }

    return { ok: true, suggestion };
  } catch (err) {
    console.error("gemini request errored", err);
    return { ok: false, message: "Could not get a suggestion. Please try again." };
  }
}
