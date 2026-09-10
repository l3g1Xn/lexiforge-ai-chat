import { Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/lib/store";

export function ShowCleanToggle() {
  const showClean = useAppStore((s) => s.showClean);
  const setShowClean = useAppStore((s) => s.setShowClean);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={showClean}
      onClick={() => setShowClean(!showClean)}
      className={`inline-flex min-h-11 items-center gap-2 rounded-sm px-3 text-base font-medium ${
        showClean ? "bg-accent text-accent-fg" : "bg-paper text-fg shadow-card"
      }`}
    >
      {showClean ? (
        <Eye className="size-5 shrink-0" aria-hidden="true" />
      ) : (
        <EyeOff className="size-5 shrink-0" aria-hidden="true" />
      )}
      Show clean
    </button>
  );
}
