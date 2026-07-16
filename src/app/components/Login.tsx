import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Shield, Eye, EyeOff, Zap, Lock, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Config ───────────────────────────────────────────────────────────────────

const LOADING_STEPS = [
  "Connecting to Secure Gateway...",
  "Verifying Signatures...",
  "Syncing Telemetry...",
  "Establishing Encrypted Channel...",
  "Session Authenticated ✓",
];

// ─── Geometric Mesh Canvas ───────────────────────────────────────────────────

function GeometricMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      // Use parent container width/height
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 90;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 800),
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const isLight = document.documentElement.classList.contains("light");
      const dotColor = isLight ? "rgba(15, 23, 42, 0.15)" : "rgba(241, 245, 249, 0.15)";
      const lineColor = isLight ? "rgba(15, 23, 42, " : "rgba(241, 245, 249, ";

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      });

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 140) * 0.2;
            ctx.strokeStyle = `${lineColor}${alpha})`;
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = dotColor;
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your credentials.");
      return;
    }

    if (password.length < 1) {
      setError("Invalid credentials. Try again.");
      return;
    }

    setIsLoading(true);
    setLoadingStep(0);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 700));
      setLoadingStep(i);
    }

    sessionStorage.setItem("trustlens_auth", "true");
    await new Promise((r) => setTimeout(r, 400));
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ── Background Animation ────────────────────────────────────────────── */}
      <GeometricMesh />
      
      {/* ── Center Content: Transparent Form ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="p-8 sm:p-10">
          {/* Logo & Brand */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 mb-5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-1.5 shadow-sm">
              <img
                src="/images.jpg"
                alt="TrustLens Logo"
                className="w-full h-full rounded-full object-cover object-center"
              />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] mb-1">
              TrustLens
            </h1>
            <p className="text-xs font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
              Operations Centre
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6" id="login-form">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-[11px] font-bold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">
                Operator ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="username"
                  placeholder="admin@trustlens.ai"
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none transition-all bg-[var(--bg-base)]/50 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] focus:bg-[var(--bg-base)] focus:border-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--text-secondary)] placeholder-[var(--text-muted)]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-[11px] font-bold mb-2 text-[var(--text-secondary)] uppercase tracking-wider">
                Access Code
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  placeholder="Enter access code…"
                  className="w-full pl-10 pr-12 py-3 text-sm rounded-xl outline-none transition-all bg-[var(--bg-base)]/50 backdrop-blur-sm border border-[var(--border-subtle)] text-[var(--text-primary)] focus:bg-[var(--bg-base)] focus:border-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--text-secondary)] placeholder-[var(--text-muted)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors cursor-pointer text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium bg-red-500/10 border border-red-500/20 text-red-500"
                >
                  <Shield className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit button */}
            <motion.button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.01 } : {}}
              whileTap={!isLoading ? { scale: 0.99 } : {}}
              className="w-full py-3.5 mt-2 rounded-xl text-sm font-bold text-[var(--bg-base)] bg-[var(--text-primary)] flex items-center justify-center gap-2 relative overflow-hidden cursor-pointer disabled:cursor-not-allowed transition-opacity disabled:opacity-80 shadow-[0_4px_14px_rgba(0,0,0,0.15)]"
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
                    className="inline-block w-4 h-4 border-2 border-[var(--bg-base)] border-t-transparent rounded-full"
                  />
                  <span className="truncate max-w-[200px]">{LOADING_STEPS[loadingStep]}</span>
                </motion.span>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Establish Secure Session
                </>
              )}
            </motion.button>
          </form>

          {/* ── Footer info ─────────────────────────────────────────────── */}
          <div className="mt-8 pt-6 flex flex-col items-center justify-center gap-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[11px] font-medium text-[var(--text-primary)]">All systems operational</span>
              </div>
              <span className="text-[11px] font-medium text-[var(--text-muted)]">v1.0.0 Enterprise</span>
            </div>
          </div>
        </div>
        
        <p className="text-[10px] text-center text-[var(--text-muted)] mt-6 px-4">
          Protected by TrustLens Zero-Trust Security Architecture · End-to-End Encrypted
        </p>
      </motion.div>
    </div>
  );
}
