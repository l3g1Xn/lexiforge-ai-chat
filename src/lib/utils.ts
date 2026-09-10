import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function tempLabel(temp: number): string {
  if (temp <= 0) return "Clean";
  if (temp <= 3) return "Easy";
  if (temp <= 6) return "Train";
  if (temp <= 8) return "Hard";
  return "Drill";
}

export function tempHint(temp: number): string {
  if (temp <= 0) return "Zero noise. Full helper.";
  if (temp <= 3) return "Light trainer. A few look-alikes.";
  if (temp <= 6) return "Working trainer. Short letter swaps.";
  if (temp <= 8) return "Hard trainer. Still readable.";
  return "Drill cards only. Chat stays readable.";
}

export function formatTemp(temp: number): string {
  return Number.isInteger(temp) ? String(temp) : temp.toFixed(1);
}
