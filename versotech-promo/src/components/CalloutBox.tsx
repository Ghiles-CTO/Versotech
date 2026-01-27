import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS } from "./Background";

type CalloutBoxProps = {
  text: string;
  position: { x: number; y: number }; // Box position (relative to parent)
  pointTo: { x: number; y: number }; // Where the pointer originates
  delay?: number;
  accentColor?: "gold" | "cyan";
  side?: "left" | "right"; // Which side the box appears on
};

/**
 * CalloutBox - Animated annotation with pointer line
 *
 * Creates premium callout annotations that point to specific features
 * in the video frame. Perfect for highlighting UI elements.
 *
 * Animation sequence:
 * 1. Pulsing dot appears at pointer origin (0-15 frames)
 * 2. Line draws from pointer to box position (0-30 frames)
 * 3. Box fades in (15-30 frames)
 * 4. Text fades in (25-40 frames)
 */
export const CalloutBox: React.FC<CalloutBoxProps> = ({
  text,
  position,
  pointTo,
  delay = 0,
  accentColor = "gold",
  side = "right",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  // Color based on accent
  const color = accentColor === "cyan" ? COLORS.cyan : COLORS.gold;

  // Line draw animation (30 frames = 1 second)
  const lineProgress = interpolate(adjustedFrame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.quad),
  });

  // Box fade animation (starts at frame 15, 15 frames duration)
  const boxOpacity = interpolate(adjustedFrame, [15, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boxScale = spring({
    frame: adjustedFrame - 15,
    fps,
    config: { damping: 25, stiffness: 150 },
  });

  // Text fade animation (starts at frame 25, 10 frames duration)
  const textOpacity = interpolate(adjustedFrame, [25, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Pulsing dot animation
  const dotPulse = interpolate(
    Math.sin(adjustedFrame * 0.15),
    [-1, 1],
    [0.6, 1]
  );
  const dotScale = interpolate(
    Math.sin(adjustedFrame * 0.1),
    [-1, 1],
    [1, 1.3]
  );

  // Calculate SVG path
  // Create a curved path from pointTo to position
  const dx = position.x - pointTo.x;
  const dy = position.y - pointTo.y;

  // Control point for curve (creates a slight arc)
  const cx = pointTo.x + dx * 0.5;
  const cy = pointTo.y + dy * 0.2;

  const pathD = `M ${pointTo.x} ${pointTo.y} Q ${cx} ${cy} ${position.x} ${position.y}`;

  // Calculate path length for dash animation
  // Approximate for quadratic bezier
  const pathLength = Math.sqrt(dx * dx + dy * dy) * 1.2;

  // Don't render before delay
  if (adjustedFrame < 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {/* SVG for line and dot */}
      <svg
        width="100%"
        height="100%"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
        }}
      >
        {/* Animated line */}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={pathLength}
          strokeDashoffset={pathLength * (1 - lineProgress)}
          opacity={0.8}
        />

        {/* Pulsing dot at pointer origin */}
        <circle
          cx={pointTo.x}
          cy={pointTo.y}
          r={6 * dotScale}
          fill={color}
          opacity={dotPulse}
        />

        {/* Inner dot */}
        <circle
          cx={pointTo.x}
          cy={pointTo.y}
          r={3}
          fill={COLORS.bgPrimary}
          opacity={lineProgress}
        />

        {/* Glow around dot */}
        <circle
          cx={pointTo.x}
          cy={pointTo.y}
          r={12}
          fill="none"
          stroke={color}
          strokeWidth={1}
          opacity={dotPulse * 0.3}
        />
      </svg>

      {/* Callout box */}
      <div
        style={{
          position: "absolute",
          left: position.x,
          top: position.y,
          transform: `
            translate(${side === "left" ? "-100%" : "0"}, -50%)
            scale(${interpolate(boxScale, [0, 1], [0.8, 1])})
          `,
          opacity: boxOpacity,
        }}
      >
        <div
          style={{
            background: "rgba(15, 15, 15, 0.9)",
            backdropFilter: "blur(15px)",
            borderRadius: 8,
            padding: "10px 14px",
            border: `1px solid ${color}40`,
            boxShadow: `
              0 4px 20px rgba(0, 0, 0, 0.4),
              0 0 20px ${color}10
            `,
            maxWidth: 200,
          }}
        >
          {/* Accent line at top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: side === "left" ? "auto" : 12,
              right: side === "left" ? 12 : "auto",
              width: 30,
              height: 2,
              background: color,
              borderRadius: 1,
              transform: "translateY(-50%)",
            }}
          />

          {/* Text */}
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 13,
              fontWeight: 500,
              color: COLORS.textSecondary,
              opacity: textOpacity,
              lineHeight: 1.4,
            }}
          >
            {text}
          </span>
        </div>

        {/* Connector dot at box edge */}
        <div
          style={{
            position: "absolute",
            left: side === "left" ? "auto" : -4,
            right: side === "left" ? -4 : "auto",
            top: "50%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: color,
            transform: "translateY(-50%)",
            opacity: boxOpacity,
          }}
        />
      </div>
    </div>
  );
};
