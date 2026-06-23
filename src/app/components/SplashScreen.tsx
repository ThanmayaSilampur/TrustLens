import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

// ─── Config (easy to customise) ───────────────────────────────────────────────

const CONFIG = {
  logoSrc: "/images.jpg",
  brandName: "TrustLens",
  tagline: "AI Incident Intelligence Platform",
  accentA: "#3b82f6",   // blue
  accentB: "#8b5cf6",   // violet
  accentC: "#06b6d4",   // cyan
  totalDuration: 4500,  // ms before transition begins
};

// ─── Utility: seeded random so particles are stable ──────────────────────────

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// ─── Background canvas — star-field + drifting orbs ──────────────────────────

function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Build star data
    const STAR_COUNT = 140;
    const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
      x: seededRandom(i * 7) * window.innerWidth,
      y: seededRandom(i * 13) * window.innerHeight,
      r: 0.4 + seededRandom(i * 3) * 1.4,
      alpha: 0.2 + seededRandom(i * 17) * 0.6,
      speed: 0.05 + seededRandom(i * 5) * 0.12,
      phase: seededRandom(i * 11) * Math.PI * 2,
    }));

    // Shooting stars
    type Shooting = { x: number; y: number; vx: number; vy: number; life: number; maxLife: number };
    const shooters: Shooting[] = [];
    let shootTimer = 0;

    let t = 0;
    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Deep space gradient background
      const bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
      bg.addColorStop(0, "rgba(6,9,23,1)");
      bg.addColorStop(0.5, "rgba(4,7,18,1)");
      bg.addColorStop(1, "rgba(2,4,12,1)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Grid
      ctx.strokeStyle = "rgba(59,130,246,0.035)";
      ctx.lineWidth = 1;
      const gs = 60;
      for (let x = 0; x < W; x += gs) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
      for (let y = 0; y < H; y += gs) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

      // Central radial glow (blue)
      const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 340);
      cg.addColorStop(0, "rgba(59,130,246,0.07)");
      cg.addColorStop(0.5, "rgba(139,92,246,0.04)");
      cg.addColorStop(1, "transparent");
      ctx.fillStyle = cg;
      ctx.fillRect(0, 0, W, H);

      // Twinkling stars
      stars.forEach((s) => {
        const flicker = Math.sin(t * s.speed + s.phase) * 0.3 + 0.7;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,210,255,${s.alpha * flicker})`;
        ctx.fill();
      });

      // Shooting stars
      shootTimer++;
      if (shootTimer > 90 && Math.random() < 0.03) {
        shootTimer = 0;
        shooters.push({
          x: Math.random() * W,
          y: Math.random() * H * 0.4,
          vx: 4 + Math.random() * 5,
          vy: 1.5 + Math.random() * 2.5,
          life: 0,
          maxLife: 40 + Math.random() * 30,
        });
      }
      shooters.forEach((s, idx) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life++;
        const p = s.life / s.maxLife;
        const alpha = p < 0.3 ? p / 0.3 : 1 - (p - 0.3) / 0.7;
        const grad = ctx.createLinearGradient(s.x - s.vx * 8, s.y - s.vy * 8, s.x, s.y);
        grad.addColorStop(0, "transparent");
        grad.addColorStop(1, `rgba(147,197,253,${alpha * 0.9})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 10, s.y - s.vy * 10);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
        if (s.life >= s.maxLife) shooters.splice(idx, 1);
      });

      t++;
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
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// ─── Floating data-stream lines (side decoration) ────────────────────────────

