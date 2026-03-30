import { useState } from 'react';

const navItems = [
  { label: 'Advantages', href: '#advantages' },
  { label: 'Use Cases', href: '#use-cases' },
  { label: 'Get Started', href: '#cta' },
];

const AgentLogo = () => (
  <a href="#hero" className="flex items-center">
    <img
      src="https://res.cloudinary.com/dom4xx6ky/image/upload/v1774536095/54c47f64-e0e7-484e-9786-93276315e886_rzyktn.png"
      alt="Agentnity"
      className="h-7 sm:h-8 w-auto object-contain"
    />
  </a>
);

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-4 sm:pt-4">
      <nav className="w-full max-w-6xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-lg shadow-black/30">
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between">
          <AgentLogo />

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-gray-400 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <a href="#live-demo" className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2 rounded-full inline-flex">
              Try now
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-gray-400 hover:text-white p-1"
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
          <div className="md:hidden border-t border-white/8 px-4 py-4 flex flex-col gap-4 rounded-b-2xl text-center">
            {navItems.map((item) => (
              <a key={item.label} href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors" onClick={() => setMobileOpen(false)}>
                {item.label}
              </a>
            ))}
            <a href="#live-demo" className="bg-blue-500 hover:bg-blue-600 transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-full w-full inline-flex items-center justify-center" onClick={() => setMobileOpen(false)}>
              Try now
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}
