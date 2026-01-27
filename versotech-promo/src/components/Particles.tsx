import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "./Background";

interface ParticleProps {
  count?: number;
  color?: string;
  speed?: number;
  size?: { min: number; max: number };
  opacity?: { min: number; max: number };
}

/**
 * Animated floating particles for visual depth
 * Creates a field of gently moving dots with varying sizes
 */
export const Particles: React.FC<ParticleProps> = ({
  count = 50,
  color = COLORS.gold,
  speed = 0.5,
  size = { min: 2, max: 6 },
  opacity = { min: 0.1, max: 0.4 },
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Generate deterministic particle positions
  const particles = Array.from({ length: count }, (_, i) => {
    const seed = i * 1337;
    const x = ((seed * 7919) % 1000) / 1000;
    const y = ((seed * 104729) % 1000) / 1000;
    const particleSize = size.min + ((seed * 7) % (size.max - size.min));
    const particleOpacity = opacity.min + ((seed * 13) % 100) / 100 * (opacity.max - opacity.min);
    const speedMultiplier = 0.5 + ((seed * 17) % 100) / 100;
    const direction = ((seed * 23) % 360) * (Math.PI / 180);

    return {
      id: i,
      baseX: x * width,
      baseY: y * height,
      size: particleSize,
      opacity: particleOpacity,
      speedMultiplier,
      direction,
    };
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((particle) => {
        const movement = frame * speed * particle.speedMultiplier;
        const x = particle.baseX + Math.cos(particle.direction) * movement;
        const y = particle.baseY + Math.sin(particle.direction) * movement;

        // Wrap around screen
        const wrappedX = ((x % width) + width) % width;
        const wrappedY = ((y % height) + height) % height;

        // Pulse opacity
        const pulseOpacity = particle.opacity * (0.8 + Math.sin(frame * 0.05 + particle.id) * 0.2);

        return (
          <div
            key={particle.id}
            style={{
              position: "absolute",
              left: wrappedX,
              top: wrappedY,
              width: particle.size,
              height: particle.size,
              borderRadius: "50%",
              background: color,
              opacity: pulseOpacity,
              boxShadow: `0 0 ${particle.size * 2}px ${color}`,
              transform: "translate(-50%, -50%)",
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Rising particles effect - particles float upward
 */
export const RisingParticles: React.FC<ParticleProps & { delay?: number }> = ({
  count = 30,
  color = COLORS.gold,
  delay = 0,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const adjustedFrame = Math.max(0, frame - delay);

  const particles = Array.from({ length: count }, (_, i) => {
    const seed = i * 2357;
    return {
      id: i,
      x: ((seed * 7919) % 1000) / 1000 * width,
      startY: height + ((seed * 13) % 200),
      speed: 2 + ((seed * 17) % 100) / 50,
      size: 3 + ((seed * 7) % 5),
      delay: ((seed * 23) % 60),
    };
  });

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => {
        const particleFrame = adjustedFrame - p.delay;
        if (particleFrame < 0) return null;

        const y = p.startY - particleFrame * p.speed;
        // Input range must be increasing, so we use 0 -> height and reverse the logic
        const opacity = interpolate(y, [0, height / 2, height], [0, 0.6, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={p.id}
            style={{
              position: "absolute",
              left: p.x,
              top: y,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: color,
              opacity,
              boxShadow: `0 0 ${p.size * 3}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Grid lines effect - animated grid for tech feel
 */
export const GridLines: React.FC<{ opacity?: number; color?: string; animate?: boolean }> = ({
  opacity = 0.1,
  color = COLORS.gold,
  animate = true,
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  const gridSize = 80;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);

  // Animated scan line
  const scanY = animate ? (frame * 3) % height : -100;

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Vertical lines */}
      {Array.from({ length: cols }, (_, i) => (
        <div
          key={`v-${i}`}
          style={{
            position: "absolute",
            left: i * gridSize,
            top: 0,
            width: 1,
            height: "100%",
            background: `linear-gradient(180deg, transparent, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
          }}
        />
      ))}

      {/* Horizontal lines */}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={`h-${i}`}
          style={{
            position: "absolute",
            left: 0,
            top: i * gridSize,
            width: "100%",
            height: 1,
            background: `linear-gradient(90deg, transparent, ${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}, transparent)`,
          }}
        />
      ))}

      {/* Scan line */}
      {animate && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: scanY,
            width: "100%",
            height: 2,
            background: `linear-gradient(90deg, transparent, ${color}80, transparent)`,
            boxShadow: `0 0 20px ${color}60`,
          }}
        />
      )}
    </div>
  );
};
