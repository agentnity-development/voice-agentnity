const cases = [
  {
    id: 'edtech',
    label: 'Indian Universities & EdTech',
    sublabel: 'Admissions',
    img: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&q=85',
  },
  {
    id: 'gcc',
    label: 'GCCs & Unicorns',
    sublabel: 'Enterprise Tech',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=900&q=85',
  },
  {
    id: 'enterprise',
    label: 'Enterprise Customer Success',
    sublabel: 'Support & CX',
    img: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1400&q=85',
  },
];

export default function UseCases() {
  return (
    <section id="use-cases" className="bg-[#080812] py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-[10px] text-blue-400 font-semibold uppercase tracking-[0.2em] mb-3">
          Use Cases at Scale
        </p>
        <h2 className="text-center text-3xl sm:text-4xl lg:text-[2.8rem] font-extrabold text-white leading-tight mb-3">
          Built for Bharat's Scale
        </h2>
        <p className="text-center text-gray-600 text-[15px] max-w-lg mx-auto mb-3 leading-relaxed">
          Specialized voice journeys for admissions, support, and high-volume operational teams.
        </p>
        <div className="flex justify-center mb-10">
          <a href="#live-demo" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 transition-colors">
            See live scenarios
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cases.slice(0, 2).map((c) => (
            <UseCaseCard key={c.id} {...c} />
          ))}
          <div className="sm:col-span-2">
            <UseCaseCard {...cases[2]} wide />
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({
  label,
  sublabel,
  img,
  wide = false,
}: {
  label: string;
  sublabel?: string;
  img: string;
  wide?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl group cursor-pointer ${wide ? 'h-72' : 'h-64'}`}>
      {/* Image */}
      <img
        src={img}
        alt={label}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* Dark gradient — strong at bottom, clear at top */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />

      {/* Subtle blue tint on hover */}
      <div className="absolute inset-0 bg-blue-900/0 group-hover:bg-blue-900/20 transition-all duration-500" />

      {/* Border ring */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-blue-500/30 transition-all duration-300" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6">
        {sublabel && (
          <span className="inline-block text-[9px] text-blue-300 font-bold uppercase tracking-[0.25em] mb-2.5 bg-blue-500/15 border border-blue-400/20 rounded-full px-2.5 py-1">
            {sublabel}
          </span>
        )}
        <h3 className="text-white font-bold text-lg leading-snug">{label}</h3>
      </div>
    </div>
  );
}
