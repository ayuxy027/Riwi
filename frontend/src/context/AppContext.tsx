import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

// ============================================
// Types & Interfaces (Simplified - No Web3)
// ============================================

export interface UserProfile {
  name: string;
  address: string;
  connected: boolean;
}

interface AppContextType {
  // User state (demo mode by default)
  user: UserProfile;
  isDemoMode: boolean;
  isLoading: boolean;
  
  // Demo mode controls
  enableDemoMode: () => void;
  disableDemoMode: () => void;
  
  // Navigation helpers
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const DEMO_USER: UserProfile = {
  name: "Demo User",
  address: "0xDemo...1234",
  connected: true,
};

const DEFAULT_USER: UserProfile = {
  name: "",
  address: "",
  connected: false,
};

export const AppContext = createContext<AppContextType>({
  user: DEFAULT_USER,
  isDemoMode: true,
  isLoading: false,
  enableDemoMode: () => {},
  disableDemoMode: () => {},
  currentPage: "home",
  setCurrentPage: () => {},
});

// ============================================
// App Provider Component
// ============================================

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState("home");
  const [user, setUser] = useState<UserProfile>(DEMO_USER);

  const enableDemoMode = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setUser(DEMO_USER);
      setIsDemoMode(true);
      setIsLoading(false);
    }, 300);
  }, []);

  const disableDemoMode = useCallback(() => {
    setUser(DEFAULT_USER);
    setIsDemoMode(false);
  }, []);

  const value: AppContextType = {
    user,
    isDemoMode,
    isLoading,
    enableDemoMode,
    disableDemoMode,
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
  address: string,
  startChars = 6,
  endChars = 4
): string => {
  if (!address) return "";
  if (address.length <= startChars + endChars) return address;
  return address.slice(0, startChars) + "..." + address.slice(-endChars);
};
