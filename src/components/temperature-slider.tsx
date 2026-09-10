import { formatTemp, tempHint, tempLabel } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const ZONES = [
  { value: 0, label: "Clean" },
  { value: 2, label: "Easy" },
  { value: 5, label: "Train" },
  { value: 7.5, label: "Hard" },
  { value: 10, label: "Drill" },
] as const;

export function TemperatureSlider() {
  const temperature = useAppStore((s) => s.temperature);
  const setTemperature = useAppStore((s) => s.setTemperature);
  const label = tempLabel(temperature);

  return (
    <section className="rounded-xl bg-paper p-5 shadow-card">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">Temperature</h2>
        <p className="tabular-nums text-accent">
          {label} · {formatTemp(temperature)}
        </p>
      </div>
      <p className="mt-1 text-base text-muted">{tempHint(temperature)}</p>

      <div className="mt-4 grid grid-cols-5 gap-1">
        {ZONES.map((z) => {
          const active = label === z.label;
          return (
            <button
              key={z.label}
              type="button"
              onClick={() => setTemperature(z.value)}
              className={`min-h-11 rounded-sm px-1 text-sm font-semibold ${
                active ? "bg-accent text-accent-fg" : "bg-bg text-fg"
              }`}
            >
              {z.label}
            </button>
          );
        })}
      </div>

      <label className="mt-4 block">
        <span className="sr-only">Temperature from 0 clean to 10 drill</span>
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={temperature}
          onChange={(e) => setTemperature(Number(e.target.value))}
          className="w-full"
        />
      </label>
    </section>
  );
}
