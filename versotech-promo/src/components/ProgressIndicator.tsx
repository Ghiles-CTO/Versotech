import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
} from "remotion";
import { COLORS } from "./Background";

type StageStatus = "completed" | "active" | "upcoming";

type Stage = {
  label: string;
  status: StageStatus;
};

type ProgressIndicatorProps = {
  stages: Stage[];
  delay?: number;
  animateThrough?: boolean; // Auto-advance through stages
  animationDuration?: number; // Frames per stage when animating
  position?: "top" | "bottom"; // Position relative to content
  accentColor?: "gold" | "cyan";
};

/**
 * ProgressIndicator - Horizontal stage pipeline visualization
 *
 * Shows deal/subscription lifecycle stages with animated progression.
 * Features:
 * - Connected dots with fill animation
 * - Stage labels below dots
 * - Active stage glows cyan/gold
 * - Optional auto-progression animation
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  stages,
  delay = 0,
  animateThrough = false,
  animationDuration = 45, // 1.5s per stage @ 30fps
  position = "top",
  accentColor = "gold",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const adjustedFrame = frame - delay;

  // Color based on accent
  const color = accentColor === "cyan" ? COLORS.cyan : COLORS.gold;

  // Entrance animation
  const entrance = spring({
    frame: adjustedFrame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });

  const entranceOpacity = interpolate(entrance, [0, 1], [0, 1]);
  const entranceY = interpolate(entrance, [0, 1], [position === "top" ? -15 : 15, 0]);

  // Calculate which stage is active when animating
  let animatedStages = stages;
  if (animateThrough && adjustedFrame > 0) {
    const totalAnimationFrames = stages.length * animationDuration;
    const progress = Math.min(adjustedFrame / totalAnimationFrames, 1);
    const currentStageIndex = Math.floor(progress * stages.length);

    animatedStages = stages.map((stage, index) => {
      if (index < currentStageIndex) {
        return { ...stage, status: "completed" as StageStatus };
      } else if (index === currentStageIndex) {
        return { ...stage, status: "active" as StageStatus };
      } else {
        return { ...stage, status: "upcoming" as StageStatus };
      }
    });
  }

  // Don't render before delay
  if (adjustedFrame < 0) {
    return null;
  }

  // Calculate layout
  const dotSize = 12;
  const spacing = 120; // Space between dots
  const totalWidth = (stages.length - 1) * spacing;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
        marginTop: position === "top" ? 0 : 20,
        marginBottom: position === "bottom" ? 0 : 20,
      }}
    >
      {/* Progress bar container */}
      <div
        style={{
          position: "relative",
          width: totalWidth + dotSize,
          height: dotSize + 40, // Room for labels
        }}
      >
        {/* Connecting lines */}
        {animatedStages.slice(0, -1).map((stage, index) => {
          const nextStage = animatedStages[index + 1];
          const isCompleted = stage.status === "completed";
          const lineX = index * spacing + dotSize / 2;

          // Line fill animation when transitioning
          let fillProgress = isCompleted ? 1 : 0;
          if (animateThrough) {
            const stageStartFrame = index * animationDuration;
            const stageEndFrame = (index + 1) * animationDuration;
            fillProgress = interpolate(
              adjustedFrame,
              [stageStartFrame, stageEndFrame],
              [0, 1],
              {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
                easing: Easing.inOut(Easing.quad),
              }
            );
          }

          return (
            <div key={`line-${index}`}>
              {/* Background line */}
              <div
                style={{
                  position: "absolute",
                  left: lineX,
                  top: dotSize / 2 - 1,
                  width: spacing,
                  height: 2,
                  background: COLORS.border,
                  borderRadius: 1,
                }}
              />

              {/* Fill line */}
              <div
                style={{
                  position: "absolute",
                  left: lineX,
                  top: dotSize / 2 - 1,
                  width: spacing * fillProgress,
                  height: 2,
                  background: color,
                  borderRadius: 1,
                  boxShadow: isCompleted ? `0 0 8px ${color}60` : "none",
                }}
              />
            </div>
          );
        })}

        {/* Stage dots and labels */}
        {animatedStages.map((stage, index) => {
          const isCompleted = stage.status === "completed";
          const isActive = stage.status === "active";
          const dotX = index * spacing;

          // Glow pulse for active stage
          const glowPulse = isActive
            ? interpolate(Math.sin(adjustedFrame * 0.1), [-1, 1], [0.4, 0.8])
            : 0;

          // Scale pulse for active stage
          const scalePulse = isActive
            ? 1 + Math.sin(adjustedFrame * 0.08) * 0.1
            : 1;

          // Staggered entrance for each dot
          const dotEntrance = spring({
            frame: adjustedFrame - index * 5,
            fps,
            config: { damping: 20, stiffness: 150 },
          });

          return (
            <div
              key={`stage-${index}`}
              style={{
                position: "absolute",
                left: dotX,
                top: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                opacity: dotEntrance,
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  background: isCompleted || isActive ? color : COLORS.bgElevated,
                  border: `2px solid ${isCompleted || isActive ? color : COLORS.border}`,
                  transform: `scale(${scalePulse})`,
                  boxShadow: isActive
                    ? `0 0 15px ${color}${Math.round(glowPulse * 255).toString(16).padStart(2, '0')}`
                    : isCompleted
                    ? `0 0 8px ${color}40`
                    : "none",
                  transition: "none",
                }}
              >
                {/* Checkmark for completed */}
                {isCompleted && (
                  <svg
                    width={dotSize - 4}
                    height={dotSize - 4}
                    viewBox="0 0 12 12"
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 2,
                    }}
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      fill="none"
                      stroke={COLORS.bgPrimary}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  marginTop: 8,
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: 11,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? color : isCompleted ? COLORS.textSecondary : COLORS.textMuted,
                  letterSpacing: "0.02em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
