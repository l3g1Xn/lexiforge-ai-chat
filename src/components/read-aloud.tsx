import { Volume2 } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { speak, stopSpeaking } from "@/lib/speech";

export function ReadAloud({ text }: { text: string }) {
  useEffect(() => () => stopSpeaking(), []);
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      aria-label="Read this screen aloud"
      onClick={() => speak(text)}
    >
      <Volume2 className="size-5 shrink-0" aria-hidden="true" />
      Read page
    </Button>
  );
}
