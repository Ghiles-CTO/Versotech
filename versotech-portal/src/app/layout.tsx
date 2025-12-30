import type { Metadata } from "next";
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
const themeScript = `
(function() {
  try {
    var pref = localStorage.getItem('verso-theme-preference');
    var resolved = localStorage.getItem('verso-theme-resolved');
    var isDark = pref === 'dark' || (pref === 'auto' && resolved === 'staff-dark') || (!pref && resolved === 'staff-dark');
    if (isDark) {
      document.documentElement.classList.add('staff-dark');
      document.documentElement.style.colorScheme = 'dark';
      // Also set the CSS variable that Tailwind uses for bg-background
      // This ensures even if Tailwind loads before our class is processed,
      // the variable already has the dark value
      document.documentElement.style.setProperty('--background', '0 0% 3.9%');
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
