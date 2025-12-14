// UI Wallet Service for demo
// Provides mock wallet functionality for UI demonstration

// Define Address type for UI purposes
export type Address = `0x${string}`;

export interface WalletConnection {
  address: Address;
  walletClient: any; // Using any type since we're mocking
}

// Mock wallet addresses for demo
const MOCK_ADDRESSES = [
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
  "0x4bbeEB066eD09B7AEd07bF39EEe0460DFa261520",
  "0x1234567890123456789012345678901234567890",
];

// Check if MetaMask is available (mock)
export function isMetaMaskInstalled(): boolean {
  // For demo purposes, simulate MetaMask is available
  return true;
}

// Connect to mock wallet
export async function connectWallet(): Promise<WalletConnection> {
  // For demo purposes, use a random mock address
  const randomIndex = Math.floor(Math.random() * MOCK_ADDRESSES.length);
  const address = MOCK_ADDRESSES[randomIndex];

  // Create a mock wallet client
  const mockWalletClient = {
    account: address,
    // Add mock writeContract function
    writeContract: async (_args: any) => {
      // Simulate transaction with a fake hash
      return `0x${Math.random().toString(16).substring(2, 66)}`;
    }
  };


  return {
    address: address as Address,
    walletClient: mockWalletClient,
  };
}

// Disconnect wallet
export function disconnectWallet(): void {
}

// Get current connected account
export async function getCurrentAccount(): Promise<Address | null> {
  // In demo mode, return a random address or null
  if (Math.random() > 0.5) {
    const randomIndex = Math.floor(Math.random() * MOCK_ADDRESSES.length);
    return MOCK_ADDRESSES[randomIndex] as Address;
  }
  return null;
}

// Listen for account changes (mock)
export function onAccountsChanged(_callback: (accounts: Address[]) => void): () => void {
  // In mock, we don't listen for actual changes
  return () => {
  };
}

// Listen for chain changes (mock)
export function onChainChanged(_callback: (chainId: string) => void): () => void {
  // In mock, we don't listen for actual changes
  return () => {
  };
}