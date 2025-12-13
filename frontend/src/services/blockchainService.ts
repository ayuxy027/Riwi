import { formatEther, parseEther, type Address, type WalletClient } from 'viem';
import { publicClient, reviewTokenContract, reputationSystemContract, reviewStakingContract, reviewPlatformContract } from './contractService';

export interface UserReputation {
  reputationScore: number;
  totalReviews: number;
  reviewHistory: number[];
}

export interface UserStake {
  hasSufficientStake: boolean;
  currentStake: number;
  minStakeAmount: number;
}

export interface Review {
  content: string;
  reviewer: Address;
  timestamp: bigint;
  validated: boolean;
  rewardAmount: bigint;
  qualityScore: bigint;
}

// Get user's token balance
export async function getUserBalance(userAddress: Address): Promise<number> {
  try {
    const balance = await publicClient.readContract({
      ...reviewTokenContract,
      functionName: 'balanceOf',
      args: [userAddress],
    });
    return parseFloat(formatEther(balance));
  } catch (error) {
    console.error('Error getting user balance:', error);
    throw error;
  }
}

// Get user's reputation data
export async function getUserReputation(userAddress: Address): Promise<UserReputation> {
  try {
    const [reputationScore, totalReviews, reviewHistory] = await Promise.all([
      publicClient.readContract({
        ...reputationSystemContract,
        functionName: 'getReputation',
        args: [userAddress],
      }),
      publicClient.readContract({
        ...reputationSystemContract,
        functionName: 'getTotalReviews',
        args: [userAddress],
      }),
      publicClient.readContract({
        ...reputationSystemContract,
        functionName: 'getReviewHistory',
        args: [userAddress],
      }),
    ]);

    return {
      reputationScore: Number(reputationScore),
      totalReviews: Number(totalReviews),
      reviewHistory: (reviewHistory as bigint[]).map(h => Number(h)),
    };
  } catch (error) {
    console.error('Error getting user reputation:', error);
    throw error;
  }
}

// Get user's stake status
export async function getUserStake(userAddress: Address): Promise<UserStake> {
  try {
    const [canReview, stakeAmount, minStake] = await Promise.all([
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'canUserReview',
        args: [userAddress],
      }),
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getUserStake',
        args: [userAddress],
      }),
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getMinStakeAmount',
        args: [],
      }),
    ]);

    return {
      hasSufficientStake: canReview as boolean,
      currentStake: parseFloat(formatEther(stakeAmount as bigint)),
      minStakeAmount: parseFloat(formatEther(minStake as bigint)),
    };
  } catch (error) {
    console.error('Error getting user stake:', error);
    throw error;
  }
}

// Get user's reviews
export async function getUserReviews(userAddress: Address): Promise<Review[]> {
  try {
    const reviewIds = await publicClient.readContract({
      ...reviewPlatformContract,
      functionName: 'getReviewsByUser',
      args: [userAddress],
    });

    if (!reviewIds || (reviewIds as unknown[]).length === 0) {
      return [];
    }

    const reviews = await Promise.all(
      (reviewIds as `0x${string}`[]).map(async (reviewId) => {
        const review = await publicClient.readContract({
          ...reviewPlatformContract,
          functionName: 'getReview',
          args: [reviewId],
        });
        return review as Review;
      })
    );

    return reviews;
  } catch (error) {
    console.error('Error getting user reviews:', error);
    throw error;
  }
}

// Submit a review (requires wallet connection)
export async function submitReview(content: string, walletClient: WalletClient): Promise<string> {
  try {
    // First check if user can review
    if (!walletClient.account?.address) {
      throw new Error('Wallet account not available');
    }

    const canReview = await publicClient.readContract({
      ...reviewStakingContract,
      functionName: 'canUserReview',
      args: [walletClient.account.address],
    });

    if (!canReview) {
      throw new Error('Insufficient stake. You need to stake tokens to submit reviews.');
    }

    // Submit review transaction
    const hash = await walletClient.writeContract({
      ...reviewPlatformContract,
      functionName: 'submitReview',
      args: [content],
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
}

