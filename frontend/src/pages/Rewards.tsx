import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { REWARD_TIERS, getTierFromScore, type TierInfo } from "../services/api";
import { useApp } from "../context/AppContext";

// ============================================
// Tier Card Component
// ============================================

const TierCard = ({
    tier,
    isCurrentTier,
    isUnlocked
}: {
    tier: TierInfo;
    isCurrentTier: boolean;
    isUnlocked: boolean
}) => {
    const getTierGradient = (tierLevel: number) => {
        const gradients: Record<number, string> = {
            1: "from-amber-400 to-amber-600",
            2: "from-slate-300 to-slate-500",
            3: "from-yellow-400 to-amber-500",
            4: "from-cyan-400 to-blue-500",
            5: "from-rose-400 to-pink-600",
        };
        return gradients[tierLevel] || "from-gray-400 to-gray-600";
    };

    return (
        <div
            className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${isCurrentTier
                    ? "bg-gradient-to-br from-rose-50 to-pink-50 border-rose-300 shadow-xl shadow-rose-200/50"
                    : isUnlocked
                        ? "bg-white border-gray-200 hover:border-rose-200 hover:shadow-lg"
                        : "bg-gray-50 border-gray-100 opacity-60"
                }`}
        >
            {isCurrentTier && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold rounded-full shadow-md">
                        ⭐ YOUR TIER
                    </span>
                </div>
            )}

            <div className="text-center">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${getTierGradient(tier.tier)} flex items-center justify-center shadow-lg`}>
                    <span className="text-3xl">{tier.badgeEmoji}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{tier.name}</h3>
                <p className="text-sm text-gray-500 mb-4">
                    {tier.minScore} - {tier.maxScore} points
                </p>

                <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Rewards</p>
                    <ul className="space-y-1">
                        {tier.rewards.slice(0, 3).map((reward) => (
                            <li key={reward} className="text-sm text-gray-600 flex items-center gap-2">
                                <span className={isUnlocked ? "text-green-500" : "text-gray-300"}>✓</span>
                                {reward}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

// ============================================
// How It Works Section
// ============================================

const HowItWorks = () => {
    const steps = [
        {
            icon: "🔗",
            title: "Build Reputation",
            description: "Engage across multiple chains to build your reputation score"
        },
        {
            icon: "📊",
            title: "Track Progress",
            description: "Monitor your score and see how you rank against tiers"
        },
        {
            icon: "🏆",
            title: "Unlock Rewards",
            description: "Reach new tiers to unlock exclusive perks and benefits"
        },
        {
            icon: "🎁",
            title: "Claim Benefits",
            description: "Access partner discounts, DAO voting, and more"
        },
    ];

    return (
        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
            <h2 className="text-2xl font-bold text-rose-900 text-center mb-8">
                How Rewards Work
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
                {steps.map((step, index) => (
                    <div key={step.title} className="text-center">
                        <div className="w-14 h-14 mx-auto mb-4 bg-white rounded-xl flex items-center justify-center shadow-md">
                            <span className="text-2xl">{step.icon}</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className="w-6 h-6 bg-rose-500 text-white rounded-full text-sm font-bold flex items-center justify-center">
                                {index + 1}
                            </span>
                            <h3 className="font-semibold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================
// Rewards Page Component
// ============================================

const Rewards = () => {
    const { isDemoMode, user } = useApp();
    const [currentScore, setCurrentScore] = useState<number>(850);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isDemoMode) {
            setCurrentScore(850);
        }
    }, [isDemoMode]);

    const currentTier = getTierFromScore(currentScore);

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
                            <span className="bg-gradient-to-r from-rose-900 via-rose-800 to-pink-900 bg-clip-text text-transparent">
                                Rewards & Tiers
                            </span>
                        </h1>
                        <p className="text-rose-700 max-w-2xl mx-auto">
                            Unlock exclusive benefits as you build your cross-chain reputation
                        </p>
                    </div>

                    {/* Current Status */}
                    {isDemoMode && (
                        <div className="mb-8 p-6 bg-white rounded-2xl shadow-lg border border-rose-100">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-3xl">{currentTier.badgeEmoji}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Your Current Tier</p>
                                        <p className="text-2xl font-bold text-gray-900">{currentTier.name}</p>
                                        <p className="text-sm text-rose-600">{currentScore}/1000 points</p>
                                    </div>
                                </div>
                                <div className="text-center md:text-right">
                                    <p className="text-sm text-gray-500 mb-2">Progress to next tier</p>
                                    <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500"
                                            style={{ width: `${((currentScore - currentTier.minScore) / (currentTier.maxScore - currentTier.minScore)) * 100}%` }}
                                        />
                                    </div>
                                    {currentTier.tier < 5 && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            {currentTier.maxScore - currentScore + 1} points to {REWARD_TIERS[currentTier.tier].name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* How It Works */}
                    <div className="mb-12">
                        <HowItWorks />
                    </div>

                    {/* Tiers Grid */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                            Reward Tiers
                        </h2>
                        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
                            {REWARD_TIERS.map((tier) => (
                                <TierCard
                                    key={tier.tier}
                                    tier={tier}
                                    isCurrentTier={tier.tier === currentTier.tier}
                                    isUnlocked={currentScore >= tier.minScore}
                                />
                            ))}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center">
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all font-medium shadow-lg shadow-rose-200/50"
                        >
                            <span>📊</span>
                            View Your Dashboard
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Rewards;
