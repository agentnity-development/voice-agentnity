export default function CTA() {
  return (
    <section className="bg-[#06060f] py-24 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative rounded-3xl border border-white/10 bg-[#0e0e24] overflow-hidden p-10 sm:p-14 text-center">
          {/* Glow blobs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10">
            <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-[0.2em] mb-4">
              Take the Next Step
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5 max-w-2xl mx-auto">
              Ready to transform your customer experience?
            </h2>
            <p className="text-gray-500 text-base max-w-lg mx-auto mb-10 leading-relaxed">
              Join the regional leaders already testing intelligent multilingual voice experiences
              for support and admissions.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 transition-all text-white font-semibold text-sm px-7 py-3.5 rounded-full shadow-lg shadow-blue-500/25">
                Book Product Demo
              </button>
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white font-semibold text-sm px-7 py-3.5 rounded-full">
                Speak to an Expert
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
