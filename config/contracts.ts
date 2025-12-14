// Configuration for the UI Demo
export const MOCK_CONFIG = {
  APP_NAME: "Monad Review System",
  VERSION: "1.0.0",
  API_BASE_URL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
} as const;