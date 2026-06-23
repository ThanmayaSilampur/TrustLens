import { useState, useRef, useEffect } from "react";
import {
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  History,
  X,
  Terminal,
  Upload,
} from "lucide-react";
import { useIncidentStore, AuditEntry } from "../lib/incidentStore";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { AnimatePresence, motion } from "motion/react";
import { NoDataState } from "./NoDataState";

// ─── Static data ──────────────────────────────────────────────────────────────

const decisionHistory = [
  { id: "DEC-2026-001", timestamp: "2026-06-19 14:29:15", threat: "Privilege Escalation Attack",  confidence: 94.7, risk: "Critical", status: "Open",     affected: "Session 9d8f7e6c"         },
  { id: "DEC-2026-002", timestamp: "2026-06-18 09:15:42", threat: "Suspicious Login Pattern",      confidence: 87.3, risk: "Medium",   status: "Resolved", affected: "User ID 5234"             },
  { id: "DEC-2026-003", timestamp: "2026-06-17 16:44:28", threat: "Data Exfiltration Attempt",     confidence: 91.2, risk: "High",     status: "Resolved", affected: "API Endpoint /data/export" },
  { id: "DEC-2026-004", timestamp: "2026-06-16 11:23:01", threat: "Brute Force Attack",            confidence: 96.5, risk: "Critical", status: "Resolved", affected: "Admin Portal"              },
  { id: "DEC-2026-005", timestamp: "2026-06-15 14:12:55", threat: "Malware Detection",             confidence: 88.9, risk: "High",     status: "Resolved", affected: "File Upload Service"       },
];

// Note: eventLogs are sourced dynamically from the incidentStore

