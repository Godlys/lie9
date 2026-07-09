import type { SceneMode } from "../../hooks/useSceneState";

const STEPS: { mode: SceneMode; label: string; sub: string }[] = [
  { mode: "overview", label: "FALCON 9", sub: "运载火箭" },
  { mode: "octaweb", label: "OCTAWEB", sub: "发动机阵列" },
  { mode: "engine", label: "MERLIN 1D", sub: "发动机拆解" },
];

export function Breadcrumb({
  mode,
  onNavigate,
}: {
  mode: SceneMode;
  onNavigate: (mode: SceneMode) => void;
}) {
  const currentIndex = STEPS.findIndex((s) => s.mode === mode);

  return (
    <div className="glass fixed left-6 top-6 z-20 flex items-center gap-1 p-2" style={{ borderRadius: "12px" }}>
      {STEPS.map((step, i) => (
        <div key={step.mode} className="flex items-center">
          {i > 0 && (
            <span className="px-1 text-xs text-zinc-700">/</span>
          )}
          <button
            onClick={() => onNavigate(step.mode)}
            className={`group rounded-lg px-3 py-1.5 text-left transition-all ${
              i === currentIndex
                ? "bg-[#ff3b3015]"
                : "hover:bg-white/5"
            }`}
          >
            <div
              className={`font-mono text-xs font-semibold tracking-wide ${
                i === currentIndex ? "text-[#ff3b30]" : "text-zinc-400"
              }`}
            >
              {step.label}
            </div>
            <div className="text-[10px] text-zinc-600">{step.sub}</div>
          </button>
        </div>
      ))}
    </div>
  );
}
