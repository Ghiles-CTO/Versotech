import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";

// VERSOTECH Brand Colors - Dark Mode Luxury Palette with GOLD accent
// Following the 70/25/5 rule: 70% dark, 25% negative space, 5% gold accent
export const COLORS = {
  // Backgrounds - Pure blacks for luxury feel
  bgPrimary: "#0A0A0A",     // Pure black - main background
  bgSurface: "#0F0F0F",     // Cards and elevated surfaces
  bgElevated: "#171717",    // Highest elevation

  // Accents - GOLD as PRIMARY, Cyan as secondary
  accent: "#D4AF37",        // PRIMARY - gold accent (5% of design)
  gold: "#D4AF37",          // Alias for accent
  goldLight: "#E8C547",     // Highlights
  goldDark: "#B8962F",      // Shadows
  secondary: "#3DBDFF",     // Secondary - cyan (was primary)
  cyan: "#3DBDFF",          // Alias for secondary
  blue: "#0B5FFF",          // Tertiary blue (legacy support)

  // For backwards compatibility
  primary: "#D4AF37",       // Map to gold accent
  primaryHover: "#B8962F",  // Darker gold

  // Text hierarchy
  textPrimary: "#F5F5F5",   // Main headings
  textSecondary: "#9CA3AF", // Subheadings
  textMuted: "#6B7280",     // Tertiary text

  // Status colors
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",

  // Borders
  border: "#2A2A3E",
  borderLight: "#3A3A4E",
};

// Minimal luxury background - pure black with subtle accent glow
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Very subtle pulsing glow (barely noticeable)
  const glowIntensity = interpolate(
    Math.sin(frame * 0.015),
    [-1, 1],
    [0.02, 0.04]
  );

  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        background: COLORS.bgPrimary, // Pure black
        overflow: "hidden",
      }}
    >
      {/* Single subtle central glow orb - gold accent */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 1200,
          height: 1200,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(212, 175, 55, ${glowIntensity}) 0%, transparent 60%)`,
          filter: "blur(100px)",
        }}
      />

      {/* Subtle vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at center, transparent 40%, ${COLORS.bgPrimary} 100%)`,
          opacity: 0.5,
        }}
      />
    </div>
  );
};

export { COLORS as default };