function DataStreams() {
  const lines = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    x: i % 2 === 0 ? `${4 + i * 3}%` : `${88 - i * 2}%`,
    delay: i * 0.4,
    duration: 2.5 + i * 0.3,
    chars: Array.from({ length: 12 }, (__, j) =>
      "0123456789ABCDEF"[Math.floor(seededRandom(i * 100 + j) * 16)]
    ),
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }} aria-hidden="true">
      {lines.map((l) => (
        <motion.div
          key={l.id}
          className="absolute top-0 flex flex-col gap-1"
          style={{ left: l.x, fontFamily: "monospace", fontSize: 9, letterSpacing: 2 }}
          initial={{ y: -200, opacity: 0 }}
          animate={{ y: "110vh", opacity: [0, 0.18, 0.18, 0] }}
          transition={{ duration: l.duration, delay: l.delay, repeat: Infinity, ease: "linear", repeatDelay: 1 }}
        >
          {l.chars.map((c, ci) => (
            <span
              key={ci}
              style={{
                color: ci % 3 === 0 ? CONFIG.accentA : ci % 3 === 1 ? CONFIG.accentB : CONFIG.accentC,
                opacity: 1 - ci * 0.07,
              }}
            >
              {c}
            </span>
          ))}
        </motion.div>
      ))}
    </div>
  );
}

// ─── 3-D orbital rings around the logo ───────────────────────────────────────

function OrbitalRings() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Ring 1 — tilted ellipse, blue */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 220, height: 90,
          borderRadius: "50%",
          border: `1px solid ${CONFIG.accentA}44`,
          boxShadow: `0 0 12px ${CONFIG.accentA}22`,
          transform: "rotateX(72deg)",
        }}
      />
      {/* Ring 2 — counter-rotate, violet */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 260, height: 100,
          borderRadius: "50%",
          border: `1px solid ${CONFIG.accentB}33`,
          transform: "rotateX(72deg) rotateY(30deg)",
        }}
      />
      {/* Ring 3 — slow cyan dashed */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 310, height: 120,
          borderRadius: "50%",
          border: `1px dashed ${CONFIG.accentC}22`,
          transform: "rotateX(72deg) rotateY(-20deg)",
        }}
      />

      {/* Orbiting dot — blue */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 220, height: 90,
          transform: "rotateX(72deg)",
        }}
      >
        <div style={{
          position: "absolute", top: -4, left: "50%",
          width: 7, height: 7, borderRadius: "50%",
          background: CONFIG.accentA,
          boxShadow: `0 0 10px ${CONFIG.accentA}, 0 0 20px ${CONFIG.accentA}88`,
        }} />
      </motion.div>

      {/* Orbiting dot — violet */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 260, height: 100,
          transform: "rotateX(72deg) rotateY(30deg)",
        }}
      >
        <div style={{
          position: "absolute", bottom: -4, right: "20%",
          width: 5, height: 5, borderRadius: "50%",
          background: CONFIG.accentB,
          boxShadow: `0 0 8px ${CONFIG.accentB}, 0 0 16px ${CONFIG.accentB}88`,
        }} />
      </motion.div>
    </div>
  );
}

// ─── Logo shield with scanning effect ────────────────────────────────────────

