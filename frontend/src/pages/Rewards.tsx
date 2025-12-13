import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";

// ============================================
// Types & Demo Data
// ============================================

interface RewardTransaction {
    id: string;
    source: string;
    amount: number;
    date: string;
    status: "Completed" | "Processing";
}

const DEMO_TRANSACTIONS: RewardTransaction[] = [
    { id: "tx-1", source: "Review Reward - DeFi Exchange Pro", amount: 50, date: "2 hrs ago", status: "Completed" },
    { id: "tx-2", source: "Review Reward - Monad Wallet", amount: 35, date: "1 day ago", status: "Completed" },
    { id: "tx-3", source: "Weekly Top Reviewer Bonus", amount: 100, date: "3 days ago", status: "Completed" },
    { id: "tx-4", source: "Review Reward - NFT Marketplace", amount: 20, date: "3 days ago", status: "Completed" },
    { id: "tx-5", source: "Staking Reward (APY)", amount: 12.5, date: "1 week ago", status: "Completed" },
];

const REPUTATION_MULTIPLIERS = [
    { level: "Novice", multiplier: "1.0x", minScore: 0, benefits: ["Basic Rewards"] },
    { level: "Verified", multiplier: "1.2x", minScore: 100, benefits: ["+20% Rewards", "Basic Badge"] },
    { level: "Expert", multiplier: "1.5x", minScore: 500, benefits: ["+50% Rewards", "Expert Badge", "Priority AI Check"] },
    { level: "Authority", multiplier: "2.0x", minScore: 1000, benefits: ["2x Rewards", "Authority Badge", "Governance Vote"] },
];

// ============================================
// Components
// ============================================

const RewardCard = ({ label, value, subtext, highlight = false }: { label: string; value: string; subtext?: string; highlight?: boolean }) => (
    <div className={`p-6 rounded-2xl border transition-all hover:shadow-lg ${highlight ? "bg-[#6E54FF] text-white border-[#6E54FF] shadow-lg shadow-[#6E54FF]/20" : "bg-white border-gray-100 hover:border-[#6E54FF]/30"}`}>
        <p className={`text-sm font-medium mb-1 ${highlight ? "text-white/80" : "text-gray-500"}`}>{label}</p>
        <h3 className="text-3xl font-bold mb-2">{value}</h3>
        {subtext && <p className={`text-xs ${highlight ? "text-white/60" : "text-gray-400"}`}>{subtext}</p>}
    </div>
);

const TransactionRow = ({ tx }: { tx: RewardTransaction }) => (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50/80 rounded-xl transition-colors border-b border-gray-50 last:border-0 hover:border-gray-200">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#6E54FF]/10 text-[#6E54FF] rounded-full flex items-center justify-center text-lg">
                💸
            </div>
            <div>
                <p className="font-semibold text-gray-900">{tx.source}</p>
                <p className="text-xs text-gray-500">{tx.date} • {tx.id}</p>
            </div>
        </div>
        <div className="text-right">
            <p className="font-bold text-green-600">+{tx.amount} MR</p>
            <p className="text-xs text-gray-400">{tx.status}</p>
        </div>
    </div>
);

const LevelCard = ({ level, currentScore }: { level: typeof REPUTATION_MULTIPLIERS[0], currentScore: number }) => {
    const isUnlocked = currentScore >= level.minScore;
    const isCurrent = currentScore >= level.minScore && (REPUTATION_MULTIPLIERS.find(l => l.minScore > level.minScore)?.minScore || Infinity) > currentScore;

    return (
        <div className={`relative p-6 rounded-2xl border-2 transition-all duration-300 ${isCurrent ? "border-[#6E54FF] bg-white shadow-xl shadow-[#6E54FF]/10 scale-105 z-10" :
            isUnlocked ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50 opacity-60"
            }`}>
            {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#6E54FF] text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                    Current Level
                </div>
            )}
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-900">{level.level}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded ${isCurrent ? "bg-[#6E54FF]/10 text-[#6E54FF]" : "bg-gray-100 text-gray-600"}`}>
                    {level.multiplier} Reward
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-4">Requires {level.minScore}+ Reputation</p>
            <ul className="space-y-2">
                {level.benefits.map(b => (
                    <li key={b} className="text-sm flex items-center gap-2 text-gray-700">
                        <span className="text-green-500 font-bold">✓</span> {b}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// ============================================
// Rewards Page
// ============================================

const Rewards = () => {
    const { isDemoMode, enableDemoMode, user } = useApp();
    // Mock Score
    const currentScore = isDemoMode ? 650 : 0; // "Expert" level

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3 tracking-tight">Rewards & Earnings</h1>
                        <p className="text-gray-500 text-lg">Track your earnings and level up your reputation multiplier.</p>
                    </div>

                    {!isDemoMode ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-2xl mx-auto">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Connect to see your stats</h2>
                            <button onClick={enableDemoMode} className="px-8 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] hover:shadow-lg transition-all">
                                View Demo Data
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Earnings Overview */}
                            <div className="grid md:grid-cols-3 gap-6 mb-12 animate-fade-in-up">
                                <RewardCard
                                    label="Available Balance"
                                    value="2,450 MR"
                                    subtext="≈ $122.50 USD"
                                    highlight
                                />
                                <RewardCard
                                    label="Lifetime Earnings"
                                    value="5,890 MR"
                                    subtext="Since Jan 2024"
                                />
                                <RewardCard
                                    label="Pending Rewards"
                                    value="150 MR"
                                    subtext="Processing on Monad..."
                                />
                            </div>

                            {/* Reputation Levels */}
                            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reputation Multipliers</h2>
                                <div className="grid md:grid-cols-4 gap-4">
                                    {REPUTATION_MULTIPLIERS.map((level) => (
                                        <LevelCard key={level.level} level={level} currentScore={currentScore} />
                                    ))}
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Payouts</h2>
                                    <button className="text-sm text-[#6E54FF] hover:text-[#5a42de] font-bold">View Explorer ↗</button>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {DEMO_TRANSACTIONS.map((tx) => (
                                        <TransactionRow key={tx.id} tx={tx} />
                                    ))}
                                </div>
                                <div className="p-4 text-center bg-gray-50 border-t border-gray-100">
                                    <p className="text-xs text-gray-400">Transaction processing provided by Monad high-throughput blockchain</p>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Rewards;
