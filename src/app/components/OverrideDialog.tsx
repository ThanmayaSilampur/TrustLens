import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const OVERRIDE_OPTIONS = [
  "I have additional context the AI didn't have",
  "The data or logs appear incomplete",
  "This looks like a false positive",
  "This conflicts with our internal policy",
  "Other",
] as const;

type OverrideOption = (typeof OVERRIDE_OPTIONS)[number];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionTitle: string;
  onConfirm: (option: string, note: string) => void;
}

export function OverrideDialog({
  open,
  onOpenChange,
  actionTitle,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<OverrideOption | "">("");
  const [note, setNote] = useState("");
  const [otherText, setOtherText] = useState("");

  const isOther = selected === "Other";
  const canConfirm =
    selected !== "" &&
    note.trim().length > 0 &&
    (!isOther || otherText.trim().length > 0);

  const reset = () => {
    setSelected("");
    setNote("");
    setOtherText("");
  };

  const handleCancel = () => {
    reset();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const option = isOther ? `Other: ${otherText.trim()}` : (selected as string);
    onConfirm(option, note.trim());
    toast("Override recorded in Audit Trail.", {
      description: `Reason: ${option}`,
      duration: 4000,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/75 z-50 backdrop-blur-md" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl glass-strong shadow-2xl border border-slate-800 focus:outline-none"
          style={{ maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <XCircle className="w-5 h-5 text-orange-450" />
              </div>
              <div className="flex-1">
                <Dialog.Title className="text-base font-bold" style={{ color: "var(--text-primary)" }}>
                  Why are you overriding this recommendation?
                </Dialog.Title>
                <Dialog.Description className="text-xs mt-1.5 leading-snug" style={{ color: "var(--text-secondary)" }}>
                  Overriding:{" "}
                  <span className="font-semibold text-slate-350">
                    {actionTitle}
                  </span>
                </Dialog.Description>
              </div>
              <button
                onClick={handleCancel}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-all flex-shrink-0 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Radio options */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-secondary)" }}>
                Select a reason <span className="text-red-400 font-normal">*</span>
              </p>
              <div className="space-y-2">
                {OVERRIDE_OPTIONS.map((option) => {
                  const isActive = selected === option;
                  return (
                    <label
                      key={option}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        isActive
                          ? ""
                          : "hover:border-slate-700 hover:bg-slate-800/30"
                      }`}
                      style={
                        isActive
                          ? { background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.35)", boxShadow: "0 0 10px rgba(249,115,22,0.1)" }
                          : { background: "rgba(255,255,255,0.01)", borderColor: "var(--border-subtle)" }
                      }
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        <div
                          className="w-4 h-4 rounded-full border flex items-center justify-center transition-colors"
                          style={{
                            borderColor: isActive ? "rgb(249,115,22)" : "var(--text-muted)",
                            backgroundColor: isActive ? "rgb(249,115,22)" : "transparent"
                          }}
                        >
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <span
                          className="text-xs"
                          style={{
                            color: isActive ? "#fdba74" : "var(--text-secondary)",
                            fontWeight: isActive ? "600" : "400"
                          }}
                        >
                          {option}
                        </span>
                        {option === "Other" && isActive && (
                          <input
                            type="text"
                            value={otherText}
                            onChange={(e) => setOtherText(e.target.value)}
                            placeholder="Briefly describe your reason…"
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="mt-2.5 w-full text-xs bg-slate-950/60 border border-orange-500/30 rounded-lg px-3 py-2 outline-none text-slate-200 placeholder-slate-500 focus:border-orange-500/60 transition-all"
                          />
                        )}
                      </div>
                      <input
                        type="radio"
                        name="override-reason"
                        value={option}
                        checked={isActive}
                        onChange={() => setSelected(option)}
                        className="sr-only"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Note field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-secondary)" }}>
                Add a brief note <span className="text-red-400 font-normal">*</span>
                <span className="ml-1 text-[10px] text-slate-500 font-normal normal-case">
                  visible in Audit Trail
                </span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Confirmed with network team — IP resolves to our VPN egress node."
                rows={3}
                className="w-full text-xs bg-slate-950/40 border border-slate-800 rounded-xl px-3 py-2.5 outline-none text-slate-250 placeholder-slate-500 focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/10 resize-none transition-all"
              />
            </div>

            {/* Audit trail notice */}
            <div className="flex items-start gap-2 border rounded-xl px-3 py-2.5 text-xs"
              style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.2)" }}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-400" />
              <span style={{ color: "var(--text-secondary)", fontSize: "11px", lineHeight: "1.4" }}>
                This override will be permanently recorded — the selected reason, your note, and a timestamp will appear in the Audit Trail.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex justify-end gap-2 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
            <button
              onClick={handleCancel}
              className="border border-slate-800 bg-slate-900/30 text-xs font-semibold px-4 py-2 rounded-xl text-slate-350 hover:bg-slate-800/50 hover:text-[var(--text-primary)] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="bg-orange-600 hover:bg-orange-700 text-slate-950 font-bold text-xs px-4 py-2 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              Confirm Override
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
