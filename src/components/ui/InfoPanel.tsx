import { MERLIN_ENGINE_PARTS, MERLIN_SPECS } from "../../data/rocketData";

export function InfoPanel({
  selectedPart,
  mode,
}: {
  selectedPart: string | null;
  mode: string;
}) {
  const part = MERLIN_ENGINE_PARTS.find((p) => p.id === selectedPart);

  if (mode === "engine" && part) {
    return (
      <div
        className="glass glass-accent fixed left-6 top-1/2 z-20 w-80 -translate-y-1/2 p-6"
        style={{ borderRadius: "16px" }}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-[#ff3b30]">
          {part.nameEn}
        </div>
        <h2 className="mb-3 font-mono text-2xl font-semibold text-white">
          {part.name}
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-zinc-400">
          {part.description}
        </p>
        <div className="space-y-2">
          {part.specs.map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between border-b border-white/5 pb-2"
            >
              <span className="text-xs text-zinc-500">{spec.label}</span>
              <span className="font-mono text-sm text-zinc-200">{spec.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Default: engine specs
  if (mode === "engine") {
    return (
      <div
        className="glass fixed right-6 top-1/2 z-20 w-72 -translate-y-1/2 p-6"
        style={{ borderRadius: "16px" }}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
          Engine Specifications
        </div>
        <h2 className="mb-4 font-mono text-xl font-semibold text-white">
          {MERLIN_SPECS.name}
        </h2>
        <div className="space-y-2">
          {[
            { label: "海平面推力", value: MERLIN_SPECS.thrustSea },
            { label: "真空推力", value: MERLIN_SPECS.thrustVacuum },
            { label: "比冲", value: MERLIN_SPECS.isp },
            { label: "质量", value: MERLIN_SPECS.weight },
            { label: "推重比", value: MERLIN_SPECS.thrustWeight },
            { label: "室压", value: MERLIN_SPECS.chamberPressure },
          ].map((spec) => (
            <div
              key={spec.label}
              className="flex items-center justify-between border-b border-white/5 pb-2"
            >
              <span className="text-xs text-zinc-500">{spec.label}</span>
              <span className="font-mono text-sm text-zinc-200">{spec.value}</span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-zinc-600">
          点击任意零件查看详情
        </p>
      </div>
    );
  }

  return null;
}
