import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS } from "../components/Background";
import { flyingNumber, snappySpring } from "../lib/animations";

/**
 * Scene 5: Metric Blitz (30-36s) - 180 frames @ 30fps
 *
 * Numbers fly in rapid succession (no screenshots):
 * - "404" → "LPs onboarded"
 * - "13" → "Active deals"
 * - "$4M+" → "Fees processed"
 * - "393" → "KYC complete"
 * - "1.15x" → "Average TVPI"
 */

interface MetricItemProps {
  value: string;
  label: string;
  frame: number;
  fps: number;
  delay: number;
  from: "left" | "right";
}

const MetricItem: React.FC<MetricItemProps> = ({
  value,
  label,
  frame,
  fps,
  delay,
  from,
}) => {
  const anim = flyingNumber({ frame, fps, delay, from });

  // Label entrance (slightly after value)
  const labelDelay = delay + 8;
  const labelProgress = snappySpring({ frame, fps, delay: labelDelay });
  const labelOpacity = Math.min(1, labelProgress * 1.5);
  const labelY = interpolate(labelProgress, [0, 1], [10, 0]);

  // Exit animation (for all metrics at end)
  const exitStart = 150;
  const exitOpacity = interpolate(
    frame,
    [exitStart, exitStart + 15],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        opacity: anim.opacity * exitOpacity,
        transform: `translateX(${anim.x}px) scale(${anim.scale})`,
      }}
    >
      {/* Value */}
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 80,
          fontWeight: 800,
          color: COLORS.gold,
          letterSpacing: "-0.03em",
          textShadow: `0 0 60px ${COLORS.gold}60`,
          minWidth: 220,
          textAlign: "right",
        }}
      >
        {value}
      </span>

      {/* Arrow */}
      <svg
        width="30"
        height="30"
        viewBox="0 0 24 24"
        fill="none"
        stroke={COLORS.textMuted}
        strokeWidth="2"
        style={{
          opacity: labelOpacity,
        }}
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>

      {/* Label */}
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 32,
          fontWeight: 500,
          color: COLORS.textSecondary,
          letterSpacing: "0.01em",
          opacity: labelOpacity,
          transform: `translateY(${labelY}px)`,
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const MetricBlitzScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Metrics data with staggered timing
  const metrics = [
    { value: "404", label: "LPs onboarded", delay: 0, from: "right" as const },
    { value: "13", label: "Active deals", delay: 25, from: "left" as const },
    { value: "$4M+", label: "Fees processed", delay: 50, from: "right" as const },
    { value: "393", label: "KYC complete", delay: 75, from: "left" as const },
    { value: "1.15x", label: "Average TVPI", delay: 100, from: "right" as const },
  ];

  // Subtle pulsing background glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.05),
    [-1, 1],
    [0.03, 0.08]
  );

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        gap: 24,
      }}
    >
      {/* Central glow */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}${Math.round(glowPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Metrics list */}
      {metrics.map((metric, index) => (
        <MetricItem
          key={index}
          value={metric.value}
          label={metric.label}
          frame={frame}
          fps={fps}
          delay={metric.delay}
          from={metric.from}
        />
      ))}
    </div>
  );
};
