import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

export function SettingsHydrator() {
  const font = useAppStore((s) => s.font);
  const fontSize = useAppStore((s) => s.fontSize);
  const letterSpacing = useAppStore((s) => s.letterSpacing);
  const lineHeight = useAppStore((s) => s.lineHeight);

  useEffect(() => {
    const persist = useAppStore.persist;
    void Promise.resolve(persist.rehydrate()).finally(() => {
      useAppStore.getState().markReady();
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-size", `${fontSize}px`);
    root.style.setProperty("--app-tracking", `${letterSpacing}em`);
    root.style.setProperty("--app-leading", String(lineHeight));
    root.style.setProperty(
      "--app-font",
      font === "opendyslexic"
        ? '"OpenDyslexic", "Atkinson Hyperlegible", sans-serif'
        : '"Atkinson Hyperlegible", "Segoe UI", system-ui, sans-serif',
    );
  }, [font, fontSize, letterSpacing, lineHeight]);

  return null;
}

export function useSessionTimer() {
  const addMinutes = useAppStore((s) => s.addMinutes);
  const touchStreak = useAppStore((s) => s.touchStreak);

  useEffect(() => {
    touchStreak();
    let last = Date.now();
    const flush = () => {
      const now = Date.now();
      addMinutes((now - last) / 60000);
      last = now;
    };
    const id = window.setInterval(flush, 20000);
    return () => {
      window.clearInterval(id);
      flush();
    };
  }, [addMinutes, touchStreak]);
}
