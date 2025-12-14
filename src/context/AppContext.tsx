import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { connectWallet, disconnectWallet as disconnectWalletService, getCurrentAccount, onAccountsChanged, onChainChanged, isMetaMaskInstalled } from "../services/walletService";
import type { Review } from "../services/blockchainService";
import { getUserStake, getUserReviews, getUserBalance, getUserReputation, submitReview as submitReviewService, stakeTokens as stakeTokensService } from "../services/blockchainService";
import type { TransactionStatus } from "../components/TransactionToast";

// Define Address type for UI purposes
type Address = `0x${string}`;

// Define WalletClient type for UI purposes
interface WalletClient {
  account?: Address;
  writeContract?: (args: any) => Promise<any>;
}

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
            address: connection.address as Address,
            connected: true,
          });
          setWalletClient(connection.walletClient);
        }
      } catch (_error) {
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
              address: connection.address as Address,
              connected: true,
            });
            setWalletClient(connection.walletClient);
          } catch (_error) {
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
        }).catch(_error => {
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
      // Use UI service functions
      const [balance, reputation, stake] = await Promise.allSettled([
        getUserBalance(user.address),
        getUserReputation(user.address),
        getUserStake(user.address),
      ]);

      const newBalance = balance.status === "fulfilled" ? balance.value : null;
      const newReputation = reputation.status === "fulfilled" ? reputation.value.reputationScore : null;
      const newStakedAmount = stake.status === "fulfilled" ? stake.value.currentStake : null;
      const newHasSufficientStake = stake.status === "fulfilled" ? stake.value.hasSufficientStake : null;

      // Get reviews from UI service
      let reviews: Review[] = [];
      try {
        reviews = await getUserReviews(user.address);
      } catch (_error) {
        reviews = [];
      }

      // Use actual review count from reviews array, not from ReputationSystem
      // ReputationSystem only tracks VALIDATED reviews, but we want ALL reviews
      const actualReviewCount = reviews.length;

      setBlockchain({
        balance: newBalance,
        reputation: newReputation,
        totalReviews: actualReviewCount, // Use actual review count from ReviewPlatform
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
        address: connection.address as Address,
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
    } catch (_error) {
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
      } catch (_error) {
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
      await new Promise(resolve => setTimeout(resolve, 5000)); // Increased to 5 seconds
      
      // Force refresh user data after staking - with retries
      let refreshAttempts = 0;
      const maxAttempts = 8; // Increased attempts
      let previousStake = blockchain.stakedAmount || 0;
      
      while (refreshAttempts < maxAttempts) {
        try {
          
          // Directly fetch stake data first (bypasses cache)
          const updatedStake = await getUserStake(user.address);

          // Update blockchain state immediately with new stake data
          setBlockchain(prev => ({
            ...prev,
            stakedAmount: updatedStake.currentStake,
            hasSufficientStake: updatedStake.hasSufficientStake,
          }));
          
          // If stake increased or we've tried enough times, break
          if (updatedStake.currentStake > previousStake || refreshAttempts >= 3) {
            break;
          }
          
          // Also do full refresh
          await refreshUserData();
          
        } catch (_error) {
        }
        
        refreshAttempts++;
        // Wait between retries (increased wait time)
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Final refresh to ensure everything is synced
      await refreshUserData();
      
      // One more direct stake check
      const finalStake = await getUserStake(user.address);
      setBlockchain(prev => ({
        ...prev,
        stakedAmount: finalStake.currentStake,
        hasSufficientStake: finalStake.hasSufficientStake,
      }));
      
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
      } catch (_error) {
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

      // Wait for blockchain confirmation before refreshing
      await new Promise(resolve => setTimeout(resolve, 6000)); // Increased wait time

      // Refresh user data after submission with retries
      let refreshAttempts = 0;
      const maxAttempts = 12; // Increased retry attempts
      let previousReviewCount = blockchain.reviews?.length || 0;
      
      while (refreshAttempts < maxAttempts) {
        try {
          
          // Fetch reviews directly first (bypasses cache)
          const updatedReviews = await getUserReviews(user.address);
          
          // If we got new reviews, update state immediately
          if (updatedReviews.length > previousReviewCount) {
            setBlockchain(prev => ({
              ...prev,
              reviews: updatedReviews,
              totalReviews: updatedReviews.length,
            }));
            // Still do full refresh to get balance, reputation, etc.
            await refreshUserData();
            break;
          }
          
          // Also do full refresh
          await refreshUserData();
          
          // Check again after refresh
          const reviewsAfterRefresh = await getUserReviews(user.address);
          
          if (reviewsAfterRefresh.length > previousReviewCount || refreshAttempts >= 6) {
            setBlockchain(prev => ({
              ...prev,
              reviews: reviewsAfterRefresh,
              totalReviews: reviewsAfterRefresh.length,
            }));
            break;
          }
        } catch (_error) {
        }
        refreshAttempts++;
        await new Promise(resolve => setTimeout(resolve, 4000)); // Wait 4 seconds between retries
      }

      // Final refresh to ensure everything is synced
      await refreshUserData();
      
      // One more direct check
      const finalReviews = await getUserReviews(user.address);
      setBlockchain(prev => ({
        ...prev,
        reviews: finalReviews,
        totalReviews: finalReviews.length,
      }));

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
