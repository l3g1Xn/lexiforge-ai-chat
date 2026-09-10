import { interpretLocal } from "@/lib/correct";
import { PRACTICE_LINES } from "@/lib/practice";
import { LEXI_INSTRUCTION, SIGN_MEANINGS, WORD_MEANINGS } from "./instruction";

export { LEXI_INSTRUCTION };

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function classify(
  text: string,
  parsedChanged: boolean,
): "greet" | "read" | "write" | "practice" | "word" | "hard" | "thanks" | "chat" {
  const t = normalize(text);
  if (/^(hi|hello|hey|yo)\b/.test(t) && t.split(" ").length <= 4) return "greet";
  if (/\b(too hard|too fast|slow down|easier)\b/.test(t)) return "hard";
  if (/\b(thank|thanks|thx)\b/.test(t)) return "thanks";
  if (/\b(help me read|clean this|what does this|what is this sign|read this)\b/.test(t)) return "read";
  if (/\b(help me write|how do i spell|spell |write this|write a)\b/.test(t)) return "write";
  if (/\b(practice|drill|train|quiz)\b/.test(t)) return "practice";
  if (/^(what (is|does)|define|meaning of)\b/.test(t)) return "word";
  if (parsedChanged && t.split(" ").length >= 3) return "read";
  if (t.split(" ").length >= 10) return "read";
  return "chat";
}

function askedWord(text: string): string | null {
  const m = text.match(/\b(?:what (?:is|does)|define|meaning of)\s+([A-Za-z']+)/i);
  return m?.[1]?.toLowerCase() ?? null;
}

function meaningFor(clean: string): string {
  const n = normalize(clean);
  const wordCount = n.split(" ").filter(Boolean).length;
  if (wordCount <= 8) {
    for (const [k, v] of Object.entries(SIGN_MEANINGS)) {
      if (n === k || n.includes(k)) return v;
    }
  }
  const first = clean.split(/(?<=[.!?])\s+/)[0] ?? clean;
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    const key = words[0]!.toLowerCase().replace(/[^a-z']/g, "");
    if (WORD_MEANINGS[key]) return WORD_MEANINGS[key];
  }
  return first.length > 120 ? `${first.slice(0, 117).trim()}…` : first;
}

export function interpretOnDevice(text: string): {
  clean: string;
  meaning: string;
  changed: boolean;
} {
  const local = interpretLocal(text);
  return {
    clean: local.clean,
    meaning: meaningFor(local.clean),
    changed: local.changed,
  };
}

export function coachOnDevice(
  userText: string,
  turn: number,
): { reply: string; userClean: string | null } {
  const parsed = interpretOnDevice(userText);
  const userClean = parsed.changed ? parsed.clean : null;
  const intent = classify(parsed.clean || userText, parsed.changed);
  const a = PRACTICE_LINES[turn % PRACTICE_LINES.length]!;
  const b = PRACTICE_LINES[(turn + 1) % PRACTICE_LINES.length]!;

  let reply: string;
  switch (intent) {
    case "greet":
      reply = "Hello.\nI can help you read and write.\nPaste a sign, or we can practice here.";
      break;
    case "hard":
      reply = "We can go easier.\nOn Home, move Temperature down.\nClean mode is always there if you need the real words.";
      break;
    case "thanks":
      reply = "You are welcome.\nTap a marked word any time you want to check it.";
      break;
    case "read":
      reply = `${parsed.meaning}\nYou can also paste the text on Help me read this.\n${a}`;
      break;
    case "write":
      reply = userClean
        ? `You can copy this: ${parsed.clean}\nKeep the short words. One idea per line.`
        : `Tell me the sentence you want.\nI will show a clean version you can copy.`;
      break;
    case "practice":
      reply = `Here are two short lines.\n${a}\n${b}`;
      break;
    case "word": {
      const w = askedWord(parsed.clean) ?? askedWord(userText);
      const def = (w && WORD_MEANINGS[w]) || parsed.meaning;
      reply = w ? `${w}: ${def}\n${a}` : `${def}\n${a}`;
      break;
    }
    default:
      reply = userClean
        ? `I can help with that.\n${a}\n${b}`
        : `I can help with that.\n${a}\n${b}`;
  }

  return { reply, userClean };
}
