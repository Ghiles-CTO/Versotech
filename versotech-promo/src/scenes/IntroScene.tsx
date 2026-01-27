import { useCurrentFrame, useVideoConfig, Img, staticFile, interpolate } from "remotion";
import { COLORS } from "../components/Background";
import { slamSpring, goldBurst, scalePunch } from "../lib/animations";
import { RisingParticles, GridLines } from "../components/Particles";
import { BouncingText } from "../components/AnimatedCounter";
import { FlashEffect } from "../components/GlitchEffect";

/**
 * Scene 1: Logo Slam (0-2s) - 60 frames @ 30fps
 *
 * ENHANCED VERSION:
 * - Flash on impact
 * - Bouncing "VERSOTECH" text
 * - Rising gold particles
 * - Grid lines for tech feel
 * - Multiple gold bursts
 */

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo slam entrance - aggressive spring with overshoot
  const logoProgress = slamSpring({ frame, fps, delay: 0 });

  // Scale with overshoot
  const logoScale = scalePunch({ frame, fps, delay: 0, overshoot: 0.15 });

  // Opacity
  const logoOpacity = Math.min(1, logoProgress * 2);

  // Multiple gold bursts for more impact
  const burst1 = goldBurst({ frame, fps, delay: 2 });
  const burst2 = goldBurst({ frame, fps, delay: 8 });

  // Logo rotation on entrance
  const logoRotation = interpolate(logoProgress, [0, 1], [-5, 0]);

  // Subtle pulse after entrance settles
  const settleTime = 15;
  const glowPulse =
    frame > settleTime
      ? 0.5 + Math.sin((frame - settleTime) * 0.15) * 0.2
      : 0.5 * logoProgress;

  // Background pulse
  const bgPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.02, 0.06]
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
      {/* Grid lines background */}
      <GridLines opacity={0.05} color={COLORS.gold} animate={true} />

      {/* Rising particles */}
      <RisingParticles count={40} color={COLORS.gold} delay={5} />

      {/* Background radial pulse */}
      <div
        style={{
          position: "absolute",
          width: 1500,
          height: 1500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}${Math.round(bgPulse * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
          filter: "blur(80px)",
        }}
      />

      {/* Gold burst effects */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}80 0%, ${COLORS.gold}30 30%, transparent 60%)`,
          transform: `scale(${burst1.scale})`,
          opacity: burst1.opacity,
          filter: "blur(15px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.goldLight}90 0%, transparent 50%)`,
          transform: `scale(${burst2.scale * 1.2})`,
          opacity: burst2.opacity * 0.7,
          filter: "blur(10px)",
        }}
      />

      {/* Flash on impact */}
      <FlashEffect startFrame={3} duration={5} color={COLORS.gold} />

      {/* Logo Container with gold glow */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          borderRadius: 28,
          overflow: "hidden",
          boxShadow: `
            0 0 120px rgba(212, 175, 55, ${glowPulse}),
            0 0 250px rgba(212, 175, 55, ${glowPulse * 0.6}),
            0 20px 60px rgba(0, 0, 0, 0.5)
          `,
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile("verso-logo.jpg")}
          style={{
            width: 200,
            height: 200,
            objectFit: "cover",
          }}
        />
      </div>

      {/* VERSOTECH text - bouncing letters */}
      <div
        style={{
          marginTop: 30,
          zIndex: 10,
        }}
      >
        <BouncingText
          text="VERSOTECH"
          delay={8}
          fontSize={80}
          color={COLORS.textPrimary}
        />
      </div>

      {/* Tagline - quick fade in */}
      <p
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 18,
          fontWeight: 400,
          letterSpacing: "0.3em",
          color: COLORS.textMuted,
          margin: 0,
          marginTop: 20,
          opacity: interpolate(frame, [35, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          textTransform: "uppercase",
          zIndex: 10,
        }}
      >
        Investment Operating System
      </p>
    </div>
  );
};
