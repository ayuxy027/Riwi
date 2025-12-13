import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useApp } from '../context/AppContext';
import {
    getCashoutInfo,
    getUserCashoutStats,
    calculateCashoutAmount,
    cashoutRvtToMon,
    checkCashoutDeployed,
    type CashoutInfo,
    type UserCashoutStats,
} from '../services/blockchainService';

// ============================================
// Icons
// ============================================

const Icons = {
    Coins: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
            <path d="M18.09 10.37A6 6 0 1 1 10.34 18" stroke="currentColor" strokeWidth="2" />
            <path d="M7 6h4M8 8V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    Exchange: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    Wallet: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M21 12V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-5z" stroke="currentColor" strokeWidth="2" />
            <path d="M16 12a1 1 0 102 0 1 1 0 00-2 0z" fill="currentColor" />
        </svg>
    ),
    Chart: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path d="M18 20V10M12 20V4M6 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
};

// ============================================
// Stat Card Component
// ============================================

const StatCard = ({ icon: Icon, label, value, highlight = false }: {
    icon: React.FC;
    label: string;
    value: string | number;
    highlight?: boolean;
}) => (
    <div className="flex items-center gap-4 p-4 bg-gray-50/80 rounded-xl hover:bg-gray-100/80 transition-colors">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${highlight ? 'bg-[#6E54FF] text-white' : 'bg-white text-[#6E54FF]'
            }`}>
            <Icon />
        </div>
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`text-lg font-bold ${highlight ? 'text-[#6E54FF]' : 'text-gray-900'}`}>{value}</p>
        </div>
    </div>
);

// ============================================
// Cashout Page
// ============================================

export default function Cashout() {
    const { user, walletClient, connectWallet, isLoading: appLoading } = useApp();
    const walletAddress = user.address;
    const isConnected = user.connected;

    // State
    const [cashoutInfo, setCashoutInfo] = useState<CashoutInfo | null>(null);
    const [userStats, setUserStats] = useState<UserCashoutStats | null>(null);
    const [amount, setAmount] = useState('');
    const [expectedMon, setExpectedMon] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState<'idle' | 'approving' | 'cashing-out'>('idle');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Load cashout info and user stats
    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const info = await getCashoutInfo();
            setCashoutInfo(info);

            if (walletAddress) {
                const stats = await getUserCashoutStats(walletAddress);
                setUserStats(stats);
            }
        } catch (err) {
            console.error('Error loading cashout data:', err);
            setError('Failed to load cashout information');
        } finally {
            setLoading(false);
        }
    }, [walletAddress]);

    // Calculate expected MON when amount changes
    useEffect(() => {
        const calculate = async () => {
            if (!amount || parseFloat(amount) <= 0) {
                setExpectedMon(0);
                return;
            }

            try {
                const mon = await calculateCashoutAmount(amount);
                setExpectedMon(mon);
            } catch (err) {
                console.error('Error calculating cashout:', err);
                setExpectedMon(0);
            }
        };

        calculate();
    }, [amount]);

    // Load data on mount and when wallet changes
    useEffect(() => {
        loadData();
    }, [loadData]);

    // Handle cashout
    const handleCashout = async () => {
        if (!walletClient || !walletAddress) {
            setError('Please connect your wallet first');
            return;
        }

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            setProcessing(true);
            setProcessingStep('approving');
            setError(null);
            setSuccess(null);

            const txHash = await cashoutRvtToMon(
                amount,
                walletClient,
                walletAddress,
                () => setProcessingStep('cashing-out')
            );

            setSuccess(`Cashout successful! TX: ${txHash.slice(0, 10)}...${txHash.slice(-8)}`);
            setAmount('');
            setExpectedMon(0);

            // Reload data after successful cashout
            await loadData();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Cashout failed';
            setError(errorMessage);
        } finally {
            setProcessing(false);
            setProcessingStep('idle');
        }
    };

    // Set max amount
    const handleSetMax = () => {
        if (userStats && cashoutInfo) {
            const maxUserCan = Math.min(
                userStats.rvtBalance,
                cashoutInfo.maxCashoutAmount,
                cashoutInfo.maxCashoutAvailable
            );
            setAmount(maxUserCan.toString());
        }
    };

    // Render not deployed state
    if (!checkCashoutDeployed()) {
        return (
            <div className="min-h-screen bg-white">
                <Navbar />
                <main className="pt-24 pb-20">
                    <div className="max-w-4xl mx-auto px-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div className="w-20 h-20 bg-[#6E54FF]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-[#6E54FF]">
                                <span className="text-4xl">🚧</span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Coming Soon!</h2>
                            <p className="text-gray-500 mb-8 max-w-md mx-auto">
                                The cashout feature is being deployed. You'll soon be able to
                                exchange your earned RVT tokens for MON.
                            </p>
                            <div className="bg-gray-50 rounded-xl p-6 max-w-sm mx-auto">
                                <p className="text-sm text-gray-600 mb-2">📌 Keep earning RVT by writing quality reviews</p>
                                <p className="text-sm text-gray-600">📌 Cashout will be available after contract deployment</p>
                            </div>
                        </motion.div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <main className="pt-24 pb-20">
                <div className="max-w-4xl mx-auto px-6">
                    {/* Not Connected State */}
                    {!isConnected || !walletAddress ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-24"
                        >
                            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gray-400">
                                <Icons.Wallet />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">Cash Out Your RVT</h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Connect your MetaMask wallet to exchange your RVT tokens for MON.
                            </p>
                            <button
                                onClick={connectWallet}
                                disabled={appLoading}
                                className="px-6 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {appLoading ? "Connecting..." : "Connect MetaMask"}
                            </button>
                        </motion.div>
                    ) : loading ? (
                        // Loading State
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-24"
                        >
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#6E54FF] border-t-transparent mb-4"></div>
                            <p className="text-gray-500">Loading cashout information...</p>
                        </motion.div>
                    ) : (
                        // Main Content
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-center mb-12"
                            >
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">Cash Out RVT</h1>
                                <p className="text-gray-500">Exchange your Review Tokens for MON</p>
                            </motion.div>

                            {/* Disabled Banner */}
                            {cashoutInfo && !cashoutInfo.cashoutEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-center mb-8"
                                >
                                    ⚠️ Cashout is temporarily disabled. Please try again later.
                                </motion.div>
                            )}

                            {/* Stats Grid */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                            >
                                <StatCard
                                    icon={Icons.Exchange}
                                    label="Exchange Rate"
                                    value={`1:${cashoutInfo?.exchangeRate.toFixed(4) || '0'}`}
                                />
                                <StatCard
                                    icon={Icons.Wallet}
                                    label="Treasury"
                                    value={`${cashoutInfo?.treasuryBalance.toFixed(2) || '0'} MON`}
                                />
                                <StatCard
                                    icon={Icons.Coins}
                                    label="Your Balance"
                                    value={`${userStats?.rvtBalance.toFixed(2) || '0'} RVT`}
                                    highlight
                                />
                                <StatCard
                                    icon={Icons.Chart}
                                    label="Total Cashed Out"
                                    value={`${userStats?.rvtCashedOut.toFixed(2) || '0'} RVT`}
                                />
                            </motion.div>

                            {/* Cashout Form */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-gray-50/50 rounded-2xl p-6 mb-8"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Exchange RVT for MON</h3>

                                {/* Amount Input */}
                                <div className="mb-6">
                                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                                        Amount (RVT)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            id="amount"
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter RVT amount"
                                            disabled={processing || !cashoutInfo?.cashoutEnabled}
                                            className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6E54FF]/20 focus:border-[#6E54FF] transition-all disabled:opacity-50"
                                            min={cashoutInfo?.minCashoutAmount || 1}
                                            max={Math.min(
                                                userStats?.rvtBalance || 0,
                                                cashoutInfo?.maxCashoutAmount || 10000
                                            )}
                                        />
                                        <button
                                            onClick={handleSetMax}
                                            disabled={processing}
                                            className="px-4 py-3 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all disabled:opacity-50"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Min: {cashoutInfo?.minCashoutAmount || 1} RVT | Max:{' '}
                                        {Math.min(
                                            cashoutInfo?.maxCashoutAmount || 10000,
                                            cashoutInfo?.maxCashoutAvailable || 10000
                                        ).toFixed(0)}{' '}
                                        RVT
                                    </p>
                                </div>

                                {/* Preview */}
                                <div className="bg-white border border-gray-100 rounded-xl p-4 mb-6">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-sm text-gray-500">You send</span>
                                        <span className="font-bold text-gray-900">{amount || '0'} RVT</span>
                                    </div>
                                    <div className="flex justify-center my-2">
                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                            ↓
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">You receive</span>
                                        <span className="font-bold text-[#6E54FF]">~{expectedMon.toFixed(4)} MON</span>
                                    </div>
                                </div>

                                {/* Error/Success Messages */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm mb-4">
                                        {success}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={handleCashout}
                                    disabled={
                                        processing ||
                                        !amount ||
                                        parseFloat(amount) <= 0 ||
                                        !cashoutInfo?.cashoutEnabled
                                    }
                                    className="w-full px-6 py-4 bg-[#6E54FF] text-white rounded-xl font-medium hover:bg-[#5a42de] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                            {processingStep === 'approving' ? 'Approving RVT...' : 'Processing Cashout...'}
                                        </>
                                    ) : (
                                        <>💸 Cash Out</>
                                    )}
                                </button>
                            </motion.div>

                            {/* Cashout History */}
                            {userStats && userStats.rvtCashedOut > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-green-50 rounded-2xl p-6 mb-8"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Your Cashout History</h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Total RVT Cashed Out</p>
                                            <p className="text-xl font-bold text-gray-900">{userStats.rvtCashedOut.toFixed(2)} RVT</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase mb-1">Total MON Received</p>
                                            <p className="text-xl font-bold text-green-600">{userStats.monReceived.toFixed(4)} MON</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Info Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[#6E54FF]/5 rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-bold text-gray-900 mb-4">ℹ️ How Cashout Works</h3>
                                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside mb-4">
                                    <li>Enter the amount of RVT you want to exchange</li>
                                    <li>Approve the transaction to allow the contract to use your RVT</li>
                                    <li>Confirm the cashout transaction</li>
                                    <li>Receive MON directly in your wallet!</li>
                                </ol>
                                <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                                    Note: The exchange rate is fixed at{' '}
                                    <strong className="text-[#6E54FF]">1 RVT = {cashoutInfo?.exchangeRate.toFixed(4) || '0.01'} MON</strong>.
                                    Rate may be updated by the platform.
                                </p>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
