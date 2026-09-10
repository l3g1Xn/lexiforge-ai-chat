export type ConfusionKind =
  | "lookalike-bd"
  | "lookalike-pq"
  | "lookalike-nu"
  | "lookalike-mw"
  | "adjacent-swap"
  | "transposition"
  | "function-flip";

export interface Token {
  id: string;
  original: string;
  display: string;
  noisy: boolean;
  kind?: ConfusionKind;
  hint?: string;
}

export const FUNCTION_FLIPS: Record<
  string,
  { alt: string; hint: string; kind: ConfusionKind }
> = {
  was: { alt: "saw", hint: "was / saw flip", kind: "function-flip" },
  saw: { alt: "was", hint: "was / saw flip", kind: "function-flip" },
  on: { alt: "no", hint: "on / no flip", kind: "function-flip" },
  no: { alt: "on", hint: "on / no flip", kind: "function-flip" },
  form: { alt: "from", hint: "form / from swap", kind: "adjacent-swap" },
  from: { alt: "form", hint: "form / from swap", kind: "adjacent-swap" },
};

const LOOKALIKE: Array<{
  a: string;
  b: string;
  kind: ConfusionKind;
  hint: string;
  minTemp: number;
}> = [
  { a: "b", b: "d", kind: "lookalike-bd", hint: "b/d look-alike", minTemp: 1 },
  { a: "d", b: "b", kind: "lookalike-bd", hint: "b/d look-alike", minTemp: 1 },
  { a: "p", b: "q", kind: "lookalike-pq", hint: "p/q look-alike", minTemp: 1 },
  { a: "q", b: "p", kind: "lookalike-pq", hint: "p/q look-alike", minTemp: 1 },
  { a: "n", b: "u", kind: "lookalike-nu", hint: "n/u look-alike", minTemp: 4 },
  { a: "u", b: "n", kind: "lookalike-nu", hint: "n/u look-alike", minTemp: 4 },
  { a: "m", b: "w", kind: "lookalike-mw", hint: "m/w look-alike", minTemp: 4 },
  { a: "w", b: "m", kind: "lookalike-mw", hint: "m/w look-alike", minTemp: 4 },
];

const URL_RE = /^https?:\/\/\S+$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WORD_RE = /^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/;

function hashSeed(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function isProtected(inner: string, wordIndex: number): boolean {
  if (URL_RE.test(inner) || EMAIL_RE.test(inner)) return true;
  if (/\d/.test(inner)) return true;
  if (/^[A-Z]{2,}$/.test(inner)) return true;
  if (wordIndex > 0 && /^[A-Z][a-z]+$/.test(inner)) return true;
  return false;
}

function applyLookalike(
  inner: string,
  temp: number,
  pick: () => number,
): { out: string; kind: ConfusionKind; hint: string } | null {
  const options = LOOKALIKE.filter((p) => p.minTemp <= temp);
  const lower = inner.toLowerCase();
  const hits: Array<{ i: number; pair: (typeof LOOKALIKE)[number] }> = [];
  for (let i = 0; i < lower.length; i++) {
    for (const pair of options) {
      if (lower[i] === pair.a) hits.push({ i, pair });
    }
  }
  if (!hits.length) return null;
  const hit = hits[Math.floor(pick() * hits.length)]!;
  const ch = inner[hit.i]!;
  const repl = ch === ch.toUpperCase() ? hit.pair.b.toUpperCase() : hit.pair.b;
  const out = inner.slice(0, hit.i) + repl + inner.slice(hit.i + 1);
  if (out === inner) return null;
  return { out, kind: hit.pair.kind, hint: hit.pair.hint };
}

function applyAdjacent(
  inner: string,
): { out: string; kind: ConfusionKind; hint: string } | null {
  if (inner.length < 4) return null;
  const i = Math.floor(inner.length / 2) - 1;
  if (i < 0 || i + 1 >= inner.length) return null;
  if (inner[i] === inner[i + 1]) return null;
  const out = inner.slice(0, i) + inner[i + 1] + inner[i] + inner.slice(i + 2);
  if (out.toLowerCase() === inner.toLowerCase()) return null;
  return { out, kind: "adjacent-swap", hint: "adjacent letter swap" };
}

function applyTransposition(
  inner: string,
): { out: string; kind: ConfusionKind; hint: string } | null {
  if (inner.length < 3 || inner.length > 5) return null;
  const i = inner.length - 2;
  if (inner[i] === inner[i + 1]) return null;
  const out =
    inner.slice(0, i) + inner[i + 1] + inner[i] + (inner[i + 2] ?? "");
  if (out.toLowerCase() === inner.toLowerCase()) return null;
  return { out, kind: "transposition", hint: "letter order" };
}

export function transformWord(
  inner: string,
  temp: number,
  pick: () => number,
): { out: string; kind: ConfusionKind; hint: string } | null {
  const lower = inner.toLowerCase();
  const flip = FUNCTION_FLIPS[lower];
  const candidates: Array<{ out: string; kind: ConfusionKind; hint: string }> =
    [];

  if (temp >= 7 && flip) {
    const cap = inner[0] === inner[0]?.toUpperCase();
    const alt = cap ? flip.alt[0]!.toUpperCase() + flip.alt.slice(1) : flip.alt;
    candidates.push({ out: alt, kind: flip.kind, hint: flip.hint });
  }

  const look = applyLookalike(inner, temp, pick);
  if (look) candidates.push(look);
  if (temp >= 4) {
    const adj = applyAdjacent(inner);
    if (adj) candidates.push(adj);
    const tr = applyTransposition(inner);
    if (tr) candidates.push(tr);
  }
  if (!candidates.length) return null;
  return candidates[Math.floor(pick() * candidates.length)]!;
}

function splitSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).filter((p) => p.length > 0);
}

