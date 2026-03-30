const AgentLogo = () => (
  <a href="#hero" className="flex items-center">
    <img
      src="https://res.cloudinary.com/dom4xx6ky/image/upload/v1774536095/54c47f64-e0e7-484e-9786-93276315e886_rzyktn.png"
      alt="Agentnity"
      className="h-8 w-auto object-contain"
    />
  </a>
);

const footerLinks = {
  Explore: [
    { label: 'Home', href: '#hero' },
    { label: 'Advantages', href: '#advantages' },
  ],
  Solutions: [
    { label: 'Use Cases', href: '#use-cases' },
    { label: 'Live Demo', href: '#live-demo' },
  ],
  GetStarted: [
    { label: 'Next Step', href: '#cta' },
    { label: 'Book Demo', href: '#live-demo' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#080812] border-t border-white/5 px-4 sm:px-6 pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1 flex flex-col gap-4">
            <AgentLogo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">
              Leading multilingual voice AI for education, support, and regional customer
              experience across Bharat.
            </p>
            {/* Address */}
            <div className="mt-2">
              <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest mb-2">
                Address
              </p>
              <p className="text-gray-600 text-xs leading-loose">
                India<br />
                Remote-first<br />
                All voices, all states
              </p>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-3">
              <p className="text-[10px] text-gray-600 font-semibold uppercase tracking-widest">
                {heading}
              </p>
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-gray-500 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-700 text-xs">
            © 2026 Agentnity Voice. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
