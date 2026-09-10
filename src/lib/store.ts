import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clamp, formatTemp, todayKey } from "./utils";

export type FontChoice = "atkinson" | "opendyslexic";

export interface SessionNote {
  date: string;
  temp: number;
  words: number;
}

interface AppState {
  ready: boolean;
  temperature: number;
  font: FontChoice;
  fontSize: number;
  letterSpacing: number;
  lineHeight: number;
  showClean: boolean;
  streak: number;
  lastActiveDate: string | null;
  lastSession: SessionNote | null;
  wordsPracticed: number;
  confusionLog: string[];
  minutesByDate: Record<string, number>;
  suggestedTemp: number | null;
  markReady: () => void;
  setTemperature: (n: number) => void;
  setFont: (font: FontChoice) => void;
  setFontSize: (n: number) => void;
  setLetterSpacing: (n: number) => void;
  setLineHeight: (n: number) => void;
  setShowClean: (v: boolean) => void;
  recordPractice: (kind: string, count?: number) => void;
  addMinutes: (delta: number) => void;
  touchStreak: () => void;
  offerSuggestion: (accuracy: number, tooHard: boolean) => void;
  acceptSuggestion: () => void;
  dismissSuggestion: () => void;
}

const DEFAULTS = {
  temperature: 2,
  font: "atkinson" as FontChoice,
  fontSize: 20,
  letterSpacing: 0.05,
  lineHeight: 1.75,
  showClean: false,
  streak: 0,
  lastActiveDate: null as string | null,
  lastSession: null as SessionNote | null,
  wordsPracticed: 0,
  confusionLog: [] as string[],
  minutesByDate: {} as Record<string, number>,
  suggestedTemp: null as number | null,
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ready: false,
      ...DEFAULTS,
      markReady: () => set({ ready: true }),
      setTemperature: (n) =>
        set({ temperature: clamp(Math.round(n * 2) / 2, 0, 10) }),
      setFont: (font) => set({ font }),
      setFontSize: (n) => set({ fontSize: clamp(n, 18, 28) }),
      setLetterSpacing: (n) => set({ letterSpacing: clamp(n, 0.02, 0.16) }),
      setLineHeight: (n) => set({ lineHeight: clamp(n, 1.5, 2.2) }),
      setShowClean: (v) => set({ showClean: v }),
      recordPractice: (kind, count = 1) => {
        const today = todayKey();
        const log = [kind, ...get().confusionLog.filter((k) => k !== kind)].slice(0, 20);
        const words = get().wordsPracticed + count;
        set({
          confusionLog: log,
          wordsPracticed: words,
          lastSession: { date: today, temp: get().temperature, words },
        });
      },
      addMinutes: (delta) => {
        if (delta <= 0) return;
        const today = todayKey();
        const minutesByDate = {
          ...get().minutesByDate,
          [today]: (get().minutesByDate[today] ?? 0) + delta,
        };
        set({ minutesByDate });
      },
      touchStreak: () => {
        const today = todayKey();
        const last = get().lastActiveDate;
        if (last === today) return;
        const yest = todayKey(new Date(Date.now() - 86400000));
        const streak = last === yest ? get().streak + 1 : 1;
        set({ lastActiveDate: today, streak });
      },
      offerSuggestion: (accuracy, tooHard) => {
        const current = get().temperature;
        let next = current;
        if (tooHard || accuracy < 0.6) next = clamp(current - 1, 0, 10);
        else if (accuracy >= 0.85) next = clamp(current + 0.5, 0, 10);
        next = Math.round(next * 2) / 2;
        set({ suggestedTemp: next === current ? null : next });
      },
      acceptSuggestion: () => {
        const next = get().suggestedTemp;
        if (next == null) return;
        set({ temperature: next, suggestedTemp: null });
      },
      dismissSuggestion: () => set({ suggestedTemp: null }),
    }),
    {
      name: "lexiforge-v1",
      skipHydration: true,
      partialize: (s) => ({
        temperature: s.temperature,
        font: s.font,
        fontSize: s.fontSize,
        letterSpacing: s.letterSpacing,
        lineHeight: s.lineHeight,
        showClean: s.showClean,
        streak: s.streak,
        lastActiveDate: s.lastActiveDate,
        lastSession: s.lastSession,
        wordsPracticed: s.wordsPracticed,
        confusionLog: s.confusionLog,
        minutesByDate: s.minutesByDate,
        suggestedTemp: s.suggestedTemp,
      }),
    },
  ),
);

export function sessionLine(state: Pick<AppState, "streak" | "temperature" | "lastSession" | "wordsPracticed">): string {
  const days = state.streak || 1;
  const temp = formatTemp(state.lastSession?.temp ?? state.temperature);
  const words = state.lastSession?.words ?? state.wordsPracticed;
  const dayWord = days === 1 ? "day" : "days";
  return `${days} ${dayWord}, temp ${temp}, ${words} words practiced`;
}
