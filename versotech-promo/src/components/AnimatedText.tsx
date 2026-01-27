import { useCurrentFrame, useVideoConfig, interpolate, spring, Easing } from "remotion";
import { COLORS } from "./Background";

type AnimatedTitleProps = {
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  gradient?: boolean;
  weight?: "300" | "400" | "600" | "700" | "800";
};

export const AnimatedTitle: React.FC<AnimatedTitleProps> = ({
  text,
  delay = 0,
  size = 72,
  color = COLORS.textPrimary,
  gradient = false,
  weight = "700",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entrance = spring({
    frame: frame - delay,
    fps,
    config: { damping: 15, stiffness: 80 },
  });

  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.95, 1]);

  // Updated gradient to use new COLORS
  const gradientStyle = gradient
    ? {
        background: `linear-gradient(135deg, ${COLORS.accent} 0%, ${COLORS.textPrimary} 50%, ${COLORS.gold} 100%)`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
      }
    : { color };

  return (
    <h1
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.02em",
        margin: 0,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        textShadow: gradient ? "none" : `0 0 40px ${color}40`,
        ...gradientStyle,
      }}
    >
      {text}
    </h1>
  );
};

type TypewriterTextProps = {
  text: string;
  delay?: number;
  speed?: number;
  size?: number;
  color?: string;
};

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  speed = 2,
  size = 24,
  color = COLORS.textSecondary,
}) => {
  const frame = useCurrentFrame();

  const adjustedFrame = Math.max(0, frame - delay);
  const charsToShow = Math.floor(adjustedFrame / speed);
  const displayText = text.slice(0, charsToShow);
  const showCursor = adjustedFrame > 0 && Math.floor(adjustedFrame / 15) % 2 === 0;

  return (
    <p
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: size,
        fontWeight: "400",
        color,
        margin: 0,
        letterSpacing: "0.02em",
      }}
    >
      {displayText}
      {showCursor && charsToShow < text.length && (
        <span style={{ color: COLORS.accent }}>|</span>
      )}
    </p>
  );
};

type FadeInTextProps = {
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  weight?: "300" | "400" | "600" | "700" | "800";
  maxWidth?: number;
  align?: "left" | "center" | "right";
};

export const FadeInText: React.FC<FadeInTextProps> = ({
  text,
  delay = 0,
  size = 20,
  color = COLORS.textSecondary,
  weight = "400",
  maxWidth,
  align = "center",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = interpolate(frame - delay, [0, fps * 0.5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const translateY = interpolate(frame - delay, [0, fps * 0.5], [20, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  return (
    <p
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: size,
        fontWeight: weight,
        color,
        margin: 0,
        opacity,
        transform: `translateY(${translateY}px)`,
        maxWidth,
        textAlign: align,
        lineHeight: 1.6,
      }}
    >
      {text}
    </p>
  );
};

type CountUpNumberProps = {
  target: number;
  delay?: number;
  duration?: number;
  size?: number;
  prefix?: string;
  suffix?: string;
  color?: string;
};

export const CountUpNumber: React.FC<CountUpNumberProps> = ({
  target,
  delay = 0,
  duration = 60,
  size = 64,
  prefix = "",
  suffix = "",
  color = COLORS.accent,
}) => {
  const frame = useCurrentFrame();

  const progress = interpolate(frame - delay, [0, duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });

  const currentValue = Math.floor(progress * target);

  const opacity = interpolate(frame - delay, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <span
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        fontSize: size,
        fontWeight: "800",
        color,
        opacity,
        textShadow: `0 0 30px ${color}60`,
      }}
    >
      {prefix}
      {currentValue.toLocaleString()}
      {suffix}
    </span>
  );
};
