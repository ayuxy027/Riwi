import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";
import WriteReviewModal from "../components/WriteReviewModal";

// ============================================
// Icons (Professional SVGs)
// ============================================

const Icons = {
    Review: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
        </svg>
    ),
    Brain: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
            <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
        </svg>
    ),
    Wallet: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 7h-3a2 2 0 0 1-2-2V2" />
            <path d="M9 18a2 2 0 0 1-2-2V5l-3-3H2" />
            <path d="M11 13a2 2 0 0 1 2-2h7" />
            <path d="M17 13v6" />
            <rect x="2" y="5" width="20" height="15" rx="2" />
        </svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    ),
    Pen: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    ),
    ShieldCheck: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    ),
    Bulb: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
        </svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m9 18 6-6-6-6" />
        </svg>
    ),
    Layers: () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    )
};

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

const StatCard = ({ label, value, icon, trend }: { label: string; value: string; icon: React.ReactNode; trend?: string }) => (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:border-[#6E54FF]/30 hover:shadow-lg hover:shadow-[#6E54FF]/5 transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 bg-[#6E54FF]/5 text-[#6E54FF] rounded-xl flex items-center justify-center transition-colors group-hover:bg-[#6E54FF] group-hover:text-white">
                {icon}
            </div>
            {trend && (
                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg flex items-center gap-1 border border-green-100">
                    <Icons.TrendingUp /> {trend}
                </span>
            )}
        </div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-gray-500 text-sm font-medium">{label}</p>
    </div>
);

const ReviewHistoryItem = ({ review }: { review: ReviewActivity }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/80 hover:border-[#6E54FF]/20 transition-all duration-200 group cursor-pointer">
        <div className="flex items-center gap-4">
            <div className={`w-1.5 h-12 rounded-full transition-all ${review.status === "Verified" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" :
                review.status === "Pending" ? "bg-yellow-500" : "bg-red-500"
                }`} />
            <div>
                <h4 className="font-semibold text-gray-900 group-hover:text-[#6E54FF] transition-colors flex items-center gap-2">
                    {review.product}
                </h4>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Icons.Layers /> {review.date}
                </p>
            </div>
        </div>
        <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1">
                <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${review.status === "Verified" ? "bg-green-100 text-green-700" :
                    review.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                    {review.status === "Verified" && <Icons.ShieldCheck />}
                    {review.status}
                </span>
            </div>
            <p className="text-sm font-medium text-gray-700">
                AI Score: <span className="font-bold text-gray-900">{review.qualityScore > 0 ? review.qualityScore : "-"}</span>
            </p>
            {review.reward > 0 && (
                <p className="text-xs text-[#6E54FF] font-bold flex items-center justify-end gap-1 mt-1">
                    +{review.reward} MR
                </p>
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
        <div className="min-h-screen bg-[#F9FAFB]"> {/* Cleaner light grey background */}
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Reviewer Dashboard</h1>
                            <p className="text-gray-500 text-lg">
                                Welcome back, <span className="text-[#6E54FF] font-semibold">{user.name || "Guest"}</span>.
                            </p>
                        </div>
                        {!isDemoMode ? (
                            <button
                                onClick={enableDemoMode}
                                className="px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium shadow-lg hover:shadow-[#6E54FF]/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <Icons.Lock /> Enable Demo Mode
                            </button>
                        ) : (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                className="px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium shadow-lg hover:shadow-[#6E54FF]/25 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                            >
                                <Icons.Pen /> Write New Review
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
                                    icon={<Icons.Review />}
                                    trend="+4 this week"
                                />
                                <StatCard
                                    label="AI Quality Score"
                                    value={stats.avgQualityScore.toString()}
                                    icon={<Icons.Brain />}
                                    trend="Top 10%"
                                />
                                <StatCard
                                    label="Tokens Earned"
                                    value={`${stats.tokensEarned} MR`}
                                    icon={<Icons.Wallet />}
                                />
                                <StatCard
                                    label="Amount Staked"
                                    value={`${stats.stakedAmount} MR`}
                                    icon={<Icons.Lock />}
                                />
                            </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
                                            <button className="text-sm font-medium text-[#6E54FF] hover:bg-[#6E54FF]/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                                View All <Icons.ChevronRight />
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {history.map((review) => (
                                                <ReviewHistoryItem key={review.id} review={review} />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions & Staking Info */}
                                <div className="space-y-6">
                                    {/* Staking Card - Premium Dark Design */}
                                    <div className="bg-gradient-to-br from-[#0E091C] to-[#1A1429] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group border border-gray-800">
                                        {/* Abstract Decoration */}
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150">
                                            <Icons.Lock />
                                        </div>
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#6E54FF] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <h3 className="text-lg font-bold mb-2 text-gray-200 flex items-center gap-2">
                                                <Icons.ShieldCheck /> Staking Status
                                            </h3>
                                            <div className="text-4xl font-bold mb-4 tracking-tight">{stats.stakedAmount} <span className="text-lg text-[#6E54FF] font-medium">MR</span></div>
                                            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                                Your stake ensures verify authenticity. Maintain quality to avoid slashing.
                                            </p>
                                            <button className="w-full py-3 bg-[#6E54FF] hover:bg-[#5a42de] text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-[#6E54FF]/30 border border-transparent">
                                                Manage Stake
                                            </button>
                                        </div>
                                    </div>

                                    {/* AI Insights */}
                                    <div className="bg-white rounded-2xl p-6 border border-[#6E54FF]/20 shadow-sm shadow-[#6E54FF]/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#6E54FF]/5 rounded-bl-full -mr-2 -mt-2"></div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 relative z-10">
                                            <div className="text-[#6E54FF]"><Icons.Bulb /></div> AI Tip
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed relative z-10">
                                            Your reviews containing specific usage details (e.g., transaction speeds, fees) receive <strong>15% higher rewards</strong> on average.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Icons.Lock />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Locked</h2>
                            <p className="text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
                                Connect your wallet or enable demo mode to view your reputation stats, earnings, and review history.
                            </p>
                            <button
                                onClick={enableDemoMode}
                                className="px-8 py-4 bg-[#6E54FF] text-white rounded-xl font-medium shadow-lg hover:shadow-[#6E54FF]/25 hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto"
                            >
                                <Icons.Lock /> Enable Demo Mode
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
