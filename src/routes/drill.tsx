import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { pickDrill, type DrillCard } from "@/lib/drill-bank";
import { formatTemp } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export const Route = createFileRoute("/drill")({ component: DrillPage });

type Phase = "play" | "done";

function DrillPage() {
  const [cards] = useState<DrillCard[]>(() => pickDrill(10));
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [typed, setTyped] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [locked, setLocked] = useState(false);
  const [tooHard, setTooHard] = useState(false);
  const [started] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("play");

  const recordPractice = useAppStore((s) => s.recordPractice);
  const offerSuggestion = useAppStore((s) => s.offerSuggestion);
  const suggestedTemp = useAppStore((s) => s.suggestedTemp);
  const temperature = useAppStore((s) => s.temperature);
  const acceptSuggestion = useAppStore((s) => s.acceptSuggestion);
  const touchStreak = useAppStore((s) => s.touchStreak);

  const card = cards[index];
  const total = cards.length;

  useEffect(() => {
    touchStreak();
  }, [touchStreak]);

  function finish(nextCorrect: number, frustrated: boolean) {
    const ms = Date.now() - started;
    setElapsed(ms);
    setPhase("done");
    offerSuggestion(nextCorrect / total, frustrated || tooHard);
  }

  function advance(ok: boolean, kind: string) {
    if (locked) return;
    setLocked(true);
    const nextCorrect = correct + (ok ? 1 : 0);
    setCorrect(nextCorrect);
    if (ok) {
      setFeedback(`Yes — ${card?.noisy} / ${card?.answer}. Nice catch.`);
      recordPractice(kind);
    } else {
      setFeedback(`It is ${card?.answer}. ${card?.hint}.`);
    }
    window.setTimeout(() => {
      setFeedback(null);
      setTyped("");
      setLocked(false);
      if (index + 1 >= total) finish(nextCorrect, false);
      else setIndex((i) => i + 1);
    }, 900);
  }

  const seconds = Math.round(elapsed / 1000);
  const timeLabel = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

  const speakText = useMemo(() => {
    if (phase === "done") {
      return `Drill done. ${correct} correct. Time ${timeLabel}.`;
    }
    return `Two minute drill. Card ${index + 1} of ${total}. ${card?.prompt ?? ""} The word looks like ${card?.noisy ?? ""}.`;
  }, [phase, correct, timeLabel, index, total, card]);

  if (phase === "done") {
    return (
      <AppShell title="Drill" speakText={speakText} back>
        <section className="rounded-xl bg-paper p-5 shadow-card">
          <h2 className="text-xl font-semibold">Done</h2>
          <ul className="mt-4 grid gap-3">
            <li className="rounded-md bg-bg px-4 py-3">
              <p className="text-base text-muted">Correct</p>
              <p className="tabular-nums text-2xl font-semibold">
                {correct} of {total}
              </p>
            </li>
            <li className="rounded-md bg-bg px-4 py-3">
              <p className="text-base text-muted">Time</p>
              <p className="tabular-nums text-2xl font-semibold">{timeLabel}</p>
            </li>
            <li className="rounded-md bg-bg px-4 py-3">
              <p className="text-base text-muted">Suggested temp tomorrow</p>
              <p className="text-2xl font-semibold">
                {suggestedTemp == null
                  ? formatTemp(temperature)
                  : formatTemp(suggestedTemp)}
              </p>
            </li>
          </ul>
          <div className="mt-5 grid gap-2">
            {suggestedTemp != null ? (
              <Button type="button" onClick={acceptSuggestion}>
                Use {formatTemp(suggestedTemp)}
              </Button>
            ) : null}
            <Button asChild variant="secondary">
              <Link to="/">Home</Link>
            </Button>
          </div>
        </section>
      </AppShell>
    );
  }

  if (!card) return null;

  return (
    <AppShell title="2-minute drill" speakText={speakText} back>
      <p className="mb-4 tabular-nums text-base text-muted">
        {index + 1} of {total}
      </p>
      <section className="rounded-xl bg-paper p-5 shadow-card">
        <p className="text-base text-muted">{card.prompt}</p>
        <p className="mt-4 text-center text-4xl font-semibold tracking-wide">
          {card.noisy}
        </p>
        {card.options ? (
          <div className="mt-6 grid gap-2">
            {card.options.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant="secondary"
                size="giant"
                disabled={locked}
                onClick={() => advance(opt === card.answer, card.kind)}
              >
                {opt}
              </Button>
            ))}
          </div>
        ) : (
          <form
            className="mt-6 grid gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              advance(
                typed.trim().toLowerCase() === card.answer.toLowerCase(),
                card.kind,
              );
            }}
          >
            <label>
              <span className="sr-only">Type the clean word</span>
              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="min-h-16 w-full px-4 text-xl"
                disabled={locked}
              />
            </label>
            <Button type="submit" disabled={locked || !typed.trim()}>
              Check
            </Button>
          </form>
        )}
        {feedback ? <p className="mt-4">{feedback}</p> : null}
      </section>
      <Button
        type="button"
        variant="ghost"
        className="mt-4"
        onClick={() => {
          setTooHard(true);
          finish(correct, true);
        }}
      >
        Too hard
      </Button>
    </AppShell>
  );
}
