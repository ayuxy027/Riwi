const Features = () => {


  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-medium text-rose-600 mb-4 uppercase tracking-wider">Platform Features</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 bg-clip-text text-transparent">
              Redefining Online Reviews with AI & Blockchain
            </span>
          </h2>
          <p className="text-lg text-rose-700">
            A trusted ecosystem where quality feedback is rewarded and authenticity is guaranteed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: 'AI-Powered Analysis',
              description: 'Advanced AI models analyze review sentiment, relevance, and quality in real-time to provide instant feedback to reviewers.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.5 21a4.375 4.375 0 003 0m4.5-4.367a4.367 4.367 0 001.5-3.033V9.75m-4.5 3.75l4.5-3.75m0 0L21 9.75m-9 3.75h3.75m-9 0V6.568a2.25 2.25 0 011.195-1.99L9.75 2.25a2.25 2.25 0 012.1 0l6.204 2.326a2.25 2.25 0 011.195 1.995V21M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5" />
                </svg>
              ),
            },
            {
              title: 'Instant Rewards',
              description: 'Earn tokens immediately for high-quality, helpful reviews. The better your feedback, the higher your reward.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: 'Anti-Spam Staking',
              description: 'A staking mechanism ensures accountability. Users stake a small amount to review; spam or fake reviews result in slashed stakes.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              ),
            },
            {
              title: 'Immutable Reputation',
              description: 'Build a verifiable reputation score on the high-performance Monad blockchain that businesses and communities can trust.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              ),
            },
            {
              title: 'Business Analytics',
              description: 'Businesses gain deep insights into customer sentiment and product feedback through our comprehensive analytics dashboard.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              ),
            },
            {
              title: 'Monad Speed',
              description: 'Experience lightning-fast transactions and low fees, making it practical to review everyday purchases and services.',
              icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ),
            },
          ].map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100/50 rounded-2xl transition-all duration-500 ease-out animate-fade-in-up hover:border-rose-200 hover:shadow-xl hover:shadow-rose-200/50 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl flex items-center justify-center text-rose-700 mb-4 group-hover:from-rose-200 group-hover:to-pink-200 transition-all duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-rose-900 mb-2 group-hover:text-rose-950 transition-colors">{feature.title}</h3>
              <p className="text-rose-700 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;