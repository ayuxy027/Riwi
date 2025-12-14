import { createPublicClient, http, type Address, type PublicClient } from 'viem';
import { CONTRACT_ADDRESSES, NETWORK_CONFIG } from '../config/contracts';
import ReviewTokenABI from '../abis/ReviewToken.json';
import ReputationSystemABI from '../abis/ReputationSystem.json';
import ReviewStakingABI from '../abis/ReviewStaking.json';
import ReviewPlatformABI from '../abis/ReviewPlatform.json';
import TokenCashoutABI from '../abis/TokenCashout.json';

// Create a custom chain configuration for Monad Testnet
const monadTestnet = {
  id: NETWORK_CONFIG.CHAIN_ID,
  name: 'Monad Testnet',
  network: 'monad-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Monad',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: [NETWORK_CONFIG.RPC_URL],
    },
    public: {
      http: [NETWORK_CONFIG.RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: 'Monad Explorer',
      url: 'https://testnet-explorer.monad.xyz',
    },
  },
  testnet: true,
} as const;

// Public client for read operations
export const publicClient: PublicClient = createPublicClient({
  chain: monadTestnet,
  transport: http(NETWORK_CONFIG.RPC_URL),
});

// Contract configurations
export const reviewTokenContract = {
  address: CONTRACT_ADDRESSES.REVIEW_TOKEN as Address,
  abi: ReviewTokenABI,
};

export const reputationSystemContract = {
  address: CONTRACT_ADDRESSES.REPUTATION_SYSTEM as Address,
  abi: ReputationSystemABI,
};

export const reviewStakingContract = {
  address: CONTRACT_ADDRESSES.REVIEW_STAKING as Address,
  abi: ReviewStakingABI,
};

export const reviewPlatformContract = {
  address: CONTRACT_ADDRESSES.REVIEW_PLATFORM as Address,
  abi: ReviewPlatformABI,
};

// TokenCashout contract for RVT to MON exchange
// Note: Address will be empty until contract is deployed
export const tokenCashoutContract = {
  address: CONTRACT_ADDRESSES.TOKEN_CASHOUT as Address,
  abi: TokenCashoutABI,
};

// Check if cashout contract is deployed
export const isCashoutDeployed = (): boolean => {
  return CONTRACT_ADDRESSES.TOKEN_CASHOUT !== "" &&
    CONTRACT_ADDRESSES.TOKEN_CASHOUT !== undefined;
};
