import { useCurrentFrame, useVideoConfig, interpolate, spring, Img, staticFile } from "remotion";
import { COLORS } from "./Background";

type ScreenshotFrameProps = {
  src: string; // e.g., "screenshots/dashboard.png"
  delay?: number;
  width?: number;
  height?: number;
  heroMode?: boolean; // New: full-width hero treatment
  perspective?: boolean;
  glowColor?: string;
  scale?: number;
  opacity?: number;
  style?: React.CSSProperties;
  showBrowserChrome?: boolean; // New: option to hide browser chrome
};

export const ScreenshotFrame: React.FC<ScreenshotFrameProps> = ({
  src,
  delay = 0,
  width = 1400, // Default to hero size
  height = 800,
  heroMode = false,
  perspective = false,
  glowColor = COLORS.accent,
  scale: customScale,
  opacity: customOpacity,
  style = {},
  showBrowserChrome = false, // Default to no chrome for cleaner look
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Slower, more deliberate entrance animation (600ms)
  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 20, stiffness: 60 },
  });

  const entranceScale = interpolate(entrance, [0, 1], [0.95, 1]); // Subtle scale: 0.95 -> 1.0
  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const entranceY = interpolate(entrance, [0, 1], [20, 0]);

  // Use custom values if provided, otherwise use animated values
  const finalScale = customScale ?? entranceScale;
  const finalOpacity = customOpacity ?? entranceOpacity;

  // Very subtle floating animation
  const floatY = Math.sin((frame - delay) * 0.02) * 2;

  // Perspective transform values (more subtle)
  const rotateX = perspective ? -4 : 0;
  const rotateY = perspective ? 2 : 0;

  return (
    <div
      style={{
        width: heroMode ? "100%" : width,
        maxWidth: heroMode ? 1400 : width,
        height,
        position: "relative",
        transform: `
          scale(${finalScale})
          translateY(${entranceY + floatY}px)
          perspective(1500px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `,
        opacity: finalOpacity,
        transformStyle: "preserve-3d",
        ...style,
      }}
    >
      {/* Subtle glow effect behind the frame */}
      <div
        style={{
          position: "absolute",
          inset: -30,
          borderRadius: 24,
          background: `radial-gradient(ellipse at center, ${glowColor}20 0%, transparent 70%)`,
          filter: "blur(40px)",
          zIndex: -1,
        }}
      />

      {/* Main screenshot container */}
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: 16,
          overflow: "hidden",
          background: COLORS.bgSurface,
          border: `1px solid ${COLORS.border}`,
          boxShadow: `
            0 25px 80px rgba(0, 0, 0, 0.6),
            0 10px 30px rgba(0, 0, 0, 0.4),
            0 0 60px ${glowColor}15
          `,
        }}
      >
        {/* Optional minimal browser chrome */}
        {showBrowserChrome && (
          <div
            style={{
              height: 28,
              background: COLORS.bgElevated,
              display: "flex",
              alignItems: "center",
              paddingLeft: 12,
              gap: 6,
              borderBottom: `1px solid ${COLORS.border}`,
            }}
          >
            {/* Window controls */}
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#EF4444" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#F59E0B" }} />
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22C55E" }} />

            {/* URL bar */}
            <div
              style={{
                marginLeft: 16,
                height: 18,
                flex: 1,
                maxWidth: 300,
                borderRadius: 4,
                background: "rgba(255,255,255,0.05)",
                display: "flex",
                alignItems: "center",
                paddingLeft: 8,
              }}
            >
              <span style={{ fontSize: 9, color: COLORS.textMuted }}>
                versotech.com
              </span>
            </div>
          </div>
        )}

        {/* Screenshot image */}
        <Img
          src={staticFile(src)}
          style={{
            width: "100%",
            height: showBrowserChrome ? "calc(100% - 28px)" : "100%",
            objectFit: "cover",
            objectPosition: "top left",
          }}
        />
      </div>

      {/* Subtle bottom reflection for perspective shots */}
      {perspective && (
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: "10%",
            right: "10%",
            height: 40,
            background: `linear-gradient(180deg, ${glowColor}10 0%, transparent 100%)`,
            borderRadius: "0 0 16px 16px",
            filter: "blur(8px)",
            transform: "scaleY(-0.2)",
            opacity: 0.2,
          }}
        />
      )}
    </div>
  );
};
