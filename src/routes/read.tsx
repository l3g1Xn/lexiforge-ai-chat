import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { HearableWords } from "@/components/tokens";
import { Button } from "@/components/ui/button";
import { interpretOnDevice } from "@/lib/offline/brain";
import { speak } from "@/lib/speech";
import { chunkText } from "@/lib/syllables";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/read")({ component: ReadPage });

function ReadPage() {
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const [clean, setClean] = useState("");
  const [meaning, setMeaning] = useState("");
  const [chunked, setChunked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasText, setHasText] = useState(false);
  const recordPractice = useAppStore((s) => s.recordPractice);
  const touchStreak = useAppStore((s) => s.touchStreak);

  const display = useMemo(
    () => (chunked && clean ? chunkText(clean) : clean),
    [chunked, clean],
  );

  const speakText = clean
    ? `Help me read this. ${clean}. What this means: ${meaning}`
    : "Help me read this. Paste a sign, a message, or a paragraph. Then tap Clean it.";

  function onClean() {
    const text = areaRef.current?.value.trim() ?? "";
    if (!text) return;
    const local = interpretOnDevice(text);
    setClean(local.clean);
    setMeaning(local.meaning);
    setCopied(false);
    touchStreak();
    recordPractice("clean", 1);
  }

  async function onCopy() {
    if (!clean) return;
    try {
      await navigator.clipboard.writeText(clean);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const pasteValue = () => areaRef.current?.value.trim() ?? "";

  return (
    <AppShell title="Help me read this" speakText={speakText} back>
      <label className="block">
        <span className="text-base text-muted">Paste the text</span>
        <textarea
          id="paste-box"
          ref={areaRef}
          rows={6}
          placeholder="A sign, a message, or a paragraph."
          className="mt-2 w-full resize-y px-4 py-3"
          onInput={() => setHasText(Boolean(areaRef.current?.value.trim()))}
        />
      </label>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button type="button" onClick={onClean}>
          Clean it
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => speak(clean || pasteValue())}
          disabled={!clean && !hasText}
        >
          Say it
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setChunked((v) => !v)}
          disabled={!clean}
        >
          {chunked ? "Whole words" : "Chunk it"}
        </Button>
      </div>

      {clean ? (
        <section className="mt-5 rounded-xl bg-paper p-5 shadow-card">
          <h2 className="text-lg font-semibold">Clean text</h2>
          <div className="mt-3">
            <HearableWords text={display} />
          </div>
          <div className="mt-4 rounded-md bg-bg p-4">
            <p className="text-base font-medium text-muted">What this means</p>
            <p className="mt-1">{meaning}</p>
          </div>
          <Button
            type="button"
            variant="secondary"
            className="mt-4 w-full"
            onClick={() => void onCopy()}
          >
            {copied ? "Copied" : "Copy clean text"}
          </Button>
        </section>
      ) : (
        <p className="mt-5 text-base text-muted">
          Tap Clean it. Then tap any word to hear it.
        </p>
      )}
    </AppShell>
  );
}
