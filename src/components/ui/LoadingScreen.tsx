import { useEffect, useState } from "react";

export function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(onDone, 400);
          return 100;
        }
        return p + 3;
      });
    }, 30);
    return () => clearInterval(interval);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "#0a0a0f" }}
    >
      <div className="mb-8 font-mono text-xs tracking-[0.4em] text-zinc-700">
        LIE9
      </div>
      <div className="mb-2 font-mono text-sm text-zinc-500">
        INITIALIZING MERLIN 1D
      </div>
      <div className="h-px w-48 overflow-hidden bg-zinc-800">
        <div
          className="h-full bg-[#ff3b30] transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-2 font-mono text-xs text-zinc-700">
        {Math.round(progress)}%
      </div>
    </div>
  );
}
