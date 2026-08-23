"use client";

import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { sendChatMessage, type ChatMessage } from "@/lib/actions/chat";
import { cn } from "@/lib/cn";

function ChatIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M2.5 4.5A2 2 0 0 1 4.5 2.5h11a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 4v-4H4.5a2 2 0 0 1-2-2v-7Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ChatWidget({
  propertySlug,
  propertyName,
}: {
  propertySlug: string;
  propertyName: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isPending) return;

    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    startTransition(async () => {
      const result = await sendChatMessage(propertySlug, nextMessages);
      if (!result.ok || !result.reply) {
        setError(result.message ?? "Could not get a reply.");
        return;
      }
      setMessages((prev) => [...prev, { role: "model", content: result.reply! }]);
    });
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
      {open && (
        <div className="mb-4 flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl animate-[panel-in_0.25s_ease-out]">
          <div className="border-b border-line px-5 py-4">
            <p className="text-[11px] uppercase tracking-[0.16em] text-brass">Ask about</p>
            <p className="font-display text-lg text-ink">{propertyName}</p>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messages.length === 0 && (
              <p className="text-[13px] leading-relaxed text-stone">
                Ask me anything about {propertyName} — rooms, location, pricing, or what&rsquo;s nearby.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "max-w-[85%] rounded-xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  m.role === "user"
                    ? "ml-auto bg-ink text-bone"
                    : "bg-bone-2 text-ink",
                )}
              >
                {m.content}
              </div>
            ))}
            {isPending && (
              <div className="max-w-[85%] rounded-xl bg-bone-2 px-3.5 py-2.5 text-[13px] text-stone">
                Thinking…
              </div>
            )}
            {error && <p className="text-[12px] text-red-600">{error}</p>}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-line p-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
              maxLength={500}
              className="min-w-0 flex-1 rounded-full border border-line bg-transparent px-4 py-2 text-[13px] text-ink outline-none focus:border-ink"
            />
            <button
              type="submit"
              disabled={isPending || !input.trim()}
              className="cursor-pointer rounded-full bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.08em] text-bone transition-colors hover:bg-ink-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Ask about this property"}
        className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-ink text-bone shadow-2xl transition-transform hover:scale-105"
      >
        <ChatIcon open={open} />
      </button>
    </div>
  );
}
