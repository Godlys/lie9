import { RocketScene } from "@/components/scene/RocketScene";
import { Controls } from "@/components/ui/Controls";
import { InfoPanel } from "@/components/ui/InfoPanel";
import { useExplodeState } from "@/hooks/useExplodeState";
import { ROCKET_SPECS } from "@/data/rocketData";

export default function App() {
  const {
    explodeProgress,
    isExploding,
    selectedPart,
    setSelectedPart,
    assemble,
    toggle,
  } = useExplodeState();

  const handleReset = () => {
    assemble();
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden bg-[#000511]">
      {/* 3D Scene */}
      <RocketScene
        explodeProgress={explodeProgress}
        selectedPart={selectedPart}
        onSelectPart={setSelectedPart}
      />

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-10 p-6 flex justify-between items-start pointer-events-none">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            LIE9
          </h1>
          <p className="text-sm text-white/50 tracking-widest uppercase mt-1">
            Falcon 9 Explosive View
          </p>
        </div>
        <div className="text-right text-white/40 text-xs space-y-1">
          <p>Height: {ROCKET_SPECS.totalHeight}m</p>
          <p>Diameter: {ROCKET_SPECS.diameter}m</p>
          <p>Thrust: {ROCKET_SPECS.thrust}</p>
        </div>
      </div>

      {/* Controls */}
      <Controls
        isExploding={isExploding}
        onToggle={toggle}
        onReset={handleReset}
      />

      {/* Info Panel */}
      <InfoPanel selectedPart={selectedPart} onClose={() => setSelectedPart(null)} />

      {/* Hint when idle */}
      {!isExploding && !selectedPart && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 text-white/30 text-sm tracking-wide pointer-events-none">
          Click EXPLODE to disassemble • Drag to rotate • Click parts for details
        </div>
      )}
    </div>
  );
}
