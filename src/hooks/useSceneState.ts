import { useState, useCallback } from "react";

export type SceneMode = "overview" | "octaweb" | "engine";

export function useSceneState() {
  const [mode, setMode] = useState<SceneMode>("overview");
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const goToOverview = useCallback(() => {
    setMode("overview");
    setExplodeProgress(0);
    setSelectedPart(null);
    setSimulating(false);
  }, []);

  const goToOctaweb = useCallback(() => {
    setMode("octaweb");
    setExplodeProgress(0);
    setSelectedPart(null);
    setSimulating(false);
  }, []);

  const goToEngine = useCallback(() => {
    setMode("engine");
    setExplodeProgress(1);
    setSelectedPart(null);
    setSimulating(false);
  }, []);

  const toggleExplode = useCallback(() => {
    setExplodeProgress((p) => (p > 0.5 ? 0 : 1));
    setSimulating(false);
  }, []);

  const toggleSimulate = useCallback(() => {
    setSimulating((s) => !s);
    if (!simulating) {
      // 启动模拟时自动组装
      setExplodeProgress(0);
      setSelectedPart(null);
    }
  }, [simulating]);

  return {
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
  };
}
