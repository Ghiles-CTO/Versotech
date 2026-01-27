import { useCurrentFrame, useVideoConfig, Img, staticFile, interpolate, spring } from "remotion";
import { COLORS } from "../components/Background";
import { fastSpring, snappySpring } from "../lib/animations";
import { RisingParticles, GridLines } from "../components/Particles";
import { BouncingText, AnimatedCounter } from "../components/AnimatedCounter";

/**
 * Scene 8: CTA (48-60s) - 360 frames @ 30fps
 *
 * ENHANCED VERSION:
 * - Faster, more dynamic entrance
 * - Animated stats
 * - More visual interest
 * - Pulsing call-to-action elements
 */

export const CTAScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo entrance - fast slam
  const logoDelay = 0;
  const logoProgress = fastSpring({ frame, fps, delay: logoDelay });
  const logoOpacity = Math.min(1, logoProgress * 1.5);
  const logoScale = interpolate(logoProgress, [0, 1], [0.8, 1]);
  const logoRotation = interpolate(logoProgress, [0, 1], [-8, 0]);

  // VERSOTECH text - bouncing
  const textDelay = 10;

  // Stats row entrance
  const statsDelay = 40;
  const statsProgress = snappySpring({ frame, fps, delay: statsDelay });
  const statsOpacity = Math.min(1, statsProgress * 1.5);
  const statsY = interpolate(statsProgress, [0, 1], [30, 0]);

  // Domain entrance with animated underline
  const domainDelay = 70;
  const domainProgress = snappySpring({ frame, fps, delay: domainDelay });
  const domainOpacity = Math.min(1, domainProgress * 1.5);

  // Underline animation
  const underlineDelay = 85;
  const underlineWidth = interpolate(
    frame - underlineDelay,
    [0, 12],
    [0, 100],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Social proof delay
  const socialDelay = 100;
  const socialProgress = snappySpring({ frame, fps, delay: socialDelay });

  // Pulsing glow
  const glowPulse = interpolate(
    Math.sin(frame * 0.07),
    [-1, 1],
    [0.25, 0.5]
  );

  // Background movement
  const bgScale = interpolate(frame, [0, 360], [1, 1.1], { extrapolateRight: "clamp" });

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
      {/* Grid lines */}
      <GridLines opacity={0.02} color={COLORS.gold} animate={true} />

      {/* Rising particles */}
      <RisingParticles count={35} color={COLORS.gold} delay={0} />

      {/* Expanding background glow */}
      <div
        style={{
          position: "absolute",
          width: 1400,
          height: 1400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.gold}${Math.round(glowPulse * 0.15 * 255).toString(16).padStart(2, '0')} 0%, transparent 50%)`,
          filter: "blur(100px)",
          transform: `scale(${bgScale})`,
        }}
      />

      {/* Logo with gold glow */}
      <div
        style={{
          opacity: logoOpacity,
          transform: `scale(${logoScale}) rotate(${logoRotation}deg)`,
          marginBottom: 25,
          borderRadius: 22,
          overflow: "hidden",
          boxShadow: `
            0 0 100px rgba(212, 175, 55, ${glowPulse}),
            0 0 200px rgba(212, 175, 55, ${glowPulse * 0.5}),
            0 15px 50px rgba(0, 0, 0, 0.4)
          `,
          zIndex: 10,
        }}
      >
        <Img
          src={staticFile("verso-logo.jpg")}
          style={{
            width: 110,
            height: 110,
            objectFit: "cover",
          }}
        />
      </div>

      {/* VERSOTECH - bouncing */}
      <div style={{ marginBottom: 30, zIndex: 10 }}>
        <BouncingText
          text="VERSOTECH"
          delay={textDelay}
          fontSize={60}
          color={COLORS.textPrimary}
        />
      </div>

      {/* Stats row */}
      <div
        style={{
          display: "flex",
          gap: 60,
          marginBottom: 40,
          opacity: statsOpacity,
          transform: `translateY(${statsY}px)`,
          zIndex: 10,
        }}
      >
        {[
          { value: 404, label: "LPs" },
          { value: 13, label: "Deals" },
          { value: 4, prefix: "$", suffix: "M+", label: "Processed" },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <AnimatedCounter
              value={stat.value}
              prefix={stat.prefix}
              suffix={stat.suffix}
              delay={statsDelay + i * 8}
              duration={25}
              fontSize={42}
              color={COLORS.gold}
            />
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: COLORS.textMuted,
                letterSpacing: "0.1em",
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Domain with underline */}
      <div
        style={{
          position: "relative",
          opacity: domainOpacity,
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 32,
            fontWeight: 600,
            color: COLORS.textPrimary,
            margin: 0,
            letterSpacing: "0.08em",
          }}
        >
          versotech.com
        </p>

        {/* Animated gold underline */}
        <div
          style={{
            position: "absolute",
            bottom: -10,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${underlineWidth}%`,
            height: 4,
            background: `linear-gradient(90deg, transparent, ${COLORS.gold}, transparent)`,
            borderRadius: 2,
            boxShadow: `0 0 20px ${COLORS.gold}80`,
          }}
        />
      </div>

      {/* Social proof */}
      <div
        style={{
          marginTop: 60,
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: Math.min(0.7, socialProgress),
          transform: `translateY(${interpolate(socialProgress, [0, 1], [20, 0])}px)`,
          zIndex: 10,
        }}
      >
        {/* Stars */}
        <div style={{ display: "flex", gap: 4 }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <svg
              key={i}
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill={COLORS.gold}
            >
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          ))}
        </div>

        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: COLORS.textSecondary,
            letterSpacing: "0.02em",
          }}
        >
          Trusted by funds worldwide
        </span>
      </div>

      {/* Decorative corner elements */}
      <div
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          width: 60,
          height: 60,
          borderLeft: `2px solid ${COLORS.gold}30`,
          borderTop: `2px solid ${COLORS.gold}30`,
          opacity: domainOpacity * 0.5,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60,
          right: 60,
          width: 60,
          height: 60,
          borderRight: `2px solid ${COLORS.gold}30`,
          borderBottom: `2px solid ${COLORS.gold}30`,
          opacity: domainOpacity * 0.5,
        }}
      />
    </div>
  );
};
