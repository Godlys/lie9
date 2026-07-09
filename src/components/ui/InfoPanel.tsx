import { AnimatePresence, motion } from "framer-motion";
import {
  ROCKET_COMPONENTS,
  ENGINE_PARTS,
  MERLIN_SPECS,
  type RocketComponent,
  type EnginePart,
} from "@/data/rocketData";

interface InfoPanelProps {
  selectedPart: string | null;
  onClose: () => void;
}

export function InfoPanel({ selectedPart, onClose }: InfoPanelProps) {
  const component = ROCKET_COMPONENTS.find((c) => c.id === selectedPart);
  const enginePart = ENGINE_PARTS.find((p) => p.id === selectedPart);
  const item: (RocketComponent | EnginePart) | undefined =
    component || enginePart;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed top-1/2 right-8 -translate-y-1/2 w-80 max-h-[70vh] overflow-y-auto z-20"
        >
          <div className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {item.name}
                </h2>
                <p className="text-sm text-white/50 tracking-wide">
                  {item.nameEn}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-white/40 hover:text-white text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-white/70 leading-relaxed mb-5">
              {item.description}
            </p>

            <div className="space-y-2">
              <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">
                Specifications
              </h3>
              {item.specs.map((spec, i) => (
                <div
                  key={i}
                  className="flex justify-between text-sm py-1.5 border-b border-white/10"
                >
                  <span className="text-white/50">{spec.label}</span>
                  <span className="text-white font-medium">{spec.value}</span>
                </div>
              ))}
            </div>

            {/* Show Merlin specs for engine parts */}
            {enginePart && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-2">
                  Merlin 1D Engine
                </h3>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-white/50">海平面推力</span>
                  <span className="text-white font-medium">
                    {MERLIN_SPECS.thrustSea}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-white/50">比冲</span>
                  <span className="text-white font-medium">
                    {MERLIN_SPECS.isp}
                  </span>
                </div>
                <div className="flex justify-between text-sm py-1">
                  <span className="text-white/50">推重比</span>
                  <span className="text-white font-medium">
                    {MERLIN_SPECS.thrustWeight}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
