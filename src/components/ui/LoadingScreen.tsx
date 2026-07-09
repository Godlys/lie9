import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
  minimumLoadTime?: number;
}

export default function LoadingScreen({ onLoadingComplete, minimumLoadTime = 2000 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = minimumLoadTime;
    const interval = 16;
    const step = interval / duration;

    const frame = setInterval(() => {
      setProgress((prev) => {
        const next = Math.min(prev + step, 1);
        if (next >= 1) {
          clearInterval(frame);
        }
        return next;
      });
    }, interval);

    return () => clearInterval(frame);
  }, [minimumLoadTime]);

  const handleExitComplete = useCallback(() => {
    onLoadingComplete();
  }, [onLoadingComplete]);

  // Trigger exit when progress hits 100%
  useEffect(() => {
    if (progress >= 1) {
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="loading-screen"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ backgroundColor: '#000511' }}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* LIE9 Title */}
          <motion.h1
            className="text-7xl font-bold tracking-[0.3em] mb-12 select-none"
            style={{ color: '#e8e8e8' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            LIE9
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-sm tracking-[0.5em] mb-16 uppercase select-none"
            style={{ color: 'rgba(232,232,232,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            Falcon 9 Explosive View
          </motion.p>

          {/* Progress bar */}
          <div
            className="relative w-64 h-px overflow-hidden"
            style={{ backgroundColor: 'rgba(232,232,232,0.15)' }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{
                width: `${progress * 100}%`,
                background: 'linear-gradient(90deg, #ff6600, #ff8800)',
              }}
            />
          </div>

          {/* Percentage */}
          <motion.p
            className="mt-4 text-xs tracking-widest select-none"
            style={{ color: 'rgba(232,232,232,0.4)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {Math.round(progress * 100)}%
          </motion.p>

          {/* Loading dots */}
          <motion.div
            className="mt-8 flex gap-1.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full"
                style={{ backgroundColor: 'rgba(232,232,232,0.4)' }}
                animate={{
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
