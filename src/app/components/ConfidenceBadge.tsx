import {
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";
import {
  getConfidence,
  ConfidenceInfo,
} from "../lib/incidentStore";

const tierIcon = {
  high: ShieldCheck,
  review: ShieldAlert,
  low: ShieldQuestion,
};

const signalStrength: Record<ConfidenceInfo["tier"], string> = {
  high: "strong signal alignment",
  review: "moderate signal alignment",
  low: "limited signal alignment",
};

/**
 * Inline pill badge for use inside cards, timelines, and lists.
 * Qualitative label is bold and primary; percentage is one size
 * smaller and visually muted — never the headline number.
 */
export function ConfidenceBadge({
  percent,
  size = "md",
  showPercent = true,
}: {
  percent: number;
  size?: "sm" | "md" | "lg";
  showPercent?: boolean;
}) {
  const info: ConfidenceInfo = getConfidence(percent);
  const Icon = tierIcon[info.tier];

  const cfg = {
    sm: { label: "text-xs font-semibold", pct: "text-[10px]", icon: "w-3 h-3",    pad: "px-2 py-0.5"   },
    md: { label: "text-sm font-semibold", pct: "text-xs",     icon: "w-3.5 h-3.5", pad: "px-2.5 py-1"   },
    lg: { label: "text-base font-semibold",pct: "text-sm",    icon: "w-4 h-4",    pad: "px-3 py-1.5"   },
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${info.colorClasses} ${cfg.label} ${cfg.pad}`}
      title={`${percent}% — ${signalStrength[info.tier]}`}
    >
      <Icon className={cfg.icon} />
      {info.label}
      {showPercent && (
        <span className={`${cfg.pct} opacity-50 font-normal`}>
          ({percent}%)
        </span>
      )}
    </span>
  );
}

/**
 * Hero display for the AI Decision card's confidence tile.
 * Qualitative label is the large, colored headline.
 * Percentage appears below in small muted gray text.
 */
export function ConfidenceHero({ percent }: { percent: number }) {
  const info = getConfidence(percent);
  const Icon = tierIcon[info.tier];

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-6 h-6" style={{ color: info.barColor }} />
        <p className="text-xl font-bold" style={{ color: info.barColor }}>
          {info.label}
        </p>
      </div>
      <p className="text-xs text-gray-400 leading-relaxed">
        {percent}% pattern match across {signalStrength[info.tier]}
      </p>
    </div>
  );
}
