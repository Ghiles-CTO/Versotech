import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { COLORS } from "../components/Background";
import { slamSpring } from "../lib/animations";
import { SplitTextReveal } from "../components/AnimatedCounter";
import { RisingParticles, GridLines } from "../components/Particles";
import { FlashEffect } from "../components/GlitchEffect";

/**
 * Scene 7: Positioning (42-48s) - 180 frames @ 30fps (FASTER!)
 *
 * ENHANCED VERSION:
 * - Faster pacing (6s instead of 8s)
 * - Split text reveal with highlights
 * - Rising particles
 * - Flash transitions between lines
 */

export const PositioningScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // First line: "Stop managing spreadsheets."
  const line1Delay = 0;
  const line1Progress = slamSpring({ frame, fps, delay: line1Delay });
  const line1Opacity = Math.min(1, line1Progress * 1.5);
  const line1Scale = interpolate(line1Progress, [0, 1], [0.85, 1]);

  // First line exits faster
  const line1FadeStart = 70;
  const line1Fade = interpolate(
    frame,
    [line1FadeStart, line1FadeStart + 10],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Second line: "Start running a fund." - comes in faster
  const line2Delay = 80;
  const line2Progress = slamSpring({ frame, fps, delay: line2Delay });
  const line2Opacity = Math.min(1, line2Progress * 1.5);
  const line2Scale = interpolate(line2Progress, [0, 1], [0.85, 1]);

  // Pulsing gold glow - more intense
  const glowIntensity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.04, 0.12]
  );

  // Background movement
  const bgY = interpolate(frame, [0, 180], [0, -30], { extrapolateRight: "clamp" });

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
      {/* Grid lines for tech feel */}
      <GridLines opacity={0.03} color={COLORS.gold} animate={true} />

      {/* Rising particles */}
      <RisingParticles count={30} color={COLORS.gold} delay={0} />

      {/* Subtle central glow */}
      <div
        style={{
          position: "absolute",
          width: 1200,
          height: 800,
          borderRadius: "50%",
          background: `radial-gradient(ellipse at center, ${COLORS.gold}${Math.round(glowIntensity * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
          filter: "blur(100px)",
          transform: `translateY(${bgY}px)`,
        }}
      />

      {/* Flash between lines */}
      <FlashEffect startFrame={line1FadeStart + 5} duration={5} color={`${COLORS.gold}30`} />

      {/* First line */}
      <h1
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 68,
          fontWeight: 700,
          color: COLORS.textPrimary,
          margin: 0,
          opacity: line1Opacity * line1Fade,
          transform: `scale(${line1Scale})`,
          textAlign: "center",
          letterSpacing: "-0.02em",
          position: "absolute",
        }}
      >
        Stop managing{" "}
        <span style={{ color: COLORS.error, textDecoration: "line-through", opacity: 0.8 }}>
          spreadsheets
        </span>
        .
      </h1>

      {/* Second line with split text reveal */}
      <div
        style={{
          opacity: line2Opacity,
          transform: `scale(${line2Scale})`,
        }}
      >
        <SplitTextReveal
          text="Start running a fund."
          delay={line2Delay}
          stagger={3}
          fontSize={72}
          color={COLORS.textPrimary}
          highlightWords={["fund."]}
          highlightColor={COLORS.gold}
        />
      </div>

      {/* Decorative lines */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          display: "flex",
          gap: 8,
          opacity: line2Opacity * 0.5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 40,
              height: 4,
              background: i === 1 ? COLORS.gold : COLORS.border,
              borderRadius: 2,
            }}
          />
        ))}
      </div>
    </div>
  );
};