function LogoBadge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.4, opacity: 0, filter: "blur(20px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          style={{ position: "relative", zIndex: 10 }}
        >
          {/* Glow halo */}
          <motion.div
            animate={{
              boxShadow: [
                `0 0 40px ${CONFIG.accentA}55, 0 0 80px ${CONFIG.accentA}22`,
                `0 0 60px ${CONFIG.accentA}88, 0 0 120px ${CONFIG.accentA}44, 0 0 200px ${CONFIG.accentB}22`,
                `0 0 40px ${CONFIG.accentA}55, 0 0 80px ${CONFIG.accentA}22`,
              ],
            }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              width: 148, height: 148, borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${CONFIG.accentA}55`,
              position: "relative",
            }}
          >
            <img
              src={CONFIG.logoSrc}
              alt="TrustLens Logo"
              style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 15%" }}
            />

            {/* Scan line */}
            <motion.div
              style={{
                position: "absolute", left: 0, right: 0, height: 2,
                background: `linear-gradient(90deg, transparent, ${CONFIG.accentA}cc, ${CONFIG.accentC}cc, transparent)`,
              }}
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "linear" }}
            />

            {/* Vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(circle, transparent 45%, rgba(4,7,18,0.55) 100%)",
            }} />
          </motion.div>

          {/* Corner accent ticks */}
          {["tl", "tr", "bl", "br"].map((corner) => (
            <motion.div
              key={corner}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.3 }}
              style={{
                position: "absolute",
                width: 14, height: 14,
                ...(corner === "tl" ? { top: -2, left: -2, borderTop: `2px solid ${CONFIG.accentA}`, borderLeft: `2px solid ${CONFIG.accentA}` } : {}),
                ...(corner === "tr" ? { top: -2, right: -2, borderTop: `2px solid ${CONFIG.accentA}`, borderRight: `2px solid ${CONFIG.accentA}` } : {}),
                ...(corner === "bl" ? { bottom: -2, left: -2, borderBottom: `2px solid ${CONFIG.accentA}`, borderLeft: `2px solid ${CONFIG.accentA}` } : {}),
                ...(corner === "br" ? { bottom: -2, right: -2, borderBottom: `2px solid ${CONFIG.accentA}`, borderRight: `2px solid ${CONFIG.accentA}` } : {}),
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Brand name with per-letter stagger ──────────────────────────────────────

function BrandName({ visible }: { visible: boolean }) {
  const letters = CONFIG.brandName.split("");

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: "flex", gap: 1, justifyContent: "center", overflow: "hidden" }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 40, opacity: 0, filter: "blur(8px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                delay: 0.1 + i * 0.07,
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: "Inter, system-ui, sans-serif",
                background: `linear-gradient(135deg, #ffffff 30%, ${CONFIG.accentA} 70%, ${CONFIG.accentB} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                display: "inline-block",
                lineHeight: 1,
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Tagline with typewriter ──────────────────────────────────────────────────

function Tagline({ visible }: { visible: boolean }) {
  const [displayed, setDisplayed] = useState("");
  const full = CONFIG.tagline;

  useEffect(() => {
    if (!visible) { setDisplayed(""); return; }
    let i = 0;
    const delay = 900; // start after brand name
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(full.slice(0, i));
        if (i >= full.length) clearInterval(interval);
      }, 38);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [visible, full]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{
            fontFamily: "monospace",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: CONFIG.accentA,
            minHeight: 18,
          }}
        >
          {displayed}
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, ease: "steps(1)" }}
            style={{ display: "inline-block", width: 1, height: 12, background: CONFIG.accentA, marginLeft: 2, verticalAlign: "middle" }}
          />
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ─── Loading bar ──────────────────────────────────────────────────────────────

function LoadingBar({ visible, duration }: { visible: boolean; duration: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ width: 200 }}
        >
          {/* Track */}
          <div style={{
            width: "100%", height: 2,
            background: "rgba(255,255,255,0.06)",
            borderRadius: 2, overflow: "hidden",
            border: `1px solid rgba(59,130,246,0.15)`,
          }}>
            {/* Fill */}
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: [0.4, 0, 0.2, 1] }}
              style={{
                height: "100%",
                background: `linear-gradient(90deg, ${CONFIG.accentA}, ${CONFIG.accentC}, ${CONFIG.accentB})`,
                borderRadius: 2,
                boxShadow: `0 0 8px ${CONFIG.accentA}`,
              }}
            />
          </div>

          <motion.p
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              textAlign: "center", marginTop: 8,
              fontSize: 9, letterSpacing: "0.18em",
              fontFamily: "monospace",
              color: "rgba(147,197,253,0.5)",
              textTransform: "uppercase",
            }}
          >
            Initializing secure environment
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stat badges (decorative) ─────────────────────────────────────────────────

const BADGES = [
  { label: "Zero-Trust", icon: "🛡️" },
  { label: "E2E Encrypted", icon: "🔐" },
  { label: "AI Powered", icon: "⚡" },
];

