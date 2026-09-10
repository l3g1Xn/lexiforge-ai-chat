import { createFileRoute } from "@tanstack/react-router";
import { Mic, MicOff, Send } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { TokenLine } from "@/components/tokens";
import { Button } from "@/components/ui/button";
import { coachOnDevice } from "@/lib/offline/brain";
import { applyNoise, type Token } from "@/lib/noise";
import { OPENING } from "@/lib/practice";
import { getRecognizer } from "@/lib/speech";
import { uid } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/chat")({ component: ChatPage });

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  tokens?: Token[];
  userClean?: string | null;
};

function ChatPage() {
  const temperature = useAppStore((s) => s.temperature);
  const recordPractice = useAppStore((s) => s.recordPractice);
  const touchStreak = useAppStore((s) => s.touchStreak);
  const offerSuggestion = useAppStore((s) => s.offerSuggestion);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [listening, setListening] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const recRef = useRef<{ stop: () => void } | null>(null);
  const turn = useRef(0);
  const seeded = useRef(false);

  useEffect(() => {
    if (seeded.current) return;
    const boot = () => {
      if (seeded.current) return;
      seeded.current = true;
      const temp = useAppStore.getState().temperature;
      setMessages([
        {
          id: "open",
          role: "assistant",
          text: OPENING,
          tokens: applyNoise(OPENING, temp),
        },
      ]);
    };
    void Promise.resolve(useAppStore.persist.rehydrate()).then(boot).catch(boot);
  }, []);

  const speakText = useMemo(() => {
    const last = [...messages].reverse().find((m) => m.role === "assistant");
    return `Talk and write with me. ${last?.text ?? ""}`;
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function stopMic() {
    try {
      recRef.current?.stop();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }

  function startMic() {
    const Ctor = getRecognizer();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "en-US";
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (ev) => {
      const said = ev.results[0]?.[0]?.transcript ?? "";
      if (said && boxRef.current) {
        const cur = boxRef.current.value.trim();
        boxRef.current.value = cur ? `${cur} ${said}` : said;
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  }

  function send() {
    const trimmed = boxRef.current?.value.trim() ?? "";
    if (!trimmed) return;
    stopMic();
    if (boxRef.current) boxRef.current.value = "";
    touchStreak();
    const userMsg: Msg = { id: uid(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    const local = coachOnDevice(trimmed, turn.current++);
    const tempForReply = useAppStore.getState().temperature;
    setMessages((prev) => [
      ...prev,
      {
        id: uid(),
        role: "assistant",
        text: local.reply,
        tokens: applyNoise(local.reply, tempForReply),
        userClean: local.userClean,
      },
    ]);
  }

  return (
    <AppShell title="Talk / write with me" speakText={speakText} back>
      {temperature >= 9 ? (
        <p className="mb-4 rounded-md bg-paper px-4 py-3 shadow-card">
          Drill mode is on. Chat stays readable. Use the 2-minute drill for hard
          practice.
        </p>
      ) : (
        <p className="mb-4 text-base text-muted">
          Marked words are practice. Tap one to see the clean spelling. Lexi
          runs on this device.
        </p>
      )}

      <div
        ref={listRef}
        className="flex max-h-[52dvh] flex-col gap-3 overflow-y-auto pr-1"
      >
        {messages.map((msg) => (
          <article
            key={msg.id}
            className={`rounded-lg p-4 shadow-card ${
              msg.role === "user" ? "bg-bg" : "bg-paper"
            }`}
          >
            {msg.role === "assistant" && msg.userClean ? (
              <p className="mb-3 rounded-md bg-bg p-3">
                I think you mean: {msg.userClean}
              </p>
            ) : null}
            {msg.role === "assistant" && msg.tokens ? (
              <TokenLine
                tokens={msg.tokens}
                onPracticed={(kind) => recordPractice(kind)}
              />
            ) : (
              <p className="whitespace-pre-wrap">{msg.text}</p>
            )}
          </article>
        ))}
      </div>

      <form
        className="mt-4 flex flex-col gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <label className="block">
          <span className="sr-only">Your message</span>
          <textarea
            id="chat-box"
            ref={boxRef}
            rows={3}
            placeholder="Type here. Spelling can be messy."
            className="w-full resize-y px-4 py-3"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" className="flex-1">
            <Send className="size-5" aria-hidden="true" />
            Send
          </Button>
          <Button
            type="button"
            variant="secondary"
            aria-pressed={listening}
            aria-label={listening ? "Stop listening" : "Speak"}
            onClick={() => (listening ? stopMic() : startMic())}
          >
            {listening ? (
              <MicOff className="size-5" aria-hidden="true" />
            ) : (
              <Mic className="size-5" aria-hidden="true" />
            )}
            {listening ? "Stop" : "Speak"}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => offerSuggestion(0, true)}
        >
          Too hard
        </Button>
      </form>
    </AppShell>
  );
}
