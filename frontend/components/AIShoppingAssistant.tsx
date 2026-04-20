"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { askShoppingAssistant } from "@/lib/ai";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/components/AuthProvider";

type Message = {
  role: "assistant" | "user";
  text: string;
  tone?: "default" | "soft";
};

const starterPrompts = [
  "I want a budget phone under 20000",
  "Suggest good shoes for running",
  "Show me stylish clothes for winter",
];

const quickActions = ["Budget", "Trending", "Gift Ideas", "Similar Products"];

const buildChipPrompt = (chip: string) => {
  switch (chip) {
    case "Budget":
      return "Show budget-friendly options";
    case "Trending":
      return "Show trending picks";
    case "Gift Ideas":
      return "Suggest gift ideas under 2000";
    case "Similar Products":
      return "Show something similar to what I viewed";
    case "Premium":
      return "Show premium picks";
    case "Running":
      return "Show running options only";
    case "Best Value":
      return "Show best value options";
    case "Smart Bundle":
      return "Build a smart bundle";
    case "Seasonal Picks":
      return "Show seasonal recommendations";
    default:
      return chip;
  }
};

export const AIShoppingAssistant = () => {
  const { token, displayName, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Tell me what you need and I’ll narrow it down by category, budget, and intent.",
    },
  ]);
  const [results, setResults] = useState<Awaited<ReturnType<typeof askShoppingAssistant>>>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSessionId(window.crypto?.randomUUID?.() ?? `assist-${Date.now()}`);
  }, []);

  const canSend = input.trim().length >= 2 && !loading;

  const helperText = useMemo(() => {
    if (!results) {
      return isAuthenticated
        ? `Personalized for ${displayName}`
        : "Natural language shopping help";
    }

    const confidenceText =
      results.confidence >= 0.8
        ? "high confidence"
        : results.confidence >= 0.65
          ? "good confidence"
          : "fallback confidence";

    return `${results.mode} mode with ${confidenceText}`;
  }, [displayName, isAuthenticated, results]);

  const submit = async (message: string) => {
    const trimmed = message.trim();
    if (trimmed.length < 2 || loading) return;

    setMessages((current) => [...current, { role: "user", text: trimmed }]);
    setLoading(true);
    setInput("");

    const response = await askShoppingAssistant(trimmed, token, sessionId);

    if (response) {
      if (response.sessionId && response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
      }

      setMessages((current) => {
        const next: Message[] = [...current, { role: "assistant", text: response.reply }];
        if (response.followUpQuestion) {
          next.push({
            role: "assistant",
            text: response.followUpQuestion,
            tone: "soft",
          });
        }
        return next;
      });
      setResults(response);
    } else {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "I hit a snag reaching the assistant. Try again in a moment.",
        },
      ]);
    }

    setLoading(false);
  };

  const chips = results?.suggestionChips?.length
    ? results.suggestionChips
    : quickActions;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-5 right-5 z-50 rounded bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-teal"
      >
        AI Assistant
      </button>

      <AnimatePresence>
        {open ? (
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            className="fixed bottom-20 right-5 z-50 flex h-[35rem] w-[22rem] flex-col overflow-hidden rounded border border-line bg-white shadow-2xl sm:w-[26rem]"
          >
            <div className="border-b border-line bg-mist px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-teal">
                    Premium Shopping Assistant
                  </p>
                  <h2 className="mt-1 text-lg font-bold text-ink">Smarter product guidance</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded px-2 py-1 text-xs font-bold text-ink/55 transition hover:bg-white hover:text-ink"
                >
                  Close
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-ink/60">{helperText}</p>
                {isAuthenticated ? (
                  <div className="flex items-center gap-2 rounded bg-white px-2 py-1 text-xs font-semibold text-ink">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal text-[10px] text-white">
                      {displayName.slice(0, 2).toUpperCase()}
                    </span>
                    <span>{displayName}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}-${message.text}`}
                  className={`max-w-[90%] rounded px-3 py-2 text-sm leading-6 ${
                    message.role === "assistant"
                      ? message.tone === "soft"
                        ? "bg-mist text-ink/75"
                        : "bg-mist text-ink"
                      : "ml-auto bg-teal text-white"
                  }`}
                >
                  {message.text}
                </div>
              ))}

              {loading ? (
                <div className="max-w-[70%] rounded bg-mist px-3 py-2 text-sm text-ink/70">
                  Thinking through your shopping request...
                </div>
              ) : null}

              {results?.items?.length ? (
                <div className="space-y-2">
                  {results.items.map((item) => (
                    <Link
                      key={item.product.id}
                      href={`/products/${item.product.id}`}
                      className="block rounded border border-line px-3 py-3 transition hover:border-teal"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-bold text-ink">{item.product.name}</p>
                            {results.mode !== "search" ? (
                              <span className="rounded bg-teal/10 px-2 py-1 text-[10px] font-bold uppercase text-teal">
                                {results.mode}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-xs font-semibold text-teal">{item.reason}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-ink">
                          {formatCurrency(item.product.price, item.product.currency)}
                        </p>
                      </div>
                      {item.smartTags.length ? (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.smartTags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded bg-mist px-2 py-1 text-xs font-bold text-ink/70">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="border-t border-line px-4 py-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {(chips.length ? chips : starterPrompts).map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => void submit(buildChipPrompt(chip))}
                    className="rounded bg-mist px-3 py-2 text-xs font-semibold text-ink transition hover:bg-teal/10 hover:text-teal"
                  >
                    {chip}
                  </button>
                ))}
              </div>
              {!results ? (
                <div className="mb-3 flex flex-wrap gap-2">
                  {starterPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => void submit(prompt)}
                      className="rounded border border-line px-3 py-2 text-xs font-semibold text-ink/75 transition hover:border-teal hover:text-teal"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && canSend) {
                      event.preventDefault();
                      void submit(input);
                    }
                  }}
                  placeholder="Ask for products in plain English"
                  className="min-h-11 flex-1 rounded border border-line px-3 text-sm outline-none transition focus:border-teal"
                />
                <button
                  type="button"
                  onClick={() => void submit(input)}
                  disabled={!canSend}
                  className="min-h-11 rounded bg-teal px-4 text-sm font-bold text-white transition disabled:opacity-45"
                >
                  {loading ? "..." : "Send"}
                </button>
              </div>
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
};
