"use client";

import { Bot, MessageCircle, Send, User, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type TopicKey =
  | "how_to_track"
  | "format"
  | "statuses"
  | "delivery_time"
  | "not_found";

const TOPICS: TopicKey[] = [
  "how_to_track",
  "format",
  "statuses",
  "delivery_time",
  "not_found",
];

/**
 * Each topic owns a flat list of multilingual keywords (lowercase, no accents).
 * Free-text input is matched against this list to pick the topic. The keyword
 * set is intentionally permissive — better to over-match than to fall back to
 * the unknown answer.
 */
const TOPIC_KEYWORDS: Record<TopicKey, string[]> = {
  how_to_track: [
    "track",
    "tracker",
    "tracking",
    "suivre",
    "suivi",
    "comment",
    "rastrear",
    "rastreo",
    "seguimiento",
    "verfolg",
    "wie",
    "how",
    "where",
    "look up",
    "find my",
  ],
  format: [
    "format",
    "code",
    "numero",
    "número",
    "numero de suivi",
    "numbre",
    "number",
    "nummer",
    "looks like",
    "ressemble",
    "exemple",
    "ejemplo",
    "beispiel",
    "ts9",
    "ts 9",
  ],
  statuses: [
    "status",
    "statut",
    "estado",
    "signifie",
    "signifient",
    "significa",
    "significan",
    "mean",
    "means",
    "meaning",
    "bedeut",
    "etape",
    "étape",
  ],
  delivery_time: [
    "time",
    "temps",
    "long",
    "longtemps",
    "delai",
    "délai",
    "delay",
    "tiempo",
    "dias",
    "días",
    "duracion",
    "duración",
    "tage",
    "lange",
    "deliver",
    "livraison",
    "livre",
    "livré",
    "entrega",
    "zustell",
    "lieferung",
    "duration",
  ],
  not_found: [
    "not found",
    "introuvable",
    "pas trouve",
    "pas trouvé",
    "missing",
    "perdu",
    "lost",
    "no encontr",
    "no encuentro",
    "nicht gefunden",
    "fehlt",
    "kein",
    "aucune commande",
  ],
};

type Message = {
  id: string;
  role: "bot" | "user";
  content: string;
};

function stripDiacritics(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function findTopic(input: string): TopicKey | null {
  const normalized = stripDiacritics(input.toLowerCase());
  for (const topic of TOPICS) {
    for (const keyword of TOPIC_KEYWORDS[topic]) {
      if (normalized.includes(stripDiacritics(keyword))) {
        return topic;
      }
    }
  }
  return null;
}

let messageCounter = 0;
const nextId = () => `msg-${++messageCounter}-${Date.now().toString(36)}`;

export function Chatbot() {
  const t = useTranslations("chatbot");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();

  // The chatbot is for public visitors only — hide on admin routes.
  // Computed AFTER hooks to satisfy the Rules of Hooks.
  const hidden =
    pathname.startsWith("/dashboard") || pathname.startsWith("/login");

  // Initial greeting on first open.
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: nextId(), role: "bot", content: t("welcome") }]);
    }
  }, [open, messages.length, t]);

  // Autoscroll to last message.
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Focus input when opening.
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 80);
      return () => window.clearTimeout(id);
    }
  }, [open]);

  function pushMessage(message: Message) {
    setMessages((prev) => [...prev, message]);
  }

  function answerFor(topic: TopicKey | null): string {
    if (topic) return t(`answers.${topic}`);
    return t("answers.unknown");
  }

  function handleSuggestion(topic: TopicKey) {
    pushMessage({ id: nextId(), role: "user", content: t(`suggestions.${topic}`) });
    window.setTimeout(() => {
      pushMessage({ id: nextId(), role: "bot", content: answerFor(topic) });
    }, 250);
  }

  function handleSend(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput("");
    pushMessage({ id: nextId(), role: "user", content: trimmed });
    const topic = findTopic(trimmed);
    window.setTimeout(() => {
      pushMessage({ id: nextId(), role: "bot", content: answerFor(topic) });
    }, 300);
  }

  function handleEsc(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") setOpen(false);
  }

  if (hidden) return null;

  return (
    <>
      {/* Floating trigger */}
      <button
        type="button"
        aria-label={t("trigger")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "bg-primary text-primary-foreground fixed right-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
          open && "scale-95"
        )}
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={handleEsc}
          className="bg-popover text-popover-foreground fixed right-5 bottom-24 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border shadow-2xl"
        >
          <header className="bg-primary text-primary-foreground flex items-center gap-3 px-4 py-3">
            <div className="bg-primary-foreground/15 flex h-9 w-9 items-center justify-center rounded-full">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p id={titleId} className="text-sm font-semibold leading-tight">
                {t("title")}
              </p>
              <p className="text-xs opacity-90">{t("subtitle")}</p>
            </div>
            <button
              type="button"
              aria-label={t("close")}
              onClick={() => setOpen(false)}
              className="hover:bg-primary-foreground/15 flex h-8 w-8 items-center justify-center rounded-md transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <ChatBubble key={m.id} message={m} />
            ))}
          </div>

          <div className="border-t px-4 py-3">
            <p className="text-muted-foreground mb-2 text-[11px] font-medium uppercase tracking-wider">
              {t("suggestionsLabel")}
            </p>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {TOPICS.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleSuggestion(topic)}
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-full px-3 py-1 text-xs transition-colors"
                >
                  {t(`suggestions.${topic}`)}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("placeholder")}
                className="h-9"
                autoComplete="off"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim()}
                aria-label={t("send")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function ChatBubble({ message }: { message: Message }) {
  const isBot = message.role === "bot";
  return (
    <div className={cn("flex gap-2", !isBot && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          isBot
            ? "bg-primary/10 text-primary"
            : "bg-muted text-muted-foreground"
        )}
        aria-hidden
      >
        {isBot ? (
          <Bot className="h-4 w-4" />
        ) : (
          <User className="h-4 w-4" />
        )}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-line rounded-2xl px-3 py-2 text-sm leading-relaxed",
          isBot
            ? "bg-muted text-foreground rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
