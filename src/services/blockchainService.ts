// UI Service for demo UI
// This service provides mock data for demonstration purposes

// Define Address type for UI purposes
type Address = `0x${string}`;

export interface UserReputation {
  reputationScore: number;
  totalReviews: number;
  reviewHistory: number[];
}

export interface UserStake {
  hasSufficientStake: boolean;
  currentStake: number;
  minStakeAmount: number;
  validatorId?: number;
}

export interface Review {
  content: string;
  reviewer: Address;
  timestamp: bigint;
  validated: boolean;
  rewardAmount: bigint;
  qualityScore: bigint;
}

// Get user's token balance (mock)
export async function getUserBalance(_userAddress: Address, _excludeDeployerMint: boolean = true): Promise<number> {
  try {
    // Return mock balance for demo purposes
    // Parameters not used in mock implementation
    return 1250.50; // Fixed demo value
  } catch (error) {
    return 0;
  }
}

// Get user's reputation data (mock)
export async function getUserReputation(_userAddress: Address): Promise<UserReputation> {
  try {
    return {
      reputationScore: 450,
      totalReviews: 8,
      reviewHistory: [85, 75, 90, 80, 92, 78, 88, 95],
    };
  } catch (error) {
    // Return default values instead of throwing
    return {
      reputationScore: 0,
      totalReviews: 0,
      reviewHistory: [],
    };
  }
}

// Get user's stake status (mock)
export async function getUserStake(_userAddress: Address): Promise<UserStake> {
  try {
    return {
      hasSufficientStake: true,
      currentStake: 2.5,
      minStakeAmount: 1,
      validatorId: 1,
    };
  } catch (error) {
    // Return default values instead of throwing
    return {
      hasSufficientStake: false,
      currentStake: 0,
      minStakeAmount: 1,
    };
  }
}

