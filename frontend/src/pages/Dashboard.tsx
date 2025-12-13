import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";
import WriteReviewModal from "../components/WriteReviewModal";

// ============================================
// Types
// ============================================

interface ReviewActivity {
    id: string;
    product: string;
    date: string;
    qualityScore: number;
    reward: number;
    status: "Verified" | "Pending" | "Rejected";
}

interface UserStats {
    totalReviews: number;
    avgQualityScore: number;
    tokensEarned: number;
    stakedAmount: number;
}

// ============================================
// Demo Data
// ============================================

const DEMO_STATS: UserStats = {
    totalReviews: 47,
    avgQualityScore: 8.7,
    tokensEarned: 2450,
    stakedAmount: 500,
};

const INITIAL_HISTORY: ReviewActivity[] = [
    { id: "1", product: "DeFi Exchange Pro", date: "2 hrs ago", qualityScore: 9.2, reward: 50, status: "Verified" },
    { id: "2", product: "Monad Wallet", date: "1 day ago", qualityScore: 8.5, reward: 35, status: "Verified" },
    { id: "3", product: "NFT Marketplace", date: "2 days ago", qualityScore: 7.8, reward: 20, status: "Verified" },
    { id: "4", product: "Crypto Game X", date: "3 days ago", qualityScore: 0, reward: 0, status: "Pending" },
    { id: "5", product: "Yield Farm Alpha", date: "1 week ago", qualityScore: 4.2, reward: 0, status: "Rejected" },
];

// ============================================
// Components
// ============================================

const StatCard = ({ label, value, icon, trend }: { label: string; value: string; icon: string; trend?: string }) => (
    <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center text-2xl">
                {icon}
            </div>
            {trend && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-1">
                    {trend} ↗
                </span>
            )}
        </div>
        <h3 className="text-3xl font-bold text-rose-900 mb-1">{value}</h3>
        <p className="text-rose-600 text-sm font-medium">{label}</p>
    </div>
);

const ReviewHistoryItem = ({ review }: { review: ReviewActivity }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-rose-100 rounded-xl hover:bg-rose-50/50 transition-colors">
        <div className="flex items-center gap-4">
            <div className={`w-2 h-12 rounded-full ${review.status === "Verified" ? "bg-green-500" :
                review.status === "Pending" ? "bg-yellow-500" : "bg-red-500"
                }`} />
            <div>
                <h4 className="font-semibold text-rose-900">{review.product}</h4>
                <p className="text-xs text-rose-500">{review.date}</p>
            </div>
        </div>
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${review.status === "Verified" ? "bg-green-100 text-green-700" :
                    review.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                    {review.status}
                </span>
            </div>
            <p className="text-sm font-medium text-rose-800">
                AI Score: <span className="font-bold">{review.qualityScore > 0 ? review.qualityScore : "-"}</span>
            </p>
            {review.reward > 0 && (
                <p className="text-xs text-rose-600 font-semibold">+{review.reward} MR</p>
            )}
        </div>
    </div>
);

// ============================================
// Dashboard Page
// ============================================

const Dashboard = () => {
    const { isDemoMode, enableDemoMode, user } = useApp();
    const [history, setHistory] = useState<ReviewActivity[]>(INITIAL_HISTORY);
    const [isReviewOpen, setIsReviewOpen] = useState(false);

    // In a real app, these would come from an API/Contract
    const stats = isDemoMode ? DEMO_STATS : null;

    const handleReviewSubmit = (reviewData: any) => {
        const newReview: ReviewActivity = {
            id: Date.now().toString(),
            product: reviewData.product,
            date: "Just now",
            qualityScore: reviewData.qualityScore,
            reward: 0, // Pending
            status: "Pending"
        };
        setHistory([newReview, ...history]);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-rose-900 mb-2">Reviewer Dashboard</h1>
                            <p className="text-rose-600">Welcome back, {user.name || "Guest"}! Here is your impact overview.</p>
                        </div>
                        {!isDemoMode ? (
                            <button
                                onClick={enableDemoMode}
                                className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:shadow-rose-200/50 transition-all"
                            >
                                Enable Demo Mode
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="px-6 py-3 bg-rose-900 text-white rounded-xl font-medium shadow-lg hover:bg-rose-800 transition-all flex items-center gap-2"
                            >
                                <span>✍️</span> Write New Review
                            </button>
                        )}
                    </div>

                    {isDemoMode && stats ? (
                        <div className="space-y-8 animate-fade-in-up">
                            {/* Stats Grid */}
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard
                                    label="Total Reviews"
                                    value={(stats.totalReviews + (history.length - INITIAL_HISTORY.length)).toString()}
                                    icon="📝"
                                    trend="+4 this week"
                                />
                                <StatCard
                                    label="AI Quality Score"
                                    value={stats.avgQualityScore.toString()}
                                    icon="🤖"
                                    trend="Top 10%"
                                />
                                <StatCard
                                    label="Tokens Earned"
                                    value={`${stats.tokensEarned} MR`}
                                    icon="💰"
                                />
                                <StatCard
                                    label="Amount Staked"
                                    value={`${stats.stakedAmount} MR`}
                                    icon="🔒"
                                />
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                                        <h2 className="text-xl font-bold text-rose-900 mb-6">Recent Reviews</h2>
                                        <div className="space-y-4">
                                            {history.map((review) => (
                                                <ReviewHistoryItem key={review.id} review={review} />
                                            ))}
                                        </div>
                                        <button className="w-full mt-6 py-3 text-rose-600 font-medium hover:bg-rose-50 rounded-xl transition-colors">
                                            View All Activity
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Actions & Staking Info */}
                                <div className="space-y-6">
                                    {/* Staking Card */}
                                    <div className="bg-gradient-to-br from-rose-900 to-pink-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z" /></svg>
                                        </div>
                                        <h3 className="text-lg font-bold mb-2 relative z-10">Staking Status</h3>
                                        <div className="text-3xl font-bold mb-4 relative z-10">{stats.stakedAmount} MR</div>
                                        <p className="text-rose-100 text-sm mb-6 relative z-10">
                                            Your stake ensures review authenticity. Maintain quality to avoid slashing.
                                        </p>
                                        <button className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all relative z-10 border border-white/10">
                                            Manage Stake
                                        </button>
                                    </div>

                                    {/* AI Insights (Mock) */}
                                    <div className="bg-rose-50 rounded-2xl p-6 border border-rose-200">
                                        <h3 className="text-lg font-bold text-rose-900 mb-3">💡 AI Tip</h3>
                                        <p className="text-rose-700 text-sm leading-relaxed">
                                            Your reviews containing specific usage details (e.g., transaction speeds, fees) receive <strong>15% higher rewards</strong> on average. Keep it up!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm">
                            <div className="w-24 h-24 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                                🔒
                            </div>
                            <h2 className="text-2xl font-bold text-rose-900 mb-4">Dashboard Locked</h2>
                            <p className="text-rose-600 mb-8 max-w-md mx-auto">
                                Enable demo mode or connect your wallet to view your reputation stats and review history.
                            </p>
                            <button
                                onClick={enableDemoMode}
                                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-medium shadow-lg hover:scale-105 transition-all"
                            >
                                Enable Demo Mode
                            </button>
                        </div>
                    )}
                </div>
            </main>
            <Footer />

            <WriteReviewModal
                isOpen={isReviewOpen}
                onClose={() => setIsReviewOpen(false)}
                onSubmit={handleReviewSubmit}
            />
        </div>
    );
};

export default Dashboard;
