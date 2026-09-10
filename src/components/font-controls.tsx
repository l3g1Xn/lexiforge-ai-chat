import { useAppStore, type FontChoice } from "@/lib/store";

function Row({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mt-3 block">
      <span className="flex justify-between text-base text-muted">
        <span>{label}</span>
        <span className="tabular-nums text-fg">{value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
    </label>
  );
}

export function FontControls() {
  const font = useAppStore((s) => s.font);
  const fontSize = useAppStore((s) => s.fontSize);
  const letterSpacing = useAppStore((s) => s.letterSpacing);
  const lineHeight = useAppStore((s) => s.lineHeight);
  const setFont = useAppStore((s) => s.setFont);
  const setFontSize = useAppStore((s) => s.setFontSize);
  const setLetterSpacing = useAppStore((s) => s.setLetterSpacing);
  const setLineHeight = useAppStore((s) => s.setLineHeight);

  const fonts: Array<{ id: FontChoice; label: string }> = [
    { id: "atkinson", label: "Atkinson" },
    { id: "opendyslexic", label: "OpenDyslexic" },
  ];

  return (
    <section className="rounded-xl bg-paper p-5 shadow-card">
      <h2 className="text-lg font-semibold">Reading comfort</h2>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {fonts.map((f) => {
          const active = font === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFont(f.id)}
              className={`min-h-14 rounded-md px-3 font-medium ${
                active ? "bg-accent text-accent-fg" : "bg-bg text-fg"
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>
      <Row
        label="Size"
        value={fontSize}
        min={18}
        max={28}
        step={1}
        onChange={setFontSize}
      />
      <Row
        label="Letter space"
        value={Number(letterSpacing.toFixed(2))}
        min={0.02}
        max={0.16}
        step={0.01}
        onChange={setLetterSpacing}
      />
      <Row
        label="Line height"
        value={Number(lineHeight.toFixed(2))}
        min={1.5}
        max={2.2}
        step={0.05}
        onChange={setLineHeight}
      />
    </section>
  );
}
