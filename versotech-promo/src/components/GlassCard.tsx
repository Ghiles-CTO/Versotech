import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "./Background";

type GlassCardProps = {
  children: React.ReactNode;
  width?: number | string;
  height?: number | string;
  delay?: number;
  style?: React.CSSProperties;
  accentColor?: "cyan" | "gold" | "purple";
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  width = 400,
  height = 250,
  delay = 0,
  style = {},
  accentColor = "cyan",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const scale = interpolate(entrance, [0, 1], [0.9, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [30, 0]);

  // Subtle pulse on the border
  const borderPulse = interpolate(
    Math.sin((frame - delay) * 0.04),
    [-1, 1],
    [0.2, 0.4]
  );

  // Updated to use VERSOTECH brand colors
  const colorMap = {
    cyan: COLORS.accent,
    gold: COLORS.gold,
    purple: "#8b5cf6",
  };

  const selectedColor = colorMap[accentColor];

  const borderColor = `rgba(${hexToRgb(selectedColor)}, ${borderPulse})`;
  const glowColor = `rgba(${hexToRgb(selectedColor)}, 0.15)`;

  return (
    <div
      style={{
        width,
        height,
        background: `linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)`,
        backdropFilter: "blur(20px)",
        borderRadius: 16,
        border: `1px solid ${borderColor}`,
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.5),
          inset 0 1px 0 rgba(255, 255, 255, 0.05),
          0 0 40px ${glowColor}
        `,
        padding: 25,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        opacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return "255, 255, 255";
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
