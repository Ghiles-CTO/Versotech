import { useCurrentFrame, useVideoConfig, Img, staticFile, interpolate } from "remotion";
import { COLORS } from "../components/Background";
import { fastSpring, subtleZoom, snappySpring } from "../lib/animations";

/**
 * Scene 3: Overview Shot (6-10s) - 120 frames @ 30fps
 *
 * Full dashboard screenshot ZOOMS in from distance
 * Text overlay: "404 LPs. 13 Deals. One screen."
 * Screenshot scrolls/pans slightly
 */

export const SolutionScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screenshot zooms in from far
  const screenshotProgress = fastSpring({ frame, fps, delay: 0 });
  const screenshotScale = interpolate(screenshotProgress, [0, 1], [0.7, 1]);
  const screenshotOpacity = interpolate(screenshotProgress, [0, 1], [0, 1]);
  const screenshotY = interpolate(screenshotProgress, [0, 1], [60, 0]);

  // Continuous subtle zoom on screenshot
  const continuousZoom = subtleZoom({
    frame: Math.max(0, frame - 15),
    startScale: 1,
    endScale: 1.03,
    duration: 105,
  });

  // Text overlay entrance - staggered
  const text1Delay = 20;
  const text2Delay = 30;
  const text3Delay = 40;

  const text1Progress = snappySpring({ frame, fps, delay: text1Delay });
  const text2Progress = snappySpring({ frame, fps, delay: text2Delay });
  const text3Progress = snappySpring({ frame, fps, delay: text3Delay });

  // Glow effect behind screenshot
  const glowPulse = interpolate(
    Math.sin(frame * 0.04),
    [-1, 1],
    [0.15, 0.25]
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
        overflow: "hidden",
      }}
    >
      {/* Screenshot container */}
      <div
        style={{
          position: "relative",
          opacity: screenshotOpacity,
          transform: `translateY(${screenshotY}px) scale(${screenshotScale * continuousZoom})`,
        }}
      >
        {/* Glow behind */}
        <div
          style={{
            position: "absolute",
            inset: -50,
            borderRadius: 30,
            background: `radial-gradient(ellipse at center, ${COLORS.gold}${Math.round(glowPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: "blur(60px)",
            zIndex: -1,
          }}
        />

        {/* Screenshot frame */}
        <div
          style={{
            width: 1400,
            height: 750,
            borderRadius: 16,
            overflow: "hidden",
            background: COLORS.bgSurface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: `
              0 30px 100px rgba(0, 0, 0, 0.7),
              0 15px 50px rgba(0, 0, 0, 0.5),
              0 0 80px ${COLORS.gold}20
            `,
          }}
        >
          <Img
            src={staticFile("admin dashboard.png")}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top left",
            }}
          />
        </div>
      </div>

      {/* Text overlay - positioned at bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          display: "flex",
          gap: 40,
          alignItems: "center",
        }}
      >
        {/* "404 LPs" */}
        <div
          style={{
            opacity: text1Progress,
            transform: `translateY(${interpolate(text1Progress, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.gold,
            }}
          >
            404
          </span>
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 28,
              fontWeight: 500,
              color: COLORS.textSecondary,
              marginLeft: 12,
            }}
          >
            LPs
          </span>
        </div>

        {/* Dot separator */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.textMuted,
            opacity: text2Progress,
          }}
        />

        {/* "13 Deals" */}
        <div
          style={{
            opacity: text2Progress,
            transform: `translateY(${interpolate(text2Progress, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 48,
              fontWeight: 700,
              color: COLORS.gold,
            }}
          >
            13
          </span>
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 28,
              fontWeight: 500,
              color: COLORS.textSecondary,
              marginLeft: 12,
            }}
          >
            Deals
          </span>
        </div>

        {/* Dot separator */}
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: COLORS.textMuted,
            opacity: text3Progress,
          }}
        />

        {/* "One screen." */}
        <div
          style={{
            opacity: text3Progress,
            transform: `translateY(${interpolate(text3Progress, [0, 1], [20, 0])}px)`,
          }}
        >
          <span
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: 36,
              fontWeight: 600,
              color: COLORS.textPrimary,
            }}
          >
            One screen.
          </span>
        </div>
      </div>
    </div>
  );
};
