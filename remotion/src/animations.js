/**
 * Shared animation helpers — import these in every composition.
 */
import { interpolate, spring } from 'remotion';
import { EASE } from './theme.js';

/** Smooth fade + rise from bottom */
export const fadeUp = (frame, delay = 0, duration = 18) => ({
  opacity:   interpolate(frame - delay, [0, duration], [0, 1], EASE.clamp),
  transform: `translateY(${interpolate(frame - delay, [0, duration], [28, 0], EASE.clamp)}px)`,
});

/** Fade + scale from 90% */
export const scaleIn = (frame, delay = 0, duration = 18) => ({
  opacity:   interpolate(frame - delay, [0, duration], [0, 1], EASE.clamp),
  transform: `scale(${interpolate(frame - delay, [0, duration], [0.88, 1], EASE.clamp)})`,
});

/** Slide in from left */
export const slideLeft = (frame, delay = 0, distance = 60, duration = 22) => ({
  opacity:   interpolate(frame - delay, [0, duration], [0, 1], EASE.clamp),
  transform: `translateX(${interpolate(frame - delay, [0, duration], [-distance, 0], EASE.clamp)}px)`,
});

/** Slide in from right */
export const slideRight = (frame, delay = 0, distance = 60, duration = 22) => ({
  opacity:   interpolate(frame - delay, [0, duration], [0, 1], EASE.clamp),
  transform: `translateX(${interpolate(frame - delay, [0, duration], [distance, 0], EASE.clamp)}px)`,
});

/** Animated counter value (0 → target) */
export const counter = (frame, start, end, fromFrame, toFrame) =>
  Math.round(interpolate(frame, [fromFrame, toFrame], [start, end], EASE.clamp));

/** Spring-based entrance */
export const springIn = (frame, delay = 0, fps = 30) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 180, mass: 0.8 } });

/** Progress bar width % */
export const barWidth = (frame, fromFrame, toFrame, target) =>
  `${interpolate(frame, [fromFrame, toFrame], [0, target], EASE.clamp)}%`;
