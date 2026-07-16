import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Zap, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Loading steps shown during login animation ──────────────────────────────

const LOADING_STEPS = [
  "Connecting to Secure Gateway...",
  "Verifying Signatures...",
  "Syncing Telemetry...",
  "Establishing Encrypted Channel...",
  "Session Authenticated ✓",
];

// ─── Animated background particles ──────────────────────────────────────────

function Particles() {
  const dots = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {dots.map((d) => (
        <motion.div
          key={d.id}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.size,
            height: d.size,
            background: d.id % 3 === 0
              ? "rgba(139,92,246,0.5)"
              : d.id % 2 === 0
              ? "rgba(59,130,246,0.4)"
              : "rgba(99,179,237,0.3)",
          }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
          transition={{ duration: d.duration, delay: d.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
      }} />

      {/* Radial glow center */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// ─── Scanning lines on the shield ────────────────────────────────────────────

function ScanLine() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-px pointer-events-none"
      style={{ background: "linear-gradient(90deg, transparent, rgba(59,130,246,0.7), transparent)" }}
      animate={{ top: ["0%", "100%", "0%"] }}
      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
    />
  );
}

// ─── Main login component ─────────────────────────────────────────────────────

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@trustlens.ai");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [shieldGlow, setShieldGlow] = useState(false);

  // Pulse the shield glow on mount
  useEffect(() => {
    const interval = setInterval(() => setShieldGlow((v) => !v), 2200);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your credentials.");
      return;
    }

    // Accept any non-empty password for demo
    if (password.length < 1) {
      setError("Invalid credentials. Try again.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    // Step through loading messages
    for (let i = 0; i < LOADING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setLoadingStep(i);
    }

    // Persist auth flag
    sessionStorage.setItem("trustlens_auth", "true");
    await new Promise((r) => setTimeout(r, 400));
    navigate("/", { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "var(--gradient-bg)", transition: "background 0.3s ease" }}
    >
      <Particles />

      {/* ── Card ──────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div>
          <div className="p-8">
            {/* ── Shield ──────────────────────────────────────────────────── */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <motion.div
                  animate={{ boxShadow: shieldGlow
                    ? "0 0 40px rgba(59,130,246,0.5), 0 0 80px rgba(59,130,246,0.2)"
                    : "0 0 20px rgba(59,130,246,0.25), 0 0 40px rgba(59,130,246,0.08)"
                  }}
                  transition={{ duration: 1.2, ease: "easeInOut" }}
                  style={{ borderRadius: "50%", display: "inline-block" }}
                >
                  <div className="relative overflow-hidden" style={{ width: 120, height: 120, borderRadius: "50%", border: "2px solid rgba(59,130,246,0.3)" }}>
                    <img
                      src="/images.jpg"
                      alt="TrustLens Logo"
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
                    />
                    <ScanLine />
                    {/* Vignette overlay */}
                    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle, transparent 40%, rgba(8,13,30,0.4) 100%)" }} />
                  </div>
                </motion.div>

                {/* Status ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: "absolute", inset: -8,
                    borderRadius: "50%",
                    border: "1px dashed rgba(59,130,246,0.25)",
                  }}
                />

                {/* Live dot */}
                <div style={{
                  position: "absolute", bottom: 4, right: 4,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 8px #10b981",
                  border: "2px solid rgba(8,13,30,0.9)",
                }} />
              </div>
            </div>

            {/* ── Heading ─────────────────────────────────────────────────── */}
            <div className="text-center mb-7">
              <h1
                className="text-2xl font-bold tracking-tight mb-1"
                style={{
                  background: "linear-gradient(135deg, var(--text-primary) 30%, #3b82f6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                TrustLens
              </h1>
              <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#3b82f6", letterSpacing: "0.18em" }}>
                AI Incident Intelligence Platform
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Authenticate to access the secure operations centre
              </p>
            </div>

            {/* ── Form ────────────────────────────────────────────────────── */}
            <form onSubmit={handleLogin} className="space-y-4" id="login-form">
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Operator ID / Email
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    autoComplete="username"
                    placeholder="admin@trustlens.ai"
                    className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: "var(--secondary)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Access Code
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: "var(--text-muted)" }}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    autoComplete="current-password"
                    placeholder="Enter access code…"
                    className="w-full pl-9 pr-10 py-2.5 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: "var(--secondary)",
                      border: "1px solid var(--border-subtle)",
                      color: "var(--text-primary)",
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.5)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.08)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#93c5fd"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs"
                    style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#fca5a5" }}
                  >
                    <Shield className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                id="login-submit"
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.015 } : {}}
                whileTap={!isLoading ? { scale: 0.985 } : {}}
                className="w-full py-3 rounded-xl text-sm font-bold text-white relative overflow-hidden cursor-pointer disabled:cursor-not-allowed transition-opacity"
                style={{
                  background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                  boxShadow: "0 0 24px rgba(59,130,246,0.3)",
                  opacity: isLoading ? 0.85 : 1,
                }}
              >
                {isLoading ? (
                  <motion.span
                    key={loadingStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex items-center justify-center gap-2"
                  >
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                      className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full"
                    />
                    {LOADING_STEPS[loadingStep]}
                  </motion.span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4" />
                    Establish Secure Session
                  </span>
                )}
                {/* Shimmer effect */}
                {!isLoading && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)" }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                  />
                )}
              </motion.button>
            </form>

            {/* ── Footer info ─────────────────────────────────────────────── */}
            <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: "0 0 5px #10b981" }} />
                  <span className="text-[10px] font-medium" style={{ color: "#6ee7b7" }}>All systems operational</span>
                </div>
                <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>v1.0.0 Enterprise</span>
              </div>
              <p className="text-[10px] text-center mt-3" style={{ color: "var(--text-muted)" }}>
                Protected by TrustLens Zero-Trust Security Architecture · End-to-End Encrypted
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
