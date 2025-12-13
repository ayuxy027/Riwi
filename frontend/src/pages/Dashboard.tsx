import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp, truncateAddress } from "../context/AppContext";
import WriteReviewModal, { type ReviewSubmissionData } from "../components/WriteReviewModal";
import { TransactionToast } from "../components/TransactionToast";
import { formatEther } from "viem";
import type { Review } from "../services/blockchainService";

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

const ReviewHistoryItem = ({ review }: { review: Review }) => {
    const status = review.validated ? "Verified" : "Pending";
    const qualityScore = Number(review.qualityScore);
    const reward = parseFloat(formatEther(review.rewardAmount));
    const date = new Date(Number(review.timestamp) * 1000).toLocaleDateString();

    return (
        <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:bg-gray-50/80 hover:border-[#6E54FF]/20 transition-all duration-200 group cursor-pointer">
            <div className="flex items-center gap-4">
                <div className={`w-1.5 h-12 rounded-full transition-all ${status === "Verified" ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]" : "bg-yellow-500"
                    }`} />
                <div>
                    <h4 className="font-semibold text-gray-900 group-hover:text-[#6E54FF] transition-colors flex items-center gap-2">
                        Review by {truncateAddress(review.reviewer)}
                    </h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Icons.Layers /> {date}
                    </p>
                </div>
            </div>
            <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold flex items-center gap-1 ${status === "Verified" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}>
                        {status === "Verified" && <Icons.ShieldCheck />}
                        {status}
                    </span>
                </div>
                <p className="text-sm font-medium text-gray-700">
                    AI Score: <span className="font-bold text-gray-900">{qualityScore > 0 ? qualityScore : "-"}</span>
                </p>
                {reward > 0 && (
                    <p className="text-xs text-[#6E54FF] font-bold flex items-center justify-end gap-1 mt-1">
                        +{reward.toFixed(2)} RVT
                    </p>
                )}
            </div>
        </div>
    );
};

// ============================================
// Dashboard Page
// ============================================

const Dashboard = () => {
    const { user, blockchain, connectWallet, submitReview, stakeTokens, refreshUserData, isLoading, transaction, clearTransaction } = useApp();
    const [isReviewOpen, setIsReviewOpen] = useState(false);
    const [isStakingOpen, setIsStakingOpen] = useState(false);
    const [stakeAmount, setStakeAmount] = useState("1");
    const [isStakingInProgress, setIsStakingInProgress] = useState(false);

    useEffect(() => {
        if (user.connected && user.address) {
            refreshUserData();
        }
    }, [user.connected, user.address, refreshUserData]);

    const handleReviewSubmit = async (reviewData: ReviewSubmissionData) => {
        try {
            await submitReview(reviewData.content);
            setIsReviewOpen(false);
            // Data will refresh automatically via context
        } catch (error: unknown) {
            console.error("Failed to submit review:", error);
            const errorMessage = error instanceof Error ? error.message : "Failed to submit review. Please try again.";
            alert(errorMessage);
        }
    };

    // Show loading state while data is being fetched
    const isLoadingData = blockchain.isLoading;

    return (
        <div className="min-h-screen bg-[#F9FAFB]">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Reviewer Dashboard</h1>
                            <p className="text-gray-500 text-lg">
                                {user.connected && user.address ? (
                                    <>Welcome back, <span className="text-[#6E54FF] font-semibold">{truncateAddress(user.address)}</span>.</>
                                ) : (
                                    "Connect your wallet to get started"
                                )}
                            </p>
                        </div>
                        {user.connected && (
                            <button
                                onClick={() => setIsReviewOpen(true)}
                                disabled={blockchain.hasSufficientStake === false}
                                className={`px-6 py-3 rounded-xl font-medium shadow-lg transition-all flex items-center gap-2 ${
                                    blockchain.hasSufficientStake !== false
                                        ? "bg-[#6E54FF] text-white hover:shadow-[#6E54FF]/25 hover:-translate-y-0.5"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}
                            >
                                <Icons.Pen /> Write New Review
                            </button>
                        )}
                    </div>

                    {user.connected ? (
                        isLoadingData ? (
                            <div className="text-center py-24">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#6E54FF] border-t-transparent mb-4"></div>
                                <p className="text-gray-500">Loading your data...</p>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-fade-in-up">
                                {/* Stats Grid */}
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard
                                        label="Total Reviews"
                                        value={(blockchain.totalReviews || 0).toString()}
                                        icon={<Icons.Review />}
                                    />
                                    <StatCard
                                        label="Reputation Score"
                                        value={(blockchain.reputation || 0).toString()}
                                        icon={<Icons.Brain />}
                                    />
                                    <StatCard
                                        label="RVT Balance"
                                        value={`${(blockchain.balance || 0).toFixed(2)} RVT`}
                                        icon={<Icons.Wallet />}
                                    />
                                    <StatCard
                                        label="Amount Staked"
                                        value={`${(blockchain.stakedAmount || 0).toFixed(2)} MON`}
                                        icon={<Icons.Lock />}
                                    />
                                </div>

                            <div className="grid lg:grid-cols-3 gap-8">
                                {/* Recent Activity */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-gray-900">Recent Reviews</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {blockchain.reviews && blockchain.reviews.length > 0 ? (
                                                blockchain.reviews.slice(0, 5).map((review, idx) => (
                                                    <ReviewHistoryItem key={idx} review={review} />
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center py-8">No reviews yet. Submit your first review!</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions & Staking Info */}
                                <div className="space-y-6">
                                    {/* Staking Card */}
                                    <div className="bg-gradient-to-br from-[#0E091C] to-[#1A1429] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden group border border-gray-800">
                                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity duration-500 scale-150">
                                            <Icons.Lock />
                                        </div>
                                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#6E54FF] blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

                                        <div className="relative z-10">
                                            <h3 className="text-lg font-bold mb-2 text-gray-200 flex items-center gap-2">
                                                <Icons.ShieldCheck /> Staking Status
                                            </h3>
                                            <div className="text-4xl font-bold mb-4 tracking-tight">
                                                {(blockchain.stakedAmount || 0).toFixed(2)} <span className="text-lg text-[#6E54FF] font-medium">MON</span>
                                            </div>
                                            <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                                                {blockchain.hasSufficientStake === true ? (
                                                    "✅ You have sufficient stake to submit reviews."
                                                ) : blockchain.hasSufficientStake === false ? (
                                                    "⚠️ You need to stake at least 1 MON to submit reviews."
                                                ) : (
                                                    "Checking stake status..."
                                                )}
                                            </p>
                                            {blockchain.hasSufficientStake === false && (
                                                <button
                                                    onClick={() => setIsStakingOpen(true)}
                                                    className="w-full px-4 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all flex items-center justify-center gap-2 mt-4"
                                                >
                                                    <Icons.Lock /> Stake MON Tokens
                                                </button>
                                            )}
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
                        )
                    ) : (
                        <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-3xl mx-auto">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Icons.Wallet />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect MetaMask Wallet</h2>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto leading-relaxed">
                                Connect your MetaMask wallet to view your reputation stats, earnings, and review history on Monad testnet.
                            </p>
                            <div className="mb-10">
                                <a
                                    href="https://metamask.io/download/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#6E54FF] hover:underline mb-4 inline-block"
                                >
                                    Don't have MetaMask? Install it here →
                                </a>
                            </div>
                            <button
                                onClick={connectWallet}
                                disabled={isLoading}
                                className="px-8 py-4 bg-[#6E54FF] text-white rounded-xl font-medium shadow-lg hover:shadow-[#6E54FF]/25 hover:-translate-y-1 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Icons.Wallet /> {isLoading ? "Connecting..." : "Connect MetaMask"}
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
            <TransactionToast transaction={transaction} onClose={clearTransaction} />
            
            {/* Staking Modal */}
            {isStakingOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in-up border border-gray-100">
                        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Stake MON Tokens</h2>
                            <button onClick={() => setIsStakingOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-600 mb-4 text-sm">
                                You need to stake at least <strong>1 MON</strong> with validator ID <strong>1</strong> to submit reviews.
                            </p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount to Stake (MON)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.1"
                                    value={stakeAmount}
                                    onChange={(e) => setStakeAmount(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6E54FF] focus:border-[#6E54FF] outline-none transition-all"
                                    placeholder="1.0"
                                />
                                <p className="text-xs text-gray-500 mt-1">Minimum: 1 MON</p>
                            </div>
                            <button
                                onClick={async () => {
                                    // Prevent multiple clicks - check both global and local state
                                    if (isLoading || blockchain.isLoading || isStakingInProgress) {
                                        return;
                                    }
                                    
                                    // Set local state to prevent multiple clicks
                                    setIsStakingInProgress(true);
                                    
                                    try {
                                        await stakeTokens(stakeAmount);
                                        // Wait a bit for state to update
                                        await new Promise(resolve => setTimeout(resolve, 1000));
                                        // Force refresh to update UI
                                        await refreshUserData();
                                        // Close modal only after successful staking and refresh
                                        setIsStakingOpen(false);
                                        // Reset stake amount
                                        setStakeAmount("1");
                                    } catch (error: unknown) {
                                        const errorMessage = error instanceof Error ? error.message : "Failed to stake tokens. Please try again.";
                                        alert(errorMessage);
                                        // Don't close modal on error so user can retry
                                    } finally {
                                        // Always reset local state
                                        setIsStakingInProgress(false);
                                    }
                                }}
                                disabled={isLoading || blockchain.isLoading || isStakingInProgress || parseFloat(stakeAmount) < 1 || !stakeAmount}
                                className="w-full px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(isLoading || blockchain.isLoading || isStakingInProgress) ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Staking...
                                    </span>
                                ) : (
                                    `Stake ${stakeAmount} MON`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
