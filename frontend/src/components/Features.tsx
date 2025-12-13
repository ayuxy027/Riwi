const features = [
  {
    title: "AI-Powered Analysis",
    description: "Our advanced AI models analyze every review for authenticity, tone, and helpfulness, filtering out spam instantly.",
    icon: "🤖",
  },
  {
    title: "Instant Rewards",
    description: "Earn MR tokens immediately after your high-quality reviews are verified by the consensus protocol.",
    icon: "⚡",
  },
  {
    title: "Anti-Spam Staking",
    description: "Reviewers stake tokens to prove commitment. Bad actors get slashed, ensuring a trust-minimized ecosystem.",
    icon: "🛡️",
  },
  {
    title: "Immutable Reputation",
    description: "Your reviewer score is stored on-chain. Build a portable reputation that follows you across the decentralized web.",
    icon: "🔗",
  },
  {
    title: "Business Analytics",
    description: "Businesses get detailed insights into customer sentiment and can address feedback transparently.",
    icon: "📊",
  },
  {
    title: "Monad Speed",
    description: "Experience 10,000+ TPS finality. Reviews and rewards process in milliseconds, not minutes.",
    icon: "🚀",
  },
];

const Features = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-[#6E54FF] uppercase tracking-widest mb-4 animate-fade-in-up">
            Core Technology
          </h2>
          <p className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 animate-fade-in-up tracking-tight">
            Redefining Trust with <span className="text-[#6E54FF]">AI & Chain</span>
          </p>
          <p className="text-xl text-gray-500 leading-relaxed animate-fade-in-up">
            We combine high-performance execution with AI intelligence to create a review system you can actually trust.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="p-8 rounded-2xl bg-white border border-gray-100 hover:border-[#6E54FF]/30 hover:shadow-2xl hover:shadow-[#6E54FF]/10 transition-all duration-300 group animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Hover Gradient Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#6E54FF]/0 to-[#6E54FF]/0 group-hover:from-[#6E54FF]/5 group-hover:to-purple-500/5 transition-all duration-500"></div>

              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 group-hover:bg-[#6E54FF] group-hover:text-white transition-all duration-300 shadow-sm relative z-10">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#6E54FF] transition-colors relative z-10">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed relative z-10">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;