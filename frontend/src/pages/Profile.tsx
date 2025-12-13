import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";

// ============================================
// Types & Data
// ============================================

interface ProfileStats {
    reputationScore: number;
    rank: string;
    authScore: number;
    qualityScore: number;
    communityScore: number;
    badges: string[];
    totalReviews: number;
    helpfulVotes: number;
    disputesWon: number;
    tokensEarned: number;
}

const DEMO_PROFILE_STATS: ProfileStats = {
    reputationScore: 850,
    rank: "Expert Reviewer",
    authScore: 98,
    qualityScore: 94,
    communityScore: 88,
    badges: ["Monad Verified", "Top 1%", "Quality Expert", "Early Adopter"],
    totalReviews: 124,
    helpfulVotes: 890,
    disputesWon: 3,
    tokensEarned: 2450,
};

// ============================================
// Icons (Inline SVGs)
// ============================================

const Icons = {
    Verified: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" />
        </svg>
    ),
    FileText: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    ThumbsUp: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Trophy: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Coins: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" stroke="currentColor" strokeWidth="2" />
            <path d="M7 6h4M8 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    ChevronRight: () => (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
            <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

// ============================================
// Components
// ============================================

const ScoreBar = ({ score, label, color }: { score: number; label: string; color: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 font-medium">{label}</span>
            <span className="text-sm font-bold text-gray-900">{score}/100</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
            />
        </div>
    </div>
);

const StatCard = ({ icon: Icon, label, value }: { icon: React.FC; label: string; value: string | number }) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-[#6E54FF] shadow-sm">
            <Icon />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className="text-lg font-bold text-gray-900">{value}</p>
        </div>
    </div>
);

const Badge = ({ name }: { name: string }) => (
    <span className="px-3 py-1.5 bg-white text-gray-700 rounded-full text-xs font-medium border border-gray-200 shadow-sm">
        {name}
    </span>
);

// ============================================
// Profile Page
// ============================================

const Profile = () => {
    const { isDemoMode, enableDemoMode, user } = useApp();
    const stats = isDemoMode ? DEMO_PROFILE_STATS : null;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    {!isDemoMode ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-24"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Your Profile</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">Connect your wallet to view your on-chain reputation or explore with demo data.</p>
                            <button
                                onClick={enableDemoMode}
                                className="px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all"
                            >
                                View Demo Profile
                            </button>
                        </motion.div>
                    ) : stats && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Profile Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12"
                            >
                                {/* Avatar */}
                                <div className="relative">
                                    <div className="w-24 h-24 bg-gradient-to-br from-[#6E54FF] to-[#9F88FF] rounded-2xl flex items-center justify-center text-4xl text-white font-bold shadow-lg shadow-[#6E54FF]/20">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                        <div className="text-[#6E54FF]">
                                            <Icons.Verified />
                                        </div>
                                    </div>
                                    <p className="text-[#6E54FF] font-medium mb-3">{stats.rank}</p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        {stats.badges.map(b => <Badge key={b} name={b} />)}
                                    </div>
                                </div>

                                {/* Reputation Score */}
                                <div className="text-center md:text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reputation</p>
                                    <p className="text-5xl font-bold text-gray-900">{stats.reputationScore}</p>
                                    <p className="text-sm text-gray-400">out of 1000</p>
                                </div>
                            </motion.div>

                            {/* Score Breakdown */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gray-50/50 rounded-2xl p-6 mb-8"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Score Breakdown</h3>
                                <div className="grid md:grid-cols-3 gap-6">
                                    <ScoreBar score={stats.authScore} label="Authenticity" color="#10b981" />
                                    <ScoreBar score={stats.qualityScore} label="Review Quality" color="#6E54FF" />
                                    <ScoreBar score={stats.communityScore} label="Community" color="#f43f5e" />
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                            >
                                <StatCard icon={Icons.FileText} label="Reviews" value={stats.totalReviews} />
                                <StatCard icon={Icons.ThumbsUp} label="Helpful Votes" value={stats.helpfulVotes} />
                                <StatCard icon={Icons.Trophy} label="Disputes Won" value={stats.disputesWon} />
                                <StatCard icon={Icons.Coins} label="MR Earned" value={`${stats.tokensEarned}`} />
                            </motion.div>

                            {/* Recent Activity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                                    <button className="text-sm text-[#6E54FF] font-medium hover:underline flex items-center gap-1">
                                        View All <Icons.ChevronRight />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { product: "Uniswap V4", score: 92, reward: 45, time: "2 hours ago" },
                                        { product: "Monad Bridge", score: 88, reward: 38, time: "1 day ago" },
                                        { product: "DeFi Protocol X", score: 95, reward: 52, time: "3 days ago" },
                                    ].map((item, i) => (
                                        <motion.div
                                            key={item.product}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + i * 0.1 }}
                                            className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#6E54FF]/30 hover:shadow-sm transition-all group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-[#6E54FF]/5 rounded-lg flex items-center justify-center text-[#6E54FF]">
                                                    <Icons.FileText />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-[#6E54FF] transition-colors">{item.product}</p>
                                                    <p className="text-sm text-gray-500">{item.time}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Quality</p>
                                                    <p className="font-bold text-gray-900">{item.score}/100</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500">Reward</p>
                                                    <p className="font-bold text-[#6E54FF]">+{item.reward} MR</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
