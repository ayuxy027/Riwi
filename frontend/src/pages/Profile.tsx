import { motion } from "framer-motion";
import { formatEther } from "viem";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp, truncateAddress } from "../context/AppContext";

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

// Helper function to get rank from reputation score
function getRankFromScore(score: number): string {
    if (score >= 800) return "Elite Reviewer";
    if (score >= 600) return "Diamond Reviewer";
    if (score >= 400) return "Trusted Reviewer";
    if (score >= 200) return "Explorer";
    return "Newcomer";
}

// Helper function to get badges from reputation
function getBadgesFromReputation(reputation: number, totalReviews: number): string[] {
    const badges: string[] = [];
    if (reputation >= 800) badges.push("Elite");
    if (reputation >= 600) badges.push("Diamond");
    if (reputation >= 400) badges.push("Trusted");
    if (totalReviews >= 100) badges.push("Century Club");
    if (totalReviews >= 50) badges.push("Top Reviewer");
    if (reputation >= 200) badges.push("Verified");
    return badges;
}

// ============================================
// Profile Page
// ============================================

const Profile = () => {
    const { user, blockchain, connectWallet, isLoading } = useApp();

    const reputation = blockchain.reputation || 0;
    const totalReviews = blockchain.totalReviews || 0;
    const tokensEarned = blockchain.balance || 0;
    const rank = getRankFromScore(reputation);
    const badges = getBadgesFromReputation(reputation, totalReviews);

    // Calculate derived scores (mock for now, could come from contract)
    const authScore = Math.min(100, Math.max(70, reputation * 0.1));
    const qualityScore = Math.min(100, Math.max(70, reputation * 0.12));
    const communityScore = Math.min(100, Math.max(70, reputation * 0.11));

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    {!user.connected || !user.address ? (
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
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Connect your MetaMask wallet to view your on-chain reputation, reviews, and earnings.
                            </p>
                            <button
                                onClick={connectWallet}
                                disabled={isLoading}
                                className="px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Connecting..." : "Connect MetaMask"}
                            </button>
                        </motion.div>
                    ) : (
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
                                        {user.address.slice(2, 4).toUpperCase()}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white"></div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {truncateAddress(user.address)}
                                        </h1>
                                        {reputation >= 200 && (
                                            <div className="text-[#6E54FF]">
                                                <Icons.Verified />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[#6E54FF] font-medium mb-3">{rank}</p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                        {badges.length > 0 ? (
                                            badges.map(badge => <Badge key={badge} name={badge} />)
                                        ) : (
                                            <span className="text-sm text-gray-500">No badges yet</span>
                                        )}
                                    </div>
                                </div>

                                {/* Reputation Score */}
                                <div className="text-center md:text-right">
                                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Reputation</p>
                                    <p className="text-5xl font-bold text-gray-900">{reputation}</p>
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
                                    <ScoreBar score={Math.round(authScore)} label="Authenticity" color="#10b981" />
                                    <ScoreBar score={Math.round(qualityScore)} label="Review Quality" color="#6E54FF" />
                                    <ScoreBar score={Math.round(communityScore)} label="Community" color="#f43f5e" />
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
                            >
                                <StatCard icon={Icons.FileText} label="Reviews" value={totalReviews} />
                                <StatCard icon={Icons.Coins} label="RVT Balance" value={tokensEarned.toFixed(2)} />
                                <StatCard icon={Icons.Trophy} label="Reputation" value={reputation} />
                                <StatCard icon={Icons.ThumbsUp} label="Staked" value={`${blockchain.stakedAmount?.toFixed(2) || "0.00"} MON`} />
                            </motion.div>

                            {/* Recent Activity */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-lg font-bold text-gray-900">Recent Reviews</h3>
                                    {blockchain.reviews && blockchain.reviews.length > 0 && (
                                        <button className="text-sm text-[#6E54FF] font-medium hover:underline flex items-center gap-1">
                                            View All <Icons.ChevronRight />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {blockchain.reviews && blockchain.reviews.length > 0 ? (
                                        blockchain.reviews.slice(0, 5).map((review, i) => {
                                            // Parse contract response properly
                                            // Contract returns: (content, reviewer, timestamp, validated, rewardAmount, qualityScore)
                                            const timestamp = Number(review.timestamp || 0n);
                                            const date = timestamp > 0 ? new Date(timestamp * 1000) : new Date();
                                            const dateStr = date.toLocaleDateString();
                                            const timeStr = timestamp > 0 ? date.toLocaleTimeString() : "";
                                            const qualityScore = Number(review.qualityScore || 0n);
                                            const rewardAmount = review.rewardAmount || 0n;
                                            const reward = parseFloat(formatEther(rewardAmount));
                                            const status = review.validated ? "Verified" : "Pending";
                                            const contentPreview = review.content ? 
                                                (review.content.length > 80 ? review.content.substring(0, 80) + "..." : review.content) : 
                                                "No content";

                                            return (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.5 + i * 0.1 }}
                                                    className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:border-[#6E54FF]/30 hover:shadow-sm transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${status === "Verified" ? "bg-green-100 text-green-700" : "bg-[#6E54FF]/5 text-[#6E54FF]"}`}>
                                                            <Icons.FileText />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <p className="font-medium text-gray-900 group-hover:text-[#6E54FF] transition-colors">
                                                                    Review #{i + 1}
                                                                </p>
                                                                {status === "Verified" && (
                                                                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">
                                                                        ✓
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-gray-500 mb-1">{dateStr} {timeStr && `at ${timeStr}`}</p>
                                                            <p className="text-xs text-gray-600 truncate" title={review.content || "No content"}>
                                                                {contentPreview}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                                                        <div className="text-right">
                                                            <p className="text-xs text-gray-500">Quality</p>
                                                            <p className="font-bold text-gray-900">{qualityScore > 0 ? `${qualityScore}/100` : "Pending"}</p>
                                                        </div>
                                                        {reward > 0 && (
                                                            <div className="text-right">
                                                                <p className="text-xs text-gray-500">Reward</p>
                                                                <p className="font-bold text-[#6E54FF]">+{reward.toFixed(2)} RVT</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })
                                    ) : (
                                        <div className="text-center py-12 bg-gray-50 rounded-xl">
                                            <p className="text-gray-500">No reviews yet. Start reviewing to build your reputation!</p>
                                        </div>
                                    )}
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
