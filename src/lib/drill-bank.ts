export type DrillCard = {
  id: string;
  kind: string;
  hint: string;
  prompt: string;
  noisy: string;
  answer: string;
  options?: string[];
};

export const DRILL_BANK: DrillCard[] = [
  { id: "the1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "teh", answer: "the", options: ["the", "teh", "hte"] },
  { id: "was1", kind: "was/saw", hint: "was / saw flip", prompt: "Which means \"existed\"?", noisy: "saw", answer: "was", options: ["was", "saw"] },
  { id: "on1", kind: "on/no", hint: "on / no flip", prompt: "Which sits on a table?", noisy: "no", answer: "on", options: ["on", "no"] },
  { id: "form1", kind: "form/from", hint: "form / from swap", prompt: "Which is a paper to fill in?", noisy: "from", answer: "form", options: ["form", "from"] },
  { id: "bd1", kind: "b/d", hint: "b/d look-alike", prompt: "Which is an animal?", noisy: "bog", answer: "dog", options: ["dog", "bog"] },
  { id: "bd2", kind: "b/d", hint: "b/d look-alike", prompt: "Which do you sleep on?", noisy: "ded", answer: "bed", options: ["bed", "ded"] },
  { id: "pq1", kind: "p/q", hint: "p/q look-alike", prompt: "Which is a cooking pan?", noisy: "qan", answer: "pan", options: ["pan", "qan"] },
  { id: "bd3", kind: "b/d", hint: "b/d look-alike", prompt: "Which means large?", noisy: "dig", answer: "big", options: ["big", "dig"] },
  { id: "there1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "tehre", answer: "there", options: ["there", "tehre", "three"] },
  { id: "with1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "wiht", answer: "with", options: ["with", "wiht"] },
  { id: "and1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "adn", answer: "and", options: ["and", "adn"] },
  { id: "from2", kind: "form/from", hint: "form / from swap", prompt: "Which means \"out of\"?", noisy: "form", answer: "from", options: ["from", "form"] },
  { id: "type-the", kind: "transposition", hint: "letter order", prompt: "Type the clean word.", noisy: "teh", answer: "the" },
  { id: "type-dog", kind: "b/d", hint: "b/d look-alike", prompt: "Type the clean word.", noisy: "bog", answer: "dog" },
  { id: "type-form", kind: "form/from", hint: "form / from swap", prompt: "Type the clean word.", noisy: "from", answer: "form" },
  { id: "type-was", kind: "was/saw", hint: "was / saw flip", prompt: "Type the word that means “existed”.", noisy: "saw", answer: "was" },
  { id: "pq2", kind: "p/q", hint: "p/q look-alike", prompt: "Which do you drink from?", noisy: "cuq", answer: "cup", options: ["cup", "cuq"] },
  { id: "nu1", kind: "n/u", hint: "n/u look-alike", prompt: "Which is a number word?", noisy: "uine", answer: "nine", options: ["nine", "uine"] },
  { id: "mw1", kind: "m/w", hint: "m/w look-alike", prompt: "Which is a farm animal?", noisy: "com", answer: "cow", options: ["cow", "com"] },
  { id: "type-bed", kind: "b/d", hint: "b/d look-alike", prompt: "Type the clean word.", noisy: "deb", answer: "bed" },
  { id: "bd4", kind: "b/d", hint: "b/d look-alike", prompt: "Which do you read?", noisy: "dook", answer: "book", options: ["book", "dook"] },
  { id: "pq3", kind: "p/q", hint: "p/q look-alike", prompt: "Which is a page part?", noisy: "qage", answer: "page", options: ["page", "qage"] },
  { id: "nu2", kind: "n/u", hint: "n/u look-alike", prompt: "Pick the usual word.", noisy: "uame", answer: "name", options: ["name", "uame"] },
  { id: "mw2", kind: "m/w", hint: "m/w look-alike", prompt: "Which is a person?", noisy: "wan", answer: "man", options: ["man", "wan"] },
  { id: "the2", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "hte", answer: "the", options: ["the", "hte"] },
  { id: "and2", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "nad", answer: "and", options: ["and", "nad"] },
  { id: "was2", kind: "was/saw", hint: "was / saw flip", prompt: "Which means looked?", noisy: "was", answer: "saw", options: ["saw", "was"] },
  { id: "type-please", kind: "transposition", hint: "letter order", prompt: "Type the clean word.", noisy: "plese", answer: "please" },
  { id: "type-hello", kind: "transposition", hint: "letter order", prompt: "Type the clean word.", noisy: "helo", answer: "hello" },
  { id: "type-need", kind: "transposition", hint: "letter order", prompt: "Type the clean word.", noisy: "ned", answer: "need" },
  { id: "type-read", kind: "lookalike", hint: "letter mix", prompt: "Type the clean word.", noisy: "raed", answer: "read" },
  { id: "stop1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "sotp", answer: "stop", options: ["stop", "sotp"] },
  { id: "open1", kind: "transposition", hint: "letter order", prompt: "Pick the usual word.", noisy: "opne", answer: "open", options: ["open", "opne"] },
  { id: "exit1", kind: "lookalike", hint: "letter mix", prompt: "Which means the way out?", noisy: "exlt", answer: "exit", options: ["exit", "exlt"] },
  { id: "left1", kind: "transposition", hint: "letter order", prompt: "Pick the side word.", noisy: "letf", answer: "left", options: ["left", "letf"] },
];

export function pickDrill(count = 10): DrillCard[] {
  const copy = [...DRILL_BANK];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(count, copy.length));
}
