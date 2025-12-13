import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { type Address } from "viem";
import { connectWallet, disconnectWallet as disconnectWalletService, getCurrentAccount, onAccountsChanged, onChainChanged, isMetaMaskInstalled } from "../services/walletService";
import { getUserBalance, getUserReputation, getUserStake, getUserReviews, submitReview as submitReviewService, stakeTokens as stakeTokensService, type Review } from "../services/blockchainService";
import type { WalletClient } from "viem";
import type { TransactionStatus } from "../components/TransactionToast";
import { NETWORK_CONFIG } from "../config/contracts";

// ============================================
// Types & Interfaces
// ============================================

export interface UserProfile {
  address: Address | null;
  connected: boolean;
}

export interface BlockchainState {
  balance: number | null;
  reputation: number | null;
  totalReviews: number | null;
  stakedAmount: number | null;
  hasSufficientStake: boolean | null;
  reviews: Review[];
  isLoading: boolean;
  error: string | null;
}

interface AppContextType {
  // User state
  user: UserProfile;
  blockchain: BlockchainState;
  isLoading: boolean;
  walletClient: WalletClient | null;
  transaction: TransactionStatus | null;

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUserData: () => Promise<void>;
  submitReview: (content: string) => Promise<string>;
  stakeTokens: (amount: string) => Promise<string>;
  clearTransaction: () => void;

