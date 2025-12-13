import { Link } from "react-router-dom";
import { Lock, FileText, Trophy, Coins, ArrowUpRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-white pt-20 relative overflow-hidden font-jakarta">
      {/* Dashed Grid Background Pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
          maskImage: `radial-gradient(ellipse at center, black 40%, transparent 80%)`,
          WebkitMaskImage: `radial-gradient(ellipse at center, black 40%, transparent 80%)`,
        }}
      />

      {/* Decorative Blur/Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#6E54FF] opacity-[0.08] blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-12 pb-24 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-[#6E54FF]/20 rounded-full mb-8 animate-fade-in-up shadow-sm hover:border-[#6E54FF]/40 transition-colors"
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6E54FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6E54FF]"></span>
            </span>
            <span className="text-sm text-gray-700 font-medium tracking-wide">AI-Powered Review System on Monad</span>
          </div>

          {/* Heading */}
          <h1
            className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-8 animate-fade-in-up text-gray-900"
            style={{ animationDelay: '100ms', animationFillMode: 'both' }}
          >
            Authentic Reviews,
            <br />
            <span className="text-[#6E54FF]">Verified on Monad.</span>
          </h1>

          {/* Subheading */}
          <p
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up font-medium"
            style={{ animationDelay: '200ms', animationFillMode: 'both' }}
          >
            MonadReview leverages <strong>gMonad</strong> speed and AI intelligence to ensure review quality.
            Earn <strong>MR tokens</strong> for helpful feedback and build a trusted on-chain reputation.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 animate-fade-in-up"
            style={{ animationDelay: '300ms', animationFillMode: 'both' }}
          >
            <Link to="/dashboard">
              <button className="w-full sm:w-auto px-8 py-4 bg-[#6E54FF] text-white rounded-xl text-lg font-bold transition-all duration-300 ease-out hover:bg-[#5a42de] hover:shadow-lg hover:shadow-[#6E54FF]/25 hover:-translate-y-0.5">
                Start Reviewing
              </button>
            </Link>
            <button className="w-full sm:w-auto px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-xl text-lg font-bold transition-all duration-300 ease-out hover:bg-gray-50 hover:border-[#6E54FF]/30 hover:-translate-y-0.5">
              For Businesses
            </button>
          </div>

          {/* Trust indicators */}
          <div
            className="animate-fade-in-up border-t border-gray-100 pt-10"
            style={{ animationDelay: '400ms', animationFillMode: 'both' }}
          >
            <p className="text-sm text-gray-400 mb-6 font-semibold uppercase tracking-wider">Trusted by Ecosystem Builders</p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
              {/* Replace with SVGs in production, using text for now with hover color */}
              {['Monad', 'LayerZero', 'Pyth', 'Wormhole', 'Switchboard'].map((brand) => (
                <span
                  key={brand}
                  className="text-xl font-bold text-gray-400 hover:text-[#6E54FF] transition-colors cursor-default"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Image/Dashboard Preview */}
        <div
          className="mt-24 animate-fade-in-up relative"
          style={{ animationDelay: '500ms', animationFillMode: 'both' }}
        >
          {/* Dashboard Preview Container - cleaned up as requested */}
          <div className="relative max-w-5xl mx-auto rounded-2xl bg-gray-100 p-2 shadow-2xl ring-1 ring-gray-200">
            <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-gray-200">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#FF5F56] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#FFBD2E] rounded-full"></div>
                  <div className="w-3 h-3 bg-[#27C93F] rounded-full"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-500 font-medium shadow-sm w-64 justify-center">
                    <Lock className="w-3 h-3 text-green-500" /> monadreview.app/dashboard
                  </div>
                </div>
              </div>

              {/* Dashboard content placeholder */}
              <div className="p-8 bg-gray-50/50 min-h-[450px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {[
                    { title: 'Total Reviews', value: '1,284', icon: FileText, change: '+12%' },
                    { title: 'Reputation Score', value: '850/1000', icon: Trophy, change: 'Top 5%' },
                    { title: 'MR Tokens', value: '5,420', icon: Coins, change: '≈ $240' }
                  ].map((stat) => (
                    <div key={stat.title} className="bg-white border border-gray-100 rounded-2xl p-6 hover:border-[#6E54FF]/30 hover:shadow-lg hover:shadow-[#6E54FF]/5 transition-all cursor-default group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="w-10 h-10 bg-[#6E54FF]/10 text-[#6E54FF] rounded-xl flex items-center justify-center text-xl">
                          <stat.icon size={20} />
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
                      </div>
                      <h3 className="text-gray-500 font-medium text-sm mb-1">{stat.title}</h3>
                      <p className="text-3xl font-bold text-gray-900 group-hover:text-[#6E54FF] transition-colors">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">Recent Activity</h4>
                      <p className="text-sm text-gray-500">Real-time verifications on Monad</p>
                    </div>
                    <button className="text-sm font-bold text-[#6E54FF] hover:bg-[#6E54FF]/5 px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                      View Explorer <ArrowUpRight size={14} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    {[
                      { item: 'Uniswap V4 Review', user: '0xAlice', status: 'Verified', reward: '+150 MR', time: '2s ago' },
                      { item: 'Monad Wallet Feedback', user: '0xBob', status: 'AI Evaluating', reward: 'Pending', time: '5s ago' },
                      { item: 'DeFi Aggregator', user: '0xCharlie', status: 'Verified', reward: '+75 MR', time: '12s ago' },
                      { item: 'NFT Marketplace', user: '0xDavid', status: 'Rejected (Spam)', reward: '0 MR', time: '45s ago' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-gray-50 hover:border-[#6E54FF]/20 hover:bg-[#6E54FF]/5 rounded-xl transition-all group">
                        <div className={`w-2 h-2 rounded-full ${item.status.includes('Verified') ? 'bg-green-500' : item.status.includes('Rejected') ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{item.item}</span>
                            <span className="text-xs text-gray-400">• {item.user}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${item.status.includes('Verified') ? 'bg-green-100 text-green-700' :
                          item.status.includes('Pending') || item.status.includes('Evaluating') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {item.status}
                        </div>
                        <div className="text-sm font-bold text-gray-900 w-20 text-right">{item.reward}</div>
                      </div>
                    ))}
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