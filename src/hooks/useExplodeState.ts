import { useState, useCallback } from "react";

export function useExplodeState() {
  const [explodeProgress, setExplodeProgress] = useState(0);
  const [isExploding, setIsExploding] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const explode = useCallback(() => {
    setIsExploding(true);
    setExplodeProgress(1);
  }, []);

  const assemble = useCallback(() => {
    setIsExploding(false);
    setExplodeProgress(0);
    setSelectedPart(null);
  }, []);

  const toggle = useCallback(() => {
    if (isExploding) {
      assemble();
    } else {
      explode();
    }
  }, [isExploding, explode, assemble]);

  return {
    explodeProgress,
    isExploding,
    selectedPart,
    setSelectedPart,
    explode,
    assemble,
    toggle,
  };
}
