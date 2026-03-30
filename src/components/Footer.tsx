const AgentLogo = () => (
  <a href="#hero" className="flex items-center">
    <img
      src="https://res.cloudinary.com/dom4xx6ky/image/upload/v1774536095/54c47f64-e0e7-484e-9786-93276315e886_rzyktn.png"
      alt="Agentnity"
      className="h-8 w-auto object-contain"
    />
  </a>
);

const footerLinks = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', href: '#hero' },
      { label: 'Widget', href: '#call' },
      { label: 'Advantages', href: '#advantages' },
    ],
  },
  {
    heading: 'Solutions',
    links: [
      { label: 'Use Cases', href: '#use-cases' },
      { label: 'Live Demo', href: '#live-demo' },
    ],
  },
  {
    heading: 'Get Started',
    links: [
      { label: 'Next Step', href: '#cta' },
      { label: 'Book Demo', href: '#live-demo' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#080812] border-t border-white/5 px-4 sm:px-6 pt-12 sm:pt-14 pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-8 sm:gap-10 mb-12">
          {/* Brand */}
          <div className="flex flex-col gap-4 items-center text-center sm:items-start sm:text-left">
            <AgentLogo />
            <p className="text-gray-500 text-sm leading-relaxed max-w-[220px]">
              Leading multilingual voice AI for education, support, and regional customer
              experience across Bharat.
            </p>
            {/* Address */}
            <div className="hidden sm:block mt-2">
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3 max-w-md sm:max-w-none mx-auto sm:mx-0 w-full">
            {footerLinks.map(({ heading, links }, index) => (
              <div key={heading} className={`flex flex-col gap-3 text-center sm:text-left ${index === 2 ? 'hidden sm:flex sm:col-span-1 sm:items-start' : ''}`}>
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
