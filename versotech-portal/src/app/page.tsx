'use client'

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { AuthHandler } from "@/components/auth-handler";
import { 
  Building2, 
  ArrowRight, 
  Shield, 
  Globe, 
  TrendingUp, 
  Users, 
  Activity, 
  CheckCircle,
  ChevronRight,
  LineChart,
  PieChart,
  Lock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NetworkAnimation } from "@/components/network-animation";

// --- Components ---

const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b backdrop-blur-md",
      isScrolled 
        ? "bg-black/80 border-white/10 py-4" 
        : "bg-transparent border-transparent py-6"
    )}>
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-40 h-10">
             <Image 
               src="/versotech-logo.jpg" 
               alt="Verso Logo" 
               fill
               className="object-contain object-left invert" // Invert for dark mode if needed, or use specific dark mode logo
             />
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#expertise" className="text-xs text-zinc-300 hover:text-white transition-colors uppercase tracking-[0.2em] font-medium">Expertise</Link>
          <Link href="#platform" className="text-xs text-zinc-300 hover:text-white transition-colors uppercase tracking-[0.2em] font-medium">Platform</Link>
          <Link href="#portals" className="text-xs text-zinc-300 hover:text-white transition-colors uppercase tracking-[0.2em] font-medium">Access</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/versotech_main/login">
            <Button className="bg-white text-black hover:bg-zinc-200 px-6 rounded-none font-medium tracking-wide transition-all hover:scale-105 shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

const StatCard = ({ value, label, sub }: { value: string, label: string, sub?: string }) => (
  <div className="p-10 border-l border-white/10 hover:border-emerald-500/50 hover:bg-white/[0.02] transition-all duration-500 group hover:-translate-y-1 perspective-[1000px]">
    <h3 className="text-5xl font-light text-white mb-3 group-hover:text-emerald-400 transition-colors tracking-tight transform group-hover:translate-z-10">{value}</h3>
    <p className="text-xs text-zinc-400 uppercase tracking-[0.2em] font-semibold">{label}</p>
    {sub && <p className="text-sm text-zinc-300 mt-2 font-light">{sub}</p>}
  </div>
);

const FeatureItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex gap-6 group p-6 rounded-xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/10 duration-500 hover:-translate-y-1">
    <div className="w-14 h-14 rounded-none bg-zinc-900/80 border border-white/10 flex items-center justify-center shrink-0 group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10 transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]">
      <Icon className="h-6 w-6 text-zinc-300 group-hover:text-emerald-400 transition-colors duration-500 group-hover:scale-110" />
    </div>
    <div>
      <h4 className="text-lg font-medium text-white mb-2 group-hover:text-emerald-400 transition-colors tracking-wide">{title}</h4>
      <p className="text-sm text-zinc-300 leading-relaxed font-normal">{desc}</p>
    </div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Suspense fallback={null}>
        <AuthHandler />
      </Suspense>
      
      <NavBar />

      {/* --- Hero Section --- */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden perspective-[2000px]">
        <NetworkAnimation />
        
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[1000px] h-[1000px] bg-emerald-900/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[150px]" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
        </div>

        <div className="max-w-[1400px] mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 border-l-2 border-emerald-500 bg-gradient-to-r from-emerald-500/10 to-transparent">
              <span className="text-xs font-bold text-emerald-400 tracking-[0.2em] uppercase">System Operational</span>
            </div>
            
            <h1 className="text-7xl lg:text-8xl font-light tracking-tighter text-white leading-[0.95]">
              Automated <br />
              <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400">Alpha.</span>
            </h1>
            
            <p className="text-xl text-zinc-300 font-normal max-w-lg leading-relaxed border-l border-zinc-700 pl-6">
              The definitive operating system for modern private capital. Integrating algorithmic compliance, unified ledgers, and investor relations into a single source of truth.
            </p>

            <div className="flex flex-wrap gap-6 pt-4">
              <Link href="/versotech_main/login">
                <Button className="h-16 px-10 rounded-none bg-white text-black hover:bg-zinc-200 text-base font-bold tracking-wide transition-all hover:translate-x-1 shadow-[0_0_25px_rgba(255,255,255,0.2)] border-2 border-white hover:border-zinc-200">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#platform">
                <Button variant="outline" className="h-16 px-10 rounded-none border-2 border-white/30 text-white bg-black/20 hover:bg-white hover:text-black text-base font-medium tracking-wide transition-all duration-300 backdrop-blur-sm">
                  Explore Platform
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual - 3D/Glass Effect */}
          <div className="relative hidden lg:block animate-in fade-in slide-in-from-right-10 duration-1000 delay-200">
            <div 
              className="relative z-10 bg-zinc-900/80 border border-white/10 backdrop-blur-2xl p-8 shadow-2xl shadow-black/80 transform rotate-y-[-5deg] rotate-x-[2deg] hover:rotate-0 transition-transform duration-1000 group perspective-[1000px]"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur opacity-30 group-hover:opacity-50 transition duration-1000" />
              
              {/* Mock Dashboard UI */}
              <div className="space-y-8 relative transform translate-z-10">
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                  <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-600" />
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase font-semibold">Verso OS // v2.4.0</div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-black/40 border border-white/10 hover:border-emerald-500/40 transition-colors duration-500 group/card">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Total Assets</p>
                    <p className="text-3xl text-white font-light tracking-tight group-hover/card:text-emerald-400 transition-colors">$842,500,000</p>
                    <div className="w-full h-0.5 bg-zinc-800 mt-4 overflow-hidden">
                      <div className="w-[70%] h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                    </div>
                  </div>
                  <div className="p-6 bg-black/40 border border-white/10 hover:border-blue-500/40 transition-colors duration-500 group/card">
                    <p className="text-[10px] text-zinc-400 uppercase tracking-widest mb-2 font-semibold">Active Vehicles</p>
                    <p className="text-3xl text-white font-light tracking-tight group-hover/card:text-blue-400 transition-colors">14</p>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      <span className="text-[10px] text-zinc-300 uppercase tracking-wide font-medium">Live Data</span>
                    </div>
                  </div>
                </div>
                <div className="h-40 bg-gradient-to-b from-emerald-900/10 to-transparent border border-white/10 flex items-end p-1 gap-1 relative overflow-hidden group/chart">
                   <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                   {[40, 60, 45, 70, 50, 80, 65, 85, 75, 90, 60, 75, 50, 80, 95].map((h, i) => (
                     <div 
                       key={i} 
                       style={{ height: `${h}%` }} 
                       className="flex-1 bg-white/10 hover:bg-emerald-500/60 transition-all duration-300 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)]" 
                     />
                   ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Stats Section --- */}
      <section className="border-y border-white/10 bg-zinc-900/30 relative z-20 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          <StatCard value="$840M+" label="Assets Under Management" sub="Across 3 Strategic Verticals" />
          <StatCard value="1958" label="Established" sub="A Heritage of Trust" />
          <StatCard value="14" label="Active Vehicles" sub="Global Capital Allocation" />
          <StatCard value="100%" label="Digital Compliance" sub="Automated Regulatory Checks" />
        </div>
      </section>

      {/* --- Philosophy / About --- */}
      <section id="expertise" className="py-40 max-w-[1400px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-24 items-start">
          <div className="space-y-12 sticky top-32">
            <h2 className="text-5xl md:text-6xl font-light text-white tracking-tighter leading-[1.1]">
              Disciplined Allocation.<br />
              <span className="text-zinc-500">Exponential Growth.</span>
            </h2>
            <p className="text-xl text-zinc-300 leading-relaxed font-normal border-l-2 border-emerald-500 pl-8">
              Verso Holdings operates at the intersection of traditional merchant banking and modern technology. 
              We provide sophisticated administration for complex capital structures, ensuring transparency and efficiency for our limited partners.
            </p>
            <div className="grid grid-cols-1 gap-6 pt-8">
              <div className="flex items-start gap-6 p-6 border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors duration-300">
                <div className="p-3 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <Globe className="h-6 w-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium tracking-wide text-lg">Global Strategy</h4>
                  <p className="text-sm text-zinc-400 mt-2 font-normal leading-relaxed">Diversified investments spanning North America, Europe, and Asia.</p>
                </div>
              </div>
              <div className="flex items-start gap-6 p-6 border border-white/10 bg-zinc-900/20 hover:bg-zinc-900/40 transition-colors duration-300">
                <div className="p-3 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <LineChart className="h-6 w-6 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium tracking-wide text-lg">Diversified Portfolio</h4>
                  <p className="text-sm text-zinc-400 mt-2 font-normal leading-relaxed">Private Equity, Venture Capital, and Real Estate assets.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
             {[
               { title: 'Private Equity', desc: 'Focusing on mature companies with operational improvement potential. Unlocking value through strategic restructuring.', color: 'bg-emerald-500' },
               { title: 'Venture Capital', desc: 'Early-stage funding for disruptive technologies and platforms. Identifyng the unicorns of tomorrow.', color: 'bg-blue-500' },
               { title: 'Real Estate', desc: 'Strategic acquisitions in high-growth urban centers. Developing sustainable, long-term asset value.', color: 'bg-amber-500' }
             ].map((item, i) => (
               <div key={i} className="group p-12 bg-zinc-900/20 border border-white/10 hover:bg-zinc-900/60 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/50">
                 <div className={`w-16 h-16 ${item.color}/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 border border-white/5 group-hover:border-${item.color.replace('bg-', '')}/30`}>
                   <div className={`w-2 h-2 rounded-full ${item.color} shadow-[0_0_10px_currentColor]`} />
                 </div>
                 <h3 className="text-3xl font-light text-white mb-4 tracking-tight group-hover:text-white transition-colors">{item.title}</h3>
                 <p className="text-zinc-400 font-normal leading-relaxed text-lg group-hover:text-zinc-300 transition-colors">{item.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* --- Features --- */}
      <section id="platform" className="py-40 bg-zinc-900/20 border-t border-white/10 relative">
        <div className="max-w-[1400px] mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-32">
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-6 block">The Verso Technology Stack</span>
            <h2 className="text-5xl md:text-6xl font-light text-white mb-8 tracking-tighter">Built for Modern Finance</h2>
            <p className="text-xl text-zinc-300 font-normal">
              Our proprietary platform integrates workflow automation, compliance monitoring, and investor reporting into a single source of truth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureItem 
              icon={Shield} 
              title="Bank-Grade Security" 
              desc="Enterprise-level encryption, multi-factor authentication, and role-based access control protect sensitive financial data." 
            />
            <FeatureItem 
              icon={Activity} 
              title="Automated Compliance" 
              desc="Real-time KYC/AML checks and regulatory reporting workflows ensure adherence to global standards (GDPR, BVI FSC)." 
            />
            <FeatureItem 
              icon={PieChart} 
              title="Transparent Reporting" 
              desc="Investors receive real-time updates on NAV, DPI, TVPI, and capital calls through a dedicated secure portal." 
            />
            <FeatureItem 
              icon={TrendingUp} 
              title="Fee Management" 
              desc="Automated calculation and invoicing of management and performance fees, reducing operational overhead." 
            />
            <FeatureItem 
              icon={Users} 
              title="Investor Relations" 
              desc="Integrated CRM and document center for seamless communication and subscription processing." 
            />
            <FeatureItem 
              icon={Lock} 
              title="Document Vault" 
              desc="Secure, watermarked document storage for subscription agreements, tax forms, and quarterly reports." 
            />
          </div>
        </div>
      </section>

      {/* --- Access CTA --- */}
      <section id="portals" className="py-40 max-w-[1400px] mx-auto px-6">
        <div className="bg-gradient-to-br from-zinc-900 to-black border border-white/10 p-16 md:p-24 text-center relative overflow-hidden group perspective-[1000px]">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05] group-hover:scale-105 transition-transform duration-1000" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50 shadow-[0_0_20px_rgba(16,185,129,0.5)]" />

          <div className="relative z-10 space-y-10 transform transition-transform duration-700 group-hover:translate-z-10">
            <h2 className="text-5xl md:text-6xl font-light text-white tracking-tighter">Access Your Dashboard</h2>
            <p className="text-xl text-zinc-300 font-normal max-w-2xl mx-auto">
              Secure unified portal for all stakeholders. Sign in to access your personalized dashboard.
            </p>

            <div className="flex items-center justify-center pt-8">
              <Link href="/versotech_main/login">
                <Button className="h-20 px-16 bg-white hover:bg-zinc-200 text-black font-bold rounded-none text-lg transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] tracking-wide hover:-translate-y-1 border-2 border-white">
                  Sign In
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="border-t border-white/10 py-20 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-emerald-600" />
            <span className="text-lg font-light tracking-wide text-zinc-400">
              VERSO <span className="font-bold text-zinc-200">HOLDINGS</span>
            </span>
          </div>
          
          <div className="flex gap-12 text-xs uppercase tracking-[0.1em] text-zinc-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>

          <div className="text-xs text-zinc-500 uppercase tracking-widest">
            © 2025 Verso Holdings Ltd.
          </div>
        </div>
      </footer>
    </div>
  );
}