// Get user's reviews (mock)
export async function getUserReviews(_userAddress: Address): Promise<Review[]> {
  try {
    // Return fixed demo reviews
    return [
      {
        content: "Amazing hotel experience! The service was exceptional and the staff went above and beyond. Highly recommend this place for anyone visiting.",
        reviewer: "0xab1c13383A82a4E0d1A5D56ad0C9691BBCddd617" as Address,
        timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 2), // 2 days ago
        validated: true,
        rewardAmount: BigInt(125000000000000000000), // 125 RVT
        qualityScore: BigInt(85),
      },
      {
        content: "Great restaurant with excellent food quality. The ambiance was perfect and the staff was very attentive. Will definitely come back!",
        reviewer: "0xab1c13383A82a4E0d1A5D56ad0C9691BBCddd617" as Address,
        timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 5), // 5 days ago
        validated: true,
        rewardAmount: BigInt(106250000000000000000), // 106.25 RVT
        qualityScore: BigInt(75),
      },
      {
        content: "Outstanding service and beautiful location. The rooms were clean and comfortable. Perfect for a weekend getaway.",
        reviewer: "0xab1c13383A82a4E0d1A5D56ad0C9691BBCddd617" as Address,
        timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7), // 7 days ago
        validated: true,
        rewardAmount: BigInt(162500000000000000000), // 162.5 RVT
        qualityScore: BigInt(90),
      },
    ];
  } catch (error) {
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

// Stake MON tokens with validator (mock)
export async function stakeTokens(_amount: string, _walletClient: any, _userAddress: Address): Promise<string> {
  try {
    // Simulate transaction with a fake hash
    const fakeTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    return fakeTxHash;
  } catch (error) {
    throw error;
  }
}

// Submit a review (mock)
export async function submitReview(_content: string, _walletClient: any, _userAddress: Address): Promise<string> {
  try {

    // Check stake before submission (mock validation) using a default address
    const stakeData = await getUserStake("0x0000000000000000000000000000000000000000" as Address);

    if (!stakeData.hasSufficientStake) {
      throw new Error(`Insufficient stake. You have ${stakeData.currentStake.toFixed(2)} MON staked, but need at least ${stakeData.minStakeAmount.toFixed(2)} MON to submit reviews.`);
    }

    // Simulate transaction with a fake hash
    const fakeTxHash = `0x${Math.random().toString(16).substring(2, 66)}`;
    return fakeTxHash;
  } catch (error) {
    throw error;
  }
}

// ============ CASHOUT FUNCTIONS (Mock) ============

export interface CashoutInfo {
  exchangeRate: number;       // MON per 1 RVT
  treasuryBalance: number;    // Available MON in treasury
  totalCashedOut: number;     // Total RVT cashed out by all users
  totalMonDistributed: number; // Total MON distributed
  minCashoutAmount: number;   // Minimum RVT for cashout
  maxCashoutAmount: number;   // Maximum RVT per transaction
  maxCashoutAvailable: number; // Max RVT that can be cashed out (based on treasury)
  cashoutEnabled: boolean;    // Whether cashout is enabled
  isDeployed: boolean;        // Whether contract is deployed
}

export interface UserCashoutStats {
  rvtCashedOut: number;  // Total RVT user has cashed out
  monReceived: number;   // Total MON user has received
  rvtBalance: number;    // User's current RVT balance
}

/**
 * Check if cashout contract is deployed and available (mock)
 */
export function checkCashoutDeployed(): boolean {
  // Always return true in mock to enable cashout functionality
  return true;
}

/**
 * Get cashout contract information (mock)
 */
export async function getCashoutInfo(): Promise<CashoutInfo> {
  // Mock implementation with simulated values
  return {
    exchangeRate: 0.01,
    treasuryBalance: 1000,
    totalCashedOut: 50,
    totalMonDistributed: 0.5,
    minCashoutAmount: 1,
    maxCashoutAmount: 10000,
    maxCashoutAvailable: 20000,
    cashoutEnabled: true,
    isDeployed: true,
  };
}

/**
 * Get user's cashout statistics (mock)
 */
export async function getUserCashoutStats(userAddress: Address): Promise<UserCashoutStats> {
  const balance = await getUserBalance(userAddress, false);
  return {
    rvtCashedOut: 0,
    monReceived: 0,
    rvtBalance: balance,
  };
}

/**
 * Calculate MON output for given RVT input (mock)
 */
export async function calculateCashoutAmount(rvtAmount: string): Promise<number> {
  if (!rvtAmount || parseFloat(rvtAmount) <= 0) {
    return 0;
  }

  const exchangeRate = 0.01; // 0.01 MON per 1 RVT
  return parseFloat(rvtAmount) * exchangeRate;
}

/**
 * Approve RVT tokens for cashout contract spending (mock)
 */
export async function approveRvtForCashout(
  _amount: string,
  _walletClient: any,
  _userAddress: Address
): Promise<string> {
  // In mock implementation, just return a fake transaction hash
  return `0x${Math.random().toString(16).substring(2, 66)}`;
}

/**
 * Execute cashout: Exchange RVT for MON (mock)
 */
export async function executeCashout(
  rvtAmount: string,
  _walletClient: any,
  _userAddress: Address
): Promise<string> {
  const amount = parseFloat(rvtAmount);
  if (amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Simulate validation checks
  const cashoutInfo = await getCashoutInfo();

  if (!cashoutInfo.cashoutEnabled) {
    throw new Error('Cashout is currently disabled');
  }

  if (amount < cashoutInfo.minCashoutAmount) {
    throw new Error(`Minimum cashout is ${cashoutInfo.minCashoutAmount} RVT`);
  }

  if (amount > cashoutInfo.maxCashoutAmount) {
    throw new Error(`Maximum cashout is ${cashoutInfo.maxCashoutAmount} RVT per transaction`);
  }

  if (amount > cashoutInfo.maxCashoutAvailable) {
    throw new Error(`Insufficient treasury. Maximum available: ${cashoutInfo.maxCashoutAvailable.toFixed(2)} RVT`);
  }

  // Check user's RVT balance
  const userStats = await getUserCashoutStats("0x0000000000000000000000000000000000000000" as Address);
  if (amount > userStats.rvtBalance) {
    throw new Error(`Insufficient RVT balance. You have ${userStats.rvtBalance.toFixed(2)} RVT`);
  }

  // Execute mock cashout
  return `0x${Math.random().toString(16).substring(2, 66)}`;
}

/**
 * Full cashout flow: Approve + Cashout in one function (mock)
 */
export async function cashoutRvtToMon(
  rvtAmount: string,
  walletClient: any,
  userAddress: Address,
  onApprovalComplete?: () => void
): Promise<string> {

  // Step 1: Approve (mock)
  await approveRvtForCashout(rvtAmount, walletClient, userAddress);

  if (onApprovalComplete) {
    onApprovalComplete();
  }

  // Small delay between transactions
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2: Cashout (mock)
  const txHash = await executeCashout(rvtAmount, walletClient, userAddress);

  return txHash;
}