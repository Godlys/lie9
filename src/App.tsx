import { useEffect, useRef } from "react";
import gsap from "gsap";
import { SceneContainer } from "./components/scene/SceneContainer";
import { InfoPanel } from "./components/ui/InfoPanel";
import { Breadcrumb } from "./components/ui/Breadcrumb";
import { HUD } from "./components/ui/HUD";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { useSceneState } from "./hooks/useSceneState";
import type { SceneMode } from "./hooks/useSceneState";

const MODE_HINTS: Record<SceneMode, string> = {
  overview: "点击火箭底部发动机区域 → 进入 Octaweb 阵列",
  octaweb: "点击任意发动机 → 查看 Merlin 1D 爆炸拆解图",
  engine: "点击零件查看详情 · 拖拽旋转 · 滚轮缩放",
};

export default function App() {
  const {
    mode,
    explodeProgress,
    selectedPart,
    loading,
    simulating,
    setLoading,
    setSelectedPart,
    goToOverview,
    goToOctaweb,
    goToEngine,
    toggleExplode,
    toggleSimulate,
  } = useSceneState();

  const containerRef = useRef<HTMLDivElement>(null);
  const prevMode = useRef<SceneMode | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (prevMode.current === null) {
      prevMode.current = mode;
      return;
    }
    prevMode.current = mode;

    const el = containerRef.current;
    gsap.fromTo(
      el,
      { opacity: 1 },
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          gsap.fromTo(
            el,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        },
      },
    );
  }, [mode]);

  const handleNavigate = (target: SceneMode) => {
    if (target === "overview") goToOverview();
    else if (target === "octaweb") goToOctaweb();
    else goToEngine();
  };

  return (
    <div
      ref={containerRef}
      className="relative h-screen w-screen overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at center, #0f0f18 0%, #0a0a0f 60%, #050508 100%)",
      }}
    >
      {loading && <LoadingScreen onDone={() => setLoading(false)} />}

      {/* 3D Scene */}
      <SceneContainer
        mode={mode}
        explodeProgress={explodeProgress}
        selectedPart={selectedPart}
        simulating={simulating}
        onSelectPart={(id) => setSelectedPart(id || null)}
        onOverviewClick={goToOctaweb}
        onOctawebClick={goToEngine}
      />

      {/* UI Layer */}
      <Breadcrumb mode={mode} onNavigate={handleNavigate} />
      <HUD mode={mode} info={simulating ? "🔥 运行模拟中 — 发动机点火" : MODE_HINTS[mode]} />
      <InfoPanel selectedPart={selectedPart} mode={mode} />

      {/* Engine mode buttons */}
      {mode === "engine" && (
        <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-3">
          <button
            onClick={toggleExplode}
            disabled={simulating}
            className="glass glass-accent px-5 py-3 font-mono text-sm text-white transition-all hover:scale-105 disabled:opacity-30 disabled:hover:scale-100"
            style={{ borderRadius: "12px" }}
          >
            {explodeProgress > 0.5 ? "▣ 组装" : "↕ 爆炸拆解"}
          </button>
          <button
            onClick={toggleSimulate}
            className={`px-5 py-3 font-mono text-sm transition-all hover:scale-105 ${
              simulating
                ? "bg-[#ff3b30] text-white"
                : "glass text-[#ff3b30]"
            }`}
            style={{ borderRadius: "12px" }}
          >
            {simulating ? "■ 停止模拟" : "▶ 运行模拟"}
          </button>
        </div>
      )}

      {/* Back button (when not overview) */}
      {mode !== "overview" && (
        <button
          onClick={() => {
            if (mode === "engine") goToOctaweb();
            else goToOverview();
          }}
          className="glass fixed left-6 bottom-6 z-20 px-4 py-2 font-mono text-xs text-zinc-400 transition-all hover:text-white"
          style={{ borderRadius: "12px" }}
        >
          ← 返回
        </button>
      )}
    </div>
  );
}
