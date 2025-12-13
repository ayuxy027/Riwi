import { createWalletClient, custom, type Address, type WalletClient } from 'viem';
import { NETWORK_CONFIG } from '../config/contracts';

// Custom chain for Monad Testnet
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
  },
  testnet: true,
} as const;

export interface WalletConnection {
  address: Address;
  walletClient: WalletClient;
}

// Check if MetaMask is installed
export function isMetaMaskInstalled(): boolean {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false;
  }
  
  // Check if it's specifically MetaMask (not other wallets)
  return window.ethereum.isMetaMask === true;
}

// Connect to MetaMask wallet
export async function connectWallet(): Promise<WalletConnection> {
  if (typeof window === 'undefined') {
    throw new Error('This application requires a browser environment.');
  }

  if (!window.ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask extension to continue.');
  }

  if (!isMetaMaskInstalled()) {
    // Check if another wallet is installed
    if (window.ethereum.isCoinbaseWallet) {
      throw new Error('Coinbase Wallet detected. Please use MetaMask for this application. You can install MetaMask from https://metamask.io');
    }
    throw new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io to continue.');
  }

  try {
    // Request account access with timeout protection
    const accounts = await Promise.race([
      window.ethereum.request({
        method: 'eth_requestAccounts',
      }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 10000)
      )
    ]) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please unlock your wallet.');
    }

    const address = accounts[0] as Address;

    // Check if we need to switch networks
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const targetChainId = `0x${NETWORK_CONFIG.CHAIN_ID.toString(16)}`;

    if (chainId !== targetChainId) {
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError: unknown) {
        // If the chain doesn't exist, add it
        if (switchError && typeof switchError === 'object' && 'code' in switchError && switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: targetChainId,
                chainName: 'Monad Testnet',
                nativeCurrency: {
                  name: 'Monad',
                  symbol: 'MON',
                  decimals: 18,
                },
                rpcUrls: [NETWORK_CONFIG.RPC_URL],
                blockExplorerUrls: ['https://testnet-explorer.monad.xyz'],
              },
            ],
          });
        } else {
          throw switchError;
        }
      }
    }

    // Create wallet client
    const walletClient = createWalletClient({
      chain: monadTestnet,
      transport: custom(window.ethereum),
    });

    return {
      address,
      walletClient,
    };
  } catch (error: unknown) {
    console.error('Error connecting wallet:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
    throw new Error(errorMessage);
  }
}

// Disconnect wallet
export function disconnectWallet(): void {
  // For MetaMask, we just clear local state
  // MetaMask doesn't have a disconnect method
}

// Get current connected account
export async function getCurrentAccount(): Promise<Address | null> {
  if (!isMetaMaskInstalled()) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (accounts && accounts.length > 0) {
      return accounts[0] as Address;
    }

    return null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
}

// Listen for account changes
export function onAccountsChanged(callback: (accounts: Address[]) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  const handler = (accounts: string[]) => {
    callback(accounts as Address[]);
  };

  window.ethereum.on('accountsChanged', handler);

  // Return cleanup function
  return () => {
    if (window.ethereum && window.ethereum.removeListener) {
      try {
        window.ethereum.removeListener('accountsChanged', handler);
      } catch (error) {
        console.warn('Error removing accountsChanged listener:', error);
      }
    }
  };
}

// Listen for chain changes
export function onChainChanged(callback: (chainId: string) => void): () => void {
  if (!isMetaMaskInstalled() || !window.ethereum) {
    return () => {};
  }

  const handler = (chainId: string) => {
    callback(chainId);
  };

  window.ethereum.on('chainChanged', handler);

  // Return cleanup function
  return () => {
    if (window.ethereum && window.ethereum.removeListener) {
      try {
        window.ethereum.removeListener('chainChanged', handler);
      } catch (error) {
        console.warn('Error removing chainChanged listener:', error);
      }
    }
  };
}

// Extend Window interface for TypeScript
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
  chainId?: string;
  isMetaMask?: boolean;
  isCoinbaseWallet?: boolean;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

