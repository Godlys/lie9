export function HUD({ mode, info }: { mode: string; info?: string }) {
  return (
    <>
      {/* Top-right status */}
      <div
        className="glass fixed right-6 top-6 z-20 flex items-center gap-3 px-4 py-2"
        style={{ borderRadius: "12px" }}
      >
        <div className="h-2 w-2 rounded-full bg-[#ff3b30]" style={{ animation: "pulse 2s infinite" }} />
        <span className="font-mono text-xs text-zinc-400">
          {mode === "overview" ? "FALCON 9 / BLOCK 5" : mode === "octaweb" ? "OCTAWEB / 9× MERLIN" : "MERLIN 1D / EXPLODED VIEW"}
        </span>
      </div>

      {/* Bottom-left hint */}
      {info && (
        <div
          className="glass fixed bottom-6 left-6 z-20 px-4 py-3"
          style={{ borderRadius: "12px" }}
        >
          <span className="font-mono text-xs text-zinc-500">{info}</span>
        </div>
      )}

      {/* Brand bottom-right */}
      <div className="fixed bottom-6 right-6 z-20 text-right">
        <div className="font-mono text-xs font-bold tracking-[0.3em] text-zinc-700">
          LIE9
        </div>
        <div className="text-[10px] text-zinc-800">
          Interactive Explosive Diagram
        </div>
      </div>
    </>
  );
}
