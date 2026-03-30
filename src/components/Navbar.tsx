import { useState } from 'react';

const AgentLogo = () => (
  <div className="flex items-center gap-2">
    <div className="h-7 w-7 rounded-lg bg-blue-500/15 border border-blue-500/20 flex items-center justify-center text-white text-[11px] font-bold tracking-wide">
      AG
    </div>
    <span className="text-white font-semibold text-sm tracking-tight">
      Agentnity
    </span>
  </div>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 sm:px-6 pt-4">
      <nav className="w-full max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/30">
        <div className="px-5 h-14 flex items-center justify-between">
          <AgentLogo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Solutions', 'AI Agents', 'Pricing', 'Resources'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2 rounded-full">
              Try now
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/8 px-5 py-4 flex flex-col gap-4 rounded-b-2xl">
            {['Solutions', 'AI Agents', 'Pricing', 'Resources'].map((item) => (
              <a key={item} href="#" className="text-sm text-gray-400 hover:text-white transition-colors">
                {item}
              </a>
            ))}
            <button className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2 rounded-full w-fit">
              Try now
            </button>
          </div>
        )}
      </nav>
    </div>
  );
}
