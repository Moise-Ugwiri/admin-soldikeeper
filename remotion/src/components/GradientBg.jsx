import React from 'react';
import { BRAND, rgb } from '../theme.js';

/** Animated gradient background with optional overlay particles */
export const GradientBg = ({ variant = 'green', width, height, particleCount = 6 }) => {
  const gradients = {
    green:  BRAND.bgGreen,
    main:   BRAND.bgMain,
    blue:   BRAND.bgBlue,
    violet: BRAND.bgViolet,
    amber:  BRAND.bgAmber,
  };

  const particles = Array.from({ length: particleCount }, (_, i) => ({
    x: [15, 75, 40, 85, 25, 60][i % 6],
    y: [20, 15, 65, 55, 80, 35][i % 6],
    size: [220, 320, 180, 280, 240, 200][i % 6],
    color: [
      BRAND.greenGlow,
      `rgba(${rgb(BRAND.blue)},0.08)`,
      `rgba(${rgb(BRAND.greenDark)},0.15)`,
      `rgba(${rgb(BRAND.greenLight)},0.07)`,
      `rgba(${rgb(BRAND.blue)},0.06)`,
      `rgba(${rgb(BRAND.violet)},0.06)`,
    ][i % 6],
    blur: [80, 120, 60, 100, 90, 70][i % 6],
  }));

  return (
    <div style={{
      position: 'absolute', inset: 0,
      width: width || '100%', height: height || '100%',
      background: gradients[variant] || gradients.main,
      overflow: 'hidden',
    }}>
      {/* Subtle grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
      }} />

      {/* Glow orbs */}
      {particles.map((p, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          background: `radial-gradient(circle, ${p.color} 0%, transparent 70%)`,
          filter: `blur(${p.blur}px)`,
          transform: 'translate(-50%,-50%)',
          pointerEvents: 'none',
        }} />
      ))}
    </div>
  );
};
