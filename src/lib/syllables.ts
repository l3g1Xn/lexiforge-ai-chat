const WORD_RE = /^([^A-Za-z]*)([A-Za-z]+)([^A-Za-z]*)$/;

export function syllabify(word: string): string[] {
  const core = word;
  if (core.length <= 3) return [core];
  const parts = core.match(
    /[^aeiouy]*[aeiouy]+(?:[^aeiouy]*$|[^aeiouy](?=[^aeiouy]))?/gi,
  );
  if (!parts || parts.length < 2) {
    const mid = Math.ceil(core.length / 2);
    return [core.slice(0, mid), core.slice(mid)];
  }
  return parts;
}

export function chunkText(text: string): string {
  return text
    .split(/(\s+)/)
    .map((tok) => {
      if (/^\s+$/.test(tok)) return tok;
      const m = tok.match(WORD_RE);
      if (!m) return tok;
      return `${m[1]}${syllabify(m[2]!).join(" · ")}${m[3]}`;
    })
    .join("");
}

export function splitSpeakableWords(text: string): string[] {
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}
