import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
    getTierFromScore,
    REWARD_TIERS,
    type TierInfo,
    type ChainScoreBreakdown,
} from "../services/api";
import { useApp, truncateAddress } from "../context/AppContext";

// ============================================
// Demo Data for Elite User Profile
// ============================================

const DEMO_PROFILE = {
    overallScore: 912,
    stellar: {
        address: "GBZXN7PIRZGNMHGA7MUUUF4GWPY5AYPV6LY4UV2GL6VJGIQRXFDNMADI",
        score: 467,
        scoreBreakdown: {
            volumeScore: 95,
            uniqueRecipientsScore: 88,
            frequencyScore: 92,
            accountAgeScore: 98,
            diversityScore: 94,
        },
        stats: {
            transactions: 1247,
            volume: "125,430 XLM",
            accountAge: "2+ years",
        },
    },
    polkadot: {
        address: "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
        score: 445,
        scoreBreakdown: {
            volumeScore: 87,
            uniqueRecipientsScore: 92,
            frequencyScore: 85,
            accountAgeScore: 96,
            diversityScore: 85,
        },
        stats: {
            votes: 45,
            staked: "12,500 DOT",
            nominations: 8,
        },
    },
    badges: ["Early Adopter", "Cross-Chain Pioneer", "Governance Champion", "Diamond Trader", "Community Leader"],
    joinedDate: "2022-03-15",
};

// ============================================
// Score Ring Component
// ============================================

const ScoreRing = ({
    score,
    maxScore = 1000,
    size = "large"
}: {
    score: number;
    maxScore?: number;
    size?: "small" | "large"
}) => {
    const percentage = (score / maxScore) * 100;
    const radius = size === "large" ? 70 : 40;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = (percentage / 100) * circumference;

    return (
        <div className={`relative ${size === "large" ? "w-40 h-40" : "w-24 h-24"}`}>
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={size === "large" ? 12 : 8}
                    fill="none"
                    className="text-rose-100"
                />
                <circle
                    cx="50%"
                    cy="50%"
                    r={radius}
                    stroke="url(#scoreGradient)"
                    strokeWidth={size === "large" ? 12 : 8}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                />
                <defs>
                    <linearGradient id="scoreGradient">
                        <stop offset="0%" stopColor="#f43f5e" />
                        <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-bold text-rose-900 ${size === "large" ? "text-3xl" : "text-xl"}`}>
                    {score}
                </span>
                <span className={`text-rose-500 ${size === "large" ? "text-sm" : "text-xs"}`}>
                    /{maxScore}
                </span>
            </div>
        </div>
    );
};

// ============================================
// Tier Progress Component
// ============================================

const TierProgress = ({
    currentScore,
    currentTier
}: {
    currentScore: number;
    currentTier: TierInfo
}) => {
    const nextTier = REWARD_TIERS.find((t) => t.tier === currentTier.tier + 1);
    const progress = ((currentScore - currentTier.minScore) / (currentTier.maxScore - currentTier.minScore)) * 100;

    return (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
            <h3 className="text-lg font-semibold text-rose-900 mb-4">Tier Progress</h3>
            <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentTier.badgeEmoji}</span>
                    <span className="font-medium text-gray-900">{currentTier.name}</span>
                </div>
                <div className="flex-1 h-3 bg-rose-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>
                {nextTier && (
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{nextTier.badgeEmoji}</span>
                        <span className="font-medium text-gray-400">{nextTier.name}</span>
                    </div>
                )}
            </div>
            {nextTier && (
                <p className="text-sm text-rose-600 text-center">
                    {nextTier.minScore - currentScore} points to reach {nextTier.name} tier
                </p>
            )}
        </div>
    );
};

// ============================================
// Chain Stats Card
// ============================================

const ChainStatsCard = ({
    chain,
    address,
    score,
    breakdown,
    stats,
}: {
    chain: "stellar" | "polkadot";
    address: string;
    score: number;
    breakdown: ChainScoreBreakdown;
    stats: Record<string, string | number>;
}) => {
    const chainConfig = {
        stellar: {
            name: "Stellar",
            color: "from-blue-500 to-indigo-600",
            bgColor: "from-blue-50 to-indigo-50",
            icon: "⭐",
        },
        polkadot: {
            name: "Polkadot",
            color: "from-pink-500 to-purple-600",
            bgColor: "from-pink-50 to-purple-50",
            icon: "🔴",
        },
    };

    const config = chainConfig[chain];

    return (
        <div className={`bg-gradient-to-br ${config.bgColor} rounded-2xl p-6 border border-gray-100`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-gradient-to-br ${config.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-xl">{config.icon}</span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">{config.name}</h3>
                        <code className="text-xs text-gray-500">{truncateAddress(address, 8, 6)}</code>
                    </div>
                </div>
                <ScoreRing score={score} maxScore={500} size="small" />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="bg-white/60 rounded-xl p-3 text-center">
                        <p className="text-lg font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-600 uppercase">Score Breakdown</p>
                {Object.entries(breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-28 capitalize">{key.replace("Score", "")}</span>
                        <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-gradient-to-r ${config.color} rounded-full`}
                                style={{ width: `${value}%` }}
                            />
                        </div>
                        <span className="text-xs font-medium text-gray-700 w-8">{value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// Badges Grid
// ============================================

const BadgesGrid = ({ badges }: { badges: string[] }) => (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-rose-100">
        <h3 className="text-lg font-semibold text-rose-900 mb-4">🏆 Achievements</h3>
        <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
                <span
                    key={badge}
                    className="px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 rounded-full text-sm font-medium border border-rose-200 hover:scale-105 transition-transform cursor-default"
                >
                    ✨ {badge}
                </span>
            ))}
        </div>
    </div>
);

