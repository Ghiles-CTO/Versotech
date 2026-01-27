import { useCurrentFrame, interpolate, Easing } from "remotion";
import { COLORS } from "./Background";

interface GlitchEffectProps {
  children: React.ReactNode;
  intensity?: number; // 0-1
  startFrame?: number;
  duration?: number;
}

/**
 * Glitch effect wrapper - adds RGB split and scan lines
 * Perfect for transitions and emphasis moments
 */
export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  children,
  intensity = 0.5,
  startFrame = 0,
  duration = 15,
}) => {
  const frame = useCurrentFrame();
  const glitchFrame = frame - startFrame;

  if (glitchFrame < 0 || glitchFrame > duration) {
    return <>{children}</>;
  }

  // Glitch intensity curve - peaks in middle
  const glitchProgress = interpolate(
    glitchFrame,
    [0, duration / 2, duration],
    [0, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const currentIntensity = intensity * glitchProgress;

  // RGB split offset
  const rgbOffset = currentIntensity * 10;

  // Random jitter
  const jitterX = Math.sin(glitchFrame * 47) * currentIntensity * 5;
  const jitterY = Math.cos(glitchFrame * 31) * currentIntensity * 3;

  return (
    <div style={{ position: "relative" }}>
      {/* Red channel - offset left */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${-rgbOffset + jitterX}px, ${jitterY}px)`,
          filter: "url(#redChannel)",
          opacity: currentIntensity * 0.8,
          mixBlendMode: "screen",
        }}
      >
        {children}
      </div>

      {/* Blue channel - offset right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translate(${rgbOffset + jitterX}px, ${-jitterY}px)`,
          filter: "url(#blueChannel)",
          opacity: currentIntensity * 0.8,
          mixBlendMode: "screen",
        }}
      >
        {children}
      </div>

      {/* Main content */}
      <div
        style={{
          position: "relative",
          transform: `translate(${jitterX}px, ${jitterY}px)`,
        }}
      >
        {children}
      </div>

      {/* Scan lines overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, ${currentIntensity * 0.3}) 2px,
            rgba(0, 0, 0, ${currentIntensity * 0.3}) 4px
          )`,
          pointerEvents: "none",
        }}
      />

      {/* SVG filters for color channels */}
      <svg style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="redChannel">
            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
            />
          </filter>
          <filter id="blueChannel">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Text reveal with glitch effect
 */
export const GlitchText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
  glitchDuration?: number;
}> = ({
  text,
  delay = 0,
  fontSize = 64,
  color = COLORS.textPrimary,
  glitchDuration = 12,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;

  if (adjustedFrame < 0) return null;

  // Text reveal progress
  const revealProgress = interpolate(
    adjustedFrame,
    [0, 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }
  );

  // Glitch during reveal
  const isGlitching = adjustedFrame < glitchDuration;
  const glitchIntensity = isGlitching
    ? interpolate(adjustedFrame, [0, glitchDuration], [0.8, 0], { extrapolateRight: "clamp" })
    : 0;

  // Random character replacement during glitch
  const glitchChars = "!@#$%^&*()_+-=[]{}|;':\",./<>?";
  const displayText = text
    .split("")
    .map((char, i) => {
      if (isGlitching && Math.random() < glitchIntensity * 0.3) {
        return glitchChars[Math.floor(Math.random() * glitchChars.length)];
      }
      return char;
    })
    .join("");

  const rgbOffset = glitchIntensity * 6;

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      {/* RGB split layers */}
      {glitchIntensity > 0 && (
        <>
          <span
            style={{
              position: "absolute",
              fontFamily: "'Inter', sans-serif",
              fontSize,
              fontWeight: 700,
              color: "#ff0000",
              opacity: glitchIntensity * 0.5,
              transform: `translateX(${-rgbOffset}px)`,
              mixBlendMode: "screen",
            }}
          >
            {displayText}
          </span>
          <span
            style={{
              position: "absolute",
              fontFamily: "'Inter', sans-serif",
              fontSize,
              fontWeight: 700,
              color: "#0000ff",
              opacity: glitchIntensity * 0.5,
              transform: `translateX(${rgbOffset}px)`,
              mixBlendMode: "screen",
            }}
          >
            {displayText}
          </span>
        </>
      )}

      {/* Main text */}
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize,
          fontWeight: 700,
          color,
          opacity: revealProgress,
          position: "relative",
        }}
      >
        {displayText}
      </span>
    </div>
  );
};

/**
 * Flash effect - quick white flash for impact
 */
export const FlashEffect: React.FC<{
  startFrame: number;
  duration?: number;
  color?: string;
}> = ({ startFrame, duration = 6, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const flashFrame = frame - startFrame;

  if (flashFrame < 0 || flashFrame > duration) return null;

  const opacity = interpolate(
    flashFrame,
    [0, 2, duration],
    [0, 0.8, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: color,
        opacity,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
};

/**
 * Wipe transition effect
 */
export const WipeTransition: React.FC<{
  startFrame: number;
  duration?: number;
  direction?: "left" | "right" | "up" | "down";
  color?: string;
}> = ({ startFrame, duration = 12, direction = "right", color = COLORS.gold }) => {
  const frame = useCurrentFrame();
  const wipeFrame = frame - startFrame;

  if (wipeFrame < 0 || wipeFrame > duration) return null;

  const progress = interpolate(
    wipeFrame,
    [0, duration],
    [0, 200], // Go past 100% to fully exit
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.quad) }
  );

  const transforms = {
    left: `translateX(${100 - progress}%)`,
    right: `translateX(${-100 + progress}%)`,
    up: `translateY(${100 - progress}%)`,
    down: `translateY(${-100 + progress}%)`,
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${direction === "left" || direction === "right" ? "90deg" : "180deg"}, ${color}, ${color}dd)`,
        transform: transforms[direction],
        zIndex: 50,
      }}
    />
  );
};
