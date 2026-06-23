import { useState, useRef } from "react";
import { Upload, FileCode, AlertCircle, Info, X, Zap, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router";
import { useIncidentStore } from "../lib/incidentStore";

export const demoLog = `2026-06-19 14:23:11 [INFO] User login attempt: user@company.com from 192.168.1.45
2026-06-19 14:23:15 [SUCCESS] Authentication successful
2026-06-19 14:25:33 [WARNING] Multiple failed SSH attempts from 203.0.113.42
2026-06-19 14:25:45 [ALERT] Suspicious API call pattern detected - User ID: 8472
2026-06-19 14:26:12 [ERROR] Unauthorized access attempt to /admin/users
2026-06-19 14:26:18 [CRITICAL] Privilege escalation detected - Session ID: 9d8f7e6c
2026-06-19 14:27:01 [INFO] Database query executed - Query time: 245ms
2026-06-19 14:28:15 [WARNING] Unusual data exfiltration pattern detected
2026-06-19 14:29:03 [ALERT] Rate limit exceeded from IP: 203.0.113.42`;

export const bruteForceDemoLog = `2026-06-21 19:10:01 [WARNING] Suspicious login attempt from IP 185.220.101.5 for user root
2026-06-21 19:10:02 [WARNING] Failed SSH password from IP 185.220.101.5 for user root
2026-06-21 19:10:04 [WARNING] Failed SSH password from IP 185.220.101.5 for user root
2026-06-21 19:10:05 [WARNING] Failed SSH password from IP 185.220.101.5 for user root
2026-06-21 19:10:07 [CRITICAL] Privilege escalation detected - Session ID: s-8822774 for User admin-override
2026-06-21 19:10:10 [ALERT] Unauthorized API call to /admin/settings from Session ID s-8822774`;

const LINE_COLORS: Record<string, string> = {
  CRITICAL: "#fca5a5",
  ALERT:    "#fcd34d",
  WARNING:  "#fdba74",
  ERROR:    "#f87171",
  SUCCESS:  "#6ee7b7",
  INFO:     "#93c5fd",
};

function coloredLine(line: string) {
  const levelMatch = line.match(/\[(CRITICAL|ALERT|WARNING|ERROR|SUCCESS|INFO)\]/);
  const color = levelMatch ? LINE_COLORS[levelMatch[1]] : "#94a3b8";
  return { color, line };
}

export function LogAnalysis() {
  const [logText, setLogText]         = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [showDemoBanner, setShowDemoBanner] = useState(false);
  const [analyzing, setAnalyzing]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { analyzeLogs } = useIncidentStore();

  const handleAnalyze = () => {
    const isDefaultDemo = logText.trim() === demoLog.trim() || logText.trim() === "";
    const isDemo = !uploadedFile && (isDefaultDemo || logText.trim() === bruteForceDemoLog.trim());
    const textToAnalyze = logText.trim() === "" ? demoLog : logText;

    setAnalyzing(true);
    setTimeout(() => {
      analyzeLogs(textToAnalyze);
      setAnalyzing(false);
      if (isDemo) {
        setShowDemoBanner(true);
        setTimeout(() => navigate("/decision"), 2200);
      } else {
        navigate("/decision");
      }
    }, 600);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      if (text) setLogText(text);
    };
    reader.readAsText(file);
  };

  const lines = logText.split("\n").filter(Boolean);

  return (
    <div className="p-8 max-w-6xl mx-auto animate-fade-in-up">

      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl"
            style={{ background: "linear-gradient(135deg,#3b82f6,#8b5cf6)", boxShadow: "0 0 16px rgba(59,130,246,0.4)" }}>
            <FileCode size={17} color="#fff" />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            Log Analysis
          </h1>
        </div>
        <p className="text-sm ml-12" style={{ color: "var(--text-secondary)" }}>
          Upload or paste system logs — TrustLens will extract threat indicators and synthesise an incident report
        </p>
      </div>

      {/* ── Demo banner ───────────────────────────────────────────────── */}
      {showDemoBanner && (
        <div className="mb-6 flex items-start gap-3 rounded-xl px-4 py-4"
          style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)" }}>
          <Info size={16} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold mb-0.5" style={{ color: "#93c5fd" }}>Demo Mode Active</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              No user logs detected — analyzing the preloaded synthetic dataset{" "}
              <span className="font-mono font-medium" style={{ color: "var(--text-primary)" }}>it_logs.csv</span> for demonstration.
            </p>
          </div>
          <button onClick={() => setShowDemoBanner(false)} style={{ color: "var(--text-muted)" }}
            className="hover:text-white transition-colors flex-shrink-0">
            <X size={15} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left: upload + demo buttons ───────────────────────────── */}
        <div className="space-y-5">

          {/* Upload card */}
          <div className="glass p-6 card-hover">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "var(--text-muted)" }}>
              Upload a file
            </h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl p-6 text-center cursor-pointer transition-all duration-200"
              style={{
                border: "2px dashed rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.02)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.4)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(59,130,246,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.02)"; }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-xl mx-auto mb-3"
                style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Upload size={20} style={{ color: "#60a5fa" }} />
              </div>
              {uploadedFile ? (
                <>
                  <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{uploadedFile}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Click to replace</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>Drop file here or click to browse</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>.log · .txt · .json · .csv · up to 10 MB</p>
                </>
              )}
              <input ref={fileInputRef} type="file" className="hidden" accept=".log,.txt,.json,.csv" onChange={handleFileChange} />
            </div>

            <div className="mt-4 flex items-start gap-2.5 rounded-lg px-3 py-2.5"
              style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <AlertCircle size={14} style={{ color: "#60a5fa", flexShrink: 0, marginTop: 2 }} />
              <div className="text-xs">
                <p className="font-medium mb-0.5" style={{ color: "#93c5fd" }}>Supported formats</p>
                <p style={{ color: "var(--text-secondary)" }}>Syslog, Apache, Nginx, application logs, JSON structured logs</p>
              </div>
            </div>
          </div>

          {/* Demo preset buttons */}
          <div className="glass p-5">
            <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>
              Load a demo scenario
            </h2>
            <div className="space-y-2">
              {[
                { label: "Demo 1 — Coordinated Attack", sub: "Brute force → privilege escalation → exfiltration", log: demoLog },
                { label: "Demo 2 — SSH Brute Force", sub: "Rapid SSH failures with session hijack", log: bruteForceDemoLog },
              ].map((d) => (
                <button
                  key={d.label}
                  onClick={() => { setLogText(d.log); setUploadedFile(null); }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200"
                  style={{
                    background: logText === d.log ? "rgba(59,130,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: logText === d.log ? "1px solid rgba(59,130,246,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                  onMouseEnter={e => { if (logText !== d.log) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { if (logText !== d.log) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.03)"; }}
                >
                  <div>
                    <p className="text-sm font-semibold" style={{ color: logText === d.log ? "#93c5fd" : "var(--text-secondary)" }}>{d.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{d.sub}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: paste area ────────────────────────────────────────── */}
        <div className="glass p-6 flex flex-col" style={{ minHeight: 420 }}>
          <h2 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Paste Logs</h2>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Paste your logs or load a demo, then click <span className="font-medium" style={{ color: "var(--text-secondary)" }}>Analyze</span>
          </p>

          <textarea
            value={logText}
            onChange={(e) => setLogText(e.target.value)}
            placeholder="2026-06-19 14:25:33 [WARNING] Multiple failed SSH attempts from 203.0.113.42&#10;2026-06-19 14:26:18 [CRITICAL] Privilege escalation detected..."
            className="flex-1 min-h-[260px] w-full rounded-xl font-mono text-xs leading-relaxed resize-none p-4 transition-all duration-200"
            style={{
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "var(--text-secondary)",
              outline: "none",
            }}
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {lines.length} lines · {logText.length} chars
              </span>
              {lines.length > 0 && (
                <button onClick={() => { setLogText(""); setUploadedFile(null); }}
                  className="text-xs transition-colors" style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                  Clear
                </button>
              )}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-200"
              style={{
                background: analyzing ? "rgba(59,130,246,0.5)" : "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                boxShadow: analyzing ? "none" : "0 0 16px rgba(59,130,246,0.35)",
                cursor: analyzing ? "not-allowed" : "pointer",
              }}
            >
              {analyzing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Zap size={14} />
                  Analyze Logs
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Log preview ───────────────────────────────────────────────── */}
      {logText.trim() && (
        <div className="glass mt-6 p-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full" style={{ background: "#10b981", boxShadow: "0 0 6px #10b981" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Log Preview</h2>
            <span className="ml-auto text-xs" style={{ color: "var(--text-muted)" }}>First {Math.min(lines.length, 9)} of {lines.length} lines</span>
          </div>

          <div className="rounded-xl p-4 overflow-x-auto" style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <pre className="text-xs font-mono leading-relaxed">
              {logText.split("\n").slice(0, 9).map((line, i) => {
                const { color } = coloredLine(line);
                return (
                  <div key={i} className="flex gap-3 items-start">
                    <span className="select-none text-right" style={{ color: "var(--text-muted)", minWidth: 20 }}>{i + 1}</span>
                    <span style={{ color }}>{line}</span>
                  </div>
                );
              })}
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-4">
            {[
              { label: "Log Format",      value: "Timestamp · Level · Message" },
              { label: "Visible Events",  value: `${lines.length} entries` },
              { label: "Source",          value: uploadedFile ?? "Pasted text" },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: "var(--text-secondary)" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}