import { motion } from "framer-motion";

interface ControlsProps {
  isExploding: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export function Controls({ isExploding, onToggle, onReset }: ControlsProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-20">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggle}
        className={`px-8 py-3 rounded-full font-bold text-sm tracking-wider uppercase backdrop-blur-md border transition-colors ${
          isExploding
            ? "bg-white/10 text-white border-white/30 hover:bg-white/20"
            : "bg-red-500/20 text-red-300 border-red-500/50 hover:bg-red-500/30"
        }`}
      >
        {isExploding ? " assemble" : "▸ Explode"}
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onReset}
        className="px-6 py-3 rounded-full text-sm tracking-wider uppercase backdrop-blur-md border border-white/20 text-white/70 hover:bg-white/10"
      >
        Reset
      </motion.button>
    </div>
  );
}
