import { useRef, useState, type KeyboardEvent } from "react";
import { speak } from "@/lib/speech";
import type { Token } from "@/lib/noise";
import { useAppStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

export function HearableWords({ text }: { text: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <p className="text-pretty">
      {parts.map((part, i) =>
        /^\s+$/.test(part) ? (
          <span key={i}>{part}</span>
        ) : (
          <button
            key={i}
            type="button"
            className="rounded-sm px-0.5 hover:bg-mark"
            onClick={() => speak(part.replace(/[^A-Za-z']/g, "") || part)}
          >
            {part}
          </button>
        ),
      )}
    </p>
  );
}

export function TokenLine({
  tokens,
  onPracticed,
}: {
  tokens: Token[];
  onPracticed?: (kind: string, original: string, display: string) => void;
}) {
  const showClean = useAppStore((s) => s.showClean);
  const [openId, setOpenId] = useState<string | null>(null);
  const [cleared, setCleared] = useState<Set<string>>(new Set());
  const [typed, setTyped] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const seen = useRef(new Set<string>());

  function markPracticed(token: Token) {
    if (seen.current.has(token.id)) return;
    seen.current.add(token.id);
    const clean = token.original.replace(/[^A-Za-z]/g, "");
    onPracticed?.(token.kind ?? "swap", clean, token.display);
  }

  function handleTap(token: Token) {
    if (!token.noisy || cleared.has(token.id)) {
      speak(token.original);
      return;
    }
    setOpenId(token.id === openId ? null : token.id);
    setTyped("");
    setNote(null);
    speak(token.original);
    markPracticed(token);
  }

  function tryClear(token: Token) {
    const target = token.original.replace(/[^A-Za-z]/g, "");
    if (typed.trim().toLowerCase() === target.toLowerCase()) {
      setCleared((prev) => new Set(prev).add(token.id));
      setNote(`Yes — ${token.display.replace(/[^A-Za-z]/g, "")} / ${target}. Nice catch.`);
      setOpenId(null);
      markPracticed(token);
    } else {
      setNote("Try the clean spelling once.");
    }
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>, token: Token) {
    if (e.key === "Enter") {
      e.preventDefault();
      tryClear(token);
    }
  }

  return (
    <div>
      <p className="text-pretty whitespace-pre-wrap">
        {tokens.map((token) => {
          if (/^\s+$/.test(token.original)) {
            return <span key={token.id}>{token.original}</span>;
          }
          if (!token.noisy || cleared.has(token.id)) {
            return <span key={token.id}>{token.original}</span>;
          }
          const shown = showClean ? token.original : token.display;
          return (
            <button
              key={token.id}
              type="button"
              className="word-mark mx-0.5 my-0.5 inline-flex min-h-11 items-center"
              onClick={() => handleTap(token)}
            >
              {shown}
            </button>
          );
        })}
      </p>
      {tokens.map((token) => {
        if (token.id !== openId || cleared.has(token.id)) return null;
        const clean = token.original.replace(/[^A-Za-z]/g, "");
        const noisy = token.display.replace(/[^A-Za-z]/g, "");
        return (
          <div
            key={`${token.id}-panel`}
            className="mt-3 rounded-lg bg-bg p-4 shadow-card"
          >
            <p className="font-semibold">
              {noisy} → {clean}
            </p>
            <p className="mt-1 text-base text-muted">{token.hint}</p>
            <label className="mt-3 block">
              <span className="text-base text-muted">Type it once</span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => onKey(e, token)}
                autoComplete="off"
                spellCheck={false}
                className="mt-1 min-h-14 w-full rounded-md bg-paper px-3 shadow-card"
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" size="sm" onClick={() => tryClear(token)}>
                Check
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setCleared((prev) => new Set(prev).add(token.id));
                  setOpenId(null);
                  markPracticed(token);
                }}
              >
                Heard it
              </Button>
            </div>
            {note ? <p className="mt-2">{note}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
