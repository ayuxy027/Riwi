import { Link } from "react-router-dom";

const CTA = () => {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden bg-[#6E54FF] rounded-[2.5rem] px-6 py-16 sm:px-16 sm:py-24 lg:py-28 shadow-2xl shadow-[#6E54FF]/40 text-center">
          {/* Decorative background grid/glow */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-50"></div>
            <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-purple-900 via-transparent to-transparent opacity-50"></div>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-8 animate-fade-in-up">
              Ready to verify the web?
            </h2>
            <p className="text-xl text-purple-100 mb-12 animate-fade-in-up font-medium leading-relaxed">
              Join the community of trusted reviewers. Stake tokens, write high-quality reviews, and get rewarded instantly on Monad.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <button className="w-full px-8 py-4 bg-white text-[#6E54FF] rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                  Write a Review
                </button>
              </Link>
              <button className="w-full sm:w-auto px-8 py-4 bg-[#5a42de] text-white rounded-xl font-bold hover:bg-[#4b35c2] transition-colors border border-white/20">
                Claim Business
              </button>
            </div>
            <p className="mt-10 text-sm text-purple-200 font-semibold tracking-wide uppercase opacity-80">
              Powered by Monad · secure · decentralized
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;