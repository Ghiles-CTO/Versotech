import { useCurrentFrame, useVideoConfig, Img, staticFile, interpolate } from "remotion";
import { COLORS } from "../components/Background";
import { stackedCardPosition, snappySpring } from "../lib/animations";

/**
 * Scene 6: The Stack (36-42s) - 180 frames @ 30fps
 *
 * Screenshots stack/fan out showing breadth:
 * - 3-4 screenshots visible at once, layered
 * - Text: "Fund admin. Investor portal. Deal flow. Commissions. One system."
 */

export const StackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Screenshots to stack
  const screenshots = [
    "admin dashboard.png",
    "investor portfolio dashboard.png",
    "deal management.png",
    "introducer commissions.png",
  ];

  // Calculate card positions
  const cards = screenshots.map((src, index) => ({
    src,
    ...stackedCardPosition({
      index,
      total: screenshots.length,
      frame,
      fps,
      delay: 0,
    }),
  }));

  // Text elements entrance
  const textParts = [
    { text: "Fund admin.", delay: 40 },
    { text: "Investor portal.", delay: 50 },
    { text: "Deal flow.", delay: 60 },
    { text: "Commissions.", delay: 70 },
    { text: "One system.", delay: 85, highlight: true },
  ];

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
      {/* Stacked cards */}
      <div
        style={{
          position: "relative",
          width: 1000,
          height: 500,
          marginBottom: 40,
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 700,
              height: 400,
              borderRadius: 12,
              overflow: "hidden",
              background: COLORS.bgSurface,
              border: `1px solid ${COLORS.border}`,
              boxShadow: `
                0 20px 60px rgba(0, 0, 0, 0.5),
                0 0 40px ${COLORS.gold}10
              `,
              opacity: card.opacity,
              transform: `
                translate(-50%, -50%)
                translateX(${card.x}px)
                translateY(${card.y}px)
                rotate(${card.rotation}deg)
                scale(${card.scale})
              `,
              zIndex: card.zIndex,
            }}
          >
            <Img
              src={staticFile(card.src)}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top left",
              }}
            />
          </div>
        ))}
      </div>

      {/* Text row */}
      <div
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: 1200,
        }}
      >
        {textParts.map((part, index) => {
          const progress = snappySpring({ frame, fps, delay: part.delay });
          const opacity = Math.min(1, progress * 1.5);
          const y = interpolate(progress, [0, 1], [15, 0]);

          return (
            <span
              key={index}
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: part.highlight ? 36 : 28,
                fontWeight: part.highlight ? 700 : 500,
                color: part.highlight ? COLORS.gold : COLORS.textSecondary,
                opacity,
                transform: `translateY(${y}px)`,
                textShadow: part.highlight ? `0 0 40px ${COLORS.gold}50` : "none",
              }}
            >
              {part.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
