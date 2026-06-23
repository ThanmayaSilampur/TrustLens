import {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { useIncidentStore } from "../lib/incidentStore";
import {
  X,
  Send,
  Monitor,
  Plus,
  Camera,
  StopCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Bot,
  User,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  CheckCircle2,
  XCircle,
  ArrowUpCircle,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfidenceLevel {
  label: "High Confidence" | "Review Recommended" | "Low Confidence";
  percent: number;
}

interface StructuredResponse {
  answer: string;
  why: string;
  evidence: Array<{ text: string; source: string }>;
  confidence: ConfidenceLevel;
  limitations: string;
  showNextActions?: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content?: string;
  structured?: StructuredResponse;
  timestamp: Date;
  screenshots?: string[];
}

interface SharedScreen {
  id: string;
  stream: MediaStream;
  label: string;
}

// ─── Dynamic response builder (reads live store state) ────────────────────────

function confidenceLabel(pct: number): "High Confidence" | "Review Recommended" | "Low Confidence" {
  if (pct >= 80) return "High Confidence";
  if (pct >= 55) return "Review Recommended";
  return "Low Confidence";
}

type StoreSnapshot = {
  threatSummary: { title: string; confidence: number; tags: string[]; limitations: string[]; sources: string };
  evidenceCards: { title: string; source: string; description: string; confidence: number }[];
  actions: { title: string; description: string; severity: string }[];
  alternativeExplanations: { title: string; likelihood: string; reason: string }[];
};

function buildResponse(
  question: string,
  hasScreenshots: boolean,
  snap: StoreSnapshot
): StructuredResponse {
  const q = question.toLowerCase();
  const { threatSummary, evidenceCards, actions, alternativeExplanations } = snap;
  const conf = threatSummary.confidence;
  const confLabel = confidenceLabel(conf);
  const tags = threatSummary.tags.join(", ") || "anomalous activity";
  const primaryEv = evidenceCards.slice(0, 3).map((e) => ({
    text: e.description,
    source: e.source,
  }));
  const primaryEvidenceFallback = [
    { text: `Incident classified as: ${threatSummary.title}`, source: "TrustLens AI Engine" },
    { text: `Evidence sources: ${threatSummary.sources}`, source: "Log Analysis" },
    { text: `Confidence: ${conf.toFixed(1)}%`, source: "Threat Model" },
  ];
  const evidenceToUse = primaryEv.length > 0 ? primaryEv : primaryEvidenceFallback;
  const limitationText = threatSummary.limitations[0] ?? "Analysis is based on available log telemetry only.";
  const pendingActions = actions.filter((a: { state?: string }) => (a as { state?: string }).state !== "approved");
  const actionEvidence = pendingActions.slice(0, 3).map((a) => ({
    text: a.description,
    source: `Recommended Action — ${a.severity} severity`,
  }));

  // Screen share context
  if (hasScreenshots) {
    return {
      answer: `I can see the TrustLens dashboard. The active incident is: "${threatSummary.title}".`,
      why: `The primary threat indicators are: ${tags}. Confidence is ${conf.toFixed(1)}%.`,
      evidence: evidenceToUse,
      confidence: { label: confLabel, percent: conf },
      limitations: "I can only read what's currently visible on screen — anything scrolled out of view or in a different tab isn't factored in.",
      showNextActions: true,
    };
  }

  // False-positive / wrong / incorrect
  if (q.includes("false positive") || q.includes("false alarm") || q.includes("wrong") || q.includes("incorrect")) {
    const altEvidence = alternativeExplanations.slice(0, 3).map((ae) => ({
      text: `${ae.title} (${ae.likelihood}): ${ae.reason}`,
      source: "Alternative Explanation Analysis",
    }));
    return {
      answer: `${altEvidence.length} alternative explanations were considered before reaching this conclusion.`,
      why: "Ruling out benign explanations is part of how TrustLens reaches a reliable classification.",
      evidence: altEvidence.length > 0 ? altEvidence : evidenceToUse,
      confidence: { label: confLabel, percent: Math.min(conf, 60) },
      limitations: `The primary finding stands at ${conf.toFixed(1)}% confidence until one of these alternatives is confirmed through investigation.`,
    };
  }

  // Evidence / sources
  if (q.includes("evidence") || q.includes("sources") || q.includes("proof") || q.includes("data")) {
    return {
      answer: `The finding is supported by ${evidenceCards.length} independent evidence signal${evidenceCards.length !== 1 ? "s" : ""}.`,
      why: "Cross-referencing multiple independent sources significantly reduces the chance of a single-sensor false alert.",
      evidence: evidenceToUse,
      confidence: { label: confLabel, percent: conf },
      limitations: limitationText,
    };
  }

  // Threat / attack details
  if (q.includes("threat") || q.includes("attack") || q.includes("malicious") || q.includes("what happened")) {
    return {
      answer: threatSummary.title,
      why: `Detected threat indicators: ${tags}. ${threatSummary.sources}`,
      evidence: evidenceToUse,
      confidence: { label: confLabel, percent: conf },
      limitations: limitationText,
      showNextActions: true,
    };
  }

  // Recommendations / next steps / actions
  if (q.includes("recommend") || q.includes("should i") || q.includes("next step") || q.includes("what to do") || q.includes("action") || q.includes("fix") || q.includes("remediat")) {
    return {
      answer: pendingActions.length > 0
        ? `There are ${pendingActions.length} recommended action${pendingActions.length !== 1 ? "s" : ""} pending your approval.`
        : "All recommended actions have been addressed. No pending remediations.",
      why: "Each action targets a specific part of the detected threat. None execute without your explicit approval.",
      evidence: actionEvidence.length > 0 ? actionEvidence : evidenceToUse,
      confidence: { label: confLabel, percent: conf },
      limitations: "All actions are reversible only where noted — review each one before approving on the AI Decision screen.",
      showNextActions: true,
    };
  }

  // Why / how / explain
  if (q.includes("why") || q.includes("how did") || q.includes("how does") || q.includes("explain") || q.includes("why flagged") || q.includes("why was")) {
    return {
      answer: `This was flagged because the AI detected: ${tags}.`,
      why: `Multiple independent signals arrived in the same window and together matched a known threat pattern. Confidence: ${conf.toFixed(1)}%.`,
      evidence: evidenceToUse,
      confidence: { label: confLabel, percent: conf },
      limitations: limitationText,
    };
  }

  // Default fallback
  return {
    answer: `I can help you investigate this incident, understand the AI's reasoning, or plan your next steps.`,
    why: `TrustLens has classified the current event as: "${threatSummary.title}" with ${conf.toFixed(1)}% confidence.`,
    evidence: evidenceToUse,
    confidence: { label: confLabel, percent: conf },
    limitations: limitationText,
  };
}

// ─── Confidence badge ─────────────────────────────────────────────────────────

function InlineBadge({ confidence }: { confidence: ConfidenceLevel }) {
  const config = {
    "High Confidence": {
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
    "Review Recommended": {
      icon: ShieldAlert,
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    "Low Confidence": {
      icon: ShieldQuestion,
      color: "text-slate-400",
      bg: "bg-slate-500/10 border-slate-700/20",
    },
  }[confidence.label];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.color} ${config.bg}`}
    >
      <Icon className="w-3 h-3" />
      {confidence.label}
      <span className="text-[10px] text-slate-500 font-normal opacity-70">
        ({confidence.percent}%)
      </span>
    </span>
  );
}

// ─── Welcome bubble (shown before any logs are uploaded) ───────────────────────────

const WELCOME_PROMPTS = [
  "How does TrustLens detect threats?",
  "What is privilege escalation?",
  "How do I upload logs?",
];

function WelcomeBubble({ onQuickReply }: { onQuickReply: (text: string) => void }) {
  return (
    <div className="space-y-3 animate-fade-in-up">
      <div className="rounded-xl rounded-tl-sm border border-slate-800 bg-slate-950/20 overflow-hidden shadow-sm">
        {/* Intro header */}
        <div className="px-3.5 py-3" style={{ borderBottom: "1px solid var(--border-subtle)", background: "linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.05))" }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-brand)" }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <p className="text-xs font-bold" style={{ color: "var(--text-primary)" }}>Welcome to TrustLens AI</p>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            I’m your AI-powered security analyst. Upload system logs on the <strong style={{ color: "#93c5fd" }}>Log Analysis</strong> screen to begin threat investigation, or ask me anything about the process.
          </p>
        </div>

        {/* Capabilities */}
        <div className="px-3.5 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#3b82f6" }}>What I can do</p>
          <ul className="space-y-1.5">
            {[
              { icon: "🔍", text: "Analyze uploaded logs for threat signatures" },
              { icon: "📊", text: "Explain AI confidence and decision reasoning" },
              { icon: "🛡️", text: "Recommend and track remediation actions" },
              { icon: "📋", text: "Answer security investigation questions" },
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <span className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>{item.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Upload nudge */}
        <div className="px-3.5 py-2.5" style={{ background: "rgba(16,185,129,0.04)", borderTop: "1px solid rgba(16,185,129,0.12)" }}>
          <div className="flex items-start gap-1.5">
            <span className="text-emerald-400 text-xs font-bold mt-0.5">→</span>
            <p className="text-xs" style={{ color: "#6ee7b7" }}>
              Upload your first log file to activate full incident analysis mode.
            </p>
          </div>
        </div>
      </div>

      {/* Quick-reply suggestion chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {WELCOME_PROMPTS.map((reply) => (
          <button
            key={reply}
            onClick={() => onQuickReply(reply)}
            className="text-xs text-slate-300 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/10 rounded-full px-3 py-1 transition-colors cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Structured message bubble ────────────────────────────────────────────────

const QUICK_REPLIES = [
  "Why was this flagged?",
  "What evidence supports this?",
  "What could make this wrong?",
];

function StructuredBubble({
  structured,
  onQuickReply,
}: {
  structured: StructuredResponse;
  onQuickReply: (text: string) => void;
}) {
  return (
    <div className="space-y-1.5 animate-fade-in-up">
      {/* 1. Direct answer */}
      <div className="rounded-xl rounded-tl-sm border border-slate-800 bg-slate-950/20 overflow-hidden shadow-sm">
        {/* Answer */}
        <div className="px-3.5 py-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-xs font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
            {structured.answer}
          </p>
        </div>

        {/* Why */}
        <div className="px-3.5 py-2.5 bg-slate-900/40" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#3b82f6" }}>
            Why
          </p>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            {structured.why}
          </p>
        </div>

        {/* Evidence */}
        <div className="px-3.5 py-2.5" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#3b82f6" }}>
            Evidence
          </p>
          <ul className="space-y-2">
            {structured.evidence.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-500/40 flex-shrink-0" />
                <span className="text-xs leading-snug" style={{ color: "var(--text-secondary)" }}>
                  {item.text}
                  <span className="ml-1.5 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
                    · {item.source}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Confidence */}
        <div className="px-3.5 py-2.5 bg-slate-900/20 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#3b82f6" }}>
            Confidence
          </p>
          <InlineBadge confidence={structured.confidence} />
        </div>

        {/* Limitations */}
        <div className="px-3.5 py-2.5" style={{ borderBottom: structured.showNextActions ? "1px solid var(--border-subtle)" : "none" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#3b82f6" }}>
            Limitations
          </p>
          <div className="flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {structured.limitations}
            </p>
          </div>
        </div>

        {/* Next Actions */}
        {structured.showNextActions && (
          <div className="px-3.5 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: "#3b82f6" }}>
              Next Actions
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button className="inline-flex items-center gap-1 bg-emerald-650 hover:bg-emerald-600 text-slate-950 font-bold text-xs px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                <CheckCircle2 className="w-3 h-3" />
                Approve
              </button>
              <button className="inline-flex items-center gap-1 border border-orange-500/35 text-orange-400 hover:bg-orange-500/10 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                <XCircle className="w-3 h-3" />
                Override
              </button>
              <button className="inline-flex items-center gap-1 border border-slate-800 text-slate-350 hover:bg-slate-850 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer">
                <ArrowUpCircle className="w-3 h-3" />
                Escalate
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick-reply chips */}
      <div className="flex flex-wrap gap-1.5 pt-0.5">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => onQuickReply(reply)}
            className="text-xs text-slate-300 bg-slate-900 border border-slate-800 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/10 rounded-full px-3 py-1 transition-colors cursor-pointer"
          >
            {reply}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Screen preview ───────────────────────────────────────────────────────────

function ScreenPreview({
  screen,
  onRemove,
  onCapture,
}: {
  screen: SharedScreen;
  onRemove: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = screen.stream;
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [screen.stream]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    onCapture(canvas.toDataURL("image/jpeg", 0.7));
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black group">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-28 object-contain bg-black"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
        <button
          onClick={capture}
          className="bg-slate-900 border border-slate-800 text-slate-300 rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-slate-850 transition-colors cursor-pointer"
        >
          <Camera className="w-3 h-3 text-blue-400" /> Snap
        </button>
        <button
          onClick={onRemove}
          className="bg-red-950/40 border border-red-500/20 text-red-400 rounded-md px-2 py-1 text-xs flex items-center gap-1 hover:bg-red-900/60 transition-colors cursor-pointer"
        >
          <StopCircle className="w-3 h-3" /> Stop
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/75 px-2 py-1">
        <p className="text-slate-200 text-[10px] truncate">{screen.label}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AIAssistant() {
  // ── Consume live incident state ──────────────────────────────────────────
  const store = useIncidentStore();
  const storeRef = useRef(store);
  storeRef.current = store; // always up-to-date inside callbacks

  const [isOpen, setIsOpen] = useState(false);
  // Start with no messages — WelcomeBubble shows via isAnalyzed check instead
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sharedScreens, setSharedScreens] = useState<SharedScreen[]>([]);
  const [screensExpanded, setScreensExpanded] = useState(true);
  const [pendingScreenshots, setPendingScreenshots] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    return () => {
      sharedScreens.forEach((s) => s.stream.getTracks().forEach((t) => t.stop()));
    };
  }, []);

  const addScreen = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 15 },
        audio: false,
      });
      const label = stream.getVideoTracks()[0]?.label || `Screen ${sharedScreens.length + 1}`;
      const id = `screen-${Date.now()}`;
      setSharedScreens((prev) => [...prev, { id, stream, label }]);
      setScreensExpanded(true);
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        setSharedScreens((prev) => prev.filter((s) => s.id !== id));
      });
    } catch {
      // User cancelled — ignore
    }
  }, [sharedScreens.length]);

  const removeScreen = useCallback((id: string) => {
    setSharedScreens((prev) => {
      prev.find((s) => s.id === id)?.stream.getTracks().forEach((t) => t.stop());
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  const dispatchMessage = useCallback(
    (text: string, screenshots: string[] = []) => {
      if (!text.trim() && screenshots.length === 0) return;

      const userMsg: Message = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text || "(Shared screen captures)",
        timestamp: new Date(),
        screenshots: screenshots.length > 0 ? screenshots : undefined,
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setPendingScreenshots([]);
      setIsTyping(true);

      setTimeout(() => {
        // Build response from the live store snapshot at the time the reply fires
        const structured = buildResponse(text, screenshots.length > 0, storeRef.current);
        setMessages((prev) => [
          ...prev,
          {
            id: `a-${Date.now()}`,
            role: "assistant",
            structured,
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 900 + Math.random() * 600);
    },
    [] // storeRef.current is always fresh — no deps needed
  );

  const sendMessage = useCallback(() => {
    dispatchMessage(input, pendingScreenshots);
  }, [input, pendingScreenshots, dispatchMessage]);

  const handleQuickReply = useCallback(
    (text: string) => {
      dispatchMessage(text);
    },
    [dispatchMessage]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-colors cursor-pointer ${
          isOpen ? "hidden" : "flex"
        }`}
        style={{ background: "var(--gradient-brand)", boxShadow: "var(--glow-brand)" }}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
        {sharedScreens.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {sharedScreens.length}
          </span>
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 40, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-6 right-6 z-50 w-[440px] flex flex-col glass-strong shadow-2xl border border-slate-850 rounded-2xl overflow-hidden"
            style={{ maxHeight: "calc(100vh - 48px)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0" style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-brand)", boxShadow: "0 0 10px rgba(59,130,246,0.3)" }}>
                  <Bot className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    TrustLens Assistant
                  </p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full status-dot animate-pulse-glow" style={{ width: 6, height: 6 }} />
                    <span className="text-[10px]" style={{ color: "var(--text-secondary)" }}>Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Screen sharing section */}
            <div style={{ borderBottom: "1px solid var(--border-subtle)", background: "rgba(255,255,255,0.01)" }} className="flex-shrink-0">
              <button
                onClick={() => setScreensExpanded((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-400" />
                  <span>
                    Shared Screens
                    {sharedScreens.length > 0 && (
                      <span className="ml-1.5 bg-slate-855 border border-slate-750 text-slate-300 rounded-full px-1.5 py-0.5 text-[10px]">
                        {sharedScreens.length}
                      </span>
                    )}
                  </span>
                </div>
                {screensExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {screensExpanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2">
                      {sharedScreens.length === 0 && (
                        <p className="text-[10px] text-slate-500 text-center py-1">
                          No active screen shares
                        </p>
                      )}
                      <div
                        className={`grid gap-2 ${
                          sharedScreens.length > 1 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                      >
                        {sharedScreens.map((s) => (
                          <ScreenPreview
                            key={s.id}
                            screen={s}
                            onRemove={() => removeScreen(s.id)}
                            onCapture={(url) =>
                              setPendingScreenshots((prev) => [...prev, url])
                            }
                          />
                        ))}
                      </div>
                      <button
                        onClick={addScreen}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-slate-800 text-xs text-slate-400 hover:border-blue-500/50 hover:text-blue-300 hover:bg-blue-500/10 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 text-blue-400" />
                        {sharedScreens.length === 0
                          ? "Share Screen"
                          : "Add Screen"}
                      </button>
                      {pendingScreenshots.length > 0 && (
                        <div className="flex items-center justify-between border rounded-lg px-3 py-1.5"
                          style={{ background: "rgba(59,130,246,0.06)", borderColor: "rgba(59,130,246,0.25)" }}>
                          <span className="text-xs text-blue-300 flex items-center gap-1.5">
                            <Camera className="w-3.5 h-3.5" />
                            {pendingScreenshots.length} capture{pendingScreenshots.length > 1 ? "s" : ""} ready
                          </span>
                          <button
                            onClick={() => setPendingScreenshots([])}
                            className="text-blue-400 hover:text-blue-300 text-xs cursor-pointer"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
            >
              {/* Show welcome bubble when no logs analyzed and no messages yet */}
              {!store.isAnalyzed && messages.length === 0 && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 self-start mt-0.5 border bg-blue-650/90 text-white border-blue-500/20">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <WelcomeBubble onQuickReply={handleQuickReply} />
                    <span className="text-[10px] text-slate-500 px-1">{formatTime(new Date())}</span>
                  </div>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 self-start mt-0.5 border ${
                      msg.role === "assistant"
                        ? "bg-blue-650/90 text-white border-blue-500/20"
                        : "bg-slate-900 text-slate-355 border-slate-800"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`flex flex-col gap-1 ${
                      msg.role === "user" ? "items-end max-w-[80%]" : "flex-1 min-w-0"
                    }`}
                  >
                    {/* User screenshots */}
                    {msg.screenshots && msg.screenshots.length > 0 && (
                      <div
                        className={`grid gap-1 ${
                          msg.screenshots.length > 1 ? "grid-cols-2" : "grid-cols-1"
                        }`}
                      >
                        {msg.screenshots.map((src, i) => (
                          <img
                            key={i}
                            src={src}
                            alt="Screenshot"
                            className="rounded-lg border border-slate-850 object-cover"
                            style={{ maxHeight: 80, width: "100%" }}
                          />
                        ))}
                      </div>
                    )}

                    {/* User plain text bubble */}
                    {msg.role === "user" && msg.content && (
                      <div className="bg-blue-600/90 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-xs leading-relaxed">
                        {msg.content}
                      </div>
                    )}

                    {/* AI structured response */}
                    {msg.role === "assistant" && msg.structured && (
                      <StructuredBubble
                        structured={msg.structured}
                        onQuickReply={handleQuickReply}
                      />
                    )}

                    <span className="text-[10px] text-slate-500 px-1">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600/95 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1 self-start">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full block"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-slate-800 p-3 bg-slate-950/20 flex-shrink-0">
              <div className="flex items-end gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-blue-500/50 transition-colors">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    sharedScreens.length > 0
                      ? "Ask about what you see on screen…"
                      : "Ask about this incident…"
                  }
                  rows={1}
                  className="flex-1 resize-none bg-transparent text-xs text-slate-250 placeholder-slate-500 outline-none min-h-[20px] max-h-[100px]"
                  style={{ lineHeight: "20px" }}
                  onInput={(e) => {
                    const t = e.currentTarget;
                    t.style.height = "auto";
                    t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
                  }}
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() && pendingScreenshots.length === 0}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5 text-center">
                Enter to send · Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
