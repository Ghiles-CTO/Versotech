/**
 * Design Tokens - Institutional Finance UI
 *
 * Professional color palette and design system for
 * private equity/investment banking document management.
 *
 * Philosophy: Refined precision, authoritative presence,
 * sophisticated monochrome with strategic accents.
 */

export const DESIGN_TOKENS = {
  // Color Palette - Institutional Slate & Navy
  colors: {
    // Neutrals - Foundation (Slate)
    slate: {
      950: '#020617', // Deep background (dark mode)
      900: '#0f172a', // Surface dark
      800: '#1e293b', // Elevated surface
      700: '#334155', // Strong borders
      600: '#475569', // Muted borders
      500: '#64748b', // Muted text
      400: '#94a3b8', // Subtle text
      300: '#cbd5e1', // Disabled
      200: '#e2e8f0', // Light borders
      100: '#f1f5f9', // Light surface
      50: '#f8fafc',  // Background (light mode)
    },

    // Primary - Authority & Trust (Navy Blue)
    navy: {
      950: '#172554', // Deep institutional blue
      900: '#1e3a8a', // Primary dark
      800: '#1e40af', // Primary
      700: '#1d4ed8', // Primary hover
      600: '#2563eb', // Active state
      500: '#3b82f6', // Bright accent
      100: '#dbeafe', // Subtle highlight
      50: '#eff6ff',  // Pale highlight
    },

    // Semantic Colors (Muted, Professional)
    semantic: {
      success: '#047857',    // Emerald 700 - Approval, complete
      warning: '#b45309',    // Amber 700 - Pending, caution
      error: '#b91c1c',      // Red 700 - Critical, delete
      info: '#0369a1',       // Sky 700 - Information
    },
  },

  // Spacing Scale (4px base)
  spacing: {
    xs: '0.25rem',   // 4px - Tight spacing
    sm: '0.5rem',    // 8px - Compact elements
    md: '0.75rem',   // 12px - Standard gap
    lg: '1rem',      // 16px - Section spacing
    xl: '1.5rem',    // 24px - Large gaps
    '2xl': '2rem',   // 32px - Major sections
    '3xl': '3rem',   // 48px - Page sections
  },

  // Border Radius (Subtle, Professional)
  radius: {
    sm: '0.375rem',  // 6px - Buttons, inputs
    md: '0.5rem',    // 8px - Cards
    lg: '0.75rem',   // 12px - Modals
    xl: '1rem',      // 16px - Large surfaces
    full: '9999px',  // Pills, badges
  },

  // Shadows (Soft, Refined)
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.02)',
    md: '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.06)',
    lg: '0 4px 6px -2px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.08)',
    xl: '0 10px 25px -5px rgb(0 0 0 / 0.08), 0 20px 25px -5px rgb(0 0 0 / 0.06)',
  },

  // Typography Scale
  fontSize: {
    xs: '0.75rem',    // 12px - Captions, metadata
    sm: '0.875rem',   // 14px - Body small, labels
    base: '0.9375rem', // 15px - Body text
    lg: '1rem',       // 16px - Emphasized body
    xl: '1.125rem',   // 18px - Subheadings
    '2xl': '1.5rem',  // 24px - Headings
    '3xl': '2rem',    // 32px - Page titles
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Transitions (Precise, Responsive)
  transition: {
    fast: '120ms cubic-bezier(0.4, 0, 0.2, 1)',      // Quick feedback
    base: '180ms cubic-bezier(0.4, 0, 0.2, 1)',      // Standard
    smooth: '250ms cubic-bezier(0.4, 0, 0.2, 1)',    // Smooth animations
    slow: '350ms cubic-bezier(0.4, 0, 0.2, 1)',      // Deliberate
  },

  // Z-index Layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    drawer: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
  },
} as const

/**
 * Folder Icon Colors (Subtle, Professional Variants)
 */
export const FOLDER_ICON_COLORS = {
  vehicle_root: {
    bg: 'bg-navy-50',
    border: 'border-navy-200',
    icon: 'text-navy-700',
    hoverBg: 'group-hover:bg-navy-100',
    hoverBorder: 'group-hover:border-navy-300',
  },
  category: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-600',
    hoverBg: 'group-hover:bg-slate-100',
    hoverBorder: 'group-hover:border-slate-300',
  },
  custom: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    icon: 'text-slate-500',
    hoverBg: 'group-hover:bg-slate-100',
    hoverBorder: 'group-hover:border-slate-300',
  },
} as const

/**
 * Document Type Colors (Professional Semantic Coding)
 */
export const DOCUMENT_TYPE_COLORS = {
  Agreement: {
    badge: 'bg-navy-100 text-navy-800 border-navy-200',
    icon: 'text-navy-600',
  },
  Subscription: {
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    icon: 'text-emerald-600',
  },
  KYC: {
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: 'text-amber-600',
  },
  Statement: {
    badge: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: 'text-slate-600',
  },
  NDA: {
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    icon: 'text-purple-600',
  },
  Report: {
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    icon: 'text-blue-600',
  },
  Tax: {
    badge: 'bg-orange-50 text-orange-800 border-orange-200',
    icon: 'text-orange-600',
  },
  Legal: {
    badge: 'bg-red-50 text-red-800 border-red-200',
    icon: 'text-red-600',
  },
  Other: {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: 'text-slate-500',
  },
} as const

/**
 * Grid Layout Constants
 */
export const GRID_CONSTANTS = {
  // Responsive column counts
  columns: {
    mobile: 1,
    tablet: 2,
    desktop: 3,
    wide: 4,
  },

  // Item sizing
  minCardWidth: '240px',
  maxCardWidth: '320px',
  cardHeight: 'auto',

  // Spacing
  gap: DESIGN_TOKENS.spacing.lg,
  padding: DESIGN_TOKENS.spacing.xl,
} as const

/**
 * Animation Presets (Subtle, Professional)
 */
export const ANIMATIONS = {
  // Fade in with slight upward movement
  fadeInUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },

  // Scale in (for modals, drawers)
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] },
  },

  // Slide in from right (for drawers)
  slideInRight: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' },
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
  },
} as const

/**
 * Utility function to generate consistent hover states
 */
export const hoverStates = {
  card: 'hover:shadow-md hover:border-slate-300 transition-all duration-180',
  button: 'hover:bg-opacity-90 active:scale-[0.98] transition-all duration-120',
  link: 'hover:text-navy-700 transition-colors duration-150',
} as const
