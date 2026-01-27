import {
  useCurrentFrame,
  useVideoConfig,
  Img,
  staticFile,
  interpolate,
  Sequence,
} from "remotion";
import { COLORS } from "../components/Background";
import { fastSpring, subtleZoom, snappySpring } from "../lib/animations";
import { Particles } from "../components/Particles";
import { WipeTransition, FlashEffect } from "../components/GlitchEffect";

/**
 * Scene 4: Feature Barrage (10-30s) - 600 frames @ 30fps
 *
 * ENHANCED VERSION:
 * - Wipe transitions between slides
 * - Progress indicator
 * - Floating particles
 * - Corner badges
 * - More dynamic text animations
 */

interface FeatureSlideProps {
  screenshot: string;
  headline: string;
  badge?: string;
  duration: number;
  index: number;
  total: number;
}

const FeatureSlide: React.FC<FeatureSlideProps> = ({
  screenshot,
  headline,
  badge,
  duration,
  index,
  total,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Fast entrance with parallax
  const entranceProgress = fastSpring({ frame, fps, delay: 0 });
  const screenshotOpacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  const screenshotScale = interpolate(entranceProgress, [0, 1], [1.1, 1]); // Zoom OUT
  const screenshotX = interpolate(entranceProgress, [0, 1], [60, 0]);

  // Continuous Ken Burns effect
  const kenBurnsX = interpolate(frame, [0, duration], [0, -20], { extrapolateRight: "clamp" });
  const kenBurnsY = interpolate(frame, [0, duration], [0, -10], { extrapolateRight: "clamp" });
  const kenBurnsScale = subtleZoom({
    frame: Math.max(0, frame - 8),
    startScale: 1,
    endScale: 1.06,
    duration: duration - 8,
  });

  // Text entrance - slide up with words
  const textDelay = 6;
  const textProgress = snappySpring({ frame, fps, delay: textDelay });
  const textOpacity = Math.min(1, textProgress * 1.5);
  const textY = interpolate(textProgress, [0, 1], [40, 0]);
  const textScale = interpolate(textProgress, [0, 1], [0.9, 1]);

  // Badge entrance
  const badgeDelay = 12;
  const badgeProgress = snappySpring({ frame, fps, delay: badgeDelay });
  const badgeOpacity = badge ? Math.min(1, badgeProgress * 1.5) : 0;

  // Progress bar
  const progressWidth = ((index + 1) / total) * 100;
  const progressAnim = interpolate(frame, [0, 15], [0, progressWidth], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Exit fade (last 4 frames)
  const exitFade = interpolate(
    frame,
    [duration - 4, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Glow color cycles
  const glowHue = (index * 40) % 60; // Slight variation in gold

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
        opacity: exitFade,
      }}
    >
      {/* Floating particles */}
      <Particles count={25} color={COLORS.gold} speed={0.3} opacity={{ min: 0.05, max: 0.15 }} />

      {/* Flash on entrance */}
      <FlashEffect startFrame={0} duration={4} color={`${COLORS.gold}40`} />

      {/* Screenshot */}
      <div
        style={{
          position: "relative",
          opacity: screenshotOpacity,
          transform: `translateX(${screenshotX}px) scale(${screenshotScale})`,
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            inset: -50,
            borderRadius: 24,
            background: `radial-gradient(ellipse at center, ${COLORS.gold}20 0%, transparent 70%)`,
            filter: "blur(40px)",
            zIndex: -1,
          }}
        />

        {/* Frame with Ken Burns */}
        <div
          style={{
            width: 1250,
            height: 650,
            borderRadius: 14,
            overflow: "hidden",
            background: COLORS.bgSurface,
            border: `1px solid ${COLORS.border}`,
            boxShadow: `
              0 25px 80px rgba(0, 0, 0, 0.6),
              0 0 60px ${COLORS.gold}15,
              inset 0 0 0 1px rgba(255,255,255,0.05)
            `,
          }}
        >
          <div
            style={{
              width: "110%",
              height: "110%",
              transform: `translate(${kenBurnsX}px, ${kenBurnsY}px) scale(${kenBurnsScale})`,
            }}
          >
            <Img
              src={staticFile(screenshot)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top left",
              }}
            />
          </div>
        </div>

        {/* Corner badge */}
        {badge && (
          <div
            style={{
              position: "absolute",
              top: -10,
              right: -10,
              background: COLORS.gold,
              color: COLORS.bgPrimary,
              padding: "8px 16px",
              borderRadius: 8,
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.05em",
              opacity: badgeOpacity,
              transform: `scale(${badgeProgress})`,
              boxShadow: `0 4px 20px ${COLORS.gold}60`,
            }}
          >
            {badge}
          </div>
        )}
      </div>

      {/* Kinetic text */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          opacity: textOpacity,
          transform: `translateY(${textY}px) scale(${textScale})`,
        }}
      >
        <h3
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            fontSize: 46,
            fontWeight: 700,
            color: COLORS.textPrimary,
            margin: 0,
            textAlign: "center",
            textShadow: `0 4px 30px rgba(0, 0, 0, 0.9)`,
            letterSpacing: "-0.01em",
          }}
        >
          {headline}
        </h3>
      </div>

      {/* Progress indicator */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          width: 200,
          height: 3,
          background: `${COLORS.border}`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progressAnim}%`,
            height: "100%",
            background: COLORS.gold,
            boxShadow: `0 0 10px ${COLORS.gold}`,
            transition: "width 0.1s ease-out",
          }}
        />
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          right: 60,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: COLORS.textMuted,
          opacity: textOpacity * 0.7,
        }}
      >
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </div>
    </div>
  );
};

export const FeatureBarrageScene: React.FC = () => {
  // Feature slides configuration - 7 slides, faster pacing
  const slides = [
    {
      screenshot: "deal management.png",
      headline: "Anthropic. SpaceX. Perplexity.",
      badge: "TIER-1 DEALS",
      duration: 80,
    },
    {
      screenshot: "investor portfolio dashboard.png",
      headline: "$2M tracked. 1.15x TVPI.",
      badge: "PORTFOLIO",
      duration: 80,
    },
    {
      screenshot: "investor investment opportunities.png",
      headline: "Subscribe in clicks, not weeks.",
      badge: "WORKFLOW",
      duration: 80,
    },
    {
      screenshot: "arranger dashboard.png",
      headline: "Every arranger. Every deal.",
      badge: "ARRANGERS",
      duration: 80,
    },
    {
      screenshot: "fees management and report.png",
      headline: "$4M+ in fees. Calculated.",
      badge: "FEE ENGINE",
      duration: 80,
    },
    {
      screenshot: "introducer commissions.png",
      headline: "Commissions. Automatic.",
      badge: "COMMISSIONS",
      duration: 80,
    },
    {
      screenshot: "investor dashboard.png",
      headline: "Your investors see this.",
      badge: "INVESTOR VIEW",
      duration: 60,
    },
  ];

  const total = slides.length;
  let cumulativeFrame = 0;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {slides.map((slide, index) => {
        const startFrame = cumulativeFrame;
        cumulativeFrame += slide.duration;

        return (
          <Sequence
            key={index}
            from={startFrame}
            durationInFrames={slide.duration}
          >
            <FeatureSlide
              screenshot={slide.screenshot}
              headline={slide.headline}
              badge={slide.badge}
              duration={slide.duration}
              index={index}
              total={total}
            />
            {/* Wipe transition at end of each slide (except last) */}
            {index < total - 1 && (
              <WipeTransition
                startFrame={slide.duration - 8}
                duration={10}
                direction="right"
                color={COLORS.gold}
              />
            )}
          </Sequence>
        );
      })}
    </div>
  );
};
