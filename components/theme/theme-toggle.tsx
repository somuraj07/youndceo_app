"use client";

import { useTheme } from "@/components/theme/theme-provider";
import type { ThemePreference } from "@/lib/theme";

const OPTIONS: { value: ThemePreference; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "☀" },
  { value: "dark", label: "Dark", icon: "☾" },
  { value: "auto", label: "Auto", icon: "◐" },
];

type ThemeToggleProps = {
  compact?: boolean;
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { preference, setPreference } = useTheme();

  return (
    <div className={compact ? "" : "glass space-y-3 rounded-2xl p-5"}>
      {!compact ? (
        <div>
          <h2 className="font-semibold text-foreground">Appearance</h2>
          <p className="mt-1 text-sm text-muted">
            Light, dark, or match your device.
          </p>
        </div>
      ) : null}

      <div
        className={`grid grid-cols-3 gap-2 ${compact ? "" : ""}`}
        role="group"
        aria-label="Theme"
      >
        {OPTIONS.map((option) => {
          const active = preference === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setPreference(option.value)}
              className="theme-chip flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-xs font-medium transition"
              data-active={active}
              aria-pressed={active}
            >
              <span className="text-base leading-none" aria-hidden>
                {option.icon}
              </span>
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
