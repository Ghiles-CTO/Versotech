import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS } from "./Background";

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "left"
  | "right";

type FloatingMetricProps = {
  value: number | string;
  label: string;
  prefix?: string; // "$"
  suffix?: string; // "M", "%"
  position: Position;
  delay?: number;
  countUp?: boolean; // Animate number counting up
  countUpDuration?: number; // Frames for count animation
  accentColor?: "gold" | "cyan";
  size?: "small" | "medium" | "large";
};

/**
 * FloatingMetric - Glassmorphism stat card with count-up animation
 *
 * Creates premium floating metric cards that appear around the video frame.
 * Features:
 * - Spring entrance animation with scale + opacity + translate
 * - Optional count-up animation for numbers
 * - Subtle floating Y oscillation
 * - Glassmorphism styling with glow border
 */
export const FloatingMetric: React.FC<FloatingMetricProps> = ({
  value,
  label,
  prefix = "",
  suffix = "",
  position,
  delay = 0,
  countUp = true,
  countUpDuration = 45, // 1.5s @ 30fps
  accentColor = "gold",
  size = "medium",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  // Spring entrance animation (400ms)
  const entrance = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 22, stiffness: 120 },
  });

  // Calculate position offsets based on position prop
  const getPositionStyle = (): React.CSSProperties => {
    const offset = 40; // Distance from video edge
    const baseStyle: React.CSSProperties = {
      position: "absolute",
    };

    switch (position) {
      case "top-left":
        return { ...baseStyle, top: offset, left: -160 };
      case "top-right":
        return { ...baseStyle, top: offset, right: -160 };
      case "bottom-left":
        return { ...baseStyle, bottom: offset, left: -160 };
      case "bottom-right":
        return { ...baseStyle, bottom: offset, right: -160 };
      case "left":
        return { ...baseStyle, top: "50%", left: -180, transform: "translateY(-50%)" };
      case "right":
        return { ...baseStyle, top: "50%", right: -180, transform: "translateY(-50%)" };
      default:
        return baseStyle;
    }
  };

  // Entrance animation values
  const entranceScale = interpolate(entrance, [0, 1], [0.8, 1]);
  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1]);

  // Direction-based entrance translate
  const isLeft = position.includes("left");
  const entranceX = interpolate(entrance, [0, 1], [isLeft ? -30 : 30, 0]);

  // Subtle floating animation
  const floatY = Math.sin(adjustedFrame * 0.04) * 2;

  // Count-up animation for numbers
  let displayValue: string;
  if (countUp && typeof value === "number") {
    const countProgress = interpolate(
      adjustedFrame,
      [0, countUpDuration],
      [0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: Easing.out(Easing.quad),
      }
    );
    const currentValue = Math.round(value * countProgress);
    displayValue = `${prefix}${currentValue.toLocaleString()}${suffix}`;
  } else {
    displayValue = `${prefix}${value}${suffix}`;
  }

  // Color based on accent
  const color = accentColor === "cyan" ? COLORS.cyan : COLORS.gold;

  // Size variants
  const sizeConfig = {
    small: { width: 120, valueFontSize: 22, labelFontSize: 10, padding: 14 },
    medium: { width: 140, valueFontSize: 28, labelFontSize: 11, padding: 16 },
    large: { width: 160, valueFontSize: 34, labelFontSize: 12, padding: 18 },
  };
  const config = sizeConfig[size];

  // Border pulse
  const borderPulse = interpolate(
    Math.sin(adjustedFrame * 0.05),
    [-1, 1],
    [0.15, 0.35]
  );

  // Don't render before delay
  if (adjustedFrame < 0) {
    return null;
  }

  return (
    <div
      style={{
        ...getPositionStyle(),
        width: config.width,
        opacity: entranceOpacity,
        transform: `
          scale(${entranceScale})
          translateX(${entranceX}px)
          translateY(${floatY}px)
        `,
        zIndex: 10,
      }}
    >
      {/* Glassmorphism card */}
      <div
        style={{
          background: "rgba(15, 15, 15, 0.85)",
          backdropFilter: "blur(20px)",
          borderRadius: 12,
          padding: config.padding,
          border: `1px solid rgba(${accentColor === "gold" ? "212, 175, 55" : "61, 189, 255"}, ${borderPulse})`,
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.5),
            0 0 40px ${color}15,
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Value */}
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: config.valueFontSize,
            fontWeight: 700,
            color: color,
            marginBottom: 4,
            letterSpacing: "-0.02em",
          }}
        >
          {displayValue}
        </div>

        {/* Label */}
        <div
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: config.labelFontSize,
            fontWeight: 500,
            color: COLORS.textMuted,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </div>
      </div>

      {/* Glow accent */}
      <div
        style={{
          position: "absolute",
          top: -5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 40,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          borderRadius: 2,
          opacity: borderPulse * 1.5,
        }}
      />
    </div>
  );
};