function StatBadges({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}
        >
          {BADGES.map((b, i) => (
            <motion.div
              key={b.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.7 + i * 0.12 }}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "4px 10px", borderRadius: 20,
                background: "rgba(59,130,246,0.06)",
                border: "1px solid rgba(59,130,246,0.18)",
                fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                color: "rgba(147,197,253,0.75)",
                fontFamily: "Inter, system-ui, sans-serif",
              }}
            >
              <span style={{ fontSize: 11 }}>{b.icon}</span>
              {b.label}
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main splash component ────────────────────────────────────────────────────

export function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [contentVisible, setContentVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Mark splash as seen so it only appears once per page load
    (window as any).__trustlens_splash_seen = true;

    // Show content a tick after mount
    const t1 = setTimeout(() => setContentVisible(true), 80);

    // Begin exit transition
    const t2 = setTimeout(() => {
      setPhase("out");
      setExiting(true);
    }, CONFIG.totalDuration);

    // Navigate after exit animation finishes
    const t3 = setTimeout(() => {
      navigate("/login", { replace: true });
    }, CONFIG.totalDuration + 600);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [navigate]);

  return (
    <AnimatePresence>
      {!exiting ? (
        <motion.div
          key="splash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 9999,
            perspective: 1000,
          }}
        >
          {/* Canvas starfield */}
          <StarField />

          {/* Matrix data streams */}
          <DataStreams />

          {/* Glass panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative", zIndex: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 24,
              padding: "52px 64px",
              background: "rgba(4,8,22,0.72)",
              backdropFilter: "blur(32px)",
              WebkitBackdropFilter: "blur(32px)",
              borderRadius: 28,
              border: "1px solid rgba(59,130,246,0.16)",
              boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(59,130,246,0.06)`,
              minWidth: 360, maxWidth: "90vw",
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: "absolute", top: 0, left: "15%", right: "15%", height: 1,
              background: `linear-gradient(90deg, transparent, ${CONFIG.accentA}88, ${CONFIG.accentB}88, transparent)`,
              borderRadius: 1,
            }} />

            {/* Orbital rings (behind logo) */}
            <div style={{ position: "relative", width: 148, height: 148, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <OrbitalRings />
              <LogoBadge visible={contentVisible} />
            </div>

            {/* Brand name */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
              <BrandName visible={contentVisible} />
              <Tagline visible={contentVisible} />
            </div>

            {/* Divider */}
            <AnimatePresence>
              {contentVisible && (
                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  style={{
                    width: "60%", height: 1,
                    background: "rgba(59,130,246,0.12)",
                    transformOrigin: "center",
                  }}
                />
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <LoadingBar visible={contentVisible} duration={CONFIG.totalDuration - 500} />

            {/* Stat badges */}
            <StatBadges visible={contentVisible} />

            {/* Bottom accent line */}
            <div style={{
              position: "absolute", bottom: 0, left: "20%", right: "20%", height: 1,
              background: `linear-gradient(90deg, transparent, ${CONFIG.accentB}55, transparent)`,
              borderRadius: 1,
            }} />
          </motion.div>

          {/* Corner HUD decorations */}
          {[
            { top: 24, left: 24 },
            { top: 24, right: 24 },
            { bottom: 24, left: 24 },
            { bottom: 24, right: 24 },
          ].map((pos, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              style={{
                position: "fixed", ...pos, zIndex: 10,
                width: 32, height: 32,
                borderTop: pos.top !== undefined ? `1.5px solid ${CONFIG.accentA}44` : "none",
                borderBottom: pos.bottom !== undefined ? `1.5px solid ${CONFIG.accentA}44` : "none",
                borderLeft: pos.left !== undefined ? `1.5px solid ${CONFIG.accentA}44` : "none",
                borderRight: pos.right !== undefined ? `1.5px solid ${CONFIG.accentA}44` : "none",
                borderRadius: pos.top !== undefined && pos.left !== undefined ? "4px 0 0 0"
                  : pos.top !== undefined ? "0 4px 0 0"
                  : pos.left !== undefined ? "0 0 0 4px" : "0 0 4px 0",
              }}
            />
          ))}

          {/* Version tag */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            style={{
              position: "fixed", bottom: 20,
              fontSize: 9, letterSpacing: "0.15em",
              fontFamily: "monospace",
              color: "rgba(147,197,253,0.25)",
              textTransform: "uppercase",
              zIndex: 10,
            }}
          >
            TrustLens v1.0.0 · Enterprise Edition · All Systems Operational
          </motion.p>
        </motion.div>
      ) : (
        // Render nothing on exit so AnimatePresence triggers exit animations
        <motion.div key="splash-exit" exit={{ opacity: 0 }} />
      )}
    </AnimatePresence>
  );
}
