import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";
import { getReputation, type ReputationData } from "../services/reputation";
import {
    getTierFromScore,
    getScoreColor,
    getScoreLabel,
    type TierInfo
} from "../services/api";

// ============================================
// Demo Data
// ============================================

const DEMO_REPUTATION_DATA: ReputationData = {
    owner: "Demo User",
    score: 850,
    level: "Diamond",
    lastUpdated: Date.now(),
    badges: ["Early Adopter", "Community Leader", "Verified User", "Cross-Chain Pioneer"],
    history: [
        { date: "2024-01", score: 100 },
        { date: "2024-03", score: 250 },
        { date: "2024-06", score: 450 },
        { date: "2024-09", score: 650 },
        { date: "2024-12", score: 850 },
    ],
};

// ============================================
// Score Card Component
// ============================================

const ScoreCard = ({ score, tier }: { score: number; tier: TierInfo }) => {
    const percentage = (score / 1000) * 100;

    return (
        <div className="bg-gradient-to-br from-white to-rose-50 rounded-2xl shadow-xl p-8 border border-rose-100">
            <div className="text-center">
                <p className="text-sm font-medium text-rose-600 mb-2">Overall Reputation Score</p>
                <div className="relative w-40 h-40 mx-auto mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="currentColor"
                            strokeWidth="12"
                            fill="none"
                            className="text-rose-100"
                        />
                        <circle
                            cx="80"
                            cy="80"
                            r="70"
                            stroke="url(#gradient)"
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            strokeDasharray={`${percentage * 4.4} 440`}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f43f5e" />
                                <stop offset="100%" stopColor="#ec4899" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-rose-900">{score}</span>
                        <span className="text-sm text-rose-600">/1000</span>
                    </div>
                </div>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-3xl">{tier.badgeEmoji}</span>
                    <span className={`text-lg font-bold ${getScoreColor(score)}`}>
                        {getScoreLabel(score)} - {tier.name}
                    </span>
                </div>
            </div>
        </div>
    );
};

// ============================================
// Badges Component
// ============================================

const BadgesSection = ({ badges }: { badges: string[] }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-rose-100">
        <h3 className="text-lg font-semibold text-rose-900 mb-4">🏆 Achievements</h3>
        <div className="flex flex-wrap gap-2">
            {badges.map((badge, index) => (
                <span
                    key={badge}
                    className="px-3 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 rounded-full text-sm font-medium border border-rose-200"
                    style={{ animationDelay: `${index * 100}ms` }}
                >
                    ✨ {badge}
                </span>
            ))}
        </div>
    </div>
);

// ============================================
// Progress History Component
// ============================================

const ProgressHistory = ({ history }: { history: { date: string; score: number }[] }) => (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-rose-100">
        <h3 className="text-lg font-semibold text-rose-900 mb-4">📈 Score History</h3>
        <div className="space-y-3">
            {history.map((entry, index) => (
                <div key={entry.date} className="flex items-center gap-4">
                    <span className="text-sm text-rose-600 w-20">{entry.date}</span>
                    <div className="flex-1 h-2 bg-rose-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                            style={{
                                width: `${(entry.score / 1000) * 100}%`,
                                animationDelay: `${index * 100}ms`
                            }}
                        />
                    </div>
                    <span className="text-sm font-medium text-rose-900 w-12 text-right">{entry.score}</span>
                </div>
            ))}
        </div>
    </div>
);

// ============================================
// Quick Stats Component
// ============================================

const QuickStats = ({ data }: { data: ReputationData }) => {
    const stats = [
        { label: "Current Level", value: data.level, icon: "🎯" },
        { label: "Total Badges", value: data.badges.length.toString(), icon: "🏅" },
        { label: "Last Updated", value: new Date(data.lastUpdated).toLocaleDateString(), icon: "📅" },
        { label: "Growth Rate", value: "+15%", icon: "📊" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl p-4 border border-rose-100 shadow-sm text-center hover:shadow-md transition-shadow">
                    <span className="text-2xl mb-2 block">{stat.icon}</span>
                    <p className="text-lg font-bold text-rose-900">{stat.value}</p>
                    <p className="text-xs text-rose-600">{stat.label}</p>
                </div>
            ))}
        </div>
    );
};

// ============================================
// Dashboard Page Component (No Web3)
// ============================================

const Dashboard = () => {
    const { isDemoMode, enableDemoMode, user } = useApp();
    const [reputationData, setReputationData] = useState<ReputationData | null>(
        isDemoMode ? DEMO_REPUTATION_DATA : null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleScan = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getReputation(user.address);
            setReputationData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch reputation");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRescan = () => {
        setReputationData(null);
        setError(null);
    };

    const tier = reputationData ? getTierFromScore(reputationData.score) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-4xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 bg-clip-text text-transparent">
                                Reputation Dashboard
                            </span>
                        </h1>
                        <p className="text-rose-700 max-w-2xl mx-auto">
                            Discover your unified cross-chain reputation score and achievements
                        </p>
                    </div>

                    {!isDemoMode && !reputationData && (
                        <div className="mb-8 p-6 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl text-center">
                            <p className="text-amber-900 font-medium mb-3">
                                🧪 Try Demo Mode to explore all features
                            </p>
                            <button
                                onClick={enableDemoMode}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-xl hover:from-amber-600 hover:to-yellow-600 transition-all font-medium shadow-lg shadow-amber-200/50"
                            >
                                Enable Demo Mode
                            </button>
                        </div>
                    )}

                    {/* Main Content */}
                    {reputationData && tier ? (
                        <div className="space-y-6 animate-fade-in-up">
                            {/* Quick Stats */}
                            <QuickStats data={reputationData} />

                            {/* Score and Badges Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <ScoreCard score={reputationData.score} tier={tier} />
                                <BadgesSection badges={reputationData.badges} />
                            </div>

                            {/* Progress History */}
                            <ProgressHistory history={reputationData.history} />

                            {/* Actions */}
                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleRescan}
                                    className="px-6 py-3 bg-white border-2 border-rose-200 text-rose-700 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all font-medium"
                                >
                                    🔄 Refresh Data
                                </button>
                                <button
                                    onClick={() => window.location.href = "/profile"}
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-rose-200/50"
                                >
                                    View Full Profile →
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* No Data State */
                        <div className="bg-white rounded-2xl shadow-xl p-12 border border-rose-100 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-rose-900 mb-3">
                                Check Your Reputation
                            </h2>
                            <p className="text-rose-600 mb-8 max-w-md mx-auto">
                                Get insights into your cross-chain activity and earn reputation badges
                            </p>
                            <button
                                onClick={handleScan}
                                disabled={isLoading}
                                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-rose-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Scanning...
                                    </span>
                                ) : (
                                    "🔍 Scan My Reputation"
                                )}
                            </button>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
                            <p className="text-red-700">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
