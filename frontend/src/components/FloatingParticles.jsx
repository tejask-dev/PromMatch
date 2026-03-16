import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['💕', '✨', '👑', '🌟', '💫', '🎀', '🌸', '💗', '⭐', '🎊'];

const FloatingParticles = ({ count = 18 }) => {
  const particles = useMemo(() => (
    Array.from({ length: count }, (_, i) => ({
      id: i,
      emoji: EMOJIS[i % EMOJIS.length],
      x: Math.random() * 100,
      size: 14 + Math.random() * 14,
      duration: 5 + Math.random() * 6,
      delay: Math.random() * 4,
    }))
  ), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute select-none"
          style={{
            left: `${p.x}%`,
            bottom: '-40px',
            fontSize: `${p.size}px`,
            opacity: 0,
          }}
          animate={{
            y: [0, -(window.innerHeight + 80)],
            opacity: [0, 0.7, 0.7, 0],
            rotate: [0, p.id % 2 === 0 ? 20 : -20, 0],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingParticles;
