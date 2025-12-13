// ============================================
// Mock Reputation Service (No Web3 Dependencies)
// ============================================

export interface SBTReputation {
    owner: string;
    score: number;
    level: string;
    lastUpdated: number;
    exists: boolean;
}

export interface ReputationData {
    owner: string;
    score: number;
    level: string;
    lastUpdated: number;
    badges: string[];
    history: { date: string; score: number }[];
}

// ============================================
// Mock Data
// ============================================

const DEMO_REPUTATION: ReputationData = {
    owner: "0xDemo...1234",
    score: 850,
    level: "Diamond",
    lastUpdated: Date.now(),
    badges: ["Early Adopter", "Community Leader", "Verified User"],
    history: [
        { date: "2024-01", score: 100 },
        { date: "2024-03", score: 250 },
        { date: "2024-06", score: 450 },
        { date: "2024-09", score: 650 },
        { date: "2024-12", score: 850 },
    ],
};

// ============================================
// Mock API Functions
// ============================================

/**
 * Get reputation data for an address (mock)
 */
export async function getReputation(address: string): Promise<ReputationData> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
        ...DEMO_REPUTATION,
        owner: address || DEMO_REPUTATION.owner,
    };
}

/**
 * Verify ownership of SBT (mock)
 */
export async function verifyOwnership(address: string): Promise<SBTReputation | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (!address) return null;

    return {
        owner: address,
        score: 850,
        level: "Diamond",
        lastUpdated: Date.now(),
        exists: true,
    };
}

/**
 * Mint SBT (mock - returns success)
 */
export async function mintSBT(address: string, score: number): Promise<{ success: boolean; txHash: string }> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return {
        success: true,
        txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    };
}

/**
 * Update score (mock)
 */
export async function updateScore(address: string, newScore: number): Promise<{ success: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return { success: true };
}

/**
 * Get total supply of SBTs (mock)
 */
export async function getTotalSupply(): Promise<number> {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return 12847;
}

/**
 * Get level from score
 */
export function getLevelFromScore(score: number): string {
    if (score >= 900) return "Elite";
    if (score >= 750) return "Diamond";
    if (score >= 500) return "Gold";
    if (score >= 250) return "Silver";
    return "Bronze";
}

export default {
    getReputation,
    verifyOwnership,
    mintSBT,
    updateScore,
    getTotalSupply,
    getLevelFromScore,
};
