// Mock wallet service for demo UI
// This service simulates wallet interactions for demonstration purposes
import { type Address } from 'viem';

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

let connectedAddress: Address | null = null;

// Check if MetaMask is installed (mock)
export function isMetaMaskInstalled(): boolean {
  // In demo mode, we'll simulate MetaMask is available
  return true;
}

// Connect to mock wallet
export async function connectWallet(): Promise<WalletConnection> {
  // For demo purposes, use a random mock address
  const randomIndex = Math.floor(Math.random() * MOCK_ADDRESSES.length);
  const address = MOCK_ADDRESSES[randomIndex] as Address;
  connectedAddress = address;

  // Create a mock wallet client
  const mockWalletClient = {
    account: address,
    // Add mock writeContract function
    writeContract: async (args: any) => {
      console.log("Mock transaction:", args);
      // Simulate transaction with a fake hash
      return `0x${Math.random().toString(16).substring(2, 66)}`;
    }
  };

  console.log('Mock wallet connected:', address);

  return {
    address,
    walletClient: mockWalletClient,
  };
}

// Disconnect wallet
export function disconnectWallet(): void {
  connectedAddress = null;
  console.log('Mock wallet disconnected');
}

// Get current connected account
export async function getCurrentAccount(): Promise<Address | null> {
  return connectedAddress;
}

// Listen for account changes (mock)
export function onAccountsChanged(callback: (accounts: Address[]) => void): () => void {
  // In mock, we don't listen for actual changes
  console.log('Mock account change listener registered');
  return () => {
    console.log('Mock account change listener removed');
  };
}

// Listen for chain changes (mock)
export function onChainChanged(callback: (chainId: string) => void): () => void {
  // In mock, we don't listen for actual changes
  console.log('Mock chain change listener registered');
  return () => {
    console.log('Mock chain change listener removed');
  };
}