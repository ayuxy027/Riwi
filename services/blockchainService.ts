// Mock blockchain service for demo UI
// This service simulates blockchain interactions for demonstration purposes
import { type Address } from 'viem';
import { mockService } from './mockService';

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
export async function getUserBalance(userAddress: Address, excludeDeployerMint: boolean = true): Promise<number> {
  try {
    // Use mock service to get balance
    const balance = await mockService.getUserBalance(userAddress);
    console.log('Mock balance retrieved:', balance);
    return balance;
  } catch (error) {
    console.error('Error getting user balance:', error);
    return 0;
  }
}

// Get user's reputation data (mock)
export async function getUserReputation(userAddress: Address): Promise<UserReputation> {
  try {
    const reputation = await mockService.getUserReputation(userAddress);
    console.log('Mock reputation retrieved:', reputation);
    return reputation;
  } catch (error) {
    console.error('Error getting user reputation:', error);
    // Return default values instead of throwing
    return {
      reputationScore: 0,
      totalReviews: 0,
      reviewHistory: [],
    };
  }
}

// Get user's stake status (mock)
export async function getUserStake(userAddress: Address): Promise<UserStake> {
  try {
    const stake = await mockService.getUserStake(userAddress);
    console.log('Mock stake data retrieved:', stake);
    return {
      hasSufficientStake: stake.hasSufficientStake,
      currentStake: stake.currentStake,
      minStakeAmount: stake.minStakeAmount,
      validatorId: stake.validatorId,
    };
  } catch (error) {
    console.error('Error getting user stake:', error);
    // Return default values instead of throwing
    return {
      hasSufficientStake: false,
      currentStake: 0,
      minStakeAmount: 1,
    };
  }
}

// Get user's reviews (mock)
export async function getUserReviews(userAddress: Address): Promise<Review[]> {
  try {
    console.log('Fetching mock reviews for user:', userAddress);
    const reviews = await mockService.getUserReviews(userAddress);
    console.log('Mock reviews retrieved:', reviews);
    return reviews;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    // Return empty array instead of throwing to prevent breaking the UI
    return [];
  }
}

// Stake MON tokens with validator (mock)
export async function stakeTokens(amount: string, walletClient: any, userAddress: Address): Promise<string> {
  try {
    console.log('Staking tokens (mock):', { amount, userAddress });
    const txHash = await mockService.stakeTokens(amount, userAddress);
    console.log('Mock stake transaction completed:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error staking tokens:', error);
    throw error;
  }
}

// Submit a review (mock)
export async function submitReview(content: string, walletClient: any, userAddress: Address): Promise<string> {
  try {
    console.log('Submitting review (mock):', { content: content.substring(0, 50) + '...', userAddress });
    
    // Check stake before submission (mock validation)
    const stakeData = await getUserStake(userAddress);
    
    if (!stakeData.hasSufficientStake) {
      throw new Error(`Insufficient stake. You have ${stakeData.currentStake.toFixed(2)} MON staked, but need at least ${stakeData.minStakeAmount.toFixed(2)} MON to submit reviews.`);
    }
    
    const txHash = await mockService.submitReview(content, userAddress);
    console.log('Mock review submission completed:', txHash);
    return txHash;
  } catch (error) {
    console.error('Error submitting review:', error);
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
  amount: string,
  walletClient: any,
  userAddress: Address
): Promise<string> {
  console.log('Approving RVT for cashout (mock):', { amount, userAddress });
  // In mock implementation, just return a fake transaction hash
  return `0x${Math.random().toString(16).substring(2, 66)}`;
}

/**
 * Execute cashout: Exchange RVT for MON (mock)
 */
export async function executeCashout(
  rvtAmount: string,
  walletClient: any,
  userAddress: Address
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
  const userStats = await getUserCashoutStats(userAddress);
  if (amount > userStats.rvtBalance) {
    throw new Error(`Insufficient RVT balance. You have ${userStats.rvtBalance.toFixed(2)} RVT`);
  }

  // Execute mock cashout
  console.log(`Mock cashout executed: ${rvtAmount} RVT for ${await calculateCashoutAmount(rvtAmount)} MON`);
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
  console.log('Starting mock cashout flow for', rvtAmount, 'RVT');

  // Step 1: Approve (mock)
  console.log('Step 1: Approving RVT (mock)...');
  await approveRvtForCashout(rvtAmount, walletClient, userAddress);

  if (onApprovalComplete) {
    onApprovalComplete();
  }

  // Small delay between transactions
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Step 2: Cashout (mock)
  console.log('Step 2: Executing cashout (mock)...');
  const txHash = await executeCashout(rvtAmount, walletClient, userAddress);

  return txHash;
}