import {
  Lightbulb,
  Clock,
  ShieldCheck,
  BarChart3,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { useIncidentStore, getConfidence } from "../lib/incidentStore";
import { NoDataState } from "./NoDataState";

export function Explainability() {
  const {
    threatSummary,
    influenceData,
    trustScoreData,
    evidenceCards,
    reasoningTimeline,
    alternativeExplanations,
    isAnalyzed,
  } = useIncidentStore();

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
            <Lightbulb size={17} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Explainability
          </h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "var(--text-secondary)" }}>
          Transparent AI decision-making with detailed evidence and reasoning
        </p>
      </div>

      {!isAnalyzed ? (
        <NoDataState
          title="Explainability Panel"
          subtitle="Upload system logs on the Log Analysis screen to generate transparent AI decision-making explanations and evidence reports."
        />
      ) : (
        <>
          {/* Why This Decision */}
          <div className="p-6 mb-6 glass animate-fade-in-up" style={{ borderLeft: "4px solid #3b82f6" }}>
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>
              Why This Decision?
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              The AI classified this incident as a{" "}
              <strong style={{ color: "var(--text-primary)" }}>{threatSummary.title.toLowerCase()}</strong> because{" "}
              {threatSummary.description.toLowerCase()}. Seeing these factors
              together — rather than any single signal alone — is what drove the classification.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 rounded-xl border" style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--chart-1)" }}>
              Primary Factor
            </p>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {influenceData[0]?.factor || "Privilege Escalation"}
            </p>
          </div>
          <div className="p-4 rounded-xl border" style={{ background: "rgba(139,92,246,0.06)", borderColor: "rgba(139,92,246,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--chart-2)" }}>
              Supporting Evidence
            </p>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              {evidenceCards.length} Indicators
            </p>
          </div>
          <div className="p-4 rounded-xl border" style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.2)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--chart-3)" }}>
              Cross-Checked
            </p>
            <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
              Confirmed by independent telemetry
            </p>
          </div>
        </div>

        <div className="mt-5">
          <ConfidenceBadge percent={threatSummary.confidence} size="lg" />
        </div>
      </div>

      {/* Known Limitations */}
      <div className="p-5 mb-6 rounded-xl border" style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <ShieldAlert className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold mb-2" style={{ color: "var(--chart-4)" }}>
              Known Limitations
            </h2>
            <ul className="text-xs space-y-1.5 list-disc list-inside" style={{ color: "var(--text-secondary)" }}>
              {threatSummary.limitations.map((limit, idx) => (
                <li key={idx} className="leading-relaxed">{limit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Evidence Cards */}
      <div className="mb-8">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Evidence Analysis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {evidenceCards.map((evidence) => {
            const badgeClass =
              evidence.severity === "critical"
                ? "badge-critical"
                : evidence.severity === "warning"
                ? "badge-warning"
                : "badge-success";
            return (
              <div key={evidence.id} className="p-5 glass card-hover">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1" style={{ color: "var(--text-primary)" }}>
                      {evidence.title}
                    </h3>
                    <p className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                      <Clock className="w-3 h-3 text-blue-400" />
                      {evidence.timestamp}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}>
                    {evidence.severity}
                  </span>
                </div>

                <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                  {evidence.description}
                </p>
                <p className="text-[10px] italic mb-3" style={{ color: "var(--text-muted)" }}>
                  Source: {evidence.source}
                </p>

                <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border-subtle)" }}>
                  <ConfidenceBadge
                    percent={evidence.confidence}
                    size="sm"
                  />
                  <div className="text-right">
                    <p className="text-[10px] mb-0.5" style={{ color: "var(--text-muted)" }}>
                      Impact
                    </p>
                    <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>
                      {evidence.impact}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Factors That Influenced This Decision */}
      <div className="p-6 mb-6 glass">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
            Factors That Influenced This Decision
          </h2>
        </div>
        <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
          How strongly each signal contributed to the final classification — longer bars had more influence
        </p>

        <div className="w-full" style={{ height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={influenceData} layout="vertical" margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 100]}
                stroke="var(--text-muted)"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
                tickFormatter={(v) => `${v}`}
              />
              <YAxis
                dataKey="factor"
                type="category"
                width={140}
                stroke="var(--text-muted)"
                tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--bg-elevated)",
                  borderColor: "var(--border-subtle)",
                  borderRadius: "10px",
                  boxShadow: "var(--shadow-card)"
                }}
                itemStyle={{ color: "var(--text-primary)" }}
                labelStyle={{ color: "var(--text-secondary)", fontWeight: "bold" }}
                formatter={(value: number) => [`${value} / 100`, "Evidence Strength"]}
              />
              <Bar
                dataKey="weight"
                fill="url(#barGradient)"
                radius={[0, 4, 4, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Reasoning Timeline */}
        <div className="p-6 glass">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Reasoning Timeline
            </h2>
          </div>

          <div className="space-y-4">
            {reasoningTimeline.map((step, index) => (
              <div key={index} className="flex gap-4 animate-fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="flex flex-col items-center">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: "rgba(59,130,246,0.12)",
                      border: "1px solid rgba(59,130,246,0.35)",
                      color: "var(--primary)",
                      boxShadow: "0 0 10px rgba(59,130,246,0.2)"
                    }}>
                    {index + 1}
                  </div>
                  {index < reasoningTimeline.length - 1 && (
                    <div className="w-[1px] h-full bg-slate-350 dark:bg-slate-800 my-1"></div>
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                      {step.event}
                    </p>
                    <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {step.time}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed mb-2" style={{ color: "var(--text-secondary)" }}>
                    {step.description}
                  </p>
                  <ConfidenceBadge
                    percent={step.confidence}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decision Reliability & Alternative Explanations */}
        <div className="space-y-6">
          {/* Decision Reliability Visualization */}
          <div className="p-6 glass">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Decision Reliability
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              How well each component of this detection holds up to scrutiny
            </p>

            <div className="flex items-center justify-center mb-4" style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trustScoreData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {trustScoreData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-elevated)",
                      borderColor: "var(--border-subtle)",
                      borderRadius: "10px",
                      boxShadow: "var(--shadow-card)"
                    }}
                    itemStyle={{ color: "var(--text-primary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              {trustScoreData.map((item) => {
                const info = getConfidence(item.value);
                return (
                  <div key={item.name} className="flex items-center justify-between gap-3 p-2 rounded-lg" style={{ background: "var(--secondary)", border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color, boxShadow: `0 0 6px ${item.color}` }}
                      />
                      <span className="text-xs truncate font-medium" style={{ color: "var(--text-secondary)" }}>
                        {item.name}
                      </span>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <span className="text-xs font-bold" style={{ color: item.color }}>
                        {info.label}
                      </span>
                      <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                        {item.value}% match
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Trust calibration guidance */}
            <div className="mt-4 pt-4 text-[10px] leading-relaxed grid grid-cols-1 gap-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-start gap-1.5">
                <span className="font-semibold text-emerald-400 flex-shrink-0">
                  Reliable:
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  multiple corroborating signals, matches a known attack pattern
                </span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="font-semibold text-amber-400 flex-shrink-0">
                  Verify first:
                </span>
                <span style={{ color: "var(--text-secondary)" }}>
                  if this device has incomplete telemetry history or is new to the fleet
                </span>
              </div>
            </div>
          </div>

          {/* Alternative Explanations */}
          <div className="p-6 glass">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                Alternative Explanations
              </h2>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
              Other explanations the AI considered, and why they were ruled out
            </p>

            <div className="space-y-3">
              {alternativeExplanations.map((alt) => (
                <div
                  key={alt.title}
                  className="p-3 rounded-xl border"
                  style={{ background: "var(--secondary)", borderColor: "var(--border-subtle)" }}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="font-semibold text-xs" style={{ color: "var(--text-primary)" }}>
                      {alt.title}
                    </p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                      alt.likelihood.toLowerCase().includes("very unlikely") || alt.likelihood.toLowerCase().includes("unlikely")
                        ? "badge-muted"
                        : alt.likelihood.toLowerCase().includes("possible") || alt.likelihood.toLowerCase().includes("likely")
                        ? "badge-warning"
                        : "badge-success"
                    }`}>
                      {alt.likelihood}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {alt.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>)}
    </div>
  );
}