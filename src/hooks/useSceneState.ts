import { useState, useCallback } from "react";

export type SceneMode = "overview" | "octaweb" | "engine";

export function useSceneState() {
  const [mode, setMode] = useState<SceneMode>("overview");
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const goToOverview = useCallback(() => {
    setMode("overview");
    setExplodeProgress(0);
    setSelectedPart(null);
  }, []);

  const goToOctaweb = useCallback(() => {
    setMode("octaweb");
    setExplodeProgress(0);
    setSelectedPart(null);
  }, []);

  const goToEngine = useCallback(() => {
    setMode("engine");
    setExplodeProgress(1);
    setSelectedPart(null);
  }, []);

  const toggleExplode = useCallback(() => {
    setExplodeProgress((p) => (p > 0.5 ? 0 : 1));
  }, []);

  return {
    mode,
    explodeProgress,
    selectedPart,
    loading,
    setLoading,
    setSelectedPart,
    goToOverview,
    goToOctaweb,
    goToEngine,
    toggleExplode,
  };
}
