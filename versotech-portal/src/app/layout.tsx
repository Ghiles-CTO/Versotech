import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, League_Spartan } from "next/font/google";
import "./globals.css";
import { AuthInitWrapper } from "@/components/auth-init-wrapper";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spartanFont = League_Spartan({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-spartan",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VERSO Holdings | Investment Portal",
  description: "Secure investment platform for VERSO Holdings - Access your portfolio, documents, and performance reports",
};

// Viewport configuration for proper mobile scaling
// Note: maximumScale removed to allow pinch-to-zoom (WCAG 2.1 compliance)
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

// Critical CSS to prevent white flash - sets background BEFORE Tailwind loads
// MUST use !important to override Tailwind's bg-background class on body
// MUST set both html AND body backgrounds because:
// - html: immediate paint target
// - body: Tailwind sets bg-background on body which would override html
const criticalStyles = `
  html, body {
    background-color: #fff !important;
  }
  html.staff-dark,
  html.staff-dark body {
    background-color: #0a0a0a !important;
  }
`;

// Theme detection script - runs in <head> BEFORE body paints
// Applies class to <html> element and sets CSS variables immediately
// This runs SYNCHRONOUSLY before any body content renders
// CRITICAL: Must set ALL variables for BOTH themes to prevent race conditions
const themeScript = `
(function() {
  try {
    var pref = localStorage.getItem('verso-theme-preference');
    var resolved = localStorage.getItem('verso-theme-resolved');
    var isDark = pref === 'dark' || (pref === 'auto' && resolved === 'staff-dark') || (!pref && resolved === 'staff-dark');
    var html = document.documentElement;

    // ALL CSS variables for BOTH themes - must match globals.css exactly
    var lightVars = {
      '--background': '0 0% 100%',
      '--foreground': '222.2 84% 4.9%',
      '--card': '0 0% 100%',
      '--card-foreground': '222.2 84% 4.9%',
      '--popover': '0 0% 100%',
      '--popover-foreground': '222.2 84% 4.9%',
      '--primary': '222.2 47.4% 11.2%',
      '--primary-foreground': '210 40% 98%',
      '--secondary': '210 40% 96%',
      '--secondary-foreground': '222.2 47.4% 11.2%',
      '--muted': '210 40% 96%',
      '--muted-foreground': '215.4 16.3% 46.9%',
      '--accent': '210 40% 96%',
      '--accent-foreground': '222.2 47.4% 11.2%',
      '--destructive': '0 84.2% 60.2%',
      '--destructive-foreground': '210 40% 98%',
      '--border': '214.3 31.8% 91.4%',
      '--input': '214.3 31.8% 91.4%',
      '--ring': '222.2 84% 4.9%',
      '--radius': '0.5rem',
      '--chart-1': '12 76% 61%',
      '--chart-2': '173 58% 39%',
      '--chart-3': '197 37% 24%',
      '--chart-4': '43 74% 66%',
      '--chart-5': '27 87% 67%'
    };

    var darkVars = {
      '--background': '0 0% 3.9%',
      '--foreground': '220 14% 96%',
      '--card': '0 0% 6%',
      '--card-foreground': '220 14% 96%',
      '--popover': '0 0% 12%',
      '--popover-foreground': '220 14% 96%',
      '--primary': '210 100% 70%',
      '--primary-foreground': '222.2 47.4% 11.2%',
      '--secondary': '220 12% 18%',
      '--secondary-foreground': '220 14% 88%',
      '--muted': '220 12% 22%',
      '--muted-foreground': '220 15% 72%',
      '--accent': '220 12% 22%',
      '--accent-foreground': '220 14% 94%',
      '--destructive': '0 62.8% 30.6%',
      '--destructive-foreground': '0 0% 98%',
      '--border': '220 12% 18%',
      '--input': '220 12% 18%',
      '--ring': '220 15% 70%',
      '--radius': '0.5rem',
      '--chart-1': '210 90% 56%',
      '--chart-2': '164 85% 60%',
      '--chart-3': '34 95% 62%',
      '--chart-4': '280 75% 65%',
      '--chart-5': '340 80% 60%'
    };

    // ALWAYS set variables - for BOTH themes
    var vars = isDark ? darkVars : lightVars;
    for (var key in vars) {
      html.style.setProperty(key, vars[key]);
    }

    if (isDark) {
      html.classList.add('staff-dark');
      html.style.colorScheme = 'dark';
    } else {
      html.style.colorScheme = 'light';
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Critical styles - inline to avoid FOUC */}
        <style dangerouslySetInnerHTML={{ __html: criticalStyles }} />
        {/* Theme script - runs before body to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spartanFont.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <AuthInitWrapper />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