  // Navigation helpers
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const DEFAULT_USER: UserProfile = {
  address: null,
  connected: false,
};

const DEFAULT_BLOCKCHAIN_STATE: BlockchainState = {
  balance: null,
  reputation: null,
  totalReviews: null,
  stakedAmount: null,
  hasSufficientStake: null,
  reviews: [],
  isLoading: false,
  error: null,
};

export const AppContext = createContext<AppContextType>({
  user: DEFAULT_USER,
  blockchain: DEFAULT_BLOCKCHAIN_STATE,
  isLoading: false,
  walletClient: null,
  transaction: null,
  connectWallet: async () => { },
  disconnectWallet: () => { },
  refreshUserData: async () => { },
  submitReview: async () => "",
  stakeTokens: async () => "",
  clearTransaction: () => { },
  currentPage: "home",
  setCurrentPage: () => { },
});

// ============================================
// App Provider Component
// ============================================

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [blockchain, setBlockchain] = useState<BlockchainState>(DEFAULT_BLOCKCHAIN_STATE);
  const [walletClient, setWalletClient] = useState<WalletClient | null>(null);
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);

  // Auto-connect wallet on app load if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      // Only auto-connect if not manually disconnected
      const wasDisconnected = sessionStorage.getItem('wallet_disconnected') === 'true';
      if (wasDisconnected) return;

      try {
        const currentAccount = await getCurrentAccount();
        if (currentAccount && isMetaMaskInstalled()) {
          // Try to connect
          const connection = await connectWallet();
          setUser({
            address: connection.address,
            connected: true,
          });
          setWalletClient(connection.walletClient);
        }
      } catch (error) {
        console.warn("Auto-connect failed:", error);
        // Clear disconnected flag if auto-connect fails
        sessionStorage.removeItem('wallet_disconnected');
      }
    };

    autoConnect();
  }, []);

  // Set up wallet event listeners
  useEffect(() => {
    if (!user.connected) return;

    const cleanupAccounts = onAccountsChanged(async (accounts) => {
      // Check if user manually disconnected - don't auto-reconnect
      const wasDisconnected = sessionStorage.getItem('wallet_disconnected') === 'true';

      if (accounts.length === 0) {
        // User disconnected in MetaMask
        if (!wasDisconnected) {
          // Only auto-disconnect if it wasn't a manual disconnect
          handleDisconnect();
        }
      } else {
        // Account changed - only reconnect if not manually disconnected
        if (!wasDisconnected) {
          try {
            const connection = await connectWallet();
            setUser({
              address: connection.address,
              connected: true,
            });
            setWalletClient(connection.walletClient);
          } catch (error) {
            console.error("Error reconnecting after account change:", error);
            // Still update address even if reconnect fails
            setUser({
              address: accounts[0],
              connected: true,
            });
          }
        }
      }
    });

    const cleanupChain = onChainChanged(() => {
      // Chain changed, refresh data and reconnect to ensure wallet client is updated
      if (user.address) {
        connectWallet().then(connection => {
          setWalletClient(connection.walletClient);
          refreshUserData();
        }).catch(error => {
          console.error("Error reconnecting after chain change:", error);
          refreshUserData();
        });
      }
    });

    return () => {
      cleanupAccounts();
      cleanupChain();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.connected, user.address]);

  // Define refreshUserData BEFORE it's used in other callbacks/effects
  const refreshUserData = useCallback(async () => {
    if (!user.address) return;

    setBlockchain(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const [balance, reputation, stake] = await Promise.allSettled([
        getUserBalance(user.address),
        getUserReputation(user.address),
        getUserStake(user.address),
      ]);

      const newBalance = balance.status === "fulfilled" ? balance.value : null;
      const newReputation = reputation.status === "fulfilled" ? reputation.value.reputationScore : null;
      const newTotalReviews = reputation.status === "fulfilled" ? reputation.value.totalReviews : null;
      const newStakedAmount = stake.status === "fulfilled" ? stake.value.currentStake : null;
      const newHasSufficientStake = stake.status === "fulfilled" ? stake.value.hasSufficientStake : null;

      // Try to get reviews, but don't fail if it errors
      let reviews: Review[] = [];
      try {
        reviews = await getUserReviews(user.address);
      } catch (error) {
        console.warn("Could not fetch reviews:", error);
      }

      setBlockchain({
        balance: newBalance,
        reputation: newReputation,
        totalReviews: newTotalReviews,
        stakedAmount: newStakedAmount,
        hasSufficientStake: newHasSufficientStake,
        reviews,
        isLoading: false,
        error: null,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load user data";
      setBlockchain(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  }, [user.address]);

  // Refresh user data when address changes or connection status changes
  useEffect(() => {
    if (user.connected && user.address) {
      refreshUserData();
    } else {
      setBlockchain(DEFAULT_BLOCKCHAIN_STATE);
    }
  }, [user.address, user.connected, refreshUserData]);

  const handleConnect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    setBlockchain(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      const connection = await connectWallet();
      // Clear the disconnected flag when user manually connects
      sessionStorage.removeItem('wallet_disconnected');

      // Update user state
      const newUser = {
        address: connection.address,
        connected: true,
      };
      setUser(newUser);
      setWalletClient(connection.walletClient);

      // Immediately refresh user data after connection
      // This ensures both navbar and dashboard get the updated data
      if (newUser.address) {
        // Use a small delay to ensure state is updated
        setTimeout(() => {
          refreshUserData();
        }, 100);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setBlockchain(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      console.error("Error connecting wallet:", error);
      // Re-throw to allow UI to handle it
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, refreshUserData]);

  const handleDisconnect = useCallback(() => {
    try {
      // Mark as manually disconnected to prevent auto-reconnect
      sessionStorage.setItem('wallet_disconnected', 'true');

      // Clear all state
      disconnectWalletService();
      setUser(DEFAULT_USER);
      setBlockchain(DEFAULT_BLOCKCHAIN_STATE);
      setWalletClient(null);
      setTransaction(null);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      // Still clear state even if there's an error
      sessionStorage.setItem('wallet_disconnected', 'true');
      setUser(DEFAULT_USER);
      setBlockchain(DEFAULT_BLOCKCHAIN_STATE);
      setWalletClient(null);
      setTransaction(null);
    }
  }, []);

  const stakeTokens = useCallback(async (amount: string): Promise<string> => {
    // Prevent multiple simultaneous staking attempts
    if (isLoading || blockchain.isLoading) {
      throw new Error("A transaction is already in progress. Please wait.");
    }

    if (!user.address) {
      throw new Error("Wallet must be connected to stake tokens");
    }

    // Ensure walletClient is available, reconnect if needed
    let currentWalletClient = walletClient;
    if (!currentWalletClient) {
      try {
        const connection = await connectWallet();
        currentWalletClient = connection.walletClient;
        setWalletClient(currentWalletClient);
      } catch (error) {
        throw new Error("Failed to connect wallet. Please try connecting again.");
      }
    }

    // Set loading state IMMEDIATELY to prevent multiple clicks
    setIsLoading(true);
    setBlockchain(prev => ({ ...prev, isLoading: true, error: null }));
    setTransaction({
      status: "pending",
      message: "Staking MON tokens...",
    });

    try {
      const txHash = await stakeTokensService(amount, currentWalletClient, user.address);
      
      setTransaction({
        status: "success",
        message: "Tokens staked successfully!",
        txHash,
      });
      
      // Wait for transaction to be confirmed on blockchain
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Force refresh user data after staking - with retries
      let refreshAttempts = 0;
      const maxAttempts = 5;
      
      while (refreshAttempts < maxAttempts) {
        try {
          await refreshUserData();
          
          // Check if stake was updated by directly calling the service
          const updatedStake = await getUserStake(user.address);
          console.log('Stake after refresh attempt', refreshAttempts + 1, ':', updatedStake);
          
          // Update blockchain state directly with new stake data to force UI update
          setBlockchain(prev => ({
            ...prev,
            stakedAmount: updatedStake.currentStake,
            hasSufficientStake: updatedStake.hasSufficientStake,
            isLoading: false,
          }));
          
          // If we got valid stake data, break
          if (updatedStake.currentStake > 0 || refreshAttempts >= 2) {
            break;
          }
        } catch (error) {
          console.warn('Refresh attempt failed:', error);
        }
        
        refreshAttempts++;
        // Wait between retries
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Final refresh to ensure UI is updated
      await refreshUserData();
      
      setBlockchain(prev => ({ ...prev, isLoading: false }));
      setIsLoading(false);
      return txHash;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to stake tokens";
      setTransaction({
        status: "error",
        message: errorMessage,
      });
      setBlockchain(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      setIsLoading(false);
      throw error;
    }
  }, [walletClient, user.address, refreshUserData, isLoading, blockchain.isLoading]);

  const submitReview = useCallback(async (content: string): Promise<string> => {
    if (!user.address) {
      throw new Error("Wallet must be connected to submit review");
    }

    // Ensure walletClient is available, reconnect if needed
    let currentWalletClient = walletClient;
    if (!currentWalletClient) {
      try {
        const connection = await connectWallet();
        currentWalletClient = connection.walletClient;
        setWalletClient(currentWalletClient);
      } catch (error) {
        throw new Error("Failed to connect wallet. Please try connecting again.");
      }
    }

    setBlockchain(prev => ({ ...prev, isLoading: true, error: null }));
    setTransaction({
      status: "pending",
      message: "Submitting review to blockchain...",
    });

    try {
      const txHash = await submitReviewService(content, currentWalletClient, user.address);

      setTransaction({
        status: "success",
        message: "Review submitted successfully!",
        txHash,
      });

      // Refresh user data after submission
      await refreshUserData();

      setBlockchain(prev => ({ ...prev, isLoading: false }));
      return txHash;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit review";
      setTransaction({
        status: "error",
        message: errorMessage,
      });
      setBlockchain(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      throw error;
    }
  }, [walletClient, user.address, refreshUserData]);

  const value: AppContextType = {
    user,
    blockchain,
    isLoading,
    walletClient,
    transaction,
    connectWallet: handleConnect,
    disconnectWallet: handleDisconnect,
    refreshUserData,
    submitReview,
    stakeTokens,
    clearTransaction: () => setTransaction(null),
    currentPage,
    setCurrentPage,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

// ============================================
// Custom Hook
// ============================================

export const useApp = () => useContext(AppContext);

// ============================================
// Utility: Truncate Address for Display
// ============================================

export const truncateAddress = (
  address: string | null | undefined,
  startChars = 6,
  endChars = 4
): string => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return address.slice(0, startChars) + "..." + address.slice(-endChars);
};
