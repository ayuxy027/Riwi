// Mock contract configuration for UI demo
// This service simulates contract addresses for demonstration purposes

export const CONTRACT_ADDRESSES = {
  REVIEW_TOKEN: "0x0000000000000000000000000000000000000000",
  REPUTATION_SYSTEM: "0x0000000000000000000000000000000000000000",
  REVIEW_STAKING: "0x0000000000000000000000000000000000000000",
  REVIEW_PLATFORM: "0x0000000000000000000000000000000000000000",
  TOKEN_CASHOUT: "0x0000000000000000000000000000000000000000",
} as const;

export const NETWORK_CONFIG = {
  RPC_URL: "https://mock-rpc.example.com",
  CHAIN_ID: 1, // Mainnet ID as mock
} as const;

// Mock function to check if cashout is deployed
export const isCashoutDeployed = (): boolean => {
  // Always return true in mock for demo purposes
  return true;
};