function countWords(sentence: string): number {
  return sentence.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
}

function noiseBudget(temp: number, sentenceCount: number): number {
  if (temp <= 0 || temp >= 9) return 0;
  if (temp <= 3) return Math.max(1, Math.ceil(sentenceCount / 3));
  if (temp <= 6) return Math.max(1, sentenceCount);
  return Math.max(1, Math.round(sentenceCount * 1.4));
}

export function applyNoise(text: string, temperature: number): Token[] {
  const temp = temperature >= 9 ? 0 : temperature;
  const sentences = splitSentences(text);
  const budget = noiseBudget(temp, sentences.length);
  const pick = rng(hashSeed(`${text}|${temp}`));

  const pieces: Array<{ raw: string; sentenceIndex: number }> = [];
  sentences.forEach((sentence, si) => {
    if (si > 0) pieces.push({ raw: " ", sentenceIndex: si });
    for (const raw of sentence.split(/(\s+)/)) {
      pieces.push({ raw, sentenceIndex: si });
    }
  });

  type Slot = {
    tokenIndex: number;
    sentenceIndex: number;
    inner: string;
    pre: string;
    post: string;
  };

  const slots: Slot[] = [];
  pieces.forEach((t, tokenIndex) => {
    if (/^\s+$/.test(t.raw)) return;
    const m = t.raw.match(WORD_RE);
    if (!m) return;
    const inner = m[2]!;
    const wordIndex = pieces
      .slice(0, tokenIndex)
      .filter((x) => x.sentenceIndex === t.sentenceIndex && !/^\s+$/.test(x.raw))
      .length;
    if (isProtected(inner, wordIndex)) return;
    if (inner.length < 3 && !FUNCTION_FLIPS[inner.toLowerCase()]) return;
    if (temp < 7 && inner.length < 3) return;
    slots.push({
      tokenIndex,
      sentenceIndex: t.sentenceIndex,
      inner,
      pre: m[1] ?? "",
      post: m[3] ?? "",
    });
  });

  const usedSentences = new Set<number>();
  const chosen = new Map<
    number,
    { out: string; kind: ConfusionKind; hint: string; pre: string; post: string }
  >();
  const shuffled = [...slots].sort(() => pick() - 0.5);

  function trySlot(slot: Slot): boolean {
    if (chosen.has(slot.tokenIndex)) return false;
    const short = countWords(sentences[slot.sentenceIndex] ?? "") <= 8;
    if (temp <= 6 && short && usedSentences.has(slot.sentenceIndex)) return false;
    const change = transformWord(
      slot.inner,
      temp,
      rng(hashSeed(slot.inner + String(temp) + String(slot.tokenIndex))),
    );
    if (!change) return false;
    chosen.set(slot.tokenIndex, {
      ...change,
      pre: slot.pre,
      post: slot.post,
    });
    usedSentences.add(slot.sentenceIndex);
    return true;
  }

  for (const slot of shuffled) {
    if (chosen.size >= budget) break;
    trySlot(slot);
  }

  if (temp > 0 && temp < 9 && chosen.size < budget) {
    for (const slot of shuffled) {
      if (chosen.size >= budget) break;
      trySlot(slot);
    }
  }

  return pieces.map((t, i) => {
    const change = chosen.get(i);
    if (!change) {
      return { id: `t${i}`, original: t.raw, display: t.raw, noisy: false };
    }
    return {
      id: `t${i}`,
      original: t.raw,
      display: change.pre + change.out + change.post,
      noisy: true,
      kind: change.kind,
      hint: change.hint,
    };
  });
}

export function tokensToText(tokens: Token[], clean: boolean): string {
  return tokens.map((t) => (clean || !t.noisy ? t.original : t.display)).join("");
}

export function noisyCount(tokens: Token[]): number {
  return tokens.filter((t) => t.noisy).length;
}