// ============================================
// Profile Page Component
// ============================================

const Profile = () => {
    const { isDemoMode, user, enableDemoMode } = useApp();
    const [showAllPerks, setShowAllPerks] = useState(false);

    const profileData = isDemoMode ? DEMO_PROFILE : null;
    const currentTier = profileData ? getTierFromScore(profileData.overallScore) : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 bg-clip-text text-transparent">
                                Your Profile
                            </span>
                        </h1>
                        <p className="text-rose-700 max-w-2xl mx-auto">
                            View your complete cross-chain reputation profile and achievements
                        </p>
                    </div>

                    {!isDemoMode ? (
                        <div className="bg-white rounded-2xl shadow-xl p-12 border border-rose-100 text-center">
                            <div className="w-24 h-24 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-rose-900 mb-3">
                                Enable Demo Mode
                            </h2>
                            <p className="text-rose-600 mb-8 max-w-md mx-auto">
                                Enable demo mode to explore your profile and see all features in action
                            </p>
                            <button
                                onClick={enableDemoMode}
                                className="px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-rose-200/50"
                            >
                                🧪 Enable Demo Mode
                            </button>
                        </div>
                    ) : profileData && currentTier ? (
                        <div className="space-y-6">
                            {/* Profile Header */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 border border-rose-100">
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="relative">
                                        <ScoreRing score={profileData.overallScore} size="large" />
                                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                            <span className="text-2xl">{currentTier.badgeEmoji}</span>
                                        </div>
                                    </div>
                                    <div className="text-center md:text-left">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                                            <span className="px-3 py-1 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 rounded-full text-sm font-medium">
                                                {currentTier.name} Tier
                                            </span>
                                        </div>
                                        <p className="text-gray-500 mb-4">
                                            Member since {new Date(profileData.joinedDate).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.badges.slice(0, 3).map((badge) => (
                                                <span key={badge} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                    {badge}
                                                </span>
                                            ))}
                                            {profileData.badges.length > 3 && (
                                                <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs">
                                                    +{profileData.badges.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tier Progress */}
                            <TierProgress currentScore={profileData.overallScore} currentTier={currentTier} />

                            {/* Chain Stats */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <ChainStatsCard
                                    chain="stellar"
                                    address={profileData.stellar.address}
                                    score={profileData.stellar.score}
                                    breakdown={profileData.stellar.scoreBreakdown}
                                    stats={profileData.stellar.stats}
                                />
                                <ChainStatsCard
                                    chain="polkadot"
                                    address={profileData.polkadot.address}
                                    score={profileData.polkadot.score}
                                    breakdown={profileData.polkadot.scoreBreakdown}
                                    stats={profileData.polkadot.stats}
                                />
                            </div>

                            {/* Badges */}
                            <BadgesGrid badges={profileData.badges} />

                            {/* Actions */}
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    to="/dashboard"
                                    className="px-6 py-3 bg-white border-2 border-rose-200 text-rose-700 rounded-xl hover:bg-rose-50 hover:border-rose-300 transition-all font-medium"
                                >
                                    📊 View Dashboard
                                </Link>
                                <Link
                                    to="/rewards"
                                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-rose-200/50"
                                >
                                    🏆 View Rewards →
                                </Link>
                            </div>
                        </div>
                    ) : null}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Profile;
