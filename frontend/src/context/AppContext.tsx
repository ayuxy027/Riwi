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
import { getUserBalance, getUserReputation, getUserStake, getUserReviews, submitReview as submitReviewService, type Review } from "../services/blockchainService";
import type { WalletClient } from "viem";

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

  // Wallet actions
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  refreshUserData: () => Promise<void>;
  submitReview: (content: string) => Promise<string>;

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
  connectWallet: async () => {},
  disconnectWallet: () => {},
  refreshUserData: async () => {},
  submitReview: async () => "",
  currentPage: "home",
  setCurrentPage: () => {},
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

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isMetaMaskInstalled()) {
        try {
          const account = await getCurrentAccount();
          if (account) {
            setUser({
              address: account,
              connected: true,
            });
            // Note: walletClient will be set when user explicitly connects
          }
        } catch (error) {
          console.warn("Could not check existing connection:", error);
        }
      }
    };

    checkConnection();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Set up wallet event listeners
  useEffect(() => {
    if (!user.connected) return;

    const cleanupAccounts = onAccountsChanged((accounts) => {
      if (accounts.length === 0) {
        // User disconnected
        handleDisconnect();
      } else {
        // Account changed
        setUser({
          address: accounts[0],
          connected: true,
        });
      }
    });

    const cleanupChain = onChainChanged(() => {
      // Chain changed, refresh data
      if (user.address) {
        refreshUserData();
      }
    });

    return () => {
      cleanupAccounts();
      cleanupChain();
    };
  }, [user.connected, user.address]);

  // Refresh user data when address changes
  useEffect(() => {
    if (user.connected && user.address) {
      refreshUserData();
    } else {
      setBlockchain(DEFAULT_BLOCKCHAIN_STATE);
    }
  }, [user.address, user.connected]);

  const handleConnect = useCallback(async () => {
    setIsLoading(true);
    setBlockchain(prev => ({ ...prev, error: null, isLoading: true }));

    try {
      const connection = await connectWallet();
      setUser({
        address: connection.address,
        connected: true,
      });
      setWalletClient(connection.walletClient);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to connect wallet";
      setBlockchain(prev => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
      }));
      console.error("Error connecting wallet:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnectWalletService();
    setUser(DEFAULT_USER);
    setBlockchain(DEFAULT_BLOCKCHAIN_STATE);
    setWalletClient(null);
  }, []);

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

  const submitReview = useCallback(async (content: string): Promise<string> => {
    if (!walletClient || !user.address) {
      throw new Error("Wallet must be connected to submit review");
    }

    setBlockchain(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const txHash = await submitReviewService(content, walletClient);
      
      // Refresh user data after submission
      await refreshUserData();
      
      setBlockchain(prev => ({ ...prev, isLoading: false }));
      return txHash;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to submit review";
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
    connectWallet: handleConnect,
    disconnectWallet: handleDisconnect,
    refreshUserData,
    submitReview,
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
