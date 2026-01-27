import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { COLORS } from "../components/Background";
import { snappySpring, strikethroughProgress } from "../lib/animations";

/**
 * Scene 2: The Problem (2-6s) - 120 frames @ 30fps
 *
 * RAPID text sequence:
 * - "Your fund runs on..." (0.3s)
 * - "Spreadsheets" → STRIKE THROUGH
 * - "Email threads" → STRIKE THROUGH
 * - "Manual reconciliation" → STRIKE THROUGH
 * - "That's insane." (hold 0.5s)
 */

interface StrikethroughTextProps {
  text: string;
  frame: number;
  fps: number;
  showDelay: number;
  strikeDelay: number;
  color?: string;
}

const StrikethroughText: React.FC<StrikethroughTextProps> = ({
  text,
  frame,
  fps,
  showDelay,
  strikeDelay,
  color = COLORS.textMuted,
}) => {
  // Text entrance
  const showProgress = snappySpring({ frame, fps, delay: showDelay });
  const textOpacity = Math.min(1, showProgress * 1.5);
  const textY = interpolate(showProgress, [0, 1], [20, 0]);

  // Strikethrough animation
  const strikeWidth = strikethroughProgress({
    frame,
    delay: strikeDelay,
    duration: 8,
  });

  // Fade after strikethrough
  const fadeOpacity = interpolate(
    frame,
    [strikeDelay + 10, strikeDelay + 20],
    [1, 0.4],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        opacity: textOpacity * fadeOpacity,
        transform: `translateY(${textY}px)`,
      }}
    >
      <span
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 52,
          fontWeight: 600,
          color,
          letterSpacing: "-0.01em",
        }}
      >
        {text}
      </span>

      {/* Strikethrough line */}
      <div
        style={{
          position: "absolute",
          top: "52%",
          left: 0,
          width: `${strikeWidth}%`,
          height: 4,
          background: COLORS.error,
          borderRadius: 2,
          boxShadow: `0 0 10px ${COLORS.error}80`,
        }}
      />
    </div>
  );
};

export const ProblemScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "Your fund runs on..." - appears first
  const headerDelay = 0;
  const headerProgress = snappySpring({ frame, fps, delay: headerDelay });
  const headerOpacity = Math.min(1, headerProgress * 1.5);
  const headerY = interpolate(headerProgress, [0, 1], [15, 0]);

  // Header fades when problem words start getting struck
  const headerFade = interpolate(frame, [60, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Timing for strikethrough words
  const words = [
    { text: "Spreadsheets", showDelay: 9, strikeDelay: 22 },
    { text: "Email threads", showDelay: 18, strikeDelay: 35 },
    { text: "Manual reconciliation", showDelay: 28, strikeDelay: 48 },
  ];

  // All words fade out
  const wordsFade = interpolate(frame, [65, 80], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // "That's insane." - punchline
  const punchlineDelay = 70;
  const punchlineProgress = snappySpring({ frame, fps, delay: punchlineDelay });
  const punchlineOpacity = Math.min(1, punchlineProgress * 1.5);
  const punchlineScale = interpolate(punchlineProgress, [0, 1], [0.9, 1]);

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
        padding: 60,
      }}
    >
      {/* "Your fund runs on..." */}
      <p
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 28,
          fontWeight: 400,
          color: COLORS.textSecondary,
          margin: 0,
          marginBottom: 40,
          opacity: headerOpacity * headerFade,
          transform: `translateY(${headerY}px)`,
          letterSpacing: "0.02em",
        }}
      >
        Your fund runs on...
      </p>

      {/* Strikethrough words - stacked vertically */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          opacity: wordsFade,
        }}
      >
        {words.map((word, i) => (
          <StrikethroughText
            key={i}
            text={word.text}
            frame={frame}
            fps={fps}
            showDelay={word.showDelay}
            strikeDelay={word.strikeDelay}
          />
        ))}
      </div>

      {/* "That's insane." - punchline */}
      <h2
        style={{
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          fontSize: 72,
          fontWeight: 700,
          color: COLORS.gold,
          margin: 0,
          marginTop: 50,
          opacity: punchlineOpacity,
          transform: `scale(${punchlineScale})`,
          textShadow: `0 0 60px ${COLORS.gold}50`,
          letterSpacing: "-0.02em",
        }}
      >
        That's insane.
      </h2>
    </div>
  );
};
