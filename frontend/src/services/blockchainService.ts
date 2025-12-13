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
// NOTE: The contract reads 'stake' (index 0) but Monad's precompile stores active stake in 'deltaStake' (index 3)
// We need to read directly from the precompile to get accurate stake amounts
export async function getUserStake(userAddress: Address): Promise<UserStake> {
  try {
    // Get validator ID and min stake from contract
    const [validatorId, minStake] = await Promise.all([
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getValidatorId',
        args: [],
      }).catch(() => 1n), // Default to 1
      publicClient.readContract({
        ...reviewStakingContract,
        functionName: 'getMinStakeAmount',
        args: [],
      }).catch(() => 1000000000000000000n), // Default 1 MON
    ]);

    // Read directly from staking precompile to get accurate stake
    const STAKING_PRECOMPILE = '0x0000000000000000000000000000000000001000' as Address;
    const stakingABI = [
      {
        name: 'getDelegator',
        type: 'function',
        stateMutability: 'nonpayable',
        inputs: [
          { name: 'validatorId', type: 'uint64' },
          { name: 'delegator', type: 'address' }
        ],
        outputs: [
          { name: 'stake', type: 'uint256' },
          { name: 'accRewardPerToken', type: 'uint256' },
          { name: 'unclaimedRewards', type: 'uint256' },
          { name: 'deltaStake', type: 'uint256' }, // This is the active stake!
          { name: 'nextDeltaStake', type: 'uint256' },
          { name: 'deltaEpoch', type: 'uint64' },
          { name: 'nextDeltaEpoch', type: 'uint64' }
        ],
      },
    ] as const;

    // Call precompile directly to get accurate stake data
    const delegatorData = await publicClient.readContract({
      address: STAKING_PRECOMPILE,
      abi: stakingABI,
      functionName: 'getDelegator',
      args: [Number(validatorId), userAddress],
    }) as [bigint, bigint, bigint, bigint, bigint, bigint, bigint];

    // Extract stake amounts - use deltaStake (index 3) as it's the active stake
    const stakeAmount = delegatorData[0]; // stake (may be 0)
    const deltaStake = delegatorData[3]; // deltaStake (active stake)
    
    // Use deltaStake if stake is 0, otherwise use stake
    const activeStake = deltaStake > 0n ? deltaStake : stakeAmount;
    
    const stakeAmountNum = parseFloat(formatEther(activeStake));
    const minStakeNum = parseFloat(formatEther(minStake as bigint));
    const hasSufficient = stakeAmountNum >= minStakeNum;

    console.log('Stake data fetched from precompile:', {
      address: userAddress,
      stake: parseFloat(formatEther(stakeAmount)),
      deltaStake: parseFloat(formatEther(deltaStake)),
      activeStake: stakeAmountNum,
      minStake: minStakeNum,
      hasSufficient,
      validatorId: Number(validatorId),
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

    // Check stake directly from precompile (same logic as getUserStake)
    // The contract's canUserReview reads wrong field, so we check ourselves
    const stakeData = await getUserStake(userAddress);
    
    if (!stakeData.hasSufficientStake) {
      throw new Error(`Insufficient stake. You have ${stakeData.currentStake.toFixed(2)} MON staked, but need at least ${stakeData.minStakeAmount.toFixed(2)} MON to submit reviews.`);
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

