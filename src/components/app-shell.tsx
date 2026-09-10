import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";
import { ReadAloud } from "@/components/read-aloud";
import { ShowCleanToggle } from "@/components/show-clean-toggle";
import { useSessionTimer } from "@/components/settings-hydrator";

export function AppShell({
  title,
  speakText,
  children,
  back,
}: {
  title: string;
  speakText: string;
  children: ReactNode;
  back?: boolean;
}) {
  useSessionTimer();

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <header className="sticky top-0 z-20 border-b border-border bg-bg/95 backdrop-blur-sm">
        <div className="readable-col mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            {back ? (
              <Link
                to="/"
                aria-label="Back to home"
                className="inline-flex size-14 items-center justify-center rounded-md text-fg"
              >
                <ArrowLeft className="size-6" aria-hidden="true" />
              </Link>
            ) : null}
            <h1 className="min-w-0 flex-1 text-xl font-semibold">{title}</h1>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <ShowCleanToggle />
            <ReadAloud text={speakText} />
          </div>
        </div>
      </header>
      <main className="readable-col mx-auto px-4 py-5 pb-16">{children}</main>
    </div>
  );
}
