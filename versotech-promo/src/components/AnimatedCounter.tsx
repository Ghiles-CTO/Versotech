import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from "remotion";
import { COLORS } from "./Background";

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  delay?: number;
  duration?: number;
  fontSize?: number;
  color?: string;
  showGlow?: boolean;
}

/**
 * Animated counter with slot machine effect
 * Numbers roll up with easing and optional glow
 */
export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  prefix = "",
  suffix = "",
  delay = 0,
  duration = 30,
  fontSize = 72,
  color = COLORS.gold,
  showGlow = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  if (adjustedFrame < 0) return null;

  // Count up with ease out
  const progress = interpolate(
    adjustedFrame,
    [0, duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    }
  );

  const currentValue = Math.round(value * progress);

  // Scale punch on finish
  const scaleSpring = spring({
    frame: adjustedFrame - duration + 5,
    fps,
    config: { damping: 12, stiffness: 200 },
  });
  const scale = adjustedFrame > duration - 5 ? 1 + (scaleSpring * 0.1) : 1;

  // Glow intensity
  const glowIntensity = showGlow ? 0.4 + Math.sin(adjustedFrame * 0.1) * 0.2 : 0;

  return (
    <span
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize,
        fontWeight: 800,
        color,
        letterSpacing: "-0.02em",
        transform: `scale(${scale})`,
        display: "inline-block",
        textShadow: showGlow ? `0 0 ${40 * glowIntensity}px ${color}` : "none",
      }}
    >
      {prefix}
      {currentValue.toLocaleString()}
      {suffix}
    </span>
  );
};

/**
 * Typewriter text effect
 */
export const TypewriterText: React.FC<{
  text: string;
  delay?: number;
  speed?: number; // frames per character
  fontSize?: number;
  color?: string;
  cursor?: boolean;
}> = ({
  text,
  delay = 0,
  speed = 2,
  fontSize = 32,
  color = COLORS.textPrimary,
  cursor = true,
}) => {
  const frame = useCurrentFrame();
  const adjustedFrame = frame - delay;

  if (adjustedFrame < 0) return null;

  const charsToShow = Math.min(text.length, Math.floor(adjustedFrame / speed));
  const displayText = text.substring(0, charsToShow);
  const isTyping = charsToShow < text.length;

  // Cursor blink
  const cursorVisible = cursor && (isTyping || Math.floor(adjustedFrame / 15) % 2 === 0);

  return (
    <span
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize,
        fontWeight: 500,
        color,
        letterSpacing: "0.01em",
      }}
    >
      {displayText}
      {cursorVisible && (
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: fontSize * 0.8,
            background: COLORS.gold,
            marginLeft: 2,
            verticalAlign: "middle",
          }}
        />
      )}
    </span>
  );
};

/**
 * Split text reveal - each word/letter animates separately
 */
export const SplitTextReveal: React.FC<{
  text: string;
  delay?: number;
  stagger?: number; // frames between each word
  fontSize?: number;
  color?: string;
  highlightWords?: string[];
  highlightColor?: string;
  by?: "word" | "letter";
}> = ({
  text,
  delay = 0,
  stagger = 4,
  fontSize = 48,
  color = COLORS.textPrimary,
  highlightWords = [],
  highlightColor = COLORS.gold,
  by = "word",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const parts = by === "word" ? text.split(" ") : text.split("");

  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: by === "word" ? 12 : 0 }}>
      {parts.map((part, i) => {
        const partDelay = delay + i * stagger;
        const progress = spring({
          frame: frame - partDelay,
          fps,
          config: { damping: 15, stiffness: 200 },
        });

        const isHighlighted = highlightWords.includes(part);
        const y = interpolate(progress, [0, 1], [30, 0]);
        const opacity = Math.min(1, progress * 1.5);
        const rotation = interpolate(progress, [0, 1], [-10, 0]);

        return (
          <span
            key={i}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize,
              fontWeight: isHighlighted ? 700 : 600,
              color: isHighlighted ? highlightColor : color,
              opacity,
              transform: `translateY(${y}px) rotate(${rotation}deg)`,
              display: "inline-block",
              textShadow: isHighlighted ? `0 0 30px ${highlightColor}50` : "none",
            }}
          >
            {part}
            {by === "word" && " "}
          </span>
        );
      })}
    </span>
  );
};

/**
 * Bouncing text - each letter bounces in
 */
export const BouncingText: React.FC<{
  text: string;
  delay?: number;
  fontSize?: number;
  color?: string;
}> = ({ text, delay = 0, fontSize = 64, color = COLORS.textPrimary }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <span style={{ display: "inline-flex" }}>
      {text.split("").map((char, i) => {
        const charDelay = delay + i * 2;
        const bounceProgress = spring({
          frame: frame - charDelay,
          fps,
          config: { damping: 8, stiffness: 300 },
        });

        const y = interpolate(bounceProgress, [0, 1], [-50, 0]);
        const scale = interpolate(bounceProgress, [0, 0.5, 1], [0.5, 1.2, 1]);
        const opacity = Math.min(1, bounceProgress * 2);

        return (
          <span
            key={i}
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize,
              fontWeight: 800,
              color,
              opacity,
              transform: `translateY(${y}px) scale(${scale})`,
              display: "inline-block",
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
};
