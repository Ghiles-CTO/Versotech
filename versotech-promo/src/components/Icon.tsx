import React from "react";

// Lucide-style SVG icon paths (24x24 viewBox, strokeWidth 2)
const iconPaths: Record<string, string> = {
  // Deal & Business Icons
  briefcase: "M8 21v-4a4 4 0 0 1 8 0v4M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5z M3 9h18",
  "bar-chart-3": "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  receipt: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8 M12 17V7",
  "pen-tool": "M12 19l7-7 3 3-7 7-3-3z M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z M2 2l7.586 7.586 M11 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0z",

  // Problem Scene Icons
  "file-spreadsheet": "M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z M14 2v6h6 M8 13h2 M14 13h2 M8 17h2 M14 17h2",
  calculator: "M4 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z M4 6h16 M8 14h.01 M12 14h.01 M16 14h.01 M8 18h.01 M12 18h.01 M16 18h.01 M8 10h.01 M12 10h.01 M16 10h.01",
  "clipboard-list": "M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2 M16 4h2a2 2 0 0 1 2 2v1M8 4H6a2 2 0 0 0-2 2v1 M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z M12 11h4 M12 16h4 M8 11h.01 M8 16h.01",
  clock: "M12 12V9 M12 12l3 3 M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z",

  // Commission Scene Icons
  handshake: "M11 17a4 4 0 0 0 4 4h6 M7 7h6a4 4 0 0 1 4 4v2a2 2 0 0 1-2 2h-3 M7 7l4-4 M15 11l4 4 M7 17h4 M7 17v-6a4 4 0 0 1 4-4",
  users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
  "building-2": "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18 M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2 M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2 M10 6h4 M10 10h4 M10 14h4 M10 18h4",

  // Feature Scene Icons (alternative representations)
  target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  "dollar-sign": "M12 2v20 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  "line-chart": "M3 3v18h18 M18.7 8l-5.1 5.2-2.8-2.7L7 14.3",
  "file-signature": "M20 19.5v.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8.5L18 5.5 M14 2v4a2 2 0 0 0 2 2h4 M12 18l6.2-6.2c.6-.6.6-1.5 0-2.1-.6-.6-1.5-.6-2.1 0L10 16l-3 1 1-3 6-6",

  // Trending & Status
  "trending-up": "M22 7l-8.5 8.5-5-5L2 17 M16 7h6v6",
  check: "M20 6L9 17l-5-5",
  "check-circle": "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M9 12l2 2 4-4",

  // Layout & Navigation
  "layout-dashboard": "M3 3h7v9H3V3z M14 3h7v5h-7V3z M14 12h7v9h-7v-9z M3 16h7v5H3v-5z",
  workflow: "M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9",

  // Money & Finance
  "coins": "M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M12 16a4 4 0 1 0 0 8 4 4 0 0 0 0-8z M18.1 10a4 4 0 1 0 .1 8 4 4 0 0 0-.1-8z",
  wallet: "M17 14h.01 M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a4 4 0 0 1-4-4V6a2 2 0 0 1 2-2h14",
};

type IconName = keyof typeof iconPaths;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  style = {},
}) => {
  const path = iconPaths[name];

  if (!path) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      <path d={path} />
    </svg>
  );
};

// Export icon names for TypeScript autocompletion
export type { IconName };
export const iconNames = Object.keys(iconPaths) as IconName[];
