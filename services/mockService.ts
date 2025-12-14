// Mock service for demo/pitching - uses sessionStorage for persistence
import { Address } from 'viem';

export interface MockReview {
  content: string;
  reviewer: Address;
  timestamp: bigint;
  validated: boolean;
  rewardAmount: bigint;
  qualityScore: bigint;
}

export interface MockUserData {
  balance: number;
  reputation: number;
  totalReviews: number;
  stakedAmount: number;
  hasSufficientStake: boolean;
  reviews: MockReview[];
}

const STORAGE_KEY = 'mock_review_platform_data';

// Initialize mock data
function getMockData(): MockUserData {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }

  // Default mock data
  const defaultData: MockUserData = {
    balance: 1250.50,
    reputation: 450,
    totalReviews: 8,
    stakedAmount: 2.5,
    hasSufficientStake: true,
    reviews: [
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
    ],
  };

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));

  return defaultData;
}

function saveMockData(data: MockUserData) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data, (key, value) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  }));
}

function parseMockData(stored: string): MockUserData {
  const parsed = JSON.parse(stored);
  // Convert bigint strings back to bigint
  parsed.reviews = parsed.reviews.map((r: any) => ({
    ...r,
    timestamp: BigInt(r.timestamp),
    rewardAmount: BigInt(r.rewardAmount),
    qualityScore: BigInt(r.qualityScore),
  }));
  return parsed;
}

export const mockService = {
  getUserBalance: async (address: Address): Promise<number> => {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const data = getMockData();
    return data.balance;
  },

  getUserReputation: async (address: Address) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    return {
      reputationScore: data.reputation,
      totalReviews: data.totalReviews,
      reviewHistory: data.reviews.map(r => Number(r.qualityScore)),
    };
  },

  getUserStake: async (address: Address) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const data = getMockData();
    return {
      currentStake: data.stakedAmount,
      hasSufficientStake: data.hasSufficientStake,
      validatorId: 1,
      minStakeAmount: 1.0,
    };
  },

  getUserReviews: async (address: Address): Promise<MockReview[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = parseMockData(stored);
      return data.reviews.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));
    }
    return getMockData().reviews;
  },

  submitReview: async (content: string, address: Address): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate transaction
    
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const data = stored ? parseMockData(stored) : getMockData();
    
    const newReview: MockReview = {
      content,
      reviewer: address,
      timestamp: BigInt(Math.floor(Date.now() / 1000)),
      validated: false,
      rewardAmount: BigInt(0),
      qualityScore: BigInt(0),
    };

    data.reviews.unshift(newReview);
    data.totalReviews = data.reviews.length;
    saveMockData(data);

    return `0x${Math.random().toString(16).substring(2, 66)}`; // Fake tx hash
  },

  validateReview: async (reviewIndex: number, score: number): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const data = parseMockData(stored);
    if (reviewIndex >= data.reviews.length) return;

    const review = data.reviews[reviewIndex];
    
    if (score >= 60) {
      // Auto-validate: calculate reward
      const baseReward = 50;
      const bonusReward = (score - 60) * 3.75;
      const totalReward = baseReward + bonusReward;

      review.validated = true;
      review.qualityScore = BigInt(score);
      review.rewardAmount = BigInt(Math.floor(totalReward * 1e18));
      
      // Update balance and reputation
      data.balance += totalReward;
      if (score >= 70) {
        data.reputation += 1;
      }
    } else {
      // Reject
      review.qualityScore = BigInt(score);
      review.validated = false;
    }

    saveMockData(data);
  },

  stakeTokens: async (amount: string, address: Address): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const data = stored ? parseMockData(stored) : getMockData();
    
    const stakeAmount = parseFloat(amount);
    data.stakedAmount += stakeAmount;
    data.hasSufficientStake = data.stakedAmount >= 1.0;
    
    saveMockData(data);
    
    return `0x${Math.random().toString(16).substring(2, 66)}`;
  },

  resetData: () => {
    sessionStorage.removeItem(STORAGE_KEY);
    getMockData(); // Reinitialize
  },
};

