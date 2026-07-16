import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";

// ─── Config ───────────────────────────────────────────────────────────────────

const CONFIG = {
  logoSrc: "/images.jpg",
  brandName: "TrustLens",
  tagline: "AI Incident Intelligence Platform",
  totalDuration: 4500,
};

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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PARTICLE_COUNT = 80;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
    }));

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Determine colors based on theme class
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

          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            const alpha = (1 - dist / 150) * 0.2;
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
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}

// ─── Neutral Logo Badge ──────────────────────────────────────────────────────

function LogoBadge({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
          style={{ position: "relative", zIndex: 10 }}
        >
          <motion.div
            style={{
              width: 148, height: 148, borderRadius: "50%",
              overflow: "hidden",
              border: "1px solid var(--border-subtle)",
              background: "var(--bg-elevated)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              position: "relative",
              padding: 2,
            }}
          >
            <img
              src={CONFIG.logoSrc}
              alt="TrustLens Logo"
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover", objectPosition: "center 15%" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Brand name ─────────────────────────────────────────────────────────────

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
              initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              transition={{
                delay: 0.1 + i * 0.05,
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
              style={{
                fontSize: 42,
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontFamily: "Inter, system-ui, sans-serif",
                color: "var(--text-primary)",
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

// ─── Tagline ────────────────────────────────────────────────────────────────

function Tagline({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "var(--text-secondary)",
            minHeight: 18,
          }}
        >
          {CONFIG.tagline}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

// ─── Loading bar ────────────────────────────────────────────────────────────

function LoadingBar({ visible, duration }: { visible: boolean; duration: number }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ width: 240, display: "flex", flexDirection: "column", alignItems: "center" }}
        >
          <div style={{
            width: "100%", height: 2,
            background: "var(--border-subtle)",
            borderRadius: 2, overflow: "hidden",
          }}>
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
              style={{
                height: "100%",
                background: "var(--text-primary)",
                borderRadius: 2,
              }}
            />
          </div>
          <motion.p
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{
              marginTop: 12,
              fontSize: 10, letterSpacing: "0.1em",
              color: "var(--text-muted)",
              textTransform: "uppercase",
            }}
          >
            Initializing
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main splash component ──────────────────────────────────────────────────

export function SplashScreen() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");
  const [contentVisible, setContentVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    (window as any).__trustlens_splash_seen = true;
    const t1 = setTimeout(() => setContentVisible(true), 80);
    const t2 = setTimeout(() => {
      setPhase("out");
      setExiting(true);
    }, CONFIG.totalDuration);
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
          exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: "fixed", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            zIndex: 9999,
            background: "var(--bg-base)",
            transition: "background 0.3s ease",
          }}
        >
          <GeometricMesh />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "relative", zIndex: 10,
              display: "flex", flexDirection: "column",
              alignItems: "center", gap: 32,
              padding: "40px",
            }}
          >
            <LogoBadge visible={contentVisible} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <BrandName visible={contentVisible} />
              <Tagline visible={contentVisible} />
            </div>
            <LoadingBar visible={contentVisible} duration={CONFIG.totalDuration - 500} />
          </motion.div>
        </motion.div>
      ) : (
        <motion.div key="splash-exit" exit={{ opacity: 0 }} />
      )}
    </AnimatePresence>
  );
}
