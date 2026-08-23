"use server";

import { getPropertyBySlug } from "@/lib/queries/properties";
import { richContentBySlug } from "@/data/property-content";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { site } from "@/data/content";

export interface ChatMessage {
  role: "user" | "model";
  content: string;
}

export interface ChatResult {
  ok: boolean;
  reply?: string;
  message?: string;
}

const MAX_HISTORY_TURNS = 12;
const MAX_MESSAGE_LENGTH = 500;

function buildSystemPrompt(
  property: Awaited<ReturnType<typeof getPropertyBySlug>>,
  slug: string,
): string {
  if (!property) return "";
  const content = richContentBySlug[slug];

  const lines = [
    `You are the concierge chatbot for ${property.name}, a ${site.brand} property in ${property.location}.`,
    `Answer ONLY using the facts below. If you don't know something, say so honestly rather than guessing.`,
    `If asked about anything unrelated to this property (general knowledge, other topics, other websites), politely decline and steer the conversation back to helping with this property.`,
    `Keep replies short and conversational — a couple of sentences, not an essay.`,
    `This is a fictional demo property built as a personal coding project — if asked directly whether it's real, say so honestly.`,
    ``,
    `PROPERTY FACTS`,
    `Tagline: ${property.tagline}`,
    `Description: ${property.description}`,
    `Bedrooms: ${property.bedrooms}, Bathrooms: ${property.bathrooms}, Sleeps up to ${property.max_guests}, Square feet: ${property.square_feet}, Floors: ${property.floors}`,
    `Nightly rate: ${property.currency}${property.nightly_rate}, Cleaning fee: ${property.currency}${property.cleaning_fee}, Minimum stay: ${property.min_nights} nights`,
    `Payment: guests pay on arrival — no online payment is required to reserve. (A test-mode online payment option may also be offered after a booking is confirmed; if asked, clarify no real charge is ever made on this demo site.)`,
  ];

  if (content) {
    lines.push(
      ``,
      `ROOMS`,
      ...content.rooms.map((r) => `- ${r.title}: ${r.description}`),
      ``,
      `LOCATION`,
      content.location.blurb,
      `Nearby: ${content.location.places.map((p) => `${p.name} (${p.time})`).join(", ")}`,
    );
  }

  return lines.join("\n");
}

// Model: gemini-3.5-flash-lite — measured directly against gemini-3.6-flash
// for this exact use case; flash-lite answered consistently in under a
// second while 3.6-flash ranged from 1.4s to a 38s outlier on an
// identical prompt. A chat widget is the most latency-sensitive feature
// in this app, so the faster, more consistent model wins even though
// 3.6-flash is the "smarter" one on paper.
export async function sendChatMessage(
  propertySlug: string,
  history: ChatMessage[],
): Promise<ChatResult> {
  const ip = await getClientIp();
  const allowed = await checkRateLimit(`chat:${ip}`, 20, 15);
  if (!allowed) {
    return { ok: false, message: "Too many messages. Please try again in a few minutes." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false, message: "Chat isn't available right now." };
  }

  if (history.length === 0 || history.length > MAX_HISTORY_TURNS * 2) {
    return { ok: false, message: "Could not send that message." };
  }
  const lastMessage = history[history.length - 1];
  if (
    lastMessage.role !== "user" ||
    !lastMessage.content.trim() ||
    lastMessage.content.length > MAX_MESSAGE_LENGTH
  ) {
    return { ok: false, message: "Please keep messages under 500 characters." };
  }

  // Re-derive the property and its content server-side rather than trusting
  // anything the client claims — the whole point of grounding is that the
  // facts come from the real database, not from whatever a client sends.
  const property = await getPropertyBySlug(propertySlug);
  if (!property) {
    return { ok: false, message: "Property not found." };
  }

  const systemPrompt = buildSystemPrompt(property, propertySlug);

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
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: history.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
          generationConfig: { thinkingConfig: { thinkingLevel: "minimal" } },
        }),
      },
    );

    if (!res.ok) {
      console.error("gemini chat request failed", res.status, await res.text());
      return { ok: false, message: "Could not get a reply. Please try again." };
    }

    const data = await res.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!reply) {
      return { ok: false, message: "Could not get a reply. Please try again." };
    }

    return { ok: true, reply };
  } catch (err) {
    console.error("gemini chat request errored", err);
    return { ok: false, message: "Could not get a reply. Please try again." };
  }
}
