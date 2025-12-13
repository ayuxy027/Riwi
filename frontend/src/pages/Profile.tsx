import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useApp } from "../context/AppContext";

// ============================================
// Types
// ============================================

interface ProfileStats {
    reputationScore: number;
    rank: string;
    authScore: number; // 0-100
    qualityScore: number; // 0-100
    communityScore: number; // 0-100
    badges: string[];
    totalReviews: number;
    helpfulVotes: number;
    disputesWon: number;
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
};

// ============================================
// Components
// ============================================

const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 mb-2">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="50%" cy="50%" r={radius} stroke="#f3f4f6" strokeWidth="8" fill="none" />
                    <circle
                        cx="50%"
                        cy="50%"
                        r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-800">{score}</span>
                </div>
            </div>
            <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
    );
};

const Badge = ({ name }: { name: string }) => (
    <span className="px-3 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 rounded-lg text-sm font-medium border border-rose-200">
        🏆 {name}
    </span>
);



// ============================================
// Profile Page
// ============================================

const Profile = () => {
    const { isDemoMode, enableDemoMode, user } = useApp();
    const stats = isDemoMode ? DEMO_PROFILE_STATS : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50">
            <Navbar />

            <main className="pt-24 pb-16 px-6">
                <div className="max-w-5xl mx-auto">
                    {!isDemoMode ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-rose-100 shadow-sm max-w-2xl mx-auto mt-10">
                            <h2 className="text-xl font-bold text-rose-900 mb-4">View Public Profile</h2>
                            <button onClick={enableDemoMode} className="px-8 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600">
                                View Demo Profile
                            </button>
                        </div>
                    ) : stats && (
                        <div className="space-y-8 animate-fade-in-up">
                            {/* Profile Header */}
                            <div className="bg-white rounded-3xl shadow-xl border border-rose-100 overflow-hidden">
                                <div className="h-32 bg-gradient-to-r from-rose-900 to-pink-900"></div>
                                <div className="px-8 pb-8 relative">
                                    <div className="flex flex-col md:flex-row items-end md:items-center -mt-12 mb-6 gap-6">
                                        <div className="w-24 h-24 bg-rose-500 rounded-2xl border-4 border-white shadow-lg flex items-center justify-center text-4xl text-white font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                            <p className="text-rose-600 font-medium">{stats.rank}</p>
                                        </div>
                                        <div className="bg-rose-50 px-4 py-2 rounded-xl border border-rose-200">
                                            <p className="text-xs text-rose-600 uppercase tracking-wide mb-1">Total Reputation Score</p>
                                            <p className="text-3xl font-bold text-rose-900">{stats.reputationScore}</p>
                                        </div>
                                    </div>

                                    {/* Breakdown Scores */}
                                    <div className="grid grid-cols-3 gap-4 border-t border-gray-100 pt-8">
                                        <ScoreRing score={stats.authScore} label="Authenticity" color="#10b981" />
                                        <ScoreRing score={stats.qualityScore} label="Review Quality" color="#8b5cf6" />
                                        <ScoreRing score={stats.communityScore} label="Community Impact" color="#f43f5e" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-3 gap-8">
                                {/* Left Column: Badges & About */}
                                <div className="space-y-6">
                                    <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-rose-900 mb-4">Verified Badges</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {stats.badges.map(b => <Badge key={b} name={b} />)}
                                        </div>
                                    </div>

                                    {/* Activity Summary */}
                                    <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                                        <h3 className="text-lg font-bold text-rose-900 mb-4">Activity Stats</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-gray-600">Reviews Posted</span>
                                                <span className="font-bold text-gray-900">{stats.totalReviews}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                                <span className="text-gray-600">Helpful Votes</span>
                                                <span className="font-bold text-gray-900">{stats.helpfulVotes}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-gray-600">Disputes Won</span>
                                                <span className="font-bold text-gray-900">{stats.disputesWon}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Detailed Feed (Mock) */}
                                <div className="md:col-span-2 space-y-6">
                                    <h3 className="text-xl font-bold text-rose-900">Recent Contributions</h3>
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white rounded-2xl p-6 border border-rose-100 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-bold">Verified Purchase</span>
                                                <span className="text-sm text-gray-400">2 days ago</span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 mb-2">Review for: Decentralized Exchange V2</h4>
                                            <p className="text-gray-600 text-sm mb-4">
                                                "Excellent user experience and valid liquidity pools. The transaction speed on Monad is noticeable compared to other L1s. However, the UI could use..."
                                            </p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>👍 24 Helpful</span>
                                                <span>💰 Earned 35 MR</span>
                                                <span>🤖 Quality: 92/100</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Profile;
