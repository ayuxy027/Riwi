const Hero = () => {
  return (
    <section className="min-h-screen bg-white pt-16 relative overflow-hidden">
      {/* Dashed Grid Background Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e7e5e4 1px, transparent 1px),
            linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          WebkitMaskImage: `
            repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            )
          `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/50 rounded-full mb-8 animate-fade-in-up shadow-sm"
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <span className="w-2 h-2 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full animate-pulse"></span>
            <span className="text-sm text-rose-800 font-medium">AI-Powered Review System</span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 animate-fade-in-up"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            <span className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 bg-clip-text text-transparent">
              Authentic Reviews,
            </span>
            <br />
            <span className="bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 bg-clip-text text-transparent font-bold">Verified on Monad</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-rose-700 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            MonadReview leverages AI to ensure review quality and authenticity.
            Earn rewards for helpful feedback and build a trusted reputation on the Monad blockchain.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-900 via-rose-800 to-rose-900 text-rose-50 rounded-xl text-base font-medium transition-all duration-300 ease-out hover:from-rose-800 hover:via-rose-700 hover:to-rose-800 hover:shadow-xl hover:shadow-rose-900/25 hover:-translate-y-0.5">
              Start Reviewing
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-rose-50 to-pink-50 text-rose-800 border border-rose-200/50 rounded-xl text-base font-medium transition-all duration-300 ease-out hover:from-rose-100 hover:to-pink-100 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-200/50 hover:-translate-y-0.5">
              For Businesses
            </button>
          </div>

          {/* Trust indicators */}
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <p className="text-sm text-rose-600 mb-6 font-medium">Trusted by leading ecosystems</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {['Monad', 'E-commerce', 'SaaS', 'Service Providers', 'Local Business'].map((ecosystem, index) => (
                <span
                  key={ecosystem}
                  className="text-rose-700 font-medium text-lg animate-fade-in-up hover:text-rose-900 transition-colors duration-300"
                  style={{ animationDelay: `${500 + index * 100}ms`, animationFillMode: 'both' }}
                >
                  {ecosystem}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div
          className="mt-20 animate-fade-in-up"
          style={{ animationDelay: '600ms', animationFillMode: 'both' }}
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="bg-gradient-to-br from-rose-100 to-pink-100 border border-rose-200/50 rounded-2xl p-2 shadow-2xl shadow-rose-200/30">
              <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-xl border border-rose-100/50 overflow-hidden shadow-lg">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border-b border-rose-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-rose-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-rose-200 rounded-full"></div>
                    <div className="w-3 h-3 bg-rose-200 rounded-full"></div>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="px-4 py-1 bg-rose-100 rounded-lg text-xs text-rose-500">
                      monadreview.app/dashboard
                    </div>
                  </div>
                </div>

                {/* Dashboard content placeholder */}
                <div className="p-6 md:p-8 bg-rose-50 min-h-[400px]">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[
                      { title: 'Total Reviews', value: '124' },
                      { title: 'Quality Score', value: '4.8/5' },
                      { title: 'Tokens Earned', value: '2,450' }
                    ].map((stat) => (
                      <div key={stat.title} className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/50 rounded-xl p-5 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-gradient-to-br from-rose-200 to-pink-200 rounded-lg mb-4"></div>
                        <div className="h-3 bg-gradient-to-r from-rose-200 to-pink-200 rounded w-20 mb-2"></div>
                        <h3 className="text-rose-800 font-semibold">{stat.title}</h3>
                        <p className="text-2xl font-bold bg-gradient-to-r from-rose-900 to-pink-900 bg-clip-text text-transparent">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-200/50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="font-semibold text-rose-800">Recent Review Activity</h4>
                      <div className="text-sm text-rose-600 font-medium">Last 24h</div>
                    </div>
                    <div className="space-y-3">
                      {[
                        { item: 'TechGadget X1', status: 'High Quality', reward: '+50 MR' },
                        { item: 'Downtown Cafe', status: 'Verified', reward: '+30 MR' },
                        { item: 'SaaS Platform', status: 'Pending AI', reward: '...' },
                        { item: 'Local Gym', status: 'Published', reward: '+25 MR' }
                      ].map((item) => (
                        <div key={item.item} className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-gradient-to-br from-rose-200 to-pink-200 rounded-lg"></div>
                          <div className="flex-1 font-medium text-rose-700">{item.item}</div>
                          <div className={`px-2 py-1 rounded text-sm font-medium ${item.status.includes('Pending') ? 'bg-rose-100 text-rose-600' : 'bg-gradient-to-r from-rose-200 to-pink-200 text-rose-800'}`}>
                            {item.status}
                          </div>
                          <div className="text-xs font-bold text-rose-900">{item.reward}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;