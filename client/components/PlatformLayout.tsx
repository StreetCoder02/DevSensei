import { Link } from "react-router-dom";
import { ReactNode, useEffect, useState } from "react";
import { DevSenseiLogo } from "@/components/DevSenseiLogo";
import { Trophy } from "lucide-react";
import { ProgressModal } from "@/components/ProgressModal";

interface PlatformLayoutProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PlatformLayout({
  title,
  description,
  children,
}: PlatformLayoutProps) {
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} — DevSensei`;
  }, [title]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0d0d0d] border-b border-[#1f1f1f] h-14 flex items-center">
        <div className="w-full px-6 flex items-center relative">
          <Link 
            to="/" 
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-red-900/40 text-red-400 hover:bg-red-950/30 hover:border-red-600/60 transition-all text-sm font-medium z-10"
          >
            ← Back
          </Link>
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <DevSenseiLogo size={24} />
            <span className="text-white font-semibold tracking-tight hidden sm:inline">
              <span>Dev<span className="text-red-500">Sensei</span></span>
            </span>
          </div>
          
          <button 
            onClick={() => setIsStatsOpen(true)}
            className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-md text-red-400 hover:text-red-300 hover:bg-[#1a1a1a] transition-all text-sm font-medium z-10"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">Progress</span>
          </button>
        </div>
      </header>

      {/* Main Content Wrapper */}
      <main className="flex-grow w-full">
        <div className="max-w-3xl mx-auto px-6">
          
          {/* Title Section */}
          <section className="pt-12 pb-8 text-center">
            <h1 className="text-3xl font-bold text-white tracking-tight">
              {title}
            </h1>
            <div className="w-10 h-0.5 bg-red-600 mx-auto mt-3 mb-4 rounded-full" />
            <p className="text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          </section>

          {/* Children / Feature Content */}
          {children}
          
          {!children && (
            <div className="bg-[#111] rounded-xl border border-dashed border-[#222] p-12 text-center mt-8">
              <h2 className="text-xl font-semibold text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-zinc-500 mb-6 text-sm">
                This module is currently under construction.
              </p>
              <Link 
                to="/" 
                className="border border-red-900/50 text-red-400 hover:bg-red-950/40 hover:border-red-500/60 px-4 py-2 rounded-md text-sm font-medium transition-all inline-block"
              >
                Return Home
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1a1a1a] py-5 mt-16 text-center text-xs text-zinc-600">
        DevSensei © 2025 · Built by Aniruddha
      </footer>

      <ProgressModal isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
    </div>
  );
}
