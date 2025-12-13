// ============================================
// API Service for MonadReview
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// ============================================
// Types
// ============================================

export interface Review {
  id: string;
  productId: string;
  productName: string;
  reviewer: string;
  content: string;
  rating: number;
  qualityScore: number; // AI score 0-100
  rewardAmount: number;
  status: "Pending" | "Verified" | "Rejected";
  timestamp: number;
  txHash?: string;
}

export interface UserReputation {
  address: string;
  overallScore: number; // 0-1000
  rank: string;
  totalReviews: number;
  totalRewards: number; // MR tokens
  stakedAmount: number;
  badges: string[];
  joinedAt: number;
}

export interface ReviewSubmission {
  productId: string;
  content: string;
  rating: number;
  stakeAmount: number;
}

export interface BreakdownScore {
  authenticity: number;
  helpfulness: number;
  detail: number;
  tone: number;
}

export interface AIAnalysisResult {
  isAuthentic: boolean;
  score: number;
  feedback: string[];
  breakdown: BreakdownScore;
}

// ============================================
// Reward Tiers System
// ============================================

export type RewardTier = 1 | 2 | 3 | 4 | 5;

export interface TierInfo {
  tier: RewardTier;
  name: string;
  minScore: number;
  maxScore: number;
  badge: string;
  badgeEmoji: string;
  rewards: string[];
  perks: string[];
  color: string;
}

export const REWARD_TIERS: TierInfo[] = [
  {
    tier: 1,
    name: "Newcomer",
    minScore: 0,
    maxScore: 199,
    badge: "Bronze",
    badgeEmoji: "🥉",
    rewards: ["Basic profile page", "Community access"],
    perks: ["View your reputation"],
    color: "amber",
  },
  {
    tier: 2,
    name: "Explorer",
    minScore: 200,
    maxScore: 399,
    badge: "Silver",
    badgeEmoji: "🥈",
    rewards: ["5% partner discounts", "Explorer badge NFT"],
    perks: ["Priority customer support", "Monthly newsletter"],
    color: "slate",
  },
  {
    tier: 3,
    name: "Trusted",
    minScore: 400,
    maxScore: 599,
    badge: "Gold",
    badgeEmoji: "🥇",
    rewards: ["10% partner discounts", "Trusted badge NFT", "DAO voting eligibility"],
    perks: ["Early feature access", "Exclusive Discord channel"],
    color: "yellow",
  },
  {
    tier: 4,
    name: "Diamond",
    minScore: 600,
    maxScore: 799,
    badge: "Diamond",
    badgeEmoji: "💎",
    rewards: ["20% partner discounts", "Diamond badge NFT", "Enhanced DAO voting power"],
    perks: ["Beta tester access", "Direct team communication", "Whitelist priority"],
    color: "cyan",
  },
  {
    tier: 5,
    name: "Elite",
    minScore: 800,
    maxScore: 1000,
    badge: "Elite",
    badgeEmoji: "👑",
    rewards: [
      "30% partner discounts",
      "Exclusive Elite NFT",
      "Twitter/X Affiliate Badge",
      "Maximum DAO voting power",
    ],
    perks: [
      "VIP community access",
      "Partner collaboration opportunities",
      "Revenue sharing eligibility",
      "Governance proposal rights",
    ],
    color: "rose",
  },
];

// Helper function to get tier from score
export function getTierFromScore(score: number): TierInfo {
  for (const tier of REWARD_TIERS) {
    if (score >= tier.minScore && score <= tier.maxScore) {
      return tier;
    }
  }
  return REWARD_TIERS[0]; // Default to Tier 1
}

export interface HealthResponse {
  status: string;
  timestamp: number;
  version: string;
  service: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Check if the API server is healthy
 */
export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error("API server is not responding");
  }
  return response.json();
}

/**
 * Submit a review (Mock)
 */
export async function submitReview(submission: ReviewSubmission): Promise<{ success: boolean; reviewId: string }> {
  console.log("Submitting review:", submission);
  // Mock delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { success: true, reviewId: "mock-id-" + Date.now() };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get color for reputation score
 */
export function getScoreColor(score: number): string {
  if (score >= 800) return "text-emerald-600";
  if (score >= 600) return "text-green-600";
  if (score >= 400) return "text-yellow-600";
  if (score >= 200) return "text-orange-600";
  return "text-red-600";
}

/**
 * Get background color for reputation score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 800) return "bg-emerald-500";
  if (score >= 600) return "bg-green-500";
  if (score >= 400) return "bg-yellow-500";
  if (score >= 200) return "bg-orange-500";
  return "bg-red-500";
}

/**
 * Get label for reputation score range
 */
export function getScoreLabel(score: number): string {
  if (score >= 800) return "Excellent";
  if (score >= 600) return "Good";
  if (score >= 400) return "Fair";
  if (score >= 200) return "Building";
  return "New";
}

/**
 * Format large numbers with K/M suffix
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toFixed(2);
}

export default {
  checkHealth,
  submitReview,
  getScoreColor,
  getScoreBgColor,
  getScoreLabel,
  formatNumber,
};
