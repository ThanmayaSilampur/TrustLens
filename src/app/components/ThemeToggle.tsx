import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "../lib/ThemeContext";

type Option = { value: "dark" | "light" | "system"; icon: typeof Sun; label: string };

const OPTIONS: Option[] = [
  { value: "light",  icon: Sun,     label: "Light"  },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark",   icon: Moon,    label: "Dark"   },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="flex items-center rounded-lg overflow-hidden mb-3"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        padding: "3px",
        gap: "2px",
      }}
    >
      {OPTIONS.map(({ value, icon: Icon, label }) => {
        const isActive = theme === value;
        return (
          <button
            key={value}
            id={`theme-btn-${value}`}
            title={label}
            onClick={() => setTheme(value)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer"
            style={{
              background: isActive
                ? "linear-gradient(135deg, rgba(59,130,246,0.25), rgba(139,92,246,0.18))"
                : "transparent",
              border: isActive
                ? "1px solid rgba(59,130,246,0.35)"
                : "1px solid transparent",
              color: isActive ? "#93c5fd" : "var(--text-muted)",
              boxShadow: isActive ? "0 0 10px rgba(59,130,246,0.15)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }
            }}
          >
            <Icon size={12} strokeWidth={2} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
