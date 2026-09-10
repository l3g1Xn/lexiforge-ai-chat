import { FUNCTION_FLIPS } from "./noise";
import { LEXICON } from "./offline/lexicon";
import { MISSPELLINGS } from "./offline/misspellings";

const LOOK = [
  ["b", "d"],
  ["d", "b"],
  ["p", "q"],
  ["q", "p"],
  ["n", "u"],
  ["u", "n"],
  ["m", "w"],
  ["w", "m"],
] as const;

function splitAffix(token: string): { pre: string; inner: string; post: string } | null {
  const m = token.match(/^([^A-Za-z]*)([A-Za-z']+)([^A-Za-z]*)$/);
  if (!m) return null;
  return { pre: m[1] ?? "", inner: m[2]!, post: m[3] ?? "" };
}

function matchCase(sample: string, next: string): string {
  if (!sample) return next;
  if (sample === sample.toUpperCase()) return next.toUpperCase();
  if (sample[0] === sample[0]?.toUpperCase()) {
    return next[0]!.toUpperCase() + next.slice(1);
  }
  return next.toLowerCase();
}

function inDict(word: string): boolean {
  return LEXICON.has(word.toLowerCase());
}

export function correctWord(token: string): string {
  const parts = splitAffix(token);
  if (!parts) return token;
  const { pre, inner, post } = parts;
  const lower = inner.toLowerCase().replace(/'/g, "");
  const mapped = MISSPELLINGS[lower];
  if (mapped) return pre + matchCase(inner, mapped) + post;
  if (inDict(inner) || inDict(lower)) return token;

  const flip = FUNCTION_FLIPS[lower];
  if (flip && inDict(flip.alt)) return pre + matchCase(inner, flip.alt) + post;

  for (let i = 0; i < lower.length; i++) {
    for (const [a, b] of LOOK) {
      if (lower[i] !== a) continue;
      const trial = lower.slice(0, i) + b + lower.slice(i + 1);
      if (inDict(trial)) return pre + matchCase(inner, trial) + post;
    }
  }

  if (lower.length >= 4) {
    const i = Math.floor(lower.length / 2) - 1;
    const swapped = lower.slice(0, i) + lower[i + 1] + lower[i] + lower.slice(i + 2);
    if (inDict(swapped)) return pre + matchCase(inner, swapped) + post;
  }

  if (lower.length >= 3) {
    const i = lower.length - 2;
    const swapped = lower.slice(0, i) + lower[i + 1] + lower[i] + (lower[i + 2] ?? "");
    if (inDict(swapped)) return pre + matchCase(inner, swapped) + post;
  }

  return token;
}

function fixSentences(text: string): string {
  const compact = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  return compact
    .split(/([.!?]\s+|\n+)/)
    .map((chunk, i, arr) => {
      if (i % 2 === 1) return chunk;
      const t = chunk.trimStart();
      if (!t) return chunk;
      const lead = chunk.slice(0, chunk.length - t.length);
      if (/^[a-z]/.test(t)) return lead + t[0]!.toUpperCase() + t.slice(1);
      if (i === 0 && arr.length && /^i\b/i.test(t)) {
        return lead + "I" + t.slice(1);
      }
      return chunk;
    })
    .join("")
    .replace(/\bi\b/g, "I");
}

export function interpretLocal(text: string): {
  clean: string;
  meaning: string;
  changed: boolean;
} {
  const cleanedWords = text
    .split(/(\s+)/)
    .map((tok) => (/^\s+$/.test(tok) ? tok : correctWord(tok)))
    .join("");
  const clean = fixSentences(cleanedWords);
  const first = clean.split(/(?<=[.!?])\s+/)[0] ?? clean;
  const meaning =
    first.length > 120 ? `${first.slice(0, 117).trim()}…` : first;
  return { clean, meaning, changed: clean !== text };
}

export function looksMessy(text: string): boolean {
  return interpretLocal(text).changed;
}
