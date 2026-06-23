import { useState } from "react";
import {
  AlertTriangle, Shield, ArrowRight, Database, ShieldAlert,
  CheckCircle2, XCircle, ArrowUpCircle, HelpCircle, Send,
  ChevronDown, ChevronUp, Info, Brain, FileText, UploadCloud,
  ExternalLink,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router";
import { ConfidenceHero, ConfidenceBadge } from "./ConfidenceBadge";
import { OverrideDialog } from "./OverrideDialog";
import { useIncidentStore, RecommendedAction } from "../lib/incidentStore";
import { motion, AnimatePresence } from "motion/react";
import { NoDataState } from "./NoDataState";

// ─── Fallback reasoning ────────────────────────────────────────────────────────
interface ActionReasoning { primaryReason: string; evidence: string[]; confidencePercent: number; limitation: string; }

const actionReasoning: Record<string, ActionReasoning> = {
  "ra-1": { primaryReason: "This IP launched 47 failed SSH attempts in 8 minutes then immediately pivoted to a direct admin access attempt — a textbook brute-force-to-escalation pattern.", evidence: ["47 failed SSH attempts in 8 min from 203.0.113.42 (14:25:33–14:29:03)", "IP matched 3 independent entries in threat database v2.4.1", "Attack rate of 5.9 attempts/min exceeds automated-attack threshold (>3/min)", "Directly preceded privilege escalation on Session 9d8f7e6c at 14:26:18"], confidencePercent: 94.7, limitation: "Blocking may affect legitimate traffic if this IP is a shared VPN or CDN egress node — verify with your network team first." },
  "ra-2": { primaryReason: "User 8472's credentials were used to perform an unauthorised privilege escalation, indicating the account is actively compromised.", evidence: ["Session 9d8f7e6c escalated from user → admin without authorisation at 14:26:18", "API call rate for User 8472 was 340% above their 30-day baseline", "Unauthorised access to /admin/users attempted at 14:26:12", "No MFA challenge recorded before the privilege escalation event"], confidencePercent: 91.2, limitation: "Revoking credentials will interrupt any legitimate active sessions this user may have — notify them before or immediately after." },
  "ra-3": { primaryReason: "Session 9d8f7e6c is the live attack vector: it holds escalated admin privileges and must be terminated to stop further damage.", evidence: ["Session escalated from user to admin role at 14:26:18 without re-authentication", "Data exfiltration pattern detected under this session at 14:28:15", "Session originated directly from attacking IP 203.0.113.42", "No re-authentication or MFA event recorded after escalation"], confidencePercent: 96.1, limitation: "Invalidating the session won't undo changes already made under the escalated privilege level — a post-incident audit is still required." },
  "ra-4": { primaryReason: "The 30-minute window around this incident contains API calls that haven't been reviewed — they may reveal additional lateral movement.", evidence: ["Unusual data exfiltration pattern flagged at 14:28:15 (volume: ~2.4 GB)", "3 calls to /admin/users endpoint recorded after privilege escalation", "API call rate from User 8472 exceeded baseline by 340% during the window", "Full scope of data accessed under the escalated session is not yet known"], confidencePercent: 74.0, limitation: "Automated analysis cannot determine intent from API metadata alone — manual review by a senior analyst is required." },
};

// ─── Severity config ───────────────────────────────────────────────────────────
const SEVERITY_COLORS: Record<RecommendedAction["severity"], { border: string; bg: string; chip: string; text: string; label: string }> = {
  critical: { border: "rgba(239,68,68,0.35)",  bg: "rgba(239,68,68,0.07)",  chip: "linear-gradient(135deg,#ef4444,#f97316)", text: "#fca5a5", label: "Critical" },
  high:     { border: "rgba(245,158,11,0.35)", bg: "rgba(245,158,11,0.07)", chip: "linear-gradient(135deg,#f59e0b,#ef4444)", text: "#fcd34d", label: "High"     },
  medium:   { border: "rgba(59,130,246,0.35)", bg: "rgba(59,130,246,0.07)", chip: "linear-gradient(135deg,#3b82f6,#8b5cf6)", text: "#93c5fd",  label: "Medium"   },
  low:      { border: "rgba(255,255,255,0.1)", bg: "rgba(255,255,255,0.03)",chip: "linear-gradient(135deg,#64748b,#94a3b8)", text: "#94a3b8",  label: "Low"      },
};

// ─── Ask Why panel ─────────────────────────────────────────────────────────────
function AskWhyPanel({ action, onClose }: { action: RecommendedAction; onClose: () => void }) {
  const navigate = useNavigate();
  const reasoning = action.reasoning || actionReasoning[action.id];
  if (!reasoning) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scaleY: 0.96 }}
      animate={{ opacity: 1, y: 0, scaleY: 1 }}
      exit={{ opacity: 0, y: -8, scaleY: 0.96 }}
      transition={{ duration: 0.2 }}
      className="mt-4 rounded-xl overflow-hidden"
      style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}
    >
      <div className="flex items-start justify-between gap-3 px-4 py-3"
        style={{ borderBottom: "1px solid rgba(59,130,246,0.15)" }}>
        <div className="flex items-center gap-2">
          <Info size={14} style={{ color: "#60a5fa", flexShrink: 0 }} />
          <p className="text-sm font-semibold" style={{ color: "#93c5fd" }}>
            Why: <span className="font-medium" style={{ color: "var(--text-primary)" }}>{action.title}</span>
          </p>
        </div>
        <button onClick={onClose} className="transition-colors" style={{ color: "var(--text-muted)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
          <XCircle size={15} />
        </button>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#60a5fa" }}>Primary Reason</p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reasoning.primaryReason}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#60a5fa" }}>Supporting Evidence</p>
          <ul className="space-y-2">
            {reasoning.evidence.map((pt, i) => (
              <li key={i} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#60a5fa" }} />
                {pt}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#60a5fa" }}>Confidence</p>
          <ConfidenceBadge percent={reasoning.confidencePercent} size="sm" />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{reasoning.confidencePercent}% pattern match</p>
        </div>
        <div className="flex items-start gap-2 rounded-lg px-3 py-2.5"
          style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
          <ShieldAlert size={13} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="text-xs font-semibold mb-0.5" style={{ color: "#fcd34d" }}>Known Limitation</p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{reasoning.limitation}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(59,130,246,0.12)" }}>
        <button onClick={() => navigate("/explainability")}
          className="flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#60a5fa" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#93c5fd")}
          onMouseLeave={e => (e.currentTarget.style.color = "#60a5fa")}>
          See Full Reasoning <ExternalLink size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Action card ───────────────────────────────────────────────────────────────
function ActionRow({ action }: { action: RecommendedAction }) {
  const { approveAction, overrideAction, escalateAction } = useIncidentStore();
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const sc = SEVERITY_COLORS[action.severity];
  const isResolved = action.state !== "pending";

  return (
    <div className="rounded-xl p-4 transition-all duration-200 card-hover"
      style={{ background: sc.bg, border: `1px solid ${sc.border}`, opacity: isResolved ? 0.85 : 1 }}>
      <div className="flex items-start gap-3">
        {/* Priority chip */}
        <div className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 text-xs font-bold text-white"
          style={{ background: sc.chip, boxShadow: `0 0 10px ${sc.border}` }}>
          {action.priority}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{action.title}</p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--text-secondary)" }}>{action.description}</p>

          {/* State feedback */}
          {action.state === "approved" && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: "#6ee7b7" }}>
              <CheckCircle2 size={13} /> Approved by Admin
            </div>
          )}
          {action.state === "overridden" && (
            <div className="mt-2 text-xs">
              <div className="flex items-center gap-1.5 font-medium" style={{ color: "#fdba74" }}>
                <XCircle size={13} /> Overridden by Admin
              </div>
              {action.overrideReason && (
                <p className="mt-0.5 ml-5" style={{ color: "var(--text-muted)" }}>Reason: {action.overrideReason}</p>
              )}
            </div>
          )}
          {action.state === "escalated" && (
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium" style={{ color: "#c4b5fd" }}>
              <ArrowUpCircle size={13} /> Escalated for senior review
            </div>
          )}

          {/* Action buttons */}
          {!isResolved && (
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <button onClick={() => approveAction(action.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all duration-150"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)", boxShadow: "0 0 10px rgba(16,185,129,0.3)" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}>
                <CheckCircle2 size={12} /> Approve
              </button>
              <button onClick={() => setOverrideOpen(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", color: "#fcd34d" }}>
                <XCircle size={12} /> Override
              </button>
              <button onClick={() => escalateAction(action.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
                <ArrowUpCircle size={12} /> Escalate
              </button>
              <button onClick={() => setWhyOpen(v => !v)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  background: whyOpen ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.04)",
                  border: whyOpen ? "1px solid rgba(59,130,246,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: whyOpen ? "#93c5fd" : "var(--text-muted)",
                }}>
                <HelpCircle size={12} /> Ask Why {whyOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
              </button>
            </div>
          )}

          <AnimatePresence>
            {whyOpen && <AskWhyPanel action={action} onClose={() => setWhyOpen(false)} />}
          </AnimatePresence>
        </div>

        {/* Severity badge */}
        <span className="text-xs font-bold px-2.5 py-1 rounded-lg flex-shrink-0"
          style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}>
          {sc.label}
        </span>
      </div>

      <OverrideDialog open={overrideOpen} onOpenChange={setOverrideOpen}
        actionTitle={action.title} onConfirm={(opt, note) => overrideAction(action.id, opt, note)} />
    </div>
  );
}



// ─── Main page ─────────────────────────────────────────────────────────────────
export function AIDecision() {
  const navigate = useNavigate();
  const { actions, threatSummary, isAnalyzed } = useIncidentStore();
  const pendingCount = actions.filter(a => a.state === "pending").length;
  const critLevel = threatSummary.riskScore >= 8 ? "CRITICAL" : threatSummary.riskScore >= 5.5 ? "HIGH" : "MEDIUM";
  const critColor = critLevel === "CRITICAL" ? "#fca5a5" : critLevel === "HIGH" ? "#fcd34d" : "#93c5fd";
  const critBg    = critLevel === "CRITICAL" ? "rgba(239,68,68,0.12)" : critLevel === "HIGH" ? "rgba(245,158,11,0.12)" : "rgba(59,130,246,0.12)";
  const critBorder= critLevel === "CRITICAL" ? "rgba(239,68,68,0.35)" : critLevel === "HIGH" ? "rgba(245,158,11,0.3)" : "rgba(59,130,246,0.3)";

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up">

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg,#ef4444,#f97316)", boxShadow: "0 0 16px rgba(239,68,68,0.4)" }}>
            <Brain size={17} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>AI Decision</h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "var(--text-secondary)" }}>
          Analysis results with plain-language confidence and actionable recommendations
        </p>
      </div>

      {/* ── Gate: show empty state if no data ───────────────────────────── */}
      {!isAnalyzed ? (
        <NoDataState
          title="AI Decision Panel"
          subtitle="Upload system logs on the Log Analysis screen to generate AI-powered threat assessments and recommended actions."
        />
      ) : (<>

      {/* ── Threat card ─────────────────────────────────────────────────── */}
      <div className="glass gradient-border mb-6 p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl flex-shrink-0"
              style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <AlertTriangle size={22} style={{ color: "#f87171" }} />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1" style={{ color: "var(--text-primary)" }}>{threatSummary.title}</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{threatSummary.description}</p>
            </div>
          </div>
          <span className="flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: critBg, border: `1px solid ${critBorder}`, color: critColor }}>
            {critLevel}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Threat Status", value: threatSummary.status, icon: Shield, color: "#f87171", iconBg: "rgba(239,68,68,0.12)", iconBorder: "rgba(239,68,68,0.25)" },
            { label: "Risk Score",    value: `${threatSummary.riskScore} / 10`, icon: AlertTriangle, color: "#fcd34d", iconBg: "rgba(245,158,11,0.12)", iconBorder: "rgba(245,158,11,0.25)" },
          ].map(({ label, value, icon: Icon, color, iconBg, iconBorder }) => (
            <div key={label} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: iconBg, border: `1px solid ${iconBorder}` }}>
                  <Icon size={12} style={{ color }} />
                </div>
              </div>
              <p className="text-lg font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
          <div className="rounded-xl p-4"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <p className="text-xs mb-2" style={{ color: "var(--text-muted)" }}>Confidence</p>
            <ConfidenceHero percent={threatSummary.confidence} />
          </div>
        </div>

        {/* AI Summary */}
        <div className="rounded-xl p-4 mb-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <h3 className="font-semibold text-sm mb-2" style={{ color: "var(--text-primary)" }}>AI Summary</h3>
          <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>{threatSummary.description}</p>
          <div className="flex items-start gap-2 text-xs italic mb-4 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "var(--text-muted)" }}>
            <Database size={13} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{threatSummary.sources}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {threatSummary.tags.map(tag => {
              const isRed    = tag.includes("Privilege") || tag.includes("Brute");
              const isYellow = tag.includes("Exfiltration");
              const isOrange = tag.includes("Access");
              const bg  = isRed ? "rgba(239,68,68,0.12)"  : isYellow ? "rgba(245,158,11,0.12)" : isOrange ? "rgba(249,115,22,0.12)" : "rgba(59,130,246,0.12)";
              const bd  = isRed ? "rgba(239,68,68,0.3)"   : isYellow ? "rgba(245,158,11,0.3)"  : isOrange ? "rgba(249,115,22,0.3)"  : "rgba(59,130,246,0.3)";
              const col = isRed ? "#fca5a5"                : isYellow ? "#fcd34d"               : isOrange ? "#fdba74"              : "#93c5fd";
              return (
                <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-lg"
                  style={{ background: bg, border: `1px solid ${bd}`, color: col }}>
                  {tag}
                </span>
              );
            })}
          </div>
        </div>

        {/* Limitations */}
        <div className="flex items-start gap-2.5 rounded-xl px-4 py-3"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <ShieldAlert size={15} style={{ color: "#fbbf24", flexShrink: 0, marginTop: 1 }} />
          <div className="text-xs">
            <p className="font-semibold mb-1" style={{ color: "#fcd34d" }}>Known Limitations</p>
            <ul className="space-y-0.5" style={{ color: "var(--text-secondary)" }}>
              {threatSummary.limitations.map((lim, i) => <li key={i}>• {lim}</li>)}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Recommended actions ─────────────────────────────────────────── */}
      <div className="glass p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold" style={{ color: "var(--text-primary)" }}>Recommended Actions</h3>
          <span className="text-xs px-3 py-1 rounded-full"
            style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)", color: "#93c5fd" }}>
            {pendingCount} of {actions.length} pending
          </span>
        </div>
        <p className="text-xs mb-5" style={{ color: "var(--text-muted)" }}>
          Nothing executes automatically — review each item and approve, override, or escalate.
          Use <span style={{ color: "var(--text-secondary)" }}>Ask Why</span> on any card to see specific evidence.
        </p>

        <div className="space-y-3">
          {actions.map(action => <ActionRow key={action.id} action={action} />)}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-6 pt-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={() => navigate("/explainability")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 14px rgba(59,130,246,0.3)" }}>
            See Full Explanation <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigate("/audit")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", color: "#c4b5fd" }}>
            <Send size={13} /> View Audit Trail
          </button>
        </div>
      </div>
      </>)}
    </div>
  );
}