const RISK_LEVELS  = ["Critical", "High", "Medium", "Low"] as const;
const STATUS_OPTS  = ["Open", "Resolved"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatusIcon = (status: AuditEntry["status"]) => {
  switch (status) {
    case "success":  return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "critical": return <XCircle       className="w-4 h-4 text-red-400"   />;
    case "warning":  return <AlertCircle   className="w-4 h-4 text-amber-400" />;
    default:         return <Clock         className="w-4 h-4 text-blue-400"  />;
  }
};

const getStatusColor = (status: AuditEntry["status"]) => {
  switch (status) {
    case "success":  return "bg-emerald-950/20 text-emerald-300 border-emerald-500/25";
    case "critical": return "bg-red-950/20 text-red-300 border-red-500/25";
    case "warning":  return "bg-amber-950/20 text-amber-300 border-amber-500/25";
    default:         return "bg-blue-950/20 text-blue-300 border-blue-500/25";
  }
};

const riskBadgeClass = (risk: string) => {
  if (risk === "Critical") return "badge-critical";
  if (risk === "High")     return "bg-orange-500/10 text-orange-400 border-orange-500/20";
  if (risk === "Medium")   return "bg-amber-500/10 text-amber-400 border-amber-500/20";
  return                          "bg-slate-500/10 text-slate-400 border-slate-700/20";
};

const formatDate = (d: Date) => d.toISOString().slice(0, 10);
const formatTime = (d: Date) => d.toTimeString().slice(0, 8);

// ─── Filter panel ─────────────────────────────────────────────────────────────

interface FilterState {
  risks:    Set<string>;
  statuses: Set<string>;
}

function FilterPanel({
  filters,
  onChange,
  onClear,
  onClose,
}: {
  filters:  FilterState;
  onChange: (next: FilterState) => void;
  onClear:  () => void;
  onClose:  () => void;
}) {
  const toggle = (set: "risks" | "statuses", value: string) => {
    const next = new Set(filters[set]);
    next.has(value) ? next.delete(value) : next.add(value);
    onChange({ ...filters, [set]: next });
  };

  const activeCount = filters.risks.size + filters.statuses.size;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.97 }}
      transition={{ duration: 0.15 }}
      className="absolute right-0 top-full mt-2 z-30 w-64 glass-strong border border-slate-800 shadow-2xl p-4 rounded-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
        <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Filter</p>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={onClear}
              className="text-[10px] text-blue-400 hover:text-blue-300 font-medium"
            >
              Clear all
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Risk Level */}
      <div className="mb-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Risk Level
        </p>
        <div className="space-y-1.5">
          {RISK_LEVELS.map((r) => (
            <label key={r} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                checked={filters.risks.has(r)}
                onChange={() => toggle("risks", r)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950/50 text-blue-500 focus:ring-blue-500/20 accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-350 group-hover:text-[var(--text-primary)] transition-colors">
                {r}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
          Status
        </p>
        <div className="space-y-1.5">
          {STATUS_OPTS.map((s) => (
            <label key={s} className="flex items-center gap-2.5 cursor-pointer group py-0.5">
              <input
                type="checkbox"
                checked={filters.statuses.has(s)}
                onChange={() => toggle("statuses", s)}
                className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950/50 text-blue-500 focus:ring-blue-500/20 accent-blue-500 cursor-pointer"
              />
              <span className="text-xs text-slate-350 group-hover:text-[var(--text-primary)] transition-colors">
                {s}
              </span>
            </label>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AuditTrail() {
  const { auditLog, eventLogs, isAnalyzed } = useIncidentStore();
  const [search, setSearch]         = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters]       = useState<FilterState>({ risks: new Set(), statuses: new Set() });
  const [displayedEvents, setDisplayedEvents] = useState(5);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Filter logic ────────────────────────────────────────────────────────────

  const filtered = decisionHistory.filter((d) => {
    const matchRisk   = filters.risks.size === 0 || filters.risks.has(d.risk);
    const matchStatus = filters.statuses.size === 0 || filters.statuses.has(d.status);
    const matchSearch = search.trim() === "" || d.threat.toLowerCase().includes(search.toLowerCase()) || d.id.toLowerCase().includes(search.toLowerCase());
    return matchRisk && matchStatus && matchSearch;
  });

  const activeFilterCount = filters.risks.size + filters.statuses.size;

  const clearFilters = () => {
    setFilters({ risks: new Set(), statuses: new Set() });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
            <History size={17} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Audit Trail
          </h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "var(--text-secondary)" }}>
          Complete log of AI decisions, human actions, and system events
        </p>
      </div>

      {!isAnalyzed ? (
        <NoDataState
          title="Audit Trail Panel"
          subtitle="Upload system logs on the Log Analysis screen to populate the event timeline, audit records, and security decision history."
        />
      ) : (
        <>
          {/* Activity Feed */}
          <div className="p-6 mb-6 glass">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--text-primary)" }}>
          Recent Activity
        </h2>

        <div className="space-y-4">
          {auditLog && auditLog.length > 0 ? (
            auditLog.slice(0, 5).map((activity, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border ${getStatusColor(activity.status)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-sm text-[var(--text-primary)]">{activity.action}</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">{activity.details}</p>
                        {activity.overrideOption && (
                          <div className="mt-2 space-y-0.5">
                            <p className="text-xs text-orange-400">
                              Reason: <span className="font-medium text-orange-300">{activity.overrideOption}</span>
                            </p>
                            {activity.overrideNote && (
                              <p className="text-xs text-orange-350 italic">
                                "{activity.overrideNote}"
                              </p>
                            )}
                          </div>
                        )}
                        {!activity.overrideOption && activity.overrideReason && (
                          <p className="text-xs text-orange-450 mt-1">
                            Reason: <span className="font-medium text-orange-300">{activity.overrideReason}</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-400 flex-shrink-0 ml-4 font-mono">
                        <p>{formatDate(activity.timestamp)}</p>
                        <p>{formatTime(activity.timestamp)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800/40 text-slate-350 font-semibold`}>
                        {activity.actor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-xs">No recent activity</p>
          )}
        </div>
      </div>

      {/* Decision History Table */}
      <div className="p-6 mb-6 glass">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Decision History</h2>
            {activeFilterCount > 0 && (
              <p className="text-xs text-slate-400 mt-1">
                Showing {filtered.length} of {decisionHistory.length} decisions
                {" "}
                <button
                  onClick={clearFilters}
                  className="text-blue-400 hover:text-blue-300 font-medium underline cursor-pointer"
                >
                  Clear filters
                </button>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                placeholder="Search decisions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 w-56 text-xs bg-slate-950/40 border border-slate-800 rounded-xl text-[var(--text-primary)] placeholder-slate-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 transition-all"
              />
            </div>

            {/* Filter button + dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  filterOpen || activeFilterCount > 0
                    ? "border-blue-500/40 text-blue-300 bg-blue-500/12 shadow-sm"
                    : "border-slate-800 bg-slate-900/30 text-slate-350 hover:bg-slate-800/40 hover:text-[var(--text-primary)]"
                }`}
              >
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                Filter
                {activeFilterCount > 0 && (
                  <span className="ml-1.5 bg-blue-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {filterOpen && (
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    onClear={clearFilters}
                    onClose={() => setFilterOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-800/80 rounded-xl bg-slate-950/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.015)" }}>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Decision ID</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Timestamp</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Threat Type</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Confidence</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Risk Level</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Affected</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-500 text-xs">
                    No decisions match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((decision) => {
                  const rb = riskBadgeClass(decision.risk);
                  return (
                    <tr key={decision.id} className="border-b border-slate-800/50 hover:bg-slate-800/15 transition-colors">
                      <td className="p-3 font-mono text-xs text-blue-300">{decision.id}</td>
                      <td className="p-3 text-xs text-slate-400">{decision.timestamp}</td>
                      <td className="p-3 text-xs font-semibold text-slate-200">{decision.threat}</td>
                      <td className="p-3">
                        <ConfidenceBadge percent={decision.confidence} size="sm" />
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${rb}`}>
                          {decision.risk}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
                            decision.status === "Open"
                              ? "badge-critical"
                              : "badge-success"
                          }`}
                        >
                          {decision.status}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-xs text-slate-400">
                        {decision.affected}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Logs */}
      <div className="p-6 glass">
        <div className="flex items-center gap-2.5 mb-4">
          <Terminal size={16} style={{ color: "#8b5cf6" }} />
          <h2 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>Event Logs</h2>
          {isAnalyzed && eventLogs.length > 0 && (
            <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {eventLogs.length} parsed entries
            </span>
          )}
        </div>

        {!isAnalyzed || eventLogs.length === 0 ? (
          // Empty state — no logs uploaded yet
          <div className="flex flex-col items-center justify-center py-14 gap-4" style={{ background: "rgba(15,20,40,0.5)", borderRadius: 12, border: "1px dashed rgba(255,255,255,0.07)" }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.12)", border: "1px solid rgba(139,92,246,0.2)" }}>
              <Upload size={22} style={{ color: "#a78bfa" }} />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>No event logs yet</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Upload system logs on the Log Analysis screen to populate this terminal.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto">
              {eventLogs.slice(0, displayedEvents).map((log, index) => {
                const badgeClass =
                  log.level === "CRITICAL"
                    ? "bg-red-950/40 text-red-400 border border-red-500/20"
                    : log.level === "WARNING"
                    ? "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                    : log.level === "DEBUG"
                    ? "bg-slate-950/40 text-slate-400 border border-slate-700/20"
                    : "bg-blue-950/40 text-blue-400 border border-blue-500/20";
                return (
                  <div key={log.id} className="py-2.5 border-b border-slate-850 last:border-0">
                    <div className="flex items-start gap-3 flex-wrap sm:flex-nowrap">
                      <span className="text-slate-500 flex-shrink-0">{log.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${badgeClass}`}>
                        {log.level}
                      </span>
                      <span className="text-violet-400 flex-shrink-0">[{log.source}]</span>
                      <span className="text-slate-200 flex-1">{log.message}</span>
                    </div>
                    {log.metadata && log.metadata !== "—" && (
                      <div className="mt-1 ml-0 sm:ml-32 text-slate-400 text-[10px]">{log.metadata}</div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Showing {Math.min(displayedEvents, eventLogs.length)} of {eventLogs.length} events
              </p>
              <button 
                onClick={() => setDisplayedEvents(prev => Math.min(prev + 5, eventLogs.length))}
                disabled={displayedEvents >= eventLogs.length}
                className="border border-slate-800 bg-slate-900/30 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-800/50 hover:text-[var(--text-primary)] transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ color: "var(--text-secondary)" }}
              >
                Load More Events
              </button>
            </div>
          </>
        )}
      </div>
      </>)}
    </div>
  );
}
