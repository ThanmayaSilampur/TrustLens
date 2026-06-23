import { motion } from "motion/react";
import { FileText, UploadCloud } from "lucide-react";
import { NavLink } from "react-router";

interface NoDataStateProps {
  title: string;
  subtitle: string;
}

export function NoDataState({ title, subtitle }: NoDataStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-8 text-center"
    >
      {/* Animated icon */}
      <div className="relative mb-6">
        <motion.div
          animate={{
            boxShadow: [
              "0 0 24px rgba(59,130,246,0.15)",
              "0 0 48px rgba(59,130,246,0.3)",
              "0 0 24px rgba(59,130,246,0.15)",
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: "rgba(59,130,246,0.08)",
            border: "1px solid rgba(59,130,246,0.2)",
          }}
        >
          <FileText size={34} style={{ color: "#3b82f6", opacity: 0.7 }} />
        </motion.div>
        {/* Orbiting dot */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          style={{ position: "absolute", inset: -10, borderRadius: "50%" }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#3b82f6",
              boxShadow: "0 0 8px #3b82f6",
              marginLeft: -3,
            }}
          />
        </motion.div>
      </div>

      <h2
        className="text-lg font-bold mb-2"
        style={{ color: "var(--text-primary)" }}
      >
        {title}
      </h2>
      <p
        className="text-sm mb-6 max-w-md leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        No data available. Please upload a dataset or select a demo dataset.
      </p>
      <p
        className="text-xs mb-6"
        style={{ color: "var(--text-muted)" }}
      >
        {subtitle}
      </p>

      <NavLink
        to="/"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
        style={{
          background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
          boxShadow: "0 0 20px rgba(59,130,246,0.3)",
        }}
      >
        <UploadCloud size={15} />
        Go to Log Analysis
      </NavLink>
    </motion.div>
  );
}
