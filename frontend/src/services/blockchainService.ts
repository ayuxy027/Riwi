import { formatEther, parseEther, type Address, type WalletClient } from 'viem';
import { publicClient, reviewTokenContract, reputationSystemContract, reviewStakingContract, reviewPlatformContract } from './contractService';
import { DEPLOYER_ADDRESS } from "../config/constants";

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

// Get user's token balance (excluding initial deployer mint for display)
export async function getUserBalance(userAddress: Address, excludeDeployerMint: boolean = true): Promise<number> {
  try {
    const balance = await publicClient.readContract({
      ...reviewTokenContract,
      functionName: 'balanceOf',
      args: [userAddress],
    });
    
    const balanceNumber = parseFloat(formatEther(balance));
    
    // If this is the deployer and we want to exclude initial mint, return 0 for earned display
    // The deployer's 1M tokens are for distribution, not "earned"
    if (excludeDeployerMint && userAddress.toLowerCase() === DEPLOYER_ADDRESS.toLowerCase()) {
      // For deployer, show 0 as "earned" - the 1M is for distribution, not personal earnings
      return 0;
    }
    
    return balanceNumber;
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
    // Call all three functions in parallel
    const [canReview, stakeAmount, minStake] = await Promise.all([
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'canUserReview',
        args: [userAddress],
      }).catch(err => {
        console.warn('Error calling canUserReview:', err);
        return false;
      }),
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getUserStake',
        args: [userAddress],
      }).catch(err => {
        console.warn('Error calling getUserStake:', err);
        return 0n;
      }),
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getMinStakeAmount',
        args: [],
      }).catch(err => {
        console.warn('Error calling getMinStakeAmount:', err);
        return 1000000000000000000n; // Default 1 MON
      }),
    ]);

    const stakeAmountNum = parseFloat(formatEther(stakeAmount as bigint));
    const minStakeNum = parseFloat(formatEther(minStake as bigint));
    const hasSufficient = (canReview as boolean) || stakeAmountNum >= minStakeNum;

    console.log('Stake data fetched:', {
      address: userAddress,
      stakeAmount: stakeAmountNum,
      minStake: minStakeNum,
      hasSufficient,
      canReview: canReview as boolean,
    });

    return {
      hasSufficientStake: hasSufficient,
      currentStake: stakeAmountNum,
      minStakeAmount: minStakeNum,
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

// Stake MON tokens with validator (required to submit reviews)
export async function stakeTokens(amount: string, walletClient: WalletClient, userAddress: Address): Promise<string> {
  try {
    // Note: When using custom(window.ethereum), walletClient.account may not be set,
    // but viem will use the connected account from the provider automatically.
    // We pass userAddress explicitly for validation and clarity.
    if (!userAddress) {
      throw new Error('User address not available');
    }

    // Get validator ID from ReviewStaking contract
    const validatorId = await publicClient.readContract({
      ...reviewStakingContract,
      functionName: 'getValidatorId',
      args: [],
    }) as bigint;

    // Monad staking precompile address
    const STAKING_PRECOMPILE = '0x0000000000000000000000000000000000001000' as Address;
    
    // ABI for delegate function
    const stakingABI = [
      {
        name: 'delegate',
        type: 'function',
        stateMutability: 'payable',
        inputs: [{ name: 'validatorId', type: 'uint64' }],
        outputs: [{ name: 'success', type: 'bool' }],
      },
    ] as const;

    // Convert amount to wei
    const amountWei = parseEther(amount);

    // Call delegate function with MON tokens
    // When using custom(window.ethereum), viem automatically uses the connected account
    // from the provider, so we don't need to pass account explicitly
    const hash = await walletClient.writeContract({
      address: STAKING_PRECOMPILE,
      abi: stakingABI,
      functionName: 'delegate',
      args: [Number(validatorId)],
      value: amountWei,
    });

    // Wait for transaction receipt
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    return receipt.transactionHash;
  } catch (error) {
    console.error('Error staking tokens:', error);
    throw error;
  }
}

// Submit a review (requires wallet connection)
export async function submitReview(content: string, walletClient: WalletClient, userAddress: Address): Promise<string> {
  try {
    // Validate user address
    if (!userAddress) {
      throw new Error('User address not available');
    }

    const canReview = await publicClient.readContract({
      ...reviewStakingContract,
      functionName: 'canUserReview',
      args: [userAddress],
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

