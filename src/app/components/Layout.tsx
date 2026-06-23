import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Shield,
  FileText,
  Brain,
  GitBranch,
  Activity,
  Zap,
  LogOut,
} from "lucide-react";
import { useEffect } from "react";
import { AIAssistant } from "./AIAssistant";
import { IncidentStoreProvider } from "../lib/incidentStore";

const navItems = [
  { to: "/",              end: true,  icon: FileText,  label: "Log Analysis",    desc: "Parse & upload logs"   },
  { to: "/decision",      end: false, icon: Brain,     label: "AI Decision",     desc: "Actions & reasoning"   },
  { to: "/explainability",end: false, icon: GitBranch, label: "Explainability",  desc: "Evidence & confidence" },
  { to: "/audit",         end: false, icon: Activity,  label: "Audit Trail",     desc: "Human decisions log"   },
];

export function Layout() {
  const navigate = useNavigate();
  const isAuthenticated = sessionStorage.getItem("trustlens_auth") === "true";

  // Auth guard — redirect to splash (first visit) or login (returning)
  useEffect(() => {
    if (!isAuthenticated) {
      const splashSeen = (window as any).__trustlens_splash_seen;
      navigate(splashSeen ? "/login" : "/splash", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSignOut = () => {
    sessionStorage.removeItem("trustlens_auth");
    navigate("/login", { replace: true });
  };

  if (!isAuthenticated) {
    // Render blank screen immediately to prevent any flash of protected content
    return <div className="min-h-screen bg-[#020818]" />;
  }

  return (
    <IncidentStoreProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "var(--gradient-bg)", backgroundAttachment: "fixed" }}>

        {/* ── Decorative background orbs ───────────────────────────────── */}
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden z-0">
          <div style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "5%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          }} />
        </div>

        {/* ── Sidebar ──────────────────────────────────────────────────── */}
        <aside
          className="relative z-10 flex flex-col"
          style={{
            width: 240,
            flexShrink: 0,
            background: "rgba(8,13,26,0.85)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderRight: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Logo */}
          <div className="px-5 py-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-3">
              {/* Brand logo image */}
              <div
                className="flex items-center justify-center rounded-xl overflow-hidden"
                style={{
                  width: 38, height: 38,
                  boxShadow: "0 0 18px rgba(59,130,246,0.45)",
                  flexShrink: 0,
                }}
              >
                <img
                  src="/images.jpg"
                  alt="TrustLens Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div>
                <div
                  className="text-base font-bold tracking-tight"
                  style={{
                    background: "linear-gradient(135deg, #fff 40%, #93c5fd)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  TrustLens
                </div>
                <div className="text-xs font-medium" style={{ color: "var(--text-muted)", marginTop: 1 }}>
                  AI Incident Intelligence
                </div>
              </div>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <span className="status-dot" />
              <span className="text-xs font-medium" style={{ color: "#6ee7b7" }}>System Active</span>
              <Zap size={11} style={{ color: "#6ee7b7", marginLeft: "auto" }} />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3 px-2" style={{ color: "var(--text-muted)" }}>
              Investigation
            </p>
            {navItems.map(({ to, end, icon: Icon, label, desc }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive ? "nav-active" : "nav-default"
                  }`
                }
                style={({ isActive }) => ({
                  background: isActive
                    ? "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(139,92,246,0.12))"
                    : "transparent",
                  border: isActive
                    ? "1px solid rgba(59,130,246,0.25)"
                    : "1px solid transparent",
                  boxShadow: isActive ? "0 0 16px rgba(59,130,246,0.1)" : "none",
                })}
              >
                {({ isActive }) => (
                  <>
                    <div
                      className="flex items-center justify-center rounded-lg transition-all duration-200"
                      style={{
                        width: 32, height: 32,
                        background: isActive
                          ? "linear-gradient(135deg, #3b82f6, #8b5cf6)"
                          : "rgba(255,255,255,0.05)",
                        boxShadow: isActive ? "0 0 10px rgba(59,130,246,0.4)" : "none",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={15}
                        style={{ color: isActive ? "#fff" : "var(--text-secondary)" }}
                        strokeWidth={2}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-sm font-semibold leading-tight"
                        style={{ color: isActive ? "#f1f5f9" : "var(--text-secondary)" }}
                      >
                        {label}
                      </div>
                      <div className="text-xs leading-tight mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>
                        {desc}
                      </div>
                    </div>
                    {isActive && (
                      <div
                        style={{
                          width: 4, height: 4, borderRadius: "50%",
                          background: "#60a5fa",
                          boxShadow: "0 0 6px #60a5fa",
                          flexShrink: 0,
                        }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="rounded-lg p-1.5" style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.2)" }}>
                <Shield size={13} style={{ color: "#60a5fa" }} />
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>v1.0.0 Enterprise</p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Hackathon Build</p>
              </div>
            </div>
            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer"
              style={{
                background: "rgba(239,68,68,0.06)",
                border: "1px solid rgba(239,68,68,0.15)",
                color: "#f87171",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.3)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
              }}
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* AI Assistant floats over all screens */}
        <AIAssistant />
      </div>
    </IncidentStoreProvider>
  );
}