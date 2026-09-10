import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, MessageSquare, Timer } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { FontControls } from "@/components/font-controls";
import { TemperatureSlider } from "@/components/temperature-slider";
import { Button } from "@/components/ui/button";
import { formatTemp, tempLabel } from "@/lib/utils";
import { sessionLine, useAppStore } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const temperature = useAppStore((s) => s.temperature);
  const streak = useAppStore((s) => s.streak);
  const lastSession = useAppStore((s) => s.lastSession);
  const wordsPracticed = useAppStore((s) => s.wordsPracticed);
  const suggestedTemp = useAppStore((s) => s.suggestedTemp);
  const acceptSuggestion = useAppStore((s) => s.acceptSuggestion);
  const dismissSuggestion = useAppStore((s) => s.dismissSuggestion);

  const note = sessionLine({ streak, temperature, lastSession, wordsPracticed });
  const speakText = `LexiForge home. Temperature is ${tempLabel(temperature)}, ${formatTemp(temperature)}. Help me read this. Talk or write with me. Two minute drill. ${note}. This is a practice tool and a reading helper. It does not diagnose or treat dyslexia.`;

  return (
    <AppShell title="LexiForge" speakText={speakText}>
      <p className="mb-5 text-lg text-muted">
        Read. Write. Practice. Works on this device.
      </p>

      <TemperatureSlider />

      {suggestedTemp != null ? (
        <div className="mt-4 rounded-lg bg-paper p-4 shadow-card">
          <p>
            Try {formatTemp(suggestedTemp)} tomorrow? You choose.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={acceptSuggestion}>
              Use {formatTemp(suggestedTemp)}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={dismissSuggestion}
            >
              Keep {formatTemp(temperature)}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="mt-5 grid gap-3">
        <Button asChild variant="primary" size="giant">
          <Link to="/read">
            <BookOpen className="size-7 shrink-0" aria-hidden="true" />
            <span>
              <span className="block">Help me read this</span>
              <span className="block text-base font-normal opacity-90">
                Clean a sign or message
              </span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="giant">
          <Link to="/chat">
            <MessageSquare className="size-7 shrink-0" aria-hidden="true" />
            <span>
              <span className="block">Talk / write with me</span>
              <span className="block text-base font-normal text-muted">
                {temperature >= 9
                  ? "Chat stays readable in drill mode"
                  : "Short chat with a few marked words"}
              </span>
            </span>
          </Link>
        </Button>
        <Button asChild variant="secondary" size="giant">
          <Link to="/drill">
            <Timer className="size-7 shrink-0" aria-hidden="true" />
            <span>
              <span className="block">2-minute drill</span>
              <span className="block text-base font-normal text-muted">
                Quick cards. Then stop.
              </span>
            </span>
          </Link>
        </Button>
      </div>

      <p className="mt-5 text-base text-muted">{note}</p>

      <div className="mt-5">
        <FontControls />
      </div>

      <p className="mt-6 text-base text-muted">
        This is a practice tool and a reading helper. It does not diagnose or
        treat dyslexia. You control how hard it is. Use Clean mode whenever you
        need the real words.
      </p>
    </AppShell>
  );
}
