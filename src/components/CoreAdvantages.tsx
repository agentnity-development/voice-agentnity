const advantages = [
  {
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    label: '12 Regional Languages',
    desc: 'Hindi to Tamil, Telugu to Bengali, the agent can guide customers in the language they trust most.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: 'Zero Wait Time',
    desc: 'Respond instantly across large call volumes so prospects and customers never sit through dead air.',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    label: 'Accent Adaptive',
    desc: 'Built to work across regional pronunciation, code-switching, and real conversational noise.',
  },
];

export default function CoreAdvantages() {
  return (
    <section id="advantages" className="bg-[#06060f] py-20 sm:py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {/* Label */}
        <p className="text-center text-[10px] text-blue-400 font-semibold uppercase tracking-[0.2em] mb-4">
          Core Advantages
        </p>

        {/* Heading */}
        <h2 className="text-center text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
          Engineered for the Indian Subcontinent
        </h2>
        <p className="text-center text-gray-500 text-sm sm:text-base max-w-xl mx-auto mb-12 sm:mb-16 leading-relaxed">
          Sophisticated voice models that don't just speak. They understand pace, accents,
          multilingual switching, and high-volume support contexts.
        </p>

        {/* Cards */}
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
          {advantages.map(({ icon, label, desc }) => (
            <div
              key={label}
              className="bg-[#0e0e24] border border-white/8 rounded-2xl p-5 sm:p-7 flex flex-col gap-4 items-center sm:items-start text-center sm:text-left hover:border-blue-500/30 hover:bg-[#0d1a2d] transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/15 transition-all">
                {icon}
              </div>
              <h3 className="text-white font-bold text-base">{label}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
