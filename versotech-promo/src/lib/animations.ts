import { spring, interpolate, Easing } from "remotion";

/**
 * VERSOTECH Promo v6 - Fast & Punchy Animation Utilities
 *
 * Design principles:
 * - Entrances: Fast springs with overshoot (stiffness: 200+, damping: 15)
 * - Exits: Quick fade or slide (6-9 frames max)
 * - Text: Kinetic - slides, scales, or reveals
 * - Screenshots: Never static - always slight motion
 * - Transitions: Hard cuts or fast wipes, no slow fades
 */

// Fast spring config for punchy entrances with overshoot
export const FAST_SPRING = {
  damping: 15,
  stiffness: 200,
  mass: 0.8,
};

// Very fast spring for slam effects
export const SLAM_SPRING = {
  damping: 12,
  stiffness: 300,
  mass: 0.6,
};

// Snappy spring for text reveals
export const SNAPPY_SPRING = {
  damping: 18,
  stiffness: 250,
  mass: 0.7,
};

// Gentle spring for floating elements
export const GENTLE_SPRING = {
  damping: 25,
  stiffness: 80,
  mass: 1,
};

/**
 * Fast spring animation with overshoot
 */
export const fastSpring = (params: {
  frame: number;
  fps: number;
  delay?: number;
}) => {
  return spring({
    frame: params.frame - (params.delay ?? 0),
    fps: params.fps,
    config: FAST_SPRING,
  });
};

/**
 * Slam spring animation - aggressive entrance
 */
export const slamSpring = (params: {
  frame: number;
  fps: number;
  delay?: number;
}) => {
  return spring({
    frame: params.frame - (params.delay ?? 0),
    fps: params.fps,
    config: SLAM_SPRING,
  });
};

/**
 * Snappy spring for text
 */
export const snappySpring = (params: {
  frame: number;
  fps: number;
  delay?: number;
}) => {
  return spring({
    frame: params.frame - (params.delay ?? 0),
    fps: params.fps,
    config: SNAPPY_SPRING,
  });
};

/**
 * Quick fade out (6-9 frames)
 */
export const quickFadeOut = (params: {
  frame: number;
  startFrame: number;
  duration?: number; // frames, default 6
}) => {
  const duration = params.duration ?? 6;
  return interpolate(
    params.frame,
    [params.startFrame, params.startFrame + duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

/**
 * Quick slide entrance
 */
export const quickSlideIn = (params: {
  frame: number;
  delay?: number;
  from?: "left" | "right" | "top" | "bottom";
  distance?: number;
}) => {
  const delay = params.delay ?? 0;
  const distance = params.distance ?? 30;
  const adjustedFrame = params.frame - delay;

  const progress = interpolate(
    adjustedFrame,
    [0, 9],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );

  const directions = {
    left: { x: -distance * (1 - progress), y: 0 },
    right: { x: distance * (1 - progress), y: 0 },
    top: { x: 0, y: -distance * (1 - progress) },
    bottom: { x: 0, y: distance * (1 - progress) },
  };

  return {
    ...directions[params.from ?? "bottom"],
    opacity: progress,
  };
};

/**
 * Scale punch - scales up then settles
 */
export const scalePunch = (params: {
  frame: number;
  fps: number;
  delay?: number;
  overshoot?: number; // How much to overshoot (default 0.15)
}) => {
  const overshoot = params.overshoot ?? 0.15;
  const progress = slamSpring(params);

  // Overshoot then settle
  return interpolate(progress, [0, 1], [0.7, 1 + overshoot * (1 - progress)]);
};

/**
 * Strikethrough animation progress
 */
export const strikethroughProgress = (params: {
  frame: number;
  delay?: number;
  duration?: number;
}) => {
  const delay = params.delay ?? 0;
  const duration = params.duration ?? 6;

  return interpolate(
    params.frame - delay,
    [0, duration],
    [0, 100],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.quad),
    }
  );
};

/**
 * Continuous subtle pan for screenshots
 */
export const subtlePan = (params: {
  frame: number;
  direction?: "left" | "right" | "up" | "down";
  speed?: number; // pixels per second
  fps: number;
}) => {
  const speed = params.speed ?? 5;
  const pixelsPerFrame = speed / params.fps;

  const directions = {
    left: { x: -params.frame * pixelsPerFrame, y: 0 },
    right: { x: params.frame * pixelsPerFrame, y: 0 },
    up: { x: 0, y: -params.frame * pixelsPerFrame },
    down: { x: 0, y: params.frame * pixelsPerFrame },
  };

  return directions[params.direction ?? "left"];
};

/**
 * Continuous subtle zoom for screenshots
 */
export const subtleZoom = (params: {
  frame: number;
  startScale?: number;
  endScale?: number;
  duration: number;
}) => {
  const startScale = params.startScale ?? 1;
  const endScale = params.endScale ?? 1.05;

  return interpolate(
    params.frame,
    [0, params.duration],
    [startScale, endScale],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
};

/**
 * Flying number entrance (for metric blitz)
 */
export const flyingNumber = (params: {
  frame: number;
  fps: number;
  delay?: number;
  from?: "left" | "right";
}) => {
  const delay = params.delay ?? 0;
  const adjustedFrame = params.frame - delay;
  const from = params.from ?? "right";

  const progress = spring({
    frame: adjustedFrame,
    fps: params.fps,
    config: SNAPPY_SPRING,
  });

  const startX = from === "left" ? -200 : 200;

  return {
    x: interpolate(progress, [0, 1], [startX, 0]),
    scale: interpolate(progress, [0, 1], [0.5, 1]),
    opacity: interpolate(adjustedFrame, [0, 6], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  };
};

/**
 * Gold burst effect (radial scale)
 */
export const goldBurst = (params: {
  frame: number;
  fps: number;
  delay?: number;
}) => {
  const delay = params.delay ?? 0;
  const adjustedFrame = params.frame - delay;

  const scale = interpolate(
    adjustedFrame,
    [0, 12, 20],
    [0, 1.5, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const opacity = interpolate(
    adjustedFrame,
    [0, 6, 20],
    [0, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return { scale, opacity };
};

/**
 * Stacked card positions for StackScene
 */
export const stackedCardPosition = (params: {
  index: number;
  total: number;
  frame: number;
  fps: number;
  delay?: number;
}) => {
  const { index, total, frame, fps, delay = 0 } = params;
  const adjustedFrame = frame - delay;

  // Stagger entrance
  const entranceDelay = index * 6;
  const progress = spring({
    frame: adjustedFrame - entranceDelay,
    fps,
    config: FAST_SPRING,
  });

  // Fan out position
  const baseRotation = -15 + (index * 30 / (total - 1));
  const baseX = -200 + (index * 400 / (total - 1));
  const baseY = Math.abs(index - (total - 1) / 2) * 20;

  return {
    x: interpolate(progress, [0, 1], [0, baseX]),
    y: interpolate(progress, [0, 1], [100, baseY]),
    rotation: interpolate(progress, [0, 1], [0, baseRotation]),
    scale: interpolate(progress, [0, 1], [0.8, 0.65]),
    opacity: progress,
    zIndex: total - index,
  };
};
